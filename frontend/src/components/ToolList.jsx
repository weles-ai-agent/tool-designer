import React from "react";
import {
  Plus,
  RefreshCw,
  Edit3,
  Copy,
  Trash2,
  Globe,
  Clock,
} from "lucide-react";

export default function ToolList({
  tools,
  onCreate,
  onEdit,
  onDuplicate,
  onDelete,
  onRefresh,
}) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold tracking-tight mb-2">No tools yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Create your first HTTP tool — define the endpoint, input parameters,
          and secrets. The generated JSON can be imported directly into WELES.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-md"
        >
          <Plus className="h-4 w-4" />
          Create Your First Tool
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">My Tools</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {tools.length} tool{tools.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Tool
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-accent/30 transition-all group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{tool.name}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  {tool.slug}
                </code>
                <span className="capitalize">{tool.type}</span>
                {tool.created_at && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(tool.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => onEdit(tool.id)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-all"
                title="Edit"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDuplicate(tool.id)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-all"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this tool? This cannot be undone.")) {
                    onDelete(tool.id);
                  }
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
