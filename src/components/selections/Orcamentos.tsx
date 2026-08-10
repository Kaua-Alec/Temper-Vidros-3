import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { brl, dateBR, genOrcamentoNumero } from "@/lib/format";
import { PrintTemplate } from "./PrintTemplate";
import { ProductDiagram } from "./ProductDiagram";
import { Modal, Field } from "./Clientes";
import { Plus, Trash2, Search, X, FileText, BookOpen, ClipboardList, User, Tag, PenTool } from "lucide-react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { ClienteSelect } from "../ClienteSelect";
import { SignaturePadModal } from "./SignaturePad";
import { AnimatePresence } from "framer-motion";
// @ts-ignore
import html2pdf from "html2pdf.js";

type Produto = { id: string; categoria: string; nome: string; descricao: string | null; unidade: string; preco_m2: number | null; preco_unitario: number | null; espessura: string | null; cor: string | null; num_folhas?: number | null; largura_mm?: number | null; altura_mm?: number | null; margem_lucro?: number | null };
type Item = { produto_id: string | null; nome: string; descricao: string; quantidade: number; largura_mm: number; altura_mm: number; espessura: string; cor: string; valor_unitario: number; subtotal: number };
type Orcamento = { id: string; numero: string; cliente_nome: string; status: string; validade: string; total: number; created_at: string; desconto?: number | null; observacoes?: string | null; forma_pagamento?: string | null; criado_por?: string | null; cliente_id?: string | null; assinatura_base64?: string | null; };
type OrcamentoItem = { id: string; nome: string; descricao?: string; espessura: string; cor: string; quantidade: number; largura_mm: number; altura_mm: number; subtotal: number };
type ClienteOption = { id: string; nome: string };

const STATUS = ["Pendente", "Aprovado", "Em produção", "Concluído", "Cancelado"];

export function Orcamentos() {
  const [list, setList] = useState<Orcamento[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<Orcamento | null>(null);
  const [editing, setEditing] = useState<Orcamento | null>(null);
  const [deleteOrc, setDeleteOrc] = useState<Orcamento | null>(null);

  const load = async () => {
    const { data } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
    setList((data as Orcamento[] | null) ?? []);
  };

  useEffect(() => { void load(); }, []);

  const handleExcluirOrc = async (id: string) => {
    await supabase.from("orcamento_itens").delete().eq("orcamento_id", id);
    await supabase.from("pedidos").delete().eq("orcamento_id", id);
    await supabase.from("financeiro").delete().eq("orcamento_id", id);
    const { error } = await supabase.from("orcamentos").delete().eq("id", id);
    if (error) alert("Erro ao excluir orçamento: " + error.message);
    setDeleteOrc(null);
    void load();
  };

  const filtered = list.filter((o) => {
    const matchStatus = filter === "Todos" || o.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      searchQuery === "" ||
      o.numero.toLowerCase().includes(searchLower) ||
      (o.cliente_nome || "").toLowerCase().includes(searchLower);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      <ConfirmDeleteModal
        open={!!deleteOrc}
        title="Excluir Orçamento?"
        description={deleteOrc ? `O orçamento ${deleteOrc.numero} será excluído permanentemente.` : undefined}
        onConfirm={() => { if (deleteOrc) void handleExcluirOrc(deleteOrc.id); }}
        onClose={() => setDeleteOrc(null)}
      />

      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {["Todos", ...STATUS].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`rounded-md border px-2.5 py-1 text-xs transition ${filter === s ? "border-[color:var(--gold)] bg-[color:var(--gold)] font-semibold text-[color:var(--navy-deep)]" : "border-[color:var(--navy-border)] text-[color:var(--muted-foreground)] hover:border-[color:var(--gold-dim)]"}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition whitespace-nowrap shadow-md shadow-[color:var(--gold)]/20 shrink-0">
            <Plus className="h-4 w-4" />
            Novo orçamento
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[color:var(--muted-foreground)]" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por número ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md text-sm text-white focus:border-[color:var(--gold-dim)] outline-none transition"
          />
        </div>
      </div>

      {/* Tabela desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] print:hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--navy-surface)] text-xs uppercase text-[color:var(--muted-foreground)]">
            <tr>
              <th className="p-3 text-left">Número</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Validade</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-[color:var(--muted-foreground)]">Nenhum orçamento.</td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} onClick={() => setDetalhe(o)} className="cursor-pointer border-t border-[color:var(--navy-border)] hover:bg-[color:var(--navy-surface)]/40 transition">
                <td className="p-3 font-medium">{o.numero}</td>
                <td className="p-3">{o.cliente_nome}</td>
                <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor(o.status)}`}>{o.status}</span></td>
                <td className="p-3 text-xs">{dateBR(o.validade)}</td>
                <td className="p-3 text-right font-semibold text-[color:var(--gold-2)]">{brl(o.total)}</td>
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setDeleteOrc(o)}
                    title="Excluir Orçamento"
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3 print:hidden">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-6 text-center text-sm text-[color:var(--muted-foreground)]">
            Nenhum orçamento.
          </div>
        )}
        {filtered.map((o) => (
          <div key={o.id} onClick={() => setDetalhe(o)} className="cursor-pointer rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-4 hover:border-[color:var(--gold-dim)] transition">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-white">{o.numero}</div>
                <div className="text-xs text-[color:var(--muted-foreground)] mt-0.5 truncate">{o.cliente_nome}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(o.status)}`}>{o.status}</span>
                <span className="text-sm font-semibold text-[color:var(--gold-2)]">{brl(o.total)}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[color:var(--muted-foreground)]">
              <span>Validade: {dateBR(o.validade)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOrc(o);
                }}
                className="text-red-400 hover:text-red-300 p-1"
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && <NovoOrcamento onClose={() => { setOpen(false); void load(); }} />}
      {editing && <NovoOrcamento orcamentoExistente={editing} onClose={() => { setEditing(null); void load(); }} />}
      {detalhe && <DetalheOrcamento orc={detalhe} onEdit={(orc) => { setDetalhe(null); setEditing(orc); }} onClose={() => { setDetalhe(null); void load(); }} />}
    </div>
  );
}

function statusColor(s: string) {
  return {
    Pendente: "bg-yellow-500/20 text-yellow-300",
    Aprovado: "bg-green-500/20 text-green-300",
    "Em produção": "bg-blue-500/20 text-blue-300",
    Concluído: "bg-[color:var(--gold)]/20 text-[color:var(--gold-2)]",
    Cancelado: "bg-red-500/20 text-red-300",
  }[s] ?? "bg-slate-500/20 text-slate-300";
}

// ─── OrcamentoForm ──────────────────────────────────────────────────────────

type OrcamentoFormProps = {
  title: string;
  clientes: ClienteOption[];
  catalogo: Produto[];
  clienteId: string;
  setClienteId: (v: string) => void;
  clienteNome: string;
  setClienteNome: (v: string) => void;
  validade: string;
  setValidade: (v: string) => void;
  pagamento: string;
  setPagamento: (v: string) => void;
  obs: string;
  setObs: (v: string) => void;
  desconto: number;
  setDesconto: (v: number) => void;
  itens: Item[];
  addProduto: (p: Produto) => void;
  update: (i: number, patch: Partial<Item>) => void;
  remove: (i: number) => void;
  onClose: () => void;
  onSave: () => void;
  saveLabel: string;
};

function OrcamentoForm({
  title, clientes, catalogo,
  clienteId, setClienteId, clienteNome, setClienteNome,
  validade, setValidade, pagamento, setPagamento,
  obs, setObs, desconto, setDesconto,
  itens, addProduto, update, remove,
  onClose, onSave, saveLabel,
}: OrcamentoFormProps) {
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todos");
  const [activeTab, setActiveTab] = useState<"dados" | "catalogo" | "itens">("dados");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const cats = useMemo(() => ["Todos", ...Array.from(new Set(catalogo.map((c) => c.categoria)))], [catalogo]);
  const filtCat = catalogo.filter(
    (p) => (cat === "Todos" || p.categoria === cat) && (!busca || p.nome.toLowerCase().includes(busca.toLowerCase()))
  );

  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - desconto);

  const inpCls = "w-full rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-3 py-2.5 text-sm text-white placeholder:text-[color:var(--muted-foreground)]/50 focus:border-[color:var(--gold-dim)] focus:outline-none focus:ring-1 focus:ring-[color:var(--gold-dim)]/30 transition";

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">{children}</div>
  );

  const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-[color:var(--navy-border)]">
      <div className="h-6 w-6 rounded-md bg-[color:var(--gold)]/15 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-[color:var(--gold)]" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold-dim)]">{children}</span>
    </div>
  );

  const mobileTabs = [
    { id: "dados" as const, label: "Dados", icon: User },
    { id: "catalogo" as const, label: "Catálogo", icon: BookOpen },
    { id: "itens" as const, label: "Itens", icon: ClipboardList, badge: itens.length > 0 ? itens.length : undefined },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ backgroundColor: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title="Você tem certeza que vai deletar?"
        description={deleteIndex !== null && itens[deleteIndex] ? `O item "${itens[deleteIndex].nome}" será removido.` : undefined}
        onConfirm={() => {
          if (deleteIndex !== null) {
            remove(deleteIndex);
            setDeleteIndex(null);
          }
        }}
        onClose={() => setDeleteIndex(null)}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[96vh] flex flex-col rounded-2xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)" }}
      >
        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[color:var(--navy-border)] bg-gradient-to-r from-[color:var(--navy-base)] to-[color:var(--navy-card)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/25 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-[color:var(--gold)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{title}</h2>
              <p className="text-[11px] text-[color:var(--muted-foreground)] mt-0.5">Preencha os dados e adicione produtos do catálogo</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-[color:var(--muted-foreground)] hover:bg-[color:var(--navy-surface)] hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MOBILE TAB BAR */}
        <div className="flex lg:hidden shrink-0 bg-[color:var(--navy-base)] border-b border-[color:var(--navy-border)]">
          {mobileTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition border-b-2 ${isActive ? "border-[color:var(--gold)] text-[color:var(--gold-2)] bg-[color:var(--navy-surface)]/30" : "border-transparent text-[color:var(--muted-foreground)] hover:text-white"}`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center ${isActive ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)]" : "bg-[color:var(--navy-surface)] text-[color:var(--gold-2)]"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">

          {/* COL 1: Dados */}
          <div className={`lg:w-[270px] shrink-0 border-r border-[color:var(--navy-border)] overflow-y-auto ${activeTab === "dados" ? "flex flex-col" : "hidden lg:flex lg:flex-col"}`}>
            <div className="p-5 space-y-5 flex-1">
              <SectionTitle icon={User}>Dados do Orçamento</SectionTitle>

              <div className="space-y-2.5">
                <ClienteSelect
                  label="Cliente"
                  required
                  selectedNome={clienteNome}
                  onSelectCliente={(c) => {
                    setClienteId(c.id);
                    setClienteNome(c.nome);
                  }}
                />
              </div>

              <div className="border-t border-[color:var(--navy-border)]/50" />

              <div className="space-y-3">
                <div>
                  <FieldLabel>Validade</FieldLabel>
                  <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} className={inpCls} />
                </div>
                <div>
                  <FieldLabel>Forma de Pagamento</FieldLabel>
                  <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} className={inpCls}>
                    {["À vista", "50% entrada", "2x sem juros", "3x sem juros", "4x sem juros", "5x sem juros", "6x sem juros", "10x com juros", "Personalizado"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Desconto (R$)</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={desconto}
                    onChange={(e) => setDesconto(Number(e.target.value) || 0)}
                    className={inpCls}
                  />
                </div>
              </div>

              <div className="border-t border-[color:var(--navy-border)]/50" />

              <div>
                <FieldLabel>Observações</FieldLabel>
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  rows={3}
                  placeholder="Anotações internas, condições especiais..."
                  className={`${inpCls} resize-none`}
                />
              </div>

              {/* Resumo mobile */}
              <div className="lg:hidden rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)]/30 p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold-dim)] mb-3">Resumo</div>
                <div className="flex justify-between text-xs text-[color:var(--muted-foreground)]">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{brl(subtotal)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-xs text-[color:var(--muted-foreground)]">
                    <span>Desconto</span>
                    <span className="text-red-400 font-medium">- {brl(desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[color:var(--navy-border)] pt-2">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-base font-bold text-[color:var(--gold-2)]">{brl(total)}</span>
                </div>
              </div>

              {/* Botões mobile */}
              <div className="lg:hidden flex flex-col gap-2">
                <button type="button" onClick={onSave} className="w-full rounded-xl bg-[color:var(--gold)] py-3 text-sm font-bold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition shadow-lg shadow-[color:var(--gold)]/20">
                  {saveLabel}
                </button>
                <button type="button" onClick={onClose} className="w-full rounded-xl border border-[color:var(--navy-border)] py-2.5 text-sm text-[color:var(--muted-foreground)] hover:text-white hover:border-[color:var(--navy-hover)] transition">
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          {/* COL 2: Catálogo */}
          <div className={`lg:w-[280px] shrink-0 border-r border-[color:var(--navy-border)] flex flex-col ${activeTab === "catalogo" ? "flex" : "hidden lg:flex"}`}>
            <div className="p-4 border-b border-[color:var(--navy-border)] space-y-3 shrink-0">
              <SectionTitle icon={BookOpen}>Catálogo</SectionTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] py-2 pl-8 pr-3 text-xs text-white placeholder:text-[color:var(--muted-foreground)]/50 focus:border-[color:var(--gold-dim)] focus:outline-none transition"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cats.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${cat === c ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)]" : "bg-[color:var(--navy-surface)] text-[color:var(--muted-foreground)] hover:text-white border border-[color:var(--navy-border)]"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filtCat.length === 0 && (
                <div className="py-12 text-center text-xs text-[color:var(--muted-foreground)]">
                  <div className="text-2xl mb-2">🔍</div>
                  Nenhum produto encontrado
                </div>
              )}
              {filtCat.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduto(p)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left hover:bg-[color:var(--navy-surface)] hover:border-[color:var(--navy-border)] transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-medium text-white group-hover:text-[color:var(--gold-2)] transition-colors">{p.nome}</div>
                    <div className="text-[10px] text-[color:var(--muted-foreground)] mt-0.5 truncate">
                      {p.categoria}{p.espessura ? ` · ${p.espessura}` : ""}{p.cor ? ` · ${p.cor}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] font-semibold text-[color:var(--gold-2)] bg-[color:var(--navy-surface)] group-hover:bg-[color:var(--navy-hover)] px-2 py-1 rounded-md border border-[color:var(--navy-border)] transition whitespace-nowrap">
                    {p.preco_m2 ? `${brl(p.preco_m2)}/m²` : p.preco_unitario ? `${brl(p.preco_unitario)}/un` : "—"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* COL 3: Itens */}
          <div className={`flex-1 flex flex-col min-w-0 ${activeTab === "itens" ? "flex" : "hidden lg:flex"}`}>
            <div className="px-5 py-3.5 border-b border-[color:var(--navy-border)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[color:var(--gold)]/15 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold-dim)]">Itens do Orçamento</span>
              </div>
              {itens.length > 0 && (
                <span className="rounded-full bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/25 px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--gold-2)]">
                  {itens.length} {itens.length === 1 ? "item" : "itens"}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {itens.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-[color:var(--navy-surface)] flex items-center justify-center border border-[color:var(--navy-border)]">
                    <Plus className="h-6 w-6 text-[color:var(--muted-foreground)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[color:var(--muted-foreground)]">Nenhum item adicionado</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]/60 mt-1">
                      {window.innerWidth >= 1024 ? "Clique em um produto no catálogo ao lado" : "Vá para a aba Catálogo e adicione produtos"}
                    </p>
                  </div>
                </div>
              )}

              {itens.map((it, i) => {
                const prod = catalogo.find((c) => c.id === it.produto_id);
                const isM2 = prod ? !!prod.preco_m2 : it.largura_mm > 0 && it.altura_mm > 0;
                const area = isM2 ? ((it.largura_mm / 1000) * (it.altura_mm / 1000)).toFixed(2) : null;

                return (
                  <div key={i} className="rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)]/20 hover:border-[color:var(--navy-hover)] transition-all">
                    <div className="p-3">
                      {/* Cabecalho do item */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="shrink-0 mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--navy-deep)] text-[8px] font-black text-[color:var(--muted-foreground)] border border-[color:var(--navy-border)]">
                            {i + 1}
                          </span>
                          <div className="min-w-0 pr-2">
                            <div className="font-medium text-xs text-white truncate leading-tight">{it.nome}</div>
                            {(it.espessura || it.cor) && (
                              <div className="text-[9px] text-[color:var(--muted-foreground)] mt-0.5">
                                {[it.espessura, it.cor].filter(Boolean).join(" · ")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <div className="text-[13px] font-bold text-[color:var(--gold-2)]">{brl(it.subtotal)}</div>
                          {isM2 && area && (
                            <div className="text-[9px] text-[color:var(--muted-foreground)] mt-0.5">
                              {area} m² / un
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Campos */}
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="flex-1 min-w-[50px]">
                          <div className="text-[8px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-semibold">Qtd</div>
                          <input
                            type="number"
                            min="1"
                            value={it.quantidade}
                            onChange={(e) => update(i, { quantidade: Number(e.target.value) || 1 })}
                            className="w-full rounded border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-2 py-1 text-center text-xs text-white focus:border-[color:var(--gold-dim)] focus:outline-none focus:ring-1 focus:ring-[color:var(--gold-dim)]/20 transition"
                          />
                        </div>
                        {isM2 ? (
                          <>
                            <div className="flex-1 min-w-[70px]">
                              <div className="text-[8px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-semibold">Larg (mm)</div>
                              <input
                                type="number"
                                min="1"
                                value={it.largura_mm}
                                onChange={(e) => update(i, { largura_mm: Number(e.target.value) || 0 })}
                                className="w-full rounded border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-2 py-1 text-center text-xs text-white focus:border-[color:var(--gold-dim)] focus:outline-none focus:ring-1 focus:ring-[color:var(--gold-dim)]/20 transition"
                              />
                            </div>
                            <div className="flex-1 min-w-[70px]">
                              <div className="text-[8px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-semibold">Alt (mm)</div>
                              <input
                                type="number"
                                min="1"
                                value={it.altura_mm}
                                onChange={(e) => update(i, { altura_mm: Number(e.target.value) || 0 })}
                                className="w-full rounded border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-2 py-1 text-center text-xs text-white focus:border-[color:var(--gold-dim)] focus:outline-none focus:ring-1 focus:ring-[color:var(--gold-dim)]/20 transition"
                              />
                            </div>
                            <div className="flex-1 min-w-[80px]">
                              <div className="text-[8px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-semibold">Unit. (R$)</div>
                              <input
                                type="number"
                                step="0.01"
                                value={it.valor_unitario.toFixed(2)}
                                readOnly
                                className="w-full rounded border border-[color:var(--navy-border)] bg-[color:var(--navy-deep)]/60 px-2 py-1 text-right text-xs text-[color:var(--muted-foreground)] cursor-not-allowed"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 min-w-[80px]">
                            <div className="text-[8px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-semibold">Unit. (R$)</div>
                            <input
                              type="number"
                              step="0.01"
                              value={it.valor_unitario}
                              onChange={(e) => update(i, { valor_unitario: Number(e.target.value) || 0, subtotal: (Number(e.target.value) || 0) * it.quantidade })}
                              className="w-full rounded border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-2 py-1 text-right text-xs text-white focus:border-[color:var(--gold-dim)] focus:outline-none focus:ring-1 focus:ring-[color:var(--gold-dim)]/20 transition"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteIndex(i)}
                          className="shrink-0 h-[26px] w-[26px] ml-1 mt-auto rounded flex items-center justify-center bg-[color:var(--navy-deep)] border border-[color:var(--navy-border)] text-[color:var(--muted-foreground)] hover:text-red-400 hover:border-red-500/30 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      {isM2 && area && (
                        <div className="mt-2 text-[9px] text-[color:var(--muted-foreground)] flex items-center justify-end gap-1">
                           Total M²: <span className="text-[color:var(--gold-2)] font-semibold">{(it.quantidade * parseFloat(area)).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer desktop */}
            <div className="hidden lg:block shrink-0 border-t border-[color:var(--navy-border)] bg-[color:var(--navy-base)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[color:var(--muted-foreground)] mb-0.5">Subtotal</div>
                    <div className="text-sm text-white font-medium">{brl(subtotal)}</div>
                  </div>
                  {desconto > 0 && (
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-[color:var(--muted-foreground)] mb-0.5">Desconto</div>
                      <div className="text-sm text-red-400 font-medium">- {brl(desconto)}</div>
                    </div>
                  )}
                  <div className="h-8 border-l border-[color:var(--navy-border)]" />
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[color:var(--muted-foreground)] mb-0.5">Total Geral</div>
                    <div className="text-xl font-bold text-[color:var(--gold-2)]" style={{ fontFamily: "var(--font-display)" }}>{brl(total)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-[color:var(--muted-foreground)] hover:text-white rounded-xl hover:bg-[color:var(--navy-surface)] transition">
                    Cancelar
                  </button>
                  <button type="button" onClick={onSave} className="rounded-xl bg-[color:var(--gold)] px-6 py-2.5 text-sm font-bold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition shadow-lg shadow-[color:var(--gold)]/15">
                    {saveLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Novo Orçamento ──────────────────────────────────────────────────────────

// Price calculation constants from the provided HTML layout
const PRECO_BASE_PRODUTO: Record<string, { nome: string; base: number }> = {
  jan2f: { nome: "Janela 2F de correr", base: 0.00037 },
  jan4f: { nome: "Janela 4F de correr", base: 0.00041 },
  porta: { nome: "Porta de correr 2F", base: 0.00052 },
  basculante: { nome: "Basculante", base: 0.00028 },
  fixo: { nome: "Fixo", base: 0.00022 },
};
const LINHA_FATOR: Record<string, number> = {
  suprema: 1, gold: 1.22, linha25: 0.88, linha30: 0.95,
  mega25: 0.92, temperado: 1.85, ecoline: 0.78,
};
const LINHA_NOMES: Record<string, string> = {
  suprema: "Suprema", gold: "Gold IV", linha25: "Linha 25",
  linha30: "Linha 30", mega25: "Mega 25", temperado: "Temperado", ecoline: "Ecoline",
};

type OrcItemNovo = { produto_id?: string | null; nome: string; sub: string; larg: number; alt: number; qtd: number; val: number; espessura?: string; cor?: string; ambiente?: string; cor_ferragem?: string; cor_vidro?: string; cor_aluminio?: string; imagem_url?: string; categoria?: string; num_folhas?: number };
type ClienteNovo = { id: string; nome: string; telefone?: string | null; endereco_completo?: string | null };

function iniciais(n: string) {
  return n.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}


function NovoOrcamento({ onClose, orcamentoExistente }: { onClose: () => void; orcamentoExistente?: Orcamento }) {
  const [numero] = useState(orcamentoExistente ? orcamentoExistente.numero : genOrcamentoNumero());
  const [statusOrc, setStatusOrc] = useState(orcamentoExistente ? orcamentoExistente.status : "Pendente");
  const [ocultarValores, setOcultarValores] = useState(false);
  const [ocultarMedidas, setOcultarMedidas] = useState(false);
  const [custoEstimado, setCustoEstimado] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfReadyUrl, setPdfReadyUrl] = useState<{ url: string, name: string } | null>(null);

  // Cliente
  const [clientes, setClientes] = useState<ClienteNovo[]>([]);
  const [clienteSel, setClienteSel] = useState<ClienteNovo | null>(
    orcamentoExistente ? ({ id: orcamentoExistente.cliente_id || "", nome: orcamentoExistente.cliente_nome } as ClienteNovo) : null
  );
  const [modalCliOpen, setModalCliOpen] = useState(false);
  const [buscaCli, setBuscaCli] = useState("");

  // Formulário produto
  const [origem, setOrigem] = useState<"catalogo" | "esquadria">("catalogo");
  const [catalogo, setCatalogo] = useState<Produto[]>([]);
  const [produtoSelId, setProdutoSelId] = useState<string>("");
  const [buscaProdConfig, setBuscaProdConfig] = useState("");

  const [linha, setLinha] = useState("suprema");
  const [produto, setProduto] = useState("jan2f");
  const [larg, setLarg] = useState(1200);
  const [alt, setAlt] = useState(1000);
  const [qtd, setQtd] = useState(1);
  const [cor, setCor] = useState("");
  const [vidro, setVidro] = useState("Incolor 4mm");
  const [arremate, setArremate] = useState("Sem arremate");
  const [contraMarco, setContraMarco] = useState("Sem contra marco");
  const [precoCustom, setPrecoCustom] = useState<number | null>(null);
  const [ambienteInput, setAmbienteInput] = useState("");
  const [corFerragemInput, setCorFerragemInput] = useState("");

  const [itens, setItens] = useState<OrcItemNovo[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Detalhes
  const [descontoPerc, setDescontoPerc] = useState(0);
  const [validade, setValidade] = useState(orcamentoExistente ? orcamentoExistente.validade : new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  const [pagamento, setPagamento] = useState(orcamentoExistente ? (orcamentoExistente.forma_pagamento || "À vista") : "À vista");
  const [obs, setObs] = useState(orcamentoExistente ? (orcamentoExistente.observacoes || "") : "");

  // Mobile tab
  const [activeTab, setActiveTab] = useState<"cliente" | "produto" | "itens" | "resumo">("cliente");

  const catalogoFiltradoConfig = useMemo(() => {
    if (!buscaProdConfig.trim()) return catalogo;
    const q = buscaProdConfig.toLowerCase();
    return catalogo.filter(
      (p) => p.nome.toLowerCase().includes(q) || (p.categoria && p.categoria.toLowerCase().includes(q))
    );
  }, [catalogo, buscaProdConfig]);

  useEffect(() => {
    supabase.from("clientes").select("id,nome,telefone,endereco_completo").order("nome")
      .then(({ data }) => setClientes((data as ClienteNovo[] | null) ?? []));

    supabase.from("catalogo_produtos").select("*").eq("ativo", true).order("categoria").order("nome")
      .then(({ data }) => {
        const list = (data as Produto[] | null) ?? [];
        setCatalogo(list);
      });

    if (orcamentoExistente) {
      supabase.from("orcamento_itens").select("*").eq("orcamento_id", orcamentoExistente.id).then(({ data }) => {
        if (data) {
          setItens(data.map((it: any) => ({
            produto_id: it.produto_id,
            nome: it.nome,
            sub: it.descricao || "",
            larg: it.largura_mm || 0,
            alt: it.altura_mm || 0,
            qtd: it.quantidade || 1,
            val: it.subtotal || 0,
            espessura: it.espessura || "",
            cor: it.cor || ""
          })));
        }
      });
    }
  }, [orcamentoExistente]);

  const clientesFiltrados = useMemo(() => {
    const q = buscaCli.toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(q) || (c.telefone ?? "").includes(q));
  }, [clientes, buscaCli]);

  const prodConfigSelecionado = useMemo(() => {
    return catalogo.find((p) => p.id === produtoSelId) || null;
  }, [catalogo, produtoSelId]);

  // Opções dinâmicas de vidro vindas das configurações do sistema
  const opcoesVidroSistema = useMemo(() => {
    const vidrosCatalogo = catalogo
      .filter((p) => p.categoria.toLowerCase().includes("vidro") || p.espessura)
      .map((p) => `${p.nome}${p.espessura ? ` (${p.espessura})` : ""}`);

    const padroes = ["Incolor 4mm", "Incolor 6mm", "Fumê 4mm", "Temperado 8mm", "Temperado 10mm"];
    return Array.from(new Set([...vidrosCatalogo, ...padroes]));
  }, [catalogo]);

  const valorCalculado = useMemo(() => {
    if (origem === "catalogo") {
      if (!prodConfigSelecionado) return 0;
      const margem = prodConfigSelecionado.margem_lucro ? (1 + prodConfigSelecionado.margem_lucro / 100) : 1;

      // Produto com medida padrão FIXA — usa preço unitário direto (preço total da peça)
      const temMedidaFixa = !!(prodConfigSelecionado.largura_mm && prodConfigSelecionado.altura_mm);
      if (temMedidaFixa) {
        const precoUnit = precoCustom !== null
          ? precoCustom
          : (prodConfigSelecionado.preco_unitario ?? 0);
        return precoUnit * margem * qtd;
      }

      const baseVal = precoCustom !== null
        ? precoCustom
        : (prodConfigSelecionado.preco_m2 ?? prodConfigSelecionado.preco_unitario ?? 0);

      if (prodConfigSelecionado.preco_m2) {
        const areaM2 = (larg / 1000) * (alt / 1000);
        return areaM2 * baseVal * margem * qtd;
      }
      return baseVal * margem * qtd;
    }

    // Esquadria modo simulador
    const p = PRECO_BASE_PRODUTO[produto];
    const base = p ? p.base : 0.00037;
    const fator = LINHA_FATOR[linha] || 1;
    return larg * alt * base * fator * qtd;
  }, [origem, prodConfigSelecionado, precoCustom, produto, linha, larg, alt, qtd]);

  const subtotalTotal = itens.reduce((acc, it) => acc + it.val, 0);
  const totalGeral = subtotalTotal * (1 - descontoPerc / 100);

  const handleAdd = () => {
    const metaParts: string[] = [];
    if (ambienteInput.trim()) metaParts.push(`Ambiente: ${ambienteInput.trim()}`);
    if (corFerragemInput.trim()) metaParts.push(`Cor ferragem: ${corFerragemInput.trim()}`);

    if (origem === "catalogo") {
      if (!prodConfigSelecionado) { alert("Selecione um produto do catálogo."); return; }
      const isM2 = !!prodConfigSelecionado.preco_m2;
      const precoUnit = precoCustom !== null
        ? precoCustom
        : (prodConfigSelecionado.preco_m2 ?? prodConfigSelecionado.preco_unitario ?? 0);

      const subDetalhes = [
        `Qtd: ${qtd}`,
        isM2 ? `${alt}×${larg}mm (${((larg / 1000) * (alt / 1000)).toFixed(2)}m²)` : null,
        prodConfigSelecionado.espessura || cor || prodConfigSelecionado.cor ? [prodConfigSelecionado.espessura, cor || prodConfigSelecionado.cor].filter(Boolean).join(" · ") : null,
        isM2 ? `${brl(precoUnit)}/m²` : `${brl(precoUnit)}/un`,
        ...metaParts
      ].filter(Boolean).join(" • ");

      setItens([...itens, {
        produto_id: prodConfigSelecionado.id,
        nome: prodConfigSelecionado.nome,
        sub: subDetalhes,
        larg: larg || prodConfigSelecionado.largura_mm || 0,
        alt: alt || prodConfigSelecionado.altura_mm || 0,
        qtd,
        val: valorCalculado,
        espessura: prodConfigSelecionado.espessura ?? "",
        cor: cor || (prodConfigSelecionado.cor ?? ""),
        ambiente: ambienteInput.trim() || undefined,
        cor_ferragem: corFerragemInput.trim() || undefined,
        categoria: prodConfigSelecionado.categoria || undefined,
      }]);
      setAmbienteInput("");
      setCorFerragemInput("");
      return;
    }

    const p = PRECO_BASE_PRODUTO[produto];
    const subSimul = [
      `Qtd: ${qtd}`,
      cor ? `${cor}` : null,
      vidro ? `${vidro}` : null,
      arremate !== "Sem arremate" ? `${arremate}` : null,
      contraMarco !== "Sem contra marco" ? `${contraMarco}` : null,
      ...metaParts
    ].filter(Boolean).join(" • ");

    setItens([...itens, {
      produto_id: null,
      nome: `${p?.nome ?? produto} — ${LINHA_NOMES[linha] ?? linha}`,
      sub: subSimul,
      larg, alt, qtd, val: valorCalculado,
      cor: cor,
      ambiente: ambienteInput.trim() || undefined,
      cor_ferragem: corFerragemInput.trim() || undefined,
    }]);
    setAmbienteInput("");
    setCorFerragemInput("");
  };

  const handleDownloadPdf = () => {
    if (window.innerWidth <= 768) {
      const element = document.getElementById("print-template");
      if (!element) return;
      setIsGeneratingPdf(true);
      const originalClasses = element.className;
      element.className = "bg-white text-[#000000] font-sans min-h-screen block w-[800px] fixed top-0 left-0 z-[-50]";
      
      const opt = {
        margin:       0.2,
        filename:     `Orcamento_${numero || 'SF'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.85 },
        html2canvas:  { scale: 1, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        element.className = originalClasses;
        setIsGeneratingPdf(false);
      }).catch((err: any) => {
        console.error(err);
        alert("Erro ao gerar PDF: " + err);
        element.className = originalClasses;
        setIsGeneratingPdf(false);
      });
    } else {
      window.print();
    }
  };

  const salvar = async () => {
    if (!clienteSel) { alert("Selecione um cliente."); return; }
    if (itens.length === 0) { alert("Adicione pelo menos um item."); return; }

    const desconto = subtotalTotal - totalGeral;
    let orcId = orcamentoExistente?.id;

    if (orcamentoExistente) {
      const { error } = await supabase.from("orcamentos").update({
        cliente_id: clienteSel.id,
        cliente_nome: clienteSel.nome,
        status: statusOrc,
        validade,
        forma_pagamento: pagamento,
        desconto,
        total: totalGeral,
        observacoes: obs,
      }).eq("id", orcamentoExistente.id);
      if (error) { alert(error.message); return; }
      await supabase.from("orcamento_itens").delete().eq("orcamento_id", orcamentoExistente.id);
    } else {
      const { data, error } = await supabase.from("orcamentos").insert({
        numero,
        cliente_id: clienteSel.id,
        cliente_nome: clienteSel.nome,
        status: statusOrc,
        validade,
        forma_pagamento: pagamento,
        desconto,
        total: totalGeral,
        observacoes: obs,
        criado_por: getUserName(),
      }).select().single();
      if (error) { alert(error.message); return; }
      orcId = data.id;
    }

    await supabase.from("orcamento_itens").insert(itens.map((it) => ({
      orcamento_id: orcId!,
      nome: it.nome,
      descricao: it.sub,
      quantidade: it.qtd,
      largura_mm: it.larg,
      altura_mm: it.alt,
      valor_unitario: it.val / it.qtd,
      subtotal: it.val,
      produto_id: it.produto_id ?? null,
      espessura: it.espessura ?? "",
      cor: it.cor ?? cor,
    })));

    if (statusOrc === "Aprovado") {
      const numPed = `PED-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
      await supabase.from("pedidos").insert({ numero: numPed, orcamento_id: orcId!, cliente_nome: clienteSel.nome, status: "Aguardando material", criado_por: getUserName() });
      await supabase.from("financeiro").insert({ tipo: "Receita", descricao: `Orçamento ${numero}`, orcamento_id: orcId!, cliente_nome: clienteSel.nome, valor: totalGeral, status: "Pendente", vencimento: validade });
    }
    onClose();
  };

  const inpCls = "w-full bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-2.5 py-1.5 text-[13px] text-white outline-none focus:border-[color:var(--gold-dim)] transition";
  const secLabel = "text-[10px] font-medium text-[color:var(--gold)] uppercase tracking-wider flex items-center gap-1.5 mb-2.5";
  const secBar = "before:content-[''] before:inline-block before:w-3 before:h-[1.5px] before:bg-[color:var(--gold)] before:rounded";

  const mobileTabs = [
    { id: "cliente" as const, label: "Cliente", icon: User },
    { id: "produto" as const, label: "Produto", icon: BookOpen },
    { id: "itens" as const, label: "Itens", icon: ClipboardList, badge: itens.length > 0 ? itens.length : undefined },
    { id: "resumo" as const, label: "Resumo", icon: FileText },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 print:hidden" style={{ backgroundColor: "rgba(4,10,18,0.82)", backdropFilter: "blur(6px)" }}>
      <ConfirmDeleteModal
        open={deleteIndex !== null}
        title="Você tem certeza que vai deletar?"
        description={deleteIndex !== null && itens[deleteIndex] ? `O item "${itens[deleteIndex].nome}" será removido.` : undefined}
        onConfirm={() => {
          if (deleteIndex !== null) {
            setItens(itens.filter((_, idx) => idx !== deleteIndex));
            setDeleteIndex(null);
          }
        }}
        onClose={() => setDeleteIndex(null)}
      />

      {/* Modal cliente */}
      {modalCliOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4" style={{ backgroundColor: "rgba(4,10,18,0.82)" }}>
          <div className="bg-[color:var(--navy-card)] border border-[color:var(--navy-border)] border-t-2 border-t-[color:var(--gold-dim)] rounded-xl p-4 w-full max-w-sm shadow-2xl">
            
            {/* Control State to toggle between searching and registering */}
            <ModalClienteContent 
              clientes={clientes}
              clientesFiltrados={clientesFiltrados}
              buscaCli={buscaCli}
              setBuscaCli={setBuscaCli}
              onSelect={(c) => {
                setClienteSel(c);
                setModalCliOpen(false);
                setBuscaCli("");
                setActiveTab("produto");
              }}
              onClose={() => setModalCliOpen(false)}
              iniciais={iniciais}
              onCreated={(newCli) => {
                // Add to client list state
                setClientes(prev => [newCli, ...prev]);
                // Select newly created client
                setClienteSel(newCli);
                setModalCliOpen(false);
                setActiveTab("produto");
              }}
            />

          </div>
        </div>
      )}
      <div className="bg-[color:var(--navy-base)] border border-[color:var(--navy-border)] rounded-2xl w-full max-w-[980px] flex flex-col max-h-[94vh] overflow-hidden shadow-2xl">

        {/* Topbar */}
        <div className="bg-[color:var(--navy-deep)] px-4 py-3 flex items-center justify-between border-b border-[color:var(--gold-dim)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onClose} className="flex items-center gap-1 text-[11px] text-[color:var(--muted-foreground)] hover:text-[color:var(--gold-2)] transition shrink-0">
              <X className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Orçamentos</span>
            </button>
            <div className="w-[1px] h-4 bg-[color:var(--navy-border)] hidden sm:block" />
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-white truncate">{numero}</div>
              <div className="text-[10px] text-[color:var(--muted-foreground)]">Novo orçamento</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer mr-1 border border-[color:var(--navy-border)] px-2 py-1.5 rounded-lg text-[10px] sm:text-[12px] text-[color:var(--muted-foreground)] hover:text-white transition">
              <input type="checkbox" checked={ocultarMedidas} onChange={(e) => setOcultarMedidas(e.target.checked)} className="accent-[color:var(--gold)]" />
              <span className="hidden sm:inline">Ocultar Medidas</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer mr-1 border border-[color:var(--navy-border)] px-2 py-1.5 rounded-lg text-[10px] sm:text-[12px] text-[color:var(--muted-foreground)] hover:text-white transition">
              <input type="checkbox" checked={ocultarValores} onChange={(e) => setOcultarValores(e.target.checked)} className="accent-[color:var(--gold)]" />
              <span className="hidden sm:inline">Ocultar Preços</span>
            </label>
            <button type="button" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="flex items-center gap-1 border border-[color:var(--navy-border)] hover:border-[color:var(--gold-dim)] hover:text-[color:var(--gold-2)] text-[color:var(--muted-foreground)] px-2.5 py-1.5 rounded-lg text-[11px] sm:text-[12px] disabled:opacity-50 transition">
              <FileText className="h-3.5 w-3.5" /> {isGeneratingPdf ? "Gerando..." : "PDF"}
            </button>
            <button type="button" className="flex items-center gap-1 border border-[color:var(--navy-border)] hover:border-[color:var(--gold-dim)] hover:text-[color:var(--gold-2)] text-[color:var(--muted-foreground)] px-2.5 py-1.5 rounded-lg text-[11px] xs:text-[12px] transition">
              <Tag className="h-3.5 w-3.5" /> Enviar
            </button>
            <button type="button" onClick={salvar} className="flex items-center gap-1 bg-[color:var(--gold)] text-[color:var(--navy-deep)] px-2.5 py-1.5 rounded-lg text-[11px] xs:text-[12px] font-semibold hover:bg-[color:var(--gold-2)] transition">
              <Plus className="h-3.5 w-3.5" /> <span>Salvar</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden shrink-0 bg-[color:var(--navy-deep)] border-b border-[color:var(--navy-border)]">
          {mobileTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition border-b-2 ${isActive ? "border-[color:var(--gold)] text-[color:var(--gold-2)] bg-[color:var(--navy-surface)]/30" : "border-transparent text-[color:var(--muted-foreground)] hover:text-white"}`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center ${isActive ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)]" : "bg-[color:var(--navy-surface)] text-[color:var(--gold-2)]"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto md:border-r border-[color:var(--navy-border)] bg-[color:var(--navy-base)]">

            {/* ── CLIENTE ── */}
            <div className={`p-4 ${activeTab === "cliente" ? "block" : "hidden md:block"}`}>
              <div className="bg-[color:var(--navy-card)] border border-[color:var(--navy-border)] rounded-xl p-3.5 space-y-2">
                <ClienteSelect
                  label="Cliente"
                  required
                  selectedCliente={clienteSel ? {
                    id: clienteSel.id,
                    nome: clienteSel.nome,
                    telefone: clienteSel.telefone,
                    endereco: clienteSel.endereco_completo,
                    endereco_completo: clienteSel.endereco_completo
                  } : null}
                  selectedNome={clienteSel?.nome}
                  onSelectCliente={(c) => {
                    setClienteSel({
                      id: c.id,
                      nome: c.nome,
                      telefone: c.telefone,
                      endereco_completo: c.endereco || c.endereco_completo
                    });
                  }}
                />
                {clienteSel && (
                  <div className="text-xs text-[color:var(--muted-foreground)] bg-[color:var(--navy-surface)] p-2 rounded-lg border border-[color:var(--navy-border)]">
                    <span className="font-semibold text-white">{clienteSel.nome}</span>
                    {clienteSel.telefone && <div>Tel: {clienteSel.telefone}</div>}
                    {clienteSel.endereco_completo && <div>End: {clienteSel.endereco_completo}</div>}
                  </div>
                )}
              </div>

              {/* Botão avançar para próxima aba (mobile only) */}
              <button
                onClick={() => setActiveTab("produto")}
                className="mt-3 w-full md:hidden flex items-center justify-center gap-2 rounded-xl bg-[color:var(--navy-card)] border border-[color:var(--navy-border)] py-2.5 text-sm text-[color:var(--muted-foreground)] hover:text-white hover:border-[color:var(--gold-dim)] transition"
              >
                Próximo: Produto →
              </button>
            </div>

            {/* ── PRODUTO ── */}
            <div className={`px-4 pb-4 ${activeTab === "produto" ? "block" : "hidden md:block"}`}>
              <div className="bg-[color:var(--navy-card)] border border-[color:var(--navy-border)] rounded-xl p-3.5">
                <div className={`${secLabel} ${secBar}`}>Produto / Item</div>

                {/* Alternador de Origem: Catálogo do Sistema x Simulador */}
                <div className="flex bg-[color:var(--navy-surface)] p-1 rounded-lg border border-[color:var(--navy-border)] mb-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setOrigem("catalogo")}
                    className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      origem === "catalogo"
                        ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)] shadow"
                        : "text-[color:var(--muted-foreground)] hover:text-white"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Catálogo do Sistema ({catalogo.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrigem("esquadria")}
                    className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      origem === "esquadria"
                        ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)] shadow"
                        : "text-[color:var(--muted-foreground)] hover:text-white"
                    }`}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Simulador Esquadria
                  </button>
                </div>

                {origem === "catalogo" ? (
                  /* ── MODO CATÁLOGO DO SISTEMA ── */
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-[color:var(--muted-foreground)] flex items-center justify-between">
                        <span>Selecione o produto/serviço configurado</span>
                        {prodConfigSelecionado?.categoria && (
                          <span className="text-[10px] text-[color:var(--gold-2)] font-semibold uppercase">
                            {prodConfigSelecionado.categoria}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--muted-foreground)]" />
                        <input
                          type="text"
                          placeholder="Digite para filtrar produtos ou serviços..."
                          value={buscaProdConfig}
                          onChange={(e) => setBuscaProdConfig(e.target.value)}
                          className={`${inpCls} pl-8 py-2 text-xs`}
                        />
                        {buscaProdConfig && (
                          <button
                            type="button"
                            onClick={() => setBuscaProdConfig("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[color:var(--muted-foreground)] hover:text-white"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Lista de Produtos Resultados Visíveis */}
                      <div className="max-h-52 overflow-y-auto space-y-1 rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)]/40 p-1.5 mt-1">
                        {catalogoFiltradoConfig.length === 0 ? (
                          <div className="py-4 text-center text-xs text-[color:var(--muted-foreground)]">
                            Nenhum produto encontrado
                          </div>
                        ) : (
                          catalogoFiltradoConfig.map((p) => {
                            const isSelected = p.id === produtoSelId;
                            const preco = p.preco_m2
                              ? `${brl(p.preco_m2)}/m²`
                              : p.preco_unitario
                              ? `${brl(p.preco_unitario)}/un`
                              : "—";

                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setProdutoSelId(p.id);
                                  setPrecoCustom(null);
                                  if (p.largura_mm) setLarg(p.largura_mm);
                                  if (p.altura_mm) setAlt(p.altura_mm);
                                }}
                                className={`w-full text-left p-2 rounded-md transition flex items-center justify-between gap-2 border ${
                                  isSelected
                                    ? "bg-[color:var(--gold)]/15 border-[color:var(--gold)] text-white shadow-sm"
                                    : "border-transparent hover:bg-[color:var(--navy-surface)] hover:border-[color:var(--navy-border)] text-gray-200"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                                    <span>{p.nome}</span>
                                    {isSelected && (
                                      <span className="text-[9px] bg-[color:var(--gold)] text-[color:var(--navy-deep)] px-1.5 py-0.2 rounded font-bold">
                                        Selecionado
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[color:var(--muted-foreground)] truncate mt-0.5">
                                    {[p.categoria, p.espessura, p.cor].filter(Boolean).join(" · ")}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-bold text-[color:var(--gold-2)]">{preco}</div>
                                  {p.largura_mm && p.altura_mm && (
                                    <div className="text-[9px] text-[color:var(--muted-foreground)]">
                                      {p.altura_mm}×{p.largura_mm}mm
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {prodConfigSelecionado && (
                      <div className="bg-[color:var(--navy-surface)]/60 border border-[color:var(--navy-border)] rounded-lg p-2.5 text-xs flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="font-semibold text-white truncate">{prodConfigSelecionado.nome}</div>
                          <div className="text-[10px] text-[color:var(--muted-foreground)] truncate">
                            {[prodConfigSelecionado.categoria, prodConfigSelecionado.espessura, prodConfigSelecionado.cor, `Un: ${prodConfigSelecionado.unidade}`].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-[color:var(--gold-2)]">
                            {prodConfigSelecionado.preco_m2
                              ? `${brl(precoCustom ?? prodConfigSelecionado.preco_m2)}/m²`
                              : prodConfigSelecionado.preco_unitario
                              ? `${brl(precoCustom ?? prodConfigSelecionado.preco_unitario)}/un`
                              : "Sob consulta"}
                          </div>
                          <div className="text-[9px] text-[color:var(--muted-foreground)]">
                            {prodConfigSelecionado.margem_lucro ? `+${prodConfigSelecionado.margem_lucro}% Lucro` : "Config. Sistema"}
                          </div>
                        </div>
                      </div>
                    )}

                    {prodConfigSelecionado && (() => {
                      const temMedidaFixa = !!(prodConfigSelecionado.largura_mm && prodConfigSelecionado.altura_mm);
                      const temPrecoM2 = !!prodConfigSelecionado.preco_m2 && !temMedidaFixa;
                      return (
                        <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: temMedidaFixa ? '1fr 1fr 1fr' : temPrecoM2 ? '1fr 1fr 1fr' : '1fr 1fr' }}>
                          {temMedidaFixa ? (
                            <>
                              {/* Altura FIXA — read-only (altura primeiro) */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)] flex items-center gap-1">
                                  Altura
                                  <span className="text-[9px] bg-[color:var(--gold)]/15 text-[color:var(--gold)] px-1 rounded">fixo</span>
                                </label>
                                <div className={`${inpCls} opacity-60 cursor-not-allowed select-none`}>{prodConfigSelecionado.altura_mm} mm</div>
                              </div>
                              {/* Largura FIXA — read-only */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)] flex items-center gap-1">
                                  Largura
                                  <span className="text-[9px] bg-[color:var(--gold)]/15 text-[color:var(--gold)] px-1 rounded">fixo</span>
                                </label>
                                <div className={`${inpCls} opacity-60 cursor-not-allowed select-none`}>{prodConfigSelecionado.largura_mm} mm</div>
                              </div>
                              {/* Quantidade */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)]">Quantidade</label>
                                <input type="number" min="1" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={inpCls} />
                              </div>
                            </>
                          ) : temPrecoM2 ? (
                            <>
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)]">Altura (mm)</label>
                                <input type="number" min="1" value={alt} onChange={(e) => setAlt(Number(e.target.value))} className={inpCls} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)]">Largura (mm)</label>
                                <input type="number" min="1" value={larg} onChange={(e) => setLarg(Number(e.target.value))} className={inpCls} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)]">Quantidade</label>
                                <input type="number" min="1" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={inpCls} />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)]">Quantidade</label>
                                <input type="number" min="1" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={inpCls} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-[color:var(--muted-foreground)]">Preço Unitário (R$)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={precoCustom !== null ? precoCustom : (prodConfigSelecionado?.preco_unitario ?? 0)}
                                  onChange={(e) => setPrecoCustom(Number(e.target.value) || 0)}
                                  placeholder={prodConfigSelecionado?.preco_unitario ? String(prodConfigSelecionado.preco_unitario) : "0"}
                                  className={inpCls}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {prodConfigSelecionado && (
                      <div className="flex flex-col gap-1 mt-3">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Cor do alumínio (opcional)</label>
                        <select value={cor} onChange={(e) => setCor(e.target.value)} className={inpCls}>
                          <option value="">Selecione...</option>
                          <option>Preto</option>
                          <option>Fosco</option>
                          <option>Branco</option>
                          <option>Bronze</option>
                          <option>Natural</option>
                          <option>Brilhante</option>
                          <option>Prata</option>
                          <option>Dourado</option>
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── MODO SIMULADOR DE ESQUADRIA ── */
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Linha</label>
                        <select value={linha} onChange={(e) => setLinha(e.target.value)} className={inpCls}>
                          {Object.entries(LINHA_NOMES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Produto</label>
                        <select value={produto} onChange={(e) => setProduto(e.target.value)} className={inpCls}>
                          {Object.entries(PRECO_BASE_PRODUTO).map(([v, p]) => <option key={v} value={v}>{p.nome}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Altura (mm)</label>
                        <input type="number" min="100" value={alt} onChange={(e) => setAlt(Number(e.target.value))} className={inpCls} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Largura (mm)</label>
                        <input type="number" min="100" value={larg} onChange={(e) => setLarg(Number(e.target.value))} className={inpCls} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Quantidade</label>
                        <input type="number" min="1" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={inpCls} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Cor do alumínio</label>
                        <select value={cor} onChange={(e) => setCor(e.target.value)} className={inpCls}>
                          <option value="">Selecione...</option>
                          <option>Preto</option>
                          <option>Fosco</option>
                          <option>Branco</option>
                          <option>Bronze</option>
                          <option>Natural</option>
                          <option>Brilhante</option>
                          <option>Prata</option>
                          <option>Dourado</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Tipo de vidro</label>
                        <select value={vidro} onChange={(e) => setVidro(e.target.value)} className={inpCls}>
                          {opcoesVidroSistema.map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Arremate</label>
                        <select value={arremate} onChange={(e) => setArremate(e.target.value)} className={inpCls}>
                          <option>Sem arremate</option><option>Interno</option><option>Externo</option><option>Duplo</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-[color:var(--muted-foreground)]">Contra marco</label>
                        <select value={contraMarco} onChange={(e) => setContraMarco(e.target.value)} className={inpCls}>
                          <option>Sem contra marco</option><option>Com contra marco</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Extras para PDF (Ambiente e Cor ferragem) */}
                <div className="grid grid-cols-2 gap-2 mt-3 mb-1 pt-2 border-t border-[color:var(--navy-border)]/50">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[color:var(--muted-foreground)]">Ambiente (ex: Sala, Banheiro)</label>
                    <input
                      type="text"
                      placeholder="ex: Sala, Banheiro..."
                      value={ambienteInput}
                      onChange={(e) => setAmbienteInput(e.target.value)}
                      className={inpCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[color:var(--muted-foreground)]">Cor ferragem (ex: Preto, Fosco)</label>
                    <input
                      type="text"
                      placeholder="ex: Preto, Fosco..."
                      value={corFerragemInput}
                      onChange={(e) => setCorFerragemInput(e.target.value)}
                      className={inpCls}
                    />
                  </div>
                </div>

                {/* Preview (mobile only, inline) — aparece em ambos os modos */}
                <div className="md:hidden mt-4 mb-3 border border-[color:var(--gold)]/20 rounded-lg bg-[color:var(--navy-surface)] p-3 flex items-center justify-center min-h-[90px]">
                  {origem === "esquadria" || prodConfigSelecionado ? (
                    <ProductDiagram item={{
                      nome: origem === "esquadria" ? (PRECO_BASE_PRODUTO[produto]?.nome || produto) : (prodConfigSelecionado?.nome || ""),
                      categoria: origem === "esquadria" ? "esquadria" : (prodConfigSelecionado?.categoria || ""),
                      larg: larg || 1200,
                      alt: alt || 1000,
                      cor_aluminio: cor
                    }} />
                  ) : (
                    <div className="text-[10px] text-[color:var(--muted-foreground)] text-center opacity-60">Selecione um produto<br />para ver a prévia</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[color:var(--navy-border)]">
                  <span className="text-[12px] text-[color:var(--muted-foreground)]">Calculado: <strong className="text-[color:var(--gold-2)] font-medium">{brl(valorCalculado)}</strong></span>
                  <button onClick={() => { handleAdd(); setActiveTab("itens"); }} className="flex items-center gap-1.5 bg-[color:var(--gold)] text-[color:var(--navy-deep)] px-3.5 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[color:var(--gold-2)] transition">
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* ── ITENS ── */}
            <div className={`px-4 pb-4 ${activeTab === "itens" ? "block" : "hidden md:block"}`}>
              <div className="bg-[color:var(--navy-card)] border border-[color:var(--navy-border)] rounded-xl p-3.5 mb-1">
                <div className={`${secLabel} ${secBar}`}>
                  Itens adicionados
                  {itens.length > 0 && (
                    <span className="ml-auto rounded-full bg-[color:var(--gold)]/15 border border-[color:var(--gold)]/25 px-2 py-0.5 text-[9px] font-bold text-[color:var(--gold-2)]">
                      {itens.length} {itens.length === 1 ? "item" : "itens"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_52px_52px_76px_24px] gap-1.5 pb-2 border-b border-[color:var(--gold-dim)]">
                  {["Produto", "Alt.", "Larg.", "Subtotal", ""].map((h, i) => (
                    <span key={i} className={`text-[10px] font-medium text-[color:var(--gold)] uppercase tracking-wider ${i === 2 || i === 1 ? "text-center" : i === 3 ? "text-right" : ""}`}>{h}</span>
                  ))}
                </div>

                <div className="flex flex-col">
                  {itens.length === 0 && (
                    <div className="text-[12px] text-[color:var(--muted-foreground)] text-center py-6 flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-[color:var(--navy-surface)] flex items-center justify-center border border-[color:var(--navy-border)]">
                        <Plus className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                      </div>
                      Nenhum item inserido.<br />
                      <button onClick={() => setActiveTab("produto")} className="text-[color:var(--gold)] hover:text-[color:var(--gold-2)] transition text-[11px] mt-1">
                        ← Ir para Produto
                      </button>
                    </div>
                  )}
                  {itens.map((it, i) => (
                    <div key={i} className="grid grid-cols-[1fr_52px_52px_76px_24px] gap-1.5 items-center py-2 border-b border-[color:var(--navy-border)] last:border-0">
                      <div className="min-w-0 pr-1">
                        <div className="text-[12px] text-white leading-tight truncate">{it.nome}</div>
                        <div className="text-[10px] text-[color:var(--muted-foreground)] truncate">{it.sub}</div>
                      </div>
                      <div className="text-[11px] text-[color:var(--muted-foreground)] text-center">{it.larg}</div>
                      <div className="text-[11px] text-[color:var(--muted-foreground)] text-center">{it.alt}</div>
                      <div className="text-[12px] font-medium text-[color:var(--gold-2)] text-right">{brl(it.val)}</div>
                      <button onClick={() => setDeleteIndex(i)} className="flex justify-center text-[color:var(--muted-foreground)] hover:text-red-400 transition" title="Remover item">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setActiveTab("produto"); }} className="flex items-center gap-1.5 text-[12px] text-[color:var(--gold)] hover:text-[color:var(--gold-2)] pt-2.5 mt-1 transition">
                  <Plus className="h-3.5 w-3.5" /> Adicionar mais um item
                </button>
              </div>

              {/* Avançar mobile */}
              {itens.length > 0 && (
                <button
                  onClick={() => setActiveTab("resumo")}
                  className="mt-2 w-full md:hidden flex items-center justify-center gap-2 rounded-xl bg-[color:var(--gold)] py-2.5 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)] transition shadow-lg shadow-[color:var(--gold)]/20"
                >
                  Revisar e salvar →
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className={`w-full md:w-[260px] shrink-0 bg-[color:var(--navy-card)] flex flex-col gap-4 overflow-y-auto border-t md:border-t-0 border-[color:var(--navy-border)] ${activeTab === "resumo" ? "block" : "hidden md:flex"}`}>
            <div className="p-4 flex flex-col gap-4">

              {/* Prévia (Desktop only) — separada por modo */}
              <div className="hidden md:block">
                <div className={`${secLabel} ${secBar}`}>
                  Prévia
                  <span className="ml-auto text-[9px] font-normal text-[color:var(--muted-foreground)] normal-case tracking-normal">
                    {origem === "esquadria" ? "Simulador" : "Catálogo"}
                  </span>
                </div>
                <div className="border border-[color:var(--gold)]/25 rounded-lg bg-[color:var(--navy-surface)] p-3 flex items-center justify-center min-h-[110px]">
                  {origem === "esquadria" || prodConfigSelecionado ? (
                    <ProductDiagram item={{
                      nome: origem === "esquadria" ? (PRECO_BASE_PRODUTO[produto]?.nome || produto) : (prodConfigSelecionado?.nome || ""),
                      categoria: origem === "esquadria" ? "esquadria" : (prodConfigSelecionado?.categoria || ""),
                      larg: larg || 1200,
                      alt: alt || 1000,
                      cor_aluminio: cor
                    }} />
                  ) : (
                    <div className="text-[10px] text-[color:var(--muted-foreground)] text-center opacity-60 px-4">Selecione um produto<br />para ver a prévia</div>
                  )}
                </div>
                <div className="mt-1.5 text-[10px] text-[color:var(--muted-foreground)] text-center">
                  {origem === "esquadria"
                    ? `${PRECO_BASE_PRODUTO[produto]?.nome ?? produto} • ${alt}×${larg}mm • ${cor}`
                    : prodConfigSelecionado
                      ? `${prodConfigSelecionado.nome}${prodConfigSelecionado.preco_m2 ? ` • ${alt}×${larg}mm` : ""}`
                      : "Nenhum produto selecionado"}
                </div>
              </div>

              <hr className="hidden md:block border-t border-[color:var(--navy-border)]" />

              {/* Resumo */}
              <div>
                <div className={`${secLabel} ${secBar}`}>Resumo</div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
                  {itens.length === 0 && (
                    <div className="text-[11px] text-[color:var(--muted-foreground)] text-center py-3">Nenhum item adicionado.</div>
                  )}
                  {itens.map((it, i) => (
                    <div key={i} className="flex gap-2 items-center text-[11px] py-1 border-b border-[color:var(--navy-border)]/30 last:border-0">
                      <div className="w-10 h-10 shrink-0 bg-white/5 rounded-sm p-0.5 flex items-center justify-center">
                        <ProductDiagram item={it} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[color:var(--muted-foreground)] truncate pr-2">{it.nome.split("—")[0].trim()} ×{it.qtd}</div>
                      </div>
                      <span className="text-white shrink-0 font-medium">{brl(it.val)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[12px] pt-2 border-t border-[color:var(--navy-border)]/60">
                  <span className="text-[color:var(--muted-foreground)]">Subtotal</span>
                  <span className="text-white font-medium">{brl(subtotalTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[12px] mt-1.5">
                  <span className="text-[color:var(--muted-foreground)]">Desconto (%)</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={descontoPerc} 
                    onChange={(e) => setDescontoPerc(Number(e.target.value) || 0)} 
                    className="w-16 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded text-right px-1.5 py-0.5 text-[11px] outline-none focus:border-[color:var(--gold-dim)] text-white" 
                  />
                </div>
                <div className="flex justify-between text-[14px] font-bold mt-2.5 pt-2 border-t border-[color:var(--gold-dim)]">
                  <span className="text-white">Total</span>
                  <span className="text-[color:var(--gold-2)]">{brl(totalGeral)}</span>
                </div>
              </div>

              <hr className="border-t border-[color:var(--navy-border)]" />

              {/* Análise de Lucro */}
              <div>
                <div className={`${secLabel} ${secBar}`}>Análise (Interno)</div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[color:var(--muted-foreground)]">Custo de Material (R$)</label>
                    <input type="number" min="0" step="10" value={custoEstimado || ""} onChange={(e) => setCustoEstimado(Number(e.target.value) || 0)} className={inpCls} placeholder="Ex: 500" />
                  </div>
                  {custoEstimado > 0 && totalGeral > 0 && (
                    <div className="flex justify-between text-[11px] bg-[color:var(--navy-surface)]/60 border border-[color:var(--navy-border)] p-2 rounded-md">
                      <div>
                        <div className="text-[color:var(--muted-foreground)]">Lucro Líquido</div>
                        <div className="font-semibold text-[#25D366]">{brl(totalGeral - custoEstimado)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[color:var(--muted-foreground)]">Margem</div>
                        <div className="font-semibold text-[#25D366]">{Math.round(((totalGeral - custoEstimado) / totalGeral) * 100)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-t border-[color:var(--navy-border)]" />

              {/* Detalhes */}
              <div>
                <div className={`${secLabel} ${secBar}`}>Detalhes</div>
                <div className="space-y-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[color:var(--muted-foreground)]">Validade</label>
                    <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} className={inpCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[color:var(--muted-foreground)]">Forma de Pagamento</label>
                    <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} className={inpCls}>
                      {["À vista", "50% entrada + saldo na entrega", "2x sem juros", "3x sem juros", "4x sem juros", "5x sem juros", "6x sem juros", "10x com juros", "Personalizado"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[color:var(--muted-foreground)]">Observações</label>
                    <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Prazo, condições, obs. técnicas..." className={`${inpCls} min-h-[52px] resize-y`} />
                  </div>
                </div>
              </div>

              <hr className="border-t border-[color:var(--navy-border)]" />

              {/* Status + Salvar */}
              <div className="flex flex-col gap-3 pb-1">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-[color:var(--muted-foreground)] mb-1.5">Status</div>
                  <select value={statusOrc} onChange={(e) => setStatusOrc(e.target.value)} className={`${inpCls} text-[12px]`}>
                    {STATUS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={salvar} className="w-full flex items-center justify-center gap-1.5 bg-[color:var(--gold)] text-[color:var(--navy-deep)] py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[color:var(--gold-2)] transition shadow-lg shadow-[color:var(--gold)]/20">
                  <Plus className="h-4 w-4" /> Salvar orçamento
                </button>
                <button onClick={onClose} className="w-full py-2 text-sm text-[color:var(--muted-foreground)] hover:text-white transition text-center">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AnimatePresence>
      {pdfReadyUrl && (
        <Modal onClose={() => setPdfReadyUrl(null)} title="PDF Gerado">
          <div className="flex flex-col items-center p-4 gap-6">
            <p className="text-sm text-center text-[color:var(--muted-foreground)]">O PDF do orçamento foi gerado com sucesso! Clique no botão abaixo para salvá-lo no seu dispositivo.</p>
            <a href={pdfReadyUrl.url} download={pdfReadyUrl.name} className="flex items-center gap-2 bg-[color:var(--gold)] text-[color:var(--navy-deep)] px-6 py-3 rounded-xl font-bold hover:bg-[color:var(--gold-2)] transition">
              <FileText className="h-5 w-5" /> Baixar PDF
            </a>
          </div>
        </Modal>
      )}
    </AnimatePresence>
    <PrintTemplate 
      numero={numero}
      dataEmissao={new Date().toISOString()}
      validade={validade}
      cliente={clienteSel}
      itens={itens.map(it => ({ ...it, espessura: it.espessura ?? "", cor: it.cor ?? "" }))}
      subtotal={subtotalTotal}
      descontoPerc={descontoPerc}
      total={totalGeral}
      id="print-template"
      ocultarValores={ocultarValores}
      ocultarMedidas={ocultarMedidas}
      observacoes={obs}
    />
  </>
  );
}

// Auxiliar Component for inline Client Search and Registration
type ModalClienteContentProps = {
  clientes: ClienteNovo[];
  clientesFiltrados: ClienteNovo[];
  buscaCli: string;
  setBuscaCli: (v: string) => void;
  onSelect: (c: ClienteNovo) => void;
  onClose: () => void;
  iniciais: (n: string) => string;
  onCreated: (c: ClienteNovo) => void;
};

function ModalClienteContent({
  clientes,
  clientesFiltrados,
  buscaCli,
  setBuscaCli,
  onSelect,
  onClose,
  iniciais,
  onCreated,
}: ModalClienteContentProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone || !endereco) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Telefone e Endereço).");
      return;
    }

    const payload = {
      nome,
      telefone,
      endereco,
      criado_por: getUserName(),
    };

    const { data, error } = await supabase
      .from("clientes")
      .insert(payload)
      .select("id,nome,telefone,endereco")
      .single();

    if (error) {
      alert("Erro ao cadastrar cliente: " + error.message);
      return;
    }

    if (data) {
      // Map database 'endereco' to component's expected structure
      const newCli = {
        id: data.id,
        nome: data.nome,
        telefone: data.telefone,
        endereco_completo: data.endereco
      };
      onCreated(newCli);
    }
  };

  if (isRegistering) {
    return (
      <form onSubmit={handleSave} className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-bold text-white uppercase tracking-wider">Novo Cliente</span>
          <button type="button" onClick={() => setIsRegistering(false)} className="text-xs text-[color:var(--gold)] hover:text-[color:var(--gold-2)] transition">
            Voltar para busca
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-[color:var(--muted-foreground)] uppercase">Nome *</label>
            <input 
              type="text" 
              required 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              className="w-full bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-[13px] text-white focus:border-[color:var(--gold-dim)] outline-none" 
            />
          </div>
          <div>
            <label className="text-[10px] text-[color:var(--muted-foreground)] uppercase">Telefone *</label>
            <input 
              type="text" 
              required 
              value={telefone} 
              onChange={(e) => setTelefone(e.target.value)} 
              placeholder="(00) 00000-0000" 
              className="w-full bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-[13px] text-white focus:border-[color:var(--gold-dim)] outline-none" 
            />
          </div>
          <div>
            <label className="text-[10px] text-[color:var(--muted-foreground)] uppercase">Endereço Completo *</label>
            <textarea 
              required 
              value={endereco} 
              onChange={(e) => setEndereco(e.target.value)} 
              rows={2} 
              placeholder="Rua, número, bairro, cidade..." 
              className="w-full bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-[13px] text-white focus:border-[color:var(--gold-dim)] outline-none resize-none" 
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            type="button" 
            onClick={() => setIsRegistering(false)} 
            className="flex-1 py-1.5 text-[12px] border border-[color:var(--navy-border)] rounded-lg text-[color:var(--muted-foreground)] hover:text-white transition"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-1 py-1.5 text-[12px] bg-[color:var(--gold)] text-[color:var(--navy-deep)] font-semibold rounded-lg hover:bg-[color:var(--gold-2)] transition"
          >
            Salvar e Selecionar
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-white">Selecionar cliente</span>
        <button onClick={onClose} className="text-[color:var(--muted-foreground)] hover:text-[color:var(--gold-2)]"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex gap-1.5 mb-2">
        <input 
          autoFocus 
          type="text" 
          placeholder="Buscar por nome ou telefone..." 
          value={buscaCli} 
          onChange={(e) => setBuscaCli(e.target.value)} 
          className="flex-1 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-[13px] text-white focus:border-[color:var(--gold-dim)] outline-none" 
        />
        <button 
          onClick={() => {
            setNome(buscaCli); // Pre-fills the name field with search text
            setIsRegistering(true);
          }} 
          title="Cadastrar Novo Cliente" 
          className="px-2.5 bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 rounded-md text-[color:var(--gold-2)] hover:bg-[color:var(--gold)]/20 transition flex items-center justify-center shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-0.5">
        {clientesFiltrados.length === 0 && (
          <div className="text-xs text-[color:var(--muted-foreground)] text-center py-4">
            Nenhum cliente encontrado. <br />
            <button 
              onClick={() => {
                setNome(buscaCli);
                setIsRegistering(true);
              }} 
              className="text-[color:var(--gold)] hover:underline mt-1"
            >
              Criar "{buscaCli || "Novo Cliente"}"?
            </button>
          </div>
        )}
        {clientesFiltrados.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[color:var(--navy-hover)] text-left transition">
            <div className="w-7 h-7 rounded-full bg-[color:var(--navy-surface)] border border-[color:var(--gold-dim)] flex items-center justify-center text-[11px] font-medium text-[color:var(--gold)] shrink-0">{iniciais(c.nome)}</div>
            <div className="min-w-0">
              <div className="text-[13px] text-white">{c.nome}</div>
              <div className="text-[11px] text-[color:var(--muted-foreground)] truncate">{c.telefone} • {c.endereco_completo}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Editar Orçamento ────────────────────────────────────────────────────────

function EditarOrcamento({ orc, onClose }: { orc: Orcamento; onClose: () => void }) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [catalogo, setCatalogo] = useState<Produto[]>([]);
  const [clienteId, setClienteId] = useState(orc.cliente_id ?? "");
  const [clienteNome, setClienteNome] = useState(orc.cliente_nome ?? "");
  const [validade, setValidade] = useState(orc.validade ?? "");
  const [pagamento, setPagamento] = useState(orc.forma_pagamento ?? "À vista");
  const [obs, setObs] = useState(orc.observacoes ?? "");
  const [desconto, setDesconto] = useState(Number(orc.desconto) || 0);
  const [itens, setItens] = useState<Item[]>([]);

  useEffect(() => {
    supabase.from("clientes").select("id,nome").order("nome").then(({ data }) => setClientes((data as ClienteOption[] | null) ?? []));
    supabase.from("catalogo_produtos").select("*").eq("ativo", true).order("categoria").then(({ data }) => setCatalogo((data as Produto[] | null) ?? []));
    supabase.from("orcamento_itens").select("*").eq("orcamento_id", orc.id).then(({ data }) => {
      const loaded = (data as Array<any> | null) ?? [];
      setItens(loaded.map((it) => ({
        produto_id: it.produto_id ?? null,
        nome: it.nome ?? "",
        descricao: it.descricao ?? "",
        quantidade: Number(it.quantidade) || 1,
        largura_mm: Number(it.largura_mm) || 0,
        altura_mm: Number(it.altura_mm) || 0,
        espessura: it.espessura ?? "",
        cor: it.cor ?? "",
        valor_unitario: Number(it.valor_unitario) || 0,
        subtotal: Number(it.subtotal) || 0,
      })));
    });
  }, [orc.id]);

  const addProduto = (p: Produto) => {
    const largura = p.preco_m2 ? 1000 : (p.largura_mm || 0);
    const altura = p.preco_m2 ? 1000 : (p.altura_mm || 0);
    const area = p.preco_m2 ? (largura / 1000) * (altura / 1000) : 0;
    const valor = p.preco_m2 ? p.preco_m2 * area : (p.preco_unitario ?? 0);
    setItens((current) => [...current, { produto_id: p.id, nome: p.nome, descricao: p.descricao ?? "", quantidade: 1, largura_mm: largura, altura_mm: altura, espessura: p.espessura ?? "", cor: p.cor ?? "", valor_unitario: valor, subtotal: valor }]);
  };

  const update = (index: number, patch: Partial<Item>) => {
    setItens((current) => current.map((it, idx) => {
      if (idx !== index) return it;
      const merged = { ...it, ...patch };
      const p = catalogo.find((c) => c.id === merged.produto_id);
      let unit = merged.valor_unitario;
      if (p?.preco_m2) {
        const area = (merged.largura_mm / 1000) * (merged.altura_mm / 1000);
        unit = p.preco_m2 * area;
      }
      return { ...merged, valor_unitario: unit, subtotal: unit * merged.quantidade };
    }));
  };

  const remove = (index: number) => setItens((current) => current.filter((_, idx) => idx !== index));

  const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - desconto);

  const salvar = async () => {
    if (!clienteNome) { alert("Informe o cliente"); return; }
    if (itens.length === 0) { alert("Adicione ao menos um item"); return; }
    const { error } = await supabase.from("orcamentos").update({
      cliente_id: clienteId || null, cliente_nome: clienteNome,
      validade, forma_pagamento: pagamento, desconto, total,
      observacoes: obs,
    }).eq("id", orc.id);
    if (error) { alert(error.message); return; }
    await supabase.from("orcamento_itens").delete().eq("orcamento_id", orc.id);
    await supabase.from("orcamento_itens").insert(itens.map((it) => ({ ...it, orcamento_id: orc.id })));
    onClose();
  };

  return (
    <OrcamentoForm
      title={`Editar Orçamento ${orc.numero}`}
      clientes={clientes} catalogo={catalogo}
      clienteId={clienteId} setClienteId={setClienteId}
      clienteNome={clienteNome} setClienteNome={setClienteNome}
      validade={validade} setValidade={setValidade}
      pagamento={pagamento} setPagamento={setPagamento}
      obs={obs} setObs={setObs}
      desconto={desconto} setDesconto={setDesconto}
      itens={itens} addProduto={addProduto} update={update} remove={remove}
      onClose={onClose} onSave={salvar} saveLabel="Atualizar orçamento"
    />
  );
}

function DetalheOrcamento({ orc, onEdit, onClose }: { orc: Orcamento; onEdit: (orc: Orcamento) => void; onClose: () => void }) {
  const [itens, setItens] = useState<OrcamentoItem[]>([]);
  const [status, setStatus] = useState(orc.status);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [ocultarValores, setOcultarValores] = useState(false);
  const [ocultarMedidas, setOcultarMedidas] = useState(false);
  const [sigOpen, setSigOpen] = useState(false);
  const [assinatura, setAssinatura] = useState<string | null>(orc.assinatura_base64 || null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfReadyUrl, setPdfReadyUrl] = useState<{ url: string, name: string } | null>(null);

  useEffect(() => {
    supabase.from("orcamento_itens").select("*").eq("orcamento_id", orc.id).then(({ data }) => setItens((data as OrcamentoItem[] | null) ?? []));
  }, [orc.id]);

  const salvarStatus = async () => {
    await supabase.from("orcamentos").update({ status }).eq("id", orc.id);
    if (status === "Aprovado") {
      const numero = `PED-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
      await supabase.from("pedidos").insert({ numero, orcamento_id: orc.id, cliente_nome: orc.cliente_nome, status: "Aguardando material", criado_por: getUserName() });
      await supabase.from("financeiro").insert({ tipo: "Receita", descricao: `Orçamento ${orc.numero}`, orcamento_id: orc.id, cliente_nome: orc.cliente_nome, valor: orc.total, status: "Pendente", vencimento: orc.validade });
    }
    onClose();
  };

  const excluirOrcamento = async () => {
    await supabase.from("orcamento_itens").delete().eq("orcamento_id", orc.id);
    await supabase.from("pedidos").delete().eq("orcamento_id", orc.id);
    await supabase.from("financeiro").delete().eq("orcamento_id", orc.id);
    const { error } = await supabase.from("orcamentos").delete().eq("id", orc.id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      onClose();
    }
  };

  const handleSaveSignature = async (base64: string) => {
    setAssinatura(base64);
    const { error } = await supabase.from("orcamentos").update({ assinatura_base64: base64 }).eq("id", orc.id);
    if (error) {
      alert("ATENÇÃO: A assinatura não foi salva no banco! Você precisa rodar o código SQL no painel do Supabase para criar a coluna de assinatura. Erro técnico: " + error.message);
    }
  };

  return (
    <>
      <AnimatePresence>
        {pdfReadyUrl && (
          <Modal onClose={() => setPdfReadyUrl(null)} title="PDF Gerado">
            <div className="flex flex-col items-center p-4 gap-6">
              <p className="text-sm text-center text-[color:var(--muted-foreground)]">O PDF do orçamento foi gerado com sucesso! Clique no botão abaixo para salvá-lo no seu dispositivo.</p>
              <a href={pdfReadyUrl.url} download={pdfReadyUrl.name} className="flex items-center gap-2 bg-[color:var(--gold)] text-[color:var(--navy-deep)] px-6 py-3 rounded-xl font-bold hover:bg-[color:var(--gold-2)] transition">
                <FileText className="h-5 w-5" /> Baixar PDF
              </a>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <ConfirmDeleteModal
        open={deleteConfirm}
        title="Excluir Orçamento?"
        description={`O orçamento ${orc.numero} e seus itens serão removidos permanentemente.`}
        onConfirm={excluirOrcamento}
        onClose={() => setDeleteConfirm(false)}
      />
      <Modal wide onClose={onClose} title={`Orçamento ${orc.numero}`}>
        <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
          <div><div className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Cliente</div><div>{orc.cliente_nome}</div></div>
          <div><div className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Validade</div><div>{dateBR(orc.validade)}</div></div>
          <div><div className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Pagamento</div><div>{orc.forma_pagamento}</div></div>
          <div><div className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Criado por</div><div>{orc.criado_por || "—"}</div></div>
          <div><div className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Criado em</div><div>{dateBR(orc.created_at)}</div></div>
          <div><div className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Total</div><div className="font-display text-lg text-[color:var(--gold-2)]">{brl(orc.total)}</div></div>
        </div>
        <div className="mb-4 overflow-x-auto rounded border border-[color:var(--navy-border)]">
          <table className="w-full text-xs min-w-[450px]">
            <thead className="bg-[color:var(--navy-surface)] uppercase text-[color:var(--muted-foreground)]">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2">Qtd</th>
                <th className="p-2">Dim.</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.id} className="border-t border-[color:var(--navy-border)]">
                  <td className="p-2 flex gap-3 items-center">
                    <div className="w-12 h-10 shrink-0 bg-white/5 rounded-sm p-0.5 flex items-center justify-center">
                       <ProductDiagram item={{ ...it, sub: it.descricao || "" }} />
                    </div>
                    <div><div className="font-medium">{it.nome}</div><div className="text-[10px] text-[color:var(--muted-foreground)]">{it.espessura} {it.cor}</div></div>
                  </td>
                  <td className="p-2 text-center">{it.quantidade}</td>
                  <td className="p-2 text-center">{it.largura_mm && it.altura_mm ? `${it.altura_mm}×${it.largura_mm}mm` : "—"}</td>
                  <td className="p-2 text-right text-[color:var(--gold-2)]">{brl(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orc.observacoes && <div className="mb-4 text-sm"><span className="text-[10px] uppercase text-[color:var(--muted-foreground)]">Observações: </span>{orc.observacoes}</div>}
        <div className="flex items-end justify-between gap-4">
          <Field label="Atualizar status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-3 py-2 text-sm">
              {STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 flex-wrap justify-end items-center">
            <label className="flex items-center gap-1.5 cursor-pointer mr-2 text-[12px] text-[color:var(--muted-foreground)] hover:text-white transition">
              <input type="checkbox" checked={ocultarMedidas} onChange={(e) => setOcultarMedidas(e.target.checked)} className="accent-[color:var(--gold)]" />
              Ocultar Medidas (PDF)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer mr-2 text-[12px] text-[color:var(--muted-foreground)] hover:text-white transition">
              <input type="checkbox" checked={ocultarValores} onChange={(e) => setOcultarValores(e.target.checked)} className="accent-[color:var(--gold)]" />
              Ocultar Preços (PDF)
            </label>
            <button onClick={() => setSigOpen(true)} className="flex items-center gap-1 border border-[color:var(--navy-border)] hover:border-[color:var(--gold-dim)] hover:text-[color:var(--gold-2)] text-[color:var(--muted-foreground)] px-2.5 py-1.5 rounded-lg text-[12px] transition">
              <PenTool className="h-3.5 w-3.5" /> Assinatura
            </button>
            <button onClick={() => {
              const text = `Olá${orc.cliente_nome ? ` ${orc.cliente_nome.split(" ")[0]}` : ""}, segue as informações do seu orçamento ${orc.numero}.\n\n*Valor Total:* ${brl(orc.total)}\n*Validade:* ${orc.validade}\n*Pagamento:* ${orc.forma_pagamento}\n\nQualquer dúvida estamos à disposição!`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
            }} className="flex items-center gap-1 border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] px-2.5 py-1.5 rounded-lg text-[12px] transition font-medium">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp
            </button>
            <button onClick={() => {
              if (window.innerWidth <= 768) {
                const element = document.getElementById("print-template-detalhe");
                if (!element) return;
                setIsGeneratingPdf(true);
                const originalClasses = element.className;
                element.className = "bg-white text-[#000000] font-sans min-h-screen block w-[800px] fixed top-0 left-0 z-[-50]";
                const opt = { margin: 0.2, filename: `Orcamento_${orc.numero}.pdf`, image: { type: 'jpeg' as const, quality: 0.85 }, html2canvas: { scale: 1, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const } };
                
                html2pdf().set(opt).from(element).save().then(() => {
                  element.className = originalClasses;
                  setIsGeneratingPdf(false);
                }).catch((err: any) => {
                  console.error(err);
                  alert("Erro ao gerar PDF: " + err);
                  element.className = originalClasses;
                  setIsGeneratingPdf(false);
                });
              } else { window.print(); }
            }} disabled={isGeneratingPdf} className="px-3 py-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 transition">
              {isGeneratingPdf ? "Gerando PDF..." : "Imprimir PDF"}
            </button>
            <button onClick={() => setDeleteConfirm(true)} className="px-3 py-2 text-sm text-red-500 hover:text-red-400">Excluir</button>
            <button onClick={() => onEdit(orc)} className="px-3 py-2 text-sm text-[color:var(--gold-2)]">Editar</button>
            <button onClick={onClose} className="px-3 py-2 text-sm text-[color:var(--muted-foreground)]">Fechar</button>
            <button onClick={salvarStatus} className="rounded-md bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-2)]">Salvar</button>
          </div>
        </div>
      </Modal>
      <PrintTemplate 
        id="print-template-detalhe"
        numero={orc.numero}
        dataEmissao={orc.created_at}
        validade={orc.validade}
        cliente={{ nome: orc.cliente_nome }}
        itens={itens.map(it => ({ ...it, val: it.subtotal, qtd: it.quantidade, sub: it.descricao || "", larg: it.largura_mm, alt: it.altura_mm }))}
        subtotal={orc.total + (orc.desconto || 0)}
        descontoPerc={0}
        total={orc.total}
        observacoes={orc.observacoes || ""}
        ocultarValores={ocultarValores}
        ocultarMedidas={ocultarMedidas}
        assinatura={assinatura}
      />
      <SignaturePadModal 
        open={sigOpen} 
        onClose={() => setSigOpen(false)} 
        onSave={handleSaveSignature} 
      />
    </>
  );
}

