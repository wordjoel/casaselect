import React from "react";
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingDown,
  TrendingUp,
  Wrench, 
  Users, 
  BarChart3, 
  Sparkles, 
  FileText, 
  Settings, 
  Boxes,
  ChevronDown,
  ChevronUp,
  Percent,
  Smartphone,
  PieChart,
  Megaphone,
  UserCheck,
  ClipboardList,
  Globe,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobilePWA: () => void;
  darkMode?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
}

export function LiStaysLogo({ className = "w-10 h-10 shrink-0" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-full bg-[#FFFDF9] border border-[#E6C687] flex items-center justify-center shrink-0 ${className}`}>
      <img 
        src="/logo.jpg" 
        alt="L | STAYS Emblem" 
        className="w-[180%] max-w-none h-auto object-cover object-left"
        style={{ marginLeft: "-4%" }}
      />
    </div>
  );
}

export default function Sidebar({ activeTab, setActiveTab, onOpenMobilePWA, darkMode = true, isOpen = false, onClose, userRole }: SidebarProps) {
  const [financeOpen, setFinanceOpen] = React.useState(true);
  const [isPWA, setIsPWA] = React.useState(false);

  // Swipe gesture detection
  const touchStartX = React.useRef(0);
  const touchCurrentX = React.useRef(0);

  React.useEffect(() => {
    const checkPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsPWA(checkPWA);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    const diffX = touchStartX.current - touchCurrentX.current;
    if (diffX > 50 && onClose) {
      onClose();
    }
  };

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "reservas", label: "Reservas", icon: ClipboardList },
    { id: "guests", label: "Hóspedes", icon: UserCheck },
    { id: "properties", label: "Propriedades", icon: Building2 },
    { id: "calendar", label: "Calendário", icon: Calendar },
  ];

  const financeSubItems = [
    { id: "revenues", label: "Receitas", icon: TrendingUp },
    { id: "expenses", label: "Despesas", icon: TrendingDown },
    { id: "maintenance", label: "Manutenções", icon: Wrench },
    { id: "suppliers", label: "Fornecedores", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  const bottomNavItems = [
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "website", label: "Website de Reservas", icon: Globe, badge: "SITE" },
    { id: "ai-bot", label: "LI Concierge AI", icon: Sparkles, badge: "AI" },
    { id: "documents", label: "Documentos", icon: FileText },
    ...(userRole === "admin" ? [{ id: "settings", label: "Configurações", icon: Settings }] : []),
  ];

  const renderNavButton = (item: { id: string; label: string; icon: React.ElementType; badge?: string }, indented = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        id={`nav-item-${item.id}`}
        onClick={() => {
          setActiveTab(item.id);
          if (onClose) onClose();
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium cursor-pointer ${
          indented ? "ml-6 w-[calc(100%-1.5rem)]" : ""
        } ${
          isActive 
            ? "bg-accent-purple/15 text-[#C8A27A] border border-[#C8A27A]/30 font-semibold" 
            : "text-slate-400 hover:text-slate-200"
        }`}
        style={{
          boxShadow: isActive ? "0 0 12px rgba(200, 162, 122, 0.15)" : "none"
        }}
      >
        <div className="flex items-center gap-3">
          <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? "text-[#C8A27A]" : "text-slate-500"} />
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className="font-sans font-bold bg-[#C8A27A] text-[7.5px] text-[#111111] px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Drawer Overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-45 md:hidden drawer-backdrop"
        />
      )}
      
      <aside 
        id="sidebar-container" 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`flex flex-col justify-between h-screen select-none transition-transform duration-300
          fixed md:sticky top-0 left-0 z-50 md:z-30 shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-[280px] max-w-[80%] md:w-[260px] md:max-w-none
          drawer-container md:drawer-container-none
        `}
        style={{
          borderRadius: isOpen ? "0 24px 24px 0" : "0",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-slate-900/40 select-none relative">
          {/* Close button for drawer on mobile */}
          {isOpen && (
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              <X size={16} />
            </button>
          )}

          <div className="mb-3">
            <LiStaysLogo className="w-14 h-14 shrink-0 filter drop-shadow-[0_4px_12px_rgba(200,162,122,0.15)]" />
          </div>
          <h1 className="font-display font-extrabold text-base tracking-[0.18em] text-[#C8A27A] leading-none">
            LI STAYS
          </h1>
          <p className="text-[8px] uppercase tracking-[0.3em] text-[#A97142] font-bold mt-2">
            OPERATING SYSTEM
          </p>
        </div>

        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 pb-1.5 select-none">
            Workspace
          </div>
          
          {mainNavItems.map((item) => renderNavButton(item))}

          {/* Collapsible Finance Section */}
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <DollarSign size={17} strokeWidth={1.8} className="text-slate-500" />
                <span>Financeiro</span>
              </div>
              {financeOpen ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
            </button>
            {financeOpen && (
              <div className="space-y-0.5">
                {financeSubItems.map((item) => renderNavButton(item, true))}
              </div>
            )}
          </div>

          <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-650 px-3 pt-3 pb-1 select-none">
            Operações & IA
          </div>

          {bottomNavItems.map((item) => renderNavButton(item))}
          {!isPWA && renderNavButton({ id: "pwa-sim", label: "Central Mobile (PWA)", icon: Smartphone })}
        </div>
      </aside>
    </>
  );
}
