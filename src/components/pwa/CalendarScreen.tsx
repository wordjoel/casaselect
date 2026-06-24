import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, MapPin, Plus, X, FileText, Trash2 } from "lucide-react";
import { AgendaEvent, Property } from "./types";

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
  agenda, 
  properties, 
  onAddEvent, 
  onUpdateEvent,
  onDeleteEvent,
  isDarkMode 
}: CalendarScreenProps) {
  // Calendar centers on May 2026 as shown in the original mockups
  const [selectedDay, setSelectedDay] = useState("2026-05-16"); // Matches standard mock date May 16, 2026
  
  // Custom Addition/Edit Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [newEventPropName, setNewEventPropName] = useState("Casa Amado");
  const [newEventTime, setNewEventTime] = useState("10:00");
  const [newEventType, setNewEventType] = useState<"checkin" | "checkout" | "limpeza" | "manutencao">("checkin");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventNotes, setNewEventNotes] = useState("");

  // Logic to build a perfect calendar day grid for May 2026
  // May 1st 2026 falls on a Friday. So we have 5 empty days at start (Sun, Mon, Tue, Wed, Thu are empty/prior month)
  // Total days in May is 31
  const daysInMay = 31;
  const startOffset = 5; // Friday index (0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat)

  const calendarDaysList: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    calendarDaysList.push(null);
  }
  for (let day = 1; day <= daysInMay; day++) {
    calendarDaysList.push(day);
  }

  // Get active agenda items for selectedDay
  const dayEvents = agenda.filter(item => item.date === selectedDay);

  const getEventNamePT = (type: string) => {
    switch (type) {
      case "checkout": return "Check-out";
      case "checkin": return "Check-in";
      case "limpeza": return "Limpeza";
      case "manutencao": return "Manutenção";
      default: return type;
    }
  };

  const handleDayClick = (dayNum: number) => {
    // Construct double-digit string format (e.g. "2026-05-16")
    const paddedDay = String(dayNum).padStart(2, '0');
    setSelectedDay(`2026-05-${paddedDay}`);
  };

  const handleCloseForm = () => {
    setIsAddOpen(false);
    setEditingEvent(null);
    setNewEventPropName(properties[0]?.name || "Casa Amado");
    setNewEventTime("10:00");
    setNewEventType("checkin");
    setNewEventDesc("");
    setNewEventNotes("");
  };

  const handleEditClick = (ev: AgendaEvent) => {
    setEditingEvent(ev);
    setNewEventPropName(ev.propertyName);
    setNewEventTime(ev.time);
    setNewEventType(ev.type);
    setNewEventDesc(ev.description);
    setNewEventNotes(ev.notes || "");
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventDesc) return;
    const matchedProp = properties.find(p => p.name === newEventPropName);
    
    if (editingEvent) {
      await onUpdateEvent(editingEvent.id, {
        propertyId: matchedProp ? matchedProp.id : "prop-general",
        propertyName: newEventPropName,
        type: newEventType,
        time: newEventTime,
        description: newEventDesc,
        notes: newEventNotes
      });
    } else {
      await onAddEvent({
        propertyId: matchedProp ? matchedProp.id : "prop-general",
        propertyName: newEventPropName,
        type: newEventType,
        date: selectedDay, // schedule on active selected day
        time: newEventTime,
        description: newEventDesc,
        notes: newEventNotes
      });
    }
    handleCloseForm();
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative h-full">
      {/* Header bar row */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-display font-bold text-xl leading-snug">Calendário</h2>
          <p className="text-[10px] opacity-60">Logística de entrada, saída e higienização das casas</p>
        </div>
        <button
          onClick={() => {
            handleCloseForm();
            setIsAddOpen(true);
          }}
          className="p-2 rounded-full cursor-pointer bg-gradient-to-r from-[#C29438] to-[#916B21] text-white hover:opacity-90 shadow-sm"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Calendário Grid Wrapper Box */}
      <div className={`p-4 rounded-2xl border ${
        isDarkMode ? "bg-[#1C1C1E] border-neutral-800" : "bg-white border-amber-200/60"
      } shadow-sm font-sans text-xs`}>
        
        {/* Month switcher bar */}
        <div className="flex justify-between items-center mb-4 border-b border-neutral-800/10 dark:border-white/10 pb-2">
          <span className="font-display font-extrabold text-sm tracking-tight text-[#C59B27] uppercase">
            Maio 2026
          </span>
          <span className={`text-[10px] font-bold font-mono ${isDarkMode ? "text-neutral-400" : "text-amber-950"}`}>
            Maio/2026
          </span>
        </div>

        {/* Days of week header */}
        <div className={`grid grid-cols-7 text-center font-extrabold text-[10px] mb-2.5 uppercase tracking-wider ${
          isDarkMode ? "text-neutral-400" : "text-amber-950"
        }`}>
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Calendar days cells */}
        <div className="grid grid-cols-7 gap-y-1.5 text-center items-center">
          {calendarDaysList.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={`empty-${index}`} className="h-9" />;
            }

            const activeDayStr = `2026-05-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDay === activeDayStr;
            const dayEventsList = agenda.filter(e => e.date === activeDayStr);
            const hasEvents = dayEventsList.length > 0;
            
            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                className={`h-9 flex flex-col items-center justify-center rounded-lg cursor-pointer transition relative ${
                  isSelected
                    ? "bg-[#C59B27] text-white font-black shadow-sm"
                    : hasEvents
                    ? isDarkMode
                      ? "bg-[#C59B27]/15 text-[#C59B27] font-bold border border-[#C59B27]/25 hover:bg-[#C59B27]/25"
                      : "bg-amber-100 text-amber-950 font-bold border border-amber-300 hover:bg-amber-150"
                    : isDarkMode
                    ? "hover:bg-neutral-800 text-neutral-200"
                    : "hover:bg-amber-50 text-stone-900 font-semibold"
                }`}
              >
                <span className="text-xs font-mono">{dayNum}</span>
                
                {/* Colored dots represent micro indicator logs of events */}
                {hasEvents && !isSelected && (
                  <div className="flex space-x-0.5 mt-0.5 justify-center items-center absolute bottom-1">
                    {dayEventsList.map(ev => {
                      let dotColor = "bg-neutral-500";
                      if (ev.type === "checkout") dotColor = "bg-orange-500";
                      if (ev.type === "checkin") dotColor = "bg-green-600";
                      if (ev.type === "limpeza") dotColor = "bg-orange-400";
                      if (ev.type === "manutencao") dotColor = "bg-blue-600";
                      return (
                        <span 
                          key={ev.id} 
                          className={`w-1 h-1 rounded-full ${dotColor}`} 
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* AGENDA EVENTS LIST FOR THE ACTIVE DAY */}
      <div className="mt-5 space-y-3 pb-24 overflow-y-auto no-scrollbar flex-1 font-sans">
        
        {/* Day subtitle banner */}
        <div className="flex justify-between items-center border-b border-neutral-800/10 dark:border-white/10 pb-2">
          <span className="text-xs font-bold opacity-75">
            Agenda - {selectedDay ? selectedDay.split("-")[2] : "16"} de Maio
          </span>
          <span className="text-[10px] opacity-60 font-mono font-medium">({dayEvents.length} eventos)</span>
        </div>

        {/* Schedule rows */}
        <div className="space-y-2.5">
          {dayEvents.length === 0 ? (
            <div className="py-8 text-center text-xs opacity-50">
              Nenhuma atividade logística para este dia.
            </div>
          ) : (
            dayEvents
              .sort((a,b) => a.time.localeCompare(b.time))
              .map(ev => {
                let badgeStyle = "bg-green-500/10 text-green-500";
                if (ev.type === "checkout") badgeStyle = "bg-orange-500/10 text-orange-500";
                if (ev.type === "limpeza") badgeStyle = "bg-yellow-500/12 text-yellow-500";
                if (ev.type === "manutencao") badgeStyle = "bg-blue-500/10 text-blue-500";

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleEditClick(ev)}
                    className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer hover:border-[#C59B27]/50 hover:shadow-md transition active:scale-[0.99] duration-200 select-none ${
                      isDarkMode 
                        ? "bg-[#1C1C1E] border-neutral-800 hover:bg-neutral-900" 
                        : "bg-white border-amber-100 hover:bg-amber-50/20"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Left time block badge */}
                      <span className={`p-1 px-2 rounded-lg bg-neutral-300/10 font-mono font-bold text-[10px] flex items-center space-x-1 self-center ${
                        isDarkMode ? "text-neutral-400" : "text-stone-600"
                      }`}>
                        <Clock size={10} />
                        <span>{ev.time}</span>
                      </span>

                      {/* Info core */}
                      <div>
                        <span className="text-[11px] font-semibold block leading-tight">{ev.description}</span>
                        <div className={`flex items-center space-x-1.5 mt-1 text-[10px] ${
                          isDarkMode ? "opacity-65" : "text-stone-600 font-medium"
                        }`}>
                          <MapPin size={9} className="text-[#C59B27]" />
                          <span>{ev.propertyName}</span>
                        </div>
                        {ev.notes && (
                          <div className="text-[10px] mt-1.5 p-1.5 font-mono leading-tight rounded bg-[#C59B27]/10 text-amber-600 dark:text-amber-400 max-w-[200px] border border-amber-500/10 flex items-start gap-1">
                            <FileText size={10} className="mt-0.5 shrink-0" />
                            <span className="break-words">{ev.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side event type capsule */}
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shrink-0 ${badgeStyle}`}>
                      {getEventNamePT(ev.type)}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* MODAL SHEET: Adicionar/Editar evento de agenda (Animates slide-up) */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseForm}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full rounded-t-2xl p-5 max-h-[90%] overflow-y-auto no-scrollbar relative ${
                isDarkMode ? "bg-zinc-950 text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              <button 
                onClick={handleCloseForm}
                className="absolute right-4 top-4 p-1 rounded-full cursor-pointer hover:bg-black/10 text-current"
              >
                <X size={18} />
              </button>

              <h2 className="font-display font-bold text-lg mb-4">
                {editingEvent ? "Editar compromisso" : "Adicionar Agenda"}
              </h2>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block tracking-wide font-semibold opacity-75 mb-2 uppercase">Tipo Logístico</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["checkin", "checkout", "limpeza", "manutencao"] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewEventType(t)}
                        className={`py-2 rounded-lg border text-[10px] text-center font-bold cursor-pointer transition ${
                          newEventType === t
                            ? t === "checkout" ? "bg-orange-500/10 border-orange-500 text-orange-500"
                              : t === "checkin" ? "bg-green-600/10 border-green-500 text-green-500"
                              : t === "limpeza" ? "bg-yellow-500/12 border-yellow-500 text-yellow-500"
                              : "bg-blue-600/10 border-blue-500 text-blue-500"
                            : "border-neutral-500/20 text-neutral-400"
                        }`}
                      >
                        {getEventNamePT(t)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Casa Associada</label>
                  <select
                    value={newEventPropName}
                    onChange={(e) => setNewEventPropName(e.target.value)}
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                      isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                    }`}
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Horário Agendado</label>
                    <input
                      type="time"
                      required
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Data Agendamento</label>
                    <input
                      type="text"
                      disabled
                      value={selectedDay.split("-")[2] + " / 05 / 2026"}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border bg-neutral-500/10 opacity-70 cursor-not-allowed`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Descrição / Detalhes</label>
                  <input
                    type="text"
                    required
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    placeholder="Ex: Entrega de chaves com recepção"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                      isDarkMode ? "bg-[#1C1C1E] border-neutral-800" : "bg-white border-amber-200/50"
                    }`}
                  />
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Observações / Instruções Especiais</label>
                  <textarea
                    rows={2}
                    value={newEventNotes}
                    onChange={(e) => setNewEventNotes(e.target.value)}
                    placeholder="Ex: Código de acesso da fechadura digital é 4839."
                    className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] resize-none ${
                      isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                    }`}
                  />
                </div>

                <div className="pt-3.5 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-xs font-semibold tracking-wide text-white uppercase bg-gradient-to-r from-[#C29438] to-[#916B21] hover:brightness-110 shadow-lg cursor-pointer transition active:scale-95"
                  >
                    {editingEvent ? "Salvar Alterações" : "Confirmar Evento"}
                  </button>

                  {editingEvent && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm("Deseja realmente deletar este compromisso do calendário?\nEsta ação não poderá ser revertida.")) {
                          await onDeleteEvent(editingEvent.id);
                          handleCloseForm();
                        }
                      }}
                      className="w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide text-red-500 hover:text-red-600 uppercase border border-red-500/25 dark:border-red-500/15 hover:bg-red-500/5 flex items-center justify-center space-x-2 cursor-pointer transition active:scale-95"
                    >
                      <Trash2 size={13} />
                      <span>Excluir Evento</span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
