import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowUpRight, ArrowDownRight, Percent, Sparkles, Building, 
  Calendar, DollarSign, FileDown, Bell, BellOff, X, Check,
  Clock
} from "lucide-react";
import { Property, FinanceItem, AgendaEvent } from "./types";
import Logo from "./Logo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Helper to check if eventDate is exactly 1 day after todayDate
const isOneDayBefore = (eventDateStr: string, todayDateStr: string): boolean => {
  try {
    const eventDate = new Date(eventDateStr + "T00:00:00");
    const todayDate = new Date(todayDateStr + "T00:00:00");
    const diffTime = eventDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  } catch (e) {
    return false;
  }
};

interface HomeScreenProps {
  key?: string;
  properties: Property[];
  finances: FinanceItem[];
  agenda: AgendaEvent[];
  onSwitchTab: (tab: string) => void;
  isDarkMode: boolean;
  onExportPDF?: () => void;
  resortMood?: "luxury" | "party" | "pet";
  onSwitchResortMood?: (mood: "luxury" | "party" | "pet") => void;
  loggedUser?: string | null;
}

export default function HomeScreen({ 
  properties, 
  finances, 
  agenda = [], 
  onSwitchTab, 
  isDarkMode, 
  onExportPDF,
  resortMood = "luxury",
  onSwitchResortMood,
  loggedUser
}: HomeScreenProps) {
  const [selectedChartPoint, setSelectedChartPoint] = useState<number | null>(null);

  // --- Push reminder simulation system states ---
  const [simulatedToday, setSimulatedToday] = useState<string>("2026-05-16");
  const [showPushBanner, setShowPushBanner] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    id: string;
    title: string;
    text: string;
    type: string;
    time: string;
    propertyName?: string;
  } | null>(null);
  
  // Track checklist tasks that the user clicked to conclude
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  // Track disabled notification mode
  const [notificationsDisabled, setNotificationsDisabled] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Filter current active/uncompleted tasks for notification badge
  const dayAgendaActive = agenda.filter(ev => isOneDayBefore(ev.date, simulatedToday) && !completedTasks.includes(ev.id));
  const dayFinancesActive = finances.filter(f => f.date === simulatedToday && !completedTasks.includes(f.id));
  const activeNotificationCount = dayAgendaActive.length + dayFinancesActive.length;

  // Math calculated dynamically based on real state lists!
  const totalRevenues = finances
    .filter((f) => f.type === "receita")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = finances
    .filter((f) => f.type === "despesa")
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalRevenues - totalExpenses;

  const averageOccupancy = properties.length > 0
    ? parseFloat((properties.reduce((sum, item) => sum + item.ocupacao, 0) / properties.length).toFixed(1))
    : 0;

  // Formatting helpers
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Trigger simulated push notification banner on date switch or list sizing change
  useEffect(() => {
    if (notificationsDisabled) return;

    // Filter events and tasks for the simulated today date
    const dayAgenda = agenda.filter(ev => isOneDayBefore(ev.date, simulatedToday));
    const dayFinances = finances.filter(f => f.date === simulatedToday);

    let titleStr = "CASA SELECT • LEMBRETE";
    let bodyStr = "Tudo em ordem para o dia selecionado. Sem novas pendências!";
    let alertType = "info";
    let alertTime = "agora";

    if (dayAgenda.length > 0) {
      const activeEv = dayAgenda[0];
      const timeStr = activeEv.time || "12:00";
      
      if (activeEv.type === "checkin") {
        titleStr = "🛎️ NOVO CHECK-IN IMINENTE";
        bodyStr = `Entrada programada na ${activeEv.propertyName} para as ${timeStr}. Confirme chaves e kits de boas-vindas.`;
        alertType = "checkin";
      } else if (activeEv.type === "checkout") {
        titleStr = "🔑 CHECK-OUT AGENDADO";
        bodyStr = `Saída programada de hóspede na ${activeEv.propertyName} às ${timeStr}. Equipe de inspeção notificada.`;
        alertType = "checkout";
      } else if (activeEv.type === "limpeza") {
        titleStr = "🧹 ORDEM DE SERVIÇO: LIMPEZA";
        bodyStr = `Faxina agendada para as ${timeStr} na ${activeEv.propertyName}. Confirme insumos com governança.`;
        alertType = "limpeza";
      } else {
        titleStr = "🛠️ ALERTA DE MANUTENÇÃO";
        bodyStr = `Chamado operacional na ${activeEv.propertyName} programado para as ${timeStr}: ${activeEv.description}.`;
        alertType = "manutencao";
      }
      alertTime = timeStr;
    } else if (dayFinances.length > 0) {
      const activeFin = dayFinances[0];
      const isRev = activeFin.type === "receita";
      if (isRev) {
        titleStr = "💰 APORTE DE RECEITA CONFIRMADO";
        bodyStr = `Seu repasse de aluguel sobre a "${activeFin.propertyName}" no valor de ${formatBRL(activeFin.amount)} foi creditado!`;
        alertType = "aluguel";
      } else {
        titleStr = "⚠️ CONTAS / DESPESA DO DIA";
        bodyStr = `Fatura vence hoje: "${activeFin.title}" na ${activeFin.propertyName} no valor de ${formatBRL(activeFin.amount)}.`;
        alertType = "despesa";
      }
      alertTime = "08:00";
    }

    setToastMessage({
      id: `push-${Date.now()}`,
      title: titleStr,
      text: bodyStr,
      type: alertType,
      time: alertTime,
      propertyName: dayAgenda[0]?.propertyName || dayFinances[0]?.propertyName || "Portfólio"
    });
    
    setShowPushBanner(true);

    const timer = setTimeout(() => {
      setShowPushBanner(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, [simulatedToday, agenda.length, finances.length, notificationsDisabled]);

  // Pre-configured historical data points for the interactive SVG chart
  const historicalData = [
    { month: "Jan", receita: 95400, despesa: 32000 },
    { month: "Fev", receita: 110200, despesa: 41000 },
    { month: "Mar", receita: 118400, despesa: 38200 },
    { month: "Abr", receita: 121500, despesa: 43200 },
    { month: "Mai", receita: totalRevenues, despesa: totalExpenses },
  ];

  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto no-scrollbar space-y-3.5 pb-12">
      {/* Greetings Banner */}
      <div className="flex justify-end items-center pt-2.5">
        {/* Bell notification trigger */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className={`relative p-2 rounded-full border transition-all active:scale-95 cursor-pointer ${
            isDarkMode 
              ? "bg-neutral-900/60 border-neutral-800 text-[#C59B27] hover:bg-neutral-800"
              : "bg-amber-100/45 border-amber-200/50 text-[#916B21] hover:bg-amber-100/70"
          }`}
          title="Notificações e Lembretes"
        >
          <Bell size={15} />
          {activeNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-extrabold flex items-center justify-center animate-pulse">
              {activeNotificationCount}
            </span>
          )}
        </button>
      </div>

      {/* FLOATING SIMULATED iOS PUSH TOAST BANNER */}
      <AnimatePresence>
        {showPushBanner && toastMessage && !notificationsDisabled && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute top-1 transform left-0 right-0 z-50 px-2 pointer-events-auto"
          >
            <div className={`p-3 rounded-xl border flex flex-col shadow-xl backdrop-blur-md transition-all ${
              isDarkMode 
                ? "bg-[#1C1C1E]/95 border-neutral-800 text-neutral-100" 
                : "bg-white/95 border-amber-200 text-amber-950 shadow-amber-900/10"
            }`}>
              {/* Header with App Logo */}
              <div className="flex justify-between items-center mb-1 pb-1 border-b border-current/10">
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-4 rounded bg-[#C59B27] text-white flex items-center justify-center font-display font-semibold text-[8px]">
                    CS
                  </div>
                  <span className="font-bold text-[8px] tracking-wider uppercase opacity-75">CASA SELECT</span>
                </div>
                <div className="flex items-center space-x-1 text-[8px] opacity-60">
                  <Clock size={9} />
                  <span>{toastMessage.time}</span>
                  <button 
                    onClick={() => setShowPushBanner(false)}
                    className="p-0.5 rounded-full hover:bg-current/10 active:scale-95 cursor-pointer ml-1"
                  >
                    <X size={9} />
                  </button>
                </div>
              </div>

              {/* Alert Content */}
              <div className="flex items-start space-x-2">
                <span className={`p-1.5 rounded-lg mt-0.5 flex items-center justify-center ${
                  toastMessage.type === "checkin" ? "bg-emerald-500/15 text-emerald-500" :
                  toastMessage.type === "checkout" ? "bg-amber-500/15 text-amber-500" :
                  toastMessage.type === "limpeza" ? "bg-sky-500/15 text-sky-500" :
                  toastMessage.type === "manutencao" ? "bg-rose-500/15 text-rose-500" :
                  toastMessage.type === "aluguel" ? "bg-green-500/15 text-green-500" :
                  "bg-amber-50/15 text-[#C29438]"
                }`}>
                  <Bell size={11} className="animate-bounce" />
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[10.5px] select-none block tracking-tight">{toastMessage.title}</span>
                  <p className={`text-[9px] leading-tight select-none mt-0.5 ${isDarkMode ? "text-neutral-300" : "text-stone-600 font-medium"}`}>
                    {toastMessage.text}
                  </p>
                </div>
              </div>

              {/* Footer Interactive Actions */}
              <div className="flex justify-end space-x-1.5 mt-1.5 pt-1 border-t border-current/5">
                <button
                  onClick={() => {
                    setShowPushBanner(false);
                    if (toastMessage.type === "aluguel" || toastMessage.type === "despesa") {
                      onSwitchTab("financeiro");
                    } else {
                      onSwitchTab("calendario");
                    }
                  }}
                  className="text-[7.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C59B27]/15 text-[#C59B27] hover:bg-[#C59B27]/25 transition active:scale-95 cursor-pointer"
                >
                  Ver no App
                </button>
                <button
                  onClick={() => setShowPushBanner(false)}
                  className="text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-current/5 hover:bg-current/10 transition active:scale-95 cursor-pointer opacity-70"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DRAWER: Notificações de Hoje / Central de Lembretes */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNotificationsOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs z-40 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-h-[85%] rounded-t-2xl p-4 flex flex-col shadow-2xl relative border-t ${
                isDarkMode 
                  ? "bg-[#1C1C1E] border-neutral-800 text-neutral-100" 
                  : "bg-white border-amber-100 text-amber-950"
              }`}
            >
              {/* Drag handle / Indicator pill */}
              <div className="w-10 h-1 bg-current/20 rounded-full mx-auto mb-3" />
              
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-1.5">
                  <Bell size={13} className="text-[#C29438] animate-pulse" />
                  <h3 className="font-display font-extrabold text-xs tracking-tight">
                    Notificações de Hoje
                  </h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Silencer/Mudo toggle inside notifications */}
                  <button 
                    onClick={() => setNotificationsDisabled(!notificationsDisabled)}
                    className="p-1 px-1.5 rounded-md hover:bg-current/5 transition-all text-[8px] flex items-center space-x-1 font-mono tracking-tight cursor-pointer"
                  >
                    {notificationsDisabled ? (
                      <span className="text-neutral-400 flex items-center space-x-1">
                        <BellOff size={10} />
                        <span>Mudo</span>
                      </span>
                    ) : (
                      <span className="text-[#C59B27] flex items-center space-x-1 font-bold">
                        <Bell size={10} className="animate-pulse" />
                        <span>Ativo</span>
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className={`p-1 rounded-full cursor-pointer transition ${
                      isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"
                    }`}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Simulated Dates Picker */}
              <div className="mb-3 p-1.5 rounded-lg bg-neutral-100/50 dark:bg-neutral-900/40 flex items-center justify-between gap-2 border border-current/5">
                <span className="text-[8px] uppercase tracking-wider opacity-65 font-bold shrink-0">
                  📅 Simular Data:
                </span>
                <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1 justify-end">
                  <button
                    onClick={() => setSimulatedToday("2026-05-16")}
                    className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold text-center border transition-all cursor-pointer ${
                      simulatedToday === "2026-05-16"
                        ? "bg-[#C59B27] border-[#C59B27] text-white shadow-sm"
                        : isDarkMode
                          ? "bg-neutral-800 border-neutral-700/60 text-neutral-400"
                          : "bg-white border-amber-100 text-stone-700"
                    }`}
                  >
                    16/Mai
                  </button>
                  <button
                    onClick={() => setSimulatedToday("2026-05-14")}
                    className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold text-center border transition-all cursor-pointer ${
                      simulatedToday === "2026-05-14"
                        ? "bg-[#C59B27] border-[#C59B27] text-white shadow-sm"
                        : isDarkMode
                          ? "bg-neutral-800 border-neutral-700/60 text-neutral-400"
                          : "bg-white border-amber-100 text-stone-700"
                    }`}
                  >
                    14/Mai
                  </button>
                  <button
                    onClick={() => setSimulatedToday("2026-05-18")}
                    className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold text-center border transition-all cursor-pointer ${
                      simulatedToday === "2026-05-18"
                        ? "bg-[#C59B27] border-[#C59B27] text-white shadow-sm"
                        : isDarkMode
                          ? "bg-neutral-800 border-neutral-700/60 text-neutral-400"
                          : "bg-white border-amber-100 text-stone-700"
                    }`}
                  >
                    18/Mai
                  </button>
                  <button
                    onClick={() => {
                      const deviceToday = new Date().toISOString().split("T")[0];
                      setSimulatedToday(deviceToday);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold text-center border transition-all cursor-pointer ${
                      simulatedToday !== "2026-05-16" && simulatedToday !== "2026-05-14" && simulatedToday !== "2026-05-18"
                        ? "bg-[#C59B27] border-[#C59B27] text-white shadow-sm"
                        : isDarkMode
                          ? "bg-neutral-800 border-neutral-700/60 text-neutral-400"
                          : "bg-white border-amber-100 text-stone-700"
                    }`}
                  >
                    Hoje
                  </button>
                </div>
              </div>

              {/* Scrollable notifications list */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mt-1 pr-0.5">
                {(() => {
                  const dayAgenda = agenda.filter(ev => isOneDayBefore(ev.date, simulatedToday));
                  const dayFinances = finances.filter(f => f.date === simulatedToday);
                  
                  const totalTodayEvents = dayAgenda.length + dayFinances.length;

                  if (totalTodayEvents === 0) {
                    return (
                      <div className="py-8 px-4 rounded-lg border border-dashed border-current/10 flex flex-col items-center justify-center text-center">
                        <Check size={20} className="text-[#C59B27] mb-1.5 opacity-80" />
                        <span className="text-[10px] font-bold">Sem eventos urgentes</span>
                        <p className="text-[8.5px] max-w-[200px] mt-1 opacity-60 leading-tight">
                          Tudo em ordem para o dia selecionado ({simulatedToday.split("-").reverse().join("/")}).
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1.5">
                      {/* Agenda notifications */}
                      {dayAgenda.map(ev => {
                        const isDone = completedTasks.includes(ev.id);
                        return (
                          <div 
                            key={ev.id}
                            className={`p-2 rounded-lg border flex items-center justify-between text-xs transition duration-200 ${
                              isDone ? "opacity-40 line-through select-none" : ""
                            } ${
                              isDarkMode ? "bg-neutral-900/50 border-neutral-800/80" : "bg-amber-50/30 border-amber-100"
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="text-xs">
                                {ev.type === "checkin" ? "🛎️" :
                                 ev.type === "checkout" ? "🔑" :
                                 ev.type === "limpeza" ? "🧹" :
                                 "🛠️"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-[9.5px] truncate flex items-center space-x-1.5">
                                  <span className="truncate">{ev.propertyName}</span>
                                  <span className="text-amber-600 dark:text-[#C59B27] font-mono text-[8px] shrink-0">({ev.time})</span>
                                </div>
                                <p className="text-[8.5px] truncate opacity-75 mt-0.5">
                                  {ev.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (isDone) {
                                  setCompletedTasks(prev => prev.filter(t => t !== ev.id));
                                } else {
                                  setCompletedTasks(prev => [...prev, ev.id]);
                                }
                              }}
                              className={`p-1 rounded cursor-pointer transition ml-1 hover:scale-105 active:scale-95 ${
                                isDone 
                                  ? "bg-emerald-500 text-white" 
                                  : isDarkMode 
                                    ? "bg-neutral-800 text-neutral-400 hover:text-white" 
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-100/90"
                              }`}
                              title={isDone ? "Reabrir" : "Marcar pronto"}
                            >
                              <Check size={9} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Financial notifications */}
                      {dayFinances.map(f => {
                        const isRev = f.type === "receita";
                        const isDone = completedTasks.includes(f.id);
                        return (
                          <div 
                            key={f.id}
                            className={`p-2 rounded-lg border flex items-center justify-between text-xs transition duration-200 ${
                              isDone ? "opacity-40 line-through select-none" : ""
                            } ${
                              isDarkMode ? "bg-neutral-900/50 border-neutral-800/80" : "bg-amber-50/30 border-amber-100"
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="text-xs">
                                {isRev ? "💰" : "⚠️"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-[9.5px] truncate flex items-center justify-between pr-2">
                                  <span className="truncate">{f.propertyName}</span>
                                  <span className={`font-mono text-[8px] shrink-0 ${isRev ? "text-green-500" : "text-rose-500"}`}>
                                    {formatBRL(f.amount)}
                                  </span>
                                </div>
                                <p className="text-[8.5px] truncate opacity-75 mt-0.5">
                                  {isRev ? "Aluguel recebido" : `Vence despesa: ${f.title}`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (isDone) {
                                  setCompletedTasks(prev => prev.filter(t => t !== f.id));
                                } else {
                                  setCompletedTasks(prev => [...prev, f.id]);
                                }
                              }}
                              className={`p-1 rounded cursor-pointer transition ml-1 hover:scale-105 active:scale-95 ${
                                isDone 
                                  ? "bg-emerald-500 text-white" 
                                  : isDarkMode 
                                    ? "bg-neutral-800 text-neutral-400 hover:text-white" 
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-100/90"
                              }`}
                              title={isDone ? "Reabrir" : "Liquidado"}
                            >
                              <Check size={9} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Trigger dynamic test banner */}
              <div className="mt-3 pt-2.5 border-t border-current/10 flex justify-between items-center text-[9px] opacity-75 shrink-0">
                <span>Push Inteligente via Mock</span>
                <button
                  onClick={() => {
                    if (toastMessage) {
                      setShowPushBanner(false);
                      setTimeout(() => setShowPushBanner(true), 150);
                    }
                  }}
                  className="flex items-center space-x-1 text-[#C59B27] font-bold select-none cursor-pointer hover:underline"
                >
                  <Sparkles size={10} />
                  <span>Reenviar Alerta</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial KPIs Cards Grid - Styled strictly like mockup details */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Receita Total */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-sm ${
          isDarkMode 
            ? "bg-[#1C1C1E]/75 border-neutral-800/60 shadow-md" 
            : "bg-white/65 border-amber-100/80 border-stone-200/50 shadow-sm hover:border-[#C59B27]/25"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Receita Total</span>
            <span className="p-0.5 rounded bg-[#E8F5E9] text-[#2E7D32]">
              <ArrowUpRight size={10} />
            </span>
          </div>
          <div className="mt-1 text-left">
            <h3 className="font-mono text-sm font-extrabold tracking-tight">
              {formatBRL(totalRevenues)}
            </h3>
            <span className="text-[8px] text-[#2E7D32] flex items-center mt-0.5 font-bold">
              +0,3% vs anterior
            </span>
          </div>
          {/* Custom Sparkline drawing */}
          <div className="w-full h-3 mt-1 opacity-80 select-none">
            <svg viewBox="0 0 100 20" className="w-full h-full text-green-500 stroke-current" fill="none" strokeWidth="1.5">
              <path d="M 0 15 Q 15 10 30 14 T 60 8 T 90 2 Q 95 10 100 1" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-sm ${
          isDarkMode 
            ? "bg-[#1C1C1E]/75 border-neutral-800/60 shadow-md" 
            : "bg-white/65 border-amber-100/80 border-stone-200/50 shadow-sm hover:border-[#C59B27]/25"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Lucro Líquido</span>
            <span className="p-0.5 rounded bg-[#E8F5E9] text-[#2E7D32]">
              <ArrowUpRight size={10} />
            </span>
          </div>
          <div className="mt-1 text-left">
            <h3 className="font-mono text-sm font-extrabold tracking-tight text-[#C59B27]">
              {formatBRL(netProfit)}
            </h3>
            <span className="text-[8px] text-[#2E7D32] flex items-center mt-0.5 font-bold">
              +12,4% vs anterior
            </span>
          </div>
          {/* Custom Sparkline drawing */}
          <div className="w-full h-3 mt-1 opacity-80 select-none">
            <svg viewBox="0 0 100 20" className="w-full h-full text-[#C59B27] stroke-current" fill="none" strokeWidth="1.5">
              <path d="M 0 16 Q 15 12 30 18 T 60 7 T 90 4 Q 95 2 100 0" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Taxa de Ocupação */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-sm ${
          isDarkMode 
            ? "bg-[#1C1C1E]/75 border-neutral-800/60 shadow-md" 
            : "bg-white/65 border-amber-100/80 border-stone-200/50 shadow-sm hover:border-[#C59B27]/25"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Ocupação Média</span>
            <span className="p-0.5 rounded bg-[#ECEFF1] text-[#455A64]">
              <Percent size={9} />
            </span>
          </div>
          <div className="mt-1 text-left">
            <h3 className="font-mono text-sm font-extrabold tracking-tight">
              {averageOccupancy}%
            </h3>
            <span className={`text-[8px] flex items-center mt-0.5 ${isDarkMode ? "text-neutral-400 font-semibold" : "text-stone-600 font-bold"}`}>
              -0,3% vs anterior
            </span>
          </div>
          <div className="w-full h-3 mt-1 opacity-80 select-none">
            <svg viewBox="0 0 100 20" className="w-full h-full text-blue-400 stroke-current" fill="none" strokeWidth="1.5">
              <path d="M 0 8 Q 20 12 40 5 T 80 12 T 100 9" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Total Despesa */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-sm ${
          isDarkMode 
            ? "bg-[#1C1C1E]/75 border-neutral-800/60 shadow-md" 
            : "bg-white/65 border-amber-100/80 border-stone-200/50 shadow-sm hover:border-[#C59B27]/25"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Despesa Total</span>
            <span className="p-0.5 rounded bg-[#FFEBEE] text-[#C62828]">
              <ArrowDownRight size={10} />
            </span>
          </div>
          <div className="mt-1 text-left">
            <h3 className="font-mono text-sm font-extrabold tracking-tight text-red-500">
              {formatBRL(totalExpenses)}
            </h3>
            <span className="text-[8px] text-red-500/90 flex items-center mt-0.5 font-bold">
              Alinhado com o budget
            </span>
          </div>
          <div className="w-full h-3 mt-1 opacity-80 select-none">
            <svg viewBox="0 0 100 20" className="w-full h-full text-red-400 stroke-current" fill="none" strokeWidth="1.5">
              <path d="M 0 5 T 30 12 T 60 15 T 100 16" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* MAIN HISTORICAL RECHARTS CHART */}
      <div className={`p-3 rounded-xl border flex flex-col relative backdrop-blur-xl transition-all ${
        isDarkMode 
          ? "bg-[#1C1C1E]/75 border-neutral-800/60 shadow-lg" 
          : "bg-white/65 border-amber-100/80 border-stone-200/50 shadow-sm shadow-amber-950/5"
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wide opacity-80 flex items-center space-x-1">
              <Sparkles size={11} className="text-[#C59B27] mr-1" />
              Trajetória Financeira
            </h4>
            <p className={`text-[8.5px] ${isDarkMode ? "text-neutral-400" : "text-stone-600 font-bold"}`}>Análise mensal consolidada</p>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#C59B27]/10 text-[#C59B27] font-mono font-bold">BRL / Mês</span>
        </div>

        {/* Recharts Bar Chart Wrapper */}
        <div className="w-full h-36 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={historicalData}
              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              onClick={(e) => {
                if (e && typeof e.activeTooltipIndex === "number") {
                  setSelectedChartPoint(e.activeTooltipIndex);
                }
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={isDarkMode ? "#2D2D30" : "#F3EAD3"} 
                opacity={0.6} 
              />
              <XAxis 
                dataKey="month" 
                stroke={isDarkMode ? "#A3A3A3" : "#78716C"} 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                dy={2}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis 
                stroke={isDarkMode ? "#A3A3A3" : "#78716C"} 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
                fontFamily="JetBrains Mono, monospace"
                tickFormatter={(val) => `R$${val / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(197, 155, 39, 0.07)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={`p-2.5 rounded-xl border text-[10px] shadow-md ${
                        isDarkMode 
                          ? "bg-[#18181B] border-neutral-800 text-neutral-100" 
                          : "bg-white border-amber-200/60 text-stone-900"
                      }`}>
                        <p className="font-bold mb-1 text-amber-600 dark:text-[#C59B27]">{label}</p>
                        <div className="space-y-0.5 font-mono text-[9px]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="opacity-70">Receitas:</span>
                            </span>
                            <span className="font-bold text-green-500">{formatBRL(Number(payload[0].value))}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              <span className="opacity-70">Despesas:</span>
                            </span>
                            <span className="font-bold text-red-500">{formatBRL(Number(payload[1].value))}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={20} 
                align="right" 
                iconType="circle"
                iconSize={5}
                wrapperStyle={{ 
                  fontSize: '8px', 
                  fontFamily: 'Inter', 
                  opacity: 0.8,
                  paddingBottom: '4px'
                }}
              />
              <Bar 
                dataKey="receita" 
                fill={isDarkMode ? "#10B981" : "#059669"} 
                radius={[2, 2, 0, 0]} 
                name="Receitas"
                maxBarSize={10}
              />
              <Bar 
                dataKey="despesa" 
                fill={isDarkMode ? "#EF4444" : "#DC2626"} 
                radius={[2, 2, 0, 0]} 
                name="Despesas"
                maxBarSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Chart Point detail card */}
        {selectedChartPoint !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 p-2 rounded-lg border text-[10px] flex justify-between items-center ${
              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-amber-50/70 border-amber-200/50"
            }`}
          >
            <div>
              <span className="font-bold block text-amber-600 dark:text-[#C59B27]">Resumo de {historicalData[selectedChartPoint].month}</span>
              <p className="text-[8px] opacity-75 mt-0.5">Performance no mês selecionado.</p>
            </div>
            <div className="text-right font-mono text-[9px]">
              <span className="text-green-500 font-bold block">Rec: {formatBRL(historicalData[selectedChartPoint].receita)}</span>
              <span className="text-red-400 block">Desp: {formatBRL(historicalData[selectedChartPoint].despesa)}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* QUICK ACCESS ACTIONS LIST / SHORTCUT GRID WITH INTEGRATED PDF BANNER */}
      <div className={`p-3 rounded-xl border flex flex-col space-y-2.5 backdrop-blur-xl transition-all duration-300 ${
        isDarkMode 
          ? "bg-[#1C1C1E]/75 border-neutral-800/60 shadow-lg" 
          : "bg-white/65 border-amber-100/80 border-stone-200/50 shadow-sm shadow-amber-950/5"
      }`}>
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Acesso Rápido & Relatórios
          </h4>
          <button 
            onClick={onExportPDF}
            className="text-[8px] font-bold px-2 py-1 rounded bg-gradient-to-r from-[#C29438] to-[#916B21] text-white hover:brightness-110 shadow-sm transition active:scale-95 cursor-pointer flex items-center space-x-1 shrink-0"
            title="Download relatório completo em PDF"
          >
            <FileDown size={10} />
            <span>Baixar PDF</span>
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          
          <button 
            onClick={() => onSwitchTab("propriedades")}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 focus:scale-95 cursor-pointer hover:shadow-md ${
              isDarkMode 
                ? "bg-neutral-900/50 border-neutral-800/80 hover:border-[#C59B27]/40 text-neutral-200" 
                : "bg-white/85 border-amber-100/80 border-stone-200/50 hover:border-[#C59B27]/40 text-stone-900 shadow-sm"
            }`}
          >
            <span className="p-1.5 rounded-full mb-1 bg-[#C59B27]/10 text-[#C59B27]">
              <Building size={13} />
            </span>
            <span className="text-[8px] font-bold tracking-tight uppercase">Casas</span>
          </button>

          <button 
            onClick={() => onSwitchTab("calendario")}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 focus:scale-95 cursor-pointer hover:shadow-md ${
              isDarkMode 
                ? "bg-neutral-900/50 border-neutral-800/80 hover:border-[#C59B27]/40 text-neutral-200" 
                : "bg-white/85 border-amber-100/80 border-stone-200/50 hover:border-[#C59B27]/40 text-stone-900 shadow-sm"
            }`}
          >
            <span className="p-1.5 rounded-full mb-1 bg-[#C59B27]/10 text-[#C59B27]">
              <Calendar size={13} />
            </span>
            <span className="text-[8px] font-bold tracking-tight uppercase">Agenda</span>
          </button>

          <button 
            onClick={() => onSwitchTab("financeiro")}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 focus:scale-95 cursor-pointer hover:shadow-md ${
              isDarkMode 
                ? "bg-neutral-900/50 border-neutral-800/80 hover:border-[#C59B27]/40 text-neutral-200" 
                : "bg-white/85 border-amber-100/80 border-stone-200/50 hover:border-[#C59B27]/40 text-stone-900 shadow-sm"
            }`}
          >
            <span className="p-1.5 rounded-full mb-1 bg-[#C59B27]/10 text-[#C59B27]">
              <DollarSign size={13} />
            </span>
            <span className="text-[8px] font-bold tracking-tight uppercase">Extrato</span>
          </button>

          <div
            onClick={() => onSwitchTab("financeiro")} // Redirects to Finance Tab context
            className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 focus:scale-95 cursor-pointer hover:shadow-md ${
              isDarkMode 
                ? "bg-neutral-900/50 border-neutral-800/80 hover:border-green-500/40 text-neutral-200" 
                : "bg-white/85 border-amber-100/80 border-stone-200/50 hover:border-[#C59B27]/40 text-stone-900 shadow-sm"
            }`}
          >
            <span className="p-1.5 rounded-full mb-1 bg-green-500/10 text-green-500">
              <Sparkles size={13} />
            </span>
            <span className="text-[8px] font-bold tracking-tight uppercase">OCR IA</span>
          </div>

        </div>
      </div>
    </div>
  );
}
