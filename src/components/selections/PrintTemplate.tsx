import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProductDiagram } from "./ProductDiagram";

export type Item = {
  nome: string;
  sub?: string;
  descricao?: string;
  qtd: number;
  larg: number;
  alt: number;
  espessura: string;
  cor: string;
  val: number;
  ambiente?: string;
  cor_ferragem?: string;
  cor_vidro?: string;
  cor_aluminio?: string;
  imagem_url?: string;
  categoria?: string;
  num_folhas?: number;
};

type PrintTemplateProps = {
  numero: string;
  dataEmissao: string;
  validade: string;
  cliente: {
    nome: string;
    telefone?: string | null;
    endereco?: string | null;
    endereco_completo?: string | null;
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

function parseItemDetails(it: Item) {
  let ambiente = it.ambiente;
  let corFerragem = it.cor_ferragem;
  let corVidro = it.cor_vidro;
  let corAluminio = it.cor_aluminio;

  const fullText = [it.nome, it.sub, it.descricao, it.cor].filter(Boolean).join(" • ");

  if (!ambiente) {
    const m = fullText.match(/Ambiente:\s*([^•|\n,]+)/i);
    if (m) ambiente = m[1].trim();
  }

  if (!corFerragem) {
    const m = fullText.match(/(?:Cor ferragem|ferragem):\s*([^•|\n,]+)/i);
    if (m) corFerragem = m[1].trim();
  }

  if (!corVidro) {
    const m = fullText.match(/(?:Cor vidro|vidro):\s*([^•|\n,]+)/i);
    if (m) corVidro = m[1].trim();
  }

  if (!corAluminio) {
    const m = fullText.match(/(?:Cor alumínio|cor aluminio|alumínio|aluminio):\s*([^•|\n,]+)/i);
    if (m) corAluminio = m[1].trim();
  }

  let obsItem: string | undefined = undefined;
  const obsMatch = fullText.match(/Obs:\s*([^•|\n]+)/i) || fullText.match(/(Lado\s+[^•|\n]+)/i);
  if (obsMatch) obsItem = obsMatch[1].trim();

  return { ambiente, corFerragem, corVidro, corAluminio, obsItem };
}

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
                
                {/* Client Name & Address Details */}
                <div className="mb-2 border-b border-gray-300 pb-2">
                  <h2 className="text-base font-bold uppercase text-gray-900">{cliente?.nome || "CLIENTE NÃO INFORMADO"}</h2>
                  {(cliente?.telefone || cliente?.endereco || cliente?.endereco_completo) && (
                    <div className="text-[12px] text-gray-700 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                      {cliente?.telefone && <div><span className="font-semibold">Telefone:</span> {cliente.telefone}</div>}
                      {(cliente?.endereco || cliente?.endereco_completo) && (
                        <div><span className="font-semibold">Endereço:</span> {cliente.endereco || cliente.endereco_completo}</div>
                      )}
                    </div>
                  )}
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
                  const { ambiente, corFerragem, corVidro, corAluminio, obsItem } = parseItemDetails(it);

                  return (
                    <div key={idx} className="border border-gray-300 rounded-sm break-inside-avoid">
                      <div className="flex p-3 gap-6 items-center min-h-[110px]">
                        {/* Item Technical SVG / Custom Image */}
                        <div className="w-48 h-32 bg-white border border-gray-200 flex items-center justify-center shrink-0 p-1 rounded-sm">
                          <ProductDiagram item={it} />
                        </div>
                        
                        {/* Item Text Details matching user screenshot */}
                        <div className="flex-1 text-[15px] text-gray-900 leading-snug">
                          <div className="text-[17px] font-normal mb-2 text-black">{it.nome}</div>
                          {ambiente && <div className="mb-2">Ambiente: {ambiente}</div>}
                          {it.larg > 0 && it.alt > 0 && (
                            <div className="mb-2">
                              <div className="font-normal">Sugestão de medidas</div>
                              <div>F1 - L:{it.larg} mm x A:{it.alt} mm</div>
                            </div>
                          )}
                          {corFerragem && <div className="mb-1">Cor ferragem: {corFerragem}</div>}
                          {corVidro && <div className="mb-1">Cor vidro: {corVidro}</div>}
                          {corAluminio && <div className="mb-1">Cor alumínio: {corAluminio}</div>}
                          {obsItem && (
                            <div className="mt-2">
                              <div className="font-normal">Obs:</div>
                              <div>{obsItem}</div>
                            </div>
                          )}
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
