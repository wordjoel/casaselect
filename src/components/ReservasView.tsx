import React, { useState, useEffect } from "react";
import { CalendarDays, Filter, DollarSign, RefreshCw, Calendar, Eye, User, Home, MessageSquare, Mail, Share2, Plus, ArrowUpRight } from "lucide-react";
import { AIRBNB_LINKS, CONCIERGE_SERVICES } from "./PublicVitrine";

interface BookingItem {
  id: string;
  propertyId: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  origin: "Airbnb" | "Booking" | "Direta" | "Temporada" | "Contrato";
  status: "Pendente" | "Confirmada" | "Em Andamento" | "Concluída" | "Cancelada";
  paymentStatus: "Pago" | "Parcial" | "Pendente";
  value: number;
  commission: number;
  phone?: string;
  notes?: string;
  guestsCount?: number;
  selectedServices?: string[];
  isRecurrent?: boolean;
  daysCount?: number;
  airbnbUrl?: string;
}

export default function ReservasView() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("Todas");
  const [filterOrigin, setFilterOrigin] = useState<string>("Todos");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // Airbnb Simulation States
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [simName, setSimName] = useState("");
  const [simPhone, setSimPhone] = useState("");
  const [simCheckIn, setSimCheckIn] = useState("");
  const [simCheckOut, setSimCheckOut] = useState("");
  const [simGuests, setSimGuests] = useState(2);
  const [simUrl, setSimUrl] = useState(AIRBNB_LINKS[0].url);
  const [simPropId, setSimPropId] = useState("prop-1");

  const [properties, setProperties] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, propsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/pwa/properties")
      ]);
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        // Since backend might map propertyId but not propertyName directly, we map it
        const props = propsRes.ok ? await propsRes.json() : [];
        setProperties(props);

        const mapped = data.map((b: any) => {
          const pName = props.find((p: any) => p.id === b.propertyId)?.name || b.propertyName || "Geral";
          return {
            ...b,
            propertyName: pName
          };
        });
        setBookings(mapped);
      }
    } catch (err) {
      console.error("Failed to load bookings in admin view:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const target = bookings.find(b => b.id === id);
      if (!target) return;
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...target,
          status: newStatus,
          paymentStatus: newStatus === "Confirmada" || newStatus === "Concluída" ? "Pago" : target.paymentStatus
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(prev => prev ? { ...prev, ...updated } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(simCheckIn);
    const end = new Date(simCheckOut);
    const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    
    const matchedProp = properties.find(p => p.id === simPropId);
    const propName = matchedProp ? matchedProp.name : "Geral";
    const dailyRate = matchedProp ? (matchedProp.rooms || 2) * 450 : 900;
    const baseValue = dailyRate * diff;

    const payload = {
      propertyId: simPropId,
      guestName: simName,
      phone: simPhone,
      origin: "Airbnb",
      checkIn: simCheckIn,
      checkOut: simCheckOut,
      value: baseValue,
      commission: baseValue * 0.1,
      status: "Pendente",
      notes: `Simulada via painel admin utilizando canal Airbnb`,
      guestsCount: Number(simGuests),
      selectedServices: [],
      isRecurrent: false,
      daysCount: diff,
      airbnbUrl: simUrl
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await loadData();
        setIsSimulateOpen(false);
        setSimName("");
        setSimPhone("");
        setSimCheckIn("");
        setSimCheckOut("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFormattedShareMessage = (booking: BookingItem) => {
    const srvNames = booking.selectedServices && booking.selectedServices.length > 0
      ? booking.selectedServices.map((id: string) => {
          const s = CONCIERGE_SERVICES.find(srv => srv.id === id);
          return s ? s.name : id;
        }).join(", ")
      : "Nenhum";

    return `*RESERVA CONFIRMADA - L | STAYS*
---------------------------------------
*Hóspede:* ${booking.guestName} (${booking.isRecurrent ? "Cliente Recorrente" : "Novo Cliente"})
*Telefone:* ${booking.phone || "Não informado"}
*Origem/Canal:* ${booking.origin}
${booking.origin === "Airbnb" && booking.airbnbUrl ? `*Link Anúncio:* ${booking.airbnbUrl}\n` : ""}*Propriedade:* ${booking.propertyName}
*Período:* ${booking.checkIn} a ${booking.checkOut} (${booking.daysCount || 1} diárias)
*Hóspedes:* ${booking.guestsCount || 1} pessoas
*Serviços:* ${srvNames}
*Valor Total:* R$ ${booking.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const handleShareWhatsApp = (b: BookingItem) => {
    const msg = encodeURIComponent(getFormattedShareMessage(b));
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const handleShareEmail = (b: BookingItem) => {
    const subject = encodeURIComponent(`Notificação de Reserva L | STAYS - ${b.guestName}`);
    const body = encodeURIComponent(getFormattedShareMessage(b));
    window.open(`mailto:recepcao@lstays.com?subject=${subject}&body=${body}`, "_blank");
  };

  const filteredBookings = bookings.filter((bk) => {
    const matchesStatus = filterStatus === "Todas" || bk.status === filterStatus;
    const matchesOrigin = filterOrigin === "Todos" || bk.origin === filterOrigin;
    return matchesStatus && matchesOrigin;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Confirmada":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Pendente":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Cancelada":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Parcial":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Pendente":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/25";
    }
  };

  const getOriginBadge = (origin: string) => {
    switch (origin) {
      case "Airbnb":
        return "bg-red-500/10 text-red-500 border-red-500/15";
      case "Booking":
        return "bg-blue-600/10 text-blue-600 border-blue-600/15 dark:text-blue-400 dark:border-blue-400/15";
      case "Direta":
      case "Temporada":
        return "bg-[#C8A27A]/15 text-[#C8A27A] border-[#C8A27A]/25";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/15 dark:text-slate-400";
    }
  };

  // Stats calculation
  const totalRevenue = bookings.reduce((sum, item) => sum + item.value, 0);
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === "Confirmada" || b.status === "Em Andamento").length;
  const directBookingsCount = bookings.filter(b => b.origin === "Direta").length;

  return (
    <div className="p-6 space-y-6 bg-[#FAFAFA] dark:bg-[#0B0F14] min-h-[calc(100vh-4rem)] text-[#111111] dark:text-[#EAEAEA] animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="text-left">
          <h2 className="text-xl font-bold font-display tracking-tight text-[#111111] dark:text-[#EAEAEA]">
            Painel Extranet de Reservas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Fila de controle unificada para check-ins diretos e integrações com o Airbnb.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSimulateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A97142] hover:bg-[#8e5c32] text-white text-xs font-semibold shadow-sm transition cursor-pointer border-none"
          >
            <Plus size={13} />
            Simular Reserva Airbnb
          </button>
          <button 
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] text-xs font-semibold hover:border-slate-350 dark:hover:border-slate-700 transition cursor-pointer text-current"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Geral Reservado</span>
          <strong className="text-lg text-slate-900 dark:text-white mt-1 block">
            R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Reservas</span>
          <strong className="text-lg text-slate-900 dark:text-white mt-1 block">{totalBookings}</strong>
        </div>
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Próximas / Ativas</span>
          <strong className="text-lg text-[#C8A27A] mt-1 block">{activeBookings}</strong>
        </div>
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Reservas Diretas</span>
          <strong className="text-lg text-emerald-500 mt-1 block">{directBookingsCount}</strong>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-xs font-bold mr-1 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          {["Todas", "Confirmada", "Pendente", "Concluída", "Cancelada"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                filterStatus === status
                  ? "bg-[#C8A27A] text-white border-[#C8A27A]"
                  : "bg-white dark:bg-[#121922] border-slate-200 dark:border-[#202A36] text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
            Canais:
          </span>
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#C8A27A]"
          >
            <option value="Todos">Todos os Canais</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Booking">Booking</option>
            <option value="Direta">Reservas Diretas</option>
            <option value="Contrato">Contratos Corporativos</option>
          </select>
        </div>
      </div>

      {/* Bookings List Grid */}
      <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#202A36] bg-slate-50/50 dark:bg-[#101722]/50 text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="px-6 py-4">Hóspede</th>
                <th className="px-6 py-4">Propriedade</th>
                <th className="px-6 py-4">Período (In / Out)</th>
                <th className="px-6 py-4 text-center">Origem</th>
                <th className="px-6 py-4 text-center">Status Reserva</th>
                <th className="px-6 py-4 text-center">Status Pagamento</th>
                <th className="px-6 py-4 text-right">Valor Líquido</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-[#202A36]">
              {filteredBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50 dark:hover:bg-[#101722]/30 transition-all duration-150">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <User size={13} className="text-[#C8A27A]" />
                      {bk.guestName}
                      {bk.isRecurrent && (
                        <span className="text-[7.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#C8A27A]/15 text-[#C8A27A] border border-[#C8A27A]/25 rounded">R</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Home size={13} className="text-slate-400" />
                      {bk.propertyName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-slate-400" />
                      {bk.checkIn} a {bk.checkOut}
                      {bk.daysCount && (
                        <span className="text-slate-400 font-mono font-normal">({bk.daysCount}n)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`status-badge text-[8px] border ${getOriginBadge(bk.origin)}`}>
                      {bk.origin}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`status-badge text-[8.5px] border ${getStatusBadge(bk.status)}`}>
                      {bk.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`status-badge text-[8.5px] border ${getPaymentStatusBadge(bk.paymentStatus)}`}>
                      {bk.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-100">
                    R$ {bk.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedBooking(bk)}
                      className="p-1.5 bg-[#C8A27A]/10 text-[#C8A27A] hover:bg-[#C8A27A]/20 rounded-lg transition cursor-pointer"
                      title="Ver detalhes da reserva"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma reserva encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none">
          <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative text-left">
            <h3 className="font-display font-bold text-sm text-[#C8A27A] uppercase tracking-wider mb-4 border-b border-stone-100 dark:border-stone-800 pb-2">
              Detalhes de Recepção & Controle
            </h3>
            
            <div className="space-y-3.5 text-xs max-h-[380px] overflow-y-auto pr-1">
              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Hóspede:</span>
                <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                  {selectedBooking.guestName}
                  {selectedBooking.isRecurrent ? (
                    <span className="bg-[#C8A27A]/15 text-[#C8A27A] font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#C8A27A]/25">
                      Recorrente
                    </span>
                  ) : (
                    <span className="bg-blue-500/10 text-blue-500 font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-blue-500/15">
                      Novo Cliente
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Propriedade:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedBooking.propertyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Check-in / Check-out:</span>
                <span className="font-semibold">{selectedBooking.checkIn} a {selectedBooking.checkOut}</span>
              </div>
              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Período de Estadia:</span>
                <span className="font-bold">{selectedBooking.daysCount || 1} noites</span>
              </div>
              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Quantidade Hóspedes:</span>
                <span className="font-bold">{selectedBooking.guestsCount || 1} pessoas</span>
              </div>
              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Canal / Origem:</span>
                <span className={`status-badge text-[8px] border ${getOriginBadge(selectedBooking.origin)}`}>
                  {selectedBooking.origin}
                </span>
              </div>

              {/* Show Airbnb URL if available */}
              {selectedBooking.origin === "Airbnb" && selectedBooking.airbnbUrl && (
                <div className="flex flex-col gap-1 border-b border-slate-150 dark:border-slate-800 pb-1.5 text-left">
                  <span className="text-slate-400">Link do Anúncio Airbnb:</span>
                  <a 
                    href={selectedBooking.airbnbUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-rose-500 font-bold hover:underline font-mono text-[9px] truncate max-w-full block"
                  >
                    {selectedBooking.airbnbUrl}
                  </a>
                </div>
              )}

              {/* Concierge Services */}
              <div className="flex flex-col gap-1 border-b border-slate-150 dark:border-slate-800 pb-1.5 text-left">
                <span className="text-slate-400">Serviços Contratados:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBooking.selectedServices && selectedBooking.selectedServices.length > 0 ? (
                    selectedBooking.selectedServices.map(srvId => {
                      const s = CONCIERGE_SERVICES.find(srv => srv.id === srvId);
                      return (
                        <span 
                          key={srvId} 
                          className="px-2 py-0.5 rounded bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 font-bold text-[9px] text-stone-600 dark:text-stone-300"
                        >
                          {s ? s.name : srvId}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-slate-400 italic">Nenhum serviço premium selecionado</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5">
                <span className="text-slate-400">Status Reserva / Pagamento:</span>
                <div className="flex gap-1.5">
                  <span className={`status-badge text-[8.5px] border ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                  <span className={`status-badge text-[8.5px] border ${getPaymentStatusBadge(selectedBooking.paymentStatus)}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between pb-1.5">
                <span className="text-slate-400">Valor Total Estimado:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm text-[#A97142]">
                  R$ {selectedBooking.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Admin control actions */}
            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-slate-800 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleShareWhatsApp(selectedBooking)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <MessageSquare size={12} />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareEmail(selectedBooking)}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Mail size={12} />
                  Email
                </button>
              </div>

              {selectedBooking.status === "Pendente" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "Confirmada")}
                    className="flex-1 py-2 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer bg-white dark:bg-transparent"
                  >
                    Confirmar Estadia
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "Cancelada")}
                    className="flex-1 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer bg-white dark:bg-transparent"
                  >
                    Recusar
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-stone-700 dark:text-neutral-200 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer border-none"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Airbnb Import Modal */}
      {isSimulateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none">
          <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative text-left">
            <button 
              onClick={() => setIsSimulateOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650"
            >
              ✕
            </button>
            
            <h3 className="font-display font-bold text-sm text-[#C8A27A] uppercase tracking-wider mb-2">
              Simulador: Importação Airbnb
            </h3>
            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
              Crie uma reserva de simulação externa no Airbnb, que será enviada para o controle e aparecerá na recepção e no CRM de hóspedes.
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] uppercase font-bold text-slate-400">Link do Anúncio (Airbnb)</label>
                <select
                  value={simUrl}
                  onChange={(e) => setSimUrl(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                >
                  {AIRBNB_LINKS.map(link => (
                    <option key={link.id} value={link.url}>
                      {link.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Nome do Hóspede</label>
                  <input
                    required
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="Nome Completo"
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Telefone / WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    placeholder="+55 (11) 99999-9999"
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Check-in</label>
                  <input
                    required
                    type="date"
                    value={simCheckIn}
                    onChange={(e) => setSimCheckIn(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Check-out</label>
                  <input
                    required
                    type="date"
                    value={simCheckOut}
                    onChange={(e) => setSimCheckOut(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Vincular Propriedade</label>
                  <select
                    value={simPropId}
                    onChange={(e) => setSimPropId(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400">Quantidade de Hóspedes</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="10"
                    value={simGuests}
                    onChange={(e) => setSimGuests(Number(e.target.value))}
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121922] rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateOpen(false)}
                  className="flex-1 py-2.5 border border-stone-200 hover:bg-stone-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold text-slate-650 cursor-pointer bg-white dark:bg-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#A97142] hover:bg-[#8e5c32] text-white rounded-xl text-xs font-bold cursor-pointer border-none"
                >
                  Importar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
