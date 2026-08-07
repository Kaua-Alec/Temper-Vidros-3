import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dateBR } from "@/lib/format";
import { Field, Modal } from "./Clientes";
import { PackageMinus, Check, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";

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
  const [estoque, setEstoque] = useState<{ id: string; material: string; quantidade: number; unidade: string }[]>([]);
  const [baixaOpen, setBaixaOpen] = useState<Pedido | null>(null);
  const [baixas, setBaixas] = useState<Record<string, number>>({});

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

  const openBaixa = async (p: Pedido) => {
    const { data } = await supabase.from("estoque").select("id, material, quantidade, unidade").order("material");
    setEstoque(data || []);
    setBaixas({});
    setBaixaOpen(p);
  };

  const confirmarBaixa = async () => {
    let atualizou = false;
    for (const id in baixas) {
      if (baixas[id] > 0) {
        const item = estoque.find(e => e.id === id);
        if (item) {
          const novaQtd = Math.max(0, item.quantidade - baixas[id]);
          await supabase.from("estoque").update({ quantidade: novaQtd }).eq("id", id);
          atualizou = true;
        }
      }
    }
    setBaixaOpen(null);
    if (atualizou) alert("Estoque reduzido com sucesso!");
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

      <AnimatePresence>
        {edit && (
          <Modal onClose={() => setEdit(null)} title={`Pedido ${edit.numero}`}>
            <div className="mb-4 space-y-2 text-sm">
              <div><b>Cliente:</b> {edit.cliente_nome}</div>
              <div><b>Status atual:</b> {edit.status}</div>
            </div>
            
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => { setEdit(null); openBaixa(edit); }}
                className="flex items-center gap-1.5 rounded-md border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-3 py-2 text-xs font-semibold hover:border-[color:var(--gold-dim)] hover:text-[color:var(--gold-2)] transition"
              >
                <PackageMinus className="h-4 w-4" /> Dar Baixa no Estoque
              </button>
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
      </AnimatePresence>

      <AnimatePresence>
        {baixaOpen && (
          <Modal onClose={() => setBaixaOpen(null)} title={`Baixa de Estoque - ${baixaOpen.numero}`}>
            <p className="text-xs text-[color:var(--muted-foreground)] mb-4">
              Informe a quantidade de material gasto neste pedido para ser deduzida do estoque geral.
            </p>
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2 mb-4">
              {estoque.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] p-2 rounded-md">
                  <div className="text-xs font-medium min-w-0">
                    <div className="truncate text-white">{item.material}</div>
                    <div className="text-[10px] text-[color:var(--muted-foreground)]">Em estoque: {item.quantidade} {item.unidade}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[color:var(--muted-foreground)]">Uso:</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={baixas[item.id] || ""}
                      onChange={(e) => setBaixas({ ...baixas, [item.id]: Number(e.target.value) || 0 })}
                      className="w-16 rounded-md border border-[color:var(--navy-border)] bg-[color:var(--navy-base)] px-2 py-1 text-xs outline-none focus:border-[color:var(--gold-dim)]"
                    />
                    <span className="text-xs text-[color:var(--muted-foreground)] w-6">{item.unidade}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[color:var(--navy-border)]">
              <button
                onClick={() => setBaixaOpen(null)}
                className="px-3 py-2 text-xs text-[color:var(--muted-foreground)] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBaixa}
                className="flex items-center gap-1.5 rounded-md bg-[color:var(--gold)] px-4 py-2 text-xs font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)]"
              >
                <Check className="h-4 w-4" /> Confirmar Baixa
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
