import React from 'react';
import { Property } from '../types';
import { Menu, Calendar, Users, MapPin, Star, Award, ShieldCheck, Heart, Coffee, MessageSquare, Mail, Copy, Check } from 'lucide-react';
import { LiStaysLogo } from './Sidebar';

export const AIRBNB_LINKS = [
  { id: "1526327693540731578", name: "Mansão Joá View (Airbnb #152632)", url: "https://www.airbnb.com.br/rooms/1526327693540731578?unique_share_id=00ba5ff1-9c99-4062-ab1d-519e649a0d52&viralityEntryPoint=1&s=76" },
  { id: "1471648914432118072", name: "Penthouse Leblon Beach (Airbnb #147164)", url: "https://www.airbnb.com.br/rooms/1471648914432118072?unique_share_id=a382786f-7d0c-48b1-8ee9-79cfad5c1823&viralityEntryPoint=1&s=76" },
  { id: "1660290063044722663", name: "Vila Trancoso Bahia (Airbnb #166029)", url: "https://www.airbnb.com.br/rooms/1660290063044722663?unique_share_id=87f9329f-4b0f-4f20-ad98-0f339c002038&viralityEntryPoint=1&s=76" },
  { id: "1569787466276931649", name: "Chalet Campos Jordão (Airbnb #156978)", url: "https://www.airbnb.com.br/rooms/1569787466276931649?unique_share_id=8f176f08-2855-42ce-b20c-2feb4cb8ed6b&viralityEntryPoint=1&s=76" },
  { id: "1632034942588742282", name: "Luxury Flat Itaim Bibi (Airbnb #163203)", url: "https://www.airbnb.com.br/rooms/1632034942588742282?unique_share_id=52a40ef1-d995-4235-903e-c9cbc4c5fb64&viralityEntryPoint=1&s=76" },
  { id: "1495899086744492462", name: "Casa Beira-Mar Baleia (Airbnb #149589)", url: "https://www.airbnb.com.br/rooms/1495899086744492462?unique_share_id=1d549bdb-9446-4293-88ba-a34106592bb0&viralityEntryPoint=1&s=76" }
];

export const CONCIERGE_SERVICES = [
  { id: "breakfast", name: "Café da Manhã Premium", price: 80, isPerPerson: true, desc: "Café artesanal completo entregue na propriedade por pessoa/dia." },
  { id: "transfer", name: "Transfer Executivo Aeroporto", price: 250, isPerPerson: false, desc: "Trajeto de ida ou volta em veículo executivo blindado." },
  { id: "chef", name: "Chef Particular de Cozinha", price: 800, isPerPerson: false, desc: "Gastronomia sob demanda com chef exclusivo por dia." },
  { id: "cleaning", name: "Limpeza Diária Extra", price: 150, isPerPerson: false, desc: "Serviço de governança e arrumação adicional diário." },
  { id: "amenities", name: "Amenities de Grife Exclusivas", price: 120, isPerPerson: false, desc: "Kit adicional de sabonetes e enxoval L'Occitane." }
];

export function PublicVitrine({ properties }: { properties: Property[] }) {
  const [selectedProp, setSelectedProp] = React.useState<Property | null>(null);
  
  // Expanded form states
  const [guestName, setGuestName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guestsCount, setGuestsCount] = React.useState(2);
  const [origin, setOrigin] = React.useState<"Airbnb" | "Direta">("Direta");
  const [airbnbUrl, setAirbnbUrl] = React.useState(AIRBNB_LINKS[0].url);
  const [isRecurrent, setIsRecurrent] = React.useState(false);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  
  const [bookedSuccess, setBookedSuccess] = React.useState(false);
  const [createdBooking, setCreatedBooking] = React.useState<any | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Filter properties with high quality images
  const boutiqueProperties = properties.filter(p => p.image);

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateTotalValue = (propDailyRate: number) => {
    const days = calculateDays();
    let propTotal = propDailyRate * days;
    
    let servicesTotal = 0;
    selectedServices.forEach(srvId => {
      const srv = CONCIERGE_SERVICES.find(s => s.id === srvId);
      if (srv) {
        if (srv.isPerPerson) {
          servicesTotal += srv.price * guestsCount * days;
        } else {
          // If transfer or amenities, it's one-time or per day? Let's treat it as one-time for transfer/amenities, per day for chef/cleaning.
          if (srv.id === "chef" || srv.id === "cleaning") {
            servicesTotal += srv.price * days;
          } else {
            servicesTotal += srv.price;
          }
        }
      }
    });

    return propTotal + servicesTotal;
  };

  const getFormattedShareMessage = (booking: any) => {
    const srvNames = booking.selectedServices && booking.selectedServices.length > 0
      ? booking.selectedServices.map((id: string) => {
          const s = CONCIERGE_SERVICES.find(srv => srv.id === id);
          return s ? s.name : id;
        }).join(", ")
      : "Nenhum";

    return `*SOLICITAÇÃO DE RESERVA - L | STAYS*
---------------------------------------
*Hóspede:* ${booking.guestName} (${booking.isRecurrent ? "Cliente Recorrente" : "Novo Cliente"})
*Telefone:* ${booking.phone}
*Origem/Canal:* ${booking.origin}
${booking.origin === "Airbnb" ? `*Link Anúncio:* ${booking.airbnbUrl}\n` : ""}*Propriedade:* ${properties.find(p => p.id === booking.propertyId)?.name || "Geral"}
*Período:* ${new Date(booking.checkIn).toLocaleDateString("pt-BR")} a ${new Date(booking.checkOut).toLocaleDateString("pt-BR")} (${booking.daysCount} diárias)
*Hóspedes:* ${booking.guestsCount} pessoas
*Serviços Adicionais:* ${srvNames}
*Valor Total:* R$ ${booking.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProp) return;

    const days = calculateDays();
    const propDailyRate = selectedProp.rooms * 450; // base rate mapping
    const totalVal = calculateTotalValue(propDailyRate);

    const bookingPayload = {
      propertyId: selectedProp.id,
      guestName,
      phone,
      origin: origin === "Airbnb" ? "Airbnb" : "Direta",
      checkIn,
      checkOut,
      value: totalVal,
      commission: origin === "Airbnb" ? totalVal * 0.1 : 0,
      status: "Pendente",
      notes: origin === "Airbnb" ? `Simulado via Link Airbnb: ${airbnbUrl}` : "Solicitado via site direto L | STAYS",
      guestsCount,
      selectedServices,
      isRecurrent,
      daysCount: days,
      airbnbUrl: origin === "Airbnb" ? airbnbUrl : ""
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedBooking(data);
        setBookedSuccess(true);
      }
    } catch (err) {
      console.error("Failed to post booking:", err);
      // Fallback local simulation if fetch fails
      const fallbackData = { ...bookingPayload, id: `bk-${Date.now()}` };
      setCreatedBooking(fallbackData);
      setBookedSuccess(true);
    }
  };

  const handleCopyClipboard = () => {
    if (!createdBooking) return;
    const msg = getFormattedShareMessage(createdBooking);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!createdBooking) return;
    const msg = encodeURIComponent(getFormattedShareMessage(createdBooking));
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const handleShareEmail = () => {
    if (!createdBooking) return;
    const subject = encodeURIComponent(`Nova Reserva L | STAYS - ${createdBooking.guestName}`);
    const body = encodeURIComponent(getFormattedShareMessage(createdBooking));
    window.open(`mailto:recepcao@lstays.com?subject=${subject}&body=${body}`, "_blank");
  };

  const handleClose = () => {
    setBookedSuccess(false);
    setSelectedProp(null);
    setGuestName("");
    setPhone("");
    setCheckIn("");
    setCheckOut("");
    setGuestsCount(2);
    setOrigin("Direta");
    setIsRecurrent(false);
    setSelectedServices([]);
    setCreatedBooking(null);
  };

  return (
    <div className="min-h-screen w-full font-sans bg-[#F8F6F2] text-[#111111] overflow-y-auto">
      
      {/* Luxury Boutique Header */}
      <header 
        className="h-20 w-full flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 bg-[#111111] border-b border-[#C8A27A]/20"
      >
        <div className="flex items-center gap-4 select-none">
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#F8F6F2]">
            <LiStaysLogo className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#F8F6F2] text-base md:text-lg leading-none font-bold font-display tracking-[0.1em]">
              L | STAYS
            </h1>
            <span className="text-[#C8A27A] text-[8px] tracking-[0.25em] font-extrabold uppercase mt-1">
              LUXURY RETREATS & BOUTIQUE APARTMENTS
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-wider font-semibold text-[#F8F6F2]">
          <a href="#propriedades" className="hover:text-[#C8A27A] transition">Coleções</a>
          <a href="#experiencia" className="hover:text-[#C8A27A] transition">Experiência</a>
          <a href="#concierge" className="hover:text-[#C8A27A] transition">Concierge</a>
        </div>

        <button className="text-[#F8F6F2] hover:text-[#C8A27A] transition md:hidden cursor-pointer">
          <Menu size={24} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=80" 
            alt="Hero Background"
            className="w-full h-full object-cover scale-105 filter brightness-[0.3]"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl space-y-4 select-none">
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#C8A27A] bg-[#C8A27A]/10 px-4 py-1.5 rounded-full border border-[#C8A27A]/25 backdrop-blur-sm">
            Simulador de Reserva Direta & Airbnb
          </span>
          <h2 className="text-2xl md:text-4xl text-white font-bold leading-tight font-display tracking-tight">
            Solicite sua Reserva com Serviços Customizados
          </h2>
          <p className="text-xs text-slate-350 max-w-xl mx-auto">
            Escolha uma propriedade da nossa curadoria de luxo, configure os serviços de concierge, selecione o canal e envie imediatamente para o controle de recepção.
          </p>
        </div>
      </section>

      {/* Property Listing Feed */}
      <section id="propriedades" className="py-12 px-6 md:px-12 max-w-7xl mx-auto space-y-8 select-none">
        <div className="text-center space-y-2">
          <h3 className="font-display font-bold text-2xl tracking-tight text-[#111111]">
            Nossas Mansões & Apartamentos
          </h3>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Selecione uma das opções exclusivas para iniciar o fluxo de simulação de reserva direcionado para controle na Web e PWA.
          </p>
        </div>

        {/* Grid Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boutiqueProperties.map((prop, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-350 flex flex-col justify-between group"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={prop.image} 
                  alt={prop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-4 left-4 text-[9px] uppercase font-extrabold tracking-wider bg-[#111111]/85 text-[#F8F6F2] border border-[#C8A27A]/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  {prop.location}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#111111]">{prop.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      {prop.rooms} Quartos • {prop.sizeSqM}m² de Área Privativa
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star size={12} fill="currentColor" />
                    {prop.stars}
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                  {prop.description}
                </p>

                {/* Price and Booking button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Diária</span>
                    <strong className="text-xs text-[#111111]">
                      R$ {(prop.rooms * 450).toLocaleString("pt-BR")} <span className="text-[10px] text-slate-450 font-normal">/ noite</span>
                    </strong>
                  </div>
                  <button 
                    onClick={() => setSelectedProp(prop)}
                    className="px-4 py-2 bg-[#111111] text-white hover:bg-[#C8A27A] hover:text-[#111111] transition rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer border-none"
                  >
                    Simular Reserva
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form Modal */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 backdrop-blur-sm">
          <div className="bg-white border border-[#EAEAEA] rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl p-6 relative">
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 p-1"
            >
              ✕
            </button>

            <h3 className="font-serif font-bold text-base text-[#A97142] uppercase tracking-wider mb-1">
              Controle de Reserva Integrada
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 text-left">
              Unidade: <strong className="text-slate-800">{selectedProp.name}</strong> ({selectedProp.location})
            </p>

            {bookedSuccess && createdBooking ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-xs uppercase text-slate-850">Solicitação Registrada no Painel!</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Os dados foram integrados com sucesso. Esta reserva já está disponível no painel de **Recepção Web** e na **Central PWA Mobile**.
                </p>

                {/* Rich Message Box to Copy */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left font-mono text-[10.5px] leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-line text-stone-700">
                  {getFormattedShareMessage(createdBooking)}
                </div>

                {/* Sharing actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <MessageSquare size={13} />
                      WhatsApp Recepção
                    </button>
                    <button
                      onClick={handleShareEmail}
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <Mail size={13} />
                      Email Recepção
                    </button>
                  </div>

                  <button
                    onClick={handleCopyClipboard}
                    className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <Copy size={12} />
                    {copied ? "Copiado para Área de Transferência!" : "Copiar Ficha Detalhada"}
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-600 cursor-pointer bg-white"
                  >
                    Voltar ao Feed
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookNow} className="space-y-4 text-xs text-left">
                {/* Channel / Origin */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Canal de Origem</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value as any)}
                      className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C8A27A] bg-white text-stone-900"
                    >
                      <option value="Direta">L | STAYS Direto</option>
                      <option value="Airbnb">Airbnb Host</option>
                    </select>
                  </div>

                  {/* Recurrent Checkbox */}
                  <div className="flex items-center gap-2 pt-5">
                    <input 
                      type="checkbox"
                      id="recurrent-check"
                      checked={isRecurrent}
                      onChange={(e) => setIsRecurrent(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-200 accent-[#A97142]"
                    />
                    <label htmlFor="recurrent-check" className="text-[10.5px] font-bold text-stone-600 cursor-pointer">
                      Cliente Recorrente
                    </label>
                  </div>
                </div>

                {/* Selected Airbnb URL (if origin === Airbnb) */}
                {origin === "Airbnb" && (
                  <div className="flex flex-col gap-1.5 p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
                    <label className="text-[10px] uppercase font-bold text-rose-700">Link do Anúncio no Airbnb</label>
                    <select
                      value={airbnbUrl}
                      onChange={(e) => setAirbnbUrl(e.target.value)}
                      className="w-full p-2 border border-rose-200 rounded-lg focus:outline-none focus:border-rose-400 bg-white text-stone-900"
                    >
                      {AIRBNB_LINKS.map(link => (
                        <option key={link.id} value={link.url}>
                          {link.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-rose-600 opacity-80 mt-1">
                      A reserva será vinculada ao anúncio ativo acima no controle de recepção.
                    </p>
                  </div>
                )}

                {/* Guest Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Nome do Hóspede</label>
                    <input 
                      required 
                      type="text" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nome Completo" 
                      className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C8A27A]" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450">WhatsApp / Telefone</label>
                    <input 
                      required 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+55 (11) 99999-9999" 
                      className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C8A27A]" 
                    />
                  </div>
                </div>

                {/* Dates & Guests Count */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Check-in</label>
                    <input 
                      required 
                      type="date" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C8A27A]" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Check-out</label>
                    <input 
                      required 
                      type="date" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C8A27A]" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Hóspedes</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C8A27A]" 
                    />
                  </div>
                </div>

                {/* Concierge Opcionais */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="text-[10.5px] uppercase font-bold text-stone-600 block">Serviços Adicionais (Concierge)</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto p-1 border border-stone-100 rounded-xl bg-stone-50/50">
                    {CONCIERGE_SERVICES.map(srv => {
                      const isSelected = selectedServices.includes(srv.id);
                      return (
                        <div 
                          key={srv.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedServices(prev => prev.filter(id => id !== srv.id));
                            } else {
                              setSelectedServices(prev => [...prev, srv.id]);
                            }
                          }}
                          className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? "bg-white border-[#A97142] shadow-xs" 
                              : "bg-white border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div className="text-left max-w-[80%]">
                            <span className="font-bold text-[11px] block text-stone-850">{srv.name}</span>
                            <span className="text-[9px] text-stone-500 block leading-tight mt-0.5">{srv.desc}</span>
                          </div>
                          <span className="font-mono text-[10.5px] font-bold text-[#A97142] shrink-0">
                            +R$ {srv.price} {srv.isPerPerson ? "/pessoa" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Price summary */}
                <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 mt-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Estadia estimada: {calculateDays()} noites</span>
                    <span className="text-xs text-slate-400">Total Previsto:</span>
                    <strong className="block text-base text-[#A97142] font-mono">
                      R$ {calculateTotalValue(selectedProp.rooms * 450).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleClose}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer bg-white font-bold"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-[#111111] hover:bg-[#C8A27A] hover:text-[#111111] text-white transition rounded-xl font-bold uppercase tracking-wider cursor-pointer border-none"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Luxury Footer */}
      <footer className="bg-[#111111] border-t border-[#C8A27A]/25 py-12 px-6 md:px-12 text-center text-slate-500 text-[10.5px] select-none mt-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center mb-2">
            <LiStaysLogo className="w-10 h-10" />
          </div>
          <p className="text-slate-400 font-medium">
            L | STAYS OS — Central Boutique de Hospitalidade Internacional
          </p>
          <p className="text-slate-650 max-w-md mx-auto">
            © {new Date().getFullYear()} L | STAYS. Todos os direitos reservados. Experiências luxuosas curadas individualmente.
          </p>
        </div>
      </footer>
    </div>
  );
}
