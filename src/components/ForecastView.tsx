import React from "react";
import { 
  TrendingUp, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { getForecast } from "../data/api";

type ForecastData = {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
  occupancy: number;
};

export default function ForecastView() {
  const [data, setData] = React.useState<ForecastData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    return !document.documentElement.classList.contains("light");
  });

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(!document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fetchProjections = async () => {
    setLoading(true);
    try {
      const forecast = await getForecast();
      setData(forecast);
    } catch (err) {
      console.error("Erro ao carregar previsões:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjections();
  }, []);

  return (
    <div id="forecast-view-root" className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5 select-none">
        <div>
          <div className="flex items-center gap-2 text-accent-purple mb-1">
            <Sparkles size={14} className="animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">MÓDULO DE PREVISÃO DE IA</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            PROJEÇÃO DE FLUXO E APETITE OPERACIONAL
          </h2>
          <p className="text-slate-400 text-xs">
            Modelagem estatística preditiva de faturamento e ocupação para os próximos 6 meses.
          </p>
        </div>

        <button 
          id="btn-recalc-projections"
          onClick={fetchProjections}
          className="border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Fazer Recalibragem</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-xs text-slate-200 font-semibold">Simulando Projeções Financeiras...</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Executando vetores de crescimento e amortização de gastos</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Forecast Chart Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart plot - 2 cols */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                  Fluxo de Caixa Mensal Projetado (Seis Meses)
                </h3>
                <span className="bg-emerald-500/15 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-mono border border-emerald-500/20 uppercase tracking-widest">
                  ALTO APETITE (+5% Ocupação)
                </span>
              </div>

              <div id="chart-forecast-container" className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#e2e8f0"} vertical={false} />
                    <XAxis dataKey="month" stroke={darkMode ? "#64748b" : "#475569"} tickLine={false} />
                    <YAxis stroke={darkMode ? "#64748b" : "#475569"} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? "#0f1115" : "#ffffff", 
                        borderColor: darkMode ? "#1f2937" : "#e2e8f0", 
                        borderRadius: "10px", 
                        color: darkMode ? "#e2e8f0" : "#0f172a" 
                      }}
                      itemStyle={{ color: darkMode ? "#ccd6f6" : "#334155" }}
                      labelStyle={{ color: darkMode ? "#ffffff" : "#0f172a" }}
                    />
                    <Legend />
                    <Bar name="Receita Projetada" dataKey="revenue" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
                    <Bar name="Despesa Projetada" dataKey="expense" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar name="Lucro Líquido" dataKey="profit" fill="#00cec9" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Occupocany forecast & Analytics Kaizen */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 select-none">
                  Previsão de Ocupação Média
                </h3>

                <div className="h-44 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#e2e8f0"} />
                      <XAxis dataKey="month" stroke={darkMode ? "#64748b" : "#475569"} />
                      <YAxis stroke={darkMode ? "#64748b" : "#475569"} domain={[70, 95]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? "#0f1115" : "#ffffff", 
                          borderColor: darkMode ? "#1f2937" : "#e2e8f0", 
                          color: darkMode ? "#e2e8f0" : "#0f172a" 
                        }}
                        itemStyle={{ color: darkMode ? "#ccd6f6" : "#334155" }}
                        labelStyle={{ color: darkMode ? "#ffffff" : "#0f172a" }}
                      />
                      <Line name="Ocupação Média %" type="monotone" dataKey="occupancy" stroke="#00cec9" strokeWidth={2} dot={{ fill: "#00cec9" }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-accent-cyan">
                  <ShieldCheck size={14} />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">DIRETRIZ DE CRESCIMENTO</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  As projeções de IA apontam que a **Casa Mayla** e o **Predinho** sustentarão as maiores taxas de diária agregadas. O ROI acumulado do grupo expandirá para **26,9%** em Novembro de 2026.
                </p>
              </div>
            </div>

          </div>

          {/* Forecast Cards bento details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans select-none">
            <div className="bg-slate-905 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Média Faturamento Bimestral</span>
              <h4 className="text-white text-lg font-bold">R$ {(data.reduce((s, d) => s + d.revenue, 0) / 3).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h4>
              <p className="text-[10px] text-emerald-400">↑ Velocidade de crescimento constante de +2.0% ao mês</p>
            </div>

            <div className="bg-slate-905 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Amortização de Custo Fixo</span>
              <h4 className="text-white text-lg font-bold">R$ {(data.reduce((s, d) => s + d.expense, 0) / 6).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</h4>
              <p className="text-[10px] text-accent-cyan">↓ Economia de custos operacionais acumulados com Kaizen de -1.5% ao mês</p>
            </div>

            <div className="bg-slate-905 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Margem Média Estimada</span>
              <h4 className="text-white text-lg font-bold">
                {((data.reduce((s, d) => s + d.profit, 0) / data.reduce((s, d) => s + d.revenue, 0)) * 100).toFixed(1)}%
              </h4>
              <p className="text-[10px] text-accent-purple">Garante alto reinvestimento e capitalização segura</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
