import React from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  ShieldCheck, 
  Calendar, 
  Wrench, 
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { Property, Revenue, Expense, Booking, Maintenance, BookingStatus, ExpenseCategory } from "../types";

interface PropertyDetailsProps {
  property: Property;
  revenues: Revenue[];
  expenses: Expense[];
  bookings: Booking[];
  maintenances: Maintenance[];
  onBack: () => void;
  onOpenQuickForm: (formType: "revenue" | "expense" | "booking" | "asset" | "maintenance" | "property", defaultPropertyId: string) => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  userRole?: string;
  onUpdateProperty?: (id: string, updated: Partial<Property>) => Promise<void>;
}

export default function PropertyDetails({
  property,
  revenues,
  expenses,
  bookings,
  maintenances,
  onBack,
  onOpenQuickForm,
  onEditProperty,
  onDeleteProperty,
  userRole,
  onUpdateProperty
}: PropertyDetailsProps) {

  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(property.name);
  const [editLocation, setEditLocation] = React.useState(property.location);
  const [editDescription, setEditDescription] = React.useState(property.description);
  const [editImage, setEditImage] = React.useState(property.image || "");
  const [editRooms, setEditRooms] = React.useState(property.rooms || 0);
  const [editBathrooms, setEditBathrooms] = React.useState(property.bathrooms || 0);
  const [editGuests, setEditGuests] = React.useState(property.guests || 0);
  const [editPrice, setEditPrice] = React.useState(property.pricePerNight || 0);
  const [editSize, setEditSize] = React.useState(property.sizeSqM || 0);
  const [editStars, setEditStars] = React.useState(property.stars || 5.0);

  React.useEffect(() => {
    setEditName(property.name);
    setEditLocation(property.location);
    setEditDescription(property.description);
    setEditImage(property.image || "");
    setEditRooms(property.rooms || 0);
    setEditBathrooms(property.bathrooms || 0);
    setEditGuests(property.guests || 0);
    setEditPrice(property.pricePerNight || 0);
    setEditSize(property.sizeSqM || 0);
    setEditStars(property.stars || 5.0);
    setIsEditing(false);
  }, [property]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setEditImage(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Dynamic filter for items belonging strictly to this property
  const propRevenues = React.useMemo(() => revenues.filter(r => r.propertyId === property.id), [revenues, property.id]);
  const propExpenses = React.useMemo(() => expenses.filter(e => e.propertyId === property.id), [expenses, property.id]);
  const propBookings = React.useMemo(() => bookings.filter(b => b.propertyId === property.id), [bookings, property.id]);
  const propMaintenances = React.useMemo(() => maintenances.filter(m => m.propertyId === property.id), [maintenances, property.id]);

  // Compute stats
  const totalRevs = React.useMemo(() => propRevenues.reduce((sum, r) => sum + r.value, 0), [propRevenues]);
  const totalExps = React.useMemo(() => propExpenses.reduce((sum, e) => sum + e.value, 0), [propExpenses]);
  const netProfit = totalRevs - totalExps;
  const margin = totalRevs > 0 ? (netProfit / totalRevs) * 100 : 0;

  // Next booking
  const nextBooking = React.useMemo(() => {
    return propBookings
      .filter(b => b.status === BookingStatus.CONFIRMADA && new Date(b.checkIn) >= new Date())
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0];
  }, [propBookings]);

  // Next maintenance
  const nextMaint = React.useMemo(() => {
    return propMaintenances
      .filter(m => m.status !== "Concluída")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [propMaintenances]);

  // DRE MONTHLY COMPUTATION ENGINE
  const dreByMonth = React.useMemo(() => {
    // We will build a matrix for May 2026 and June 2026
    const months = ["2026-05", "2026-06"];
    
    return months.map(mCode => {
      const monthRevs = propRevenues.filter(r => r.date.startsWith(mCode));
      const monthExps = propExpenses.filter(e => e.date.startsWith(mCode));
      const monthBks = propBookings.filter(b => b.checkIn.startsWith(mCode));

      const receitaBruta = monthRevs.reduce((sum, r) => sum + r.value, 0);
      
      // (-) Comissões: sum booking commission
      const comissoes = monthBks.reduce((sum, b) => sum + b.commission, 0);

      // (-) Manutenção: categories inside ExpenseCategory
      const manutencao = monthExps.filter(e => e.category === ExpenseCategory.MANUTENCAO || e.category === ExpenseCategory.PISCINA || e.category === ExpenseCategory.JARDINAGEM)
                                  .reduce((sum, e) => sum + e.value, 0);

      // (-) Funcionários
      const funcionarios = monthExps.filter(e => e.category === ExpenseCategory.FUNCIONARIOS || e.category === ExpenseCategory.LIMPEZA)
                                   .reduce((sum, e) => sum + e.value, 0);

      // (-) Utilidades: Internet, Água, Energia
      const utilidades = monthExps.filter(e => e.category === ExpenseCategory.INTERNET || e.category === ExpenseCategory.AGUA || e.category === ExpenseCategory.ENERGIA)
                                  .reduce((sum, e) => sum + e.value, 0);

      // (-) Impostos
      const impostos = monthExps.filter(e => e.category === ExpenseCategory.IMPOSTOS || e.category === ExpenseCategory.TAXAS)
                                .reduce((sum, e) => sum + e.value, 0);

      // (-) Custos Operacionais / Outros
      const operacionaisOutros = monthExps.filter(e => {
        const standardCats = [
          ExpenseCategory.MANUTENCAO, ExpenseCategory.PISCINA, ExpenseCategory.JARDINAGEM,
          ExpenseCategory.FUNCIONARIOS, ExpenseCategory.LIMPEZA,
          ExpenseCategory.INTERNET, ExpenseCategory.AGUA, ExpenseCategory.ENERGIA,
          ExpenseCategory.IMPOSTOS, ExpenseCategory.TAXAS
        ];
        return !standardCats.includes(e.category);
      }).reduce((sum, e) => sum + e.value, 0);

      const totalDedutive = comissoes + manutencao + funcionarios + utilidades + impostos + operacionaisOutros;
      const lucroOperacional = receitaBruta - comissoes - operacionaisOutros;
      const lucroLiquido = receitaBruta - totalDedutive;

      const label = mCode === "2026-05" ? "Maio 2026" : "Junho 2026";

      return {
        label,
        receitaBruta,
        comissoes,
        operacionaisOutros,
        manutencao,
        funcionarios,
        utilidades,
        impostos,
        lucroOperacional,
        lucroLiquido
      };
    });
  }, [propRevenues, propExpenses, propBookings]);

  // Baseline ROI and Occupocancy (e.g. Casa Mayla is 92%, etc.)
  const baselineStats = React.useMemo(() => {
    let occupancy = 75;
    let roi = 24.7;
    if (property.id === "casa-mayla") { occupancy = 92; roi = 31.2; }
    else if (property.id === "casa-lilian") { occupancy = 85; roi = 28.4; }
    else if (property.id === "predinho") { occupancy = 80; roi = 18.5; }
    else if (property.id === "casa-nova") { occupancy = 72; roi = 22.0; }
    else if (property.id === "casa-vintage") { occupancy = 70; roi = 15.2; }
    else if (property.id === "casa-caio") { occupancy = 68; roi = 25.0; }
    else if (property.id === "casa-amado") { occupancy = 82; roi = 23.5; }

    return { occupancy, roi };
  }, [property.id]);

  // Assemble chronological activity stream/timeline
  const activityTimeline = React.useMemo(() => {
    const stream: { type: string; title: string; date: string; value?: number; tag?: string }[] = [];
    
    propRevenues.forEach(r => {
      stream.push({ type: "Receita", title: r.description, date: r.date, value: r.value, tag: r.origin });
    });
    propExpenses.forEach(e => {
      stream.push({ type: "Despesa", title: e.description, date: e.date, value: e.value, tag: e.category });
    });
    propBookings.forEach(b => {
      stream.push({ type: "Reserva", title: `Reserva - Hóspede: ${b.guestName}`, date: b.checkIn, value: b.value, tag: b.status });
    });
    propMaintenances.forEach(m => {
      stream.push({ type: "Manutenção", title: m.title, date: m.date, value: m.cost, tag: m.type });
    });

    return stream.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [propRevenues, propExpenses, propBookings, propMaintenances]);

  // Fullscreen, pinch, zoom, swipe horizontal image gallery for properties
  const PropertyImageCarousel = () => {
    const images = React.useMemo(() => [
      property.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    ], [property.image]);

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [fullscreen, setFullscreen] = React.useState(false);
    const [zoomScale, setZoomScale] = React.useState(1);

    const [isEditingPhoto, setIsEditingPhoto] = React.useState(false);
    const [photoUrlInput, setPhotoUrlInput] = React.useState(property.image || "");

    React.useEffect(() => {
      setPhotoUrlInput(property.image || "");
    }, [property.image]);

    const touchStartX = React.useRef(0);
    const touchCurrentX = React.useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      touchCurrentX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diff = touchStartX.current - touchCurrentX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < images.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else if (diff < 0 && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }
    };

    const handleNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };

    const handlePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const toggleFullscreen = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setFullscreen(!fullscreen);
      setZoomScale(1);
    };

    return (
      <>
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200/10 dark:border-slate-800 h-64 relative bg-slate-950 select-none group cursor-pointer"
        >
          <picture>
            <img 
              src={images[currentIndex]} 
              alt={`${property.name} - slide ${currentIndex + 1}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              sizes="100vw"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
          
          {/* Navigation Dots */}
          <div className="absolute top-4 left-4 flex gap-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-300">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Controls Trigger */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            {userRole === "admin" && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingPhoto(true);
                }} 
                className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 backdrop-blur-md transition-all cursor-pointer border border-amber-600/30 flex items-center gap-1 text-[10px] font-bold shadow-lg"
                title="Editar Link da Foto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                <span>Editar Foto</span>
              </button>
            )}
            <button 
              onClick={toggleFullscreen} 
              className="p-1.5 rounded-xl bg-black/45 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer border border-white/5"
              title="Ver em tela cheia"
            >
              <svg xmlns="http://www.w3.org/2050/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6-6 6-6-6 6-6z"/><path d="M9 21 3 15l6-6 6 6-6 6z"/></svg>
            </button>
          </div>

          {/* Edit photo URL input form overlay */}
          {isEditingPhoto && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center p-5 z-30 animate-fade-in"
            >
              <h5 className="text-white font-display font-bold text-sm mb-1.5 flex items-center gap-1.5">
                <span className="text-amber-400">📷</span> Editar Link da Foto
              </h5>
              <p className="text-slate-400 text-[10px] mb-3 leading-relaxed">
                Insira o link (URL) da nova imagem da propriedade para atualizar o banco de dados.
              </p>
              <input 
                type="text" 
                value={photoUrlInput} 
                onChange={(e) => setPhotoUrlInput(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700/60 p-2.5 rounded-xl text-white font-mono text-xs mb-3.5 focus:outline-none focus:border-amber-500" 
                placeholder="https://images.unsplash.com/... ou URL da imagem"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsEditingPhoto(false)} 
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    if (onUpdateProperty) {
                      await onUpdateProperty(property.id, { image: photoUrlInput });
                    }
                    setIsEditingPhoto(false);
                  }} 
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Salvar Foto
                </button>
              </div>
            </div>
          )}

          {/* Chevrons for Desktop Hover */}
          {currentIndex > 0 && (
            <button 
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ‹
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button 
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
            <h4 className="font-display font-semibold text-lg text-white">Sobre a propriedade</h4>
            <p className="text-slate-350 text-xs mt-1.5 leading-relaxed truncate max-w-xl">{property.description}</p>
          </div>
        </div>

        {/* Fullscreen view modal */}
        {fullscreen && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none animate-fade-in">
            <div className="flex justify-between items-center text-white z-10">
              <div>
                <h4 className="font-sans font-bold text-sm">{property.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono">Foto {currentIndex + 1} de {images.length}</p>
              </div>
              <button 
                onClick={() => toggleFullscreen()}
                className="p-2 w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 cursor-pointer flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden my-4">
              <div 
                className="zoomable-image-container w-full h-full"
                onDoubleClick={() => setZoomScale(prev => prev === 1 ? 2 : 1)}
              >
                <img 
                  src={images[currentIndex]} 
                  alt={`${property.name} - slide ${currentIndex + 1}`}
                  className="zoomable-image"
                  style={{ transform: `scale(${zoomScale})` }}
                />
              </div>

              {currentIndex > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev - 1); setZoomScale(1); }}
                  className="absolute left-4 w-10 h-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center cursor-pointer text-xl"
                >
                  ‹
                </button>
              )}
              {currentIndex < images.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev + 1); setZoomScale(1); }}
                  className="absolute right-4 w-10 h-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center cursor-pointer text-xl"
                >
                  ›
                </button>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-2xl border border-slate-900/80 z-10">
              <div className="flex gap-2">
                <button 
                  onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer"
                >
                  - Zoom
                </button>
                <span className="text-white text-xs font-mono flex items-center px-1">{Math.round(zoomScale * 100)}%</span>
                <button 
                  onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer"
                >
                  + Zoom
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Toque duplo para zoom rápido
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div id={`details-${property.id}`} className="space-y-6">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            id="btn-details-back"
            onClick={onBack}
            className="w-10 h-10 select-none rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-2xl text-white">{property.name}</h2>
              <span className="text-[10px] bg-accent-purple/20 text-accent-purple border border-accent-purple/30 px-2 py-0.5 rounded-full uppercase font-mono tracking-wider">
                {baselineStats.occupancy}% Ocupado
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <span>📍</span> {property.location} • 📐 {property.sizeSqM} m² • 🛏️ {property.rooms} Suítes
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap gap-2">
          {userRole === "admin" && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
              >
                Editar Imóvel
              </button>
              <button
                onClick={() => onDeleteProperty(property.id)}
                className="border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
              >
                Excluir
              </button>
            </>
          )}
          <button
            onClick={() => onOpenQuickForm("booking", property.id)}
            className="border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
          >
            + Reserva
          </button>
          <button
            onClick={() => onOpenQuickForm("maintenance", property.id)}
            className="border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all"
          >
            + Manutenção
          </button>
          <button
            onClick={() => onOpenQuickForm("expense", property.id)}
            className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all shadow-md shadow-accent-purple/20"
          >
            + Despesa
          </button>
        </div>
      </div>

      {/* Main Image Banner & Fast Specs Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PropertyImageCarousel />


        {/* Dynamic Micro Alertas & Calendars */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 select-none">
            Status Operacional
          </h3>

          <div className="space-y-4 flex-1">
            {/* Próxima Reserva Card */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Calendar size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Próxima Reserva</span>
                {nextBooking ? (
                  <div>
                    <h5 className="font-sans font-bold text-xs text-white truncate">{nextBooking.guestName}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{nextBooking.checkIn} até {nextBooking.checkOut}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">Sem reservas agendadas.</p>
                )}
              </div>
            </div>

            {/* Próxima Manutenção Card */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Wrench size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Próxima Manutenção</span>
                {nextMaint ? (
                  <div>
                    <h5 className="font-sans font-bold text-xs text-white truncate">{nextMaint.title}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{nextMaint.date} ({nextMaint.type})</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xs">Nenhuma manutenção pendente.</p>
                )}
              </div>
            </div>

            {/* Alerta de Perigo individual */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex items-start gap-3">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h6 className="font-sans font-bold text-[11px] text-slate-200">Previsão Patrimonial Kaizen</h6>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Este imóvel opera com ROI de <strong>{baselineStats.roi}%</strong>, acima do benchmark do mercado. Reduza o encargo de limpeza otimizando a lavanderia externa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 select-none">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Lucro Líquido</span>
          <strong className="text-white text-lg block mt-1">R$ {netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 select-none">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Receita Bruta</span>
          <strong className="text-emerald-400 text-lg block mt-1">R$ {totalRevs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 select-none">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Custos Totais</span>
          <strong className="text-orange-400 text-lg block mt-1">R$ {totalExps.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 select-none">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Margem Líquida</span>
          <strong className="text-accent-purple text-lg block mt-1">{margin.toFixed(1)}%</strong>
        </div>
        <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 select-none col-span-2 md:col-span-1">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Análise de ROI</span>
          <strong className="text-accent-cyan text-lg block mt-1">{baselineStats.roi}%</strong>
        </div>
      </div>

      {/* DRE Matrix Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileSpreadsheet size={16} className="text-accent-cyan" />
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Demonstração de Resultado do Exercício (DRE) Semanal / Mensal
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 font-mono text-[10px] text-slate-400 uppercase">
                <th className="py-2.5">Rubrica Contábil</th>
                {dreByMonth.map((month, index) => (
                  <th key={index} className="py-2.5 text-right">{month.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-2 text-slate-200 font-semibold">Receitas Realizadas (Vendas)</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-emerald-400 font-semibold">
                    R$ {month.receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-400">(-) Comissões Intermediárias (Airbnb/Booking)</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-red-400 font-mono">
                    - R$ {month.comissoes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-400">(-) Custos Operacionais Diversos</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-red-400 font-mono">
                    - R$ {month.operacionaisOutros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-950/40 border-t border-slate-800">
                <td className="py-2.5 font-bold text-slate-200">(=) Lucro Operacional</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2.5 text-right font-bold text-white">
                    R$ {month.lucroOperacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-400">(-) Custos de Manutenção e Conservação</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-red-400 font-mono">
                    - R$ {month.manutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-400">(-) Tarifas de Limpeza & Equipe local</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-red-400 font-mono">
                    - R$ {month.funcionarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-400">(-) Concessionárias de Utilidades (Luz, Internet, Água)</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-red-400 font-mono">
                    - R$ {month.utilidades.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-400">(-) Encargos, Taxas e Impostos do Período</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-2 text-right text-red-400 font-mono">
                    - R$ {month.impostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr className="bg-accent-purple/10 border-t-2 border-accent-purple">
                <td className="py-3 font-extrabold text-white">(=) LUCRO OPERACIONAL LÍQUIDO (Kaizen)</td>
                {dreByMonth.map((month, index) => (
                  <td key={index} className="py-3 text-right font-extrabold text-accent-cyan">
                    R$ {month.lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chronological activity list / individual cash flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Listing items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 select-none">
            Extrato de Atividades & Lançamentos
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {activityTimeline.map((item, index) => (
              <div 
                id={`timeline-item-${index}`}
                key={index}
                className="bg-slate-950/60 rounded-xl p-3 border border-slate-900 flex justify-between items-center text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono tracking-wide ${
                      item.type === "Receita" || item.type === "Reserva"
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "bg-orange-500/10 text-orange-400"
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-slate-300 font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <Clock size={10} />
                    <span>{item.date}</span>
                    {item.tag && <span>• {item.tag}</span>}
                  </div>
                </div>

                <strong className={`font-mono ${
                  item.type === "Receita" || item.type === "Reserva" ? "text-emerald-400" : "text-white"
                }`}>
                  {item.type === "Receita" || item.type === "Reserva" ? "+" : "-"} R$ {item.value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>
              </div>
            ))}

            {activityTimeline.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-6">Nenhum lançamento catalogado para este imóvel.</p>
            )}
          </div>
        </div>

        {/* Quick Analytics Advices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 select-none">
              Aconselhamento Select Sensei
            </h3>

            <div className="space-y-3 pt-2 text-xs text-slate-300 leading-relaxed">
              <p>
                Este painel individual consolida todas as informações do imóvel **{property.name}**.
              </p>
              <p>
                A partir da análise das receitas consolidadas de **R$ {totalRevs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}** com despesas operacionais amortizadas em **R$ {totalExps.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}**, percebe-se que as margens operacionais encontram-se altamente competitivas no mercado regional!
              </p>
              <p>
                **Recomendações Práticas Kaizen**:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                <li>Preserve os preços Premium. Sua taxa de ocupação de {baselineStats.occupancy}% sugere alta elasticidade do valor da diária.</li>
                <li>Monitore as despesas de **Utilidades** (energia). O ar-condicionado é a principal drenagem elétrica.</li>
                <li>Automatize vistorias preventivas nas datas vagas para evitar manutenções de emergência caras.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onOpenQuickForm("expense", property.id)}
            className="w-full mt-4 bg-slate-950 border border-slate-800 hover:bg-slate-800/80 text-white rounded-lg py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            Lançar Despesa Imediata
          </button>
        </div>

      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar relative">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-950 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer font-bold border border-slate-800"
            >
              ✕
            </button>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Editar Informações da Propriedade</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Altere dados cadastrais, técnicos e de precificação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Nome da Propriedade</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-amber-500" 
                  placeholder="Nome"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Localização</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-amber-500" 
                  placeholder="ex: São Sebastião, SP"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Preço por Noite / Diária (R$)</label>
                <input 
                  type="number" 
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Tamanho (m²)</label>
                <input 
                  type="number" 
                  value={editSize}
                  onChange={(e) => setEditSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2 col-span-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Quartos / Suítes</label>
                  <input 
                    type="number" 
                    value={editRooms}
                    onChange={(e) => setEditRooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Banheiros</label>
                  <input 
                    type="number" 
                    value={editBathrooms}
                    onChange={(e) => setEditBathrooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase">Hóspedes Máx.</label>
                  <input 
                    type="number" 
                    value={editGuests}
                    onChange={(e) => setEditGuests(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Avaliação (0 a 5)</label>
                <input 
                  type="number" 
                  step="0.05"
                  min="0"
                  max="5"
                  value={editStars}
                  onChange={(e) => setEditStars(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Foto da Propriedade (Link ou Imagem Local)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500" 
                    placeholder="https://... ou imagem convertida em Base64"
                  />
                  <label className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 border border-slate-750 select-none">
                    <span>📁</span> Local
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {editImage && (
                <div className="col-span-2 mt-1">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">Pré-visualização</span>
                  <div className="h-28 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase">Descrição</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-sans text-xs focus:outline-none focus:border-amber-500 h-20" 
                  placeholder="Descreva o imóvel..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if (onUpdateProperty) {
                    await onUpdateProperty(property.id, {
                      name: editName,
                      location: editLocation,
                      description: editDescription,
                      image: editImage,
                      rooms: editRooms,
                      bathrooms: editBathrooms,
                      guests: editGuests,
                      pricePerNight: editPrice,
                      sizeSqM: editSize,
                      stars: editStars
                    });
                  }
                  setIsEditing(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
