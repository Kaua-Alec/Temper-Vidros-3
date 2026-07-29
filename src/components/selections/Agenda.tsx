import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { dateBR } from "@/lib/format";
import { Field, Input, Modal, Select } from "./Clientes";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { ClienteSelect, ClienteItem } from "../ClienteSelect";

type Agendamento = {
  id: string;
  titulo?: string;
  tipo?: string;
  cliente_nome?: string | null;
  endereco?: string | null;
  responsavel?: string | null;
  status?: string | null;
  data: string;
  hora?: string | null;
  observacoes?: string | null;
};

type AgendamentoForm = {
  tipo: string;
  status: string;
  data: string;
  hora: string;
  cliente_nome: string;
  responsavel: string;
  endereco: string;
  observacoes: string;
};

export function Agenda() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<Agendamento | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<ClienteItem | null>(null);

  const [form, setForm] = useState<AgendamentoForm>({
    tipo: "Instalação",
    status: "Agendado",
    data: new Date().toISOString().slice(0, 10),
    hora: "",
    cliente_nome: "",
    responsavel: "",
    endereco: "",
    observacoes: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setSelectedCliente(null);
    setForm({
      tipo: "Instalação",
      status: "Agendado",
      data: new Date().toISOString().slice(0, 10),
      hora: "",
      cliente_nome: "",
      responsavel: "",
      endereco: "",
      observacoes: "",
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

  const openEdit = (item: Agendamento) => {
    setEditingId(item.id);
    setSelectedCliente(item.cliente_nome ? ({ id: "", nome: item.cliente_nome, endereco: item.endereco } as ClienteItem) : null);
    setForm({
      tipo: item.tipo || "Instalação",
      status: item.status || "Agendado",
      data: item.data || new Date().toISOString().slice(0, 10),
      hora: item.hora || "",
      cliente_nome: item.cliente_nome || "",
      responsavel: item.responsavel || "",
      endereco: item.endereco || "",
      observacoes: item.observacoes || "",
    });
    setOpen(true);
  };

  const updateField = (field: keyof AgendamentoForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const load = async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true });
    setList((data as Agendamento[] | null) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!form.cliente_nome.trim()) {
      alert("Por favor, selecione ou informe o Cliente (obrigatório).");
      return;
    }
    if (!form.endereco.trim()) {
      alert("Por favor, preencha o Endereço (obrigatório).");
      return;
    }
    if (!form.data) {
      alert("Por favor, selecione a Data (obrigatória).");
      return;
    }

    // Auto-generate title based on Type and Client Name
    const autoTitulo = `${form.tipo} - ${form.cliente_nome}`;

    const payload = {
      titulo: autoTitulo,
      tipo: form.tipo,
      status: form.status,
      data: form.data,
      hora: form.hora || null,
      cliente_nome: form.cliente_nome,
      responsavel: form.responsavel || null,
      endereco: form.endereco,
      observacoes: form.observacoes || null,
    };

    if (editingId) {
      const { error } = await supabase.from("agendamentos").update(payload).eq("id", editingId);
      if (error) alert("Erro ao atualizar agendamento: " + error.message);
    } else {
      const { error } = await supabase.from("agendamentos").insert({ ...payload, criado_por: getUserName() });
      if (error) alert("Erro ao criar agendamento: " + error.message);
    }

    closeModal();
    void load();
  };

  const del = async (id: string) => {
    await supabase.from("agendamentos").delete().eq("id", id);
    setDeleteItem(null);
    void load();
  };

  const grouped = list.reduce<Record<string, Agendamento[]>>((acc, item) => {
    if (!acc[item.data]) acc[item.data] = [];
    acc[item.data].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <ConfirmDeleteModal
        open={!!deleteItem}
        title="Excluir Agendamento?"
        description={deleteItem ? `O agendamento de "${deleteItem.cliente_nome || deleteItem.titulo}" será excluído.` : undefined}
        onConfirm={() => {
          if (deleteItem) void del(deleteItem.id);
        }}
        onClose={() => setDeleteItem(null)}
      />

      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2 shadow transition"
        >
          <Plus className="h-4 w-4" />
          Novo agendamento
        </button>
      </div>

      <div className="space-y-4">
        {Object.keys(grouped)
          .sort()
          .map((dt) => (
            <div key={dt} className="rounded-lg border border-navy-border bg-navy-card overflow-hidden">
              <div className="border-b border-navy-border bg-navy-surface px-4 py-2 text-sm font-semibold text-gold-2">
                {dateBR(dt)}
              </div>
              <div className="divide-y divide-navy-border">
                {grouped[dt].map((a) => (
                  <div key={a.id} className="flex items-start justify-between p-3 hover:bg-navy-surface/40 transition">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {a.hora ? `${a.hora.slice(0, 5)} · ` : ""}
                        {a.cliente_nome || a.titulo}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span className="text-gold-2 font-medium">{a.tipo}</span>
                        {a.endereco ? ` · ${a.endereco}` : ""}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Resp.: {a.responsavel || "—"} · <span className="font-semibold text-slate-300">{a.status}</span>
                      </div>
                      {a.observacoes && (
                        <div className="mt-1 text-[11px] text-muted-foreground/80 italic">
                          Obs: {a.observacoes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(a)}
                        title="Editar agendamento"
                        className="p-1.5 text-gold-2 hover:bg-gold/10 rounded transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(a)}
                        title="Excluir agendamento"
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        {list.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground border border-navy-border rounded-lg bg-navy-card">
            Nenhum agendamento cadastrado.
          </div>
        )}
      </div>

      {open && (
        <Modal onClose={closeModal} title={editingId ? "Editar agendamento" : "Novo agendamento"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Cliente *" span2>
              <ClienteSelect
                label=""
                required
                selectedCliente={selectedCliente}
                selectedNome={form.cliente_nome}
                onSelectCliente={(c) => {
                  setSelectedCliente(c);
                  setForm((prev) => ({
                    ...prev,
                    cliente_nome: c.nome,
                    endereco: c.endereco || c.endereco_completo || prev.endereco,
                  }));
                }}
              />
            </Field>

            <Field label="Tipo">
              <Select
                value={form.tipo}
                onChange={updateField("tipo")}
                options={["Instalação", "Medição", "Entrega", "Visita técnica", "Manutenção", "Outro"]}
              />
            </Field>

            <Field label="Status">
              <Select
                value={form.status}
                onChange={updateField("status")}
                options={["Agendado", "Confirmado", "Concluído", "Cancelado"]}
              />
            </Field>

            <Field label="Data *">
              <Input type="date" value={form.data} onChange={updateField("data")} />
            </Field>

            <Field label="Hora">
              <Input type="time" value={form.hora ?? ""} onChange={updateField("hora")} />
            </Field>

            <Field label="Responsável">
              <Input value={form.responsavel ?? ""} onChange={updateField("responsavel")} placeholder="Nome do técnico/equipe" />
            </Field>

            <Field label="Endereço *" span2>
              <Input
                value={form.endereco ?? ""}
                onChange={updateField("endereco")}
                placeholder="Rua, número, bairro, cidade..."
              />
            </Field>

            <Field label="Observações" span2>
              <Input value={form.observacoes ?? ""} onChange={updateField("observacoes")} placeholder="Anotações internas..." />
            </Field>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={closeModal} className="px-3 py-2 text-sm text-muted-foreground hover:text-white">
              Cancelar
            </button>
            <button
              onClick={save}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2 transition"
            >
              {editingId ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
