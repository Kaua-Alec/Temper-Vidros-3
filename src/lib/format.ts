export const brl = (n: number | null | undefined) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dateBR = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return String(d); }
};

export const dateTimeBR = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleString("pt-BR"); } catch { return String(d); }
};

export function genOrcamentoNumero() {
  const y = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ORC-${y}-${rand}`;
}
export function genPedidoNumero() {
  const y = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PED-${y}-${rand}`;
}
