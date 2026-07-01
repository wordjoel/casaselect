import React from "react";
import { motion } from "motion/react";
import { Home, TrendingUp, Briefcase, FileText } from "lucide-react";

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

interface FinanceItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "receita" | "despesa";
  category: string;
  status: "pago" | "pendente" | "extraido";
  propertyName: string;
}

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
}

export default function HomeScreen({ 
  properties, 
  finances, 
  agenda = [], 
  onSwitchTab, 
  isDarkMode 
}: HomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="w-full flex-1 flex flex-col space-y-5 pt-3 pb-8 overflow-y-auto no-scrollbar"
    >
      {/* 1. Header (Greetings + Avatar) */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h2 className={`font-bold text-sm tracking-tight ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
            Olá, Hugo Kobayashi! 👋
          </h2>
          <p className={`text-[10px] opacity-60 mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            Bem-vindo de volta
          </p>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C8A27A]/30">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="Hugo Kobayashi"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2. Patrimônio Total Card */}
      <div 
        className={`p-4.5 rounded-2xl border transition-all duration-300 relative ${
          isDarkMode 
            ? "bg-[#11161D] border-neutral-800/80 shadow-md" 
            : "bg-[#FAF8F5] border-amber-200/50 shadow-sm"
        }`}
      >
        {/* Top-Right Badge */}
        <div className="absolute right-4 top-4 w-5 h-5 rounded-full flex items-center justify-center bg-[#C8A27A]/10 text-[#C8A27A] text-[9px] font-bold">
          G
        </div>

        <div className="text-left space-y-1">
          <span className={`text-[9.5px] uppercase tracking-wider font-semibold opacity-65 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            Patrimônio Total
          </span>
          <h3 className={`text-[23px] font-bold tracking-tight font-mono ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
            R$ 24.840.000
          </h3>
          <div className="flex justify-between items-center pt-1.5">
            <span className="text-[10px] text-emerald-500 font-bold flex items-center">
              +7,35% <span className="opacity-75 font-normal ml-1">este mês</span>
            </span>
            <a 
              href="#detalhes" 
              onClick={(e) => { e.preventDefault(); onSwitchTab("propriedades"); }}
              className={`text-[9.5px] font-semibold underline underline-offset-2 ${isDarkMode ? "text-[#E6C687]" : "text-[#A97142]"}`}
            >
              Ver detalhes
            </a>
          </div>
        </div>
      </div>

      {/* 3. Visão Geral Section */}
      <div className="space-y-2.5">
        <h4 className={`text-[12px] font-bold tracking-tight text-left ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
          Visão Geral
        </h4>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: Imóveis */}
          <div 
            className={`p-3 rounded-xl border flex items-center space-x-3 text-left ${
              isDarkMode ? "bg-[#11161D] border-neutral-800/80" : "bg-white border-stone-100"
            }`}
          >
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-[#1C2330] text-[#E6C687]" : "bg-[#FAF8F5] text-[#A97142]"}`}>
              <Home size={15} />
            </div>
            <div>
              <span className={`text-[9px] block opacity-60 uppercase font-semibold ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>Imóveis</span>
              <span className={`text-sm font-bold font-mono ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>12</span>
            </div>
          </div>

          {/* Card 2: Investimentos */}
          <div 
            className={`p-3 rounded-xl border flex items-center space-x-3 text-left ${
              isDarkMode ? "bg-[#11161D] border-neutral-800/80" : "bg-white border-stone-100"
            }`}
          >
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-[#1C2330] text-[#E6C687]" : "bg-[#FAF8F5] text-[#A97142]"}`}>
              <TrendingUp size={15} />
            </div>
            <div>
              <span className={`text-[9px] block opacity-60 uppercase font-semibold ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>Investimentos</span>
              <span className={`text-sm font-bold font-mono ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>8</span>
            </div>
          </div>

          {/* Card 3: Empresas */}
          <div 
            className={`p-3 rounded-xl border flex items-center space-x-3 text-left ${
              isDarkMode ? "bg-[#11161D] border-neutral-800/80" : "bg-white border-stone-100"
            }`}
          >
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-[#1C2330] text-[#E6C687]" : "bg-[#FAF8F5] text-[#A97142]"}`}>
              <Briefcase size={15} />
            </div>
            <div>
              <span className={`text-[9px] block opacity-60 uppercase font-semibold ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>Empresas</span>
              <span className={`text-sm font-bold font-mono ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>5</span>
            </div>
          </div>

          {/* Card 4: Documentos */}
          <div 
            onClick={() => onSwitchTab("documentos")}
            className={`p-3 rounded-xl border flex items-center space-x-3 text-left cursor-pointer hover:opacity-90 transition-all ${
              isDarkMode ? "bg-[#11161D] border-neutral-800/80" : "bg-white border-stone-100"
            }`}
          >
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-[#1C2330] text-[#E6C687]" : "bg-[#FAF8F5] text-[#A97142]"}`}>
              <FileText size={15} />
            </div>
            <div>
              <span className={`text-[9px] block opacity-60 uppercase font-semibold ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>Documentos</span>
              <span className={`text-sm font-bold font-mono ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>27</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Rentabilidade (12M) Card */}
      <div 
        className={`p-4 rounded-2xl border flex justify-between items-center text-left ${
          isDarkMode ? "bg-[#11161D] border-neutral-800/80" : "bg-white border-[#FAF8F5] shadow-xs"
        }`}
      >
        <div className="space-y-1">
          <span className={`text-[9.5px] uppercase tracking-wider font-semibold opacity-60 block ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            Rentabilidade (12M)
          </span>
          <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
            +12,4%
          </h3>
          <span className={`text-[8.5px] block opacity-60 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            vs. período anterior
          </span>
        </div>

        {/* Sparkline chart SVG */}
        <div className="w-[120px] h-[45px] opacity-90">
          <svg viewBox="0 0 100 35" className="w-full h-full text-emerald-500 stroke-current" fill="none" strokeWidth="2.5">
            <path 
              d="M 5 28 C 15 25, 25 30, 35 18 C 45 10, 55 22, 65 12 C 75 5, 85 8, 95 3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
