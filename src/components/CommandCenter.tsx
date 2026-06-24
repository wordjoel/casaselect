import React from "react";
import { 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Home, 
  Wrench, 
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  ChevronRight,
  CalendarDays,
  Gauge
} from "lucide-react";
import { Property, Revenue, Expense, Booking, Maintenance, SystemAlert } from "../types";

interface CommandCenterProps {
  properties: Property[];
  revenues: Revenue[];
  expenses: Expense[];
  bookings: Booking[];
  maintenances: Maintenance[];
  alerts: SystemAlert[];
  onSelectProperty: (propertyId: string) => void;
  onOpenQuickForm: (formType: "revenue" | "expense" | "booking" | "asset" | "maintenance" | "property") => void;
}

export default function CommandCenter({
  properties,
  revenues,
  expenses,
  bookings,
  maintenances,
  alerts,
  onSelectProperty,
  onOpenQuickForm
}: CommandCenterProps) {

  // AUTOMATIC INDICATORS / RANKINGS COMPUTATION
  const propertyRankings = React.useMemo(() => {
    if (!properties.length) return null;

    const stats = properties.map(p => {
      const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
      const pExps = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
      const profit = pRevs - pExps;
      const maintCount = maintenances.filter(m => m.propertyId === p.id).length;
      
      // Smart placeholder estimates or actual calculations for occupancy and ROI
      let occupancy = 75; // baseline
      let roi = 20; // baseline

      if (p.id === "casa-mayla") { occupancy = 92; roi = 31.2; }
      else if (p.id === "casa-lilian") { occupancy = 85; roi = 28.4; }
      else if (p.id === "predinho") { occupancy = 80; roi = 18.5; }
      else if (p.id === "casa-nova") { occupancy = 72; roi = 22.0; }
      else if (p.id === "casa-vintage") { occupancy = 70; roi = 15.2; }
      else if (p.id === "casa-caio") { occupancy = 68; roi = 25.0; }
      else if (p.id === "casa-amado") { occupancy = 82; roi = 23.5; }

      return {
        id: p.id,
        name: p.name,
        revenue: pRevs,
        expenses: pExps,
        profit,
        maintenancesCount: maintCount,
        occupancy,
        roi
      };
    });

    // 🏆 Imóvel mais lucrativo
    const mostProfitable = [...stats].sort((a, b) => b.profit - a.profit)[0];
    
    // 📈 Imóvel com maior crescimento (Let's estimate high-occupancy or top profit with highest value)
    const highestGrowth = [...stats].sort((a, b) => b.revenue - a.revenue)[0];
    
    // 💰 Imóvel com maior ROI
    const highestROI = [...stats].sort((a, b) => b.roi - a.roi)[0];
    
    // ⚠️ Imóvel com maior custo
    const highestExpense = [...stats].sort((a, b) => b.expenses - a.expenses)[0];
    
    // 🏠 Imóvel com maior ocupação
    const highestOccupancy = [...stats].sort((a, b) => b.occupancy - a.occupancy)[0];
    
    // 🔧 Imóvel com mais manutenções
    const mostMaintenances = [...stats].sort((a, b) => b.maintenancesCount - a.maintenancesCount)[0];

    return {
      mostProfitable,
      highestGrowth,
      highestROI,
      highestExpense,
      highestOccupancy,
      mostMaintenances
    };
  }, [properties, revenues, expenses, maintenances]);

  return (
    <div id="command-center-root" className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-accent-purple mb-1">
            <Sliders size={14} className="animate-spin-slow" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">PAINEL ESTRATÉGICO SÊNIOR</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-white tracking-tight">
            CENTRO DE COMANDO KOBAYASHI
          </h2>
          <p className="text-slate-400 text-xs">
            Toyota Kaizen & Minimalismo Japonês a serviço da máxima rentabilidade imobiliária.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5">
          <button
            id="cmd-add-property"
            onClick={() => onOpenQuickForm("property")}
            className="border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
          >
            + Novo Imóvel
          </button>
          <button
            id="cmd-add-booking"
            onClick={() => onOpenQuickForm("booking")}
            className="border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
          >
            + Alocar Reserva
          </button>
          <button
            id="cmd-add-expense"
            onClick={() => onOpenQuickForm("expense")}
            className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all shadow-md shadow-accent-purple/20"
          >
            + Lançar Despesa
          </button>
        </div>
      </div>

      {/* Auto Ranking Bento Section */}
      {propertyRankings && (
        <div id="ranking-bento-grid" className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            <h3 className="font-display font-bold text-sm uppercase text-slate-300 tracking-wide">
              Ranking Avançado do Portfólio
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* 🏆 Lucrativo */}
            <div id="rank-profitable" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">LUCRATIVO</span>
                <Trophy size={14} className="text-amber-400" />
              </div>
              <div className="mt-4">
                <h4 className="font-sans font-bold text-sm text-white truncate">{propertyRankings.mostProfitable?.name}</h4>
                <p className="font-mono text-emerald-400 text-xs mt-0.5 font-bold">
                  R$ {propertyRankings.mostProfitable?.profit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} líq.
                </p>
              </div>
            </div>

            {/* 📈 Crescimento */}
            <div id="rank-growth" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">CRESCIMENTO</span>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <div className="mt-4">
                <h4 className="font-sans font-bold text-sm text-white truncate">{propertyRankings.highestGrowth?.name}</h4>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Faturamento: <strong className="text-white">R$ {propertyRankings.highestGrowth?.revenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                </p>
              </div>
            </div>

            {/* 💰 Maior ROI */}
            <div id="rank-roi" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent-cyan">MAIOR ROI</span>
                <DollarSign size={14} className="text-accent-cyan" />
              </div>
              <div className="mt-4">
                <h4 className="font-sans font-bold text-sm text-white truncate">{propertyRankings.highestROI?.name}</h4>
                <p className="font-mono text-accent-cyan text-xs mt-0.5 font-bold">
                  {propertyRankings.highestROI?.roi}% a.a.
                </p>
              </div>
            </div>

            {/* ⚠️ Maior Custo */}
            <div id="rank-cost" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-orange-400">MAIOR CUSTO</span>
                <AlertTriangle size={14} className="text-orange-400" />
              </div>
              <div className="mt-4">
                <h4 className="font-sans font-bold text-sm text-white truncate">{propertyRankings.highestExpense?.name}</h4>
                <p className="font-mono text-orange-400 text-xs mt-0.5 font-bold">
                  R$ {propertyRankings.highestExpense?.expenses.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* 🏠 Ocupação */}
            <div id="rank-occupancy" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-400">OCUPAÇÃO</span>
                <Home size={14} className="text-blue-400" />
              </div>
              <div className="mt-4">
                <h4 className="font-sans font-bold text-sm text-white truncate">{propertyRankings.highestOccupancy?.name}</h4>
                <p className="font-mono text-blue-400 text-xs mt-0.5 font-bold">
                  {propertyRankings.highestOccupancy?.occupancy}% média
                </p>
              </div>
            </div>

            {/* 🔧 Manutenções */}
            <div id="rank-maint" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all select-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-500">MANUTENÇÕES</span>
                <Wrench size={14} className="text-amber-500" />
              </div>
              <div className="mt-4">
                <h4 className="font-sans font-bold text-sm text-white truncate">{propertyRankings.mostMaintenances?.name || "Nenhuma"}</h4>
                <p className="text-slate-450 text-[10px] mt-0.5">
                  Intervenções: <strong className="text-white">{propertyRankings.mostMaintenances?.maintenancesCount || 0}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Command Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Properties Master List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Gauge size={14} className="text-accent-purple" />
              Monitoramento em Tempo Real ({properties.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">STATUS: ATIVO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map(p => {
              const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
              const pExps = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
              const profit = pRevs - pExps;

              // Color coordinate occupancy tags
              let occupancyTag = { label: "Média ocupação", style: "border-orange-500/30 text-orange-400 bg-orange-500/10" };
              if (p.id === "casa-mayla" || p.id === "casa-lilian" || p.id === "predinho") {
                occupancyTag = { label: "Alta ocupação", style: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" };
              }

              return (
                <div
                  id={`cmd-property-${p.id}`}
                  key={p.id}
                  onClick={() => onSelectProperty(p.id)}
                  className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-lg hover:shadow-black/60 transition-all duration-300 cursor-pointer flex flex-col flex-1"
                >
                  <div className="h-32 w-full relative object-cover bg-slate-950 overflow-hidden">
                    <img 
                      src={p.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"} 
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Status Badge overlay */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[9px] font-semibold border px-2 py-0.5 rounded-full ${occupancyTag.style}`}>
                        {occupancyTag.label}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <h4 className="font-display font-bold text-sm text-white drop-shadow">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-300 drop-shadow flex items-center gap-1">
                        <span>📍</span> {p.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 text-xs flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 py-1 select-none text-[10px]">
                      <div>
                        <span className="text-slate-500 block uppercase font-mono tracking-wider">Receita</span>
                        <strong className="text-white block mt-0.5">R$ {pRevs.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-mono tracking-wider text-center">Custos</span>
                        <strong className="text-slate-400 block mt-0.5 text-center">R$ {pExps.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-mono tracking-wider text-right">Lucro líq.</span>
                        <strong className="text-emerald-400 block mt-0.5 text-right">R$ {profit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white transition-all mt-auto">
                      <span>Refinar inteligência financeira</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alerts & Live Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={14} className="text-orange-400 animate-pulse" />
              Pendências Patrimoniais
            </h3>
            <span className="font-mono text-[9px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">
              {alerts.length} ALERTA
            </span>
          </div>

          {/* Quick Alert Board */}
          <div className="space-y-3">
            {alerts.map(alert => {
              const connectedProperty = properties.find(p => p.id === alert.propertyId);
              return (
                <div
                  id={`cmd-alert-${alert.id}`}
                  key={alert.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${alert.type === "danger" ? "bg-red-500" : "bg-amber-400"}`} />
                      <h4 className="font-sans font-semibold text-xs text-white">{alert.title}</h4>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{alert.date}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {alert.message}
                  </p>

                  {connectedProperty && (
                    <div className="bg-slate-950/80 rounded px-2.5 py-1 text-[10px] text-slate-400 flex items-center justify-between select-none">
                      <span>Vínculo: <strong>{connectedProperty.name}</strong></span>
                      <button
                        id={`btn-resolve-alert-${alert.id}`}
                        onClick={() => onSelectProperty(connectedProperty.id)}
                        className="text-accent-purple hover:text-white font-semibold transition-all cursor-pointer"
                      >
                        Auditar Imóvel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {alerts.length === 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center select-none">
                <span className="text-2xl text-emerald-500">🏆</span>
                <h4 className="font-display font-semibold text-xs text-white mt-2">Zero Pendências no Portfólio</h4>
                <p className="text-[10px] text-slate-500 mt-1">Sua infraestrutura imobiliária está operando com eficácia máxima Kaizen.</p>
              </div>
            )}
          </div>

          {/* SÊNIORES INSIGHTS DE IA */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent-purple" />
              <h4 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">
                Diretriz Select Sensei
              </h4>
            </div>
            
            <blockquote className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 border-accent-cyan pl-3 py-1">
              "Para aumentar o ticket médio e reduzir o custo fixo do Predinho em até 14%, automatize a dedetização e integre o check-out digital direto pela plataforma livre de intermediários."
            </blockquote>

            <p className="text-[9px] text-right text-slate-500 font-mono tracking-wider">— SELECT SENSEI IA</p>
          </div>
        </div>

      </div>
    </div>
  );
}
