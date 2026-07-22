import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { dateBR } from "@/lib/format";
import { getUserName } from "@/lib/user";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  documento: string | null;
  endereco: string | null;
  cidade: string | null;
  observacoes: string | null;
  created_at: string;
};

export function Clientes() {
  const [list, setList] = useState<Cliente[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>({});
  const [deleteClient, setDeleteClient] = useState<Cliente | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    setList((data as Cliente[] | null) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (cliente: Cliente) => {
    setForm({
      nome: cliente.nome,
      telefone: cliente.telefone ?? "",
      email: cliente.email ?? "",
      documento: cliente.documento ?? "",
      endereco: cliente.endereco ?? "",
      cidade: cliente.cidade ?? "",
      observacoes: cliente.observacoes ?? "",
    });
    setEditingId(cliente.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome || !form.telefone || !form.endereco) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Telefone e Endereço).");
      return;
    }

    const payload = {
      nome: form.nome,
      telefone: form.telefone ?? null,
      email: form.email ?? null,
      documento: form.documento ?? null,
      endereco: form.endereco ?? null,
      cidade: form.cidade ?? null,
      observacoes: form.observacoes ?? null,
    };

    if (editingId) {
      await supabase.from("clientes").update(payload).eq("id", editingId);
    } else {
      await supabase.from("clientes").insert({ ...payload, criado_por: getUserName() });
    }

    closeModal();
    void load();
  };

  const del = async (id: string) => {
    await supabase.from("orcamentos").update({ cliente_id: null }).eq("cliente_id", id);
    await supabase.from("clientes").delete().eq("id", id);
    void load();
  };

  const filtered = list.filter(
    (c) => !q || c.nome.toLowerCase().includes(q.toLowerCase()) || (c.telefone ?? "").includes(q),
  );

  return (
    <div className="space-y-4">
      <ConfirmDeleteModal
        open={!!deleteClient}
        title="Você tem certeza que vai deletar?"
        description={deleteClient ? `O cliente "${deleteClient.nome}" será excluído permanentemente.` : undefined}
        onConfirm={() => {
          if (deleteClient) void del(deleteClient.id);
        }}
        onClose={() => setDeleteClient(null)}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente..."
          className="flex-1 rounded-md border border-navy-border bg-navy-surface px-3 py-2 text-sm outline-none focus:border-gold-dim"
        />
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Novo cliente
        </button>
      </div>

      {/* Tabela — desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-navy-border bg-navy-card">
        <table className="w-full text-sm">
          <thead className="bg-navy-surface text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">Cidade</th>
              <th className="p-3 text-left">Cadastrado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Nenhum cliente.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-navy-border hover:bg-navy-surface/40">
                <td className="p-3 font-medium">{c.nome}</td>
                <td className="p-3">{c.telefone || "—"}</td>
                <td className="p-3">{c.cidade || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{dateBR(c.created_at)}</td>
                <td className="p-3 text-right">
                  <button type="button" onClick={() => openEdit(c)} className="mr-2 text-gold-2 hover:text-gold" title="Editar cliente">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteClient(c); }} className="text-red-400 hover:text-red-300" title="Excluir cliente">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-navy-border bg-navy-card p-6 text-center text-sm text-muted-foreground">
            Nenhum cliente.
          </div>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="rounded-lg border border-navy-border bg-navy-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-white truncate">{c.nome}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.telefone || "—"} · {c.cidade || "—"}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Cad.: {dateBR(c.created_at)}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(c)} className="text-gold-2 hover:text-gold p-1" title="Editar cliente">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteClient(c); }} className="text-red-400 hover:text-red-300 p-1" title="Excluir cliente">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal onClose={closeModal} title={editingId ? "Editar cliente" : "Novo cliente"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome *">
              <Input value={form.nome ?? ""} onChange={(v) => setForm({ ...form, nome: v })} />
            </Field>
            <Field label="Telefone *">
              <Input
                value={form.telefone ?? ""}
                onChange={(v) => setForm({ ...form, telefone: v })}
              />
            </Field>
            <Field label="E-mail">
              <Input value={form.email ?? ""} onChange={(v) => setForm({ ...form, email: v })} />
            </Field>
            <Field label="CPF/CNPJ">
              <Input
                value={form.documento ?? ""}
                onChange={(v) => setForm({ ...form, documento: v })}
              />
            </Field>
            <Field label="Endereço *" span2>
              <Input
                value={form.endereco ?? ""}
                onChange={(v) => setForm({ ...form, endereco: v })}
              />
            </Field>
            <Field label="Cidade">
              <Input value={form.cidade ?? ""} onChange={(v) => setForm({ ...form, cidade: v })} />
            </Field>
            <Field label="Observações" span2>
              <Input
                value={form.observacoes ?? ""}
                onChange={(v) => setForm({ ...form, observacoes: v })}
              />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={closeModal} className="px-3 py-2 text-sm text-muted-foreground">
              Cancelar
            </button>
            <button
              onClick={save}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2"
            >
              {editingId ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Modal({
  children,
  onClose,
  title,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-5xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-lg border border-navy-border bg-navy-card p-5 shadow-2xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gold-2">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <label className={`text-xs ${span2 ? "col-span-2" : ""}`}>
      <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

export function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-navy-border bg-navy-surface px-3 py-2 text-sm outline-none focus:border-gold-dim"
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-navy-border bg-navy-surface px-3 py-2 text-sm outline-none focus:border-gold-dim"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
