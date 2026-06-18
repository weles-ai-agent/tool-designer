import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

export default function JsonPreview({ packageJson, showToast }) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(packageJson, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      showToast("JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${packageJson.slug || "tool"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Package JSON</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-accent transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>
      <div className="json-preview">
        <pre>{jsonString}</pre>
      </div>
    </div>
  );
}
