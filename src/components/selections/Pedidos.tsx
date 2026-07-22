import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dateBR } from "@/lib/format";
import { Field, Modal } from "./Clientes";

const STATUS = ["Aguardando material", "Cortando", "Montando", "Pronto para entrega", "Concluído"];

type Pedido = {
  id: string;
  numero: string;
  cliente_nome: string;
  status: string;
  data_prevista?: string | null;
};

export function Pedidos() {
  const [list, setList] = useState<Pedido[]>([]);
  const [edit, setEdit] = useState<Pedido | null>(null);

  const load = async () => {
    const { data } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    setList((data as Pedido[] | null) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const move = async (pedido: Pedido, newStatus: string) => {
    await supabase.from("pedidos").update({ status: newStatus }).eq("id", pedido.id);
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        {STATUS.map((col) => (
          <div key={col} className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[color:var(--gold-2)]">
              <span>{col}</span>
              <span className="text-[10px] text-[color:var(--muted-foreground)]">{list.filter((p) => p.status === col).length}</span>
            </div>
            <div className="space-y-2">
              {list.filter((p) => p.status === col).map((p) => (
                <div key={p.id} onClick={() => setEdit(p)} className="cursor-pointer rounded border border-[color:var(--navy-border)] bg-[color:var(--navy-base)] p-2 hover:border-[color:var(--gold-dim)]">
                  <div className="text-xs font-medium">{p.numero}</div>
                  <div className="text-[11px] text-[color:var(--muted-foreground)]">{p.cliente_nome}</div>
                  {p.data_prevista && <div className="mt-1 text-[10px] text-[color:var(--gold-2)]">Prev: {dateBR(p.data_prevista)}</div>}
                </div>
              ))}
              {list.filter((p) => p.status === col).length === 0 && <div className="py-2 text-center text-[10px] text-[color:var(--muted-foreground)]">—</div>}
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <Modal onClose={() => setEdit(null)} title={`Pedido ${edit.numero}`}>
          <div className="mb-4 space-y-2 text-sm">
            <div><b>Cliente:</b> {edit.cliente_nome}</div>
            <div><b>Status atual:</b> {edit.status}</div>
          </div>
          <Field label="Mover para">
            <div className="flex flex-wrap gap-2">
              {STATUS.map((s) => (
                <button
                  key={s}
                  onClick={async () => {
                    await move(edit, s);
                    setEdit(null);
                  }}
                  className={`rounded border px-3 py-1.5 text-xs ${s === edit.status ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-[color:var(--navy-deep)]" : "border-[color:var(--navy-border)] hover:border-[color:var(--gold-dim)]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </Modal>
      )}
    </div>
  );
}
