import React, { useState } from "react";
import {
  Play,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

function JsonDisplay({ data }) {
  const str = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <div className="json-preview mt-2">
      <pre>{str}</pre>
    </div>
  );
}

export default function ToolTester({
  tool,
  packageJson,
  secretsForTest,
  onSecretsChange,
  showToast,
}) {
  const [inputs, setInputs] = useState({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const inputSchema = tool?.input_schema || { type: "object", properties: {} };
  const properties = inputSchema.properties || {};
  const paramKeys = Object.keys(properties);

  const handleInputChange = (key, value) => {
    const prop = properties[key] || {};
    let parsed = value;
    if (prop.type === "integer" || prop.type === "number") {
      parsed = value === "" ? "" : Number(value);
    } else if (prop.type === "boolean") {
      parsed = value === "true";
    }
    setInputs({ ...inputs, [key]: parsed });
  };

  const handleSecretsTestChange = (key, value) => {
    onSecretsChange({ ...secretsForTest, [key]: value });
  };

  const runTest = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      // Clean inputs — remove empty values, convert types
      const cleanInputs = {};
      for (const [k, v] of Object.entries(inputs)) {
        if (v !== "" && v !== undefined && v !== null) {
          cleanInputs[k] = v;
        }
      }

      const res = await fetch("/api/test-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: packageJson,
          inputs: cleanInputs,
          secrets: secretsForTest,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || data.detail || "Unknown error");
      }
    } catch (err) {
      setError(err.message || "Network error — is the backend running?");
    } finally {
      setRunning(false);
    }
  };

  const isHttpError = result && result.data && result.data.status_code >= 400;
  const isHttpSuccess = result && result.data && result.data.status_code < 400;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Test Tool</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Run the tool with sample inputs to verify it works as expected.
        </p>
      </div>

      {/* Tool Info */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">
            {packageJson.slug || "unnamed"}
          </code>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">
            {packageJson.config?.method || "GET"}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {packageJson.config?.url || "No URL configured"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {packageJson.description || "No description"}
        </p>
      </div>

      {/* Inputs */}
      {paramKeys.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Input Parameters</h3>
          {paramKeys.map((key) => {
            const prop = properties[key];
            const isRequired = (inputSchema.required || []).includes(key);
            return (
              <div key={key}>
                <label className="text-sm font-medium">
                  {key}{" "}
                  {isRequired && <span className="text-destructive">*</span>}
                </label>
                {prop.description && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {prop.description}
                  </p>
                )}
                {prop.type === "boolean" ? (
                  <select
                    value={inputs[key] !== undefined ? String(inputs[key]) : ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Select --</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : prop.type === "object" || prop.type === "array" ? (
                  <textarea
                    value={inputs[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={`{...} or [...]`}
                    rows={3}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={inputs[key] !== undefined ? String(inputs[key]) : ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={
                      prop.default !== undefined
                        ? `Default: ${prop.default}`
                        : `Enter ${prop.type || "value"}...`
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Secrets for Testing */}
      {(tool?.secrets_required || []).length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Secrets for Testing</h3>
          <p className="text-xs text-muted-foreground">
            Provide actual values for the required secrets. These are NOT saved.
          </p>
          {tool.secrets_required.map((name) => (
            <div key={name}>
              <label className="text-sm font-medium">{name}</label>
              <input
                type="password"
                value={secretsForTest[name] || ""}
                onChange={(e) => handleSecretsTestChange(name, e.target.value)}
                placeholder={`Value for ${name}...`}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={runTest}
        disabled={running}
        className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50"
      >
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {running ? "Running..." : "Run Test"}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg border p-4 space-y-2 ${
            isHttpError
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-green-500/30 bg-green-500/5"
          }`}
        >
          <div className="flex items-center gap-2">
            {isHttpError ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <h3
              className={`font-semibold text-sm ${
                isHttpError
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              HTTP {result.data?.status_code}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />
              {result.elapsed_seconds}s
            </span>
          </div>
          {/* Response Headers */}
          {result.data?.headers &&
            Object.keys(result.data.headers).length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-all">
                  Response Headers ({Object.keys(result.data.headers).length})
                </summary>
                <div className="json-preview mt-1 max-h-32">
                  <pre>{JSON.stringify(result.data.headers, null, 2)}</pre>
                </div>
              </details>
            )}
          <JsonDisplay data={result.data?.body} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-sm text-destructive">Error</h3>
          </div>
          <p className="text-sm text-destructive/80 break-all">{error}</p>
        </div>
      )}
    </div>
  );
}
