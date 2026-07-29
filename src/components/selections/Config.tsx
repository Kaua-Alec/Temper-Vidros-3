import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { Field, Input, Modal, Select } from "./Clientes";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

type TabId = "catalogo" | "calculos" | "sistema";

type CatalogoProduto = {
  id?: string;
  nome: string;
  categoria: string;
  descricao?: string | null;
  unidade: string;
  preco_m2?: number | null;
  preco_unitario?: number | null;
  espessura?: string | null;
  cor?: string | null;
  num_folhas?: number | null;
  largura_mm?: number | null;
  altura_mm?: number | null;
  margem_lucro?: number | null;
  ativo: boolean;
};

export function Config() {
  const [tab, setTab] = useState<TabId>("catalogo");
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "catalogo", label: "Catálogo de produtos" },
    { id: "calculos", label: "Catálogo de cálculos" },
    { id: "sistema", label: "Sistema" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-navy-border overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${tab === id ? "border-gold text-gold-2" : "border-transparent text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "catalogo" && <Catalogo isCalculo={false} />}
      {tab === "calculos" && <Catalogo isCalculo={true} />}
      {tab === "sistema" && <Sistema />}
    </div>
  );
}

function Catalogo({ isCalculo = false }: { isCalculo?: boolean }) {
  const [list, setList] = useState<CatalogoProduto[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<CatalogoProduto | null>(null);
  const [form, setForm] = useState<Partial<CatalogoProduto>>({ 
    unidade: isCalculo ? "un" : "m²", 
    ativo: true,
    categoria: isCalculo ? "Cálculo" : ""
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
      unidade: isCalculo ? "un" : "m²", 
      ativo: true,
      categoria: isCalculo ? "Cálculo" : ""
    });
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (produto: CatalogoProduto) => {
    setEditingId(produto.id ?? null);
    setForm({
      ...produto,
      unidade: produto.unidade ?? (isCalculo ? "un" : "m²"),
      ativo: produto.ativo ?? true,
      categoria: isCalculo ? "Cálculo" : (produto.categoria ?? ""),
    });
    setOpen(true);
  };

  const load = async () => {
    let query = supabase.from("catalogo_produtos").select("*");
    if (isCalculo) {
      query = query.eq("categoria", "Cálculo");
    } else {
      query = query.neq("categoria", "Cálculo");
    }
    const { data } = await query.order("categoria").order("nome");
    setList((data as CatalogoProduto[] | null) ?? []);
  };

  useEffect(() => {
    void load();
  }, [isCalculo]);

  const save = async () => {
    const categoriaFinal = isCalculo ? "Cálculo" : form.categoria;
    if (!form.nome || !categoriaFinal) return;

    const payload = {
      nome: form.nome,
      categoria: categoriaFinal,
      descricao: form.descricao,
      unidade: form.unidade ?? (isCalculo ? "un" : "m²"),
      preco_m2: (form.largura_mm || form.altura_mm) ? null : (form.preco_m2 ? Number(form.preco_m2) : null),
      preco_unitario: form.preco_unitario ? Number(form.preco_unitario) : null,
      espessura: form.espessura,
      cor: form.cor,
      num_folhas: form.num_folhas ? Number(form.num_folhas) : null,
      largura_mm: form.largura_mm ? Number(form.largura_mm) : null,
      altura_mm: form.altura_mm ? Number(form.altura_mm) : null,
      margem_lucro: form.margem_lucro != null && form.margem_lucro !== undefined ? Number(form.margem_lucro) : null,
      ativo: form.ativo ?? true,
    };

    if (editingId) {
      await supabase.from("catalogo_produtos").update(payload).eq("id", editingId);
    } else {
      await supabase.from("catalogo_produtos").insert(payload);
    }

    resetForm();
    setOpen(false);
    void load();
  };

  const del = async (id: string) => {
    await supabase.from("catalogo_produtos").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-3">
      <ConfirmDeleteModal
        open={!!deleteItem}
        title="Você tem certeza que vai deletar?"
        description={deleteItem ? `O item "${deleteItem.nome}" será removido do catálogo.` : undefined}
        onConfirm={() => {
          if (deleteItem?.id) void del(deleteItem.id);
        }}
        onClose={() => setDeleteItem(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {isCalculo 
            ? "Cálculos e serviços usados para criar orçamentos."
            : "Produtos usados para criar orçamentos. Já vem preenchido com produtos comuns de vidraçaria."}
        </p>
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          {isCalculo ? "Novo cálculo" : "Novo produto"}
        </button>
      </div>

      {/* Tabela — desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-navy-border bg-navy-card">
        <table className="w-full text-sm">
          <thead className="bg-navy-surface uppercase text-xs text-muted-foreground">
            <tr>
              {!isCalculo && <th className="p-3 text-left">Categoria</th>}
              <th className="p-3 text-left">{isCalculo ? "Nome do cálculo" : "Produto"}</th>
              <th className="p-3 text-left">Especificação</th>
              <th className="p-3 text-right">Preço</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={isCalculo ? 4 : 5} className="p-6 text-center text-muted-foreground text-xs">
                  {isCalculo ? "Nenhum cálculo cadastrado." : "Nenhum produto cadastrado."}
                </td>
              </tr>
            )}
            {list.map((p) => (
              <tr key={p.id} className="border-t border-navy-border">
                {!isCalculo && <td className="p-3 text-xs text-gold-2">{p.categoria}</td>}
                <td className="p-3 font-medium">{p.nome}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {[
                    p.espessura,
                    p.cor,
                    p.num_folhas ? `${p.num_folhas}F` : null,
                    (p.largura_mm && p.altura_mm) ? `${p.altura_mm}×${p.largura_mm}mm` : null,
                  ].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="p-3 text-right">
                  {p.preco_m2
                    ? `${brl(p.preco_m2)}/m²`
                    : p.preco_unitario
                      ? `${brl(p.preco_unitario)}/un`
                      : "—"}
                  {p.margem_lucro ? <span className="ml-1.5 text-[10px] text-[color:var(--gold)] font-semibold">+{p.margem_lucro}%</span> : null}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="text-gold-2">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteItem(p)} className="text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {list.length === 0 && (
          <div className="rounded-lg border border-navy-border bg-navy-card p-6 text-center text-xs text-muted-foreground">
            {isCalculo ? "Nenhum cálculo cadastrado." : "Nenhum produto cadastrado."}
          </div>
        )}
        {list.map((p) => (
          <div key={p.id} className="rounded-lg border border-navy-border bg-navy-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {!isCalculo && <div className="text-[10px] text-gold-2 uppercase tracking-wider">{p.categoria}</div>}
                <div className="font-semibold text-sm text-white mt-0.5">{p.nome}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {[
                    p.espessura,
                    p.cor,
                    p.num_folhas ? `${p.num_folhas}F` : null,
                    (p.largura_mm && p.altura_mm) ? `${p.altura_mm}×${p.largura_mm}mm` : null,
                  ].filter(Boolean).join(" · ") || "—"}
                </div>
                <div className="text-sm text-gold-2 mt-1">
                  {p.preco_m2 ? `${brl(p.preco_m2)}/m²` : p.preco_unitario ? `${brl(p.preco_unitario)}/un` : "—"}
                  {p.margem_lucro ? <span className="ml-1.5 text-[10px] text-[color:var(--gold)] font-semibold">+{p.margem_lucro}%</span> : null}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="text-gold-2 p-1"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setDeleteItem(p)} className="text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal
          onClose={() => {
            setOpen(false);
            resetForm();
          }}
          title={editingId 
            ? (isCalculo ? "Editar cálculo" : "Editar produto") 
            : (isCalculo ? "Novo cálculo" : "Novo produto")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome *" span2>
              <Input value={form.nome ?? ""} onChange={(v) => setForm({ ...form, nome: v })} />
            </Field>
            {!isCalculo && (
              <Field label="Categoria *">
                <Select
                  value={form.categoria ?? ""}
                  onChange={(v) => setForm({ ...form, categoria: v })}
                  options={[
                    "",
                    "Fechamento de Pia",
                    "Espelho",
                    "Box",
                    "Janela",
                    "Porta",
                    "Multi Portas",
                    "Porta com Bandeira",
                    "Báscula",
                    "Pivotante",
                    "Guarda-corpo",
                    "Ferragem",
                    "Perfil",
                    "Acessório",
                    "Serviço",
                    "Tampo de Mesa",
                    "Vidro Comum",
                    "Outro",
                  ]}
                />
              </Field>
            )}
            <Field label="Unidade">
              <Select
                value={form.unidade ?? "m²"}
                onChange={(v) => setForm({ ...form, unidade: v })}
                options={["m²", "un", "m", "kg", "kit"]}
              />
            </Field>
            <Field label="Espessura">
              <Select
                value={form.espessura ?? ""}
                onChange={(v) => setForm({ ...form, espessura: v })}
                options={["", "3mm", "4mm", "5mm", "6mm", "8mm", "10mm", "12mm", "15mm", "19mm"]}
              />
            </Field>
            <Field label="Cor">
              <Select
                value={form.cor ?? ""}
                onChange={(v) => setForm({ ...form, cor: v })}
                options={[
                  "",
                  "Incolor",
                  "Fumê",
                  "Bronze",
                  "Verde",
                  "Azul",
                  "Preto",
                  "Branco",
                  "Refletivo",
                  "Jateado",
                  "Acidato",
                  "Espelhado",
                ]}
              />
            </Field>
            {/* Folhas e Dimensões padrão — só para Janela, Porta, Box, Báscula, Pivotante e Fechamento de Pia */}
            {(form.categoria === "Fechamento de Pia" || form.categoria === "Janela" || form.categoria === "Porta" || form.categoria === "Box" || form.categoria === "Báscula" || form.categoria === "Pivotante" || form.categoria === "Multi portas" || form.categoria === "Porta com bandeira") && (
              <>
                <Field label="Número de Folhas">
                  <Select
                    value={String(form.num_folhas ?? "")}
                    onChange={(v) => setForm({ ...form, num_folhas: v ? Number(v) : null })}
                    options={["", "2", "3", "4", "6", "8"]}
                  />
                </Field>
                <Field label="">
                  <div />
                </Field>
                <div className="col-span-2 border-t border-navy-border pt-3">
                  <div className="text-[11px] text-gold-2 font-semibold uppercase tracking-wider mb-2">Medida padrão (tamanho fixo)</div>
                  <div className="text-[10px] text-muted-foreground mb-3">
                    Deixe em branco para calcular por m². Preencha a medida e o preço unitário para criar um item de tamanho fixo com valor definido.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Altura (mm)">
                      <Input
                        type="number"
                        value={form.altura_mm ?? ""}
                        onChange={(v) => setForm({ ...form, altura_mm: v ? Number(v) : null })}
                      />
                    </Field>
                    <Field label="Largura (mm)">
                      <Input
                        type="number"
                        value={form.largura_mm ?? ""}
                        onChange={(v) => setForm({ ...form, largura_mm: v ? Number(v) : null })}
                      />
                    </Field>
                  </div>
                </div>
              </>
            )}
            {/* Preços */}
            {!(form.largura_mm && form.altura_mm) && (
              <Field label="Preço por m²">
                <Input
                  type="number"
                  value={form.preco_m2 ?? ""}
                  onChange={(v) => setForm({ ...form, preco_m2: Number(v) || null })}
                />
              </Field>
            )}
            <Field label={(form.largura_mm && form.altura_mm) ? "Preço total da peça (R$) *" : "Preço unitário"}>
              <Input
                type="number"
                value={form.preco_unitario ?? ""}
                onChange={(v) => setForm({ ...form, preco_unitario: Number(v) || null })}
              />
            </Field>
            {/* Margem de Lucro */}
            <div className="col-span-2 border-t border-navy-border pt-3">
              <div className="text-[11px] text-gold-2 font-semibold uppercase tracking-wider mb-2">Margem de Lucro</div>
              <div className="text-[10px] text-muted-foreground mb-3">
                Percentual adicionado automaticamente sobre o preço ao gerar o orçamento. Deixe em branco para não aplicar margem.
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <Field label="Margem de lucro (%)">
                  <div className="relative">
                    <Input
                      type="number"
                      value={form.margem_lucro ?? ""}
                      onChange={(v) => setForm({ ...form, margem_lucro: v !== "" ? Number(v) : null })}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[color:var(--gold)] font-bold pointer-events-none">%</span>
                  </div>
                </Field>
                {form.margem_lucro != null && form.margem_lucro > 0 && (form.preco_m2 || form.preco_unitario) && (
                  <div className="text-[11px] text-[color:var(--muted-foreground)] pb-1.5">
                    Preço base: <strong className="text-white">{brl(form.preco_m2 ?? form.preco_unitario ?? 0)}</strong><br />
                    Com {form.margem_lucro}% lucro: <strong className="text-[color:var(--gold-2)]">{brl((form.preco_m2 ?? form.preco_unitario ?? 0) * (1 + form.margem_lucro / 100))}</strong>
                  </div>
                )}
              </div>
            </div>
            <Field label="Descrição" span2>
              <Input
                value={form.descricao ?? ""}
                onChange={(v) => setForm({ ...form, descricao: v })}
              />
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="px-3 py-2 text-sm text-muted-foreground"
            >
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

function Sistema() {
  return (
    <div className="rounded-lg border border-navy-border bg-navy-card p-6 space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gold-2">Multiusuário</h3>
        <p className="text-xs text-muted-foreground">
          O sistema funciona sem login. Cada pessoa se identifica pelo nome ao entrar. Todos os
          dados são compartilhados em tempo real via banco de dados na nuvem. Use o chat no canto
          inferior direito para comunicação entre a equipe.
        </p>
      </div>
      <div className="hidden">
        <h3 className="mb-1 text-sm font-semibold text-gold-2">Backup dos dados</h3>
        <p className="text-xs text-muted-foreground">
          Use o botão "Baixar dados (.zip)" no topo para exportar todos os dados em JSON e CSV.
          Recomendado fazer semanalmente.
        </p>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-semibold text-gold-2">Fluxo do orçamento</h3>
        <p className="text-xs text-muted-foreground">
          Quando um orçamento é marcado como "Aprovado", o sistema cria automaticamente um Pedido na
          produção e um lançamento em Contas a Receber.
        </p>
      </div>
    </div>
  );
}
