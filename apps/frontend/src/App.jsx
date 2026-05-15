import { useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

const FEATURES = [
  {
    label: "Chat",
    endpoint: "/chat",
    payloadKey: "message",
    placeholder: "Ask any question...",
  },
  {
    label: "Analyze Project",
    endpoint: "/analyze-project",
    payloadKey: "project_idea",
    placeholder: "Describe your project idea...",
  },
  {
    label: "Compare Technologies",
    endpoint: "/compare-tech",
    payloadKey: "query",
    placeholder: "Compare Electron vs Tauri...",
  },
  {
    label: "Detect Duplicate Tools",
    endpoint: "/detect-duplicates",
    payloadKey: "tool_list",
    placeholder: "LangChain, LangGraph, CrewAI, AutoGen...",
  },
  {
    label: "Generate Roadmap",
    endpoint: "/generate-roadmap",
    payloadKey: "goal",
    placeholder: "Learn FastAPI, LangGraph, Gemini API...",
  },
];

export default function App() {
  const [selectedFeature, setSelectedFeature] = useState(FEATURES[0]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(
        `${API_BASE}${selectedFeature.endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [selectedFeature.payloadKey]: input,
          }),
        }
      );

      const data = await res.json();

      setResponse(
        typeof data.response === "string"
          ? data.response
          : JSON.stringify(data, null, 2)
      );
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }

    setLoading(false);
  }

  return (
    <div className="app">
      <h1>DevMentor AI</h1>
      <p className="subtitle">
        Your AI Tech Stack Advisor and Developer Mentor
      </p>

      <select
        value={selectedFeature.label}
        onChange={(e) =>
          setSelectedFeature(
            FEATURES.find((f) => f.label === e.target.value)
          )
        }
      >
        {FEATURES.map((feature) => (
          <option key={feature.label} value={feature.label}>
            {feature.label}
          </option>
        ))}
      </select>

      <textarea
        rows="8"
        placeholder={selectedFeature.placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Thinking..." : "Submit"}
      </button>

      <pre className="response">
        {response || "Response will appear here..."}
      </pre>
    </div>
  );
}