import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserName, clearUserName } from "@/lib/user";
import { downloadAllDataZip } from "@/lib/download-zip";
import { ChatDrawer } from "./ChatDrawer";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard, Users, FileText, Wrench, Calendar,
  DollarSign, Package, Settings, Download, LogOut, Menu, X,
} from "lucide-react";

export type Section =
  | "dashboard" | "clientes" | "orcamentos" | "pedidos"
  | "agenda" | "financeiro" | "estoque" | "config";

const nav: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Principal" },
  { id: "clientes", label: "Clientes", icon: Users, group: "Principal" },
  { id: "orcamentos", label: "Orçamentos", icon: FileText, group: "Principal" },
  { id: "pedidos", label: "Pedidos / Produção", icon: Wrench, group: "Operacional" },
  { id: "agenda", label: "Agenda", icon: Calendar, group: "Operacional" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, group: "Gestão" },
  { id: "estoque", label: "Estoque", icon: Package, group: "Gestão" },
  { id: "config", label: "Configurações", icon: Settings, group: "Sistema" },
];

const titles: Record<Section, [string, string]> = {
  dashboard: ["Dashboard", "Visão geral do dia"],
  clientes: ["Clientes", "Cadastro e histórico"],
  orcamentos: ["Orçamentos", "Criar e acompanhar"],
  pedidos: ["Pedidos / Produção", "Acompanhar fabricação"],
  agenda: ["Agenda", "Instalações e visitas"],
  financeiro: ["Financeiro", "Contas a receber"],
  estoque: ["Estoque", "Materiais e alertas"],
  config: ["Configurações", "Sistema"],
};

export function Layout({
  section, setSection, children,
}: { section: Section; setSection: (s: Section) => void; children: React.ReactNode }) {
  const [downloading, setDownloading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getUserName();
  const [title, sub] = titles[section];

  const groups = Array.from(new Set(nav.map((n) => n.group)));

  const doDownload = async () => {
    setDownloading(true);
    try { await downloadAllDataZip(); } finally { setDownloading(false); }
  };

  const handleNavClick = (id: Section) => {
    setSection(id);
    setSidebarOpen(false); // fecha sidebar no mobile ao navegar
  };

  return (
    <div className="flex print:block h-screen print:h-auto w-full bg-[color:var(--navy-deep)] text-[color:var(--foreground)] overflow-hidden print:overflow-visible">

      {/* Overlay escuro para fechar sidebar no mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 z-40 h-full
          w-[220px] shrink-0 flex flex-col
          bg-[color:var(--navy-base)] border-r border-[color:var(--navy-border)]
          transition-transform duration-300 ease-in-out print:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-4 py-4 border-b border-[color:var(--navy-border)] flex items-center justify-between">
          <div>
            <div className="font-display text-xl text-[color:var(--gold)] leading-none">Temper Vidros SF</div>
            <div className="text-[10px] text-[color:var(--muted-foreground)] mt-1 uppercase tracking-wider">Gestão de Vidraçaria</div>
          </div>
          {/* Botão de fechar no mobile dentro da sidebar */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[color:var(--muted-foreground)] hover:text-white p-1 rounded"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {groups.map((g) => (
            <div key={g}>
              <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]/60">{g}</div>
              {nav.filter((n) => n.group === g).map((n) => {
                const Icon = n.icon;
                const active = section === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNavClick(n.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-4 py-2 text-[13px] border-l-2 transition ${
                      active
                        ? "bg-[color:var(--navy-surface)] text-white border-[color:var(--gold)]"
                        : "text-[color:var(--muted-foreground)] border-transparent hover:bg-[color:var(--navy-surface)]/60 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {n.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-[color:var(--navy-border)] p-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[color:var(--gold)] text-[color:var(--navy-deep)] flex items-center justify-center text-xs font-bold shrink-0">
            {(user || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user || "Anônimo"}</div>
            <button onClick={clearUserName} className="text-[10px] text-[color:var(--muted-foreground)] hover:text-[color:var(--gold-2)] flex items-center gap-1">
              <LogOut className="h-3 w-3" /> Trocar
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 print:flex-none print:block flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <header className="border-b border-[color:var(--navy-border)] bg-[color:var(--navy-base)] px-4 py-3 flex items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            {/* Botão hamburger — só aparece no mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[color:var(--muted-foreground)] hover:text-white p-1 rounded transition"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-white leading-tight truncate">{title}</h1>
              <p className="text-xs text-[color:var(--muted-foreground)] hidden sm:block">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={doDownload}
              disabled={downloading}
              className="hidden items-center gap-1.5 rounded-md border border-[color:var(--gold-dim)] px-2 sm:px-3 py-1.5 text-xs text-[color:var(--gold-2)] hover:bg-[color:var(--gold)]/10 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{downloading ? "Gerando..." : "Baixar dados (.zip)"}</span>
              <span className="sm:hidden">{downloading ? "..." : "ZIP"}</span>
            </button>
          </div>
        </header>
        <div className="flex-1 print:flex-none print:block overflow-x-hidden overflow-y-auto p-4 sm:p-6 print:overflow-visible print:p-0 print:bg-white relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="print:hidden">
        <ChatDrawer />
      </div>
    </div>
  );
}
