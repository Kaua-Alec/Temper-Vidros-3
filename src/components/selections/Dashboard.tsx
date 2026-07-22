import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/format";
import { Section } from "@/components/Layout";
import { FileText, Wrench, Calendar, DollarSign, AlertTriangle } from "lucide-react";

type DashboardStats = {
  orcamentosPendentes: number;
  orcamentosMes: number;
  receitaMes: number;
  pedidosProducao: number;
  agendaHoje: number;
  estoqueAlertas: number;
};

type RecentOrcamento = {
  id: string;
  numero: string;
  cliente_nome: string;
  created_at: string;
  status: string;
  total: number;
};

type EstoqueAlerta = {
  id: string;
  material: string;
  minimo: number | null;
  unidade: string;
  quantidade: number | null;
};

export function Dashboard({ go }: { go: (s: Section) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    orcamentosPendentes: 0,
    orcamentosMes: 0,
    receitaMes: 0,
    pedidosProducao: 0,
    agendaHoje: 0,
    estoqueAlertas: 0,
  });
  const [recent, setRecent] = useState<RecentOrcamento[]>([]);
  const [estoqueBaixo, setEstoqueBaixo] = useState<EstoqueAlerta[]>([]);

  useEffect(() => {
    void (async () => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const hoje = new Date().toISOString().slice(0, 10);

      const [orc, orcMes, recMes, ped, ag, est] = await Promise.all([
        supabase.from("orcamentos").select("id", { count: "exact", head: true }).eq("status", "Pendente"),
        supabase.from("orcamentos").select("total").gte("created_at", inicioMes.toISOString()),
        supabase.from("financeiro").select("valor").eq("status", "Pago").gte("pago_em", inicioMes.toISOString().slice(0, 10)),
        supabase.from("pedidos").select("id", { count: "exact", head: true }).neq("status", "Concluído"),
        supabase.from("agendamentos").select("id", { count: "exact", head: true }).eq("data", hoje),
        supabase.from("estoque").select("*"),
      ]);

      const rec = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false }).limit(5);
      const baixo = (est.data ?? []).filter((r: EstoqueAlerta) => Number(r.quantidade) <= Number(r.minimo));

      setStats({
        orcamentosPendentes: orc.count ?? 0,
        orcamentosMes: (orcMes.data ?? []).reduce((acc: number, item: { total: number | null }) => acc + Number(item.total || 0), 0),
        receitaMes: (recMes.data ?? []).reduce((acc: number, item: { valor: number | null }) => acc + Number(item.valor || 0), 0),
        pedidosProducao: ped.count ?? 0,
        agendaHoje: ag.count ?? 0,
        estoqueAlertas: baixo.length,
      });
      setRecent((rec.data as RecentOrcamento[] | null) ?? []);
      setEstoqueBaixo(baixo.slice(0, 5));
    })();
  }, []);

  const cards = [
    { label: "Orçamentos pendentes", val: stats.orcamentosPendentes, icon: FileText, go: "orcamentos" as Section },
    { label: "Total orçado no mês", val: brl(stats.orcamentosMes), icon: FileText, go: "orcamentos" as Section },
    { label: "Recebido no mês", val: brl(stats.receitaMes), icon: DollarSign, go: "financeiro" as Section },
    { label: "Pedidos em produção", val: stats.pedidosProducao, icon: Wrench, go: "pedidos" as Section },
    { label: "Agenda de hoje", val: stats.agendaHoje, icon: Calendar, go: "agenda" as Section },
    { label: "Itens em estoque baixo", val: stats.estoqueAlertas, icon: AlertTriangle, go: "estoque" as Section },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 2 colunas no celular (grid-cols-2) para aproveitar melhor o espaço */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => go(c.go)}
              className="group rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] p-3 sm:p-4 text-left transition hover:border-[color:var(--gold-dim)] hover:bg-[color:var(--navy-hover)] flex flex-col justify-between min-h-[90px] sm:min-h-[100px]"
            >
              <div className="flex items-start justify-between w-full">
                <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[color:var(--muted-foreground)] leading-tight pr-2">
                  {c.label}
                </div>
                <div className="p-1.5 rounded-md bg-[color:var(--navy-surface)] group-hover:bg-[color:var(--navy-base)] transition-colors shrink-0">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[color:var(--gold-dim)] group-hover:text-[color:var(--gold)]" />
                </div>
              </div>
              <div className="mt-3 font-display text-lg sm:text-2xl font-semibold text-[color:var(--gold-2)] truncate w-full">
                {c.val}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bloco 1: Orçamentos recentes */}
        <div className="rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] flex flex-col">
          <div className="p-4 border-b border-[color:var(--navy-border)] flex items-center justify-between bg-[color:var(--navy-surface)]/30 rounded-t-xl">
            <div className="text-sm font-bold tracking-wide text-[color:var(--gold-2)] uppercase">Orçamentos recentes</div>
            <button onClick={() => go("orcamentos")} className="text-[10px] text-[color:var(--muted-foreground)] hover:text-white transition">Ver todos</button>
          </div>
          <div className="p-2 sm:p-4 flex-1">
            <div className="space-y-1">
              {recent.length === 0 && <div className="p-4 text-center text-xs text-[color:var(--muted-foreground)]">Nenhum orçamento ainda.</div>}
              {recent.map((r) => (
                <div key={r.id} onClick={() => go("orcamentos")} className="cursor-pointer group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[color:var(--navy-surface)] transition">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">{r.numero} <span className="text-[color:var(--muted-foreground)] font-normal">— {r.cliente_nome}</span></div>
                    <div className="text-[10px] text-[color:var(--muted-foreground)] mt-0.5">{dateBR(r.created_at)} · {r.status}</div>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[color:var(--gold-2)] shrink-0 group-hover:scale-105 transition-transform">{brl(r.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bloco 2: Alertas de estoque */}
        <div className="rounded-xl border border-[color:var(--navy-border)] bg-[color:var(--navy-card)] flex flex-col">
          <div className="p-4 border-b border-[color:var(--navy-border)] flex items-center justify-between bg-[color:var(--navy-surface)]/30 rounded-t-xl">
            <div className="text-sm font-bold tracking-wide text-[color:var(--gold-2)] uppercase">Alertas de estoque</div>
            <button onClick={() => go("estoque")} className="text-[10px] text-[color:var(--muted-foreground)] hover:text-white transition">Gerenciar</button>
          </div>
          <div className="p-2 sm:p-4 flex-1">
            <div className="space-y-1">
              {estoqueBaixo.length === 0 && <div className="p-4 text-center text-xs text-[color:var(--muted-foreground)]">Tudo em ordem no momento.</div>}
              {estoqueBaixo.map((r) => (
                <div key={r.id} onClick={() => go("estoque")} className="cursor-pointer group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[color:var(--navy-surface)] transition">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">{r.material}</div>
                    <div className="text-[10px] text-[color:var(--muted-foreground)] mt-0.5">Mínimo: {r.minimo} {r.unidade}</div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]">Estoque</span>
                    <span className="text-xs sm:text-sm font-bold text-red-400 group-hover:text-red-300 transition-colors">{r.quantidade} {r.unidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
