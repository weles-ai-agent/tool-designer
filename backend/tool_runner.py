"""
Tool execution engine for the WELES Tool Designer.
Replicates the InstalledHttpTool.execute() logic from the main WELES app
so that test runs behave identically to production.
"""

import json
import logging
import re
from string import Template

import httpx

logger = logging.getLogger(__name__)

# Regex that matches {{NAME}} placeholders
_TEMPLATE_RE = re.compile(r"\{\{([A-Z][A-Z0-9_]*)\}\}")


def _resolve_secrets(config: dict, secrets: dict) -> dict:
    """
    Deep-copy config and replace every {{NAME}} placeholder with the
    value from the secrets dict. Unresolved placeholders are left as-is
    (they will surface as errors at execution time).
    """
    import copy

    def _walk(obj):
        if isinstance(obj, dict):
            return {k: _walk(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_walk(v) for v in obj]
        if isinstance(obj, str):
            return _TEMPLATE_RE.sub(
                lambda m: secrets.get(m.group(1), m.group(0)), obj
            )
        return obj

    return _walk(copy.deepcopy(config))


async def run_tool_test(package: dict, inputs: dict, secrets: dict) -> dict:
    """
    Execute an HTTP tool with the given inputs and secrets.

    Args:
        package: Full tool package JSON (matching ToolInstallRequest format)
        inputs: Key-value pairs matching the input_schema properties
        secrets: Pasted secret values (e.g. {"API_KEY": "sk-xxx"})

    Returns:
        The tool's response data (JSON or raw text).
    """
    tool_type = package.get("type", "http")

    if tool_type != "http":
        raise ValueError(f"Unsupported tool type for testing: {tool_type}")

    # Resolve {{SECRET}} placeholders in config
    raw_config = package.get("config", {}) or {}
    cfg = _resolve_secrets(raw_config, secrets)

    url = cfg.get("url", "")
    if not url:
        raise ValueError("URL is required for HTTP tool testing")

    method = (cfg.get("method", "GET") or "GET").upper()
    headers = cfg.get("headers", {}) or {}
    body_template = cfg.get("body_template")
    timeout_secs = int(cfg.get("timeout", 60) or 60)
    timeout = httpx.Timeout(timeout_secs, connect=10.0)

    # Check for unresolved secrets
    if isinstance(url, str) and "{{" in url:
        raise RuntimeError(
            f"Unresolved secret placeholder in URL — provide a value in the secrets section"
        )

    input_schema = package.get("input_schema", {})
    schema_props = input_schema.get("properties", {})
    remaining = dict(inputs)
    params = {}

    # Substitute {param_name} path placeholders in URL
    if isinstance(url, str) and "{" in url:
        base_url, _, url_query = url.partition("?")
        extra_params = {}
        for key, val in list(remaining.items()):
            placeholder = "{" + key + "}"
            if placeholder in base_url:
                base_url = base_url.replace(placeholder, str(val))
                remaining.pop(key, None)
            elif placeholder in url_query:
                extra_params[key] = str(val)
                remaining.pop(key, None)
        # Remove empty key= clauses
        url_query = "&".join(
            part for part in url_query.split("&")
            if "{" not in part and "=" in part and not part.endswith("=")
        )
        url = base_url + ("?" + url_query if url_query else "")
        params.update(extra_params)

    json_body = remaining.pop("body", None) if not body_template else None

    # Build body from template if provided
    if body_template:
        try:
            json_body = json.loads(Template(body_template).safe_substitute(inputs))
        except Exception as e:
            raise RuntimeError(f"Failed to build request body from template: {e}")

    # For GET/HEAD: pass remaining kwargs as query params
    if method in ("GET", "HEAD"):
        for k, v in remaining.items():
            if k in schema_props:
                params[k] = v
        json_body = None
    elif not json_body:
        # Merge static_body (fixed fields) + agent inputs (variable fields)
        static_body_raw = cfg.get("static_body", {}) or {}
        # Auto-parse JSON values: "true" becomes boolean, "123" becomes number
        static_body = {}
        for k, v in (static_body_raw or {}).items():
            if isinstance(v, str):
                try:
                    static_body[k] = json.loads(v)
                except (json.JSONDecodeError, ValueError):
                    static_body[k] = v
            else:
                static_body[k] = v
        collected = {k: v for k, v in remaining.items() if k in schema_props}
        merged = {**static_body, **collected}
        if not merged:
            json_body = None
        else:
            json_body = merged

    # Detect content type: if headers set application/json → send JSON
    # Otherwise default to form-urlencoded for POST/PUT (most APIs expect this)
    has_json_ct = any(
        'application/json' in str(v).lower()
        for v in headers.values()
    )
    has_form_ct = any(
        'multipart/form-data' in str(v).lower() or 'application/x-www-form-urlencoded' in str(v).lower()
        for v in headers.values()
    )
    is_form_data = has_form_ct or (not has_json_ct and method in ('POST', 'PUT', 'PATCH'))
    logger.info(
        "Tool test: method=%s has_json=%s has_form=%s is_form=%s",
        method, has_json_ct, has_form_ct, is_form_data,
    )

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if is_form_data and isinstance(json_body, dict):
                resp = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    data=json_body,
                )
            elif isinstance(json_body, str):
                resp = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    content=json_body.encode("utf-8"),
                )
            else:
                resp = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=json_body,
                )
        # Always return full response — even on HTTP errors (4xx, 5xx)
        try:
            body = resp.json()
        except Exception:
            body = resp.text
        return {
            "status_code": resp.status_code,
            "headers": {k: "***" if "auth" in k.lower() else v for k, v in resp.headers.items()},
            "body": body,
        }
    except httpx.RequestError as e:
        raise RuntimeError(
            f"Request failed: {e.__class__.__name__} — {e}"
        )
    except Exception as e:
        raise RuntimeError(f"Tool '{package.get('slug', 'unknown')}' failed: {e}")
