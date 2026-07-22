import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { Field, Input, Modal, Select } from "./Clientes";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

type EstoqueItem = {
  id: string;
  material: string;
  categoria?: string | null;
  fornecedor?: string | null;
  unidade: string;
  quantidade: number | null;
  minimo: number | null;
  preco_unitario: number | null;
};

type EstoqueForm = {
  material: string;
  categoria: string;
  unidade: string;
  quantidade: string;
  minimo: string;
  preco_unitario: string;
  fornecedor: string;
};

export function Estoque() {
  const [list, setList] = useState<EstoqueItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<EstoqueItem | null>(null);
  const [form, setForm] = useState<EstoqueForm>({
    material: "",
    categoria: "",
    unidade: "un",
    quantidade: "",
    minimo: "",
    preco_unitario: "",
    fornecedor: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      material: "",
      categoria: "",
      unidade: "un",
      quantidade: "",
      minimo: "",
      preco_unitario: "",
      fornecedor: "",
    });
  };

  const updateField = (field: keyof EstoqueForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (item: EstoqueItem) => {
    setEditingId(item.id ?? null);
    setForm({
      material: item.material ?? "",
      categoria: item.categoria ?? "",
      unidade: item.unidade ?? "un",
      quantidade: item.quantidade?.toString() ?? "",
      minimo: item.minimo?.toString() ?? "",
      preco_unitario: item.preco_unitario?.toString() ?? "",
      fornecedor: item.fornecedor ?? "",
    });
    setOpen(true);
  };

  const load = async () => {
    const { data } = await supabase.from("estoque").select("*").order("material");
    setList((data as EstoqueItem[] | null) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!form.material) return;

    const payload = {
      material: form.material,
      categoria: form.categoria,
      unidade: form.unidade,
      quantidade: Number(form.quantidade || 0),
      minimo: Number(form.minimo || 0),
      preco_unitario: form.preco_unitario ? Number(form.preco_unitario) : null,
      fornecedor: form.fornecedor,
    };

    if (editingId) {
      await supabase.from("estoque").update(payload).eq("id", editingId);
    } else {
      await supabase.from("estoque").insert(payload);
    }

    resetForm();
    setOpen(false);
    void load();
  };

  const updQtd = async (id: string, q: number) => {
    await supabase.from("estoque").update({ quantidade: q }).eq("id", id);
    void load();
  };

  const del = async (id: string) => {
    await supabase.from("estoque").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-4">
      <ConfirmDeleteModal
        open={!!deleteItem}
        title="Você tem certeza que vai deletar?"
        description={deleteItem ? `O material "${deleteItem.material}" será removido do estoque.` : undefined}
        onConfirm={() => {
          if (deleteItem) void del(deleteItem.id);
        }}
        onClose={() => setDeleteItem(null)}
      />

      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2"
        >
          <Plus className="h-4 w-4" />
          Novo material
        </button>
      </div>

      {/* Tabela — desktop */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-navy-border bg-navy-card">
        <table className="w-full text-sm">
          <thead className="bg-navy-surface uppercase text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Material</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-left">Fornecedor</th>
              <th className="p-3 text-right">Qtd</th>
              <th className="p-3 text-right">Mínimo</th>
              <th className="p-3 text-right">Preço</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => {
              const baixo = Number(e.quantidade ?? 0) <= Number(e.minimo ?? 0);
              return (
                <tr key={e.id} className={`border-t border-navy-border ${baixo ? "bg-red-500/5" : ""}`}>
                  <td className="p-3 font-medium">{e.material}</td>
                  <td className="p-3 text-xs">{e.categoria || "—"}</td>
                  <td className="p-3 text-xs">{e.fornecedor || "—"}</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      value={e.quantidade ?? 0}
                      onChange={(ev) => void updQtd(e.id, Number(ev.target.value) || 0)}
                      className={`w-20 rounded border border-navy-border bg-transparent px-1 py-0.5 text-right ${baixo ? "text-red-400" : ""}`}
                    />{" "}
                    <span className="text-[10px] text-muted-foreground">{e.unidade}</span>
                  </td>
                  <td className="p-3 text-right text-xs text-muted-foreground">{e.minimo}</td>
                  <td className="p-3 text-right text-gold-2">{e.preco_unitario ? brl(e.preco_unitario) : "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(e)} className="text-gold-2"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteItem(e)} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
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
          <div className="rounded-lg border border-navy-border bg-navy-card p-6 text-center text-sm text-muted-foreground">
            Nenhum material.
          </div>
        )}
        {list.map((e) => {
          const baixo = Number(e.quantidade ?? 0) <= Number(e.minimo ?? 0);
          return (
            <div key={e.id} className={`rounded-lg border bg-navy-card p-4 ${baixo ? "border-red-500/40 bg-red-500/5" : "border-navy-border"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white">{e.material}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{e.categoria || "—"} · {e.fornecedor || "—"}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(e)} className="text-gold-2 p-1"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteItem(e)} className="text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Quantidade</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      value={e.quantidade ?? 0}
                      onChange={(ev) => void updQtd(e.id, Number(ev.target.value) || 0)}
                      className={`w-20 rounded border border-navy-border bg-transparent px-2 py-1 text-sm ${baixo ? "text-red-400" : ""}`}
                    />
                    <span className="text-[11px] text-muted-foreground">{e.unidade}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Mínimo</div>
                  <div className="text-sm mt-0.5">{e.minimo} {e.unidade}</div>
                </div>
                {e.preco_unitario && (
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Preço</div>
                    <div className="text-sm text-gold-2 mt-0.5">{brl(e.preco_unitario)}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <Modal onClose={closeModal} title={editingId ? "Editar material" : "Novo material"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Material *" span2>
              <Input value={form.material ?? ""} onChange={updateField("material")} />
            </Field>
            <Field label="Categoria">
              <Input value={form.categoria ?? ""} onChange={updateField("categoria")} />
            </Field>
            <Field label="Unidade">
              <Select
                value={form.unidade}
                onChange={updateField("unidade")}
                options={["un", "m²", "m", "kg", "kit", "br", "cx"]}
              />
            </Field>
            <Field label="Quantidade">
              <Input
                type="number"
                value={form.quantidade ?? ""}
                onChange={updateField("quantidade")}
              />
            </Field>
            <Field label="Mínimo">
              <Input
                type="number"
                value={form.minimo ?? ""}
                onChange={updateField("minimo")}
              />
            </Field>
            <Field label="Preço unit.">
              <Input
                type="number"
                value={form.preco_unitario ?? ""}
                onChange={updateField("preco_unitario")}
              />
            </Field>
            <Field label="Fornecedor">
              <Input value={form.fornecedor ?? ""} onChange={updateField("fornecedor")} />
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
