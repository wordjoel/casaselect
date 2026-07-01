import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ChevronRight } from "lucide-react";

interface AgendaEvent {
  id: string;
  propertyId: string;
  propertyName: string;
  type: "checkin" | "checkout" | "limpeza" | "manutencao";
  date: string;
  time: string;
  description: string;
  notes?: string;
}

interface Property {
  id: string;
  name: string;
  receitado: number;
  ocupacao: number;
  rating: number;
  status: "Ativas" | "Inativas";
  address: string;
  dailyRate: number;
  imageUrl: string;
}

interface CalendarScreenProps {
  key?: string;
  agenda: AgendaEvent[];
  properties: Property[];
  onAddEvent: (event: Omit<AgendaEvent, "id">) => Promise<void>;
  onUpdateEvent: (id: string, updated: Partial<AgendaEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  isDarkMode: boolean;
}

export default function CalendarScreen({ 
  properties, 
  onAddEvent, 
  isDarkMode 
}: CalendarScreenProps) {
  const [selectedDay, setSelectedDay] = useState(15);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00");

  // Maio 2025 Calendar Configuration
  // 1st of May 2025 is a Thursday.
  // Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3. Thursday is 4.
  // So startOffset is 4. Total days: 31.
  const daysInMonth = 31;
  const startOffset = 4;

  const daysList: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysList.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysList.push(d);
  }

  // Pre-configured mockup events matching Screen 5
  const defaultEvents = [
    {
      id: "ev-1",
      title: "Reunião com Contador",
      dateStr: "15/05/2025",
      time: "10:00",
      dayNum: 15,
      accentColor: "#8B5CF6", // Purple
      details: "Alinhamento fiscal e fechamento do faturamento trimestral das propriedades."
    },
    {
      id: "ev-2",
      title: "Pagamento IPTU",
      dateStr: "12/05/2025",
      time: "09:00",
      dayNum: 12,
      accentColor: "#3B82F6", // Blue
      details: "Vencimento da cota única do imposto territorial urbano anual das unidades de São Paulo."
    }
  ];

  const [userEvents, setUserEvents] = useState<any[]>([]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newEv = {
      id: `ev-${Date.now()}`,
      title: newTitle,
      dateStr: `${selectedDay.toString().padStart(2, "0")}/05/2025`,
      time: newTime,
      dayNum: selectedDay,
      accentColor: "#C8A27A", // Gold default for user events
      details: "Nova atividade adicionada na agenda."
    };
    setUserEvents(prev => [...prev, newEv]);
    setNewTitle("");
    setIsAddOpen(false);
  };

  const allDisplayEvents = [...userEvents, ...defaultMockEventsFiltered()];

  function defaultMockEventsFiltered() {
    // Return all mock events or just those for the active selected day if preferred, 
    // but the mockup lists both upcoming events under "Próximos Eventos" when on day 15.
    // So we return them all.
    return defaultEvents;
  }

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative h-full">
      {/* 1. Header (Agenda + Plus button) */}
      <div className="flex justify-between items-center mb-4">
        <h2 
          className={`font-serif text-lg font-bold text-left ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif" }}
        >
          Agenda
        </h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className={`p-1.5 rounded-full cursor-pointer transition ${
            isDarkMode ? "text-[#E6C687] hover:bg-neutral-800" : "text-[#A97142] hover:bg-stone-100"
          }`}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 2. Month Selector */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button className={`text-sm font-semibold opacity-60 ${isDarkMode ? "text-white" : "text-amber-950"}`}>
          &lt;
        </button>
        <span className={`text-[12.5px] font-bold ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
          Maio 2025
        </span>
        <button className={`text-sm font-semibold opacity-60 ${isDarkMode ? "text-white" : "text-amber-950"}`}>
          &gt;
        </button>
      </div>

      {/* 3. Calendar Grid */}
      <div 
        className={`p-3.5 rounded-2xl border mb-5 font-sans text-xs ${
          isDarkMode ? "bg-[#11161D] border-neutral-800/80" : "bg-white border-stone-100 shadow-xs"
        }`}
      >
        {/* Days of week header */}
        <div className={`grid grid-cols-7 text-center font-bold text-[9px] mb-3 uppercase tracking-wider ${
          isDarkMode ? "text-neutral-400" : "text-[#856E58]"
        }`}>
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-y-2 text-center items-center">
          {daysList.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const isSelected = selectedDay === day;
            const hasEvent = defaultEvents.some(e => e.dayNum === day) || userEvents.some(e => e.dayNum === day);

            return (
              <div
                key={`day-${day}`}
                onClick={() => setSelectedDay(day)}
                className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full cursor-pointer transition text-[11px] font-mono font-bold ${
                  isSelected
                    ? "bg-[#C8A27A] text-white"
                    : hasEvent
                    ? isDarkMode
                      ? "text-[#E6C687] bg-[#C8A27A]/10 border border-[#C8A27A]/25"
                      : "text-[#A97142] bg-[#EFE4D0] border border-amber-200/50"
                    : isDarkMode
                    ? "text-neutral-300 hover:bg-neutral-800/60"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Próximos Eventos Section */}
      <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-24 text-left">
        <h4 className={`text-[12px] font-bold tracking-tight ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
          Próximos Eventos
        </h4>

        <div className="space-y-2">
          {allDisplayEvents.length === 0 ? (
            <p className="text-xs opacity-50 text-center py-4">Nenhuma atividade agendada.</p>
          ) : (
            allDisplayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`rounded-xl border flex items-center justify-between cursor-pointer overflow-hidden transition-all ${
                  isDarkMode 
                    ? "bg-[#11161D] border-neutral-800/80 hover:bg-[#151c25]" 
                    : "bg-white border-stone-100 hover:bg-stone-50"
                }`}
              >
                {/* Left accent bar and title */}
                <div className="flex items-center h-full">
                  <div 
                    className="w-1 h-[48px] shrink-0" 
                    style={{ backgroundColor: ev.accentColor }} 
                  />
                  <div className="p-3 text-left">
                    <h5 className={`text-[11.5px] font-bold ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
                      {ev.title}
                    </h5>
                    <p className={`text-[9px] opacity-65 mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
                      {ev.dateStr} • {ev.time}
                    </p>
                  </div>
                </div>

                {/* Right chevron */}
                <div className={`pr-3 ${isDarkMode ? "text-neutral-600" : "text-stone-400"}`}>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Details Drawer */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full rounded-t-2xl p-5 overflow-y-auto no-scrollbar relative ${
                isDarkMode ? "bg-[#11161D] text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-black/5 hover:bg-black/10 text-current"
              >
                <X size={16} />
              </button>

              <h3 className="font-serif font-bold text-base pr-8 text-left">{selectedEvent.title}</h3>
              <p className="text-[10px] opacity-65 text-left mt-1">{selectedEvent.dateStr} • {selectedEvent.time}</p>

              <div className="my-4 text-left p-3.5 rounded-xl border border-current/15 text-xs leading-relaxed opacity-95">
                {selectedEvent.details}
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#A97142] hover:bg-[#8e5c32] transition-all"
              >
                Voltar à Agenda
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddOpen(false)}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full rounded-t-2xl p-5 max-h-[90%] overflow-y-auto no-scrollbar relative ${
                isDarkMode ? "bg-[#11161D] text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              <div className="absolute right-4 top-4 p-1 cursor-pointer" onClick={() => setIsAddOpen(false)}>
                <X size={18} />
              </div>

              <h2 className="font-serif font-bold text-base mb-4 text-left">Novo Evento</h2>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs text-left">
                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Título do Evento</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Entrega de Chaves"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Horário (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Ex: 14:30"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-xs font-bold tracking-wide text-white uppercase bg-[#A97142] hover:bg-[#8e5c32] shadow-lg cursor-pointer"
                  >
                    Salvar Evento
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
