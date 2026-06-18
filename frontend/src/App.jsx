import React, { useState, useEffect, useCallback } from "react";
import { Wrench, List, Play, Sun, Moon, Copy, Check } from "lucide-react";
import ToolList from "./components/ToolList";
import ToolDesigner from "./components/ToolDesigner";
import ToolTester from "./components/ToolTester";
import Toast from "./components/Toast";

const TABS = [
  { id: "list", label: "My Tools", icon: List },
  { id: "designer", label: "Designer", icon: Wrench },
  { id: "tester", label: "Test", icon: Play },
];

const INITIAL_TOOL = {
  name: "",
  slug: "",
  version: "1.0.0",
  description: "",
  icon: "",
  category: "",
  type: "http",
  secrets_required: [],
  config: {
    url: "",
    method: "",
    headers: {},
    param_schema: {},
    query_mapping: {},
    static_query: {},
    static_body: {},
    timeout: 60,
  },
  input_schema: {
    type: "object",
    properties: {},
    required: [],
  },
  auto_discover: false,
};

export default function App() {
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("list");
  const [tools, setTools] = useState([]);
  const [currentTool, setCurrentTool] = useState(INITIAL_TOOL);
  const [editingId, setEditingId] = useState(null);
  const [secretsForTest, setSecretsForTest] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const fetchTools = useCallback(async () => {
    try {
      const res = await fetch("/api/tools");
      if (res.ok) {
        const data = await res.json();
        setTools(data);
      }
    } catch (err) {
      console.error("Failed to fetch tools:", err);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleCreate = () => {
    setCurrentTool({
      ...INITIAL_TOOL,
      config: { ...INITIAL_TOOL.config, headers: {} },
      input_schema: { type: "object", properties: {}, required: [] },
    });
    setEditingId(null);
    setActiveTab("designer");
  };

  const handleEdit = async (toolId) => {
    try {
      const res = await fetch(`/api/tools/${toolId}`);
      if (res.ok) {
        const tool = await res.json();
        // Ensure nested objects exist
        tool.config = {
          url: "",
          method: "",
          headers: {},
          param_schema: {},
          query_mapping: {},
          static_query: {},
          static_body: {},
          timeout: 60,
          ...(tool.config || {}),
        };
        tool.input_schema = {
          type: "object",
          properties: {},
          required: [],
          ...(tool.input_schema || {}),
        };
        setCurrentTool(tool);
        setEditingId(toolId);
        setActiveTab("designer");
      }
    } catch (err) {
      console.error("Failed to fetch tool:", err);
    }
  };

  const handleDuplicate = async (toolId) => {
    try {
      const res = await fetch(`/api/tools/${toolId}`);
      if (res.ok) {
        const tool = await res.json();
        const dup = {
          ...tool,
          name: tool.name + " (Copy)",
          slug: tool.slug + "_copy",
        };
        delete dup.id;
        delete dup.created_at;
        delete dup.updated_at;
        setCurrentTool({
          ...INITIAL_TOOL,
          ...dup,
          config: {
            url: "",
            method: "",
            headers: {},
            param_schema: {},
            query_mapping: {},
            static_query: {},
            static_body: {},
            timeout: 60,
            ...(dup.config || {}),
          },
          input_schema: {
            type: "object",
            properties: {},
            required: [],
            ...(dup.input_schema || {}),
          },
        });
        setEditingId(null);
        setActiveTab("designer");
      }
    } catch (err) {
      console.error("Failed to duplicate tool:", err);
    }
  };

  const handleDelete = async (toolId) => {
    try {
      const res = await fetch(`/api/tools/${toolId}`, { method: "DELETE" });
      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== toolId));
        showToast("Tool deleted");
      }
    } catch (err) {
      console.error("Failed to delete tool:", err);
      showToast("Failed to delete tool", "error");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const pkg = buildPackage(currentTool);
      let res;
      if (editingId) {
        res = await fetch(`/api/tools/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pkg),
        });
      } else {
        res = await fetch("/api/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pkg),
        });
      }
      if (res.ok) {
        const saved = await res.json();
        setEditingId(saved.id);
        setCurrentTool((prev) => ({ ...prev, id: saved.id }));
        showToast(editingId ? "Tool updated" : "Tool saved");
        fetchTools();
      } else {
        const err = await res.json();
        showToast(err.detail || "Save failed", "error");
      }
    } catch (err) {
      console.error("Failed to save tool:", err);
      showToast("Failed to save tool", "error");
    } finally {
      setLoading(false);
    }
  };

  const buildPackage = (tool) => ({
    name: tool.name,
    slug: tool.slug,
    version: tool.version,
    description: tool.description,
    icon: tool.icon,
    category: tool.category,
    type: tool.type,
    secrets_required: tool.secrets_required,
    config: tool.config,
    input_schema: tool.input_schema,
    auto_discover: tool.auto_discover,
  });

  const packageJson = buildPackage(currentTool);

  const handleTestTool = () => {
    setActiveTab("tester");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo.svg"
                className="h-7 w-7 object-contain"
                alt="Weles"
              />
              <h1 className="text-lg font-bold tracking-tight">
                Weles{" "}
                <span className="text-muted-foreground font-normal">
                  Tool Designer
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 mr-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-primary hover:bg-accent"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-all"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        {activeTab === "list" && (
          <ToolList
            tools={tools}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onRefresh={fetchTools}
          />
        )}
        {activeTab === "designer" && (
          <ToolDesigner
            tool={currentTool}
            onChange={setCurrentTool}
            onSave={handleSave}
            onTest={handleTestTool}
            packageJson={packageJson}
            loading={loading}
            editingId={editingId}
            secretsForTest={secretsForTest}
            onSecretsChange={setSecretsForTest}
            showToast={showToast}
          />
        )}
        {activeTab === "tester" && (
          <ToolTester
            tool={currentTool}
            packageJson={packageJson}
            secretsForTest={secretsForTest}
            onSecretsChange={setSecretsForTest}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
