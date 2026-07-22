import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { brl, dateBR } from "@/lib/format";
import { Field, Input, Modal, Select } from "./Clientes";
import { Plus, CheckCircle2 } from "lucide-react";

type Lancamento = {
  id: string;
  descricao: string;
  tipo: string;
  cliente_nome?: string | null;
  vencimento?: string | null;
  status: string;
  valor: number;
};

type LancamentoForm = {
  tipo: string;
  status: string;
  descricao: string;
  cliente_nome: string;
  metodo: string;
  valor: string;
  vencimento: string;
};

export function Financeiro() {
  const [list, setList] = useState<Lancamento[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LancamentoForm>({
    tipo: "Receita",
    status: "Pendente",
    descricao: "",
    cliente_nome: "",
    metodo: "",
    valor: "",
    vencimento: "",
  });

  const resetForm = () => {
    setForm({
      tipo: "Receita",
      status: "Pendente",
      descricao: "",
      cliente_nome: "",
      metodo: "",
      valor: "",
      vencimento: "",
    });
  };

  const updateField = (field: keyof LancamentoForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const load = async () => {
    const { data } = await supabase.from("financeiro").select("*").order("vencimento", { ascending: true });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.descricao || !form.valor) return;
    await supabase.from("financeiro").insert({ ...form, valor: Number(form.valor), criado_por: getUserName() });
    resetForm();
    setOpen(false);
    void load();
  };

  const pagar = async (id: string) => {
    await supabase.from("financeiro").update({ status: "Pago", pago_em: new Date().toISOString().slice(0, 10) }).eq("id", id);
    void load();
  };

  const totalPend = list.filter((x) => x.status === "Pendente").reduce((acc, item) => acc + Number(item.valor || 0), 0);
  const totalPago = list.filter((x) => x.status === "Pago").reduce((acc, item) => acc + Number(item.valor || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4">
          <div className="text-[11px] uppercase text-[color:var(--muted-foreground)]">A receber</div>
          <div className="font-display text-2xl text-yellow-300 mt-1">{brl(totalPend)}</div>
        </div>
        <div className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4">
          <div className="text-[11px] uppercase text-[color:var(--muted-foreground)]">Recebido</div>
          <div className="font-display text-2xl text-green-300 mt-1">{brl(totalPago)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-md bg-[color:var(--gold)] px-3 py-2 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)]"><Plus className="h-4 w-4" />Novo lançamento</button>
      </div>

      {/* Tabela — desktop */}
      <div className="hidden md:block rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--navy-surface)] uppercase text-xs text-[color:var(--muted-foreground)]">
            <tr><th className="text-left p-3">Descrição</th><th className="text-left p-3">Cliente</th><th className="text-left p-3">Venc.</th><th className="text-left p-3">Status</th><th className="text-right p-3">Valor</th><th></th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-[color:var(--muted-foreground)]">Nenhum lançamento.</td></tr>}
            {list.map(f => (
              <tr key={f.id} className="border-t border-[color:var(--navy-border)]">
                <td className="p-3"><div className="font-medium">{f.descricao}</div><div className="text-[10px] text-[color:var(--muted-foreground)]">{f.tipo}</div></td>
                <td className="p-3">{f.cliente_nome || "—"}</td>
                <td className="p-3 text-xs">{dateBR(f.vencimento)}</td>
                <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded ${f.status === "Pago" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>{f.status}</span></td>
                <td className="p-3 text-right font-semibold text-[color:var(--gold-2)]">{brl(f.valor)}</td>
                <td className="p-3">{f.status !== "Pago" && <button onClick={() => pagar(f.id)} className="text-green-400 hover:text-green-300"><CheckCircle2 className="h-4 w-4" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {list.length === 0 && (
          <div className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-6 text-center text-sm text-[color:var(--muted-foreground)]">
            Nenhum lançamento.
          </div>
        )}
        {list.map(f => (
          <div key={f.id} className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-white truncate">{f.descricao}</div>
                <div className="text-[11px] text-[color:var(--muted-foreground)] mt-0.5">{f.tipo} · {f.cliente_nome || "—"}</div>
                {f.vencimento && <div className="text-[11px] text-[color:var(--muted-foreground)]">Venc.: {dateBR(f.vencimento)}</div>}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded ${f.status === "Pago" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>{f.status}</span>
                <span className="text-sm font-semibold text-[color:var(--gold-2)]]">{brl(f.valor)}</span>
                {f.status !== "Pago" && (
                  <button onClick={() => pagar(f.id)} className="text-green-400 hover:text-green-300 flex items-center gap-1 text-xs">
                    <CheckCircle2 className="h-4 w-4" /> Pagar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal onClose={() => setOpen(false)} title="Novo lançamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tipo">
              <Select value={form.tipo} onChange={updateField("tipo")} options={["Receita", "Despesa"]} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={updateField("status")} options={["Pendente", "Pago", "Atrasado"]} />
            </Field>
            <Field label="Descrição *" span2>
              <Input value={form.descricao ?? ""} onChange={updateField("descricao")} />
            </Field>
            <Field label="Cliente">
              <Input value={form.cliente_nome ?? ""} onChange={updateField("cliente_nome")} />
            </Field>
            <Field label="Método">
              <Input value={form.metodo ?? ""} onChange={updateField("metodo")} placeholder="PIX, Cartão..." />
            </Field>
            <Field label="Valor *">
              <Input type="number" value={form.valor ?? ""} onChange={updateField("valor")} />
            </Field>
            <Field label="Vencimento">
              <Input type="date" value={form.vencimento ?? ""} onChange={updateField("vencimento")} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-[color:var(--muted-foreground)]">Cancelar</button>
            <button onClick={save} className="rounded-md bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)]">Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
