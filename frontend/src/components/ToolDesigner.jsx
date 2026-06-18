import React, { useState } from "react";
import {
  Save,
  Play,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Smile,
  X,
} from "lucide-react";
import JsonPreview from "./JsonPreview";

const INPUT_TYPES = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
];

// ─── Emoji Picker Data ───

const COMMON_EMOJIS = [
  { emoji: "😀", label: "Grinning" },
  { emoji: "😎", label: "Cool" },
  { emoji: "🤖", label: "Robot" },
  { emoji: "🧠", label: "Brain" },
  { emoji: "👤", label: "User" },
  { emoji: "👥", label: "Users" },
  { emoji: "🔧", label: "Wrench" },
  { emoji: "⚙️", label: "Gear" },
  { emoji: "🔗", label: "Link" },
  { emoji: "🔍", label: "Search" },
  { emoji: "📡", label: "Antenna" },
  { emoji: "🔑", label: "Key" },
  { emoji: "🛡️", label: "Shield" },
  { emoji: "🧲", label: "Magnet" },
  { emoji: "💾", label: "Disk" },
  { emoji: "🌐", label: "Globe" },
  { emoji: "📧", label: "Email" },
  { emoji: "💬", label: "Chat" },
  { emoji: "📨", label: "Send" },
  { emoji: "📥", label: "Inbox" },
  { emoji: "📤", label: "Outbox" },
  { emoji: "🔔", label: "Bell" },
  { emoji: "📢", label: "Announce" },
  { emoji: "📋", label: "Clipboard" },
  { emoji: "🗄️", label: "Database" },
  { emoji: "📊", label: "Chart" },
  { emoji: "📈", label: "Trending" },
  { emoji: "💡", label: "Idea" },
  { emoji: "🧩", label: "Puzzle" },
  { emoji: "🎯", label: "Target" },
  { emoji: "⚡", label: "Lightning" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💎", label: "Gem" },
  { emoji: "📄", label: "Document" },
  { emoji: "📁", label: "Folder" },
  { emoji: "📝", label: "Note" },
  { emoji: "📎", label: "Clip" },
  { emoji: "✂️", label: "Scissors" },
  { emoji: "📌", label: "Pin" },
  { emoji: "🔄", label: "Sync" },
  { emoji: "⬆️", label: "Upload" },
  { emoji: "⬇️", label: "Download" },
  { emoji: "✅", label: "Check" },
  { emoji: "❌", label: "Cross" },
  { emoji: "⚠️", label: "Warning" },
  { emoji: "⏱️", label: "Timer" },
  { emoji: "🕐", label: "Clock" },
  { emoji: "📅", label: "Calendar" },
  { emoji: "🏠", label: "Home" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "🌟", label: "Star" },
  { emoji: "💻", label: "Laptop" },
  { emoji: "🖥️", label: "Desktop" },
  { emoji: "📱", label: "Mobile" },
  { emoji: "☁️", label: "Cloud" },
  { emoji: "🔒", label: "Lock" },
  { emoji: "🔓", label: "Unlock" },
];

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="absolute z-50 mt-1 w-72 rounded-lg border border-border bg-popover shadow-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Pick an icon
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {COMMON_EMOJIS.map(({ emoji, label }) => (
          <button
            key={label}
            onClick={() => onSelect(emoji)}
            title={label}
            className="w-7 h-7 flex items-center justify-center rounded-md text-base hover:bg-accent transition-all cursor-pointer leading-none"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Key-Value Editor for objects like headers ───

function KeyValueEditor({
  value = {},
  onChange,
  keyLabel = "Key",
  valueLabel = "Value",
  keyPlaceholder = "Header-Name",
  valuePlaceholder = "Header-Value",
}) {
  const entries = Object.entries(value || {});

  const handleChange = (index, field, newVal) => {
    const newEntries = [...entries];
    if (field === "key") {
      const oldKey = newEntries[index][0];
      newEntries[index] = [newVal, newEntries[index][1]];
    } else {
      newEntries[index] = [newEntries[index][0], newVal];
    }
    const obj = {};
    for (const [k, v] of newEntries) {
      if (k.trim()) obj[k.trim()] = v;
    }
    onChange(obj);
  };

  const addEntry = () => {
    onChange({ ...(value || {}), "": "" });
  };

  const removeEntry = (index) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    const obj = {};
    for (const [k, v] of newEntries) {
      if (k.trim()) obj[k.trim()] = v;
    }
    onChange(obj);
  };

  return (
    <div className="space-y-2">
      {entries.map(([k, v], i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={k}
            onChange={(e) => handleChange(i, "key", e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={v}
            onChange={(e) => handleChange(i, "value", e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => removeEntry(i)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-all"
      >
        <Plus className="h-3 w-3" />
        Add {keyLabel.toLowerCase()}
      </button>
    </div>
  );
}

// ─── Tag Input for secrets_required ───

const SECRET_NAME_RE = /^[A-Z][A-Z0-9_]*$/;

function TagInput({
  value = [],
  onChange,
  placeholder = "Type and press Enter...",
  validateSecret = false,
}) {
  const [input, setInput] = useState("");

  const isValid =
    !validateSecret || !input.trim() || SECRET_NAME_RE.test(input.trim());

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!SECRET_NAME_RE.test(input.trim())) {
        return; // silently reject invalid secret names
      }
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => {
          const tagValid = SECRET_NAME_RE.test(tag);
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                tagValid
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
              title={
                tagValid
                  ? tag
                  : `${tag} — must be UPPERCASE with underscores only (e.g. API_KEY)`
              }
            >
              {!tagValid && "⚠️ "}
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-destructive transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
          !isValid ? "border-destructive ring-destructive" : "border-input"
        }`}
      />
    </div>
  );
}

// ─── Curl Parser ───

function CurlParser({ onParsed }) {
  const [curlText, setCurlText] = useState("");
  const [error, setError] = useState("");

  const parseCurl = () => {
    setError("");
    try {
      const text = curlText.trim();
      if (!text.toLowerCase().startsWith("curl")) {
        setError('Not a curl command — must start with "curl"');
        return;
      }

      // Extract URL — matches http(s)://... or a path starting with /
      let url = "";
      const urlFull = text.match(/(['"]?)(https?:\/\/[^\s'"]+)\1/);
      const urlPath = text.match(/(['"]?)(\/[^\s'"]+)\1/);
      if (urlFull) url = urlFull[2];
      else if (urlPath) url = urlPath[2];

      // Extract method: -X POST or --request POST
      let method = "";
      const methodMatch = text.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/i);
      if (methodMatch) method = methodMatch[1].toUpperCase();

      // Extract headers: -H 'Key: Value' or --header "Key: Value"
      const headers = {};
      const headerRegex = /(?:-H|--header)\s+'([^']+)'/gi;
      const headerRegexDbl = /(?:-H|--header)\s+"([^"]+)"/gi;
      for (const re of [headerRegex, headerRegexDbl]) {
        let hm;
        while ((hm = re.exec(text)) !== null) {
          const headerStr = hm[1];
          const colonIdx = headerStr.indexOf(":");
          if (colonIdx > 0) {
            const hKey = headerStr.substring(0, colonIdx).trim();
            const hVal = headerStr.substring(colonIdx + 1).trim();
            headers[hKey] = hVal;
          }
        }
      }

      // Extract data: -d '...' or --data '...' or --data-raw '...'
      let bodyStr = "";
      const dataMatchSq = text.match(/(?:-d|--data|--data-raw)\s+'([^']+)'/);
      const dataMatchDq = text.match(/(?:-d|--data|--data-raw)\s+"([^"]+)"/);
      const dataMatch = dataMatchSq || dataMatchDq;
      if (dataMatch) bodyStr = dataMatch[1];

      // Extract form fields: -F 'key=value' or --form 'key=value'
      const formFields = {};
      const formRegex = /(?:-F|--form)\s+'([^']+)'/gi;
      const formRegexDbl = /(?:-F|--form)\s+"([^"]+)"/gi;
      for (const re of [formRegex, formRegexDbl]) {
        let fm;
        while ((fm = re.exec(text)) !== null) {
          const fieldStr = fm[1];
          const eqIdx = fieldStr.indexOf("=");
          if (eqIdx > 0) {
            formFields[fieldStr.substring(0, eqIdx).trim()] = fieldStr
              .substring(eqIdx + 1)
              .trim();
          }
        }
      }

      // Build input_schema from JSON body or form fields
      let inputSchema = { type: "object", properties: {}, required: [] };
      const sources = {};

      // Try JSON body first
      try {
        if (bodyStr) {
          const parsed = JSON.parse(bodyStr);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            Object.assign(sources, parsed);
          }
        }
      } catch {
        /* not JSON */
      }

      // Merge form fields (they override JSON body keys)
      Object.assign(sources, formFields);

      if (Object.keys(sources).length > 0) {
        for (const [k, v] of Object.entries(sources)) {
          const pType =
            typeof v === "number"
              ? Number.isInteger(v)
                ? "integer"
                : "number"
              : typeof v === "boolean"
                ? "boolean"
                : typeof v === "object"
                  ? "object"
                  : "string";
          // Use the field name as parameter key (sanitized)
          const pKey =
            k.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^_|_$/g, "") ||
            `param_${_paramNextId++}`;
          inputSchema.properties[pKey] = {
            type: pType,
            description: "",
            _id: pKey,
          };
        }
      }

      onParsed({ url, method, headers, bodyStr, inputSchema });
      setCurlText("");
    } catch (e) {
      setError("Failed to parse curl: " + e.message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Import from curl</label>
        <span className="text-[10px] text-muted-foreground">
          Paste a curl command to auto-fill the form
        </span>
      </div>
      <textarea
        value={curlText}
        onChange={(e) => setCurlText(e.target.value)}
        placeholder={`curl -X POST 'https://api.example.com/endpoint' \\\n  -H 'Authorization: Bearer {{API_KEY}}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"query": "value"}'`}
        rows={5}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        onClick={parseCurl}
        disabled={!curlText.trim()}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50"
      >
        Parse & Fill
      </button>
    </div>
  );
}

// ─── Input Schema Builder ───

let _paramNextId = 1;

function InputSchemaBuilder({ schema, onChange }) {
  const properties = schema?.properties || {};
  const required = schema?.required || [];

  const handleAddParam = () => {
    const newKey = `param_${_paramNextId++}`;
    onChange({
      ...schema,
      properties: {
        ...properties,
        [newKey]: { type: "string", description: "", _id: newKey },
      },
    });
  };

  const handleRemoveParam = (key) => {
    const newProps = { ...properties };
    delete newProps[key];
    onChange({
      ...schema,
      properties: newProps,
      required: required.filter((r) => r !== key),
    });
  };

  const handleParamChange = (key, field, value) => {
    onChange({
      ...schema,
      properties: {
        ...properties,
        [key]: { ...properties[key], [field]: value },
      },
    });
  };

  const handleRequiredToggle = (key) => {
    const isRequired = required.includes(key);
    onChange({
      ...schema,
      required: isRequired
        ? required.filter((r) => r !== key)
        : [...required, key],
    });
  };

  const paramKeys = Object.keys(properties);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Input Parameters</label>
        <button
          onClick={handleAddParam}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-all"
        >
          <Plus className="h-3 w-3" />
          Add parameter
        </button>
      </div>

      {paramKeys.length === 0 && (
        <p className="text-sm text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">
          No parameters yet. Add parameters that the agent will fill in when
          calling this tool.
        </p>
      )}

      {paramKeys.map((key) => {
        const param = properties[key];
        const stableId = param?._id || key;
        return (
          <div
            key={stableId}
            className="rounded-lg border border-border bg-background p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newName = e.target.value;
                  if (!newName || newName === key) return;
                  // Rebuild object preserving insertion order, replacing old key with new
                  const newProps = {};
                  for (const [k, v] of Object.entries(properties)) {
                    if (k === key) {
                      newProps[newName] = v;
                    } else {
                      newProps[k] = v;
                    }
                  }
                  const newRequired = required.includes(key)
                    ? required.map((r) => (r === key ? newName : r))
                    : required;
                  onChange({
                    ...schema,
                    properties: newProps,
                    required: newRequired,
                  });
                }}
                placeholder="param_name"
                className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={param.type || "string"}
                onChange={(e) => handleParamChange(key, "type", e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {INPUT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={required.includes(key)}
                  onChange={() => handleRequiredToggle(key)}
                  className="rounded border-input"
                />
                Required
              </label>
              <button
                onClick={() => handleRemoveParam(key)}
                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Remove parameter"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={param.description || ""}
              onChange={(e) =>
                handleParamChange(key, "description", e.target.value)
              }
              placeholder="Parameter description..."
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {param.type === "string" && param.enum && (
              <input
                type="text"
                value={(param.enum || []).join(", ")}
                onChange={(e) =>
                  handleParamChange(
                    key,
                    "enum",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="enum values (comma-separated)"
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <input
              type="text"
              value={param.default !== undefined ? String(param.default) : ""}
              onChange={(e) => {
                let val = e.target.value;
                if (param.type === "integer" || param.type === "number") {
                  val = val === "" ? undefined : Number(val);
                } else if (param.type === "boolean") {
                  val =
                    val === "true" ? true : val === "false" ? false : undefined;
                }
                handleParamChange(key, "default", val);
              }}
              placeholder="Default value (optional)"
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Collapsible Section ───

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold hover:bg-accent/30 transition-all rounded-t-lg"
      >
        {title}
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Main ToolDesigner Component ───

export default function ToolDesigner({
  tool,
  onChange,
  onSave,
  onTest,
  packageJson,
  loading,
  editingId,
  secretsForTest,
  onSecretsChange,
  showToast,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const updateConfig = (key, value) => {
    onChange({ ...tool, config: { ...tool.config, [key]: value } });
  };

  const updateMetadata = (key, value) => {
    const updated = { ...tool, [key]: value };
    // Auto-generate slug from name (handles Polish chars)
    if (key === "name") {
      const polishMap = {
        ą: "a",
        ć: "c",
        ę: "e",
        ł: "l",
        ń: "n",
        ó: "o",
        ś: "s",
        ź: "z",
        ż: "z",
      };
      let slug = value.toLowerCase();
      for (const [pl, en] of Object.entries(polishMap)) {
        slug = slug.replaceAll(pl, en);
      }
      updated.slug = slug.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    }
    onChange(updated);
  };

  const handleSecretsTestChange = (key, value) => {
    onSecretsChange({ ...secretsForTest, [key]: value });
  };

  const handleCurlParsed = ({ url, method, headers, bodyStr, inputSchema }) => {
    const updates = { ...tool };
    if (url) updates.config = { ...updates.config, url };
    if (method) updates.config = { ...updates.config, method };
    if (headers && Object.keys(headers).length > 0)
      updates.config = { ...updates.config, headers };
    // If parsed body produced input_schema, merge it
    if (inputSchema && Object.keys(inputSchema.properties || {}).length > 0) {
      updates.input_schema = inputSchema;
    }
    onChange(updates);
    showToast("curl parsed — form filled!");
  };

  const secretsTestEntries = Object.entries(secretsForTest);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column — Forms */}
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            {editingId ? "Edit Tool" : "New Tool"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onTest}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent transition-all"
            >
              <Play className="h-4 w-4" />
              Test
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Curl Import */}
        <Section title="Import from curl" defaultOpen={false}>
          <CurlParser onParsed={handleCurlParsed} />
        </Section>

        {/* Metadata */}
        <Section title="Tool Metadata">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium">Name *</label>
              <input
                type="text"
                value={tool.name}
                onChange={(e) => updateMetadata("name", e.target.value)}
                placeholder="My API Tool"
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <input
                type="text"
                value={tool.slug}
                onChange={(e) => updateMetadata("slug", e.target.value)}
                placeholder="my_api_tool"
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Version</label>
              <input
                type="text"
                value={tool.version}
                onChange={(e) => updateMetadata("version", e.target.value)}
                placeholder="1.0.0"
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={tool.description}
              onChange={(e) => updateMetadata("description", e.target.value)}
              placeholder="What does this tool do? This helps the agent understand when to use it."
              rows={2}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-sm font-medium">Icon</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={tool.icon}
                  onChange={(e) => updateMetadata("icon", e.target.value)}
                  placeholder="globe, database, code... or pick 😀"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-md border border-input hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
                  title="Pick an emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={(emoji) => {
                    updateMetadata("icon", emoji);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                value={tool.category}
                onChange={(e) => updateMetadata("category", e.target.value)}
                placeholder="communication, data..."
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </Section>

        {/* HTTP Configuration */}
        <Section title="HTTP Configuration">
          <div>
            <label className="text-sm font-medium">URL</label>
            <input
              type="text"
              value={tool.config.url || ""}
              onChange={(e) => updateConfig("url", e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{param_name}"} placeholders to inject agent inputs into the
              URL path.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Method</label>
              <select
                value={tool.config.method || ""}
                onChange={(e) => updateConfig("method", e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Any (agent chooses)</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Timeout (seconds)</label>
              <input
                type="number"
                value={tool.config.timeout ?? 60}
                onChange={(e) =>
                  updateConfig("timeout", parseInt(e.target.value) || 60)
                }
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Headers</label>
            <p className="text-xs text-muted-foreground mb-2">
              Use {"{{SECRET_NAME}}"} (double braces!) for secrets. Example:
              Authorization: Bearer {"{{API_KEY}}"}.
            </p>
            <KeyValueEditor
              value={tool.config.headers || {}}
              onChange={(v) => updateConfig("headers", v)}
              keyPlaceholder="Authorization"
              valuePlaceholder="Bearer {{API_KEY}}"
            />
          </div>
        </Section>

        {/* Advanced HTTP Options */}
        <Section title="Advanced HTTP Options" defaultOpen={false}>
          <div>
            <label className="text-sm font-medium">Query Mapping</label>
            <p className="text-xs text-muted-foreground mb-2">
              Maps agent arguments to query string parameters.
            </p>
            <KeyValueEditor
              value={tool.config.query_mapping || {}}
              onChange={(v) => updateConfig("query_mapping", v)}
              keyPlaceholder="agent_arg"
              valuePlaceholder="query_param"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Static Query Params</label>
            <p className="text-xs text-muted-foreground mb-2">
              Always appended to the URL as query parameters.
            </p>
            <KeyValueEditor
              value={tool.config.static_query || {}}
              onChange={(v) => updateConfig("static_query", v)}
              keyPlaceholder="param"
              valuePlaceholder="value"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Static Body Fields</label>
            <p className="text-xs text-muted-foreground mb-2">
              Always included in the JSON body of the request.
            </p>
            <KeyValueEditor
              value={tool.config.static_body || {}}
              onChange={(v) => updateConfig("static_body", v)}
              keyPlaceholder="field"
              valuePlaceholder="value"
            />
          </div>
        </Section>

        {/* Input Schema */}
        <Section title="Input Schema">
          <p className="text-xs text-muted-foreground">
            Define the parameters the agent will fill in when calling this tool.
            These become the function parameters in the OpenAI function schema.
          </p>
          <InputSchemaBuilder
            schema={tool.input_schema}
            onChange={(v) => onChange({ ...tool, input_schema: v })}
          />
        </Section>

        {/* Secrets */}
        <Section title="Secrets">
          <div>
            <label className="text-sm font-medium">Required Secrets</label>
            <p className="text-xs text-muted-foreground mb-2">
              Must be UPPERCASE with underscores (e.g. API_KEY, DB_PASSWORD).
              Use {"{{SECRET_NAME}}"} (double braces) in config values.
            </p>
            <TagInput
              value={tool.secrets_required || []}
              onChange={(v) => onChange({ ...tool, secrets_required: v })}
              placeholder="UPPERCASE name and press Enter..."
              validateSecret={true}
            />
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <label className="text-sm font-medium">Secrets for Testing</label>
            <p className="text-xs text-muted-foreground mb-2">
              Paste actual values here to test the tool. These are NEVER saved.
            </p>
            {tool.secrets_required.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Add required secrets above first, then paste values here.
              </p>
            ) : (
              <div className="space-y-2">
                {tool.secrets_required.map((name) => (
                  <div key={name}>
                    <label className="text-xs font-medium text-muted-foreground">
                      {name}
                    </label>
                    <input
                      type="password"
                      value={secretsForTest[name] || ""}
                      onChange={(e) =>
                        handleSecretsTestChange(name, e.target.value)
                      }
                      placeholder={`Value for ${name}...`}
                      className="w-full mt-0.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Right Column — JSON Preview */}
      <div className="space-y-4 lg:sticky lg:top-20 self-start">
        <JsonPreview packageJson={packageJson} showToast={showToast} />

        {/* Tool Appearance Preview — how it will look in WELES */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-sm">WELES Preview</h3>
            <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
              How this tool appears in the main app
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tool.icon || "🔧"}</span>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {tool.name || "Untitled Tool"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {tool.slug || "no-slug"} · v{tool.version || "1.0.0"} ·{" "}
                  <span className="uppercase">{tool.type}</span>
                </p>
              </div>
            </div>
            {tool.description ? (
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description
              </p>
            )}
            {tool.category && (
              <span className="inline-block text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                {tool.category}
              </span>
            )}
            {tool.secrets_required && tool.secrets_required.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tool.secrets_required.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground"
                  >
                    🔑 {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                No secrets required
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
