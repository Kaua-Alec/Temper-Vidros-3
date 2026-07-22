import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

const TABLES = [
  "clientes",
  "orcamentos",
  "orcamento_itens",
  "pedidos",
  "agendamentos",
  "financeiro",
  "estoque",
  "catalogo_produtos",
  "mensagens",
] as const;

export async function downloadAllDataZip() {
  const zip = new JSZip();
  const folder = zip.folder("temper_vidros_sf_dados")!;
  const meta: Record<string, number> = {};

  for (const t of TABLES) {
    const { data, error } = await supabase.from(t).select("*");
    if (error) {
      folder.file(`${t}.error.txt`, error.message);
      continue;
    }
    const rows = data ?? [];
    meta[t] = rows.length;
    folder.file(`${t}.json`, JSON.stringify(rows, null, 2));
    folder.file(`${t}.csv`, toCSV(rows as Record<string, unknown>[]));
  }

  folder.file(
    "README.txt",
    `Temper Vidros SF - Exportação de dados\nData: ${new Date().toLocaleString("pt-BR")}\n\nRegistros:\n${Object.entries(meta)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join("\n")}\n`,
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `temper_vidros_sf_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
