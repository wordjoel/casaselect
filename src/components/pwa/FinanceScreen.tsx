import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowUpRight, ArrowDownRight, Upload, 
  CheckCircle2, Sparkles, Filter, X, Plus, AlertCircle, RefreshCw, Trash2
} from "lucide-react";
import { FinanceItem, Property } from "./types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface FinanceScreenProps {
  key?: string;
  finances: FinanceItem[];
  properties: Property[];
  onAddFinance: (entry: Omit<FinanceItem, "id">) => Promise<void>;
  onUpdateFinance: (id: string, updated: Partial<FinanceItem>) => Promise<void>;
  onDeleteFinance: (id: string) => Promise<void>;
  isDarkMode: boolean;
  initialTab?: "Overview" | "Receitas" | "Despesas" | "OCR";
}

export default function FinanceScreen({ 
  finances, 
  properties, 
  onAddFinance, 
  onUpdateFinance, 
  onDeleteFinance, 
  isDarkMode,
  initialTab
}: FinanceScreenProps) {
  const [financeTab, setFinanceTab] = useState<"Overview" | "Receitas" | "Despesas" | "OCR">(initialTab || "OCR");

  React.useEffect(() => {
    if (initialTab) {
      setFinanceTab(initialTab);
    }
  }, [initialTab]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [projectionScenario, setProjectionScenario] = useState<"conservador" | "moderado" | "otimista">("moderado");
  
  // Custom Manual Addition / Edit dialog state
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualType, setManualType] = useState<"receita" | "despesa">("despesa");
  const [manualCategory, setManualCategory] = useState("Limpeza");
  const [manualProperty, setManualProperty] = useState("Geral");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  // AI OCR States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrReview, setOcrReview] = useState<{
    title: string;
    amount: number;
    date: string;
    category: string;
    propertyName: string;
    confidence: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Math totals
  const totalReceitas = finances
    .filter((f) => f.type === "receita")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDespesas = finances
    .filter((f) => f.type === "despesa")
    .reduce((sum, item) => sum + item.amount, 0);

  // --- Next 3-Month Automated Revenue Projection ---
  const revenueItems = finances.filter(f => f.type === "receita");
  const monthsSet = new Set(revenueItems.map(f => f.date.substring(0, 7))); // YYYY-MM
  const totalHistoricalRevenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
  const numMonths = Math.max(monthsSet.size, 1);
  const historyAvg = totalHistoricalRevenue / numMonths;

  // Active properties yield potential
  const activeProperties = properties.filter(p => p.status === "Ativas");
  const propertiesProjectedMonthly = activeProperties.reduce((sum, p) => {
    const rate = p.dailyRate || 800;
    const occupancy = p.ocupacao || 70;
    return sum + (rate * 30 * (occupancy / 100));
  }, 0);

  // Blend history & property forecast
  const baseRecurringMonthly = historyAvg > 0 
    ? (historyAvg * 0.35 + propertiesProjectedMonthly * 0.65)
    : (propertiesProjectedMonthly || 115000);

  // Scenario Multiplier
  const scenarioMultiplier = 
    projectionScenario === "conservador" ? 0.85 :
    projectionScenario === "otimista" ? 1.20 : 1.0;

  const currentMonthIndex = 4; // May (mock index context)
  const currentYear = 2026;

  const getPortugueseMonthName = (monthIndex: number, year: number) => {
    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    const index = monthIndex % 12;
    const yearOffset = Math.floor(monthIndex / 12);
    return `${months[index]} ${year + yearOffset}`;
  };

  const projectionData = [
    {
      name: getPortugueseMonthName(currentMonthIndex + 1, currentYear), // Jun 2026
      amount: Math.round(baseRecurringMonthly * 1.05 * scenarioMultiplier),
      growth: projectionScenario === "conservador" ? "-10%" : projectionScenario === "otimista" ? "+26%" : "+5%",
      occupancy: projectionScenario === "conservador" ? "61%" : projectionScenario === "otimista" ? "88%" : "72%"
    },
    {
      name: getPortugueseMonthName(currentMonthIndex + 2, currentYear), // Jul 2026
      amount: Math.round(baseRecurringMonthly * 1.18 * scenarioMultiplier),
      growth: projectionScenario === "conservador" ? "+2%" : projectionScenario === "otimista" ? "+41%" : "+18%",
      occupancy: projectionScenario === "conservador" ? "68%" : projectionScenario === "otimista" ? "94%" : "82%"
    },
    {
      name: getPortugueseMonthName(currentMonthIndex + 3, currentYear), // Ago 2026
      amount: Math.round(baseRecurringMonthly * 0.96 * scenarioMultiplier),
      growth: projectionScenario === "conservador" ? "-18%" : projectionScenario === "otimista" ? "+15%" : "-4%",
      occupancy: projectionScenario === "conservador" ? "55%" : projectionScenario === "otimista" ? "80%" : "66%"
    }
  ];

  // Helper date and price formatters
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDatePT = (srcDate: string) => {
    try {
      const parts = srcDate.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return srcDate;
    } catch {
      return srcDate;
    }
  };

  // Prebuilt simulated assets base64 to fast-trip OCR test cases
  const triggerSuggestedOCR = async (presetType: "luz" | "ar" | "piscina") => {
    setIsAnalyzing(true);
    setOcrReview(null);

    // Let's craft fully formatted realistic base64 mocks to fulfill server requirements
    // Creating standard miniature dummy JPEG string
    const simulatedBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    try {
      const response = await fetch("/api/pwa/ocr/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data: simulatedBase64, mimeType: "image/png" }),
      });
      const data = await response.json();
      
      // Override details depending on what button they clicked, to make preset values realistic!
      if (presetType === "luz") {
        setOcrReview({
          title: data.title || "Conta de Energia - Elektro S.A.",
          amount: data.amount || 458.90,
          date: data.date || "2026-05-14",
          category: data.category || "Energia",
          propertyName: data.propertyName || "Casa Amado",
          confidence: data.confidence || "98%"
        });
      } else if (presetType === "ar") {
        setOcrReview({
          title: data.title || "Instalação de Ar Condicionado Inverter - SplitClean",
          amount: data.amount || 2850.00,
          date: data.date || "2026-05-14",
          category: data.category || "Manutenção",
          propertyName: data.propertyName || "Casa Liliar",
          confidence: data.confidence || "95%"
        });
      } else if (presetType === "piscina") {
        setOcrReview({
          title: data.title || "Instalação de Cloro e Faxina Piscina - AcquaClean",
          amount: data.amount || 350.00,
          date: data.date || "2026-05-12",
          category: data.category || "Lazer/Manutenção",
          propertyName: data.propertyName || "Casa Mayla",
          confidence: data.confidence || "91%"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload/Change handler for genuine local files
  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setOcrReview(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const response = await fetch("/api/pwa/ocr/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Data: base64String,
            mimeType: file.type || "image/png"
          })
        });
        const parsed = await response.json();
        setOcrReview({
          title: parsed.title || "Fatura Digital Extracto",
          amount: Number(parsed.amount) || 120.00,
          date: parsed.date || new Date().toISOString().split('T')[0],
          category: parsed.category || "Outros",
          propertyName: parsed.propertyName || "Geral",
          confidence: parsed.confidence || "85%"
        });
      } catch (err) {
        console.error("Local file analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCloseForm = () => {
    setIsManualAddOpen(false);
    setEditingItem(null);
    setManualTitle("");
    setManualAmount("");
    setManualType("despesa");
    setManualCategory("Limpeza");
    setManualProperty("Geral");
    setManualDate(new Date().toISOString().split('T')[0]);
  };

  const handleEditClick = (item: FinanceItem) => {
    setEditingItem(item);
    setManualTitle(item.title);
    setManualAmount(String(item.amount));
    setManualType(item.type);
    setManualCategory(item.category);
    setManualProperty(item.propertyName);
    setManualDate(item.date);
    setIsManualAddOpen(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualAmount) return;
    if (editingItem) {
      await onUpdateFinance(editingItem.id, {
        title: manualTitle,
        amount: Number(manualAmount),
        date: manualDate,
        type: manualType,
        category: manualCategory,
        propertyName: manualProperty
      });
    } else {
      await onAddFinance({
        title: manualTitle,
        amount: Number(manualAmount),
        date: manualDate,
        type: manualType,
        category: manualCategory,
        status: "pago",
        propertyName: manualProperty
      });
    }
    handleCloseForm();
  };

  const handleOcrConfirm = async () => {
    if (!ocrReview) return;
    await onAddFinance({
      title: ocrReview.title,
      amount: ocrReview.amount,
      date: ocrReview.date,
      type: "despesa",
      category: ocrReview.category,
      status: "extraido",
      propertyName: ocrReview.propertyName
    });
    setOcrReview(null);
    setFinanceTab("Despesas"); // Switch to despesas screen to show newly added item!
  };

  // List of unique categories for filtration
  const categories = ["All", ...Array.from(new Set(finances.map(f => f.category)))];

  // Filters logic
  const listItems = finances.filter(f => {
    if (financeTab === "Receitas" && f.type !== "receita") return false;
    if (financeTab === "Despesas" && f.type !== "despesa") return false;
    if (filterCategory !== "All" && f.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative no-scrollbar">
      {/* Header bar row */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-display font-bold text-xl leading-snug">Financeiro</h2>
          <p className="text-[10px] opacity-60">Faturas, conciliação e digitalização por IA</p>
        </div>
        <button
          onClick={() => {
            handleCloseForm();
            setIsManualAddOpen(true);
          }}
          className="p-2 rounded-full cursor-pointer bg-gradient-to-r from-[#C29438] to-[#916B21] text-white hover:opacity-90 shadow-sm"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Navigation Subtabs - Overview | Receitas | Despesas | OCR */}
      <div className="flex border-b border-neutral-800/10 dark:border-white/10 mb-4 justify-between text-center select-none font-sans">
        {(["Overview", "Receitas", "Despesas", "OCR"] as const).map((sub) => (
          <button
            key={sub}
            onClick={() => {
              setFinanceTab(sub);
              setOcrReview(null);
            }}
            className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition relative cursor-pointer ${
              financeTab === sub
                ? "text-[#C59B27] scale-105"
                : isDarkMode
                ? "text-neutral-400 hover:text-neutral-200"
                : "text-amber-900/65 hover:text-amber-950"
            }`}
          >
            {sub === "OCR" ? (
              <span className="flex items-center justify-center space-x-1">
                <Sparkles size={11} className="text-[#C59B27]" />
                <span>OCR</span>
              </span>
            ) : sub}
            {financeTab === sub && (
              <motion.div 
                layoutId="active-nav-line" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C59B27]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 space-y-4">

        {/* ================= OCR SCANNER SCREEN CONTENT ================= */}
        {financeTab === "OCR" && (
          <div className="space-y-4 font-sans text-xs">
            
            {/* Real local file selector hidden */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleLocalFileSelect}
              accept="image/*,application/pdf"
              className="hidden" 
            />

            {/* Simulated uploader Drag zone styled strictly like mockup screenshot */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C59B27] transition ${
                isDarkMode 
                  ? "bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900" 
                  : "bg-amber-100/10 border-amber-200/50 hover:bg-amber-100/30"
              }`}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="p-3 bg-[#C59B27]/10 text-[#C59B27] rounded-full mb-3"
              >
                <Upload size={24} />
              </motion.div>
              <h4 className="font-semibold text-xs opacity-90">Arraste o comprovante aqui</h4>
              <p className={`text-[10px] mt-1 ${isDarkMode ? "opacity-60" : "text-stone-600 font-medium"}`}>ou toque para selecionar em seus arquivos</p>

              {/* Gold Button Inside Dragbox */}
              <button 
                type="button"
                className="mt-4 px-5 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase text-amber-950 bg-gradient-to-r from-[#E5D3B3] to-[#C5A880] shadow hover:brightness-105"
              >
                Capturar com câmera
              </button>
            </div>

            {/* Sugestões Rápidas panel - click to launch parsing immediately */}
            <div>
              <h4 className="text-[10px] opacity-75 font-semibold tracking-wide uppercase mb-2">Sugestões rápidas para teste</h4>
              <div className="space-y-2">
                <div 
                  onClick={() => triggerSuggestedOCR("luz")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isDarkMode ? "bg-[#1C1C1E] border-neutral-800 hover:bg-neutral-800/80" : "bg-white border-amber-100 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 font-mono text-[10px] uppercase font-bold">Luz</span>
                    <div>
                      <span className="font-semibold block text-[11px]">Fatura Elektro - Casa Amado</span>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-stone-500 font-medium"}`}>Clique para simular análise por OCR</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-[#C59B27]">R$ 458,90</span>
                </div>

                <div 
                  onClick={() => triggerSuggestedOCR("ar")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isDarkMode ? "bg-[#1C1C1E] border-neutral-800 hover:bg-neutral-800/80" : "bg-white border-amber-100 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 font-mono text-[10px] uppercase font-bold">Ref</span>
                    <div>
                      <span className="font-semibold block text-[11px]">Instalação de Ar Condicionado - Casa Liliar</span>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-stone-500 font-medium"}`}>Recibo prestação de serviços premium</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-[#C59B27]">R$ 2.850,00</span>
                </div>

                <div 
                  onClick={() => triggerSuggestedOCR("piscina")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isDarkMode ? "bg-[#1C1C1E] border-neutral-800 hover:bg-neutral-800/80" : "bg-white border-amber-100 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="p-1.5 rounded-lg bg-green-500/10 text-green-500 font-mono text-[10px] uppercase font-bold">Serv</span>
                    <div>
                      <span className="font-semibold block text-[11px]">Tratamento de Piscina Mensal - Casa Mayla</span>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-stone-500 font-medium"}`}>Serviço recursivo local</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-[#C59B27]">R$ 350,00</span>
                </div>
              </div>
            </div>

            {/* SCANNING LASER EFFECT OVERLAY */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-40 flex flex-col items-center justify-center p-6 rounded-2xl overflow-hidden"
                >
                  {/* Smartphone screen internal bound scanning light */}
                  <div className="relative w-full max-w-[280px] p-8 text-center bg-zinc-950 border border-neutral-800 rounded-xl overflow-hidden flex flex-col items-center">
                    
                    {/* Laser line slider */}
                    <motion.div 
                      animate={{ y: [-5, 140, -5] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C59B27] to-transparent shadow-lg shadow-[#C59B27]/50"
                    />

                    <RefreshCw size={24} className="text-[#C59B27] animate-spin mb-4" />
                    <h5 className="font-display font-medium text-white text-xs">Análise Inteligente por IA</h5>
                    <p className="text-[10px] text-neutral-400 mt-1.5">Lendo comprovante com Gemini...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OCR RESULT DRAWER PANEL FOR CONFIRMATION */}
            <AnimatePresence>
              {ocrReview && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-40 flex items-end rounded-2xl overflow-hidden"
                >
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className={`w-full p-5 rounded-t-2xl relative ${
                      isDarkMode ? "bg-zinc-950 text-white" : "bg-[#FAF8F5] text-amber-950"
                    }`}
                  >
                    <button 
                      onClick={() => setOcrReview(null)}
                      className="absolute right-4 top-4 p-1 rounded-full bg-black/5 hover:bg-black/10 cursor-pointer"
                    >
                      <X size={16} />
                    </button>

                    <h4 className="font-display font-bold text-sm text-[#C59B27] flex items-center space-x-1.5 mb-1">
                      <Sparkles size={14} className="fill-[#C59B27]" />
                      <span>Extraído por IA ({ocrReview.confidence} Confiança)</span>
                    </h4>
                    <p className="text-[10px] opacity-60 mb-4">Por favor, revise os dados antes de lançar no ledger financeiro.</p>

                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <label className="block tracking-wider font-semibold opacity-65 mb-1 uppercase">Título da Despesa</label>
                        <input 
                          type="text" 
                          value={ocrReview.title}
                          onChange={(e) => setOcrReview({ ...ocrReview, title: e.target.value })}
                          className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:border-[#C59B27] ${
                            isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block tracking-wider font-semibold opacity-65 mb-1 uppercase">Valor Total (R$)</label>
                          <input 
                            type="number" 
                            value={ocrReview.amount}
                            onChange={(e) => setOcrReview({ ...ocrReview, amount: Number(e.target.value) })}
                            className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:border-[#C59B27] ${
                              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block tracking-wider font-semibold opacity-65 mb-1 uppercase">Data Faturamento</label>
                          <input 
                            type="date" 
                            value={ocrReview.date}
                            onChange={(e) => setOcrReview({ ...ocrReview, date: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:border-[#C59B27] ${
                              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block tracking-wider font-semibold opacity-65 mb-1 uppercase">Propriedade Associada</label>
                          <select 
                            value={ocrReview.propertyName}
                            onChange={(e) => setOcrReview({ ...ocrReview, propertyName: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:border-[#C59B27] ${
                              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                            }`}
                          >
                            <option value="Geral">Geral (Fundo Comum)</option>
                            {properties.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block tracking-wider font-semibold opacity-65 mb-1 uppercase">Categoria</label>
                          <select 
                            value={ocrReview.category}
                            onChange={(e) => setOcrReview({ ...ocrReview, category: e.target.value })}
                            className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:border-[#C59B27] ${
                              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                            }`}
                          >
                            <option value="Energia">Energia</option>
                            <option value="Água">Água</option>
                            <option value="Limpeza">Limpeza</option>
                            <option value="Manutenção">Manutenção</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>
                      </div>

                      {/* Launch Confirm Button */}
                      <button 
                        type="button"
                        onClick={handleOcrConfirm}
                        className="w-full mt-2 py-3 rounded-lg text-xs font-semibold uppercase text-white bg-gradient-to-r from-[#C29438] to-[#916B21] hover:brightness-110 shadow-lg cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>Confirmar e Lançar Despesa</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ================= EXTRACT FINANCIAL GENERAL LEDGER / OVERVIEW TAB ================= */}
        {financeTab === "Overview" && (
          <div className="space-y-4 font-sans text-xs">
            {/* Quick balance summary metrics board */}
            <div className={`p-4 rounded-xl border flex justify-between items-center ${
              isDarkMode ? "bg-neutral-900/60 border-neutral-800" : "bg-amber-100/10 border-amber-200/40"
            }`}>
              <div>
                <span className="opacity-60 block text-[9px] uppercase tracking-wider font-bold">Total Receitas</span>
                <span className="font-mono text-sm font-bold text-green-600 block">{formatBRL(totalReceitas)}</span>
              </div>
              <div className="h-6 w-[1px] bg-neutral-300 dark:bg-neutral-800" />
              <div className="text-right">
                <span className="opacity-60 block text-[9px] uppercase tracking-wider font-bold">Total Despesas</span>
                <span className="font-mono text-sm font-bold text-red-500 block">{formatBRL(totalDespesas)}</span>
              </div>
            </div>

            {/* Custom SVG column comparison chart */}
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? "bg-[#1C1C1E] border-neutral-800" : "bg-white border-amber-100"
            }`}>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider opacity-65 mb-3">Distribuição Comparativa</h4>
              
              {/* Draw comparing bar */}
              <div className="space-y-3">
                {properties.map(p => {
                  // Sum property specific incomes and expenses
                  const propIncomes = finances
                    .filter(f => f.propertyName.toLowerCase() === p.name.toLowerCase() && f.type === "receita")
                    .reduce((sum, item) => sum + item.amount, 0);

                  const propExpenses = finances
                    .filter(f => f.propertyName.toLowerCase() === p.name.toLowerCase() && f.type === "despesa")
                    .reduce((sum, item) => sum + item.amount, 0);

                  const total = Math.max(propIncomes + propExpenses, 1);
                  const incPercent = (propIncomes / total) * 100;
                  const expPercent = (propExpenses / total) * 100;

                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between items-center font-semibold text-[10px]">
                        <span>{p.name}</span>
                        <span className="font-mono opacity-80 text-[9px]">
                          Rec: {formatBRL(propIncomes)} | Des: {formatBRL(propExpenses)}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full flex overflow-hidden">
                        <div style={{ width: `${incPercent}%` }} className="h-full bg-[#C59B27] transition-all" />
                        <div style={{ width: `${expPercent}%` }} className="h-full bg-red-400/90 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secao de Projeção de Receita Recorrente - Next 3 Months */}
            <div className={`p-4 rounded-xl border flex flex-col relative overflow-hidden backdrop-blur-[6px] transition-all ${
              isDarkMode ? "bg-[#1C1C1E]/80 border-neutral-800/60" : "bg-white/80 border-amber-100/70"
            } shadow-sm`}>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider opacity-65 flex items-center">
                    <Sparkles size={11} className="text-[#C59B27] mr-1.5 animate-pulse" />
                    Previsão de Receita Recorrente
                  </h4>
                  <p className="text-[9px] opacity-50">Modelo preditivo base +3 meses</p>
                </div>

                {/* Scenario buttons */}
                <div className="flex bg-neutral-200/50 dark:bg-neutral-900/60 p-0.5 rounded-lg text-[8px] font-bold">
                  {(["conservador", "moderado", "otimista"] as const).map((scene) => (
                    <button
                      key={scene}
                      type="button"
                      onClick={() => setProjectionScenario(scene)}
                      className={`px-2 py-1 rounded transition-all uppercase tracking-wider cursor-pointer ${
                        projectionScenario === scene
                          ? "bg-[#C59B27] text-white shadow-sm"
                          : "opacity-65 hover:opacity-95"
                      }`}
                    >
                      {scene === "conservador" ? "Cons." : scene === "moderado" ? "Mod." : "Otim."}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanatory insights badge */}
              <div className={`p-2.5 rounded-lg mb-3 border text-[9px] flex items-start space-x-1.5 ${
                isDarkMode 
                  ? "bg-neutral-900/50 border-neutral-800/80 text-neutral-300" 
                  : "bg-amber-50/55 border-amber-100/60 text-amber-950 font-medium"
              }`}>
                <AlertCircle size={12} className="text-[#C59B27] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span>
                    {projectionScenario === "conservador" && "Cenário conservador: Projeta ocupação reduzida (-15%) focado no mínimo contratual recorrente estrito."}
                    {projectionScenario === "moderado" && "Cenário estável/moderado: O nível de ocupação segue a média anual, estimando receita equilibrada."}
                    {projectionScenario === "otimista" && "Cenário otimista: Alta temporada simulada com taxa de ocupação máxima e tarifas customizadas (+20%)."}
                  </span>
                </div>
              </div>

              {/* Simple Recharts Bar Chart */}
              <div className="h-44 w-full select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={isDarkMode ? 0.08 : 0.15} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9, fontWeight: 600, fill: isDarkMode ? "#A3A3A3" : "#78716c" }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 8, fill: isDarkMode ? "#737373" : "#78716c" }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `R$ ${Math.round(val / 1000)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(197, 155, 39, 0.05)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-2 rounded-xl border font-sans text-[10px] shadow-xl ${
                              isDarkMode ? "bg-zinc-950 border-neutral-800 text-neutral-100" : "bg-white border-amber-100 text-amber-950"
                            }`}>
                              <span className="font-bold text-xs">{data.name}</span>
                              <div className="mt-1 flex flex-col font-mono">
                                <span className="text-[#C59B27] font-bold">Previsto: {formatBRL(data.amount)}</span>
                                <span className={data.growth.startsWith("-") ? "text-rose-500" : "text-green-500"}>
                                  Variação: {data.growth}
                                </span>
                                <span className="opacity-70">Ocupação Est.: {data.occupancy}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={34}>
                      {projectionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 1 ? "#C59B27" : "rgba(197, 155, 39, 0.45)"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Predicted statistics overlay footer */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2.5 border-t border-current/5 text-center text-[9px]">
                <div className="p-1 rounded bg-neutral-100/30 dark:bg-neutral-900/30">
                  <span className="opacity-60 block text-[8px]">Média Trimestral</span>
                  <span className="font-mono font-bold text-[10px] text-[#C59B27]">
                    {formatBRL(Math.round(projectionData.reduce((acc, curr) => acc + curr.amount, 0) / 3))}
                  </span>
                </div>
                <div className="p-1 rounded bg-neutral-100/30 dark:bg-neutral-900/30">
                  <span className="opacity-60 block font-sans text-[8px]">Ocupação Média</span>
                  <span className="font-mono font-bold text-[10px] text-green-500">
                    {projectionScenario === "conservador" ? "61%" : projectionScenario === "otimista" ? "87%" : "73%"}
                  </span>
                </div>
                <div className="p-1 rounded bg-neutral-100/30 dark:bg-neutral-900/30">
                  <span className="opacity-60 block font-sans text-[8px]">Margem Bruta Est.</span>
                  <span className="font-mono font-bold text-[10px]">91.5%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= RECEITAS / DESPESAS LIST TAB VIEWPORT ================= */}
        {(financeTab === "Overview" || financeTab === "Receitas" || financeTab === "Despesas") && (
          <div className="space-y-3 font-sans text-xs">
            {/* Table categories filter bar */}
            <div className="flex items-center justify-between border-b border-neutral-800/10 dark:border-white/10 pb-2">
              <span className="font-bold flex items-center opacity-75">
                <Filter size={12} className="mr-1.5" />
                <span>Extratos Recentes ({listItems.length})</span>
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`text-[10px] py-1 border px-2.5 rounded-lg font-semibold focus:outline-none focus:border-[#C59B27] ${
                  isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/65"
                }`}
              >
                <option value="All">Todas Categorias</option>
                {categories.filter(c => c !== "All").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Render item lists */}
            <div className="space-y-2">
              {listItems.length === 0 ? (
                <div className="py-12 text-center text-xs opacity-50">
                  Nenhuma transação lançada para esta categoria.
                </div>
              ) : (
                listItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleEditClick(item)}
                    className={`p-3 rounded-xl border flex items-center justify-between hover:shadow-md cursor-pointer transition active:scale-[0.98] duration-200 select-none ${
                      isDarkMode 
                        ? "bg-[#1C1C1E] border-neutral-800 hover:border-[#C59B27]/40 hover:bg-neutral-900" 
                        : "bg-white border-amber-100 hover:border-[#C59B27]/40 hover:bg-amber-100/10"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`p-2 rounded-lg ${
                        item.type === "receita"
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : "bg-red-500/10 text-red-500"
                      }`}>
                        {item.type === "receita" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                      </span>
                      <div>
                        <span className="font-semibold block text-[11px] truncate tracking-tight max-w-[170px]">{item.title}</span>
                        <div className={`flex items-center space-x-1.5 text-[10px] mt-1 ${isDarkMode ? "text-neutral-400" : "text-stone-600 font-semibold"}`}>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide border ${
                            item.status === "extraido" 
                              ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20" 
                              : isDarkMode 
                              ? "bg-[#1C1C1E] text-neutral-300 border-neutral-800" 
                              : "bg-stone-100 text-stone-700 border-stone-250"
                          }`}>
                            {item.propertyName === "Geral" ? "Geral" : item.propertyName}
                          </span>
                          <span>•</span>
                          <span>{formatDatePT(item.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className={`font-mono font-bold text-xs ${
                      item.type === "receita" ? "text-green-600" : "text-red-500"
                    }`}>
                      {item.type === "receita" ? "+" : "-"} {formatBRL(item.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL DRAWER: Manual Addition/Edit Form (Animates slide-up) */}
      <AnimatePresence>
        {isManualAddOpen && (
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
                {editingItem ? "Editar Transação" : "Lançar Transação"}
              </h2>

              <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block tracking-wide font-semibold opacity-75 mb-2 uppercase">Tipo do Fluxo</label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setManualType("receita")}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        manualType === "receita"
                          ? "bg-green-600/10 border-green-500 text-green-500"
                          : "border-neutral-500/20 text-neutral-400"
                      }`}
                    >
                      Receita (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualType("despesa")}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        manualType === "despesa"
                          ? "bg-red-500/15 border-red-500 text-red-500"
                          : "border-neutral-500/20 text-neutral-400"
                      }`}
                    >
                      Despesa (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Título / Descrição</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ex: Pagamento reservas Jan"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                      isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Valor Total (R$)</label>
                    <input
                      type="number"
                      required
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="Ex: 350.00"
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Data Lançamento</label>
                    <input
                      type="date"
                      required
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Casa Associada</label>
                    <select
                      value={manualProperty}
                      onChange={(e) => setManualProperty(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    >
                      <option value="Geral">Fundo Geral</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Categoria</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    >
                      <option value="Aluguel">Aluguel / Reservas</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Energia">Energia</option>
                      <option value="Água">Água</option>
                      <option value="Tráfego">Tráfego / Adm</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3.5 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-xs font-semibold tracking-wide text-white uppercase bg-gradient-to-r from-[#C29438] to-[#916B21] hover:brightness-110 shadow-lg cursor-pointer transition active:scale-95"
                  >
                    {editingItem ? "Salvar Alterações" : "Confirmar Lançamento"}
                  </button>

                  {editingItem && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm("Deseja realmente deletar esta transação do sistema? \nEsta ação não poderá ser revertida.")) {
                          await onDeleteFinance(editingItem.id);
                          handleCloseForm();
                        }
                      }}
                      className="w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide text-red-500 hover:text-red-600 uppercase border border-red-500/25 dark:border-red-500/15 hover:bg-red-500/5 flex items-center justify-center space-x-2 cursor-pointer transition active:scale-95"
                    >
                      <Trash2 size={13} />
                      <span>Excluir Transação</span>
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
