import React from "react";
import { DollarSign, TrendingUp, Percent, BarChart3, Users, ClipboardCheck, Award, Layers } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  diff: string;
  isPositive: boolean;
  sparklinePath: string;
  color: string;
  icon: React.ElementType;
}

function KPIValue({ value }: { value: string }) {
  const [display, setDisplay] = React.useState("...");
  React.useEffect(() => {
    const timer = setTimeout(() => setDisplay(value), 100);
    return () => clearTimeout(timer);
  }, [value]);
  return <>{display}</>;
}

export default function KPICards({
  receitasTotais,
  despesasTotais,
  lucroLiquido,
  ocupacaoMedia = 78.5,
  roiMedio = 28.4
}: {
  receitasTotais: number;
  despesasTotais: number;
  lucroLiquido: number;
  ocupacaoMedia?: number;
  roiMedio?: number;
}) {
  const cards: KPICardProps[] = [
    {
      title: "Receita Total",
      value: `R$ ${receitasTotais.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      diff: "+18,6%",
      isPositive: true,
      sparklinePath: "M0,25 Q15,10 30,20 T60,5 T100,15",
      color: "#C8A27A", // Champagne Gold
      icon: DollarSign
    },
    {
      title: "Lucro Líquido",
      value: `R$ ${lucroLiquido.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      diff: "+24,1%",
      isPositive: true,
      sparklinePath: "M0,28 Q20,15 40,25 T70,5 T100,10",
      color: "#34d399", // Emerald
      icon: TrendingUp
    },
    {
      title: "Reservas do Mês",
      value: "42",
      diff: "+12,5%",
      isPositive: true,
      sparklinePath: "M0,20 Q20,25 40,10 T75,18 T100,5",
      color: "#60a5fa", // Sky Blue
      icon: ClipboardCheck
    },
    {
      title: "Taxa de Ocupação",
      value: `${ocupacaoMedia.toFixed(1)}%`,
      diff: "+5,1%",
      isPositive: true,
      sparklinePath: "M0,22 Q25,8 50,18 T100,5",
      color: "#a855f7", // Purple
      icon: Percent
    },
    {
      title: "Diária Média",
      value: "R$ 1.450",
      diff: "+8,7%",
      isPositive: true,
      sparklinePath: "M0,15 Q30,22 60,8 T100,5",
      color: "#fbbf24", // Gold Amber
      icon: Layers
    },
    {
      title: "ROI Consolidado",
      value: `${roiMedio.toFixed(1)}%`,
      diff: "+3,2%",
      isPositive: true,
      sparklinePath: "M0,25 Q30,30 60,12 T100,3",
      color: "#C8A27A", // Champagne Gold
      icon: BarChart3
    },
    {
      title: "Hóspedes Recorrentes",
      value: "68%",
      diff: "+6,4%",
      isPositive: true,
      sparklinePath: "M0,20 Q25,25 50,12 T100,8",
      color: "#f43f5e", // Rose
      icon: Award
    },
    {
      title: "Reservas Diretas",
      value: "35%",
      diff: "+14,2%",
      isPositive: true,
      sparklinePath: "M0,25 Q20,12 50,22 T100,5",
      color: "#10b981", // Teal
      icon: Users
    }
  ];

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 w-full select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="kpi-card kpi-card-fluid flex flex-col justify-between h-auto min-h-[145px] border border-slate-200/10 dark:border-slate-800/80 bg-gradient-to-br from-white/70 to-white/30 dark:from-[#121922]/80 dark:to-[#121922]/40 shadow-sm transition-all duration-200"
            style={{ borderRadius: "20px" }}
          >
            {/* Top: Title */}
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[9.5px] font-bold tracking-wider uppercase block mb-1">
                {card.title}
              </span>
              {/* Value */}
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-800 dark:text-white tracking-tight leading-none">
                <KPIValue value={card.value} />
              </h3>
            </div>

            {/* Sparkline Graphic */}
            <div className="h-7 w-full my-2 opacity-80">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path
                  d={card.sparklinePath}
                  fill="none"
                  stroke={card.color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* Bottom: Growth Indicator & Icon */}
            <div className="flex items-end justify-between mt-1">
              <div className="flex flex-col gap-0.5">
                <div className={`flex items-center gap-0.5 text-[9.5px] font-extrabold text-emerald-500`}>
                  {card.isPositive ? "↑" : "↓"} {card.diff}
                </div>
                <span className="text-[7.5px] text-slate-400 dark:text-slate-500">vs. mês ant.</span>
              </div>
              
              <div 
                className="p-1.5 rounded-lg flex items-center justify-center shrink-0 border"
                style={{ 
                  backgroundColor: `${card.color}15`, 
                  borderColor: `${card.color}30`,
                  color: card.color
                }}
              >
                <Icon size={12} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
