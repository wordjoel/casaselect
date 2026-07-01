import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Building, Home, Sparkles, Moon, Sun, Bell, Wifi, Battery, RotateCcw, HelpCircle, Plus,
  FileDown, FileText, Menu, X
} from "lucide-react";

import { Property, FinanceItem, AgendaEvent } from "./pwa/types";
import LoginScreen from "./pwa/LoginScreen";
import HomeScreen from "./pwa/HomeScreen";
import PropertiesScreen from "./pwa/PropertiesScreen";
import DocumentsScreen from "./pwa/DocumentsScreen";
import CalendarScreen from "./pwa/CalendarScreen";
import ProfileScreen from "./pwa/ProfileScreen";
import Logo from "./pwa/Logo";
import { generatePDF } from "../utils/pdfGenerator";
import { getSessionToken } from "../data/api";

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
  isDirectRoute?: boolean;
}

export default function PWASimulator({ onClose, isDirectRoute = false, darkMode }: PWASimulatorProps) {
  // Simulator configuration states
  const [isDarkMode, setIsDarkMode] = useState(darkMode || false); 

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

  const [loggedUser, setLoggedUser] = useState<string | null>(null); // starts on login view
  const [activeTab, setActiveTab] = useState<"inicio" | "propriedades" | "agenda" | "documentos" | "perfil">("inicio");
  
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
      x: Math.random() * 88 + 6, 
      size: Math.random() * 10 + 14, 
    }));
    
    setParticles(newParticles);
    
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

  // Synchronize databases on mount
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

  // Sync mutations
  const handleAddProperty = async (newProp: Omit<Property, "id">) => {
    try {
      const token = getSessionToken();
      const res = await fetch("/api/pwa/properties", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newProp)
      });
      const added = await res.json();
      setProperties(prev => [...prev, added]);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProperty = async (id: string, updated: Partial<Property>) => {
    try {
      const token = getSessionToken();
      const res = await fetch(`/api/pwa/properties/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updated)
      });
      const edited = await res.json();
      setProperties(prev => prev.map(p => p.id === id ? edited : p));
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFinance = async (entry: Omit<FinanceItem, "id">) => {
    try {
      const token = getSessionToken();
      const res = await fetch("/api/pwa/finances", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(entry)
      });
      const added = await res.json();
      setFinances(prev => [added, ...prev]);

      if (added.type === "receita") {
        await loadDatabase();
      }
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFinance = async (id: string, updated: Partial<FinanceItem>) => {
    try {
      const token = getSessionToken();
      const res = await fetch(`/api/pwa/finances/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updated)
      });
      const edited = await res.json();
      setFinances(prev => prev.map(f => f.id === id ? edited : f));
      await loadDatabase();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFinance = async (id: string) => {
    try {
      const token = getSessionToken();
      await fetch(`/api/pwa/finances/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      setFinances(prev => prev.filter(f => f.id !== id));
      await loadDatabase();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (event: Omit<AgendaEvent, "id">) => {
    try {
      const token = getSessionToken();
      const res = await fetch("/api/pwa/agenda", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(event)
      });
      const added = await res.json();
      setAgenda(prev => [...prev, added]);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEvent = async (id: string, updated: Partial<AgendaEvent>) => {
    try {
      const token = getSessionToken();
      const res = await fetch(`/api/pwa/agenda/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updated)
      });
      const edited = await res.json();
      setAgenda(prev => prev.map(ev => ev.id === id ? edited : ev));
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const token = getSessionToken();
      await fetch(`/api/pwa/agenda/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      setAgenda(prev => prev.filter(ev => ev.id !== id));
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDatabase = async () => {
    await loadDatabase();
    setLoggedUser(null);
    setActiveTab("inicio");
  };

  const handleUserLogin = (name: string) => {
    setLoggedUser(name);
    setActiveTab("inicio");
  };

  const handleSwitchTab = (tab: any) => {
    setActiveTab(tab);
  };

  const renderPhoneViewport = () => {
    return (
      <div className={`w-full h-full flex-1 flex flex-col relative overflow-hidden ${
        isDarkMode ? "bg-[#0B0F14]" : "bg-[#F8F6F2]"
      }`}>
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

        {/* Humorous Mascot Floating Balloon */}
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
                  ? "bg-zinc-950/95 border-[#C8A27A]/40 text-neutral-100" 
                  : "bg-[#FFF]/92 border-[#C8A27A]/40 text-amber-950 shadow-amber-900/10"
              }`}>
                <span className="text-xl select-none shrink-0 animate-bounce">
                  {resortMood === "luxury" ? "🤵" : resortMood === "party" ? "🐥" : "🐶"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C8A27A] truncate">
                      {resortMood === "luxury" ? "L | STAYS Concierge VIP" : resortMood === "party" ? "Chefinho Patinho 🛟" : "Inspetor Hugo (Au-au!)"}
                    </span>
                    <button 
                      onClick={() => setActiveMascotQuote(null)}
                      type="button"
                      className="p-1 rounded-full hover:bg-current/10 active:scale-90 transition cursor-pointer shrink-0"
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
                      className="text-[8px] font-bold uppercase tracking-widest bg-[#C8A27A]/10 text-[#C8A27A] px-2 py-0.5 rounded hover:bg-[#C8A27A]/25 active:scale-95 transition cursor-pointer"
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
            <div className="w-8 h-8 rounded-full border-2 border-[#C8A27A] border-t-transparent animate-spin" />
            <span className="text-xs font-medium font-mono text-[#C8A27A]">Carregando L | STAYS...</span>
          </div>
        ) : loggedUser === null ? (
          <LoginScreen onLogin={handleUserLogin} isDarkMode={isDarkMode} />
        ) : (
          <div className={`w-full h-full flex-col flex px-5 relative z-10 ${
            isDarkMode ? "text-neutral-100" : "text-amber-950"
          }`}>
            
            {/* ACTIVE TAB CONTAINER */}
            <div className="flex-1 overflow-hidden relative pt-2">
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
                  />
                )}
                {activeTab === "agenda" && (
                  <CalendarScreen 
                    key="agenda"
                    agenda={agenda} 
                    properties={properties}
                    onAddEvent={handleAddEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeTab === "documentos" && (
                  <DocumentsScreen 
                    key="documentos"
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeTab === "perfil" && (
                  <ProfileScreen 
                    key="perfil"
                    isDarkMode={isDarkMode}
                    onLogout={() => setLoggedUser(null)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* iPhone Dynamic Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-current opacity-20 rounded-full z-40 pointer-events-none" />

            {/* FIVE COLUMN BOTTOM NAVIGATION BAR */}
            <div className={`absolute bottom-0 left-0 right-0 py-2.5 px-4 flex items-center justify-between border-t z-30 shadow-md ${
              isDarkMode ? "bg-[#11161D] border-neutral-800/80 text-white" : "bg-white border-stone-200/80 text-amber-950"
            }`}>
              
              {/* Tab 1: Início */}
              <button
                onClick={() => handleSwitchTab("inicio")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "inicio" ? "text-[#C8A27A] scale-105 font-bold" : "opacity-50 hover:opacity-85"
                }`}
              >
                <Home size={16} />
                <span className="text-[8px] mt-1 font-semibold">Início</span>
              </button>

              {/* Tab 2: Propriedades */}
              <button
                onClick={() => handleSwitchTab("propriedades")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "propriedades" ? "text-[#C8A27A] scale-105 font-bold" : "opacity-50 hover:opacity-85"
                }`}
              >
                <Building size={16} />
                <span className="text-[8px] mt-1 font-semibold">Propriedades</span>
              </button>

              {/* Tab 3: Middle Plus Button (Triggers Agenda Screen) */}
              <div className="flex-1 flex justify-center -mt-4.5 relative z-40">
                <button
                  onClick={() => handleSwitchTab("agenda")}
                  className={`p-2.5 rounded-full shadow-lg border-[3px] transition hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center ${
                    activeTab === "agenda"
                      ? "bg-[#A97142] text-white border-[#FAF8F5] dark:border-[#0B0F14]"
                      : "bg-[#C8A27A] text-slate-950 border-[#FAF8F5] dark:border-[#0B0F14]"
                  }`}
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Tab 4: Documentos */}
              <button
                onClick={() => handleSwitchTab("documentos")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "documentos" ? "text-[#C8A27A] scale-105 font-bold" : "opacity-50 hover:opacity-85"
                }`}
              >
                <FileText size={16} />
                <span className="text-[8px] mt-1 font-semibold">Documentos</span>
              </button>

              {/* Tab 5: Mais / Perfil */}
              <button
                onClick={() => handleSwitchTab("perfil")}
                className={`flex flex-col items-center flex-1 cursor-pointer transition ${
                  activeTab === "perfil" ? "text-[#C8A27A] scale-105 font-bold" : "opacity-50 hover:opacity-85"
                }`}
              >
                <Menu size={16} />
                <span className="text-[8px] mt-1 font-semibold">Mais</span>
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
    <div className="w-full min-h-screen bg-[#F0EAE1] dark:bg-[#0E0E10] text-[#1D1912] dark:text-neutral-100 flex flex-col md:flex-row font-sans transition-colors duration-300 rounded-2xl overflow-hidden shadow-2xl border border-[#C8A27A]/20">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[35%] lg:w-[30%] bg-[#E8DFD3] dark:bg-[#161619] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D9CEBC] dark:border-neutral-800 shadow-inner z-10">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Logo variant="header" isDarkMode={isDarkMode} size={28} />
          </div>

          <hr className="border-[#C8A27A]/25 dark:border-neutral-800" />

          <div className="space-y-3.5 text-xs text-amber-950/80 dark:text-neutral-400">
            <p className="font-medium text-amber-950 dark:text-neutral-300">
              Gerencie suas luxuosas propriedades em um único ecossistema mobile integrado.
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-[#C8A27A] mt-0.5">✦</span>
                <span><strong>Exatidão Visual</strong>: Remodelado tela a tela para reproduzir perfeitamente o mockup nos modos Claro e Escuro.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-[#C8A27A] mt-0.5">✦</span>
                <span><strong>5 Abas Principais</strong>: Navegue por Início, Propriedades, Agenda (+), Documentos e Mais (Perfil) na barra de navegação inferior do celular.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-[#C8A27A] mt-0.5">✦</span>
                <span><strong>Interações Completas</strong>: Pesquise propriedades, consulte os contratos e ordens de serviços, gerencie datas e execute o login biométrico simulado.</span>
              </div>
            </div>
          </div>

          <hr className="border-[#C8A27A]/25 dark:border-neutral-800" />

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
                <Sun size={13} className="text-[#C8A27A]" />
                <span>Modo Claro</span>
              </button>
              
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isDarkMode
                    ? "bg-[#C8A27A] text-slate-950 shadow-md font-bold"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Moon size={13} />
                <span>Modo Escuro</span>
              </button>
            </div>

            {/* Vibe do Resort & Humor */}
            <div className="space-y-1.5 pt-2 border-t border-[#C8A27A]/10 dark:border-neutral-800/60">
              <span className="font-display font-semibold text-[10px] uppercase tracking-wider text-amber-950/70 dark:text-neutral-300 flex items-center space-x-1">
                <Sparkles size={11} className="text-[#C8A27A] animate-pulse" />
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
                      ? "bg-white dark:bg-neutral-900 text-[#C8A27A] shadow-sm font-black"
                      : "opacity-60 hover:opacity-100 dark:text-neutral-400"
                  }`}
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
                      ? "bg-[#C8A27A] text-slate-950 shadow-sm font-black"
                      : "opacity-60 hover:opacity-100 dark:text-neutral-400"
                  }`}
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
                      ? "bg-[#A97142] text-white shadow-sm font-black"
                      : "opacity-60 hover:opacity-100 dark:text-neutral-400"
                  }`}
                >
                  <span className="text-xs">🐾</span>
                  <span className="mt-0.5">Hugo VIP</span>
                </button>
              </div>
            </div>

            {/* Quick action simulation triggers */}
            <div className="rounded-xl p-3 border border-[#C8A27A]/25 bg-[#C8A27A]/5 text-xs text-amber-950/90 dark:text-neutral-300 space-y-2">
              <span className="font-bold flex items-center text-[10px] uppercase tracking-wider text-[#A97142]">
                <HelpCircle size={12} className="mr-1" /> Dica de Teste Rápido
              </span>
              <p className="text-[10px] opacity-80 leading-relaxed">
                As credenciais já estão salvas para facilitar os testes rápidos de desenvolvimento. Basta clicar em <strong>ENTRAR</strong> ou no ícone de <strong>biometria digital</strong> para acessar o painel!
              </p>
            </div>

            {/* PDF Report Exporter */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  try {
                    generatePDF(properties, finances, agenda);
                  } catch (e) {
                    console.error("PDF generation failed:", e);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#A97142] text-white hover:brightness-110 font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
              >
                <FileDown size={14} />
                <span>Exportar Relatório PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#C8A27A]/20 dark:border-neutral-800 flex justify-between items-center text-[10px] opacity-70">
          <button 
            onClick={onClose}
            className="flex items-center space-x-1 hover:underline text-[#A97142] font-bold"
          >
            <span>Fechar Simulador</span>
          </button>
          <button 
            onClick={handleResetDatabase}
            className="flex items-center space-x-1 hover:underline text-[#A97142]"
          >
            <RotateCcw size={10} />
            <span>Reiniciar App</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Smartphone Bezel */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C8A27A]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Bezel frame */}
        <div className="relative mx-auto border-[12px] border-[#1C1A17] dark:border-[#222125] rounded-[48px] w-[382px] min-w-[382px] h-[785px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] bg-black overflow-hidden flex flex-col select-none">
          
          {/* Dynamic Island Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[30px] w-[110px] bg-black rounded-b-[18px] z-50 flex items-center justify-center">
            <div className="absolute right-3.5 w-2 h-2 rounded-full bg-neutral-900/40 border border-neutral-800/80" />
          </div>

          {/* Apple Status Bar: Time 9:41 */}
          <div className={`pt-2.5 px-6 pb-2.5 flex justify-between items-center z-40 text-[10px] font-mono tracking-tight ${
            isDarkMode ? "bg-[#0B0F14] text-white" : "bg-[#F8F6F2] text-amber-950"
          }`}>
            <span className="font-bold">9:41</span>
            <div className="flex items-center space-x-1.5">
              <Wifi size={10} />
              <Battery size={11} className="text-current" />
            </div>
          </div>

          {/* Simulator Content Viewport */}
          {renderPhoneViewport()}

        </div>
      </div>

    </div>
  );
}
