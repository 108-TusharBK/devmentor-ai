import { useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

const FEATURES = [
  {
    label: "Chat",
    endpoint: "/chat",
    payloadKey: "message",
    placeholder: "Ask any technical question...",
    icon: "💬",
  },
  {
    label: "Analyze Project",
    endpoint: "/analyze-project",
    payloadKey: "project_idea",
    placeholder: "Describe your project idea...",
    icon: "🧠",
  },
  {
    label: "Compare Technologies",
    endpoint: "/compare-tech",
    payloadKey: "query",
    placeholder: "Compare Electron vs Tauri...",
    icon: "⚖️",
  },
  {
    label: "Detect Duplicate Tools",
    endpoint: "/detect-duplicates",
    payloadKey: "tool_list",
    placeholder: "LangChain, LangGraph, CrewAI...",
    icon: "🧹",
  },
  {
    label: "Generate Roadmap",
    endpoint: "/generate-roadmap",
    payloadKey: "goal",
    placeholder: "Learn FastAPI, LangGraph, Gemini API...",
    icon: "🗺️",
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
    } finally {
      setLoading(false);
    }
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

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 2000));
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
    <div className="app-shell">
      <header className="hero">
        <div className="hero-badge">🚀 Hackathon MVP</div>
        <h1>DevMentor AI</h1>
        <p className="subtitle">
          Your AI Tech Stack Advisor and Developer Mentor
        </p>
      </header>

      <main className="main-grid">
        <aside className="sidebar card">
          <h2>Features</h2>
          <div className="feature-list">
            {FEATURES.map((feature) => (
              <button
                key={feature.label}
                className={`feature-btn ${
                  selectedFeature.label === feature.label ? "active" : ""
                }`}
                onClick={() => setSelectedFeature(feature)}
              >
                <span>{feature.icon}</span>
                <span>{feature.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="workspace card">
          <div className="section-header">
            <h2>
              {selectedFeature.icon} {selectedFeature.label}
            </h2>
          </div>

          <textarea
            rows="8"
            placeholder={selectedFeature.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="button-group">
            <button
              className="primary-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Submit"}
            </button>

            <button className="secondary-btn" onClick={startListening}>
              🎤 Speak
            </button>

            <button className="secondary-btn" onClick={stopSpeaking}>
              🔇 Stop
            </button>
          </div>

          <div className="response-card">
            <div className="response-header">Response</div>
            <pre className="response">
              {response || "Your AI response will appear here..."}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
