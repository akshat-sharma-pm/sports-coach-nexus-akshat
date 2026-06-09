import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { copilotReply } from "@/lib/ai";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/copilot")({
  head: () => ({ meta: [{ title: "AI Copilot · USI" }] }),
  component: Copilot,
});

interface Msg { role: "user" | "ai"; text: string }

const prompts = [
  "Who is at risk this week?",
  "Build a deload microcycle for Football U21",
  "Show squad readiness snapshot",
  "Which athletes have low nutrition compliance?",
];

function Copilot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi — I'm USI Copilot. Ask me about athlete risk, training load, readiness, nutrition compliance, or injury trends." },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: copilotReply(text) }]);
    setInput("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      <PageHeader title="AI Copilot" subtitle="Operational intelligence across all modules" />
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 max-w-4xl mx-auto w-full">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && <div className="w-7 h-7 rounded bg-primary/15 grid place-items-center shrink-0"><Sparkles className="w-3.5 h-3.5 text-primary" /></div>}
            <div className={`max-w-[80%] rounded-lg p-3 text-[13px] whitespace-pre-wrap ${m.role === "user" ? "bg-primary/15 border border-primary/30" : "surface"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-2 flex-wrap">
            {prompts.map((p) => (
              <button key={p} onClick={() => send(p)} className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/40 text-muted-foreground">{p}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask USI Copilot…"
              className="flex-1 h-10 px-3 rounded bg-input/60 border border-border text-[13px] outline-none focus:border-primary" />
            <button type="submit" className="h-10 px-4 rounded bg-primary text-primary-foreground text-[13px] flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
