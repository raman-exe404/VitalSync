import { useState, useRef, useEffect } from "react";
import { Send, Mic, Bot, User } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { sendChat } from "@/lib/api";

interface Message { from: "ai" | "user"; text: string; }

const suggestions = ["What triggers a sickle cell crisis?", "How much water should I drink?", "What foods help with sickle cell?"];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { from: "ai", text: "Hello! 👋 I'm your VitalSync AI assistant. Ask me anything about sickle cell disease, symptoms, or daily care." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { from: "user", text }]);
    setLoading(true);
    try {
      const { data } = await sendChat(text);
      setMessages((m) => [...m, { from: "ai", text: data.reply }]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "";
      setMessages((m) => [...m, {
        from: "ai",
        text: msg.includes("network") || !msg
          ? "I'm having trouble connecting. Make sure the backend server is running on port 5000."
          : `Error: ${msg}`
      }]);
    }
    setLoading(false);
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)] animate-fade-in">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">AI Health Assistant</h1>

        <div className="flex justify-center mb-4">
          <div className="clay-card w-20 h-20 rounded-full flex items-center justify-center bg-primary/10 clay-float">
            <Bot className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="whitespace-nowrap clay-card px-3 py-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 clay-card p-4 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "ai" && (
                <div className="clay-card w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                msg.from === "user" ? "clay-btn text-primary-foreground rounded-br-md" : "clay-card text-foreground rounded-bl-md"
              }`}>
                {msg.text}
              </div>
              {msg.from === "user" && (
                <div className="clay-card w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary/10">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="clay-card px-4 py-3 rounded-2xl text-sm text-muted-foreground font-body animate-pulse">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <button className="clay-card p-3.5 rounded-full flex-shrink-0" aria-label="Voice input">
            <Mic className="w-5 h-5 text-primary" />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="clay-input flex-1 px-4 py-3 font-body text-foreground placeholder:text-muted-foreground"
            placeholder="Type your message..." />
          <button onClick={send} disabled={loading} className="clay-btn p-3.5 rounded-full flex-shrink-0" aria-label="Send">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAssistant;
