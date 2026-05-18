import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
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


function cleanMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, "")          // Remove headings
    .replace(/\*\*(.*?)\*\*/g, "$1")      // Remove bold
    .replace(/\*(.*?)\*/g, "$1")          // Remove italics
    .replace(/`(.*?)`/g, "$1")            // Remove inline code
    .replace(/^[-*+]\s+/gm, "• ")         // Convert bullet points
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Convert markdown links
    .replace(/\n{3,}/g, "\n\n")           // Reduce extra blank lines
    .trim();
}


export default function App() {
  const [selectedFeature, setSelectedFeature] = useState(FEATURES[0]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const STORAGE_KEY = "devmentor-history";
  const [history, setHistory] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  
  useEffect(() => {
    function loadVoices() {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoice) {
        const preferred =
          availableVoices.find((v) =>
            v.name.includes("Google US English")
          ) ||
          availableVoices.find((v) =>
            v.name.includes("Microsoft Aria")
          ) ||
          availableVoices.find((v) =>
            v.lang.startsWith("en")
          );

        if (preferred) {
          setSelectedVoice(preferred.name);
        }
      }
    }

    loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

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

      const rawResponse =
        typeof data.response === "string"
        ? data.response
        : JSON.stringify(data.response ?? data, null, 2);

      const formattedResponse = cleanMarkdown(rawResponse);

      setResponse(formattedResponse);

      if(!formattedResponse.startsWith("Error:")) {
        speakText(formattedResponse);
      }

      const entry = {
        id: Date.now(),
        feature: selectedFeature.label,
        input,
        response: formattedResponse,
        timestamp: new Date().toLocaleString(),
      };

    setHistory((prev) => [entry, ...prev.slice(0, 19)]);

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

    const cleanedText = cleanMarkdown(text).slice(0, 2000);
    const utterance = new SpeechSynthesisUtterance(cleanedText);

    const voices = speechSynthesis.getVoices();

    const preferredVoice =
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.name.includes("Microsoft Aria")) ||
      voices.find((v) => v.name.includes("Microsoft Jenny")) ||
      voices.find((v) => v.name.includes("Samantha")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = voices.find(
      (v) => v.name === selectedVoice
    );

    if (voice) {
      utterance.voice = voice;
    }

    speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
  }

  async function copyResponse() {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    alert("Response copied to clipboard.");
  }

  function downloadResponse() {
    if (!response) return;

    const blob = new Blob([response], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedFeature.label
      .toLowerCase()
      .replace(/\s+/g, "-")}.md`;

    a.click();
    URL.revokeObjectURL(url);
  }

  function clearResponse() {
    setInput("");
    setResponse("");
    stopSpeaking();
  }

  function clearHistory() {
    if (!confirm("Delete all saved history?")) return;
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function loadHistoryItem(item) {
    setInput(item.input);
    setResponse(item.response);

    const feature = FEATURES.find(
      (f) => f.label === item.feature
    );

    if (feature) setSelectedFeature(feature);
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

          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name}
              </option>
            ))}
          </select>  

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
          
          <div className="button-group utility-group">
            <button className="secondary-btn" onClick={copyResponse}>
              📋 Copy
            </button>

            <button className="secondary-btn" onClick={downloadResponse}>
              💾 Download
            </button>

            <button className="secondary-btn" onClick={clearResponse}>
              🗑 Clear
            </button>
          </div>

          <div className="response-card">
            <div className="response-header">Response</div>
            <div className= "response markdown-body">
              {response ? (
                <ReactMarkdown>{ response }</ReactMarkdown>
              ) : (
                "Your AI response will appear here..."
              )}
            </div>
          </div>
        </section>
        <aside className="history card">
          <div className="history-header">
            <h2>History</h2>

            <button
              className="secondary-btn small-btn"
              onClick={clearHistory}
            >
              Clear All
            </button>
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <p className="empty-history">
                No saved conversations yet.
              </p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  className="history-item"
                  onClick={() => loadHistoryItem(item)}
                >
                  <strong>{item.feature}</strong>
                  <span>
                    {item.input.length > 60
                      ? `${item.input.slice(0, 60)}...`
                      : item.input}
                  </span>
                  <small>{item.timestamp}</small>
                </button>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
