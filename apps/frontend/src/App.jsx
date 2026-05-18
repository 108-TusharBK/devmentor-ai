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
      const res = await fetch(`${API_BASE}${selectedFeature.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [selectedFeature.payloadKey]: input,
        }),
      });

      const data = await res.json();

      const formattedResponse =
        typeof data.response === "string"
          ? data.response
          : JSON.stringify(data.response ?? data, null, 2);

      setResponse(formattedResponse);
      speakText(formattedResponse);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }

    setLoading(false);
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  }

  function speakText(text) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(
      text.slice(0, 2000)
    );
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
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

      <div className="button-group">
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Thinking..." : "Submit"}
        </button>

        <button onClick={startListening}>
          🎤 Speak
        </button>

        <button onClick={stopSpeaking}>
          🔇 Stop Voice
        </button>
      </div>

      <pre className="response">
        {response || "Response will appear here..."}
      </pre>
    </div>
  );
}