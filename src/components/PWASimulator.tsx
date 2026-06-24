import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Building, Calendar as CalendarIcon, DollarSign, Home, 
  Sparkles, Moon, Sun, Smartphone, Bell, Wifi, Battery, RotateCcw, HelpCircle, Plus,
  FileDown, X
} from "lucide-react";

import { Property, FinanceItem, AgendaEvent } from "./pwa/types";
import LoginScreen from "./pwa/LoginScreen";
import HomeScreen from "./pwa/HomeScreen";
import PropertiesScreen from "./pwa/PropertiesScreen";
import FinanceScreen from "./pwa/FinanceScreen";
import CalendarScreen from "./pwa/CalendarScreen";
import Logo from "./pwa/Logo";
import { generatePDF } from "../utils/pdfGenerator";

interface PWASimulatorProps {
  properties: any[]; 
  bookings: any[];
  expenses: any[];
  revenues: any[];
  maintenances: any[];
  suppliers: any[];
  onDataChanged: () => void;
  onClose: () => void;
  darkMode?: boolean;
  onLogout?: () => void;
  currentUser?: any;
  onLogin?: (user: any) => void;
  isDirectRoute?: boolean;
}

export default function PWASimulator({ 
  onClose, 
  isDirectRoute = false, 
  darkMode, 
  currentUser, 
  onLogin, 
  onDataChanged,
  properties: parentProperties,
  bookings: parentBookings,
  expenses: parentExpenses,
  revenues: parentRevenues,
  maintenances: parentMaintenances
}: PWASimulatorProps) {
  // Simulator configuration states
  const [isDarkMode, setIsDarkMode] = useState(darkMode || false); // Can toggle Light mode vs Dark ivory mode!

  useEffect(() => {
    if (darkMode !== undefined) {
      setIsDarkMode(darkMode);
    }
  }, [darkMode]);

  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileSize = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileScreen(isMobileSize || isMobileUA);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [loggedUser, setLoggedUser] = useState<string | null>(() => {
    if (currentUser && currentUser.name && currentUser.name !== "Convidado") {
      return currentUser.name;
    }
    return null;
  });

  useEffect(() => {
    if (currentUser && currentUser.name && currentUser.name !== "Convidado") {
      setLoggedUser(currentUser.name);
    } else {
      setLoggedUser(null);
    }
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<"inicio" | "propriedades" | "financeiro" | "calendario" | "ocr">("inicio");
  
  // Interactive Humorous Resort Vibe states
  const [resortMood, setResortMood] = useState<"luxury" | "party" | "pet">("luxury");
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; size: number }[]>([]);
  const [activeMascotQuote, setActiveMascotQuote] = useState<string | null>(null);

  const triggerMoodShower = (type: "luxury" | "party" | "pet") => {
    let emojis: string[] = [];
    if (type === "luxury") {
      emojis = ["💎", "🔑", "🏡", "⭐️", "✨"];
    } else if (type === "party") {
      emojis = ["🐥", "🍹", "🌴", "🕶️", "🦄", "🛟"];
    } else if (type === "pet") {
      emojis = ["🐶", "🦴", "🐾", "🕶️", "🎾", "🍖"];
    }

    const newParticles = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 88 + 6, // keep centered in phone screen
      size: Math.random() * 10 + 14, // 14 to 24 px
    }));
    
    setParticles(newParticles);
    
    // Clear particles after 4.5 seconds
    setTimeout(() => {
      setParticles([]);
    }, 4500);

    const quotes = {
      luxury: [
        "Elegância ativada! Limpando as taças de cristal virtualmente... ✨",
        "Modo Ultra Sofisticado: O Prosecco está gelando a exatos 5.4ºC. 🍾",
        "Aroma de alecrim e couro italiano impregnando os servidores da nuvem... 🌿",
        "Cuidado: O brilho desse mármore Carrara pode exigir óculos escuros!"
      ],
      party: [
        "REVISE AS BOIAS! Encontramos 3 patinhos de borracha presidindo a hidromassagem! 🐥",
        "ALERTA OPERACIONAL: O barman virtual dobrou a quantidade de hortelã nos Mojitos! 🍹",
        "Festa na Piscina liberada! Unicórnios infláveis inflados com 100% de otimismo! 🦄",
        "Atenção: A taxa de ocupação da pista de dança acaba de atingir 98%!"
      ],
      pet: [
        "Au-au! O inspetor Hugo Kobayashi aprova os tapetes de alta gramatura! 🐶",
        "Lembrete VIP: Hóspedes de 4 patas não pagam taxa de limpeza se deixarem carinho! 🐾",
        "Análise preditiva: Um osso de ouro oculto foi enterrado no jardim da Casa Beira-Mar! 🦴",
        "Contabilidade Animal: Encontramos 4 petiscos nas almofadas do sofá. Lançado como Ativo de Liquidez!"
      ]
    };
    
    const randomQuote = quotes[type][Math.floor(Math.random() * quotes[type].length)];
    setActiveMascotQuote(randomQuote);

    // Auto dismiss check after 7 seconds
    setTimeout(() => {
      setActiveMascotQuote(prev => prev === randomQuote ? null : prev);
    }, 7000);
  };
  
  // Real REST synced state containers
  const [properties, setProperties] = useState<Property[]>([]);
  const [finances, setFinances] = useState<FinanceItem[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  
  // Loading indicators
  const [loading, setLoading] = useState(true);

  // Synchronize dynamic databases on mount
  const loadDatabase = async () => {
    try {
      setLoading(true);
      const [propsRes, finsRes, agsRes] = await Promise.all([
        fetch("/api/pwa/properties"),
        fetch("/api/pwa/finances"),
        fetch("/api/pwa/agenda")
      ]);
      
      const props = await propsRes.json();
      const fins = await finsRes.json();
      const ags = await agsRes.json();

      setProperties(props);
      setFinances(fins);
      setAgenda(ags);
    } catch (e) {
      console.error("Failed to load backend state collections:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Sync PWA state when main desktop state changes
  useEffect(() => {
    loadDatabase();
  }, [parentProperties, parentBookings, parentExpenses, parentRevenues, parentMaintenances]);

  // Sync mutations
  const handleAddProperty = async (newProp: Omit<Property, "id">) => {
    try {
      const res = await fetch("/api/pwa/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProp)
      });
      const added = await res.json();
      setProperties(prev => [...prev, added]);
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProperty = async (id: string, updated: Partial<Property>) => {
    try {
      const res = await fetch(`/api/pwa/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const edited = await res.json();
      setProperties(prev => prev.map(p => p.id === id ? edited : p));
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFinance = async (entry: Omit<FinanceItem, "id">) => {
    try {
      const res = await fetch("/api/pwa/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      const added = await res.json();
      setFinances(prev => [added, ...prev]);

      // If added is a revenue, reload properties on home screen to sync property received sum dynamically!
      if (added.type === "receita") {
        await loadDatabase();
      }
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFinance = async (id: string, updated: Partial<FinanceItem>) => {
    try {
      const res = await fetch(`/api/pwa/finances/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const edited = await res.json();
      setFinances(prev => prev.map(f => f.id === id ? edited : f));
      await loadDatabase();
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFinance = async (id: string) => {
    try {
      await fetch(`/api/pwa/finances/${id}`, {
        method: "DELETE"
      });
      setFinances(prev => prev.filter(f => f.id !== id));
      await loadDatabase();
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (event: Omit<AgendaEvent, "id">) => {
    try {
      const res = await fetch("/api/pwa/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
      });
      const added = await res.json();
      setAgenda(prev => [...prev, added]);
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEvent = async (id: string, updated: Partial<AgendaEvent>) => {
    try {
      const res = await fetch(`/api/pwa/agenda/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const edited = await res.json();
      setAgenda(prev => prev.map(ev => ev.id === id ? edited : ev));
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/pwa/agenda/${id}`, {
        method: "DELETE"
      });
      setAgenda(prev => prev.filter(ev => ev.id !== id));
      onDataChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDatabase = async () => {
    // Refresh client lists
    await loadDatabase();
    if (onLogin) {
      onLogin(null);
    }
    setLoggedUser(null);
    setActiveTab("inicio");
  };

  const handleUserLogin = (user: any) => {
    if (onLogin) {
      onLogin(user);
    }
    setLoggedUser(user.name);
    setActiveTab("inicio");
  };

  // Switch navigation tabs smoothly
  const handleSwitchTab = (tab: string) => {
    if (tab === "propriedades") setActiveTab("propriedades");
    else if (tab === "financeiro") setActiveTab("financeiro");
    else if (tab === "calendario") setActiveTab("calendario");
    else if (tab === "ocr") setActiveTab("ocr");
    else setActiveTab("inicio");
  };

  const renderPhoneViewport = () => {
    return (
      <div className={`w-full h-full flex-1 flex flex-col relative overflow-hidden ${
        isDarkMode ? "bg-black" : "bg-[#FAF8F5]"
      }`}>
        {/* Background Image for Dark Mode - Modern Luxury Villa at Dusk */}
        {isDarkMode && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none transition-all duration-700">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80" 
              alt="Resort Dark Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-20 filter saturate-[0.8] contrast-[1.10] brightness-[0.85] transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent/5 to-black/35" />
          </div>
        )}

        {/* Background Image for Light Mode - Sunny Modern Beachfront Luxury Villa */}
        {!isDarkMode && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none transition-all duration-705">
            <img 
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80" 
              alt="Resort Light Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter saturate-[1.1] contrast-[1.05] brightness-[1.02] transition-all duration-1000 opacity-[0.24]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/35 to-[#FAF8F5]/10" />
          </div>
        )}

        {/* Interactive Particle Rain Overlay */}
        <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -45, x: `${p.x}%`, opacity: 1, rotate: 0 }}
              animate={{ 
                y: 770, 
                rotate: Math.random() > 0.5 ? 360 : -360,
                opacity: [1, 1, 1, 0.2, 0]
              }}
              transition={{ 
                duration: Math.random() * 1.5 + 2.0, 
                ease: "easeOut" 
              }}
              className="absolute select-none pointer-events-auto text-center filter drop-shadow-sm cursor-pointer hover:scale-150 transition-transform duration-200 active:scale-95"
              style={{ fontSize: p.size }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>

        {/* Visually Humorous Resort Mascot Floating Balloon Dialogue Popup */}
        <AnimatePresence>
          {activeMascotQuote && (
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.93 }}
              animate={{ opacity: 1, y: 35, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
              className="absolute inset-x-3.5 z-50 pointer-events-auto"
            >
              <div className={`p-3 rounded-2xl border shadow-xl backdrop-blur-md flex items-start space-x-2 transition-all ${
                isDarkMode 
                  ? "bg-zinc-950/95 border-[#C59B27]/40 text-neutral-100" 
                  : "bg-[#FFF]/92 border-[#C59B27]/40 text-amber-950 shadow-amber-900/10"
              }`}>
                <span className="text-xl select-none shrink-0 animate-bounce">
                  {resortMood === "luxury" ? "🤵" : resortMood === "party" ? "🐥" : "🐶"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C59B27] truncate">
                      {resortMood === "luxury" ? "Casa Select Concierge VIP" : resortMood === "party" ? "Chefinho Patinho 🛟" : "Inspetor Hugo (Au-au!)"}
                    </span>
                    <button 
                      onClick={() => setActiveMascotQuote(null)}
                      type="button"
                      className="p-1 rounded-full hover:bg-current/10 active:scale-90 transition cursor-pointer shrink-0"
                      title="Fechar balão"
                    >
                      <X size={10} className="opacity-60" />
                    </button>
                  </div>
                  <p className="text-[10px] leading-tight font-medium mt-0.5 select-text">
                    "{activeMascotQuote}"
                  </p>
                  
                  <div className="mt-1.5 flex justify-end space-x-1.5">
                    <button
                      onClick={() => {
                        triggerMoodShower(resortMood);
                      }}
                      type="button"
                      className="text-[8px] font-bold uppercase tracking-widest bg-[#C59B27]/10 text-[#C59B27] px-2 py-0.5 rounded hover:bg-[#C59B27]/25 active:scale-95 transition cursor-pointer"
                    >
                      {resortMood === "luxury" ? "Polir Mármore ✨" : resortMood === "party" ? "Mais Boias! 🛟" : "Dar Petisco! 🦴"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3 z-10 relative">
            <div className="w-8 h-8 rounded-full border-2 border-[#C59B27] border-t-transparent animate-spin" />
            <span className="text-xs font-medium font-mono text-[#C59B27]">Carregando Casa Select...</span>
          </div>
        ) : loggedUser === null ? (
          <LoginScreen onLogin={handleUserLogin} isDarkMode={isDarkMode} />
        ) : (
          <div className={`w-full h-full flex-col flex px-5 relative z-10 ${
            isDarkMode ? "text-neutral-100" : "text-[#1C150D]"
          }`}>
            
            {/* Simulated Sticky Top Header bar with Crest and notifications */}
            <div className={`flex justify-between items-center pt-2.5 pb-2.5 border-b mb-1 ${
              isDarkMode ? "border-neutral-800 bg-[#121212]/90" : "border-[#EFE1D1]/60 bg-[#FAF8F5]/90"
            } bg-opacity-95 backdrop-blur z-20`}>
              <div className="flex items-center" onClick={() => setActiveTab("inicio")}>
                <Logo variant="header" isDarkMode={isDarkMode} size={28} />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-1 rounded-full transition-all duration-200 cursor-pointer ${
                    isDarkMode ? "hover:bg-zinc-800 text-amber-400" : "hover:bg-slate-200 text-slate-500"
                  }`}
                  title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                >
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>

                <div className="relative">
                  <Bell size={15} className="opacity-80" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#C59B27]" />
                </div>

                <div className="w-6 h-6 rounded-full bg-[#C59B27] text-white font-extrabold flex items-center justify-center text-[9px] border border-white/10 shadow-sm uppercase">
                  {loggedUser ? loggedUser.split(" ").map(w => w[0] || "").join("").substring(0, 2).toUpperCase() : "CS"}
                </div>
              </div>
            </div>

            {/* ACTIVE CORE TAB SCREEN CONTAINER */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === "inicio" && (
                  <HomeScreen 
                    key="inicio"
                    properties={properties} 
                    finances={finances} 
                    agenda={agenda}
                    isDarkMode={isDarkMode} 
                    onSwitchTab={handleSwitchTab}
                    onExportPDF={() => generatePDF(properties, finances, agenda)}
                    resortMood={resortMood}
                    onSwitchResortMood={(mood) => {
                      setResortMood(mood);
                      triggerMoodShower(mood);
                    }}
                  />
                )}
                {activeTab === "propriedades" && (
                  <PropertiesScreen 
                    key="propriedades"
                    properties={properties} 
                    onAddProperty={handleAddProperty}
                    onUpdateProperty={handleUpdateProperty}
                    isDarkMode={isDarkMode}
                    userRole={currentUser?.role}
                  />
                )}
                {(activeTab === "financeiro" || activeTab === "ocr") && (
                  <FinanceScreen 
                    key="financeiro"
                    finances={finances} 
                    properties={properties}
                    onAddFinance={handleAddFinance}
                    onUpdateFinance={handleUpdateFinance}
                    onDeleteFinance={handleDeleteFinance}
                    isDarkMode={isDarkMode}
                    initialTab={activeTab === "ocr" ? "OCR" : "Overview"}
                  />
                )}
                {activeTab === "calendario" && (
                  <CalendarScreen 
                    key="calendario"
                    agenda={agenda} 
                    properties={properties}
                    onAddEvent={handleAddEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                    isDarkMode={isDarkMode}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* iPhone Dynamic Home Indicator line overlay at the bottom view */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-current opacity-25 rounded-full z-40 pointer-events-none" />

            {/* FOUR COLUMN BOTTOM MOBILE NAVIGATION TAB BAR */}
            <div className={`absolute bottom-0 left-0 right-0 py-3.5 px-4 flex items-center justify-between border-t z-30 shadow-md ${
              isDarkMode ? "bg-[#18181A]/90 backdrop-blur-md border-neutral-800/80 text-white" : "bg-white border-[#EFE1D1]/60 text-amber-950"
            }`}>
              
              {/* Tab 1: Início */}
              <button
                onClick={() => setActiveTab("inicio")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "inicio" ? "text-[#C59B27] scale-105 font-bold" : "opacity-50 hover:opacity-80"
                }`}
              >
                <Home size={22} />
                <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Início</span>
              </button>

              {/* Tab 2: Agenda */}
              <button
                onClick={() => setActiveTab("calendario")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "calendario" ? "text-[#C59B27] scale-105 font-bold" : "opacity-50 hover:opacity-80"
                }`}
              >
                <CalendarIcon size={22} />
                <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Agenda</span>
              </button>

              {/* Tab 3: Extrato */}
              <button
                onClick={() => setActiveTab("financeiro")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "financeiro" ? "text-[#C59B27] scale-105 font-bold" : "opacity-50 hover:opacity-80"
                }`}
              >
                <DollarSign size={22} />
                <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">Extrato</span>
              </button>

              {/* Tab 4: OCR IA */}
              <button
                onClick={() => setActiveTab("ocr")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "ocr" ? "text-[#C59B27] scale-105 font-bold" : "opacity-50 hover:opacity-80"
                }`}
              >
                <Sparkles size={22} />
                <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider">OCR IA</span>
              </button>

            </div>

          </div>
        )}
      </div>
    );
  };

  if (isDirectRoute && isMobileScreen) {
    return (
      <div className="w-full min-h-screen h-screen flex flex-col relative overflow-hidden bg-black">
        {renderPhoneViewport()}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F0EAE1] dark:bg-[#0E0E10] text-[#1D1912] dark:text-neutral-100 flex flex-col md:flex-row font-sans transition-colors duration-300 rounded-2xl overflow-hidden shadow-2xl border border-[#C29438]/20">
      
      {/* LEFT SIDEBAR: Controls Workspace Info */}
      <div className="w-full md:w-[35%] lg:w-[30%] bg-[#E8DFD3] dark:bg-[#161619] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D9CEBC] dark:border-neutral-800 shadow-inner z-10">
        <div className="space-y-6">
          {/* Logo badge and branding */}
          <div className="flex items-center space-x-3">
            <div className="p-2 border-2 border-[#C29438] rounded-xl bg-[#FFF]/50 dark:bg-black/20 flex items-center justify-center font-display font-black text-lg tracking-widest text-[#C29438]">
              CS
            </div>
            <div>
              <h1 className="font-display font-black text-lg tracking-tight text-amber-950 dark:text-white">
                CASA SELECT
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-amber-800 dark:text-[#C59B27] font-semibold">
                Gestão Inteligente & Premium
              </span>
            </div>
          </div>

          <hr className="border-[#C29438]/20 dark:border-neutral-800" />

          {/* Key capabilities description */}
          <div className="space-y-3.5 text-xs text-amber-950/80 dark:text-neutral-400">
            <p className="font-medium text-amber-950 dark:text-neutral-300">
              Gerencie suas luxuosas propriedades em um único ecossistema mobile integrado.
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-[#C59B27] mt-0.5">✦</span>
                <span><strong>Dual Theme Mockup</strong>: Alterne entre os designs Claro Marfim e Escuro Obsidiana do protótipo no controle abaixo.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-[#C59B27] mt-0.5">✦</span>
                <span><strong>OCR Scanner por IA</strong>: Use a aba Finanças &gt; OCR no simulador para digitalizar faturas e atualizar o ledger com o Gemini!</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-[#C59B27] mt-0.5">✦</span>
                <span><strong>Interatividade Completa</strong>: Pesquise casas, filtre status operacionais, alterne dias no calendário e lance receitas/despesas à vontade!</span>
              </div>
            </div>
          </div>

          <hr className="border-[#C29438]/20 dark:border-neutral-800" />

          {/* CONTROL BOX FOR SMARTPHONE COVERS */}
          <div className="space-y-3.5">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-950 dark:text-neutral-300">
              Controles do Protótipo
            </h3>

            {/* Light / Dark selector button */}
            <div className="bg-[#FFF]/40 dark:bg-black/30 p-1.5 rounded-xl border border-[#D9CEBC]/60 dark:border-neutral-800 flex space-x-1">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  !isDarkMode
                    ? "bg-white text-amber-950 shadow-md font-bold"
                    : "text-neutral-400 opacity-70 hover:opacity-100"
                }`}
              >
                <Sun size={13} className="text-[#C59B27]" />
                <span>Modo Claro</span>
              </button>
              
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isDarkMode
                    ? "bg-[#C59B27] text-white shadow-md font-bold"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Moon size={13} />
                <span>Modo Escuro</span>
              </button>
            </div>

            {/* Vibe do Resort & Humor Controls */}
            <div className="space-y-1.5 pt-2 border-t border-[#C29438]/10 dark:border-neutral-800/60">
              <span className="font-display font-semibold text-[10px] uppercase tracking-wider text-amber-950/70 dark:text-neutral-300 flex items-center space-x-1">
                <Sparkles size={11} className="text-[#C59B27] animate-pulse" />
                <span>Atmosfera Interativa (Humor)</span>
              </span>
              
              <div className="grid grid-cols-3 gap-1 bg-[#FFF]/45 dark:bg-black/25 p-1 rounded-xl border border-[#D9CEBC]/60 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setResortMood("luxury");
                    triggerMoodShower("luxury");
                  }}
                  className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    resortMood === "luxury"
                      ? "bg-white dark:bg-neutral-900 text-amber-950 dark:text-[#C59B27] shadow-sm font-black"
                      : "opacity-60 hover:opacity-100 dark:text-neutral-400"
                  }`}
                  title="Estilo Executivo Ultraluxo"
                >
                  <span className="text-xs">💎</span>
                  <span className="mt-0.5">Clássico</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResortMood("party");
                    triggerMoodShower("party");
                  }}
                  className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    resortMood === "party"
                      ? "bg-[#C59B27] text-white shadow-sm font-black"
                      : "opacity-60 hover:opacity-100 dark:text-neutral-400"
                  }`}
                  title="Festa na Piscina"
                >
                  <span className="text-xs">🍹</span>
                  <span className="mt-0.5">Festa VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResortMood("pet");
                    triggerMoodShower("pet");
                  }}
                  className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    resortMood === "pet"
                      ? "bg-amber-600 text-white shadow-sm font-black"
                      : "opacity-60 hover:opacity-100 dark:text-neutral-400"
                  }`}
                  title="Hugo o Inspetor de Real-Estate"
                >
                  <span className="text-xs">🐾</span>
                  <span className="mt-0.5">Hugo VIP</span>
                </button>
              </div>
            </div>

            {/* Quick action simulation triggers */}
            <div className="rounded-xl p-3 border border-[#C29438]/20 bg-[#C59B27]/5 text-xs text-amber-950/90 dark:text-neutral-300 space-y-2">
              <span className="font-bold flex items-center text-[10px] uppercase tracking-wider text-[#C29438]">
                <HelpCircle size={12} className="mr-1" /> Dica de Teste Rápido
              </span>
              <p className="text-[10px] opacity-80 leading-relaxed">
                Faça login no simulador com o usuário pré-preenchido, clique na aba <strong>OCR</strong> no menu financeiro e selecione uma das faturas de sugestão rápida para testar o extrator com Gemini!
              </p>
            </div>

            {/* PDF Report Exporter section */}
            <div className="space-y-2.5 pt-1">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-amber-950 dark:text-neutral-300">
                Exportar Relatório Executivo
              </h3>
              <p className="text-[10px] text-amber-950/70 dark:text-neutral-400 leading-tight">
                Gere um documento PDF premium consolidando o faturamento do portfólio, eventos operacionais e fluxo de caixa de transações dinâmicas.
              </p>
              <button
                onClick={() => {
                  try {
                    generatePDF(properties, finances, agenda);
                  } catch (e) {
                    console.error("PDF generation failed:", e);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C29438] to-[#916B21] text-white hover:brightness-110 font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
              >
                <FileDown size={14} />
                <span>Exportar Relatório PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info section */}
        <div className="mt-8 pt-4 border-t border-[#C29438]/20 dark:border-neutral-800 flex justify-between items-center text-[10px] opacity-70">
          <button 
            onClick={onClose}
            className="flex items-center space-x-1 hover:underline text-[#C59B27] font-bold"
          >
            <span>Fechar Simulador</span>
          </button>
          <button 
            onClick={handleResetDatabase}
            className="flex items-center space-x-1 hover:underline text-[#C59B27]"
          >
            <RotateCcw size={10} />
            <span>Reiniciar App</span>
          </button>
        </div>
      </div>


      {/* RIGHT SIDE: Interactive Handset Device Device Bezel simulator */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        
        {/* Background decorative luxury circle */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C59B27]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-1/4 w-80 h-80 bg-orange-600/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Smartphone physical outer bezel frame casing */}
        <div className="relative mx-auto border-[12px] border-[#1C1A17] dark:border-[#222125] rounded-[48px] w-[382px] min-w-[382px] h-[785px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] bg-black overflow-hidden flex flex-col select-none">
          
          {/* Top Notch Dynamic Island overlay */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[30px] w-[110px] bg-black rounded-b-[18px] z-50 flex items-center justify-center">
            {/* Camera lens hole reflection */}
            <div className="absolute right-3.5 w-2 h-2 rounded-full bg-neutral-900/40 border border-neutral-800/80" />
          </div>

          {/* Standard Apple Status Bar Row inside handset */}
          <div className={`pt-2.5 px-6 pb-2.5 flex justify-between items-center z-40 text-[10px] font-mono tracking-tight ${
            isDarkMode ? "bg-[#121212] text-white" : "bg-[#FAF8F5] text-amber-950"
          }`}>
            <span className="font-bold">13:08</span>
            <div className="flex items-center space-x-1.5">
              <Wifi size={10} />
              <Battery size={11} className="text-current" />
            </div>
          </div>

          {/* SIMULATED CONTENT VIEWPORT INNER SCREEN CONTAINER */}
          {renderPhoneViewport()}

        </div>

      </div>

    </div>
  );
}
