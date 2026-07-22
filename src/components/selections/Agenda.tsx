import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { dateBR } from "@/lib/format";
import { Field, Input, Modal, Select } from "./Clientes";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

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
  titulo: string;
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
  const [deleteItem, setDeleteItem] = useState<Agendamento | null>(null);
  const [form, setForm] = useState<AgendamentoForm>({
    titulo: "",
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
    setForm({
      titulo: "",
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
    if (!form.titulo || !form.data) return;
    await supabase.from("agendamentos").insert({ ...form, criado_por: getUserName() });
    closeModal();
    void load();
  };

  const del = async (id: string) => {
    await supabase.from("agendamentos").delete().eq("id", id);
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
        title="Você tem certeza que vai deletar?"
        description={deleteItem ? `O agendamento "${deleteItem.titulo}" será excluído.` : undefined}
        onConfirm={() => {
          if (deleteItem) void del(deleteItem.id);
        }}
        onClose={() => setDeleteItem(null)}
      />

      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2"
        >
          <Plus className="h-4 w-4" />
          Novo agendamento
        </button>
      </div>

      <div className="space-y-4">
        {Object.keys(grouped)
          .sort()
          .map((dt) => (
            <div key={dt} className="rounded-lg border border-navy-border bg-navy-card">
              <div className="border-b border-navy-border bg-navy-surface px-4 py-2 text-sm font-semibold text-gold-2">
                {dateBR(dt)}
              </div>
              <div className="divide-y divide-navy-border">
                {grouped[dt].map((a) => (
                  <div key={a.id} className="flex items-start justify-between p-3">
                    <div>
                      <div className="text-sm font-medium">
                        {a.hora ? `${a.hora.slice(0, 5)} · ` : ""}
                        {a.titulo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.tipo} · {a.cliente_nome || "—"} {a.endereco ? `· ${a.endereco}` : ""}
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        Resp.: {a.responsavel || "—"} · {a.status}
                      </div>
                    </div>
                    <button onClick={() => setDeleteItem(a)} className="text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        {list.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sem agendamentos.</div>
        )}
      </div>

      {open && (
        <Modal onClose={closeModal} title="Novo agendamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Título *" span2>
              <Input value={form.titulo ?? ""} onChange={updateField("titulo")} />
            </Field>
            <Field label="Tipo">
              <Select
                value={form.tipo}
                onChange={updateField("tipo")}
                options={["Instalação", "Medição", "Entrega", "Visita técnica", "Outro"]}
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
            <Field label="Cliente">
              <Input value={form.cliente_nome ?? ""} onChange={updateField("cliente_nome")} />
            </Field>
            <Field label="Responsável">
              <Input value={form.responsavel ?? ""} onChange={updateField("responsavel")} />
            </Field>
            <Field label="Endereço" span2>
              <Input value={form.endereco ?? ""} onChange={updateField("endereco")} />
            </Field>
            <Field label="Observações" span2>
              <Input value={form.observacoes ?? ""} onChange={updateField("observacoes")} />
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
              Salvar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
