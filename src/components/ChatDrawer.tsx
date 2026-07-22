import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { dateTimeBR } from "@/lib/format";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { id: string; autor: string; texto: string; created_at: string };

export function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("mensagens")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => setMsgs((data as Msg[]) ?? []));

    const ch = supabase
      .channel("mensagens-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens" },
        (payload) => {
          const m = payload.new as Msg;
          setMsgs((prev) => [...prev, m]);
          if (!open && m.autor !== getUserName()) setUnread((u) => u + 1);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [open]);

  useEffect(() => {
    if (open) setUnread(0);
    setTimeout(() => scroller.current?.scrollTo({ top: 9e9 }), 50);
  }, [open, msgs.length]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    const autor = getUserName() || "Anônimo";
    setText("");
    await supabase.from("mensagens").insert({ autor, texto: t });
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--gold)] text-[color:var(--navy-deep)] shadow-lg hover:bg-[color:var(--gold-2)] transition"
        aria-label="Chat da equipe"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed bottom-20 right-3 sm:right-5 z-40 w-[calc(100vw-1.5rem)] sm:w-[340px] max-h-[70vh] flex flex-col rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] shadow-2xl">
          <div className="px-4 py-3 border-b border-[color:var(--navy-border)] flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[color:var(--gold-2)]">Chat da equipe</div>
              <div className="text-[11px] text-[color:var(--muted-foreground)]">Mensagens em tempo real</div>
            </div>
          </div>
          <div ref={scroller} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
            {msgs.length === 0 && (
              <div className="text-center text-xs text-[color:var(--muted-foreground)] py-8">
                Nenhuma mensagem ainda. Comece a conversa.
              </div>
            )}
            {msgs.map((m) => {
              const mine = m.autor === getUserName();
              return (
                <div key={m.id} className={mine ? "text-right" : ""}>
                  <div
                    className={`inline-block max-w-[85%] rounded-md px-3 py-2 text-sm ${
                      mine
                        ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)]"
                        : "bg-[color:var(--navy-surface)] text-[color:var(--foreground)]"
                    }`}
                  >
                    <div className={`text-[10px] mb-0.5 font-semibold ${mine ? "text-[color:var(--navy-deep)]/70" : "text-[color:var(--gold-2)]"}`}>
                      {m.autor}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{m.texto}</div>
                    <div className={`text-[9px] mt-0.5 ${mine ? "text-[color:var(--navy-deep)]/60" : "text-[color:var(--muted-foreground)]"}`}>
                      {dateTimeBR(m.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-2 border-t border-[color:var(--navy-border)] flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Digite uma mensagem..."
              className="flex-1 rounded-md bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] px-3 py-2 text-sm outline-none focus:border-[color:var(--gold-dim)]"
            />
            <button
              onClick={send}
              className="px-3 rounded-md bg-[color:var(--gold)] text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
