"""
WELES Tool Designer — Backend API.
Serves the built React frontend and provides endpoints for:
- Tool CRUD (JSON file storage)
- Tool testing (HTTP proxy execution)
- Tool definitions catalogue
"""

import json
import os
import uuid
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from tool_runner import run_tool_test

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="WELES Tool Designer", version="1.0.0")

# ──────────────────────── Tool Definitions ────────────────────────

TOOL_DEFINITIONS = [
    {
        "tool_type": "http_request",
        "name": "HTTP Request",
        "description": "Generic HTTP request. You can lock the URL/Method and define a data schema for the agent.",
        "config_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "Fixed URL (optional — the agent cannot change it when set)"},
                "method": {
                    "type": "string",
                    "description": "Fixed HTTP method (optional)",
                    "enum": ["", "GET", "POST", "PUT", "DELETE"]
                },
                "headers": {
                    "type": "object",
                    "description": "Fixed JSON headers, e.g. {'Authorization': 'Bearer ...'}",
                    "default": {}
                },
                "param_schema": {
                    "type": "object",
                    "description": "JSON parameter schema (OpenAI style) that the agent must fill in",
                    "default": {}
                },
                "query_mapping": {
                    "type": "object",
                    "description": "Mapping of agent args to query string params, e.g. {'q': 'q'}",
                    "default": {}
                },
                "static_query": {
                    "type": "object",
                    "description": "Static query string params appended to URL, e.g. {'userId': 'abc'}",
                    "default": {}
                },
                "static_body": {
                    "type": "object",
                    "description": "Fixed Body fields (JSON) always sent, e.g. {'language': 'en'}",
                    "default": {}
                },
                "timeout": {"type": "integer", "default": 15}
            }
        }
    }
]

# ──────────────────────── JSON File Store ────────────────────────

STORE_PATH = Path(os.getenv("TOOLS_STORE_PATH", "tools_store.json"))


def _load_store() -> list[dict]:
    if STORE_PATH.exists():
        try:
            return json.loads(STORE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, Exception):
            return []
    return []


def _save_store(data: list[dict]) -> None:
    STORE_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ──────────────────────── Pydantic Models ────────────────────────

class ToolPackage(BaseModel):
    name: str
    slug: str
    version: str = "1.0.0"
    description: str = ""
    icon: str = ""
    category: str = ""
    type: str = "http"
    secrets_required: list[str] = []
    config: dict = {}
    input_schema: dict = {}
    auto_discover: bool = False


class ToolTestRequest(BaseModel):
    package: dict  # full tool package JSON
    inputs: dict = {}  # key-value inputs from input_schema
    secrets: dict = {}  # pasted secret values for testing (not saved)


# ──────────────────────── API Routes ────────────────────────

@app.get("/api/tool-definitions")
def get_tool_definitions():
    """Return the catalogue of available tool types for the UI."""
    return TOOL_DEFINITIONS


@app.get("/api/tools")
def list_tools():
    """List all saved tools."""
    store = _load_store()
    result = []
    for t in store:
        result.append({
            "id": t.get("id", ""),
            "name": t.get("name", ""),
            "slug": t.get("slug", ""),
            "type": t.get("type", "http"),
            "icon": t.get("icon", ""),
            "category": t.get("category", ""),
            "created_at": t.get("created_at", ""),
            "updated_at": t.get("updated_at", ""),
        })
    return result


@app.get("/api/tools/{tool_id}")
def get_tool(tool_id: str):
    """Get a single saved tool by ID."""
    store = _load_store()
    for t in store:
        if t.get("id") == tool_id:
            return t
    raise HTTPException(404, "Tool not found")


@app.post("/api/tools", status_code=201)
def create_tool(pkg: ToolPackage):
    """Save a new tool."""
    store = _load_store()
    now = datetime.now(timezone.utc).isoformat()
    tool_data = pkg.model_dump()
    tool_data["id"] = str(uuid.uuid4())
    tool_data["created_at"] = now
    tool_data["updated_at"] = now
    store.append(tool_data)
    _save_store(store)
    logger.info("Tool created: %s (%s)", tool_data["slug"], tool_data["id"])
    return tool_data


@app.put("/api/tools/{tool_id}")
def update_tool(tool_id: str, pkg: ToolPackage):
    """Update an existing tool."""
    store = _load_store()
    for i, t in enumerate(store):
        if t.get("id") == tool_id:
            now = datetime.now(timezone.utc).isoformat()
            updated = pkg.model_dump()
            updated["id"] = tool_id
            updated["created_at"] = t.get("created_at", now)
            updated["updated_at"] = now
            store[i] = updated
            _save_store(store)
            logger.info("Tool updated: %s (%s)", updated["slug"], tool_id)
            return updated
    raise HTTPException(404, "Tool not found")


@app.delete("/api/tools/{tool_id}", status_code=204)
def delete_tool(tool_id: str):
    """Delete a saved tool."""
    store = _load_store()
    new_store = [t for t in store if t.get("id") != tool_id]
    if len(new_store) == len(store):
        raise HTTPException(404, "Tool not found")
    _save_store(new_store)
    logger.info("Tool deleted: %s", tool_id)


@app.post("/api/test-tool")
async def test_tool(req: ToolTestRequest):
    """Execute a tool with provided inputs and secrets, return the result."""
    start = time.time()
    try:
        result = await run_tool_test(req.package, req.inputs, req.secrets)
        elapsed = round(time.time() - start, 3)
        return {
            "success": True,
            "elapsed_seconds": elapsed,
            "data": result,
        }
    except Exception as e:
        elapsed = round(time.time() - start, 3)
        logger.exception("Tool test failed")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "elapsed_seconds": elapsed,
                "error": str(e),
            },
        )


# ──────────────────────── Static File Serving ────────────────────────

FRONTEND_DIR = Path(__file__).resolve().parent / "frontend" / "dist"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA — fallback to index.html for client-side routing."""
        file_path = FRONTEND_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "WELES Tool Designer API — frontend not built yet. Run: cd frontend && npm run build"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
