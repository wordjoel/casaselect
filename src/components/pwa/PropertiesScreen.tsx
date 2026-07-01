import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, X } from "lucide-react";
import { Property } from "./types";

interface PropertiesScreenProps {
  key?: string;
  properties: Property[];
  onAddProperty: (newProp: Omit<Property, "id">) => Promise<void>;
  onUpdateProperty: (id: string, updated: Partial<Property>) => Promise<void>;
  isDarkMode: boolean;
}

export default function PropertiesScreen({ properties, onAddProperty, onUpdateProperty, isDarkMode }: PropertiesScreenProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"Todos" | "Residencial" | "Comercial">("Todos");
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editDailyRate, setEditDailyRate] = useState<number>(0);

  // New property form state
  const [newPropName, setNewPropName] = useState("");
  const [newPropAddress, setNewPropAddress] = useState("");
  const [newPropRate, setNewPropRate] = useState(1200);
  const [newPropImageUrl, setNewPropImageUrl] = useState("");

  // Sync edit state when a property is selected
  useEffect(() => {
    if (selectedProperty) {
      setEditName(selectedProperty.name);
      setEditAddress(selectedProperty.address);
      setEditImageUrl(selectedProperty.imageUrl);
      setEditDailyRate(selectedProperty.dailyRate || 1000);
      setIsEditing(false);
    }
  }, [selectedProperty]);

  // Map database properties directly to PWA display items
  const allDisplayProperties = properties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.location || p.address,
    priceStr: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(p.receitado || p.dailyRate * 120),
    change: "+3,2%", // simulated indicator
    category: p.name.includes("Comercial") || p.id === "itaim" ? "Comercial" : "Residencial",
    imageUrl: p.imageUrl || p.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    dailyRate: p.dailyRate,
    ocupacao: p.ocupacao,
    rating: p.rating,
    status: p.status
  }));

  // Filter logic
  const filteredProperties = allDisplayProperties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.address.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeFilter === "Todos" || p.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;
    await onAddProperty({
      name: newPropName,
      address: newPropAddress,
      dailyRate: Number(newPropRate),
      ocupacao: 70,
      status: "Ativas",
      receitado: Number(newPropRate) * 100,
      rating: 4.9,
      imageUrl: newPropImageUrl
    });
    setNewPropName("");
    setNewPropAddress("");
    setNewPropRate(1200);
    setNewPropImageUrl("");
    setIsAddOpen(false);
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative h-full">
      {/* 1. Header (Title + Plus button) */}
      <div className="flex justify-between items-center mb-4">
        <h2 
          className={`font-serif text-lg font-bold text-left ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}
          style={{ fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif" }}
        >
          Propriedades
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

      {/* 2. Search bar */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
          <Search size={14} className={isDarkMode ? "text-neutral-400" : "text-stone-600"} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar propriedades"
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs transition-all focus:outline-none border ${
            isDarkMode 
              ? "bg-[#11161D] border-neutral-800 text-white focus:border-[#C8A27A]" 
              : "bg-[#FAF8F5] border-stone-200 text-amber-950 focus:border-[#A97142]"
          }`}
        />
      </div>

      {/* 3. Pills Filters */}
      <div className="flex space-x-2.5 mb-4">
        {(["Todos", "Residencial", "Comercial"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
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

      {/* 4. Horizontal Property List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-2">
        {filteredProperties.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-60">
            Nenhuma propriedade encontrada.
          </div>
        ) : (
          filteredProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                isDarkMode 
                  ? "bg-[#11161D] border-neutral-800/80 hover:bg-[#151c25]" 
                  : "bg-white border-stone-100 hover:bg-stone-50"
              }`}
            >
              {/* Left thumbnail */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-current/5">
                  <img
                    src={prop.imageUrl}
                    alt={prop.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Middle info */}
                <div className="text-left min-w-0">
                  <h4 className={`text-[11.5px] font-bold truncate ${isDarkMode ? "text-white" : "text-[#4A3C31]"}`}>
                    {prop.name}
                  </h4>
                  <p className={`text-[9px] opacity-60 truncate mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
                    {prop.address}
                  </p>
                  <p className="text-[10px] font-bold mt-1 text-[#C8A27A]">
                    {prop.priceStr}
                  </p>
                </div>
              </div>

              {/* Right change badge */}
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-emerald-500 font-mono">
                  {prop.change}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Property detail Drawer */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProperty(null)}
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
                onClick={() => setSelectedProperty(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-black/5 hover:bg-black/10 text-current"
              >
                <X size={16} />
              </button>

              {isEditing ? (
                <div className="space-y-3 mt-4 text-left">
                  <h3 className="font-serif font-bold text-base mb-3">Editar Propriedade</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-65 uppercase font-bold block">Nome da Propriedade</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className={`w-full p-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? "bg-black/40 border-neutral-800 text-white focus:border-[#C8A27A]" : "bg-white border-stone-200 text-amber-950 focus:border-[#A97142]"}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-65 uppercase font-bold block">Endereço / Localização</label>
                    <input 
                      type="text" 
                      value={editAddress} 
                      onChange={(e) => setEditAddress(e.target.value)} 
                      className={`w-full p-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? "bg-black/40 border-neutral-800 text-white focus:border-[#C8A27A]" : "bg-white border-stone-200 text-amber-950 focus:border-[#A97142]"}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-65 uppercase font-bold block">Foto da Propriedade</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editImageUrl} 
                        onChange={(e) => setEditImageUrl(e.target.value)} 
                        className={`flex-1 p-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? "bg-black/40 border-neutral-800 text-white focus:border-[#C8A27A]" : "bg-white border-stone-200 text-amber-950 focus:border-[#A97142]"}`}
                        placeholder="Link da imagem ou upload"
                      />
                      <label className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center border ${isDarkMode ? "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-750" : "bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-50"}`}>
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditImageUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                    {editImageUrl && (
                      <div className="mt-2 w-16 h-12 rounded-lg overflow-hidden border border-neutral-800/20">
                        <img src={editImageUrl} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-65 uppercase font-bold block">Tarifa Diária (R$)</label>
                    <input 
                      type="number" 
                      value={editDailyRate} 
                      onChange={(e) => setEditDailyRate(Number(e.target.value))} 
                      className={`w-full p-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? "bg-black/40 border-neutral-800 text-white focus:border-[#C8A27A]" : "bg-white border-stone-200 text-amber-950 focus:border-[#A97142]"}`}
                    />
                  </div>
                  <div className="flex gap-2.5 pt-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${isDarkMode ? "border-neutral-800 text-white hover:bg-neutral-800" : "border-stone-200 text-stone-700 hover:bg-stone-50"}`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await onUpdateProperty(selectedProperty.id, {
                          name: editName,
                          address: editAddress,
                          imageUrl: editImageUrl,
                          dailyRate: editDailyRate
                        });
                        setSelectedProperty(null);
                        setIsEditing(false);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#A97142] hover:bg-[#8e5c32]"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-serif font-bold text-base pr-8 text-left">{selectedProperty.name}</h3>
                  <p className="text-[9.5px] opacity-65 text-left mt-1">{selectedProperty.address}</p>

                  <div className="h-36 rounded-xl overflow-hidden my-4">
                    <img
                      src={selectedProperty.imageUrl}
                      alt={selectedProperty.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 mb-5 text-left">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"}`}>
                      <span className="text-[9px] uppercase tracking-wider opacity-65 font-bold block mb-1">Diária Média</span>
                      <span className="font-mono font-bold text-xs text-[#C8A27A]">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedProperty.dailyRate || 1000)}
                      </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"}`}>
                      <span className="text-[9px] uppercase tracking-wider opacity-65 font-bold block mb-1">Categoria</span>
                      <span className="font-bold text-xs">{selectedProperty.category}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold border ${isDarkMode ? "border-neutral-800 text-white bg-black/10 hover:bg-black/20" : "border-stone-200 text-[#4A3C31] bg-stone-50 hover:bg-stone-100"}`}
                    >
                      Editar Dados
                    </button>
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A97142] hover:bg-[#8e5c32] transition-all"
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add property modal */}
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

              <h2 className="font-serif font-bold text-base mb-4 text-left">Adicionar Casa</h2>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-left">
                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Nome Comercial</label>
                  <input
                    type="text"
                    required
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    placeholder="Ex: Villa Serena Beach"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    required
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    placeholder="Ex: Al. das Flamboyants, 25 - Ubatuba, SP"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                      isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Foto da Propriedade</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPropImageUrl}
                      onChange={(e) => setNewPropImageUrl(e.target.value)}
                      placeholder="Ex: https://... ou upload"
                      className={`flex-1 px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C8A27A] ${
                        isDarkMode ? "bg-black/20 border-neutral-800" : "bg-white border-stone-200"
                      }`}
                    />
                    <label className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center border ${
                      isDarkMode ? "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-750" : "bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}>
                      <span>Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewPropImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                  {newPropImageUrl && (
                    <div className="mt-2 w-16 h-12 rounded-lg overflow-hidden border border-neutral-800/20">
                      <img src={newPropImageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Valor Diária (R$)</label>
                  <input
                    type="number"
                    required
                    value={newPropRate}
                    onChange={(e) => setNewPropRate(Number(e.target.value))}
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
                    Salvar Propriedade
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
