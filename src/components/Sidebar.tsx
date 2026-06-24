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

export function KobayashiLogo({ darkMode, className = "w-10 h-10 shrink-0" }: { darkMode: boolean; className?: string }) {
  const goldColor = "#dfb26c";
  const brandColor = darkMode ? goldColor : "#b89047";

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Shield */}
      <path
        d="M 50 14 L 80 22 L 80 56 C 80 72, 62 82, 50 86 C 38 82, 20 72, 20 56 L 20 22 Z"
        stroke={brandColor}
        strokeWidth="4.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Intertwined CS Monogram */}
      <g transform="translate(0, 3)">
        {/* C letter */}
        <text
          x="38"
          y="62"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="42"
          fontWeight="900"
          fill={brandColor}
          textAnchor="middle"
        >
          C
        </text>
        {/* S letter */}
        <text
          x="59"
          y="66"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="42"
          fontWeight="900"
          fill={brandColor}
          textAnchor="middle"
        >
          S
        </text>
      </g>
    </svg>
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
    // Swipe left to close menu
    if (diffX > 50 && onClose) {
      onClose();
    }
  };

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "properties", label: "Propriedades", icon: Building2 },
    { id: "calendar", label: "Calendário", icon: Calendar },
  ];

  const financeSubItems = [
    { id: "expenses", label: "Despesas", icon: TrendingDown },
    { id: "revenues", label: "Receitas", icon: TrendingUp },
  ];

  const bottomNavItems = [
    { id: "assets", label: "Ativos", icon: Boxes },
    { id: "maintenance", label: "Manutenções", icon: Wrench },
    { id: "suppliers", label: "Fornecedores", icon: Users },
    { id: "income-tax", label: "Imposto de Renda", icon: Percent },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
    { id: "ai-bot", label: "IA SelectSENSEI", icon: Sparkles, badge: "BETA" },
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
            ? "bg-accent-purple/15 text-white font-semibold" 
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? "text-white" : "text-slate-500"} />
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className="font-sans font-bold bg-[#b89047] text-[7px] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm shadow-amber-950/25">
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

          <div className="mb-4">
            <KobayashiLogo darkMode={darkMode} className="w-16 h-16 shrink-0 filter drop-shadow-[0_4px_12px_rgba(223,178,108,0.2)]" />
          </div>
          <h1 className="font-display font-extrabold text-base tracking-[0.15em] text-[#dfb26c] leading-none">
            CASA SELECT
          </h1>
          <p className="text-[8px] uppercase tracking-[0.25em] text-[#dfb26c]/70 font-bold mt-2">
            MANAGEMENT
          </p>
        </div>

        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 pb-1.5 select-none">
            Workspace
          </div>
          {mainNavItems.map((item) => renderNavButton(item))}

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

          {bottomNavItems.map((item) => renderNavButton(item))}
          {!isPWA && renderNavButton({ id: "meu-app", label: "Meu Aplicativo", icon: Smartphone })}
          {!isPWA && userRole === "admin" && renderNavButton({ id: "pwa-sim", label: "Central Mobile (PWA)", icon: Smartphone })}
        </div>
      </aside>
    </>
  );
}
