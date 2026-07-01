import React, { useState, useEffect } from "react";
import { Search, User, Phone, MapPin, Calendar, Star, DollarSign, MessageSquare, Award, Clock, ArrowLeft, Send } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  city: string;
  bookingsCount: number;
  totalSpent: number;
  rating: number;
  category: "VIP" | "Premium" | "Recorrente" | "Novo" | "Corporativo" | "Família" | "Casal";
  birthday: string;
  preferences: string[];
  favoriteProperties: string[];
  averageStayDays: number;
  history: {
    property: string;
    checkIn: string;
    checkOut: string;
    value: number;
    status: string;
  }[];
}

const INITIAL_GUEST_DATABASE: Guest[] = [
  {
    id: "g-1",
    name: "Amanda Albuquerque",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    phone: "+55 (11) 98234-5512",
    whatsapp: "5511982345512",
    city: "São Paulo, SP",
    bookingsCount: 6,
    totalSpent: 75000,
    rating: 5,
    category: "VIP",
    birthday: "12 de Outubro",
    preferences: ["Travesseiros extra macios", "Champagne Dom Pérignon na chegada", "Cama king-size", "Silêncio absoluto (longe da rua)"],
    favoriteProperties: ["Casa Lilian", "Casa Mayla"],
    averageStayDays: 6,
    history: [
      { property: "Casa Lilian", checkIn: "2026-05-18", checkOut: "2026-05-22", value: 12500, status: "Concluída" },
      { property: "Casa Mayla", checkIn: "2026-02-10", checkOut: "2026-02-18", value: 18000, status: "Concluída" },
      { property: "Casa Lilian", checkIn: "2025-12-28", checkOut: "2026-01-04", value: 25000, status: "Concluída" }
    ]
  },
  {
    id: "g-2",
    name: "John Smith",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    phone: "+1 (305) 555-0199",
    whatsapp: "13055550199",
    city: "Miami, EUA",
    bookingsCount: 4,
    totalSpent: 62000,
    rating: 5,
    category: "Premium",
    birthday: "24 de Março",
    preferences: ["Serviço de Chef Particular", "Carro de transfer blindado", "Vinho tinto Bordeaux Cabernet"],
    favoriteProperties: ["Casa Mayla", "Casa Nova"],
    averageStayDays: 10,
    history: [
      { property: "Casa Mayla", checkIn: "2026-05-17", checkOut: "2026-05-27", value: 22381.80, status: "Concluída" },
      { property: "Casa Nova", checkIn: "2025-11-05", checkOut: "2025-11-15", value: 16500.00, status: "Concluída" }
    ]
  },
  {
    id: "g-3",
    name: "XP Investimentos Corp",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    phone: "+55 (11) 3003-5588",
    whatsapp: "551130035588",
    city: "São Paulo, SP",
    bookingsCount: 12,
    totalSpent: 184500,
    rating: 4.8,
    category: "Corporativo",
    birthday: "Fundação: Julho",
    preferences: ["Internet de altíssima velocidade (Fibra redundante)", "Espaço de reunião / Home office completo", "Check-in flexível por código", "Nota fiscal corporativa rápida"],
    favoriteProperties: ["Predinho", "Casa Nova"],
    averageStayDays: 15,
    history: [
      { property: "Casa Nova", checkIn: "2026-05-01", checkOut: "2026-05-31", value: 15390.50, status: "Concluída" },
      { property: "Predinho", checkIn: "2026-04-01", checkOut: "2026-04-30", value: 20115.30, status: "Concluída" }
    ]
  },
  {
    id: "g-4",
    name: "Felipe Bronze",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    phone: "+55 (21) 97721-3990",
    whatsapp: "5521977213990",
    city: "Rio de Janeiro, RJ",
    bookingsCount: 5,
    totalSpent: 48900,
    rating: 4.9,
    category: "Recorrente",
    birthday: "08 de Setembro",
    preferences: ["Adega de vinhos totalmente abastecida", "Cozinha profissional equipada", "Ervas frescas plantadas na propriedade"],
    favoriteProperties: ["Casa Caio", "Casa Vintage"],
    averageStayDays: 5,
    history: [
      { property: "Casa Caio", checkIn: "2026-05-19", checkOut: "2026-05-24", value: 14202.10, status: "Concluída" },
      { property: "Casa Vintage", checkIn: "2025-10-12", checkOut: "2025-10-17", value: 9800.00, status: "Concluída" }
    ]
  },
  {
    id: "g-5",
    name: "Mariana Godoy & Família",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    phone: "+55 (81) 99121-8833",
    whatsapp: "5581991218833",
    city: "Recife, PE",
    bookingsCount: 3,
    totalSpent: 33400,
    rating: 4.7,
    category: "Família",
    birthday: "05 de Janeiro",
    preferences: ["Berço de bebê disponível", "Rede de proteção em janelas e sacadas", "Brinquedos de praia infantis"],
    favoriteProperties: ["Casa Mayla"],
    averageStayDays: 5,
    history: [
      { property: "Casa Mayla", checkIn: "2026-06-20", checkOut: "2026-06-25", value: 11200, status: "Confirmada" },
      { property: "Casa Mayla", checkIn: "2025-12-18", checkOut: "2025-12-25", value: 15600, status: "Concluída" }
    ]
  },
  {
    id: "g-6",
    name: "Roberto Silveira",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    phone: "+55 (11) 97722-0012",
    whatsapp: "5511977220012",
    city: "Campinas, SP",
    bookingsCount: 2,
    totalSpent: 11900,
    rating: 4.5,
    category: "Casal",
    birthday: "17 de Junho",
    preferences: ["Ar-condicionado regulado em 21°C", "Jacuzzi pré-aquecida", "Café espresso premium na máquina"],
    favoriteProperties: ["Casa Lilian", "Casa Caio"],
    averageStayDays: 3,
    history: [
      { property: "Casa Lilian", checkIn: "2026-06-12", checkOut: "2026-06-15", value: 5952.90, status: "Confirmada" },
      { property: "Casa Caio", checkIn: "2025-07-10", checkOut: "2025-07-13", value: 5950.00, status: "Concluída" }
    ]
  },
  {
    id: "g-7",
    name: "Lucas Mendes",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    phone: "+55 (31) 98822-7711",
    whatsapp: "5531988227711",
    city: "Belo Horizonte, MG",
    bookingsCount: 1,
    totalSpent: 4200,
    rating: 5,
    category: "Novo",
    birthday: "30 de Novembro",
    preferences: ["Indicações locais de trilhas e passeios", "Cesta de cookies de boas-vindas"],
    favoriteProperties: ["Casa Vintage"],
    averageStayDays: 4,
    history: [
      { property: "Casa Vintage", checkIn: "2026-06-02", checkOut: "2026-06-06", value: 4200, status: "Concluída" }
    ]
  }
];

export default function GuestsCRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUEST_DATABASE);
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: "agent" | "guest"; text: string; time: string }[]>>({
    "g-1": [
      { sender: "guest", text: "Olá! Consigo estender meu check-out na Casa Lilian no dia 22 por duas horas?", time: "14:32" },
      { sender: "agent", text: "Olá, Amanda! Como você é nossa hóspede VIP, já liberamos seu late check-out até às 14:00 sem custos extras. Aproveite!", time: "14:40" },
      { sender: "guest", text: "Maravilhoso! Muito obrigada pelo atendimento impecável de sempre.", time: "14:42" }
    ],
    "g-2": [
      { sender: "agent", text: "Good morning John! We have coordinated the private chef services for your arrival. Any specific allergies?", time: "09:15" },
      { sender: "guest", text: "Excellent, thank you. No allergies, just prefer seafood for the first dinner.", time: "10:02" }
    ]
  });
  const [currentMessage, setCurrentMessage] = useState("");

  // Sincronizar dinamicamente as reservas do backend no CRM
  const syncGuestsWithBackend = async () => {
    try {
      const [bookingsRes, propsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/pwa/properties")
      ]);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const propertiesData = propsRes.ok ? await propsRes.json() : [];

        let currentGuests = [...INITIAL_GUEST_DATABASE];

        bookingsData.forEach((b: any) => {
          const propName = propertiesData.find((p: any) => p.id === b.propertyId)?.name || b.propertyName || "Geral";
          const guestIndex = currentGuests.findIndex(g => g.name.toLowerCase() === b.guestName.toLowerCase());

          const historyItem = {
            property: propName,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            value: b.value,
            status: b.status
          };

          // Translate selectedServices to preferences
          const translatedPrefs = b.selectedServices && b.selectedServices.length > 0
            ? b.selectedServices.map((srvId: string) => {
                if (srvId === "breakfast") return "Café da Manhã Premium";
                if (srvId === "transfer") return "Serviço de Transfer executivo";
                if (srvId === "chef") return "Serviço de Chef Particular";
                if (srvId === "cleaning") return "Governança/Limpeza Extra";
                if (srvId === "amenities") return "Kit Amenities de Grife";
                return srvId;
              })
            : [];

          if (guestIndex !== -1) {
            // Hóspede já existe: atualizar histórico e contagem
            const guest = currentGuests[guestIndex];
            const alreadyInHistory = guest.history.some(h => h.checkIn === b.checkIn && h.property === propName);
            
            if (!alreadyInHistory) {
              const updatedHistory = [...guest.history, historyItem];
              const updatedPrefs = Array.from(new Set([...guest.preferences, ...translatedPrefs]));
              const updatedFavProps = Array.from(new Set([...guest.favoriteProperties, propName]));

              currentGuests[guestIndex] = {
                ...guest,
                bookingsCount: guest.bookingsCount + 1,
                totalSpent: guest.totalSpent + b.value,
                preferences: updatedPrefs,
                favoriteProperties: updatedFavProps,
                history: updatedHistory
              };
            }
          } else {
            // Hóspede novo: Criar Ficha no CRM
            const newGuest: Guest = {
              id: `guest-${b.id}`,
              name: b.guestName,
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
              phone: b.phone || "+55 (11) 99999-0000",
              whatsapp: b.phone ? b.phone.replace(/\D/g, "") : "5511999990000",
              city: "São Paulo, SP",
              bookingsCount: 1,
              totalSpent: b.value,
              rating: 5.0,
              category: b.isRecurrent ? "Recorrente" : "Novo",
              birthday: "Não informado",
              preferences: translatedPrefs.length > 0 ? translatedPrefs : ["Cesta de boas-vindas L | STAYS"],
              favoriteProperties: [propName],
              averageStayDays: b.daysCount || 3,
              history: [historyItem]
            };
            currentGuests.push(newGuest);
          }
        });

        setGuests(currentGuests);
      }
    } catch (e) {
      console.error("Erro ao sincronizar CRM de Hóspedes:", e);
    }
  };

  useEffect(() => {
    syncGuestsWithBackend();
  }, []);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guest.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || guest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Todos", "VIP", "Premium", "Recorrente", "Novo", "Corporativo", "Família", "Casal"];

  const handleSendMessage = (guestId: string) => {
    if (!currentMessage.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    
    setChatMessages((prev) => ({
      ...prev,
      [guestId]: [
        ...(prev[guestId] || []),
        { sender: "agent", text: currentMessage, time: timeStr }
      ]
    }));
    setCurrentMessage("");

    setTimeout(() => {
      setChatMessages((prev) => ({
        ...prev,
        [guestId]: [
          ...(prev[guestId] || []),
          { sender: "guest", text: "Entendido, obrigado pela confirmação rápida! Estarei aguardando.", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
        ]
      }));
    }, 1500);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "VIP": return "bg-amber-500/10 text-amber-500 border-amber-500/25";
      case "Premium": return "bg-[#C8A27A]/10 text-[#C8A27A] border-[#C8A27A]/25";
      case "Recorrente": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
      case "Novo": return "bg-blue-500/10 text-blue-500 border-blue-500/25";
      case "Corporativo": return "bg-purple-500/10 text-purple-500 border-purple-500/25";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/25 dark:text-slate-400";
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] overflow-hidden bg-[#FAFAFA] dark:bg-[#0B0F14] text-[#111111] dark:text-[#EAEAEA] animate-in fade-in duration-300">
      {/* LEFT: Guests List Dashboard */}
      <div className={`flex-1 flex flex-col p-6 overflow-y-auto space-y-6 ${selectedGuest ? "hidden lg:flex" : "flex"}`}>
        
        {/* CRM Top Headers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none text-left">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-[#111111] dark:text-[#EAEAEA]">
              CRM de Hóspedes Premium
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Gerencie a base de clientes exclusivos da carteira L | STAYS. Fichas atualizadas em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-[#C8A27A]/10 text-[#C8A27A] border border-[#C8A27A]/20 rounded-full">
              {guests.length} Hóspedes Registrados
            </span>
            <button 
              onClick={syncGuestsWithBackend}
              className="p-1 px-2 text-xs border border-stone-250 dark:border-slate-800 rounded bg-white dark:bg-stone-900 cursor-pointer"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Search bar & Categories pills */}
        <div className="space-y-4 select-none">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome ou cidade do hóspede..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#202A36] bg-white dark:bg-[#121922] text-xs font-semibold focus:outline-none focus:border-[#C8A27A] text-slate-700 dark:text-slate-300"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#C8A27A] text-white border-[#C8A27A]"
                    : "bg-white dark:bg-[#121922] border-slate-200 dark:border-[#202A36] text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Guests Cards Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              onClick={() => setSelectedGuest(guest)}
              className="p-4 bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-start text-left"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C8A27A]/30">
                  <img src={guest.avatar} alt={guest.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {guest.name}
                    <span className={`text-[7.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getCategoryColor(guest.category)}`}>
                      {guest.category}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {guest.city}
                  </p>
                  <p className="text-[9.5px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                    <Phone size={10} /> {guest.phone}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[8px] text-slate-400 block font-bold uppercase">Gasto Total</span>
                <strong className="text-xs text-[#C8A27A] font-mono block">
                  R$ {guest.totalSpent.toLocaleString("pt-BR")}
                </strong>
                <span className="text-[9px] text-slate-400 font-medium block">
                  {guest.bookingsCount} estadias
                </span>
              </div>
            </div>
          ))}
          {filteredGuests.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              Nenhum hóspede registrado sob estes filtros de pesquisa.
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: Selected Guest Folio (Cartela de Cliente) & WhatsApp Chat simulator */}
      {selectedGuest && (
        <div className="w-full lg:w-[420px] bg-white dark:bg-[#121922] border-l border-slate-200 dark:border-[#202A36] flex flex-col h-full overflow-hidden shrink-0 animate-in slide-in-from-right duration-350 select-none text-left">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-[#202A36] flex items-center gap-3">
            <button
              onClick={() => setSelectedGuest(null)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C8A27A]/30">
              <img src={selectedGuest.avatar} alt={selectedGuest.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[200px]">
                {selectedGuest.name}
              </h3>
              <span className="text-[9.5px] text-slate-450 uppercase tracking-wider font-bold">Ficha de Hóspede VIP</span>
            </div>
          </div>

          {/* Guest detailed stats tabs */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 dark:bg-black/25 border border-slate-150 dark:border-slate-850 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-slate-400 block font-bold uppercase">Estadias</span>
                <strong className="text-sm font-mono text-slate-900 dark:text-white block mt-0.5">{selectedGuest.bookingsCount}</strong>
              </div>
              <div className="bg-slate-50 dark:bg-black/25 border border-slate-150 dark:border-slate-850 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-slate-400 block font-bold uppercase">Média Dias</span>
                <strong className="text-sm font-mono text-slate-900 dark:text-white block mt-0.5">{selectedGuest.averageStayDays} noites</strong>
              </div>
              <div className="bg-slate-50 dark:bg-black/25 border border-slate-150 dark:border-slate-850 p-2.5 rounded-xl text-center">
                <span className="text-[8px] text-slate-400 block font-bold uppercase">Avaliação</span>
                <strong className="text-sm font-mono text-[#C8A27A] flex items-center justify-center gap-0.5 mt-0.5">
                  <Star size={11} fill="currentColor" /> {selectedGuest.rating}
                </strong>
              </div>
            </div>

            {/* Client Preferences / Folio Services */}
            <div className="space-y-2">
              <h5 className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award size={11} className="text-[#C8A27A]" /> Preferências & Serviços Contratados
              </h5>
              <div className="flex flex-wrap gap-1">
                {selectedGuest.preferences.map((pref, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md border border-[#C8A27A]/20 bg-[#C8A27A]/5 text-[9.5px] font-semibold text-slate-700 dark:text-stone-300"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            {/* Favorite houses */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Casas Preferidas:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedGuest.favoriteProperties.join(" • ") || "Nenhuma registrada ainda"}
              </p>
            </div>

            {/* History stack */}
            <div className="space-y-2.5">
              <h5 className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={11} /> Histórico de Reservas
              </h5>
              <div className="space-y-2">
                {selectedGuest.history.map((hist, index) => (
                  <div
                    key={index}
                    className="p-2.5 bg-slate-50/70 dark:bg-black/15 border border-slate-150 dark:border-slate-850 rounded-xl flex justify-between items-center text-[10px]"
                  >
                    <div>
                      <strong className="text-slate-850 dark:text-slate-200">{hist.property}</strong>
                      <span className="text-[9px] text-slate-450 block mt-0.5">{hist.checkIn} a {hist.checkOut}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-[#C8A27A] font-mono">R$ {hist.value.toLocaleString("pt-BR")}</strong>
                      <span className="text-[8px] uppercase tracking-wider block font-bold mt-0.5 opacity-80">{hist.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated direct chat */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#202A36]">
              <h5 className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare size={11} /> Conversa Direta (WhatsApp)
              </h5>
              
              <div className="h-[140px] border border-slate-150 dark:border-slate-850 bg-stone-50 dark:bg-black/10 rounded-2xl p-3 overflow-y-auto space-y-2 flex flex-col no-scrollbar">
                {(chatMessages[selectedGuest.id] || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[80%] p-2 rounded-xl text-[10px] ${
                      msg.sender === "agent"
                        ? "bg-[#C8A27A] text-slate-950 align-self-end rounded-br-none ml-auto"
                        : "bg-white dark:bg-[#1C2430] border border-slate-200 dark:border-slate-800 text-stone-750 dark:text-stone-300 align-self-start rounded-bl-none mr-auto"
                    }`}
                  >
                    <p className="leading-tight">{msg.text}</p>
                    <span className="text-[7.5px] opacity-60 block text-right mt-0.5">{msg.time}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Responder hóspede..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(selectedGuest.id)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-[#121922] text-[10.5px] focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage(selectedGuest.id)}
                  className="p-2 bg-[#C8A27A] text-white rounded-lg hover:bg-[#a97142] cursor-pointer border-none"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
