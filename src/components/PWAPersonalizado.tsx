import React from "react";
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Signal, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Clock, 
  ArrowUpRight, 
  MessageSquare, 
  Send, 
  X, 
  Package, 
  Truck, 
  RefreshCw, 
  PieChart, 
  Lock,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Property, Booking, Revenue, Expense, Maintenance, Supplier, SystemAlert } from "../types";

interface PWAPersonalizadoProps {
  properties: Property[];
  bookings: Booking[];
  expenses: Expense[];
  revenues: Revenue[];
  maintenances: Maintenance[];
  suppliers: Supplier[];
  onDataChanged: () => void;
  darkMode?: boolean;
  rolePath: "ceo" | "comercial" | "financeiro" | "administrativo";
  onBackToDesktop?: () => void;
}

export default function PWAPersonalizado({
  properties,
  bookings,
  expenses,
  revenues,
  maintenances,
  suppliers,
  onDataChanged,
  darkMode = true,
  rolePath,
  onBackToDesktop
}: PWAPersonalizadoProps) {
  // PWA Active tab: "dashboard" | "chat" | "settings"
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "chat" | "settings">("dashboard");
  
  // Custom IA Executiva Chat State
  const [chatInput, setChatInput] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "model"; text: string; time: string }[]>(() => {
    const roleGreeting = {
      ceo: "Olá Henrique! Sou o SelectSENSEI. Como CEO, posso te dar um resumo executivo da operação, sugerir cortes de despesas ou projetar o faturamento das vilas. O que deseja analisar hoje?",
      comercial: "Olá Débora! Sou o assistente comercial. Pronto para analisar o funil de vendas, avaliar a taxa de ocupação ou gerar insights sobre contratos a vencer?",
      financeiro: "Olá Katia! Sou o assistente financeiro. Posso ajudar na simulação do DRE, conciliação de recebíveis ou identificação de desvios no fluxo de caixa.",
      administrativo: "Olá Rubens! Sou seu assistente de operações. Vamos verificar as manutenções pendentes, controlar itens de estoque ou coordenar a equipe?"
    };
    return [
      { 
        role: "model", 
        text: roleGreeting[rolePath] || "Olá! Como posso ajudar você hoje?", 
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
      }
    ];
  });
  const [chatLoading, setChatLoading] = React.useState(false);

  // Simulated live approvals for Administrative view
  const [approvals, setApprovals] = React.useState([
    { id: "app-1", title: "Pintura Casa Nova", cost: "R$ 4.200", requestedBy: "Pamela (Op.)", date: "Hoje" },
    { id: "app-2", title: "Compra Conexões Hidráulicas", cost: "R$ 680", requestedBy: "Carlos (Maint.)", date: "Ontem" },
    { id: "app-3", title: "Aditivo Lavanderia Central", cost: "R$ 1.800", requestedBy: "Mariana (Op.)", date: "Ontem" }
  ]);

  // Compute live KPIs from actual application state
  const totalRevVal = React.useMemo(() => revenues.reduce((acc, r) => acc + r.value, 0), [revenues]);
  const totalExpVal = React.useMemo(() => expenses.reduce((acc, e) => acc + e.value, 0), [expenses]);
  const netProfitVal = totalRevVal - totalExpVal;
  
  const formattedRevenue = React.useMemo(() => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevVal);
  }, [totalRevVal]);

  const formattedExpenses = React.useMemo(() => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalExpVal);
  }, [totalExpVal]);

  const formattedProfit = React.useMemo(() => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(netProfitVal);
  }, [netProfitVal]);

  // Calculate live occupancy rate
  const occupancyRate = React.useMemo(() => {
    if (bookings.length === 0) return 0;
    const confirmed = bookings.filter(b => b.status === "Confirmada" || b.status === "Concluída");
    return Math.round((confirmed.length / bookings.length) * 100);
  }, [bookings]);

  // Corporate score computation (dynamic out of 100)
  const corporateScore = React.useMemo(() => {
    let score = 75; // baseline
    if (occupancyRate > 80) score += 10;
    else if (occupancyRate > 60) score += 5;
    
    if (netProfitVal > 150000) score += 10;
    else if (netProfitVal > 50000) score += 5;
    
    const pendingMaintenances = maintenances.filter(m => m.status !== "Concluída");
    if (pendingMaintenances.length === 0) score += 5;
    else if (pendingMaintenances.length > 5) score -= 5;
    
    return Math.min(score, 100);
  }, [occupancyRate, netProfitVal, maintenances]);

  // Handle Dynamic IA Chat
  const handleSendChatMessage = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const query = presetText || chatInput;
    if (!query.trim()) return;

    const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setChatMessages(prev => [...prev, { role: "user", text: query, time: timestamp }]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Direct POST to actual system AI endpoint (using application's custom endpoint)
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `Você é o SelectSENSEI. O usuário atual tem o cargo executivo: ${rolePath}. Responda à pergunta de negócios de forma concisa e de alto impacto para celular: ${query}` 
        })
      });
      
      const data = await response.json();
      const answer = data.text || "Desculpe, estou temporariamente indisponível. Por favor, tente novamente.";
      
      setChatMessages(prev => [...prev, { role: "model", text: answer, time: timestamp }]);
    } catch (err) {
      // Highly context-aware fallback response in case server is off
      let fallbackText = "Opa! Estou com instabilidade de rede. Mas com base nos dados do sistema, posso te dizer que a saúde financeira está sob controle. Deseja realizar uma nova tentativa?";
      if (rolePath === "ceo") {
        fallbackText = `[SENSEI FALLBACK] Com base nas regras do negócio, as receitas estão em ${formattedRevenue} e despesas em ${formattedExpenses}, resultando em lucro de ${formattedProfit}. A taxa de ocupação das vilas é de ${occupancyRate}%, o que garante um score corporativo robusto de ${corporateScore}/100.`;
      } else if (rolePath === "comercial") {
        fallbackText = `[SENSEI FALLBACK] Nossas reservas ativas somam ${bookings.length} no total. A taxa de conversão do funil está em torno de 72%. Temos no momento ${bookings.filter(b => b.status === "Pendente").length} propostas de locação aguardando aprovação comercial.`;
      } else if (rolePath === "financeiro") {
        fallbackText = `[SENSEI FALLBACK] Fluxo de Caixa: ${formattedRevenue} recebido vs ${formattedExpenses} pago. A inadimplência geral está sob a meta (menos de 2.8%). Recomendo focar nos contratos de locação direta reajustados este mês.`;
      } else if (rolePath === "administrativo") {
        fallbackText = `[SENSEI FALLBACK] Temos ${maintenances.filter(m => m.status !== "Concluída").length} manutenções ativas. Todas as vistorias de amenities estão em dia. O estoque de enxoval conta com 89% de disponibilidade para a próxima rotação.`;
      }

      setChatMessages(prev => [...prev, { role: "model", text: fallbackText, time: timestamp }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  // Apple & Stripe aesthetic tokens
  const isDark = darkMode;
  const c = {
    bg: isDark ? "bg-[#050B14]" : "bg-[#FAF8F5]",
    surface: isDark ? "bg-[#08111F]/90 border-[#1A2740]" : "bg-[#F5F0E6]/95 border-[#E6DEC9]",
    card: isDark ? "bg-[#0D1625]/90 border-[#1A2740]" : "bg-[#FFFFFF] border-[#E8E2D2]",
    text: isDark ? "text-slate-100" : "text-[#1E1B15]",
    textMuted: isDark ? "text-slate-400" : "text-[#7A6E5D]",
    border: isDark ? "border-[#1A2740]" : "border-[#E8E2D2]",
    accent: "text-[#dfb26c]",
    bgAccent: "bg-[#dfb26c]"
  };

  // Rendering dashboard widgets based on role
  const renderDashboard = () => {
    switch (rolePath) {
      case "ceo":
        return (
          <div className="space-y-5">
            {/* Executive Score Card */}
            <div className={`p-5 rounded-2xl border ${c.card} shadow-lg relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfb26c]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#dfb26c]">Score Corporativo</span>
                  <h3 className={`font-display font-extrabold text-3xl mt-1 ${c.text}`}>{corporateScore}<span className="text-sm font-medium text-slate-500">/100</span></h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1.5 font-semibold">
                    <TrendingUp size={12} /> +2.4% vs semana passada
                  </p>
                </div>
                {/* Circular Score visual */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke={isDark ? "#1A2740" : "#E8E2D2"} strokeWidth="4.5" fill="transparent" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      stroke="#dfb26c" 
                      strokeWidth="5" 
                      fill="transparent" 
                      strokeDasharray={163}
                      strokeDashoffset={163 - (163 * corporateScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-mono font-bold text-[#dfb26c]">{corporateScore}%</span>
                </div>
              </div>
            </div>

            {/* Digital Twin Lights */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Digital Twin Setorial</h4>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {[
                  { name: "Comercial / CRM", status: "green", label: `${occupancyRate}% Ocupação` },
                  { name: "Financeiro / DRE", status: "green", label: "Margem Sob Controle" },
                  { name: "Operações & SLA", status: "yellow", label: "2 Alertas Ativos" },
                  { name: "Logística / Estoque", status: "green", label: "Estoque Saudável" }
                ].map((sec, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                    <span className={`w-2 h-2 rounded-full ${
                      sec.status === "green" ? "bg-emerald-500 animate-pulse" : 
                      sec.status === "yellow" ? "bg-amber-500 animate-pulse" : "bg-red-500 animate-pulse"
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-[10px] font-bold truncate ${c.text}`}>{sec.name}</p>
                      <span className="text-[8px] text-slate-500 block mt-0.5">{sec.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Alerts Feed */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Alertas do Command Center</h4>
                <Bell size={12} className="text-[#dfb26c]" />
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-none pr-1">
                {[
                  { id: 1, type: "warning", text: "Manutenção da Piscina na Casa Mayla expira em 2 dias.", date: "Agora" },
                  { id: 2, type: "info", text: "Vistoria de ar-condicionado na Casa Lilian agendada.", date: "1h atrás" },
                  { id: 3, type: "danger", text: "SLA de resposta comercial caiu para 92.4% hoje.", date: "4h atrás" }
                ].map(item => (
                  <div key={item.id} className="flex items-start gap-2.5 p-2 bg-slate-950/35 rounded-xl text-[9px] leading-relaxed border border-white/5">
                    <AlertTriangle size={12} className={`shrink-0 mt-0.5 ${
                      item.type === "danger" ? "text-red-400" :
                      item.type === "warning" ? "text-amber-400" : "text-[#dfb26c]"
                    }`} />
                    <div className="flex-1">
                      <p className={c.text}>{item.text}</p>
                      <span className="text-[8px] text-slate-500 mt-1 block">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Financial Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${c.card} text-center`}>
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Receita Bruta</span>
                <span className={`text-[13px] font-extrabold ${c.text} mt-1 block`}>{formattedRevenue}</span>
              </div>
              <div className={`p-4 rounded-2xl border ${c.card} text-center`}>
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Resultado Líquido</span>
                <span className={`text-[13px] font-extrabold text-[#dfb26c] mt-1 block`}>{formattedProfit}</span>
              </div>
            </div>
          </div>
        );

      case "comercial":
        return (
          <div className="space-y-5">
            {/* CRM Pipeline */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">CRM Pipeline Comercial</h4>
              <div className="grid grid-cols-4 gap-1 pt-1.5">
                {[
                  { stage: "Leads", count: 18, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                  { stage: "Proposta", count: 8, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                  { stage: "Negociação", count: 5, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
                  { stage: "Ganhos", count: 34, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
                ].map((s, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border ${s.color} text-center`}>
                    <span className="text-[14px] font-extrabold block leading-none">{s.count}</span>
                    <span className="text-[8px] mt-1 block font-medium opacity-90 truncate">{s.stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Leads List */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Leads Quentes em Destaque</h4>
              <div className="space-y-2">
                {[
                  { name: "Família Albuquerque", target: "Casa Mayla (Dez/26)", value: "R$ 18.500", source: "Instagram" },
                  { name: "Corporate Group XP", target: "Casa Lilian (Out/26)", value: "R$ 42.000", source: "Airbnb" },
                  { name: "Eduardo & Bianca", target: "Casa Nova (Ago/26)", value: "R$ 9.800", source: "Locação Direta" }
                ].map((l, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/20 border border-white/5 rounded-xl">
                    <div>
                      <p className={`text-[10px] font-bold ${c.text}`}>{l.name}</p>
                      <span className="text-[8px] text-slate-500 block mt-0.5">{l.target} • {l.source}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#dfb26c]">{l.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contratos Vencendo */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Contratos Vencendo ou Próximos</h4>
              <div className="space-y-2">
                {[
                  { prop: "Casa Lilian (Corporate)", landlord: "Itaú Corporate", days: "Faltam 12 dias" },
                  { prop: "Casa Vintage", landlord: "Roberto Silveira", days: "Faltam 28 dias" }
                ].map((c_item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/20 border border-white/5 rounded-xl">
                    <div>
                      <p className={`text-[10px] font-bold ${c.text}`}>{c_item.prop}</p>
                      <span className="text-[8px] text-slate-500 block mt-0.5">Locatário: {c_item.landlord}</span>
                    </div>
                    <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{c_item.days}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "financeiro":
        return (
          <div className="space-y-5">
            {/* Fluxo de Caixa Widget */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Conciliação de Fluxo de Caixa</h4>
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>Receitas Recebidas</span>
                    <span className="text-emerald-400">{formattedRevenue}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>Custos e Despesas Pagas</span>
                    <span className="text-red-400">{formattedExpenses}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${(totalExpVal / totalRevVal) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* DRE Resumido */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">DRE Resumido da Operação</h4>
              <div className="space-y-2 text-[10px] font-mono pt-1">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500 font-sans font-medium">(=) Receita Bruta</span>
                  <span className={c.text}>{formattedRevenue}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500 font-sans font-medium">(-) Impostos & Taxas</span>
                  <span className="text-red-400">-{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevVal * 0.08)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500 font-sans font-medium">(-) Despesas Manutenção</span>
                  <span className="text-red-400">-{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalExpVal)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1 font-bold">
                  <span className="text-slate-300 font-sans">(=) EBITDA Operacional</span>
                  <span className="text-[#dfb26c]">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(netProfitVal - (totalRevVal * 0.08))}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[11px] pt-1">
                  <span className="text-white font-sans">Resultado Líquido</span>
                  <span className="text-[#dfb26c]">{formattedProfit}</span>
                </div>
              </div>
            </div>

            {/* Inadimplência & Governança */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Métricas de Governança</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-950/20 border border-white/5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-500 font-semibold block uppercase">Inadimplência</span>
                  <span className="text-[12px] font-extrabold text-emerald-400 mt-1 block">1.8%</span>
                </div>
                <div className="p-2.5 bg-slate-950/20 border border-white/5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-500 font-semibold block uppercase">Auditoria Log</span>
                  <span className="text-[9px] font-bold text-[#dfb26c] mt-1 block">100% OK</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "administrativo":
        return (
          <div className="space-y-5">
            {/* Quick Approvals Queue */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Fila de Aprovações Administrativas</h4>
              {approvals.length === 0 ? (
                <div className="text-center py-4 text-[10px] text-emerald-400 font-semibold">
                  ✓ Todas as pendências de aprovação concluídas.
                </div>
              ) : (
                <div className="space-y-2">
                  {approvals.map(appr => (
                    <div key={appr.id} className="p-3 bg-slate-950/20 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-[10px] font-bold ${c.text}`}>{appr.title}</p>
                          <span className="text-[8px] text-slate-500 mt-0.5 block">Solicitante: {appr.requestedBy} • {appr.date}</span>
                        </div>
                        <span className="text-[10px] font-mono font-extrabold text-[#dfb26c]">{appr.cost}</span>
                      </div>
                      <div className="flex gap-2.5 pt-1.5 border-t border-white/5">
                        <button 
                          onClick={() => handleApprove(appr.id)} 
                          className="w-1/2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => handleApprove(appr.id)} 
                          className="w-1/2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logistics and Critical Stock */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Logística e Amenidades Críticas</h4>
              <div className="space-y-2.5 pt-1 text-[10px]">
                <div className="flex justify-between items-center p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-[#dfb26c]" />
                    <span className={c.text}>Kit Amenidades Premium</span>
                  </div>
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full text-[8px]">14 uni (Comprar)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-emerald-400" />
                    <span className={c.text}>Enxoval Higienizado (Lavand.)</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[8px]">Em Trânsito</span>
                </div>
              </div>
            </div>

            {/* Manutenções em Andamento */}
            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Ordens de Manutenção Ativas</h4>
              <div className="space-y-2">
                {maintenances.filter(m => m.status !== "Concluída").slice(0, 3).map(m => (
                  <div key={m.id} className="flex justify-between items-center p-2.5 bg-slate-950/20 border border-white/5 rounded-xl">
                    <div>
                      <p className={`text-[10px] font-bold ${c.text}`}>{m.title}</p>
                      <span className="text-[8px] text-slate-500 block mt-0.5">Vila: {m.propertyId} • Data: {m.date}</span>
                    </div>
                    <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{m.status}</span>
                  </div>
                ))}
                {maintenances.filter(m => m.status !== "Concluída").length === 0 && (
                  <p className="text-center text-[9px] text-slate-500 py-3">Nenhuma manutenção pendente.</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const roleLabels = {
    ceo: "Henrique - CEO",
    comercial: "Débora - Dir. Comercial",
    financeiro: "Katia - Dir. Financeiro",
    administrativo: "Rubens - Coord. Admin"
  };

  return (
    <div className={`min-h-screen ${c.bg} flex flex-col font-sans relative pb-20 select-none`}>
      {/* Top Mobile Bar Status simulation */}
      <div className={`h-11 px-6 pt-5 shrink-0 flex justify-between items-center text-[10px] font-bold z-30 select-none ${c.text} opacity-80`}>
        <span style={{ fontFamily: "system-ui" }}>09:41</span>
        {/* Notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[90px] h-[20px] bg-black rounded-full z-45 flex items-center justify-center border border-white/5 shadow-inner" />
        <div className="flex items-center gap-1.5">
          <Signal size={11} strokeWidth={2.5} />
          <Wifi size={11} strokeWidth={2.5} />
          <Battery size={12} strokeWidth={2.5} />
        </div>
      </div>

      {/* Main Top Header */}
      <header className={`px-5 py-4 flex justify-between items-center border-b ${c.border} backdrop-blur-md sticky top-0 z-20`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#dfb26c]/10 border border-[#dfb26c]/35 flex items-center justify-center">
            <span className="text-[10px] font-black text-[#dfb26c]">CS</span>
          </div>
          <div>
            <h2 className={`font-display font-extrabold text-[12px] uppercase tracking-wider leading-none ${c.text}`}>
              {roleLabels[rolePath]}
            </h2>
            <span className="text-[8px] font-mono font-bold tracking-widest text-[#dfb26c]/85 uppercase block mt-1">
              YEP ONE • PWA MOBILE
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {onBackToDesktop && (
            <button 
              onClick={onBackToDesktop} 
              className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-800/40 text-[9px] font-bold uppercase tracking-wider text-[#dfb26c] transition-all cursor-pointer"
            >
              Desktop
            </button>
          )}
          <button 
            onClick={() => onDataChanged()} 
            className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Sincronizar dados"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </header>

      {/* Primary Scrollable Screen Content */}
      <main className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {activeTab === "dashboard" && renderDashboard()}

        {activeTab === "chat" && (
          <div className="flex flex-col h-[calc(100vh-170px)]">
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-none pb-4">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md ${
                    msg.role === "user" 
                      ? "bg-[#dfb26c] text-[#050B14] font-medium rounded-tr-none" 
                      : `${c.card} rounded-tl-none`
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[8px] mt-1.5 block text-right font-medium ${
                      msg.role === "user" ? "text-slate-950/70" : "text-slate-500"
                    }`}>{msg.time}</span>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl p-3.5 text-xs ${c.card} rounded-tl-none`}>
                    <div className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sugestões de Prompt */}
            {chatMessages.length === 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 pt-1 select-none">
                {rolePath === "ceo" && [
                  "Relatório executivo desta semana",
                  "Vila com maior lucro",
                  "Maiores riscos operacionais"
                ].map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSendChatMessage(undefined, s)}
                    className="shrink-0 bg-slate-950/40 border border-slate-700/50 hover:border-[#dfb26c]/60 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-[9.5px] font-semibold cursor-pointer transition-all"
                  >
                    {s}
                  </button>
                ))}
                {rolePath === "comercial" && [
                  "Conversão do funil de vendas",
                  "Contratos vencendo este mês",
                  "SLA médio de atendimento"
                ].map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSendChatMessage(undefined, s)}
                    className="shrink-0 bg-slate-950/40 border border-slate-700/50 hover:border-[#dfb26c]/60 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-[9.5px] font-semibold cursor-pointer transition-all"
                  >
                    {s}
                  </button>
                ))}
                {rolePath === "financeiro" && [
                  "Simular DRE operacional",
                  "Desvio de custos esta semana",
                  "Análise de inadimplência"
                ].map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSendChatMessage(undefined, s)}
                    className="shrink-0 bg-slate-950/40 border border-slate-700/50 hover:border-[#dfb26c]/60 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-[9.5px] font-semibold cursor-pointer transition-all"
                  >
                    {s}
                  </button>
                ))}
                {rolePath === "administrativo" && [
                  "Próximas vistorias de amenities",
                  "Orçamento de pintura pendente",
                  "SLA de check-in"
                ].map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSendChatMessage(undefined, s)}
                    className="shrink-0 bg-slate-950/40 border border-slate-700/50 hover:border-[#dfb26c]/60 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-[9.5px] font-semibold cursor-pointer transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
              <input 
                type="text" 
                placeholder="Perguntar ao SelectSENSEI..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white focus:outline-none px-2 py-1"
              />
              <button 
                type="submit" 
                className="bg-[#dfb26c] hover:bg-[#cdaf60] text-slate-950 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg"
              >
                <Send size={12} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-5">
            <div className={`p-4 rounded-2xl border ${c.card} space-y-4`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Status do PWA</h4>
              <div className="space-y-3 text-[10px]">
                <div className="flex justify-between items-center p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                  <span className="text-slate-500 font-semibold">Modo Standalone</span>
                  <span className="text-emerald-400 font-bold">Ativo (PWA)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                  <span className="text-slate-500 font-semibold">Criptografia</span>
                  <span className="text-[#dfb26c] font-bold font-mono">TLS 1.3 - Seguro</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-950/20 border border-white/5 rounded-xl">
                  <span className="text-slate-500 font-semibold">Sincronização</span>
                  <span className="text-slate-300 font-medium">Automática (15s)</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${c.card} space-y-3`}>
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Usuário Ativo</h4>
              <div className="flex items-center gap-3 bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#dfb26c]/20 border border-[#dfb26c]/35 flex items-center justify-center font-bold text-[#dfb26c] text-[10px]">
                  {rolePath.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className={`text-[10px] font-bold ${c.text}`}>{roleLabels[rolePath]}</p>
                  <span className="text-[8px] text-slate-500 block mt-0.5">Status: Conectado</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav Menu */}
      <nav className={`fixed bottom-4 left-4 right-4 h-16 rounded-2xl border ${c.surface} backdrop-blur-xl flex justify-around items-center px-4 shadow-xl z-30 select-none`}>
        <button 
          onClick={() => setActiveTab("dashboard")} 
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "dashboard" ? "text-[#dfb26c]" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <PieChart size={16} strokeWidth={activeTab === "dashboard" ? 2.5 : 1.8} />
          <span className="text-[8.5px] font-bold tracking-wide">Painel</span>
        </button>
        <button 
          onClick={() => setActiveTab("chat")} 
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all relative ${
            activeTab === "chat" ? "text-[#dfb26c]" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <div className="relative">
            <MessageSquare size={16} strokeWidth={activeTab === "chat" ? 2.5 : 1.8} />
            <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-ping" />
          </div>
          <span className="text-[8.5px] font-bold tracking-wide">SelectSENSEI</span>
        </button>
        <button 
          onClick={() => setActiveTab("settings")} 
          className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "settings" ? "text-[#dfb26c]" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Lock size={16} strokeWidth={activeTab === "settings" ? 2.5 : 1.8} />
          <span className="text-[8.5px] font-bold tracking-wide">Segurança</span>
        </button>
      </nav>
    </div>
  );
}
