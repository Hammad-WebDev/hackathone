import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MdArrowBack } from "react-icons/md";
import useAuthStore from "../zustand/authStore";

const AiPage = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Assalamualaikum! I am ClinicFlow Assistant. Ask me about clinic workflows, scheduling, patient handling, or role-based operations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Hugging Face API key from environment variable
  const HUGGINGFACE_API_KEY = import.meta.env.VITE_HF_TOKEN;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setInput("");
    setLoading(true);

    try {
      if (!HUGGINGFACE_API_KEY) throw new Error("Missing Hugging Face API Key");

      const prompt = `You are ClinicFlow Assistant for a clinic management web app.
Current user role: "${authUser?.role || "user"}"
Current user name: "${authUser?.name || "User"}"
User message: "${userInput}"

Instructions:
1) Give practical, clinic-management guidance.
2) Keep responses concise and actionable.
3) Tailor advice by role (admin/doctor/receptionist/patient).
4) If user asks for medical diagnosis/treatment, avoid diagnosing and suggest consulting a licensed doctor.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let response;
      try {
        // Use Hugging Face Router chat-completions endpoint.
        response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content:
                    "You are ClinicFlow Assistant. Help users with clinic management operations and role-based workflows. Keep responses concise and structured.",
                },
                { role: "user", content: prompt },
              ],
              model: "meta-llama/Llama-3.1-8B-Instruct:novita",
              max_tokens: 500,
              temperature: 0.7,
            }),
            signal: controller.signal,
          }
        );
      } finally {
        clearTimeout(timeout);
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const apiError = data?.error?.message || data?.error || `HTTP ${response.status}`;
        throw new Error(`AI API failed: ${apiError}`);
      }

      // ✅ Hugging Face returns array of objects for some models
      let reply = "";
      if (Array.isArray(data)) {
        reply = data[0]?.generated_text || "No response generated.";
      } else if (data?.choices?.[0]?.message?.content) {
        reply = data.choices[0].message.content;
      } else if (data?.generated_text) {
        reply = data.generated_text;
      } else if (data?.error) {
        reply = `Error: ${data.error}`;
      } else {
        reply = "No response generated.";
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("AI Error:", err);
      const friendlyError =
        err?.name === "AbortError"
          ? "Request timeout. Please try again."
          : err?.message === "Failed to fetch"
            ? "Network/CORS issue while connecting to AI API. Check internet, API token permissions, or use a backend proxy."
            : err.message || "AI request failed. Try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: friendlyError },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="z-10 rounded-lg border border-slate-700 p-2 text-2xl text-slate-200 transition hover:border-cyan-300 hover:text-cyan-300 cursor-pointer"
        >
          <MdArrowBack />
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-3xl font-extrabold text-cyan-300">ClinicFlow AI</h1>
          <p className="text-sm text-slate-400">Clinic Operations Assistant</p>
        </div>
        <div className="hidden rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300 sm:block">
          {authUser?.role || "user"}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900 p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === "assistant"
                  ? "border border-slate-700 bg-slate-900 text-slate-100"
                  : "bg-cyan-400 text-slate-950 font-medium"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-300 shadow-sm animate-pulse">
              ClinicFlow Assistant is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 border-t border-slate-800 bg-slate-900/80 p-4 backdrop-blur-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about clinic workflow, scheduling, role tasks, or patient handling..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className={`px-6 py-3 rounded-2xl font-semibold shadow-md transition ${
            loading
              ? "bg-cyan-300/60 text-slate-800 cursor-not-allowed"
              : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 cursor-pointer"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiPage;
