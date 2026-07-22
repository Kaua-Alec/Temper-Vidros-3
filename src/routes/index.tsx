import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { UserGate } from "@/components/UserGate";
import { Layout, type Section } from "@/components/Layout";

const Dashboard = lazy(() => import("@/components/selections/Dashboard").then((m) => ({ default: m.Dashboard })));
const Clientes = lazy(() => import("@/components/selections/Clientes").then((m) => ({ default: m.Clientes })));
const Orcamentos = lazy(() => import("@/components/selections/Orcamentos").then((m) => ({ default: m.Orcamentos })));
const Pedidos = lazy(() => import("@/components/selections/Pedidos").then((m) => ({ default: m.Pedidos })));
const Agenda = lazy(() => import("@/components/selections/Agenda").then((m) => ({ default: m.Agenda })));
const Financeiro = lazy(() => import("@/components/selections/Financeiro").then((m) => ({ default: m.Financeiro })));
const Estoque = lazy(() => import("@/components/selections/Estoque").then((m) => ({ default: m.Estoque })));
const Config = lazy(() => import("@/components/selections/Config").then((m) => ({ default: m.Config })));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Temper Vidros SF — Gestão de Vidraçaria" },
      { name: "description", content: "Sistema completo de gestão para vidraçarias: orçamentos, pedidos, agenda, financeiro e estoque." },
      { property: "og:title", content: "Temper Vidros SF — Gestão de Vidraçaria" },
      { property: "og:description", content: "Orçamentos, pedidos, agenda, financeiro e estoque em um só lugar." },
    ],
  }),
  component: Page,
});

function Page() {
  const [section, setSection] = useState<Section>("dashboard");
  return (
    <UserGate>
      <Layout section={section} setSection={setSection}>
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando seção...</div>}>
          {section === "dashboard" && <Dashboard go={setSection} />}
          {section === "clientes" && <Clientes />}
          {section === "orcamentos" && <Orcamentos />}
          {section === "pedidos" && <Pedidos />}
          {section === "agenda" && <Agenda />}
          {section === "financeiro" && <Financeiro />}
          {section === "estoque" && <Estoque />}
          {section === "config" && <Config />}
        </Suspense>
      </Layout>
    </UserGate>
  );
}
