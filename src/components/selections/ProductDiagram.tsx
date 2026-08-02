import React from "react";

type ItemMetadata = {
  nome: string;
  sub?: string;
  descricao?: string;
  categoria?: string;
  ambiente?: string;
  cor_ferragem?: string;
  cor_vidro?: string;
  cor_aluminio?: string;
  imagem_url?: string;
  num_folhas?: number;
  larg?: number;
  alt?: number;
};

export function ProductDiagram({ item }: { item: ItemMetadata }) {
  // If custom image provided, use it
  if (item.imagem_url) {
    return (
      <div className="w-full h-full flex items-center justify-center p-1">
        <img
          src={item.imagem_url}
          alt={item.nome}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  const nameLower = (item.nome || "").toLowerCase();
  const catLower = (item.categoria || "").toLowerCase();
  const subLower = ((item.sub || "") + " " + (item.descricao || "")).toLowerCase();

  // Janela 4 folhas com bate-fecha v/v
  if (
    nameLower.includes("bate-fecha") ||
    nameLower.includes("bate fecha") ||
    nameLower.includes("v/v") ||
    nameLower.includes("vidro/vidro") ||
    subLower.includes("bate-fecha") ||
    subLower.includes("bate fecha") ||
    (nameLower.includes("janela") && (nameLower.includes("4") || nameLower.includes("quatro") || nameLower.includes("4f")))
  ) {
    return <Janela4FolhasBateFechaDiagram />;
  }

  // Porta Pivotante com corte para fechadura maçaneta / sem furo p/ trinco / 1907 / 1101s
  if (
    nameLower.includes("maçaneta") ||
    nameLower.includes("macaneta") ||
    nameLower.includes("sem furo") ||
    subLower.includes("maçaneta") ||
    subLower.includes("macaneta") ||
    nameLower.includes("1907") ||
    nameLower.includes("1101")
  ) {
    return <PortaPivotanteMacanetaDiagram />;
  }

  // Multiportas (e.g. Multiportas quatro folhas, 4 folhas, versatik, stanley, etc.)
  if (
    nameLower.includes("multiportas") ||
    catLower.includes("multi portas") ||
    nameLower.includes("multi portas") ||
    nameLower.includes("stanley") ||
    nameLower.includes("versatik")
  ) {
    return <MultiportasDiagram item={item} />;
  }

  // Espelho com bisotê / Bisotado
  if (
    nameLower.includes("bisotê") ||
    nameLower.includes("bisote") ||
    subLower.includes("bisotê") ||
    subLower.includes("bisote")
  ) {
    return <EspelhoBisoteDiagram />;
  }

  // Espelho Simples
  if (nameLower.includes("espelho") || catLower.includes("espelho")) {
    return <EspelhoSimplesDiagram />;
  }

  // Pivotante (com dobradiça 1230 / 1101)
  if (
    nameLower.includes("pivotante") ||
    catLower.includes("pivotante") ||
    nameLower.includes("1230") ||
    subLower.includes("pivotante")
  ) {
    return <PivotanteDiagram />;
  }

  // Janela
  if (nameLower.includes("janela") || catLower.includes("janela")) {
    if (nameLower.includes("4") || nameLower.includes("quatro")) {
      return <Janela4FolhasBateFechaDiagram />;
    }
    return <JanelaDiagram nameLower={nameLower} />;
  }

  // Box
  if (nameLower.includes("box") || catLower.includes("box")) {
    return <BoxDiagram nameLower={nameLower} />;
  }

  // Báscula / Maxim-ar / Basculante
  if (
    nameLower.includes("báscula") ||
    nameLower.includes("bascula") ||
    nameLower.includes("basculante") ||
    nameLower.includes("maxim") ||
    catLower.includes("báscula")
  ) {
    return <BasculaDiagram />;
  }

  // Fechamento de Pia
  if (nameLower.includes("pia") || catLower.includes("fechamento de pia")) {
    return <FechamentoPiaDiagram />;
  }

  // Guarda-corpo
  if (
    nameLower.includes("guarda") ||
    nameLower.includes("corrimão") ||
    catLower.includes("guarda-corpo")
  ) {
    return <GuardaCorpoDiagram />;
  }

  // Porta com bandeira
  if (nameLower.includes("bandeira") || catLower.includes("porta com bandeira")) {
    return <PortaBandeiraDiagram />;
  }

  // Porta de correr / padrão
  if (nameLower.includes("porta") || catLower.includes("porta")) {
    return <PortaCorrerDiagram />;
  }

  // Tampo de mesa
  if (nameLower.includes("tampo") || nameLower.includes("mesa")) {
    return <TampoMesaDiagram />;
  }

  // Fallback generic glass diagram
  return <GenericVidroDiagram name={item.nome} />;
}

/* ─────────────────────────────────────────────────────────────
   1. Janela 4 folhas com bate-fecha v/v (exact screenshot)
   ───────────────────────────────────────────────────────────── */
function Janela4FolhasBateFechaDiagram() {
  return (
    <svg viewBox="0 0 250 160" className="w-full h-full max-h-[125px] select-none">
      <defs>
        <linearGradient id="janelaBateFechaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2ECE9" />
          <stop offset="100%" stopColor="#CBDCD7" />
        </linearGradient>
      </defs>

      {/* Top dimension: Largura do vão */}
      <line x1="30" y1="15" x2="225" y2="15" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="30" y1="10" x2="30" y2="20" stroke="#333" strokeWidth="1" />
      <line x1="225" y1="10" x2="225" y2="20" stroke="#333" strokeWidth="1" />
      <text x="127" y="12" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#222">
        Largura do vão
      </text>

      {/* Left dimension: Altura do vão */}
      <line x1="12" y1="28" x2="12" y2="145" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="8" y1="28" x2="16" y2="28" stroke="#333" strokeWidth="1" />
      <line x1="8" y1="145" x2="16" y2="145" stroke="#333" strokeWidth="1" />
      <text
        x="9"
        y="86"
        textAnchor="middle"
        fontSize="8"
        fontFamily="sans-serif"
        fill="#222"
        transform="rotate(-90 9 86)"
      >
        Altura do vão
      </text>

      {/* Frame Outer */}
      <rect x="25" y="25" width="200" height="120" fill="none" stroke="#333" strokeWidth="1.5" />
      {/* Top Track bar */}
      <rect x="25" y="25" width="200" height="6" fill="#888" />

      {/* Hardware labels top: 1125 1125 1125 1125 */}
      <text x="73" y="24" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" fill="#444">1125</text>
      <text x="110" y="24" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" fill="#444">1125</text>
      <text x="140" y="24" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" fill="#444">1125</text>
      <text x="177" y="24" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" fill="#444">1125</text>
      <circle cx="64" cy="23" r="1.5" fill="#444" />
      <circle cx="119" cy="23" r="1.5" fill="#444" />
      <circle cx="131" cy="23" r="1.5" fill="#444" />
      <circle cx="186" cy="23" r="1.5" fill="#444" />

      {/* 4 Glass Leaves */}
      <rect x="26" y="31" width="48" height="113" fill="url(#janelaBateFechaGrad)" stroke="#555" strokeWidth="1" />
      <rect x="75" y="31" width="48" height="113" fill="url(#janelaBateFechaGrad)" stroke="#555" strokeWidth="1" />
      <rect x="124" y="31" width="48" height="113" fill="url(#janelaBateFechaGrad)" stroke="#555" strokeWidth="1" />
      <rect x="173" y="31" width="48" height="113" fill="url(#janelaBateFechaGrad)" stroke="#555" strokeWidth="1" />

      {/* Faint reflection */}
      <path d="M 26 31 L 221 144" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" fill="none" />
      <path d="M 75 31 L 173 144" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" fill="none" />

      {/* Meeting lock (1570 1570) at center x=123 */}
      <text x="115" y="80" textAnchor="end" fontSize="6" fontFamily="sans-serif" fill="#222">1570</text>
      <text x="131" y="80" textAnchor="start" fontSize="6" fontFamily="sans-serif" fill="#222">1570</text>
      <circle cx="118" cy="88" r="2" fill="none" stroke="#222" strokeWidth="1" />
      <circle cx="128" cy="88" r="2" fill="none" stroke="#222" strokeWidth="1" />
      <line x1="114" y1="94" x2="132" y2="94" stroke="#222" strokeWidth="1.5" />

      {/* Vertical P1 line */}
      <line x1="123" y1="96" x2="123" y2="144" stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
      <text x="114" y="120" fontSize="10" fontFamily="sans-serif" fill="#333">P1</text>

      {/* Panel labels F1, F2, F3, F4 */}
      <text x="38" y="138" fontSize="16" fontWeight="bold" fontFamily="sans-serif" fill="#222">F1</text>
      <text x="87" y="138" fontSize="16" fontWeight="bold" fontFamily="sans-serif" fill="#222">F2</text>
      <text x="136" y="138" fontSize="16" fontWeight="bold" fontFamily="sans-serif" fill="#222">F3</text>
      <text x="185" y="138" fontSize="16" fontWeight="bold" fontFamily="sans-serif" fill="#222">F4</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. Porta Pivotante com corte para fechadura maçaneta (exact screenshot)
   ───────────────────────────────────────────────────────────── */
function PortaPivotanteMacanetaDiagram() {
  return (
    <svg viewBox="0 0 160 170" className="w-full h-full max-h-[125px] select-none">
      <defs>
        <linearGradient id="pivMacanetaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2ECE9" />
          <stop offset="100%" stopColor="#C4D7D2" />
        </linearGradient>
      </defs>

      {/* Top dimension: Largura do vão */}
      <line x1="30" y1="15" x2="125" y2="15" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="30" y1="11" x2="30" y2="19" stroke="#333" strokeWidth="1" />
      <line x1="125" y1="11" x2="125" y2="19" stroke="#333" strokeWidth="1" />
      <text x="77" y="12" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#222">
        Largura do vão
      </text>

      {/* Left dimension: Altura do vão */}
      <line x1="12" y1="28" x2="12" y2="155" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="8" y1="28" x2="16" y2="28" stroke="#333" strokeWidth="1" />
      <line x1="8" y1="155" x2="16" y2="155" stroke="#333" strokeWidth="1" />
      <text
        x="9"
        y="91"
        textAnchor="middle"
        fontSize="8"
        fontFamily="sans-serif"
        fill="#222"
        transform="rotate(-90 9 91)"
      >
        Altura do vão
      </text>

      {/* Glass Leaf */}
      <rect x="30" y="25" width="95" height="130" fill="url(#pivMacanetaGrad)" stroke="#555" strokeWidth="1.5" />

      {/* Reflection line */}
      <line x1="35" y1="45" x2="105" y2="115" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />

      {/* Panel label F1 */}
      <text x="77" y="70" textAnchor="middle" fontSize="24" fontWeight="bold" fontFamily="sans-serif" fill="#222">
        F1
      </text>

      {/* Top left hinge 1101S */}
      <rect x="30" y="25" width="12" height="8" fill="#555" rx="1" />
      <text x="31" y="42" fontSize="6.5" fontFamily="sans-serif" fill="#333">1101S</text>

      {/* Bottom left hinge 1103S */}
      <rect x="30" y="147" width="12" height="8" fill="#555" rx="1" />
      <text x="31" y="144" fontSize="6.5" fontFamily="sans-serif" fill="#333">1103S</text>

      {/* Bottom right hinge 1335 */}
      <rect x="113" y="147" width="12" height="8" fill="#555" rx="1" />
      <text x="114" y="144" fontSize="6.5" fontFamily="sans-serif" fill="#333">1335</text>

      {/* Handle cutout & 1907 in RED */}
      <text x="108" y="93" textAnchor="middle" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif" fill="#E53E3E">
        1907
      </text>
      <rect x="115" y="97" width="10" height="13" fill="#555" rx="1" />
      <line x1="115" y1="103" x2="104" y2="103" stroke="#222" strokeWidth="2" />

      {/* P1 vertical line */}
      <line x1="104" y1="103" x2="104" y2="155" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
      <text x="94" y="132" fontSize="12" fontFamily="sans-serif" fill="#222">P1</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. Multiportas (quatro folhas sem puxador / etc.)
   ───────────────────────────────────────────────────────────── */
function MultiportasDiagram({ item }: { item: ItemMetadata }) {
  const numFolhas = item.num_folhas || 4;
  return (
    <svg viewBox="0 0 250 120" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="glassGradMulti" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2ECE9" />
          <stop offset="100%" stopColor="#CBDCD7" />
        </linearGradient>
      </defs>

      {/* Top track bar */}
      <line x1="20" y1="20" x2="230" y2="20" stroke="#333" strokeWidth="1.5" />

      {/* 4 Leaves (F1, F2, F3, F4) */}
      {[0, 1, 2, 3].slice(0, numFolhas).map((idx) => {
        const x = 25 + idx * 50;
        return (
          <g key={idx}>
            {/* Top fittings (00 120) */}
            <text x={x + 3} y="15" fontSize="7" fontFamily="sans-serif" fill="#444">00 120</text>
            <text x={x + 27} y="15" fontSize="7" fontFamily="sans-serif" fill="#444">00 120</text>

            {/* Glass panel */}
            <rect
              x={x}
              y="22"
              width="46"
              height="85"
              fill="url(#glassGradMulti)"
              stroke="#555"
              strokeWidth="1"
            />

            {/* Panel label F1, F2, F3, F4 */}
            <text
              x={x + 23}
              y="68"
              textAnchor="middle"
              fontSize="12"
              fontFamily="sans-serif"
              fontWeight="bold"
              fill="#222"
            >
              F{idx + 1}
            </text>
          </g>
        );
      })}

      {/* Left side dashed fold line with arrow & F1 text */}
      <line x1="18" y1="25" x2="18" y2="105" stroke="#666" strokeWidth="1" strokeDasharray="3,3" />
      <path d="M 15 50 L 18 45 L 21 50" fill="none" stroke="#444" strokeWidth="1" />
      <text x="12" y="70" fontSize="8" fontFamily="sans-serif" fill="#555">F1</text>

      {/* Right side dashed fold line with arrow */}
      <line x1="232" y1="25" x2="232" y2="105" stroke="#666" strokeWidth="1" strokeDasharray="3,3" />
      <path d="M 229 50 L 232 45 L 235 50" fill="none" stroke="#444" strokeWidth="1" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. Espelho com bisotê
   ───────────────────────────────────────────────────────────── */
function EspelhoBisoteDiagram() {
  return (
    <svg viewBox="0 0 160 140" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="mirrorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF5F3" />
          <stop offset="50%" stopColor="#D5E5E1" />
          <stop offset="100%" stopColor="#C4DADB" />
        </linearGradient>
      </defs>

      {/* Main Glass Panel */}
      <rect
        x="25"
        y="18"
        width="90"
        height="114"
        fill="url(#mirrorGrad)"
        stroke="#777"
        strokeWidth="1.5"
      />

      {/* Inner Bisotê border line */}
      <rect
        x="30"
        y="23"
        width="80"
        height="104"
        fill="none"
        stroke="#888"
        strokeWidth="0.8"
        strokeDasharray="2,2"
      />

      {/* Faint reflection shine lines */}
      <line x1="30" y1="40" x2="90" y2="120" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
      <line x1="45" y1="30" x2="100" y2="105" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.7" />

      {/* Pointer Line to Bisotê */}
      <polyline points="110,23 125,10 140,10" fill="none" stroke="#222" strokeWidth="1" />
      <text x="142" y="13" fontSize="10" fontFamily="sans-serif" fill="#000">
        Bisotê
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. Espelho Simples (Lapidado)
   ───────────────────────────────────────────────────────────── */
function EspelhoSimplesDiagram() {
  return (
    <svg viewBox="0 0 160 140" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="mirrorGradSimple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2F8F6" />
          <stop offset="100%" stopColor="#CEE1DC" />
        </linearGradient>
      </defs>

      <rect
        x="35"
        y="15"
        width="90"
        height="114"
        fill="url(#mirrorGradSimple)"
        stroke="#666"
        strokeWidth="1.5"
      />
      {/* Light sheen */}
      <line x1="40" y1="35" x2="95" y2="115" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
      <line x1="55" y1="25" x2="110" y2="100" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. Pivotante com dobradiça 1230
   ───────────────────────────────────────────────────────────── */
function PivotanteDiagram() {
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="glassGradPiv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2ECE9" />
          <stop offset="100%" stopColor="#C4D7D2" />
        </linearGradient>
      </defs>

      {/* Glass Leaf */}
      <rect
        x="35"
        y="10"
        width="60"
        height="120"
        fill="url(#glassGradPiv)"
        stroke="#666"
        strokeWidth="1.5"
      />

      {/* Reflection line */}
      <line x1="40" y1="30" x2="85" y2="90" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />

      {/* Top hinge 1230 (dobradiça 1230 superior) */}
      <rect x="55" y="10" width="18" height="6" fill="#333" rx="1" />

      {/* Bottom hinge 1230 (dobradiça 1230 inferior) */}
      <rect x="55" y="124" width="18" height="6" fill="#333" rx="1" />

      {/* Bottom corner lock / latch (fechadura 1520) */}
      <rect x="85" y="112" width="6" height="7" fill="#333" rx="1" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. Janela de Correr (2 ou 4 folhas)
   ───────────────────────────────────────────────────────────── */
function JanelaDiagram({ nameLower }: { nameLower: string }) {
  const is4Folhas = nameLower.includes("4") || nameLower.includes("quatro");

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="janelaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F1EE" />
          <stop offset="100%" stopColor="#D0E2DD" />
        </linearGradient>
      </defs>

      {/* Frame */}
      <rect x="15" y="15" width="170" height="90" fill="none" stroke="#333" strokeWidth="2" />
      {/* Track bar top & bottom */}
      <line x1="15" y1="20" x2="185" y2="20" stroke="#444" strokeWidth="1" />
      <line x1="15" y1="100" x2="185" y2="100" stroke="#444" strokeWidth="1" />

      {is4Folhas ? (
        <>
          {/* 4 leaves */}
          <rect x="17" y="21" width="41" height="78" fill="url(#janelaGrad)" stroke="#555" />
          <rect x="59" y="21" width="41" height="78" fill="url(#janelaGrad)" stroke="#555" />
          <rect x="101" y="21" width="41" height="78" fill="url(#janelaGrad)" stroke="#555" />
          <rect x="143" y="21" width="41" height="78" fill="url(#janelaGrad)" stroke="#555" />
          <text x="37" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">F1</text>
          <text x="79" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">F2</text>
          <text x="121" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">F3</text>
          <text x="163" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">F4</text>
        </>
      ) : (
        <>
          {/* 2 leaves */}
          <rect x="17" y="21" width="82" height="78" fill="url(#janelaGrad)" stroke="#555" />
          <rect x="101" y="21" width="82" height="78" fill="url(#janelaGrad)" stroke="#555" />
          <text x="58" y="65" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333">F1 (Fixo)</text>
          <text x="142" y="65" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333">F2 (Móvel)</text>
          {/* Arrow */}
          <line x1="130" y1="85" x2="155" y2="85" stroke="#333" strokeWidth="1.5" />
          <polygon points="155,82 160,85 155,88" fill="#333" />
        </>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   8. Box de Banheiro
   ───────────────────────────────────────────────────────────── */
function BoxDiagram({ nameLower }: { nameLower: string }) {
  return (
    <svg viewBox="0 0 180 130" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ECF4F2" />
          <stop offset="100%" stopColor="#D4E4DF" />
        </linearGradient>
      </defs>

      {/* Upper round bar */}
      <rect x="15" y="15" width="150" height="4" fill="#555" rx="2" />
      {/* Wall brackets */}
      <rect x="10" y="12" width="6" height="10" fill="#333" />
      <rect x="164" y="12" width="6" height="10" fill="#333" />

      {/* Fixed panel */}
      <rect x="20" y="20" width="70" height="98" fill="url(#boxGrad)" stroke="#666" />
      {/* Sliding door */}
      <rect x="88" y="20" width="72" height="98" fill="url(#boxGrad)" stroke="#666" />

      {/* Handle knob */}
      <circle cx="100" cy="70" r="3.5" fill="#333" />

      {/* Labels */}
      <text x="55" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">Fixo</text>
      <text x="124" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">Porta</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   9. Báscula / Maxim-ar / Basculante
   ───────────────────────────────────────────────────────────── */
function BasculaDiagram() {
  return (
    <svg viewBox="0 0 150 130" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="basculaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF6F4" />
          <stop offset="100%" stopColor="#D5E6E1" />
        </linearGradient>
      </defs>

      {/* Outer frame */}
      <rect x="25" y="15" width="100" height="100" fill="none" stroke="#333" strokeWidth="2" />

      {/* Pivot sash */}
      <rect x="29" y="19" width="92" height="92" fill="url(#basculaGrad)" stroke="#555" />

      {/* Pivot arm / stays */}
      <line x1="25" y1="65" x2="125" y2="65" stroke="#777" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="25" cy="65" r="3" fill="#333" />
      <circle cx="125" cy="65" r="3" fill="#333" />

      <text x="75" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">Basculante</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   10. Fechamento de Pia
   ───────────────────────────────────────────────────────────── */
function FechamentoPiaDiagram() {
  return (
    <svg viewBox="0 0 180 120" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="piaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBF3F1" />
          <stop offset="100%" stopColor="#D4E4DF" />
        </linearGradient>
      </defs>

      {/* Countertop top line */}
      <rect x="10" y="15" width="160" height="6" fill="#888" rx="1" />

      {/* Glass doors */}
      <rect x="15" y="22" width="73" height="85" fill="url(#piaGrad)" stroke="#555" />
      <rect x="91" y="22" width="74" height="85" fill="url(#piaGrad)" stroke="#555" />

      {/* Handles */}
      <rect x="75" y="60" width="4" height="15" rx="1" fill="#333" />
      <rect x="99" y="60" width="4" height="15" rx="1" fill="#333" />

      <text x="50" y="68" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">F1</text>
      <text x="127" y="68" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">F2</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   11. Guarda-corpo
   ───────────────────────────────────────────────────────────── */
function GuardaCorpoDiagram() {
  return (
    <svg viewBox="0 0 160 130" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="gcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF6F4" />
          <stop offset="100%" stopColor="#D4E5E0" />
        </linearGradient>
      </defs>

      {/* Handrail tube top */}
      <rect x="15" y="15" width="130" height="5" fill="#444" rx="2" />

      {/* Glass Leaf */}
      <rect x="20" y="21" width="120" height="85" fill="url(#gcGrad)" stroke="#555" />

      {/* Spigots / Stainless steel towers at bottom */}
      <rect x="40" y="106" width="10" height="15" fill="#555" rx="1" />
      <rect x="110" y="106" width="10" height="15" fill="#555" rx="1" />
      <line x1="10" y1="121" x2="150" y2="121" stroke="#333" strokeWidth="1.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   12. Porta com bandeira
   ───────────────────────────────────────────────────────────── */
function PortaBandeiraDiagram() {
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="pbGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBF3F1" />
          <stop offset="100%" stopColor="#D2E3DE" />
        </linearGradient>
      </defs>

      {/* Outer frame */}
      <rect x="25" y="10" width="90" height="120" fill="none" stroke="#333" strokeWidth="1.5" />

      {/* Top Transom (Bandeira) */}
      <rect x="27" y="12" width="86" height="30" fill="url(#pbGrad)" stroke="#555" />
      <text x="70" y="31" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#444">Bandeira</text>

      {/* Transom bar */}
      <line x1="25" y1="43" x2="115" y2="43" stroke="#333" strokeWidth="2" />

      {/* Door Leaf */}
      <rect x="27" y="45" width="86" height="83" fill="url(#pbGrad)" stroke="#555" />
      <text x="70" y="90" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">Porta</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   13. Porta de correr (padrão)
   ───────────────────────────────────────────────────────────── */
function PortaCorrerDiagram() {
  return (
    <svg viewBox="0 0 160 130" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBF3F1" />
          <stop offset="100%" stopColor="#D2E3DE" />
        </linearGradient>
      </defs>

      {/* Top Rail */}
      <rect x="15" y="12" width="130" height="5" fill="#333" rx="1" />

      {/* Fixed Leaf */}
      <rect x="20" y="17" width="58" height="102" fill="url(#pcGrad)" stroke="#555" />
      {/* Sliding Leaf */}
      <rect x="76" y="17" width="60" height="102" fill="url(#pcGrad)" stroke="#555" />

      {/* Handle */}
      <rect x="84" y="60" width="3" height="20" rx="1" fill="#222" />

      <text x="49" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">F1</text>
      <text x="106" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#444">F2</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   14. Tampo de Mesa
   ───────────────────────────────────────────────────────────── */
function TampoMesaDiagram() {
  return (
    <svg viewBox="0 0 160 120" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="tmGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4FAF8" />
          <stop offset="100%" stopColor="#CFE2DC" />
        </linearGradient>
      </defs>

      {/* Bevelled tabletop ellipse */}
      <ellipse cx="80" cy="60" rx="65" ry="40" fill="url(#tmGrad)" stroke="#555" strokeWidth="1.5" />
      <ellipse cx="80" cy="60" rx="59" ry="35" fill="none" stroke="#888" strokeWidth="0.8" strokeDasharray="2,2" />

      {/* Reflection line */}
      <line x1="45" y1="40" x2="110" y2="75" stroke="#FFFFFF" strokeWidth="3" opacity="0.7" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   15. Fallback generic glass diagram
   ───────────────────────────────────────────────────────────── */
function GenericVidroDiagram({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 140 130" className="w-full h-full max-h-[110px] select-none">
      <defs>
        <linearGradient id="genGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0F6F4" />
          <stop offset="100%" stopColor="#D4E4DF" />
        </linearGradient>
      </defs>

      <rect x="25" y="15" width="90" height="100" fill="url(#genGrad)" stroke="#666" strokeWidth="1.5" rx="1" />
      <line x1="30" y1="30" x2="95" y2="95" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.7" />
      <text x="70" y="70" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#444">
        {name.length > 15 ? name.substring(0, 15) + "..." : name}
      </text>
    </svg>
  );
}
