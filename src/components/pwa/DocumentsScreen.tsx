import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, X, FileText, ChevronRight } from "lucide-react";

interface DocumentsScreenProps {
  isDarkMode: boolean;
}

export default function DocumentsScreen({ isDarkMode }: DocumentsScreenProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"Todos" | "Notas Fiscais" | "Contratos" | "Outros">("Todos");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // New doc form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Notas Fiscais" | "Contratos" | "Outros">("Notas Fiscais");
  const [newVal, setNewVal] = useState("");

  const defaultMockDocs = [
    {
      id: "doc-1",
      title: "Nota Fiscal - Reforma",
      subtitle: "15/05/2025 • R$ 45.230,00",
      filename: "NF-0001256.pdf",
      category: "Notas Fiscais"
    },
    {
      id: "doc-2",
      title: "Contrato de Locação",
      subtitle: "10/05/2025 • Residencial",
      filename: "contrato_locacao.pdf",
      category: "Contratos"
    },
    {
      id: "doc-3",
      title: "Nota Fiscal - Serviço",
      subtitle: "08/05/2025 • R$ 8.750,00",
      filename: "NF-0001250.pdf",
      category: "Notas Fiscais"
    },
    {
      id: "doc-4",
      title: "Recibo de Despesa",
      subtitle: "05/05/2025 • R$ 1.250,00",
      filename: "recibo_despesa.pdf",
      category: "Outros"
    },
    {
      id: "doc-5",
      title: "Laudo de Avaliação",
      subtitle: "01/05/2025 • Imóvel",
      filename: "laudo_avaliacao.pdf",
      category: "Outros"
    }
  ];

  const [userDocs, setUserDocs] = useState<any[]>([]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newDocItem = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      subtitle: `${new Date().toLocaleDateString("pt-BR")} • ${newVal || "Geral"}`,
      filename: `${newTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      category: newCategory
    };
    setUserDocs(prev => [newDocItem, ...prev]);
    setNewTitle("");
    setNewVal("");
    setIsAddOpen(false);
  };

  const allDisplayDocs = [...userDocs, ...defaultMockDocs];

  const filteredDocs = allDisplayDocs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          doc.filename.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeFilter === "Todos" || doc.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative h-full">
      {/* 1. Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 
          className={`font-serif text-lg font-bold text-left ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif" }}
        >
          Documentos
        </h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className={`p-1.5 rounded-full cursor-pointer transition ${
            isDarkMode ? "text-[#E6C687] hover:bg-neutral-800" : "text-[#A97142] hover:bg-stone-100"
          }`}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 2. Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
          <Search size={14} className={isDarkMode ? "text-neutral-400" : "text-stone-600"} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar documentos"
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs transition-all focus:outline-none border ${
            isDarkMode 
              ? "bg-[#11161D] border-neutral-800 text-white focus:border-[#C8A27A]" 
              : "bg-[#FAF8F5] border-stone-200 text-amber-950 focus:border-[#A97142]"
          }`}
        />
      </div>

      {/* 3. Pills Filters */}
      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {(["Todos", "Notas Fiscais", "Contratos", "Outros"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all shrink-0 ${
              activeFilter === tab
                ? isDarkMode
                  ? "bg-[#C8A27A] text-slate-950"
                  : "bg-[#EFE4D0] text-amber-950"
                : isDarkMode
                ? "bg-[#11161D] text-neutral-400 border border-neutral-800"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Horizontal Document List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-2">
        {filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-60">
            Nenhum documento encontrado.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                isDarkMode 
                  ? "bg-[#11161D] border-neutral-800/80 hover:bg-[#151c25]" 
                  : "bg-white border-stone-100 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                {/* File Icon */}
                <div className={`p-2 rounded-lg shrink-0 ${
                  isDarkMode 
                    ? "bg-[#1C2330] text-[#E6C687]" 
                    : "bg-[#FAF8F5] text-[#A97142]"
                }`}>
                  <FileText size={16} />
                </div>
                {/* Text details */}
                <div className="text-left min-w-0">
                  <h4 className={`text-[11.5px] font-bold truncate ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
                    {doc.title}
                  </h4>
                  <p className={`text-[9px] opacity-65 mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
                    {doc.subtitle}
                  </p>
                  <p className="text-[9px] font-mono opacity-50 mt-1">
                    {doc.filename}
                  </p>
                </div>
              </div>

              {/* Arrow right */}
              <div className={isDarkMode ? "text-neutral-600" : "text-stone-400"}>
                <ChevronRight size={14} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
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
                onClick={() => setSelectedDoc(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-black/5 hover:bg-black/10 text-current"
              >
                <X size={16} />
              </button>

              <h3 className="font-serif font-bold text-base pr-8 text-left">{selectedDoc.title}</h3>
              <p className="text-[10px] opacity-65 text-left mt-1">{selectedDoc.subtitle}</p>

              <div className="my-6 py-8 rounded-xl border-2 border-dashed border-current/15 flex flex-col items-center justify-center space-y-2 opacity-80">
                <FileText size={40} className="text-[#C8A27A]" />
                <span className="text-xs font-mono">{selectedDoc.filename}</span>
                <span className="text-[9.5px] opacity-60">Visualização de PDF não disponível</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 text-left">
                <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"}`}>
                  <span className="text-[9px] uppercase tracking-wider opacity-65 font-bold block mb-1">Categoria</span>
                  <span className="font-bold text-xs">{selectedDoc.category}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"}`}>
                  <span className="text-[9px] uppercase tracking-wider opacity-65 font-bold block mb-1">Status</span>
                  <span className="font-bold text-xs text-green-500">Assinado/Válido</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#A97142] hover:bg-[#8e5c32] transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Document modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddOpen(false)}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full rounded-t-2xl p-5 max-h-[90%] overflow-y-auto no-scrollbar relative ${
                isDarkMode ? "bg-[#11161D] text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              <div className="absolute right-4 top-4 p-1 cursor-pointer" onClick={() => setIsAddOpen(false)}>
                <X size={18} />
              </div>

              <h2 className="font-serif font-bold text-base mb-4 text-left">Adicionar Documento</h2>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs text-left">
                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Título do Documento</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Nota Fiscal de Compra"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-[#FFF] border-stone-200 text-amber-950"
                    }`}
                  >
                    <option value="Notas Fiscais">Notas Fiscais</option>
                    <option value="Contratos">Contratos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Valor / Detalhe (opcional)</label>
                  <input
                    type="text"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="Ex: R$ 5.400,00 ou Particular"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-xs font-bold tracking-wide text-white uppercase bg-[#A97142] hover:bg-[#8e5c32] shadow-lg cursor-pointer"
                  >
                    Salvar Documento
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
