import React from "react";
import { 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Trash2, 
  Sparkles, 
  Plus, 
  Download,
  Calendar,
  FileText
} from "lucide-react";
import { Property, Revenue, Expense, ExpenseCategory, PropertyOrigin } from "../types";
import { addExpense, deleteExpense, scanReceiptOCR } from "../data/api";

interface IncomeTaxViewProps {
  properties: Property[];
  revenues: Revenue[];
  expenses: Expense[];
  onDataChanged: () => void;
  darkMode?: boolean;
}

// Helper to map OCR returned category text dynamically to ExpenseCategory
const mapCategory = (ocrCat?: string): ExpenseCategory => {
  if (!ocrCat) return ExpenseCategory.TAXAS;
  const normalized = ocrCat.trim().toLowerCase();
  
  // Try direct match with values
  const matchedValue = Object.values(ExpenseCategory).find(
    val => val.toLowerCase() === normalized
  );
  if (matchedValue) return matchedValue;

  // Try matching keys
  const matchedKey = Object.keys(ExpenseCategory).find(
    key => key.toLowerCase() === normalized
  ) as keyof typeof ExpenseCategory | undefined;
  if (matchedKey && ExpenseCategory[matchedKey]) return ExpenseCategory[matchedKey];

  // Pattern matching
  if (normalized.includes("manutenc") || normalized.includes("reforma") || normalized.includes("conserto")) return ExpenseCategory.MANUTENCAO;
  if (normalized.includes("piscina")) return ExpenseCategory.PISCINA;
  if (normalized.includes("limp") || normalized.includes("faxina") || normalized.includes("diarista")) return ExpenseCategory.LIMPEZA;
  if (normalized.includes("func") || normalized.includes("salario") || normalized.includes("folha")) return ExpenseCategory.FUNCIONARIOS;
  if (normalized.includes("internet") || normalized.includes("wifi") || normalized.includes("telef")) return ExpenseCategory.INTERNET;
  if (normalized.includes("agua")) return ExpenseCategory.AGUA;
  if (normalized.includes("energia") || normalized.includes("luz") || normalized.includes("coelba") || normalized.includes("enel")) return ExpenseCategory.ENERGIA;
  if (normalized.includes("jard")) return ExpenseCategory.JARDINAGEM;
  if (normalized.includes("aliment") || normalized.includes("supermercado")) return ExpenseCategory.ALIMENTACAO;
  if (normalized.includes("movel") || normalized.includes("moveis")) return ExpenseCategory.MOVEIS;
  if (normalized.includes("uten")) return ExpenseCategory.UTENSILIOS;
  if (normalized.includes("eletro")) return ExpenseCategory.ELETRONICOS;
  if (normalized.includes("comis")) return ExpenseCategory.COMISSOES;
  if (normalized.includes("iptu") || normalized.includes("imposto") || normalized.includes("irpf") || normalized.includes("darf")) return ExpenseCategory.IMPOSTOS;
  if (normalized.includes("taxa")) return ExpenseCategory.TAXAS;

  return ExpenseCategory.TAXAS;
};

// Helper to escape values for CSV generation to avoid injection and formatting bugs
const escapeCSVField = (val: any): string => {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  
  // Prevent CSV Injection (Formula Injection)
  if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
    str = "'" + str;
  }
  
  // Escape double quotes by doubling them and wrap in double quotes
  return `"${str.replace(/"/g, '""')}"`;
};

// Progressive tax table brackets for monthly calculation (2026 Table)
const calculateMonthlyTax = (taxableIncome: number): number => {
  if (taxableIncome <= 2259.20) return 0;
  if (taxableIncome <= 2828.65) return (taxableIncome * 0.075) - 169.44;
  if (taxableIncome <= 3751.05) return (taxableIncome * 0.15) - 381.59;
  if (taxableIncome <= 4664.68) return (taxableIncome * 0.225) - 662.92;
  return (taxableIncome * 0.275) - 896.15;
};


export default function IncomeTaxView({ properties, revenues, expenses, onDataChanged, darkMode = true }: IncomeTaxViewProps) {
  const [selectedYear, setSelectedYear] = React.useState<number>(2026);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string>("all");
  
  // OCR/Upload States
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  // Manual Expense Add States
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newExpense, setNewExpense] = React.useState({
    propertyId: properties[0]?.id || "",
    category: ExpenseCategory.TAXAS,
    supplier: "",
    value: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "Pix"
  });

  // Check if an expense is tax-deductible under Carnê-Leão rules
  const isDeductible = (expense: Expense): boolean => {
    const deductibleCategories = [
      ExpenseCategory.COMISSOES,
      ExpenseCategory.TAXAS,
      ExpenseCategory.LIMPEZA,
      ExpenseCategory.MANUTENCAO,
      ExpenseCategory.PISCINA,
      ExpenseCategory.JARDINAGEM,
      ExpenseCategory.IMPOSTOS
    ];
    return deductibleCategories.includes(expense.category);
  };

  // Filtered revenues and expenses
  const filteredRevenues = React.useMemo(() => {
    return revenues.filter(r => {
      const yearMatches = new Date(r.date).getFullYear() === selectedYear;
      const propMatches = selectedPropertyId === "all" || r.propertyId === selectedPropertyId;
      return yearMatches && propMatches;
    });
  }, [revenues, selectedYear, selectedPropertyId]);

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter(e => {
      const yearMatches = new Date(e.date).getFullYear() === selectedYear;
      const propMatches = selectedPropertyId === "all" || e.propertyId === selectedPropertyId;
      return yearMatches && propMatches;
    });
  }, [expenses, selectedYear, selectedPropertyId]);

  // Calculations
  const grossRevenue = React.useMemo(() => {
    return filteredRevenues.reduce((sum, r) => sum + r.value, 0);
  }, [filteredRevenues]);

  const totalExpenses = React.useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.value, 0);
  }, [filteredExpenses]);

  const deductibleExpenses = React.useMemo(() => {
    return filteredExpenses.filter(isDeductible).reduce((sum, e) => sum + e.value, 0);
  }, [filteredExpenses]);

  const taxableBase = Math.max(0, grossRevenue - deductibleExpenses);

  // Progressive monthly calculations
  const estimatedTax = React.useMemo(() => {
    // Group net income by month
    const monthlyNetIncome: Record<number, { revenue: number; deductions: number }> = {};
    for (let m = 0; m < 12; m++) {
      monthlyNetIncome[m] = { revenue: 0, deductions: 0 };
    }

    filteredRevenues.forEach(r => {
      const month = new Date(r.date).getMonth();
      monthlyNetIncome[month].revenue += r.value;
    });

    filteredExpenses.filter(isDeductible).forEach(e => {
      const month = new Date(e.date).getMonth();
      monthlyNetIncome[month].deductions += e.value;
    });

    // Sum estimated progressive tax month-by-month
    let totalTax = 0;
    Object.values(monthlyNetIncome).forEach(net => {
      const monthlyTaxable = Math.max(0, net.revenue - net.deductions);
      totalTax += calculateMonthlyTax(monthlyTaxable);
    });

    return totalTax;
  }, [filteredRevenues, filteredExpenses]);

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = [
      "ID Lançamento",
      "Data",
      "Imóvel",
      "Fornecedor/Destinatário",
      "Categoria",
      "Valor (R$)",
      "Dedutível (Carnê-Leão)",
      "Forma de Pagamento",
      "Descrição/Notas",
      "Comprovante"
    ];

    const rows = filteredExpenses.map(e => {
      const prop = properties.find(p => p.id === e.propertyId);
      return [
        e.id,
        e.date,
        prop?.name || "Geral",
        e.supplier,
        e.category,
        e.value.toFixed(2),
        isDeductible(e) ? "Sim" : "Não",
        e.paymentMethod,
        e.description,
        e.receipt ? "Sim" : "Não"
      ].map(escapeCSVField).join(",");
    });

    const revenueRows = filteredRevenues.map(r => {
      const prop = properties.find(p => p.id === r.propertyId);
      return [
        r.id,
        r.date,
        prop?.name || "Geral",
        r.origin,
        "Diárias de Aluguel",
        r.value.toFixed(2),
        r.taxes.toFixed(2),
        "Canal",
        r.description
      ].map(escapeCSVField).join(",");
    });

    const csvContent = "\uFEFF" + [
      [escapeCSVField("DECLARAÇÃO DE DESPESAS E RECEBIMENTOS PARA IMPOSTO DE RENDA - " + selectedYear)].join(","),
      [escapeCSVField("Filtro Imóvel: " + (selectedPropertyId === "all" ? "Todos" : properties.find(p => p.id === selectedPropertyId)?.name))].join(","),
      [],
      [escapeCSVField("RECEITAS / RENDIMENTOS DE TEMPORADA")].join(","),
      ["ID Lançamento", "Data", "Imóvel", "Origem", "Categoria", "Valor Recebido", "Imposto/Retenção", "Forma", "Descrição"].map(escapeCSVField).join(","),
      ...revenueRows,
      [],
      [escapeCSVField("DESPESAS DEDUTÍVEIS & NÃO DEDUTÍVEIS")].join(","),
      headers.map(escapeCSVField).join(","),
      ...rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Kobayashi_IRPF_Export_${selectedYear}_${selectedPropertyId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Receipt File Upload for OCR
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const ocrData = await scanReceiptOCR(base64);

        // Save scanned expense to DB
        await addExpense({
          propertyId: ocrData.propertyId || properties[0]?.id || "casa-lilian",
          category: mapCategory(ocrData.category),
          supplier: ocrData.supplier || "Diversos (IR)",
          date: ocrData.date || new Date().toISOString().split("T")[0],
          value: Number(ocrData.value) || 0,
          paymentMethod: "Pix",
          description: `[Comprovante IR] ${ocrData.description || "Lançamento de Imposto de Renda"}`,
          receipt: base64
        });

        setUploadSuccess(true);
        onDataChanged();
      } catch (err: any) {
        console.error(err);
        // Save anyway even if OCR fails
        try {
          await addExpense({
            propertyId: properties[0]?.id || "casa-lilian",
            category: ExpenseCategory.TAXAS,
            supplier: "Comprovante IR (Ajuste Manual)",
            date: new Date().toISOString().split("T")[0],
            value: 0,
            paymentMethod: "Pix",
            description: "[Comprovante IR] Lançamento manual (Leitura automática indisponível)",
            receipt: base64
          });
          setUploadSuccess(true);
          onDataChanged();
        } catch (saveErr) {
          setUploadError("Não foi possível salvar o comprovante.");
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Manual Form
  const handleAddManualExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExpense({
        propertyId: newExpense.propertyId,
        category: newExpense.category,
        supplier: newExpense.supplier,
        date: newExpense.date,
        value: newExpense.value,
        paymentMethod: newExpense.paymentMethod,
        description: `[Declarável IR] ${newExpense.description}`,
        receipt: "Comprovante Manual Anexado"
      });
      setShowAddForm(false);
      // Reset fields
      setNewExpense({
        propertyId: properties[0]?.id || "",
        category: ExpenseCategory.TAXAS,
        supplier: "",
        value: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
        paymentMethod: "Pix"
      });
      onDataChanged();
    } catch (err) {
      alert("Erro ao salvar despesa de declaração.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Remover este lançamento permanentemente?")) {
      await deleteExpense(id);
      onDataChanged();
    }
  };

  return (
    <div id="tab-income-tax" className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Central de Declaração & Imposto de Renda</h2>
          <p className="text-xs text-slate-400 mt-0.5">Sua contabilidade sob medida para o Carnê-Leão e declaração de IRPF.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-semibold"
          >
            <option value={2026}>Ano Fiscal 2026</option>
            <option value={2025}>Ano Fiscal 2025</option>
          </select>
          <select 
            value={selectedPropertyId} 
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-semibold"
          >
            <option value="all">Todas as Propriedades</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="bg-[#dfb26c] hover:bg-[#b89047] text-slate-950 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Tax Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Rendimentos Brutos</span>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <strong className="text-xl font-black text-white block mt-2">
              R$ {grossRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">{filteredRevenues.length} recebimentos computados</p>
        </div>

        <div className="premium-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Deduções Admitidas</span>
              <TrendingDown size={14} className="text-amber-400" />
            </div>
            <strong className="text-xl font-black text-white block mt-2 text-amber-400">
              R$ {deductibleExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Comissões, IPTU, Condomínios e Limpeza</p>
        </div>

        <div className="premium-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Base de Cálculo Líquida</span>
              <DollarSign size={14} className="text-sky-400" />
            </div>
            <strong className="text-xl font-black text-white block mt-2 text-sky-400">
              R$ {taxableBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Valor tributável acumulado</p>
        </div>

        <div className="premium-card rounded-2xl p-4 flex flex-col justify-between border-l-4 border-l-[#dfb26c]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#dfb26c] uppercase font-bold">Imposto Estimado (IRPF)</span>
              <Percent size={14} className="text-[#dfb26c]" />
            </div>
            <strong className="text-xl font-black text-[#dfb26c] block mt-2 drop-shadow-[0_0_12px_rgba(223,178,108,0.25)]">
              R$ {estimatedTax.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">Simulador Carnê-Leão Mensal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload receipt / Manual Form */}
        <div className="space-y-6">
          
          {/* Quick Upload / OCR Box */}
          <div className="premium-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles size={16} className="text-[#dfb26c]" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Anexar Comprovante / OCR</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Envie comprovantes de despesas (como IPTU, taxas ou notas fiscais de reformas estruturais). Nosso scanner cognitivo identificará o valor e salvará nos registros.
            </p>
            
            <label className="border-2 border-dashed border-slate-800 hover:border-[#dfb26c]/30 hover:bg-[#dfb26c]/5 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-32">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleReceiptUpload}
                disabled={uploading}
              />
              <Upload size={24} className="text-slate-500 mb-2" />
              <span className="text-xs text-slate-350 font-semibold">Arraste ou envie imagem do recibo</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Automático para categoria "Taxas"</span>
            </label>

            {uploading && (
              <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-center text-[10px] text-slate-400 font-mono animate-pulse">
                Processando dados cognitivos com IA...
              </div>
            )}

            {uploadError && (
              <div className="flex gap-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px]">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px]">
                <CheckCircle size={12} className="shrink-0 mt-0.5" />
                <span>Comprovante processado e lançado com sucesso!</span>
              </div>
            )}
          </div>

          {/* Helper Guidelines Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info size={13} className="text-[#dfb26c]" />
              Regras do Imposto de Renda
            </h4>
            <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong>Deduções do Carnê-Leão:</strong> De acordo com a Receita Federal do Brasil, os rendimentos de locação podem ser reduzidos pelos seguintes custos pagos pelo proprietário:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[10px] text-slate-350">
                <li>Taxas e comissões cobradas por imobiliárias ou plataformas (ex: comissão de 15% Airbnb/Booking).</li>
                <li>Condomínio e parcelas de IPTU cobrados no ano fiscal correspondente.</li>
                <li>Despesas de conservação e limpeza do imóvel (limpezas, manutenção corretiva essencial).</li>
              </ul>
              <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg border-l-2 border-l-[#dfb26c] mt-2">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#dfb26c] block">Nota de Kaizen Financeiro</span>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Sempre anexe os comprovantes fiscais (comprovante Pix, notas de serviço ou faturas). O fisco exige a guarda por no mínimo 5 anos.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Deductible Log / Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
              Registros Declaráveis e Dedutíveis
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all flex items-center gap-1"
            >
              <Plus size={11} /> {showAddForm ? "Fechar formulário" : "Registrar custo manual"}
            </button>
          </div>

          {/* Form manual add */}
          {showAddForm && (
            <form onSubmit={handleAddManualExpense} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 animate-fadeIn text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Imóvel</label>
                  <select 
                    value={newExpense.propertyId} 
                    onChange={e => setNewExpense({ ...newExpense, propertyId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-[11px]"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Categoria</label>
                  <select 
                    value={newExpense.category} 
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-[11px]"
                  >
                    <option value={ExpenseCategory.TAXAS}>Taxas e Custos</option>
                    <option value={ExpenseCategory.IMPOSTOS}>Impostos (IPTU, ITBI)</option>
                    <option value={ExpenseCategory.COMISSOES}>Comissões de Plataforma</option>
                    <option value={ExpenseCategory.LIMPEZA}>Faxinas e Zeladoria</option>
                    <option value={ExpenseCategory.MANUTENCAO}>Manutenção Estrutural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Fornecedor / Favorecido</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="ex: Cartório de Registros, Receita Municipal"
                    value={newExpense.supplier} 
                    onChange={e => setNewExpense({ ...newExpense, supplier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Valor Pago (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newExpense.value} 
                    onChange={e => setNewExpense({ ...newExpense, value: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Data</label>
                  <input 
                    type="date" 
                    required 
                    value={newExpense.date} 
                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Forma de Pagamento</label>
                  <input 
                    type="text" 
                    value={newExpense.paymentMethod} 
                    onChange={e => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-mono block uppercase">Histórico / Descrição da Despesa</label>
                <input 
                  type="text" 
                  required 
                  placeholder="ex: IPTU Parcela 1/10"
                  value={newExpense.description} 
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-1.5">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-1.5 rounded text-[11px]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-accent-purple text-white py-1.5 rounded-lg font-semibold hover:bg-accent-purple-hover text-[11px]"
                >
                  Sincronizar Declaração
                </button>
              </div>
            </form>
          )}

          {/* Logs table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 font-mono text-[9px] text-slate-500 uppercase">
                  <th className="p-3">Data</th>
                  <th className="p-3">Imóvel</th>
                  <th className="p-3">Favorecido</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3 text-center">Dedutível</th>
                  <th className="p-3 text-center">Comprovante</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-350">
                {filteredExpenses.map(e => {
                  const matchedProp = properties.find(p => p.id === e.propertyId);
                  const isDec = isDeductible(e);

                  return (
                    <tr key={e.id} className="hover:bg-slate-950/40">
                      <td className="p-3 font-mono text-[10px]">{e.date}</td>
                      <td className="p-3 font-medium text-white">{matchedProp?.name || "Geral"}</td>
                      <td className="p-3 truncate max-w-[100px]" title={e.supplier}>{e.supplier}</td>
                      <td className="p-3">
                        <span className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-400">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-red-400">
                        R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isDec 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-slate-950 text-slate-650 border border-slate-900"
                        }`}>
                          {isDec ? "Sim" : "Não"}
                        </span>
                      </td>
                      <td className="p-3 text-center text-[10px]">
                        {e.receipt ? (
                          e.receipt.startsWith("data:") ? (
                            <button
                              onClick={() => {
                                const newTab = window.open();
                                if (newTab) {
                                  newTab.document.write(`<iframe src="${e.receipt}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                }
                              }}
                              className="text-emerald-400 hover:underline font-bold cursor-pointer"
                              title="Clique para visualizar o comprovante anexado"
                            >
                              Ver Anexo 📄
                            </button>
                          ) : (
                            <span className="text-emerald-400" title={e.receipt}>Anexado ✅</span>
                          )
                        ) : (
                          <span className="text-slate-500">Pendente ⚠️</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteItem(e.id)}
                          className="text-red-450 hover:text-white transition-all cursor-pointer"
                          title="Excluir Lançamento"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500 font-sans text-xs">
                      Nenhum lançamento fiscal encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
