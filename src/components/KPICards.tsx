import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Percent, BarChart3, Wallet } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  diff: string;
  isPositive: boolean;
  color: "green" | "red" | "orange" | "blue" | "purple";
  icon: React.ElementType;
}

const colorMap = {
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    gradient: "from-red-500/20 to-red-500/5",
    border: "border-red-500/20",
    bar: "bg-red-500",
  },
  orange: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
  },
  blue: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    gradient: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/20",
    bar: "bg-sky-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20",
    bar: "bg-purple-500",
  },
};

function KPIValue({ value }: { value: string }) {
  const [display, setDisplay] = React.useState("R$ 0,00");
  React.useEffect(() => {
    const timer = setTimeout(() => setDisplay(value), 300);
    return () => clearTimeout(timer);
  }, [value]);
  return <>{display}</>;
}

export default function KPICards({
  receitasTotais,
  despesasTotais,
  lucroLiquido,
  ocupacaoMedia = 78.5,
  roiMedio = 24.7
}: {
  receitasTotais: number;
  despesasTotais: number;
  lucroLiquido: number;
  ocupacaoMedia?: number;
  roiMedio?: number;
}) {
  // Ordered by priority: Receita, Lucro, Ocupação, Despesas, ROI
  const cards: KPICardProps[] = [
    {
      title: "Receita Total",
      value: `R$ ${receitasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      diff: "+12,5%",
      isPositive: true,
      color: "green",
      icon: DollarSign
    },
    {
      title: "Lucro Líquido",
      value: `R$ ${lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      diff: "+8,7%",
      isPositive: true,
      color: "purple",
      icon: TrendingUp
    },
    {
      title: "Taxa de Ocupação",
      value: `${ocupacaoMedia.toFixed(1)}%`,
      diff: "+5,1%",
      isPositive: true,
      color: "blue",
      icon: Percent
    },
    {
      title: "Custos Totais",
      value: `R$ ${despesasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      diff: "-3,2%",
      isPositive: false,
      color: "orange",
      icon: Wallet
    },
    {
      title: "ROI Médio",
      value: `${roiMedio.toFixed(1)}%`,
      diff: "+2,3%",
      isPositive: true,
      color: "green",
      icon: BarChart3
    }
  ];

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const c = colorMap[card.color];

        return (
          <div
            key={idx}
            className="kpi-card kpi-card-fluid flex flex-col justify-between h-auto min-h-[140px] border border-slate-200/10 dark:border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950/40 dark:from-slate-950/60 dark:to-slate-950/90 shadow-xl"
            style={{ borderRadius: "24px" }}
          >
            {/* Top: Title */}
            <div>
              <span className="text-slate-400 text-[10px] xs:text-xs font-bold tracking-wide uppercase block mb-1">
                {card.title}
              </span>
              {/* Middle: Fluid Value */}
              <h3 className="font-display font-black text-lg xs:text-xl sm:text-2xl text-white tracking-tight leading-none">
                <KPIValue value={card.value} />
              </h3>
            </div>

            {/* Bottom: Growth Indicator & Icon */}
            <div className="flex items-end justify-between mt-3">
              <div className="flex flex-col gap-0.5">
                <div className={`flex items-center gap-1 text-[11px] font-extrabold ${card.isPositive ? c.text : "text-red-400"}`}>
                  {card.isPositive ? "↑" : "↓"} {card.diff}
                </div>
                <span className="text-[8px] text-slate-500 font-medium">vs. mês anterior</span>
              </div>
              
              <div className={`${c.bg} ${c.text} p-2 rounded-xl border ${c.border} flex items-center justify-center shrink-0`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
