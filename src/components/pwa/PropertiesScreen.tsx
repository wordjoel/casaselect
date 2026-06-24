import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Star, Plus, X, Settings } from "lucide-react";
import { Property } from "./types";

interface PropertiesScreenProps {
  key?: string;
  properties: Property[];
  onAddProperty: (newProp: Omit<Property, "id">) => Promise<void>;
  onUpdateProperty: (id: string, updated: Partial<Property>) => Promise<void>;
  isDarkMode: boolean;
  userRole?: string;
}

export default function PropertiesScreen({ properties, onAddProperty, onUpdateProperty, isDarkMode, userRole }: PropertiesScreenProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todas" | "Ativas" | "Inativas">("Todas");
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);

  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState("");

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDailyRate, setEditDailyRate] = useState(1200);
  const [editOccupancy, setEditOccupancy] = useState(70);
  const [editRating, setEditRating] = useState(4.8);
  const [editImageUrl, setEditImageUrl] = useState("");

  const activeProperty = properties.find(p => p.id === selectedPropId);

  // Sync states when activeProperty changes
  React.useEffect(() => {
    if (activeProperty) {
      setPhotoUrlInput(activeProperty.imageUrl || "");
      setIsEditingPhoto(false);

      setEditName(activeProperty.name || "");
      setEditAddress(activeProperty.address || "");
      setEditDailyRate(activeProperty.dailyRate || 1200);
      setEditOccupancy(activeProperty.ocupacao || 70);
      setEditRating(activeProperty.rating || 4.8);
      setEditImageUrl(activeProperty.imageUrl || "");
      setIsEditingInfo(false);
    }
  }, [selectedPropId, activeProperty?.id]);

  const handlePWAImageUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: "photoUrlInput" | "editImageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        const MAX_DIM = 1000;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          if (targetField === "photoUrlInput") {
            setPhotoUrlInput(compressedBase64);
          } else {
            setEditImageUrl(compressedBase64);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // New property form state
  const [newPropName, setNewPropName] = useState("");
  const [newPropAddress, setNewPropAddress] = useState("");
  const [newPropRate, setNewPropRate] = useState(1200);
  const [newPropOccupancy, setNewPropOccupancy] = useState(70);
  const [newPropStatus, setNewPropStatus] = useState<"Ativas" | "Inativas">("Ativas");

  // Filter logic
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Todas" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;
    await onAddProperty({
      name: newPropName,
      address: newPropAddress,
      dailyRate: Number(newPropRate),
      ocupacao: Number(newPropOccupancy),
      status: newPropStatus,
      receitado: 0,
      rating: 4.8 + Number((Math.random() * 0.2).toFixed(1)), // random beautiful rating between 4.8 and 5.0
      imageUrl: "" // let backend pick standard placeholder
    });
    // Reset form
    setNewPropName("");
    setNewPropAddress("");
    setNewPropRate(1200);
    setNewPropOccupancy(70);
    setIsAddOpen(false);
  };

  const togglePropertyStatus = async (id: string, currentStatus: "Ativas" | "Inativas") => {
    const nextStatus = currentStatus === "Ativas" ? "Inativas" : "Ativas";
    await onUpdateProperty(id, { status: nextStatus });
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-3 relative h-full">
      {/* Header bar */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-display font-bold text-xl leading-snug">Propriedades</h2>
          <p className="text-[10px] opacity-60">Gerencie salas, casas e estúdios agregados</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="p-2 rounded-full cursor-pointer bg-gradient-to-r from-[#C29438] to-[#916B21] text-white hover:opacity-90 shadow-sm"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Styled Search Input bar */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-55">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar propriedades por nome..."
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium focus:outline-none transition border ${
            isDarkMode 
              ? "bg-[#1C1C1E] border-neutral-800 text-white focus:border-[#C59B27]" 
              : "bg-white border-amber-100 text-amber-950 focus:border-[#A57C1B]"
          }`}
        />
      </div>

      {/* Stateful pills selector to filter */}
      <div className="flex space-x-2 mb-4">
        {(["Todas", "Ativas", "Inativas"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              statusFilter === tab
                ? "bg-[#C59B27] text-white"
                : isDarkMode
                ? "bg-neutral-900 border border-neutral-800 text-neutral-400"
                : "bg-amber-100/50 border border-amber-200/50 text-amber-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Properties scroll list */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-4">
        {filteredProperties.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-60">
            Nenhuma propriedade encontrada com estes filtros.
          </div>
        ) : (
          filteredProperties.map((prop) => (
            <motion.div
              layoutId={`prop-card-${prop.id}`}
              key={prop.id}
              onClick={() => setSelectedPropId(prop.id)}
              className={`rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-md ${
                isDarkMode ? "bg-[#1C1C1E] border-neutral-800" : "bg-white border-amber-100"
              }`}
            >
              {/* Photo wrapper */}
              <div className="relative h-44 w-full">
                <img
                  src={prop.imageUrl}
                  alt={prop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15 flex flex-col justify-between p-3">
                  {/* Top bar indicators inside image */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full text-white tracking-wide uppercase ${
                      prop.status === "Ativas" ? "bg-green-600/90" : "bg-neutral-500/90"
                    }`}>
                      {prop.status === "Ativas" ? "Ativa" : "Inativa"}
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] bg-black/50 text-[#C59B27] border border-[#C59B27]/45 px-2 py-0.5 rounded-full backdrop-blur-sm font-bold font-mono">
                      <Star size={10} className="fill-[#C59B27] text-[#C59B27]" />
                      <span>{prop.rating}</span>
                    </span>
                  </div>

                  {/* Name and address on card bottom */}
                  <div>
                    <h3 className="text-white font-display font-bold text-base drop-shadow-sm">{prop.name}</h3>
                    <p className="text-white/80 text-[10px] flex items-center space-x-1 mt-0.5 font-sans truncate">
                      <MapPin size={10} className="text-amber-400" />
                      <span>{prop.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Data numbers below cover */}
              <div className="p-3.5 flex justify-between items-center text-xs">
                {/* Total Received */}
                <div>
                  <span className={`text-[9px] tracking-wider uppercase block font-semibold mb-0.5 ${isDarkMode ? "opacity-65" : "text-stone-600 font-bold"}`}>Faturamento</span>
                  <span className="font-mono font-bold text-sm">{formatBRL(prop.receitado)}</span>
                </div>

                {/* Occupancy circular bar simulation */}
                <div className="w-1/2 max-w-[130px] text-right">
                  <div className={`flex justify-between text-[9px] font-semibold mb-1 ${isDarkMode ? "opacity-65" : "text-stone-600 font-bold"}`}>
                    <span>Taxa de Ocupação</span>
                    <span className="font-mono">{prop.ocupacao}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${prop.ocupacao}%` }} 
                      className="h-full bg-gradient-to-r from-[#C29438] to-[#916B21] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL DRAWER: Property Info details card (Animates slide-up) */}
      <AnimatePresence>
        {selectedPropId && activeProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPropId(null)}
            className="absolute inset-0 bg-black/60 z-30 flex items-end rounded-2xl overflow-hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-h-[85%] rounded-t-2xl p-5 overflow-y-auto no-scrollbar relative ${
                isDarkMode ? "bg-zinc-950 text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              {/* Close Button top center */}
              <button 
                onClick={() => setSelectedPropId(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-black/10 hover:bg-black/20"
              >
                <X size={18} />
              </button>

              <div className="font-display font-bold text-lg pr-8">{activeProperty.name}</div>
              <p className="text-[11px] opacity-60 flex items-center space-x-1 mt-1 font-sans">
                <MapPin size={11} className="text-[#C59B27]" />
                <span>{activeProperty.address}</span>
              </p>
              {userRole === "admin" && (
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="mt-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                >
                  📝 Editar Informações
                </button>
              )}

              {/* Cover cover picture inside detail */}
              <div className="h-40 rounded-xl overflow-hidden my-4 relative">
                <img
                  src={activeProperty.imageUrl}
                  alt={activeProperty.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {userRole === "admin" && (
                  <button
                    onClick={() => setIsEditingPhoto(true)}
                    className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black text-[#C59B27] px-2.5 py-1.5 rounded-xl border border-neutral-800 shadow-md backdrop-blur-sm cursor-pointer z-10 text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>📷</span> Alterar Foto
                  </button>
                )}
              </div>

              {isEditingPhoto && userRole === "admin" && (
                <div className={`p-3.5 rounded-xl border mb-4 font-sans ${isDarkMode ? "bg-neutral-900/80 border-neutral-800 text-white" : "bg-white border-amber-200 text-amber-950"}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27] mb-2">Editar Imagem (Link ou Local)</div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      placeholder="https://..."
                      className={`flex-1 p-2 rounded-lg text-xs font-mono focus:outline-none border ${
                        isDarkMode
                          ? "bg-[#1C1C1E] border-neutral-800 text-white focus:border-[#C59B27]"
                          : "bg-white border-amber-100 text-amber-950 focus:border-[#A57C1B]"
                      }`}
                    />
                    <label className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0 border ${
                      isDarkMode ? "bg-neutral-800 border-neutral-750 text-white" : "bg-amber-100/50 border-amber-200 text-amber-905"
                    } select-none`}>
                      <span>📁</span> Local
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handlePWAImageUpload(e, "photoUrlInput")} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {photoUrlInput && (
                    <div className="mb-3">
                      <span className="text-[9px] opacity-60 font-mono block uppercase mb-1">Pré-visualização</span>
                      <div className="h-24 w-full rounded-lg overflow-hidden border border-neutral-800/40 bg-[#0D1625]">
                        <img src={photoUrlInput} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => setIsEditingPhoto(false)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-500/40 text-neutral-450 hover:opacity-80 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await onUpdateProperty(activeProperty.id, { imageUrl: photoUrlInput });
                        setIsEditingPhoto(false);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C29438] to-[#916B21] text-white font-bold hover:brightness-110 shadow-sm"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {isEditingInfo && userRole === "admin" && (
                <div className={`p-4 rounded-xl border mb-4 font-sans space-y-3 ${isDarkMode ? "bg-neutral-900/80 border-neutral-800 text-white" : "bg-white border-amber-200 text-amber-950"}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27] border-b border-neutral-800/20 pb-1">Editar Informações</div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] opacity-60 font-mono uppercase">Nome</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full p-2 rounded-lg text-xs focus:outline-none border ${
                        isDarkMode ? "bg-[#1C1C1E] border-neutral-800 text-white" : "bg-white border-amber-100 text-amber-950"
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] opacity-60 font-mono uppercase">Endereço</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className={`w-full p-2 rounded-lg text-xs focus:outline-none border ${
                        isDarkMode ? "bg-[#1C1C1E] border-neutral-800 text-white" : "bg-white border-amber-100 text-amber-950"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] opacity-60 font-mono uppercase">Diária (R$)</label>
                      <input
                        type="number"
                        value={editDailyRate}
                        onChange={(e) => setEditDailyRate(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg text-xs font-mono focus:outline-none border ${
                          isDarkMode ? "bg-[#1C1C1E] border-neutral-800 text-white" : "bg-white border-amber-100 text-amber-950"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] opacity-60 font-mono uppercase">Ocupação (%)</label>
                      <input
                        type="number"
                        value={editOccupancy}
                        onChange={(e) => setEditOccupancy(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg text-xs font-mono focus:outline-none border ${
                          isDarkMode ? "bg-[#1C1C1E] border-neutral-800 text-white" : "bg-white border-amber-100 text-amber-950"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[9px] opacity-60 font-mono uppercase">Avaliação</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editRating}
                        onChange={(e) => setEditRating(Number(e.target.value))}
                        className={`w-full p-2 rounded-lg text-xs font-mono focus:outline-none border ${
                          isDarkMode ? "bg-[#1C1C1E] border-neutral-800 text-white" : "bg-white border-amber-100 text-amber-950"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] opacity-60 font-mono uppercase">Foto da Propriedade (Link ou Imagem Local)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className={`flex-1 p-2 rounded-lg text-xs font-mono focus:outline-none border ${
                          isDarkMode ? "bg-[#1C1C1E] border-neutral-800 text-white" : "bg-white border-amber-100 text-amber-950"
                        }`}
                        placeholder="https://... ou Base64"
                      />
                      <label className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0 border ${
                        isDarkMode ? "bg-neutral-800 border-neutral-750 text-white" : "bg-amber-100/50 border-amber-250 text-amber-905"
                      } select-none`}>
                        <span>📁</span> Local
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePWAImageUpload(e, "editImageUrl")} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {editImageUrl && (
                    <div className="mt-1">
                      <span className="text-[9px] opacity-60 font-mono block uppercase mb-1">Pré-visualização</span>
                      <div className="h-24 w-full rounded-lg overflow-hidden border border-neutral-800/40 bg-neutral-950">
                        <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 text-xs pt-1">
                    <button
                      onClick={() => setIsEditingInfo(false)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-500/40 text-neutral-450 hover:opacity-80 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await onUpdateProperty(activeProperty.id, {
                          name: editName,
                          address: editAddress,
                          dailyRate: editDailyRate,
                          ocupacao: editOccupancy,
                          rating: editRating,
                          imageUrl: editImageUrl
                        });
                        setIsEditingInfo(false);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#C29438] to-[#916B21] text-white font-bold hover:brightness-110 shadow-sm"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* Property specific metrics stats */}
              <div className="grid grid-cols-2 gap-3.5 mb-5 font-sans">
                <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-amber-200/40"}`}>
                  <span className="text-[9px] uppercase tracking-wider opacity-65 font-bold block mb-1">Média Diária</span>
                  <span className="font-mono font-bold text-sm tracking-tight">{formatBRL(activeProperty.dailyRate)} / noite</span>
                </div>
                <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-amber-200/40"}`}>
                  <span className="text-[9px] uppercase tracking-wider opacity-65 font-bold block mb-1">Status Operacional</span>
                  <span className={`font-semibold text-xs tracking-wide uppercase px-2 py-0.5 rounded ${
                    activeProperty.status === "Ativas" ? "bg-green-500/10 text-green-500" : "bg-neutral-500/10 text-neutral-400"
                  }`}>
                    {activeProperty.status === "Ativas" ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>

              {/* Action buttons inside detail */}
              <div className="space-y-3.5 pt-2 border-t border-neutral-800/10 dark:border-white/10 font-sans">
                <button
                  type="button"
                  onClick={() => togglePropertyStatus(activeProperty.id, activeProperty.status)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold cursor-pointer flex justify-center items-center space-x-2 border ${
                    activeProperty.status === "Ativas"
                      ? "border-amber-600/30 text-amber-600 hover:bg-amber-600/10"
                      : "border-green-600/30 text-green-600 hover:bg-green-600/10"
                  }`}
                >
                  <Settings size={14} />
                  <span>{activeProperty.status === "Ativas" ? "Pausar Operação (Inativar)" : "Ativar Operação"}</span>
                </button>

                <button
                  onClick={() => setSelectedPropId(null)}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide text-white bg-gradient-to-r from-[#C29438] to-[#916B21] hover:brightness-110 shadow"
                >
                  Voltar ao Painel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL SHEET: Adicionar nova propriedade (Animates slide-up) */}
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
                isDarkMode ? "bg-zinc-950 text-white" : "bg-[#FAF8F5] text-amber-950"
              }`}
            >
              {/* Force header handle */}
              <div className="absolute right-4 top-4 p-1 cursor-pointer" onClick={() => setIsAddOpen(false)}>
                <X size={18} />
              </div>

              <h2 className="font-display font-bold text-lg mb-4">Adicionar Casa</h2>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Nome Comercial</label>
                  <input
                    type="text"
                    required
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    placeholder="Ex: Villa Serena Beach"
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                      isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
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
                    className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                      isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Valor Diária (R$)</label>
                    <input
                      type="number"
                      required
                      value={newPropRate}
                      onChange={(e) => setNewPropRate(Number(e.target.value))}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block tracking-wider font-semibold uppercase opacity-75 mb-1">Ocupação Inicial (%)</label>
                    <input
                      type="number"
                      required
                      max="100"
                      min="0"
                      value={newPropOccupancy}
                      onChange={(e) => setNewPropOccupancy(Number(e.target.value))}
                      className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:border-[#C59B27] ${
                        isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-amber-200/50"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block tracking-wide font-semibold opacity-75 mb-2 uppercase">Status de Operação</label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setNewPropStatus("Ativas")}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                        newPropStatus === "Ativas"
                          ? "bg-green-600/10 border-green-500 text-green-500"
                          : "border-neutral-500/20 text-neutral-400"
                      }`}
                    >
                      Em Operação (Ativa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPropStatus("Inativas")}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                        newPropStatus === "Inativas"
                          ? "bg-neutral-500/15 border-neutral-600 text-neutral-400"
                          : "border-neutral-500/20 text-neutral-400"
                      }`}
                    >
                      Pausado (Inativo)
                    </button>
                  </div>
                </div>

                <div className="pt-3.5">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-xs font-semibold tracking-wide text-white uppercase bg-gradient-to-r from-[#C29438] to-[#916B21] hover:brightness-110 shadow-lg cursor-pointer"
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
