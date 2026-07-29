import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { brl, dateBR } from "@/lib/format";
import { Field, Input, Modal, Select } from "./Clientes";
import { Plus, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { ClienteSelect, ClienteItem } from "../ClienteSelect";

type Lancamento = {
  id: string;
  descricao: string;
  tipo: string;
  cliente_nome?: string | null;
  vencimento?: string | null;
  status: string;
  valor: number;
  valor_pago?: number | null;
  metodo?: string | null;
};

type LancamentoForm = {
  tipo: string;
  status: string;
  descricao: string;
  cliente_nome: string;
  metodo: string;
  valor: string;
  valor_pago: string;
  vencimento: string;
};

export function Financeiro() {
  const [list, setList] = useState<Lancamento[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<Lancamento | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<ClienteItem | null>(null);

  const [form, setForm] = useState<LancamentoForm>({
    tipo: "Receita",
    status: "Pendente",
    descricao: "",
    cliente_nome: "",
    metodo: "Pix",
    valor: "",
    valor_pago: "0",
    vencimento: new Date().toISOString().slice(0, 10),
  });

  const resetForm = () => {
    setEditingId(null);
    setSelectedCliente(null);
    setForm({
      tipo: "Receita",
      status: "Pendente",
      descricao: "",
      cliente_nome: "",
      metodo: "Pix",
      valor: "",
      valor_pago: "0",
      vencimento: new Date().toISOString().slice(0, 10),
    });
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (f: Lancamento) => {
    setEditingId(f.id);
    setSelectedCliente(f.cliente_nome ? ({ id: "", nome: f.cliente_nome } as ClienteItem) : null);
    setForm({
      tipo: f.tipo || "Receita",
      status: f.status || "Pendente",
      descricao: f.descricao || "",
      cliente_nome: f.cliente_nome || "",
      metodo: f.metodo || "Pix",
      valor: f.valor != null ? String(f.valor) : "",
      valor_pago: f.valor_pago != null ? String(f.valor_pago) : "0",
      vencimento: f.vencimento ? f.vencimento.slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const updateField = (field: keyof LancamentoForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const load = async () => {
    const { data } = await supabase.from("financeiro").select("*").order("vencimento", { ascending: true });
    setList((data as Lancamento[] | null) ?? []);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!form.descricao || !form.valor) {
      alert("Descrição e Valor são obrigatórios.");
      return;
    }

    const valorTotal = Number(form.valor) || 0;
    const valorAbatido = Number(form.valor_pago) || 0;

    const payload = {
      tipo: form.tipo,
      status: form.status,
      descricao: form.descricao,
      cliente_nome: form.cliente_nome || null,
      metodo: form.metodo,
      valor: valorTotal,
      valor_pago: valorAbatido,
      vencimento: form.vencimento || null,
    };

    if (editingId) {
      let { error } = await supabase.from("financeiro").update(payload).eq("id", editingId);
      if (error && error.message?.includes("valor_pago")) {
        const { valor_pago: _, ...payloadWithoutValorPago } = payload;
        const res = await supabase.from("financeiro").update(payloadWithoutValorPago).eq("id", editingId);
        error = res.error;
      }
      if (error) {
        alert("Erro ao atualizar lançamento: " + error.message);
        return;
      }
    } else {
      let { error } = await supabase.from("financeiro").insert({ ...payload, criado_por: getUserName() });
      if (error && error.message?.includes("valor_pago")) {
        const { valor_pago: _, ...payloadWithoutValorPago } = payload;
        const res = await supabase.from("financeiro").insert({ ...payloadWithoutValorPago, criado_por: getUserName() });
        error = res.error;
      }
      if (error) {
        alert("Erro ao criar lançamento: " + error.message);
        return;
      }
    }

    closeModal();
    void load();
  };

  const del = async (id: string) => {
    await supabase.from("financeiro").delete().eq("id", id);
    setDeleteItem(null);
    void load();
  };

  const pagar = async (id: string) => {
    const item = list.find((x) => x.id === id);
    let { error } = await supabase.from("financeiro").update({
      status: "Pago",
      valor_pago: item?.valor ?? 0,
      pago_em: new Date().toISOString().slice(0, 10),
    }).eq("id", id);

    if (error && error.message?.includes("valor_pago")) {
      const res = await supabase.from("financeiro").update({
        status: "Pago",
        pago_em: new Date().toISOString().slice(0, 10),
      }).eq("id", id);
      error = res.error;
    }

    if (error) {
      alert("Erro ao dar baixa no lançamento: " + error.message);
      return;
    }

    void load();
  };

  const totalPend = list.filter((x) => x.status === "Pendente").reduce((acc, item) => acc + Math.max(0, Number(item.valor || 0) - Number(item.valor_pago || 0)), 0);
  const totalPago = list.filter((x) => x.status === "Pago").reduce((acc, item) => acc + Number(item.valor || 0), 0) +
                    list.filter((x) => x.status !== "Pago").reduce((acc, item) => acc + Number(item.valor_pago || 0), 0);

  const valorTotalNum = Number(form.valor) || 0;
  const valorPagoNum = Number(form.valor_pago) || 0;
  const saldoRestante = Math.max(0, valorTotalNum - valorPagoNum);

  return (
    <div className="space-y-4">
      <ConfirmDeleteModal
        open={!!deleteItem}
        title="Excluir Lançamento?"
        description={deleteItem ? `O lançamento "${deleteItem.descricao}" será removido permanentemente.` : undefined}
        onConfirm={() => { if (deleteItem) void del(deleteItem.id); }}
        onClose={() => setDeleteItem(null)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4">
          <div className="text-[11px] uppercase text-[color:var(--muted-foreground)] font-semibold">A receber (Saldo Devedor)</div>
          <div className="font-display text-2xl text-yellow-300 mt-1">{brl(totalPend)}</div>
        </div>
        <div className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4">
          <div className="text-[11px] uppercase text-[color:var(--muted-foreground)] font-semibold">Recebido / Abatido</div>
          <div className="font-display text-2xl text-green-300 mt-1">{brl(totalPago)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-md bg-[color:var(--gold)] px-3 py-2 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition shadow">
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>

      {/* Tabela — desktop */}
      <div className="hidden md:block rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--navy-surface)] uppercase text-xs text-[color:var(--muted-foreground)]">
            <tr>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Método</th>
              <th className="text-left p-3">Venc.</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Valor Total</th>
              <th className="text-right p-3">Abatido / Pago</th>
              <th className="text-right p-3">Saldo</th>
              <th className="text-center p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-[color:var(--muted-foreground)]">Nenhum lançamento.</td></tr>}
            {list.map(f => {
              const valTotal = Number(f.valor || 0);
              const valPago = Number(f.valor_pago || 0);
              const saldo = Math.max(0, valTotal - valPago);
              return (
                <tr key={f.id} className="border-t border-[color:var(--navy-border)] hover:bg-[color:var(--navy-surface)]/40 transition">
                  <td className="p-3">
                    <div className="font-medium text-white">{f.descricao}</div>
                    <div className="text-[10px] text-[color:var(--muted-foreground)]">{f.tipo}</div>
                  </td>
                  <td className="p-3">{f.cliente_nome || "—"}</td>
                  <td className="p-3 text-xs text-[color:var(--gold-2)]">{f.metodo || "—"}</td>
                  <td className="p-3 text-xs">{dateBR(f.vencimento)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${f.status === "Pago" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold text-white">{brl(valTotal)}</td>
                  <td className="p-3 text-right font-semibold text-green-400">{brl(valPago)}</td>
                  <td className="p-3 text-right font-semibold text-[color:var(--gold-2)]">{brl(saldo)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      {f.status !== "Pago" && (
                        <button onClick={() => pagar(f.id)} title="Marcar como totalmente pago" className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(f)} title="Editar lançamento" className="p-1 text-[color:var(--gold-2)] hover:bg-[color:var(--gold)]/10 rounded transition">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteItem(f)} title="Excluir lançamento" className="p-1 text-red-400 hover:bg-red-500/10 rounded transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
        {list.map(f => {
          const valTotal = Number(f.valor || 0);
          const valPago = Number(f.valor_pago || 0);
          const saldo = Math.max(0, valTotal - valPago);
          return (
            <div key={f.id} className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white truncate">{f.descricao}</div>
                  <div className="text-[11px] text-[color:var(--muted-foreground)] mt-0.5">
                    {f.tipo} · {f.cliente_nome || "—"} · <span className="text-[color:var(--gold-2)]">{f.metodo || "Pix"}</span>
                  </div>
                  {f.vencimento && <div className="text-[11px] text-[color:var(--muted-foreground)]">Venc.: {dateBR(f.vencimento)}</div>}
                  <div className="mt-1 text-xs space-x-2">
                    <span className="text-white">Total: {brl(valTotal)}</span>
                    <span className="text-green-400">Pago/Abatido: {brl(valPago)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${f.status === "Pago" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>{f.status}</span>
                  <span className="text-sm font-bold text-[color:var(--gold-2)]">Saldo: {brl(saldo)}</span>
                  <div className="flex items-center gap-1 mt-1">
                    {f.status !== "Pago" && (
                      <button onClick={() => pagar(f.id)} className="text-green-400 hover:text-green-300 text-xs flex items-center gap-0.5 p-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pagar
                      </button>
                    )}
                    <button onClick={() => openEdit(f)} className="text-[color:var(--gold-2)] p-1">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteItem(f)} className="text-red-400 p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <Modal onClose={closeModal} title={editingId ? "Editar lançamento" : "Novo lançamento"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tipo">
              <Select value={form.tipo} onChange={updateField("tipo")} options={["Receita", "Despesa"]} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={updateField("status")} options={["Pendente", "Pago", "Atrasado"]} />
            </Field>

            <Field label="Descrição *" span2>
              <Input value={form.descricao ?? ""} onChange={updateField("descricao")} placeholder="Ex: Pagamento orçamento #1024" />
            </Field>

            <Field label="Cliente" span2>
              <ClienteSelect
                label=""
                selectedCliente={selectedCliente}
                selectedNome={form.cliente_nome}
                onSelectCliente={(c) => {
                  setSelectedCliente(c);
                  setForm((prev) => ({ ...prev, cliente_nome: c.nome }));
                }}
              />
            </Field>

            <Field label="Método de Pagamento">
              <Select
                value={form.metodo}
                onChange={updateField("metodo")}
                options={["Pix", "Cartão", "Dinheiro", "Cheque", "Outro"]}
              />
            </Field>

            <Field label="Vencimento">
              <Input type="date" value={form.vencimento ?? ""} onChange={updateField("vencimento")} />
            </Field>

            <Field label="Valor Total (R$) *">
              <Input type="number" min="0" step="0.01" value={form.valor ?? ""} onChange={updateField("valor")} placeholder="0.00" />
            </Field>

            <Field label="Quanto o cliente deu / abateu (R$)">
              <Input type="number" min="0" step="0.01" value={form.valor_pago ?? ""} onChange={updateField("valor_pago")} placeholder="0.00" />
            </Field>

            {valorTotalNum > 0 && (
              <div className="col-span-1 sm:col-span-2 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-lg p-2.5 flex items-center justify-between text-xs">
                <span className="text-[color:var(--muted-foreground)]">Saldo Restante a Receber:</span>
                <span className="font-bold text-sm text-[color:var(--gold-2)]">{brl(saldoRestante)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={closeModal} className="px-3 py-2 text-sm text-[color:var(--muted-foreground)] hover:text-white">
              Cancelar
            </button>
            <button onClick={save} className="rounded-md bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition">
              {editingId ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
