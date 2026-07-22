import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Item = {
  nome: string;
  sub: string; // Contains details like 'Qtd: X • Branco • ...'
  qtd: number;
  larg: number;
  alt: number;
  espessura: string;
  cor: string;
  val: number;
};

type PrintTemplateProps = {
  numero: string;
  dataEmissao: string;
  validade: string;
  cliente: {
    nome: string;
    telefone?: string | null;
  } | null;
  itens: Item[];
  subtotal: number;
  descontoPerc: number;
  total: number;
  observacoes: string;
  id?: string;
};

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function PrintTemplate({
  numero,
  dataEmissao,
  validade,
  cliente,
  itens,
  subtotal,
  descontoPerc,
  total,
  observacoes,
  id = "print-template",
}: PrintTemplateProps) {
  // Try to parse 'validade' which might be '15' to '15 DIAS'
  const validadeDias = validade.includes("DIA") ? validade : `${validade} DIAS`;
  const hojeFormatado = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
  let dataOrc = dataEmissao;
  try {
    dataOrc = format(new Date(dataEmissao), "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    dataOrc = hojeFormatado;
  }

  return (
    <div id={id} className="hidden print:block bg-white text-black font-sans min-h-screen html2pdf-container">
      <table className="w-full">
        <thead className="table-header-group">
          <tr>
            <td>
              {/* Top Banner (Removido a pedido) */}

              <div className="px-8 pt-4">
                {/* Header Info */}
        <div className="flex gap-6 items-start mb-6">
          <div className="w-32 h-32 flex items-center justify-center shrink-0">
            <img src="/logo.jpg" alt="Temper Vidros SF Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex-1 mt-1 text-[13px] leading-relaxed text-gray-800">
            <h1 className="text-lg font-bold mb-2">TEMPER VIDROS SF</h1>
            <p>R. Hermita Mendonça, 757, Bairro Jardim Regalito , São Francisco, MG.</p>
            <p>Tempervidrosv@gmail.com</p>
            <p>(38) 9 9729-0252 / (38) 9 9260-4739</p>
          </div>
                </div>
                
                {/* Client Name (Repeating on every page) */}
                <div className="mb-2 border-b border-gray-300 pb-2">
                  <h2 className="text-base font-bold uppercase text-gray-900">{cliente?.nome || "CLIENTE NÃO INFORMADO"}</h2>
                </div>
              </div>
            </td>
          </tr>
        </thead>
        <tbody className="table-row-group">
          <tr>
            <td className="px-8 pb-8">
              {/* Metadata Bar */}
        <div className="bg-[#E6E6E6] border border-gray-300 py-1.5 px-4 flex justify-between items-center text-[11px] mb-4 font-medium uppercase text-gray-800">
          <div><span className="font-bold">Nº ORÇAMENTO:</span> {numero || "N/A"}</div>
          <div><span className="font-bold">DATA ORÇAMENTO:</span> {dataOrc}</div>
          <div><span className="font-bold">VALIDADE:</span> {validadeDias}</div>
          <div><span className="font-bold">ATUALIZADO EM:</span> {hojeFormatado}</div>
        </div>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {itens.map((it, idx) => {
            const vUnitario = it.qtd > 0 ? it.val / it.qtd : it.val;
            
            // Extract colors from sub string if possible, or use defaults
            const hasCor = it.cor && it.cor !== "";
            const corVidro = "Incolor"; // Defaulting or parsing from sub if needed
            const corAluminio = hasCor ? it.cor : "Não especificada";

            return (
              <div key={idx} className="border border-gray-300 rounded-sm break-inside-avoid">
                <div className="flex p-3 gap-4">
                  {/* Item Image Placeholder */}
                  <div className="w-24 h-24 bg-[#DCE8E5] border border-gray-300 flex items-center justify-center shrink-0 shadow-inner relative">
                    <div className="absolute w-[2px] h-full bg-white left-1/2 -ml-[1px]"></div>
                    <div className="absolute w-2 h-4 bg-gray-800 right-2 top-1/2 -mt-2"></div>
                  </div>
                  
                  <div className="flex-1 text-[13px] text-gray-800">
                    <div className="font-semibold mb-2">{it.nome}</div>
                    <div className="grid grid-cols-2 gap-y-1">
                      <div>Ambiente: Não especificado</div>
                      <div>Cor vidro: {corVidro}</div>
                      <div>Cor ferragem: Padrão</div>
                      <div>Cor alumínio: {corAluminio}</div>
                    </div>
                  </div>
                </div>

                <table className="w-full text-center text-[11px] border-t border-gray-300 mt-1">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-300">
                      <th className="py-1.5 font-bold">Item</th>
                      <th className="py-1.5 font-bold">Qtde</th>
                      <th className="py-1.5 font-bold">Largura</th>
                      <th className="py-1.5 font-bold">Altura</th>
                      <th className="py-1.5 font-bold">Espessura Vidro</th>
                      <th className="py-1.5 font-bold">V. Unitário</th>
                      <th className="py-1.5 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-gray-900 font-medium">
                    <tr>
                      <td className="py-1.5">{idx + 1}</td>
                      <td className="py-1.5">{it.qtd}</td>
                      <td className="py-1.5">{it.larg > 0 ? it.larg : "-"}</td>
                      <td className="py-1.5">{it.alt > 0 ? it.alt : "-"}</td>
                      <td className="py-1.5">{it.espessura || "-"}</td>
                      <td className="py-1.5">{brl(vUnitario)}</td>
                      <td className="py-1.5">{brl(it.val)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border border-gray-300 rounded-sm mb-6 bg-gray-50/50 break-inside-avoid">
          <div className="bg-[#E6E6E6] border-b border-gray-300 px-3 py-1.5">
            <h3 className="font-medium text-gray-800 text-sm">Valores Finais:</h3>
          </div>
          <div className="p-3 text-[13px] text-gray-800 flex">
            <div className="flex-1 flex gap-12">
              <div>Engenharias:</div>
              <div>{itens.reduce((acc, it) => acc + it.qtd, 0)} unid.</div>
            </div>
            <div className="w-[300px] flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Sub Total:</span>
                <span>{brl(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span>{descontoPerc > 0 ? `${descontoPerc}%` : "0"}</span>
              </div>
              <div className="flex justify-between font-semibold mt-1">
                <span>Total:</span>
                <span>{brl(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Observations */}
        {observacoes && (
          <div className="mb-12 break-inside-avoid">
            <h3 className="font-bold text-gray-900 text-sm mb-2 uppercase">Observação:</h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-wrap">{observacoes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="flex justify-between items-end mt-16 px-8 text-center text-[12px] font-bold text-gray-900 break-inside-avoid">
          <div className="w-64">
            <div className="mb-2 relative h-12">
              <svg className="absolute bottom-2 left-1/2 -ml-12 w-24 h-12 opacity-80" viewBox="0 0 100 50">
                <path d="M 10 30 Q 30 10 50 30 T 90 20" stroke="black" strokeWidth="2" fill="none" />
                <path d="M 20 40 Q 40 10 60 40 T 80 30" stroke="black" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div className="border-t border-gray-800 pt-2 uppercase">Contratado</div>
            <div className="mt-2 font-normal">TEMPER VIDROS SF</div>
          </div>
          <div className="w-64">
            <div className="border-t border-gray-800 pt-2 uppercase">Contratante</div>
            <div className="mt-2 font-normal">{cliente?.nome || "______________________"}</div>
          </div>
        </div>

            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
