import React, { useState, useEffect } from "react";
import { User, Shield, Bell, Settings, HelpCircle, LogOut, ChevronRight, ClipboardList, X, MessageSquare, Mail, Home, Calendar } from "lucide-react";
import { CONCIERGE_SERVICES } from "../PublicVitrine";

interface ProfileScreenProps {
  isDarkMode: boolean;
  onLogout: () => void;
}

export default function ProfileScreen({ isDarkMode, onLogout }: ProfileScreenProps) {
  const [isReservasOpen, setIsReservasOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [bkRes, prRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/pwa/properties")
      ]);
      if (bkRes.ok) {
        const bkData = await bkRes.json();
        const prData = prRes.ok ? await prRes.json() : [];
        setProperties(prData);
        
        // Map propertyName dynamically
        const mapped = bkData.map((b: any) => {
          const pName = prData.find((p: any) => p.id === b.propertyId)?.name || b.propertyName || "Geral";
          return { ...b, propertyName: pName };
        });
        setBookings(mapped);
      }
    } catch (e) {
      console.error("Failed to load bookings in PWA:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReservas = () => {
    fetchBookings();
    setIsReservasOpen(true);
  };

  const getFormattedShareMessage = (b: any) => {
    const srvNames = b.selectedServices && b.selectedServices.length > 0
      ? b.selectedServices.map((id: string) => {
          const s = CONCIERGE_SERVICES.find(srv => srv.id === id);
          return s ? s.name : id;
        }).join(", ")
      : "Nenhum";

    return `*RESERVA CONFIRMADA - L | STAYS*
---------------------------------------
*Hóspede:* ${b.guestName} (${b.isRecurrent ? "Cliente Recorrente" : "Novo Cliente"})
*Telefone:* ${b.phone || "Não informado"}
*Origem/Canal:* ${b.origin}
${b.origin === "Airbnb" && b.airbnbUrl ? `*Link Anúncio:* ${b.airbnbUrl}\n` : ""}*Propriedade:* ${b.propertyName}
*Período:* ${b.checkIn} a ${b.checkOut} (${b.daysCount || 1} diárias)
*Hóspedes:* ${b.guestsCount || 1} pessoas
*Serviços:* ${srvNames}
*Valor Total:* R$ ${b.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const handleShareWhatsApp = (b: any) => {
    const msg = encodeURIComponent(getFormattedShareMessage(b));
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const handleShareEmail = (b: any) => {
    const subject = encodeURIComponent(`Reserva L | STAYS - ${b.guestName}`);
    const body = encodeURIComponent(getFormattedShareMessage(b));
    window.open(`mailto:recepcao@lstays.com?subject=${subject}&body=${body}`, "_blank");
  };

  const menuItems = [
    {
      id: "reservas",
      label: "Recepção & Reservas",
      icon: <ClipboardList size={16} />,
      action: handleOpenReservas,
      highlight: true
    },
    {
      id: "personal",
      label: "Dados Pessoais",
      icon: <User size={16} />,
      action: () => alert("Dados Pessoais")
    },
    {
      id: "security",
      label: "Segurança",
      icon: <Shield size={16} />,
      action: () => alert("Segurança")
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: <Bell size={16} />,
      action: () => alert("Notificações")
    },
    {
      id: "preferences",
      label: "Preferências",
      icon: <Settings size={16} />,
      action: () => alert("Preferências")
    },
    {
      id: "help",
      label: "Ajuda e Suporte",
      icon: <HelpCircle size={16} />,
      action: () => alert("Ajuda e Suporte")
    },
    {
      id: "logout",
      label: "Sair da Conta",
      icon: <LogOut size={16} />,
      action: onLogout,
      isDanger: true
    }
  ];

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative h-full">
      {/* 1. Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 
          className={`font-serif text-lg font-bold text-left ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif" }}
        >
          Meu Perfil
        </h2>
      </div>

      {/* 2. Profile Card */}
      <div className="flex flex-col items-center py-4 mb-6 space-y-3">
        <div className={`w-18 h-18 rounded-full overflow-hidden border-2 flex items-center justify-center ${
          isDarkMode 
            ? "bg-[#11161D] border-neutral-800 text-neutral-400" 
            : "bg-[#FAF8F5] border-stone-200 text-stone-500"
        } shadow-inner`}>
          <User size={32} strokeWidth={1.5} />
        </div>

        <div className="text-center">
          <h3 className={`text-[14px] font-bold ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
            Hugo Kobayashi
          </h3>
          <p className={`text-[10.5px] opacity-60 mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            hugo@lstays.com
          </p>
        </div>
      </div>

      {/* 3. Settings Menu List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-2 text-left">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={item.action}
            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              item.highlight
                ? isDarkMode
                  ? "bg-[#C8A27A]/10 border-[#C8A27A]/30 hover:bg-[#C8A27A]/15"
                  : "bg-[#EFE4D0]/40 border-[#A97142]/20 hover:bg-[#EFE4D0]/60"
                : isDarkMode 
                ? "bg-[#11161D] border-neutral-800/80 hover:bg-[#151c25]" 
                : "bg-white border-stone-100 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className={`${
                item.isDanger
                  ? "text-red-500"
                  : item.highlight
                  ? "text-[#C8A27A]"
                  : isDarkMode
                  ? "text-[#E6C687]"
                  : "text-[#A97142]"
              }`}>
                {item.icon}
              </div>
              <span className={`text-[12px] font-semibold ${
                item.isDanger 
                  ? "text-red-500" 
                  : item.highlight
                  ? "text-[#A97142] dark:text-[#E6C687]"
                  : isDarkMode 
                  ? "text-white" 
                  : "text-[#4A3C31]"
              }`}>
                {item.label}
              </span>
            </div>

            <div className={isDarkMode ? "text-neutral-600" : "text-stone-400"}>
              <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Slide-up Reservations Drawer */}
      <AnimatePresence>
        {isReservasOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReservasOpen(false)}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full rounded-t-2xl p-5 max-h-[85%] overflow-y-auto no-scrollbar relative ${
                isDarkMode ? "bg-[#11161D] text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              <button 
                onClick={() => setIsReservasOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-black/5 hover:bg-black/10 text-current"
              >
                <X size={18} />
              </button>

              <h3 className="font-serif font-bold text-base mb-4 text-left">Fila de Recepção & Reservas</h3>

              {loading ? (
                <div className="py-12 text-center text-xs opacity-65">Carregando reservas...</div>
              ) : bookings.length === 0 ? (
                <div className="py-12 text-center text-xs opacity-60">Nenhuma reserva ativa encontrada.</div>
              ) : (
                <div className="space-y-2 pb-8">
                  {bookings.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-left ${
                        isDarkMode 
                          ? "bg-black/20 border-neutral-800 hover:bg-black/30" 
                          : "bg-white border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="font-bold text-[11.5px] truncate flex items-center gap-1.5">
                          {b.guestName}
                          {b.isRecurrent && (
                            <span className="bg-[#C8A27A]/15 text-[#C8A27A] text-[7.5px] px-1 rounded">R</span>
                          )}
                        </h4>
                        <p className="text-[9px] opacity-60 truncate mt-0.5 flex items-center gap-1">
                          <Home size={10} /> {b.propertyName}
                        </p>
                        <p className="text-[9px] opacity-60 mt-0.5 flex items-center gap-1">
                          <Calendar size={10} /> {b.checkIn} a {b.checkOut}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <strong className="text-[11px] font-mono text-[#C8A27A]">
                          R$ {b.value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </strong>
                        <span className={`block text-[7.5px] uppercase font-bold tracking-wider mt-1 px-1.5 py-0.5 rounded border ${
                          b.origin === "Airbnb" ? "bg-rose-500/10 text-rose-500 border-rose-500/15" : "bg-[#C8A27A]/10 text-[#C8A27A] border-[#C8A27A]/15"
                        }`}>
                          {b.origin}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation Detail Drawer inside drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBooking(null)}
            className="absolute inset-0 bg-black/70 z-40 flex items-end rounded-2xl overflow-hidden"
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
                onClick={() => setSelectedBooking(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-black/5 hover:bg-black/10 text-current"
              >
                <X size={16} />
              </button>

              <h3 className="font-serif font-bold text-sm pr-8 text-left">Ficha do Hóspede</h3>
              <p className="text-[10px] opacity-65 text-left mt-1">{selectedBooking.guestName}</p>

              <div className="space-y-2.5 my-4 text-left text-xs">
                <div className="flex justify-between border-b border-current/10 pb-1.5">
                  <span className="opacity-60">Status Cliente:</span>
                  <span className="font-bold">{selectedBooking.isRecurrent ? "Recorrente" : "Novo Cliente"}</span>
                </div>
                <div className="flex justify-between border-b border-current/10 pb-1.5">
                  <span className="opacity-60">Origem:</span>
                  <span className="font-bold uppercase">{selectedBooking.origin}</span>
                </div>
                {selectedBooking.origin === "Airbnb" && selectedBooking.airbnbUrl && (
                  <div className="flex flex-col gap-0.5 border-b border-current/10 pb-1.5">
                    <span className="opacity-60">Anúncio Airbnb:</span>
                    <a 
                      href={selectedBooking.airbnbUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-rose-500 font-bold font-mono text-[8.5px] truncate block hover:underline"
                    >
                      {selectedBooking.airbnbUrl}
                    </a>
                  </div>
                )}
                <div className="flex justify-between border-b border-current/10 pb-1.5">
                  <span className="opacity-60">Hóspedes / Diárias:</span>
                  <span className="font-bold">{selectedBooking.guestsCount || 1} pax / {selectedBooking.daysCount || 1} diárias</span>
                </div>
                
                {/* Services list */}
                <div className="flex flex-col gap-1 border-b border-current/10 pb-1.5">
                  <span className="opacity-60">Serviços Contratados:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 ? (
                      selectedBooking.selectedServices.map((id: string) => {
                        const s = CONCIERGE_SERVICES.find(srv => srv.id === id);
                        return (
                          <span key={id} className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 border border-current/10 rounded font-bold text-[8.5px]">
                            {s ? s.name : id}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[9.5px] opacity-50 italic">Nenhum serviço</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pb-1.5">
                  <span className="opacity-60">Valor Total:</span>
                  <span className="font-bold text-sm text-[#C8A27A]">
                    R$ {selectedBooking.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Share triggers */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => handleShareWhatsApp(selectedBooking)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  <MessageSquare size={11} />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareEmail(selectedBooking)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer border-none"
                >
                  <Mail size={11} />
                  Email
                </button>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2.5 mt-3 rounded-lg text-xs font-bold text-white bg-[#A97142] hover:bg-[#8e5c32] transition-all"
              >
                Voltar à Fila
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
