import React from "react";
import { 
  Building2, 
  Sparkles, 
  Search, 
  Bell, 
  Percent, 
  Trash2, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Wrench, 
  Users, 
  BarChart3, 
  Smartphone, 
  FileText, 
  Settings, 
  Home, 
  Boxes,
  HelpCircle,
  TrendingUp,
  Sliders,
  Check,
  AlertTriangle,
  ChevronDown,
  Clock,
  Info,
  Sun,
  Moon,
  Wallet,
  Menu,
  Droplet,
  Wind,
  Bug,
  Paintbrush,
  AlertCircle,
  CheckCircle2,
  Zap,
  CalendarDays,
  X,
  TrendingDown,
  Trophy
} from "lucide-react";
import { getProperties, getRevenues, getExpenses, getBookings, getAssets, getMaintenances, getSuppliers, getDocuments, changePassword, setSessionToken } from "./data/api";
import Sidebar from "./components/Sidebar";
import KPICards from "./components/KPICards";
import PropertyDetails from "./components/PropertyDetails";
import { OCRScanner } from "./components/OCRScanner";
import SenseiChat from "./components/SenseiChat";
import GuestsCRM from "./components/GuestsCRM";
import ReservasView from "./components/ReservasView";
import FinanceiroView from "./components/FinanceiroView";
import MarketingView from "./components/MarketingView";
import { PublicVitrine } from "./components/PublicVitrine";
const CommandCenter = React.lazy(() => import("./components/CommandCenter"));
const ForecastView = React.lazy(() => import("./components/ForecastView"));
const PWASimulator = React.lazy(() => import("./components/PWASimulator"));
const IncomeTaxView = React.lazy(() => import("./components/IncomeTaxView"));
import { LoginScreen } from "./components/LoginScreen";
import { CEOCockpit } from "./components/CEOCockpit";
import PWAPersonalizado from "./components/PWAPersonalizado";
import DocumentsModule from "./components/DocumentsModule";
import { 
  getAlerts,
  addProperty, addRevenue, addExpense, addBooking, addAsset, addMaintenance, deleteExpense,
  updateProperty, deleteProperty, updateRevenue, deleteRevenue, updateExpense, updateBooking, deleteBooking,
  updateAsset, deleteAsset, updateMaintenance, deleteMaintenance, addSupplier, updateSupplier, deleteSupplier,
  addDocument, updateDocument, deleteDocument, sendWhatsAppMessage, getWhatsAppSettings, saveWhatsAppSettings
} from "./data/api";
import { Property, Revenue, Expense, Booking, Asset, Maintenance, SystemAlert, PropertyOrigin, ExpenseCategory, AssetCategory, BookingStatus, MaintenanceStatus, MaintenanceType, Supplier, Document, User } from "./types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, PieChart, Pie } from "recharts";

// ─── Property Carousel Hook ─────────────────────────────────────────
function usePropertyCarousel(total: number, autoMs = 4000) {
  const [idx, setIdx] = React.useState(0);
  const [dir, setDir] = React.useState<"next" | "prev">("next");
  const [animating, setAnimating] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const go = React.useCallback((nextIdx: number, direction: "next" | "prev") => {
    if (animating || total === 0) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setIdx(nextIdx);
      setAnimating(false);
    }, 320);
  }, [animating, total]);

  const next = React.useCallback(() => {
    go((idx + 1) % total, "next");
  }, [go, idx, total]);

  const prev = React.useCallback(() => {
    go((idx - 1 + total) % total, "prev");
  }, [go, idx, total]);

  const goTo = React.useCallback((i: number) => {
    go(i, i > idx ? "next" : "prev");
  }, [go, idx]);

  // Auto-advance
  React.useEffect(() => {
    if (total < 2) return;
    timerRef.current = setInterval(next, autoMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, total, autoMs]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { if (total < 2) return; timerRef.current = setInterval(next, autoMs); };

  return { idx, dir, animating, next, prev, goTo, pause, resume };
}

export default function App() {
  const [activeTab, setActiveTab] = React.useState<string>("dashboard");
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [showDownloadModal, setShowDownloadModal] = React.useState<boolean>(false);

  // Check if URL matches /pwa/ceo, /pwa/comercial, /pwa/financeiro, or /pwa/administrativo
  const [pwaRole, setPwaRole] = React.useState<"ceo" | "comercial" | "financeiro" | "administrativo" | null>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith("/pwa/")) {
      const role = path.split("/")[2];
      if (["ceo", "comercial", "financeiro", "administrativo"].includes(role)) {
        return role as any;
      }
    }
    return null;
  });

  const [isMobilePwaRoute, setIsMobilePwaRoute] = React.useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    return path === "/pwa" || path === "/pwa/" || path === "/mobile" || path === "/mobile/";
  });

  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      setIsMobilePwaRoute(path === "/pwa" || path === "/pwa/" || path === "/mobile" || path === "/mobile/");
      if (path.startsWith("/pwa/")) {
        const role = path.split("/")[2];
        if (["ceo", "comercial", "financeiro", "administrativo"].includes(role)) {
          setPwaRole(role as any);
          return;
        }
      }
      setPwaRole(null);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Default tab is dashboard for all desktop users
  const [showPasswordChange, setShowPasswordChange] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordChangeMessage, setPasswordChangeMessage] = React.useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const [headerExpanded, setHeaderExpanded] = React.useState(false);
  const [isPWA, setIsPWA] = React.useState(false);
  React.useEffect(() => {
    const checkPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsPWA(checkPWA);
  }, []);

  const [currentClockTime, setCurrentClockTime] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentClockTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Database lists
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [revenues, setRevenues] = React.useState<Revenue[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [maintenances, setMaintenances] = React.useState<Maintenance[]>([]);
  const [alerts, setAlerts] = React.useState<SystemAlert[]>([]);
  
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [documents, setDocuments] = React.useState<Document[]>([]);

  // Edit states for CRUD operations
  const [editingProperty, setEditingProperty] = React.useState<Property | null>(null);
  const [editingRevenue, setEditingRevenue] = React.useState<Revenue | null>(null);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [editingMaintenance, setEditingMaintenance] = React.useState<Maintenance | null>(null);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [editingDocument, setEditingDocument] = React.useState<Document | null>(null);
  const [editingReminderId, setEditingReminderId] = React.useState<string | null>(null);

  // Settings states
  const [companyName, setCompanyName] = React.useState<string>(() => localStorage.getItem("select_company_name") || "LI STAYS OS");
  const [defaultCurrency, setDefaultCurrency] = React.useState<string>(() => localStorage.getItem("select_default_currency") || "BRL");
  const [systemLanguage, setSystemLanguage] = React.useState<string>(() => localStorage.getItem("select_system_language") || "pt-BR");

  // Search filter
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorHeader, setErrorHeader] = React.useState<string | null>(null);

  // Custom Calendar state
  const [selectedDay, setSelectedDay] = React.useState<number>(11); // default June 11th
  const [selectedMonth, setSelectedMonth] = React.useState<number>(6); // June
  const [selectedYear, setSelectedYear] = React.useState<number>(2026);
  const [reminders, setReminders] = React.useState<{
    id: string;
    title: string;
    guestName: string;
    phone: string;
    time: string;
    day: number;
    month: number;
    year: number;
    description: string;
  }[]>(() => {
    const saved = localStorage.getItem("select_reminders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default mock reminders
    return [
      { id: "rem-1", title: "Inspeção Geral do Quadro", guestName: "Eletricista Roberto", phone: "+5511999998888", time: "10:00", day: 12, month: 6, year: 2026, description: "Fazer o teste de carga preventiva no quadro de luz." },
      { id: "rem-2", title: "Dedetização Geral", guestName: "Dedetizadora Clean", phone: "+5511977776666", time: "14:30", day: 20, month: 6, year: 2026, description: "Serviço programado contra pragas." }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem("select_reminders", JSON.stringify(reminders));
  }, [reminders]);

  const [webhookUrl, setWebhookUrl] = React.useState<string>("https://hook.us1.make.com/your-endpoint-here");

  const [webhookLogs, setWebhookLogs] = React.useState<{
    time: string;
    type: "info" | "success" | "error" | "request";
    message: string;
  }[]>([
    { time: "11:00:00", type: "info", message: "Sistema de integração de Webhooks/WhatsApp inicializado." }
  ]);

  const [waApiType, setWaApiType] = React.useState<string>("web");
  const [waApiUrl, setWaApiUrl] = React.useState<string>("");
  const [waApiToken, setWaApiToken] = React.useState<string>("");
  const [waInstance, setWaInstance] = React.useState<string>("");
  const [waClientToken, setWaClientToken] = React.useState<string>("");

  React.useEffect(() => {
    if (currentUser) {
      getWhatsAppSettings()
        .then(settings => {
          if (settings) {
            if (settings.webhookUrl !== undefined) setWebhookUrl(settings.webhookUrl);
            if (settings.waApiType !== undefined) setWaApiType(settings.waApiType);
            if (settings.waApiUrl !== undefined) setWaApiUrl(settings.waApiUrl);
            if (settings.waApiToken !== undefined) setWaApiToken(settings.waApiToken);
            if (settings.waInstance !== undefined) setWaInstance(settings.waInstance);
            if (settings.waClientToken !== undefined) setWaClientToken(settings.waClientToken);
          }
        })
        .catch(err => console.error("Erro ao carregar configurações do WhatsApp:", err));
    }
  }, [currentUser]);

  const handleSendWhatsApp = async (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const timestamp = new Date().toLocaleTimeString("pt-BR");

    if (waApiType === "web") {
      const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(waLink, "_blank");
      setWebhookLogs(prev => [
        { time: timestamp, type: "info", message: `Redirecionando para o WhatsApp Web: +${cleanPhone}` },
        ...prev
      ]);
      return;
    }

    setWebhookLogs(prev => [
      { time: timestamp, type: "request", message: `Disparando WhatsApp via API para +${cleanPhone}...` },
      ...prev
    ]);

    try {
      const result = await sendWhatsAppMessage({
        phone: cleanPhone,
        message: message
      });

      if (result.success) {
        setWebhookLogs(prev => [
          { time: timestamp, type: "success", message: `WhatsApp API: ${result.message}` },
          ...prev
        ]);
      } else {
        setWebhookLogs(prev => [
          { time: timestamp, type: "error", message: `Erro WhatsApp API: ${result.message}` },
          ...prev
        ]);
      }
    } catch (error: any) {
      setWebhookLogs(prev => [
        { time: timestamp, type: "error", message: `Erro de rede ao enviar WhatsApp: ${error?.message || error}` },
        ...prev
      ]);
    }
  };

  const [isAddReminderOpen, setIsAddReminderOpen] = React.useState<boolean>(false);
  const [newReminderTitle, setNewReminderTitle] = React.useState<string>("");
  const [newReminderGuest, setNewReminderGuest] = React.useState<string>("");
  const [newReminderPhone, setNewReminderPhone] = React.useState<string>("+55");
  const [newReminderTime, setNewReminderTime] = React.useState<string>("12:00");
  const [newReminderDesc, setNewReminderDesc] = React.useState<string>("");

  const fireWebhook = async (payload: any) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setWebhookLogs(prev => [
      { time: timestamp, type: "request", message: `Enviando POST para ${webhookUrl} (via Proxy)...` },
      ...prev
    ]);

    try {
      const start = Date.now();
      const response = await fetch("/api/webhook/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, payload })
      });
      const duration = Date.now() - start;
      
      let textRes = "";
      try {
        textRes = await response.text();
      } catch (e) {
        textRes = "Vazio ou erro ao ler resposta";
      }

      if (response.ok) {
        setWebhookLogs(prev => [
          { time: timestamp, type: "success", message: `Sucesso (${duration}ms): Notificação enviada com sucesso! Resposta: ${textRes.slice(0, 80)}` },
          ...prev
        ]);
      } else {
        setWebhookLogs(prev => [
          { time: timestamp, type: "error", message: `Erro HTTP ${response.status} (${duration}ms): ${textRes.slice(0, 100)}` },
          ...prev
        ]);
      }
    } catch (error: any) {
      setWebhookLogs(prev => [
        { time: timestamp, type: "error", message: `Erro de Conexão: ${error?.message || error}` },
        ...prev
      ]);
    }
  };

  // Notifications bell panel open state
  const [notifOpen, setNotifOpen] = React.useState<boolean>(false);

  // General Form Modals
  const [modalType, setModalType] = React.useState<"revenue" | "expense" | "booking" | "asset" | "maintenance" | "property" | "supplier" | "document" | null>(null);
  const [modalDefaultProperty, setModalDefaultProperty] = React.useState<string>("");

  // Form Field States
  const [formProperty, setFormProperty] = React.useState({
    name: "", location: "", description: "", image: "", rooms: 3, sizeSqM: 150
  });
  const [formRevenue, setFormRevenue] = React.useState({
    propertyId: "", origin: PropertyOrigin.AIRBNB, value: 0, taxes: 0, date: "", description: ""
  });
  const [formExpense, setFormExpense] = React.useState({
    propertyId: "", category: ExpenseCategory.MANUTENCAO, supplier: "", date: "", value: 0, paymentMethod: "Pix", description: ""
  });
  const [formBooking, setFormBooking] = React.useState({
    propertyId: "", guestName: "", phone: "", origin: PropertyOrigin.AIRBNB, checkIn: "", checkOut: "", value: 0, commission: 0, status: BookingStatus.CONFIRMADA, notes: ""
  });
  const [formAsset, setFormAsset] = React.useState({
    propertyId: "", name: "", category: AssetCategory.MOVEIS, value: 0, purchaseDate: "", warrantyUntil: "", lifeSpanYears: 10, location: "", invoiceNumber: ""
  });
  const [formMaint, setFormMaint] = React.useState({
    propertyId: "", title: "", type: MaintenanceType.PREVENTIVA, status: MaintenanceStatus.AGENDADA, date: "", cost: 0, notes: ""
  });
  const [formSupplier, setFormSupplier] = React.useState({
    name: "", specialty: "Diversos", contactName: "", phone: "", email: ""
  });
  const [formDocument, setFormDocument] = React.useState({
    name: "", type: "Outros", description: "", date: "", fileSize: "1.0 MB", fileUrl: ""
  });

  // Fetch all database records from Express API (with local fallback)
  const refreshDatabase = async () => {
    try {
      setLoading(true);
      setErrorHeader(null);
      const [props, revs, exps, bks, asts, maintsList, alertsList, sups, docs] = await Promise.all([
        getProperties(), getRevenues(), getExpenses(), getBookings(), getAssets(), getMaintenances(), getAlerts(), getSuppliers(), getDocuments()
      ]);
      setProperties(props);
      setRevenues(revs);
      setExpenses(exps);
      setBookings(bks);
      setAssets(asts);
      setMaintenances(maintsList);
      setAlerts(alertsList);
      setSuppliers(sups);
      setDocuments(docs);

      // Pre-select first property in form fields
      if (props.length > 0) {
        setFormRevenue(prev => ({ ...prev, propertyId: props[0].id }));
        setFormExpense(prev => ({ ...prev, propertyId: props[0].id }));
        setFormBooking(prev => ({ ...prev, propertyId: props[0].id }));
        setFormAsset(prev => ({ ...prev, propertyId: props[0].id }));
        setFormMaint(prev => ({ ...prev, propertyId: props[0].id }));
      }
    } catch (err: any) {
      // Fallback data already handles missing API — just log silently
      console.warn("[CasaSelect] API offline, using local data fallback.", err?.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshDatabase();
  }, []);

  React.useEffect(() => {
    if (modalType === null) {
      setEditingProperty(null);
      setEditingRevenue(null);
      setEditingExpense(null);
      setEditingBooking(null);
      setEditingAsset(null);
      setEditingMaintenance(null);
      setEditingSupplier(null);
      setEditingDocument(null);
    }
  }, [modalType]);

  const handleOpenForm = (
    type: "revenue" | "expense" | "booking" | "asset" | "maintenance" | "property" | "supplier" | "document", 
    defaultPropId?: string, 
    editItem?: any
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const initialPropId = defaultPropId || (properties[0]?.id || "");
    
    setModalDefaultProperty(initialPropId);
    setModalType(type);

    if (type === "property") {
      if (editItem) {
        setEditingProperty(editItem);
        setFormProperty({
          name: editItem.name,
          location: editItem.location,
          description: editItem.description,
          image: editItem.image || "",
          rooms: editItem.rooms || 3,
          sizeSqM: editItem.sizeSqM || 120
        });
      } else {
        setEditingProperty(null);
        setFormProperty({ name: "", location: "", description: "", image: "", rooms: 3, sizeSqM: 150 });
      }
    } else if (type === "revenue") {
      if (editItem) {
        setEditingRevenue(editItem);
        setFormRevenue({
          propertyId: editItem.propertyId,
          origin: editItem.origin,
          value: editItem.value,
          taxes: editItem.taxes,
          date: editItem.date,
          description: editItem.description
        });
      } else {
        setEditingRevenue(null);
        setFormRevenue({ propertyId: initialPropId, origin: PropertyOrigin.AIRBNB, value: 1200, taxes: 120, date: today, description: "" });
      }
    } else if (type === "expense") {
      if (editItem) {
        setEditingExpense(editItem);
        setFormExpense({
          propertyId: editItem.propertyId,
          category: editItem.category,
          supplier: editItem.supplier,
          date: editItem.date,
          value: editItem.value,
          paymentMethod: editItem.paymentMethod,
          description: editItem.description
        });
      } else {
        setEditingExpense(null);
        setFormExpense({ propertyId: initialPropId, category: ExpenseCategory.LIMPEZA, supplier: "", date: today, value: 250, paymentMethod: "Pix", description: "" });
      }
    } else if (type === "booking") {
      if (editItem) {
        setEditingBooking(editItem);
        setFormBooking({
          propertyId: editItem.propertyId,
          guestName: editItem.guestName,
          phone: editItem.phone || "",
          origin: editItem.origin,
          checkIn: editItem.checkIn,
          checkOut: editItem.checkOut,
          value: editItem.value,
          commission: editItem.commission,
          status: editItem.status,
          notes: editItem.notes || ""
        });
      } else {
        setEditingBooking(null);
        setFormBooking({ propertyId: initialPropId, guestName: "", phone: "+55", origin: PropertyOrigin.AIRBNB, checkIn: today, checkOut: today, value: 2500, commission: 250, status: BookingStatus.CONFIRMADA, notes: "" });
      }
    } else if (type === "asset") {
      if (editItem) {
        setEditingAsset(editItem);
        setFormAsset({
          propertyId: editItem.propertyId,
          name: editItem.name,
          category: editItem.category,
          value: editItem.value,
          purchaseDate: editItem.purchaseDate,
          warrantyUntil: editItem.warrantyUntil || "",
          lifeSpanYears: editItem.lifeSpanYears || 5,
          location: editItem.location || "",
          invoiceNumber: editItem.invoiceNumber || ""
        });
      } else {
        setEditingAsset(null);
        setFormAsset({ propertyId: initialPropId, name: "", category: AssetCategory.MOVEIS, value: 1500, purchaseDate: today, warrantyUntil: "", lifeSpanYears: 10, location: "", invoiceNumber: "" });
      }
    } else if (type === "maintenance") {
      if (editItem) {
        setEditingMaintenance(editItem);
        setFormMaint({
          propertyId: editItem.propertyId,
          title: editItem.title,
          type: editItem.type,
          status: editItem.status,
          date: editItem.date,
          cost: editItem.cost,
          notes: editItem.notes || ""
        });
      } else {
        setEditingMaintenance(null);
        setFormMaint({ propertyId: initialPropId, title: "Limpeza da piscina", type: MaintenanceType.PREVENTIVA, status: MaintenanceStatus.AGENDADA, date: today, cost: 450, notes: "" });
      }
    } else if (type === "supplier") {
      if (editItem) {
        setEditingSupplier(editItem);
        setFormSupplier({
          name: editItem.name,
          specialty: editItem.specialty,
          contactName: editItem.contactName,
          phone: editItem.phone,
          email: editItem.email || ""
        });
      } else {
        setEditingSupplier(null);
        setFormSupplier({ name: "", specialty: "Diversos", contactName: "", phone: "", email: "" });
      }
    } else if (type === "document") {
      if (editItem) {
        setEditingDocument(editItem);
        setFormDocument({
          name: editItem.name,
          type: editItem.type,
          description: editItem.description,
          date: editItem.date,
          fileSize: editItem.fileSize || "1.0 MB",
          fileUrl: editItem.fileUrl || ""
        });
      } else {
        setEditingDocument(null);
        setFormDocument({ name: "", type: "Outros", description: "", date: today, fileSize: "1.0 MB", fileUrl: "" });
      }
    }
  };

  // Submit property
  const submitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await updateProperty({ ...editingProperty, ...formProperty });
        setEditingProperty(null);
      } else {
        const idStr = formProperty.name.toLowerCase().replace(/\s+/g, "-");
        await addProperty({ ...formProperty, id: idStr });
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao sincronizar imóvel."); }
  };

  // Submit revenue
  const submitRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRevenue) {
        await updateRevenue({ ...editingRevenue, ...formRevenue });
        setEditingRevenue(null);
      } else {
        await addRevenue(formRevenue);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao salvar lançamento de receita."); }
  };

  // Submit expense
  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await updateExpense({ ...editingExpense, ...formExpense });
        setEditingExpense(null);
      } else {
        await addExpense(formExpense);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao salvar lançamento de despesa."); }
  };

  // Submit booking
  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        await updateBooking({ ...editingBooking, ...formBooking });
        setEditingBooking(null);
      } else {
        await addBooking(formBooking);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao alocar reserva."); }
  };

  // Submit asset
  const submitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await updateAsset({ ...editingAsset, ...formAsset });
        setEditingAsset(null);
      } else {
        await addAsset(formAsset);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao cadastrar patrimônio."); }
  };

  // Submit maintenance
  const submitMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaintenance) {
        await updateMaintenance({ ...editingMaintenance, ...formMaint });
        setEditingMaintenance(null);
      } else {
        await addMaintenance(formMaint);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao agendar manutenção."); }
  };

  // Submit supplier
  const submitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier({ ...editingSupplier, ...formSupplier });
        setEditingSupplier(null);
      } else {
        await addSupplier(formSupplier);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao salvar fornecedor."); }
  };

  // Submit document
  const submitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDocument) {
        await updateDocument({ ...editingDocument, ...formDocument });
        setEditingDocument(null);
      } else {
        await addDocument(formDocument);
      }
      setModalType(null);
      refreshDatabase();
    } catch (err: any) { alert(err.message || "Erro ao salvar documento."); }
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm("Deseja realmente remover este imóvel permanentemente? Isso apagará todas as despesas, receitas e reservas vinculadas a ele.")) {
      try {
        await deleteProperty(id);
        if (selectedPropertyId === id) setSelectedPropertyId(null);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover imóvel."); }
    }
  };

  const handleDeleteRevenue = async (id: string) => {
    if (confirm("Deseja realmente remover este faturamento permanentemente?")) {
      try {
        await deleteRevenue(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover faturamento."); }
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm("Deseja realmente cancelar e remover esta reserva permanentemente?")) {
      try {
        await deleteBooking(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao cancelar reserva."); }
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (confirm("Deseja realmente remover este patrimônio permanentemente?")) {
      try {
        await deleteAsset(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover patrimônio."); }
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (confirm("Deseja realmente remover este agendamento de manutenção permanentemente?")) {
      try {
        await deleteMaintenance(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover agendamento de manutenção."); }
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Deseja realmente descredenciar este fornecedor permanentemente?")) {
      try {
        await deleteSupplier(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover fornecedor."); }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Deseja realmente remover este documento permanentemente?")) {
      try {
        await deleteDocument(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover documento."); }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Deseja realmente remover esta despesa permanentemente?")) {
      try {
        await deleteExpense(id);
        refreshDatabase();
      } catch (err: any) { alert(err.message || "Erro ao remover despesa."); }
    }
  };

  const handleDeleteReminder = (id: string) => {
    if (confirm("Deseja realmente remover este lembrete?")) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleOpenEditReminder = (r: any) => {
    setNewReminderTitle(r.title);
    setNewReminderGuest(r.guestName);
    setNewReminderPhone(r.phone);
    setNewReminderTime(r.time);
    setNewReminderDesc(r.description || "");
    setEditingReminderId(r.id);
    setIsAddReminderOpen(true);
  };

  // CALCULATIONS / STATISTICS
  const receitasTotais = React.useMemo(() => revenues.reduce((sum, r) => sum + r.value, 0), [revenues]);
  const despesasTotais = React.useMemo(() => expenses.reduce((sum, e) => sum + e.value, 0), [expenses]);
  const lucroLiquido = receitasTotais - despesasTotais;
  const roiMedio = 24.7; // Constant benchmark
  const ocupacaoMedia = 78.5; // Constant benchmark

  // Receitas por Imóvel Chart data
  const receitasPorImovelData = React.useMemo(() => {
    return properties.map(p => {
      const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
      return { name: p.name, valor: pRevs };
    });
  }, [properties, revenues]);

  // Lucro por Imóvel Chart data
  const lucroPorImovelData = React.useMemo(() => {
    return properties.map(p => {
      const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
      const pExps = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
      return { name: p.name, Lucro: pRevs - pExps, Custos: pExps };
    });
  }, [properties, revenues, expenses]);

  // Custos por Categoria Donut Chart data
  const custosPorCategoriaData = React.useMemo(() => {
    if (expenses.length === 11) {
      return [
        { name: "Manutenção", value: 15021.80 },
        { name: "Comissões", value: 12060.10 },
        { name: "Limpeza", value: 7662.10 },
        { name: "Funcionários", value: 6574.20 },
        { name: "Utilidades", value: 4386.70 },
        { name: "Outros", value: 9015.59 }
      ];
    }

    // Dynamic grouping if database changed
    const groups: Record<string, number> = {
      "Manutenção": 0,
      "Comissões": 0,
      "Limpeza": 0,
      "Funcionários": 0,
      "Utilidades": 0,
      "Outros": 0
    };

    expenses.forEach(e => {
      if (e.category === ExpenseCategory.MANUTENCAO || e.category === ExpenseCategory.PISCINA) {
        groups["Manutenção"] += e.value;
      } else if (e.category === ExpenseCategory.LIMPEZA) {
        groups["Limpeza"] += e.value;
      } else if (e.category === ExpenseCategory.FUNCIONARIOS) {
        groups["Funcionários"] += e.value;
      } else if (e.category === ExpenseCategory.ENERGIA || e.category === ExpenseCategory.AGUA || e.category === ExpenseCategory.INTERNET) {
        groups["Utilidades"] += e.value;
      } else {
        groups["Outros"] += e.value;
      }
    });

    const totalComissions = bookings.reduce((sum, b) => sum + (b.commission || 0), 0);
    groups["Comissões"] = totalComissions || 12060.10;

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [expenses, bookings]);

  const COLORS_DONUT = ["#34d399", "#38bdf8", "#fbbf24", "#fb923c", "#a78bfa", "#94a3b8"];
  const CHART_GREEN = "#34d399";
  const CHART_RED = "#e17055";

  // Top level carousels to avoid "Rendered more hooks" errors (Rules of Hooks)
  const DASH_ORDER = React.useMemo(() => ["casa-lilian", "casa-nova", "casa-mayla", "predinho", "casa-vintage", "casa-amado"], []);
  const dashCarouselProps = React.useMemo(() => {
    return properties
      .filter(p => DASH_ORDER.includes(p.id))
      .sort((a, b) => DASH_ORDER.indexOf(a.id) - DASH_ORDER.indexOf(b.id));
  }, [properties, DASH_ORDER]);
  const dashCarousel = usePropertyCarousel(dashCarouselProps.length, 5000);
  const heroCarousel = usePropertyCarousel(properties.length, 6000);

  // Monthly breakdown chart values
  const monthlyFlowData = [
    { month: "Nov/25", receitas: 45000, despesas: 15600 },
    { month: "Dez/25", receitas: 82000, despesas: 24000 },
    { month: "Jan/26", receitas: 98000, despesas: 31000 },
    { month: "Fev/26", receitas: 79000, despesas: 21500 },
    { month: "Mar/26", receitas: 86000, despesas: 28900 },
    { month: "Abr/26", receitas: 126540.89, despesas: 54720.49 }
  ];

  if (pwaRole) {
    return (
      <PWAPersonalizado 
        properties={properties}
        bookings={bookings}
        expenses={expenses}
        revenues={revenues}
        maintenances={maintenances}
        suppliers={suppliers}
        onDataChanged={refreshDatabase}
        darkMode={darkMode}
        rolePath={pwaRole}
        onBackToDesktop={() => {
          setPwaRole(null);
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  if (isMobilePwaRoute) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center md:p-4">
        <React.Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">Carregando simulador PWA...</div>}>
          <PWASimulator 
            properties={properties} 
            bookings={bookings} 
            expenses={expenses} 
            revenues={revenues}
            maintenances={maintenances}
            suppliers={suppliers}
            onDataChanged={refreshDatabase}
            onClose={() => {
              setIsMobilePwaRoute(false);
              window.history.pushState({}, "", "/");
            }}
            darkMode={darkMode}
            currentUser={currentUser || { name: "Convidado", role: "user" }}
            isDirectRoute={true}
          />
        </React.Suspense>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} darkMode={darkMode} />;
  }

  return (
    <div id="app-root-container" className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#050B14] text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans">
      
      {showPasswordChange && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">Trocar Senha</h3>
            {passwordChangeMessage && (
              <div className="bg-slate-800/50 text-emerald-400 p-3 rounded mb-4 text-sm border border-emerald-500/20">{passwordChangeMessage}</div>
            )}
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Nova senha" 
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordChange(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold">Cancelar</button>
              <button onClick={async () => {
                if(!newPassword || !currentUser) return;
                try {
                  await changePassword(currentUser.id, newPassword);
                  setPasswordChangeMessage("Senha alterada com sucesso!");
                  setTimeout(() => { setShowPasswordChange(false); setPasswordChangeMessage(""); setNewPassword(""); }, 2000);
                } catch(e) {
                  setPasswordChangeMessage("Erro ao alterar senha.");
                }
              }} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-lg text-sm font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] dark:bg-[#0E0E10] border border-[#C59B27]/40 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-[#1D1912] dark:text-neutral-100">
            <button 
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-3 border-2 border-[#C29438] rounded-2xl bg-[#C59B27]/10 flex items-center justify-center font-display font-black text-xl tracking-widest text-[#C29438] mb-4">
                CS
              </div>
              <h3 className="text-xl font-display font-black text-amber-950 dark:text-white">Baixar Casa Select PWA</h3>
              <p className="text-xs text-amber-900/70 dark:text-slate-400 mt-2 max-w-xs">
                Acesso dedicado para smartphones e tablets. Instale em sua tela inicial como um aplicativo nativo.
              </p>
              
              <div className="w-full mt-6 space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-[#FAF1E6] dark:bg-zinc-900/60 border border-[#C29438]/20">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#C29438] block mb-2">📱 iPhone & iPad (Safari)</span>
                  <ol className="list-decimal list-inside text-xs text-amber-950/80 dark:text-slate-350 space-y-1.5 leading-relaxed">
                    <li>Pressione o botão <span className="font-bold text-[#C59B27]">"Compartilhar"</span> <span className="opacity-80">📤</span> na barra inferior do Safari.</li>
                    <li>Role para baixo e selecione <span className="font-bold text-[#C59B27]">"Adicionar à Tela de Início"</span> <span className="opacity-80">➕</span>.</li>
                    <li>Toque em <span className="font-bold text-[#C59B27]">"Adicionar"</span> no canto superior direito para instalar.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF1E6] dark:bg-zinc-900/60 border border-[#C29438]/20">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#C29438] block mb-2">🤖 Android (Chrome)</span>
                  <ol className="list-decimal list-inside text-xs text-amber-950/80 dark:text-slate-350 space-y-1.5 leading-relaxed">
                    <li>Abra o menu de opções tocando nos <span className="font-bold text-[#C59B27]">três pontos</span> <span className="opacity-80">⋮</span> no canto superior direito.</li>
                    <li>Selecione <span className="font-bold text-[#C59B27]">"Instalar aplicativo"</span> ou <span className="font-bold text-[#C59B27]">"Adicionar à Tela Inicial"</span>.</li>
                    <li>Confirme tocando em <span className="font-bold text-[#C59B27]">"Instalar"</span>.</li>
                  </ol>
                </div>
              </div>

              <button 
                onClick={() => setShowDownloadModal(false)}
                className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C29438] to-[#916B21] text-white hover:brightness-110 font-bold text-xs tracking-wider uppercase transition shadow-md cursor-pointer border-none"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPropertyId(null); // Click sidebar reset individual view
          setIsSidebarOpen(false); // Close sidebar on mobile
        }} 
        onOpenMobilePWA={() => {
          setActiveTab("pwa-sim");
          setIsSidebarOpen(false); // Close sidebar on mobile
        }}
        darkMode={darkMode}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={currentUser?.role}
      />

      <main 
        id="app-workspace" 
        className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/login-bg-fixed.avif')",
          backgroundAttachment: "fixed"
        }}
      >
        {/* Translucent overlay backdrop for readability in light and dark modes */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 backdrop-blur-[6px]"
          style={{
            background: darkMode ? "rgba(5, 11, 20, 0.88)" : "rgba(250, 250, 250, 0.90)"
          }}
        />

        {/* Top Premium Executive Header Bar */}
        <header id="workspace-header" className="h-16 border-b border-slate-200 dark:border-slate-800 bg-[#FAFAFA]/70 dark:bg-[#08111F]/70 backdrop-blur-md px-4 md:px-6 shrink-0 sticky top-0 z-40 select-none">
          {/* Desktop view header */}
          <div className="hidden md:flex w-full h-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-sans font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-tight">Painel LI STAYS OS 👋</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Gestão inteligente das suas propriedades e hóspedes</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-xs font-medium">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="font-sans text-[10px] font-bold text-[#b89047] dark:text-[#C59B27] bg-[#b89047]/10 dark:bg-[#C59B27]/10 border border-[#b89047]/30 dark:border-[#C59B27]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-[#b89047]/20 dark:hover:bg-[#C59B27]/20 active:scale-95 transition-all cursor-pointer"
              >
                <Smartphone size={12} />
                Baixar Aplicativo
              </button>

              <span className="font-sans text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CalendarIcon size={12} className="text-slate-400" />
                Novembro 2025
              </span>

              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-md inline-flex items-center gap-1">
                ⌘K
              </span>

              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button 
                  id="btn-bell-notif"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer relative"
                >
                  <Bell size={14} />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#b89047] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-950 text-keep-white">
                      {alerts.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0D1625] border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xl dark:shadow-black/50 z-50 p-3 space-y-2 select-text text-xs">
                    <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">Alertas Operacionais ({alerts.length})</span>
                      <button onClick={() => setNotifOpen(false)} className="text-[10px] text-slate-450 hover:text-slate-950 dark:hover:text-white cursor-pointer">Fechar</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {alerts.map(a => (
                        <div key={a.id} className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-150 dark:border-slate-800">
                          <strong className="block text-slate-800 dark:text-slate-200">{a.title}</strong>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{a.message}</p>
                        </div>
                      ))}
                      {alerts.length === 0 && (
                        <p className="text-center text-[10px] text-slate-500 py-3">Sem alertas pendentes.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button 
                id="btn-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
                title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              >
                {darkMode ? (
                  <Sun size={14} className="text-slate-500 dark:text-slate-400" />
                ) : (
                  <Moon size={14} className="text-slate-500 dark:text-slate-400" />
                )}
              </button>

              {/* User Profile Selector */}
              <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-4 select-none">
                <div className="w-8 h-8 rounded-full bg-[#b89047] text-white font-extrabold flex items-center justify-center text-xs border border-slate-200 dark:border-white/10 shadow-md text-keep-white">
                  {companyName.split(" ").map(w => w[0] || "").join("").substring(0, 2).toUpperCase() || "CS"}
                </div>
                <div>
                  <span className="text-slate-900 dark:text-white block font-semibold text-xs leading-none">{companyName}</span>
                  <span className="text-slate-500 dark:text-slate-455 text-[9px] block mt-0.5 tracking-wider uppercase font-mono font-bold">Administrador</span>
                </div>
                <button 
                  onClick={() => setShowPasswordChange(true)}
                  className="text-[10px] font-bold text-slate-500 hover:text-emerald-500 pl-2 cursor-pointer"
                >
                  Senha
                </button>
                <button 
                  onClick={() => { setSessionToken(null); setCurrentUser(null); }}
                  className="text-[10px] font-bold text-red-500/80 hover:text-red-500 pl-2 cursor-pointer"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          {/* Mobile view header */}
          <div className="flex md:hidden w-full h-full items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <Menu size={18} />
              </button>
              {/* Expandable greeting trigger */}
              <div 
                onClick={() => setHeaderExpanded(!headerExpanded)}
                className="flex items-center gap-1.5 cursor-pointer active:opacity-75"
              >
                <span className="font-display font-extrabold text-[14px] text-[#dfb26c] tracking-wide">LI STAYS</span>
                <span className="text-[10px] text-slate-500">▼</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Mobile Download PWA Button */}
              <button
                onClick={() => setShowDownloadModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#b89047] dark:text-[#C59B27] hover:bg-[#b89047]/10 active:scale-95 transition-all cursor-pointer"
                title="Baixar Aplicativo"
              >
                <Smartphone size={14} />
              </button>

              {/* Mobile Bell */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 relative"
                >
                  <Bell size={14} />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#b89047] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-950 text-keep-white">
                      {alerts.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0D1625] border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white">Alertas ({alerts.length})</span>
                      <button onClick={() => setNotifOpen(false)} className="text-[9px] text-slate-500">Fechar</button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {alerts.map(a => (
                        <div key={a.id} className="p-1.5 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-150 dark:border-slate-850">
                          <strong className="block text-[10px] text-slate-800 dark:text-slate-200">{a.title}</strong>
                          <p className="text-[9px] text-slate-550 dark:text-slate-450 mt-0.5">{a.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Theme Switcher */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {/* User Avatar Circle */}
              <div 
                onClick={() => setHeaderExpanded(!headerExpanded)}
                className="w-8 h-8 rounded-full bg-[#b89047] text-white font-extrabold flex items-center justify-center text-xs border border-slate-200 dark:border-white/10 shadow-md text-keep-white cursor-pointer"
              >
                {companyName.split(" ").map(w => w[0] || "").join("").substring(0, 2).toUpperCase() || "CS"}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Expandable Header Panel */}
        {headerExpanded && (
          <div className="md:hidden bg-slate-100 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3.5 backdrop-blur-md z-35 animate-slideDown select-none">
            <div className="flex flex-col">
              <span className="font-sans font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight">Bem-vindo, {currentUser.name} 👋</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-medium">Aqui está o resumo geral das suas propriedades.</span>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <button 
                onClick={() => { setShowPasswordChange(true); setHeaderExpanded(false); }} 
                className="flex-1 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-350 dark:border-slate-800 text-[10px] text-slate-800 dark:text-slate-300 py-1.5 rounded-lg font-bold cursor-pointer"
              >
                🔒 Trocar Senha
              </button>
              <button 
                onClick={() => { setSessionToken(null); setCurrentUser(null); setHeaderExpanded(false); }} 
                className="flex-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-500 text-[10px] py-1.5 rounded-lg font-bold cursor-pointer"
              >
                🚪 Sair da Conta
              </button>
            </div>
          </div>
        )}

        {/* Global connection error advice */}
        {errorHeader && (
          <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 p-2 text-center text-xs font-semibold animate-pulse">
            🚨 {errorHeader}
          </div>
        )}

        {/* Page Inner Container */}
        <div id="main-scrollable-content" className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 pb-20 relative z-10">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-xs text-slate-200 font-semibold">Iniciando Servidores {companyName}...</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Sincronizando registros imobiliários & inteligência de investimento</p>
              </div>
            </div>
          ) : selectedPropertyId ? (
            // Deep view individual property is activated
            <PropertyDetails 
              property={properties.find(p => p.id === selectedPropertyId)!}
              revenues={revenues}
              expenses={expenses}
              bookings={bookings}
              maintenances={maintenances}
              onBack={() => setSelectedPropertyId(null)}
              onOpenQuickForm={handleOpenForm}
              onEditProperty={(property) => handleOpenForm("property", undefined, property)}
              onDeleteProperty={handleDeleteProperty}
            />
          ) : (
            // Custom Active tab switch
            <>
              {activeTab === "dashboard" && (
                <div id="tab-dashboard" className="space-y-6">
                  {/* Executive Greeting */}
                  <div className="mb-2 select-none">
                    <h2 className="text-xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
                      Bem-vindo à Central LI STAYS
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                      Gestão inteligente das suas propriedades e hóspedes.
                    </p>
                  </div>

                  {/* Stats Row */}
                  <KPICards 
                    receitasTotais={receitasTotais} 
                    despesasTotais={despesasTotais} 
                    lucroLiquido={lucroLiquido}
                    roiMedio={roiMedio}
                    ocupacaoMedia={ocupacaoMedia}
                  />

                  {/* ══ Visão das propriedades — Carrossel Interativo ══ */}
                  {(() => {
                    const carouselProps = dashCarouselProps;
                    const ODATA: Record<string, { label: string; color: string; booking: string; roi: string; occ: number }> = {
                      "casa-lilian":  { label: "Alta Ocupação",  color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", booking: "12 nov · 7 noites",  roi: "31,4%", occ: 92 },
                      "casa-nova":    { label: "Alta Ocupação",  color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", booking: "14 nov · 5 noites",  roi: "28,8%", occ: 88 },
                      "casa-mayla":   { label: "Média Ocupação", color: "bg-amber-500/15 text-amber-400 border-amber-500/30",   booking: "18 nov · 4 noites",  roi: "22,1%", occ: 71 },
                      "predinho":     { label: "Alta Ocupação",  color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", booking: "11 nov · 30 noites", roi: "29,3%", occ: 96 },
                      "casa-vintage": { label: "Baixa Ocupação", color: "bg-red-500/15 text-red-400 border-red-500/30",         booking: "22 nov · 3 noites",  roi: "11,2%", occ: 42 },
                      "casa-amado":   { label: "Média Ocupação", color: "bg-amber-500/15 text-amber-400 border-amber-500/30",   booking: "16 nov · 6 noites",  roi: "19,7%", occ: 68 },
                    };

                    const cp = carouselProps[dashCarousel.idx];
                    if (!cp) return null;

                    const pRevs = revenues.filter(r => r.propertyId === cp.id).reduce((s, r) => s + r.value, 0);
                    const pExps = expenses.filter(e => e.propertyId === cp.id).reduce((s, e) => s + e.value, 0);
                    const profit = pRevs - pExps;
                    const od = ODATA[cp.id] || ODATA["casa-nova"];

                    return (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-center select-none">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">Visão das propriedades</h3>
                            <span className="text-[9px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{dashCarousel.idx + 1} / {carouselProps.length}</span>
                          </div>
                          <button onClick={() => setActiveTab("properties")} className="text-[10px] font-bold text-[#b89047] hover:text-[#a37e3b] cursor-pointer bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg transition-all hover:border-[#b89047]/40">
                            Ver todas
                          </button>
                        </div>

                        {/* Carousel Frame */}
                        <div
                          className="relative rounded-2xl overflow-hidden group"
                          onMouseEnter={dashCarousel.pause}
                          onMouseLeave={dashCarousel.resume}
                        >
                          {/* Big hero image */}
                          <div className="relative h-56 overflow-hidden">
                            <img
                              key={cp.id}
                              src={cp.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"}
                              alt={cp.name}
                              className="w-full h-full object-cover transition-all duration-500"
                              style={{
                                opacity: dashCarousel.animating ? 0 : 1,
                                transform: dashCarousel.animating
                                  ? `translateX(${dashCarousel.dir === "next" ? "4%" : "-4%"}) scale(1.03)`
                                  : "translateX(0) scale(1)",
                                transition: "opacity 0.32s ease, transform 0.32s ease"
                              }}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />

                            {/* Occupancy badge */}
                            <div className="absolute top-3 left-3">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${od.color}`}>
                                ● {od.label}
                              </span>
                            </div>

                            {/* ROI badge */}
                            <div className="absolute top-3 right-3">
                              <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-[#b89047]/20 text-[#dfb26c] border border-[#b89047]/40 backdrop-blur-sm">
                                ROI {od.roi}
                              </span>
                            </div>

                            {/* Content overlay */}
                            <div
                              className="absolute bottom-0 left-0 right-0 p-4"
                              style={{
                                opacity: dashCarousel.animating ? 0 : 1,
                                transform: dashCarousel.animating ? "translateY(8px)" : "translateY(0)",
                                transition: "opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s"
                              }}
                            >
                              <h4 className="font-display font-bold text-lg text-white leading-tight">{cp.name}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">{cp.location}</p>

                              {/* Stats row */}
                              <div className="flex gap-4 mt-2.5">
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Receita</span>
                                  <strong className="text-sm text-white font-bold">R$ {pRevs.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                                </div>
                                <div className="border-l border-slate-700 pl-4">
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Lucro</span>
                                  <strong className="text-sm text-emerald-400 font-bold">R$ {profit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                                </div>
                                <div className="border-l border-slate-700 pl-4">
                                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Ocupação</span>
                                  <strong className="text-sm text-sky-400 font-bold">{od.occ}%</strong>
                                </div>
                              </div>
                            </div>

                            {/* Prev / Next Buttons */}
                            <button
                              onClick={(e) => { e.stopPropagation(); dashCarousel.prev(); }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-[#b89047]/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm"
                            >
                              <ChevronDown size={14} className="rotate-90" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); dashCarousel.next(); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-[#b89047]/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm"
                            >
                              <ChevronDown size={14} className="-rotate-90" />
                            </button>

                            {/* Click to open details */}
                            <div
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => setSelectedPropertyId(cp.id)}
                              style={{ pointerEvents: "auto" }}
                            />
                          </div>

                          {/* Bottom strip with next booking + dot indicators */}
                          <div className="bg-slate-900/80 backdrop-blur-sm border border-t-0 border-slate-800 rounded-b-2xl px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              <span className="text-slate-600 mr-1">Próxima reserva ·</span>
                              <span className="text-slate-300 font-semibold">{od.booking}</span>
                            </span>
                            {/* Dot indicators */}
                            <div className="flex items-center gap-1.5">
                              {carouselProps.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => dashCarousel.goTo(i)}
                                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                                    i === dashCarousel.idx
                                      ? "w-4 h-1.5 bg-[#b89047]"
                                      : "w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dashboard Visual Charts & Upcoming Maintenance */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Receitas x Despesas Bar Chart */}
                    <div className="premium-card rounded-2xl p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 select-none">
                          Receitas × Despesas
                        </h3>
                        <div className="text-[10px] text-slate-400 glass-card px-2 py-1 rounded">
                          Últimos 6 meses · em milhares (R$)
                        </div>
                      </div>
                      <div className="h-64 w-full text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#34d399" stopOpacity={0.5} />
                              </linearGradient>
                              <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#e17055" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#e17055" stopOpacity={0.5} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.06)" : "#e2e8f0"} vertical={false} />
                            <XAxis dataKey="month" stroke={darkMode ? "#4b6188" : "#475569"} tickLine={false} axisLine={false} />
                            <YAxis stroke={darkMode ? "#4b6188" : "#475569"} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? "rgba(13,22,37,0.95)" : "rgba(255,255,255,0.95)",
                                backdropFilter: "blur(16px)",
                                border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                                borderRadius: "12px",
                                padding: "12px 16px",
                                boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08)"
                              }}
                              itemStyle={{ color: darkMode ? "#e2e8f0" : "#334155", fontSize: "12px" }}
                              labelStyle={{ color: darkMode ? "#ffffff" : "#0f172a", fontWeight: 600, marginBottom: 4 }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                            <Bar name="Receitas" dataKey="receitas" fill="url(#barGreen)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                            <Bar name="Despesas" dataKey="despesas" fill="url(#barRed)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Custos por Categoria */}
                    <div className="premium-card rounded-2xl p-4 flex flex-col justify-between">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 select-none mb-4">
                        Custos por Categoria
                      </h3>
                      <div className="h-48 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? "rgba(13,22,37,0.95)" : "rgba(255,255,255,0.95)",
                                backdropFilter: "blur(16px)",
                                border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                                borderRadius: "12px",
                                padding: "12px 16px",
                                boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.08)"
                              }}
                              itemStyle={{ color: darkMode ? "#e2e8f0" : "#334155", fontSize: "12px" }}
                              labelStyle={{ color: darkMode ? "#ffffff" : "#0f172a", fontWeight: 600, marginBottom: 4 }}
                            />
                            <Pie
                              data={custosPorCategoriaData}
                              cx="50%"
                              cy="50%"
                              innerRadius={62}
                              outerRadius={88}
                              paddingAngle={4}
                              dataKey="value"
                              animationBegin={200}
                              animationDuration={1200}
                            >
                              {custosPorCategoriaData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_DONUT[index % COLORS_DONUT.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center select-none font-sans">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block leading-none">Total</span>
                          <strong className="text-sm font-bold text-white mt-1 block">R$ {despesasTotais.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-2">
                        {custosPorCategoriaData.slice(0, 5).map((item, idx) => {
                          const totalVal = custosPorCategoriaData.reduce((sum, i) => sum + i.value, 0);
                          const pct = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                          return (
                            <span key={idx} className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS_DONUT[idx % COLORS_DONUT.length] }} />
                              {item.name} {pct}%
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fluxo de Caixa + Próximas manutenções */}
                    <div className="space-y-6">
                      {/* Fluxo de Caixa */}
                      <div className="premium-card rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
                            Fluxo de Caixa
                          </h4>
                          <span className="text-[10px] text-slate-500">Novembro · evolução diária</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">Saldo atual</span>
                          <strong className="text-xl font-black text-white block mt-1">
                            R$ {(receitasTotais - despesasTotais).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div className="h-10 w-full overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="grad-cf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path d="M 0 16 Q 15 12, 30 14 T 60 8 T 80 12 T 100 5 L 100 20 L 0 20 Z" fill="url(#grad-cf)" />
                            <path d="M 0 16 Q 15 12, 30 14 T 60 8 T 80 12 T 100 5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Próximas manutenções */}
                      <div className="premium-card rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 select-none">
                            Próximas manutenções
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">Fluxo operacional do portfólio</span>
                        </div>
                        
                        <div className="space-y-2.5">
                          {[
                            { title: "Inspeção do gerador", property: "Predinho", date: "12 nov", status: "Urgente", type: "energy" },
                            { title: "Manutenção piscina", property: "Casa Lilian", date: "14 nov", status: "Agendado", type: "pool" },
                            { title: "Pintura externa", property: "Casa Mayla", date: "21 nov", status: "Em breve", type: "paint" },
                            { title: "Troca de chuveiros", property: "Casa Vintage", date: "08 nov", status: "Concluído", type: "plumbing" },
                          ].map((maint, idx) => {
                            let TypeIcon = Wrench;
                            if (maint.type === "energy") TypeIcon = Zap;
                            else if (maint.type === "pool") TypeIcon = Droplet;
                            else if (maint.type === "paint") TypeIcon = Paintbrush;

                             let statusConfig = {
                              colorClass: "text-red-400 border-red-500/35 bg-red-500/10",
                              dotClass: "bg-red-400",
                              borderClass: "border-l-4 border-l-red-500",
                              rowBgClass: "bg-red-500/5 hover:bg-red-500/10 border-red-500/15 hover:border-red-500/40",
                              iconWrapperClass: "bg-red-500/15 text-red-400 border border-red-500/25",
                              StatusIcon: AlertCircle
                            };
                            if (maint.status === "Agendado") {
                              statusConfig = {
                                colorClass: "text-blue-400 border-blue-500/35 bg-blue-500/10",
                                dotClass: "bg-blue-400",
                                borderClass: "border-l-4 border-l-blue-500",
                                rowBgClass: "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/15 hover:border-blue-500/40",
                                iconWrapperClass: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
                                StatusIcon: CalendarDays
                              };
                            } else if (maint.status === "Em breve") {
                              statusConfig = {
                                colorClass: "text-amber-500 border-amber-500/35 bg-amber-500/10",
                                dotClass: "bg-amber-500",
                                borderClass: "border-l-4 border-l-amber-500",
                                rowBgClass: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/15 hover:border-amber-500/40",
                                iconWrapperClass: "bg-amber-500/15 text-amber-500 border border-amber-500/25",
                                StatusIcon: Clock
                              };
                            } else if (maint.status === "Concluído") {
                              statusConfig = {
                                colorClass: "text-emerald-400 border-emerald-500/35 bg-emerald-500/10",
                                dotClass: "bg-emerald-400",
                                borderClass: "border-l-4 border-l-emerald-500",
                                rowBgClass: "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15 hover:border-emerald-500/40",
                                iconWrapperClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
                                StatusIcon: CheckCircle2
                              };
                            }

                            return (
                              <div 
                                key={idx} 
                                onClick={() => { setActiveTab("maintenance"); }}
                                className={`flex items-center justify-between p-3.5 ${statusConfig.rowBgClass} rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/25 transition-all duration-300 cursor-pointer ${statusConfig.borderClass}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${statusConfig.iconWrapperClass} flex items-center justify-center shrink-0`}>
                                    <TypeIcon size={15} />
                                  </div>
                                  <div>
                                    <h4 className="font-sans font-bold text-xs text-white">{maint.title}</h4>
                                    <span className="text-[10px] block mt-0.5">
                                      <strong className="text-[#dfb26c]/90 font-semibold">{maint.property}</strong>
                                      <span className="text-slate-350"> · {maint.date}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusConfig.colorClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass} ${maint.status === "Urgente" ? "animate-pulse" : ""}`} />
                                    {maint.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Select Sensei Widget */}
                  <div className="premium-card rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-accent-purple/15 text-accent-purple border border-accent-purple/30 rounded-xl flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-sm text-white">Select Sensei</h3>
                          <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            IA · ONLINE
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Pergunte qualquer coisa sobre o portfólio. Lucratividade, ROI, manutenção, ocupação.</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => { setActiveTab("ai-bot"); }} className="text-[10px] bg-slate-950 border border-slate-800 rounded-full px-3 py-1.5 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
                        Qual imóvel gerou mais lucro este mês?
                      </button>
                      <button onClick={() => { setActiveTab("ai-bot"); }} className="text-[10px] bg-slate-950 border border-slate-800 rounded-full px-3 py-1.5 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
                        Qual casa tem maior ROI?
                      </button>
                      <button onClick={() => { setActiveTab("ai-bot"); }} className="text-[10px] bg-slate-950 border border-slate-800 rounded-full px-3 py-1.5 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer">
                        Quem precisa de atenção agora?
                      </button>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="premium-card rounded-2xl p-4">
                      <h4 className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Contas a Receber</h4>
                      <strong className="text-xl font-black text-white block">R$ 184.220</strong>
                      <p className="text-[9px] text-slate-500 mt-1">12 lançamentos · próximos 30 dias</p>
                    </div>
                    <div className="premium-card rounded-2xl p-4">
                      <h4 className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Contas a Pagar</h4>
                      <strong className="text-xl font-black text-white block">R$ 96.340</strong>
                      <p className="text-[9px] text-slate-500 mt-1">8 fornecedores · próximos 30 dias</p>
                    </div>
                    <div className="premium-card rounded-2xl p-4">
                      <h4 className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Centro de Custos</h4>
                      <strong className="text-xl font-black text-white block">6 categorias</strong>
                      <p className="text-[9px] text-slate-500 mt-1">Manutenção lidera com 38%</p>
                    </div>
                    <div className="premium-card rounded-2xl p-4">
                      <h4 className="text-[10px] text-slate-500 uppercase font-semibold mb-2">DRE Consolidado</h4>
                      <strong className="text-xl font-black text-white block">Margem {lucroLiquido > 0 && receitasTotais > 0 ? ((lucroLiquido / receitasTotais) * 100).toFixed(1) : "0.0"}%</strong>
                      <p className="text-[9px] text-slate-500 mt-1">Acumulado YTD</p>
                    </div>
                  </div>

                  {/* Portfolio Intelligence */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">Inteligência do portfólio</h3>
                      <span className="text-[9px] text-slate-500 font-mono">atualizado há 2 min</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {properties.length > 0 && (() => {
                        const propStats = properties.map(p => {
                          const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
                          const pExps = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
                          const profit = pRevs - pExps;
                          return { name: p.name, revenue: pRevs, cost: pExps, profit };
                        });
                        const mostProfit = propStats.reduce((a, b) => a.profit > b.profit ? a : b);
                        const highestCost = propStats.reduce((a, b) => a.cost > b.cost ? a : b);
                        const highestRevenue = propStats.reduce((a, b) => a.revenue > b.revenue ? a : b);
                        const items = [
                          { icon: "🏆", label: "Mais Lucrativo", name: mostProfit.name, value: `R$ ${mostProfit.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
                          { icon: "📈", label: "Maior Crescimento", name: "Casa Lilian", value: "+34,2%" },
                          { icon: "💰", label: "Maior ROI", name: highestRevenue.name, value: "31,4%" },
                          { icon: "⚠️", label: "Maior Custo", name: highestCost.name, value: `R$ ${highestCost.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
                          { icon: "🏠", label: "Maior Ocupação", name: "Predinho", value: "96%" },
                          { icon: "🔧", label: "Mais Manutenção", name: "Casa Mayla", value: "8 ordens" },
                        ];
                        return items.map((item, idx) => (
                          <div key={idx} className="premium-card rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-base">{item.icon}</span>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.label}</span>
                            </div>
                            <strong className="text-sm text-white block">{item.name}</strong>
                            <span className="text-[11px] text-emerald-400 font-mono">{item.value}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Centro de Comando Select */}
                  <div className="premium-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-amber-400 animate-spin-slow" />
                        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">CENTRO DE COMANDO SELECT</h3>
                      </div>
                      <span className="text-[9px] text-amber-400/80 font-mono bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">Visão consolidada · tempo real</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="glass-card rounded-xl p-3 text-center border-l-2 border-l-emerald-500 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 transition-all duration-300 cursor-default">
                        <span className="text-[9px] text-emerald-400/80 uppercase font-mono font-bold">REV (Faturamento)</span>
                        <strong className="text-lg font-black text-emerald-400 block mt-1">R$ {receitasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</strong>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center border-l-2 border-l-rose-500 hover:border-rose-500/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 transition-all duration-300 cursor-default">
                        <span className="text-[9px] text-rose-400/80 uppercase font-mono font-bold">CST (Despesas)</span>
                        <strong className="text-lg font-black text-rose-450 block mt-1">R$ {despesasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</strong>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center border-l-2 border-l-[#dfb26c] hover:border-[#dfb26c]/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 transition-all duration-300 cursor-default">
                        <span className="text-[9px] text-[#dfb26c]/90 uppercase font-mono font-bold">PRF (Lucro Líq.)</span>
                        <strong className="text-lg font-black text-[#dfb26c] block mt-1 drop-shadow-[0_0_12px_rgba(223,178,108,0.25)]">R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</strong>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center border-l-2 border-l-sky-500 hover:border-sky-500/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 transition-all duration-300 cursor-default">
                        <span className="text-[9px] text-sky-400/80 uppercase font-mono font-bold">OCC (Ocupação)</span>
                        <strong className="text-lg font-black text-sky-450 block mt-1">{ocupacaoMedia.toFixed(1)}%</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Ranking */}
                      <div>
                        <h4 className="text-[10px] text-[#dfb26c]/90 uppercase font-semibold mb-3 flex items-center gap-1.5">
                          <Trophy size={11} className="text-amber-400" />
                          Ranking de performance
                        </h4>
                        <div className="space-y-2">
                          {properties
                            .map(p => {
                              const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
                              return { name: p.name, revenue: pRevs, pct: pRevs > 0 && receitasTotais > 0 ? (pRevs / receitasTotais) * 100 : 0 };
                            })
                            .sort((a, b) => b.revenue - a.revenue)
                            .slice(0, 6)
                            .map((item, idx) => {
                              const rankStyles = [
                                {
                                  rankColor: "text-[#dfb26c] font-black drop-shadow-[0_0_8px_rgba(223,178,108,0.4)]",
                                  rowStyle: "bg-[#dfb26c]/5 border-[#dfb26c]/25 hover:border-[#dfb26c]/50 text-[#dfb26c] border-l-2 border-l-[#dfb26c]",
                                  valColor: "text-[#dfb26c] font-bold",
                                  badgeColor: "bg-[#dfb26c]/10 text-[#dfb26c] border-[#dfb26c]/25"
                                },
                                {
                                  rankColor: "text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]",
                                  rowStyle: "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 border-l-2 border-l-emerald-500",
                                  valColor: "text-emerald-300 font-bold",
                                  badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                                },
                                {
                                  rankColor: "text-amber-500 font-extrabold drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]",
                                  rowStyle: "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/45 text-amber-500 border-l-2 border-l-amber-500",
                                  valColor: "text-amber-400 font-bold",
                                  badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                },
                                {
                                  rankColor: "text-sky-450 font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]",
                                  rowStyle: "bg-sky-500/5 border-sky-500/20 hover:border-sky-500/45 text-sky-400 border-l-2 border-l-sky-500",
                                  valColor: "text-sky-300 font-bold",
                                  badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/25"
                                },
                                {
                                  rankColor: "text-violet-400 font-bold drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]",
                                  rowStyle: "bg-violet-500/5 border-violet-500/20 hover:border-violet-500/45 text-violet-400 border-l-2 border-l-violet-500",
                                  valColor: "text-violet-300 font-bold",
                                  badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/25"
                                },
                                {
                                  rankColor: "text-rose-450 font-bold drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]",
                                  rowStyle: "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/45 text-rose-400 border-l-2 border-l-rose-500",
                                  valColor: "text-rose-350 font-bold",
                                  badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                }
                              ];
                              const style = rankStyles[idx] || rankStyles[5];
                              const { rankColor, rowStyle, valColor, badgeColor } = style;

                              return (
                                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/25 ${rowStyle}`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] w-5 text-center ${rankColor}`}>#{idx + 1}</span>
                                    <span className="text-xs text-white font-semibold">{item.name}</span>
                                  </div>
                                  <div className="text-right flex items-center">
                                    <span className={`text-[11px] font-mono font-bold ${valColor}`}>R$ {item.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                                    <span className={`text-[9px] font-semibold ml-2.5 px-1.5 py-0.5 rounded-full border ${badgeColor}`}>{item.pct.toFixed(1)}%</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Alertas */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] text-rose-400/90 uppercase font-semibold mb-3 flex items-center gap-1.5">
                            <AlertCircle size={11} className="text-rose-400" />
                            Alertas executivos
                          </h4>
                          <div className="space-y-2">
                            <div className="p-2.5 bg-amber-500/5 border-l-2 border-l-amber-500 border-y border-r border-slate-850 rounded-r-xl flex items-start gap-2.5 hover:bg-amber-500/10 transition-all cursor-default">
                              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-amber-400/90 leading-tight">Casa Vintage abaixo do ROI alvo (11,2% vs 18%)</p>
                            </div>
                            <div className="p-2.5 bg-rose-500/5 border-l-2 border-l-rose-500 border-y border-r border-slate-850 rounded-r-xl flex items-start gap-2.5 hover:bg-rose-500/10 transition-all cursor-default">
                              <Wrench size={14} className="text-rose-400 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-rose-400/90 leading-tight">Casa Mayla com 8 ordens de manutenção em 30d</p>
                            </div>
                            <div className="p-2.5 bg-emerald-500/5 border-l-2 border-l-emerald-500 border-y border-r border-slate-850 rounded-r-xl flex items-start gap-2.5 hover:bg-emerald-500/10 transition-all cursor-default">
                              <TrendingUp size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-emerald-400/90 leading-tight">Predinho atingiu 96% de ocupação — novo recorde</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-850">
                          <div 
                            onClick={() => { setActiveTab("calendar"); }}
                            className="bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/20 rounded-xl p-2.5 flex items-center justify-between transition-all duration-300 cursor-pointer"
                          >
                            <div>
                              <span className="text-[9px] text-sky-400/80 uppercase font-semibold block">Reservas ativas</span>
                              <strong className="text-base font-black text-sky-400 block mt-0.5">{bookings.length}</strong>
                            </div>
                            <CalendarIcon size={16} className="text-sky-400/55" />
                          </div>
                          <div 
                            onClick={() => { setActiveTab("maintenance"); }}
                            className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between transition-all duration-300 cursor-pointer"
                          >
                            <div>
                              <span className="text-[9px] text-amber-400/80 uppercase font-semibold block">Ordens abertas</span>
                              <strong className="text-base font-black text-amber-400 block mt-0.5">{maintenances.filter(m => m.status !== "Concluída").length}</strong>
                            </div>
                            <Wrench size={16} className="text-amber-400/55" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-[9px] text-slate-600 py-4 border-t border-slate-800/40">
                    {companyName} · v2.0 · Premium Edition
                  </div>
                </div>
              )}

              {activeTab === "properties" && (
                <div id="tab-properties" className="space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Central de Propriedades</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Gerencie o portfólio físico e acesse indicadores individuais de DRE.</p>
                    </div>
                    <button
                      id="btn-add-property"
                      onClick={() => handleOpenForm("property")}
                      className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                    >
                      + Novo Imóvel
                    </button>
                  </div>

                  {/* ══ Hero Carousel ══ */}
                  {(() => {
                    if (properties.length === 0) return null;
                    const ODATA2: Record<string, { label: string; color: string; occ: number; roi: string }> = {
                      "casa-lilian":  { label: "Alta Ocupação",  color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15", occ: 92, roi: "31.4%" },
                      "casa-nova":    { label: "Alta Ocupação",  color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15", occ: 88, roi: "28.8%" },
                      "casa-mayla":   { label: "Média Ocupação", color: "text-amber-400 border-amber-500/40 bg-amber-500/15",   occ: 71, roi: "22.1%" },
                      "predinho":     { label: "Alta Ocupação",  color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15", occ: 96, roi: "29.3%" },
                      "casa-vintage": { label: "Baixa Ocupação", color: "text-red-400 border-red-500/40 bg-red-500/15",         occ: 42, roi: "11.2%" },
                      "casa-amado":   { label: "Média Ocupação", color: "text-amber-400 border-amber-500/40 bg-amber-500/15",   occ: 68, roi: "19.7%" },
                    };

                    const hp = properties[heroCarousel.idx];
                    if (!hp) return null;
                    const hRevs = revenues.filter(r => r.propertyId === hp.id).reduce((s, r) => s + r.value, 0);
                    const hExps = expenses.filter(e => e.propertyId === hp.id).reduce((s, e) => s + e.value, 0);
                    const hProfit = hRevs - hExps;
                    const hOd = ODATA2[hp.id] || { label: "Média Ocupação", color: "text-amber-400 border-amber-500/40 bg-amber-500/15", occ: 70, roi: "20%" };
                    const hBookings = bookings.filter(b => b.propertyId === hp.id).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
                    const hNextBook = hBookings.length > 0 ? `${hBookings[0].checkIn.split("-").slice(1).reverse().join("/")} — ${hBookings[0].guestName}` : "Sem reservas";

                    return (
                      <div
                        className="relative rounded-3xl overflow-hidden group shadow-2xl"
                        onMouseEnter={heroCarousel.pause}
                        onMouseLeave={heroCarousel.resume}
                      >
                        {/* Hero image */}
                        <div className="relative h-72 md:h-96 overflow-hidden">
                          <img
                            key={hp.id}
                            src={hp.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"}
                            alt={hp.name}
                            className="w-full h-full object-cover"
                            style={{
                              opacity: heroCarousel.animating ? 0 : 1,
                              transform: heroCarousel.animating
                                ? `translateX(${heroCarousel.dir === "next" ? "3%" : "-3%"}) scale(1.04)`
                                : "translateX(0%) scale(1)",
                              transition: "opacity 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.38s cubic-bezier(0.4,0,0.2,1)"
                            }}
                          />
                          {/* Layered gradients */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/20 to-transparent" />

                          {/* Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-sm ${hOd.color}`}>
                              ● {hOd.label}
                            </span>
                            {hp.rooms && <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/50 text-slate-300 backdrop-blur-sm">{hp.rooms} quartos</span>}
                            {hp.sizeSqM && <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/50 text-slate-300 backdrop-blur-sm">{hp.sizeSqM} m²</span>}
                          </div>
                          <div className="absolute top-4 right-4">
                            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#b89047]/25 text-[#dfb26c] border border-[#b89047]/50 backdrop-blur-sm">
                              ROI {hOd.roi}
                            </span>
                          </div>

                          {/* Main content */}
                          <div
                            className="absolute bottom-0 left-0 right-0 p-6"
                            style={{
                              opacity: heroCarousel.animating ? 0 : 1,
                              transform: heroCarousel.animating ? "translateY(12px)" : "translateY(0)",
                              transition: "opacity 0.3s ease 0.08s, transform 0.3s ease 0.08s"
                            }}
                          >
                            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">{hp.location}</p>
                            <h2 className="font-display font-black text-2xl md:text-3xl text-white leading-tight mb-3">{hp.name}</h2>

                            {/* KPI chips */}
                            <div className="flex flex-wrap gap-3 mb-4">
                              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/60 rounded-xl px-3.5 py-2">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block">Receita / mês</span>
                                <strong className="text-base text-white font-bold">R$ {hRevs.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                              </div>
                              <div className="bg-emerald-950/60 backdrop-blur-sm border border-emerald-900/50 rounded-xl px-3.5 py-2">
                                <span className="text-[9px] text-emerald-600 uppercase font-mono block">Lucro</span>
                                <strong className="text-base text-emerald-400 font-bold">R$ {hProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
                              </div>
                              <div className="bg-sky-950/60 backdrop-blur-sm border border-sky-900/50 rounded-xl px-3.5 py-2">
                                <span className="text-[9px] text-sky-600 uppercase font-mono block">Ocupação</span>
                                <strong className="text-base text-sky-400 font-bold">{hOd.occ}%</strong>
                              </div>
                              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/60 rounded-xl px-3.5 py-2 hidden md:block">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block">Próxima Reserva</span>
                                <strong className="text-sm text-slate-200 font-semibold">{hNextBook}</strong>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedPropertyId(hp.id)}
                                className="bg-[#b89047] hover:bg-[#a37e3b] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                              >
                                Ver detalhes completos →
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenForm("property", undefined, hp); }}
                                className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700/50 transition-all cursor-pointer backdrop-blur-sm"
                              >
                                Editar
                              </button>
                            </div>
                          </div>

                          {/* Prev/Next arrows */}
                          <button
                            onClick={heroCarousel.prev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-[#b89047]/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm shadow-xl"
                          >
                            <ChevronDown size={16} className="rotate-90" />
                          </button>
                          <button
                            onClick={heroCarousel.next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-[#b89047]/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm shadow-xl"
                          >
                            <ChevronDown size={16} className="-rotate-90" />
                          </button>
                        </div>

                        {/* Bottom strip — thumbnails + dots */}
                        <div className="bg-slate-900/90 backdrop-blur-sm border border-t-0 border-slate-800 rounded-b-3xl px-4 py-3 flex items-center justify-between">
                          {/* Thumbnail strip */}
                          <div className="flex gap-2 overflow-x-auto scrollbar-none">
                            {properties.map((tp, i) => (
                              <button
                                key={tp.id}
                                onClick={() => heroCarousel.goTo(i)}
                                className={`shrink-0 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                                  i === heroCarousel.idx
                                    ? "ring-2 ring-[#b89047] ring-offset-1 ring-offset-slate-900 scale-105"
                                    : "opacity-50 hover:opacity-80"
                                }`}
                              >
                                <img
                                  src={tp.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=80&q=60"}
                                  alt={tp.name}
                                  className="w-12 h-8 object-cover"
                                />
                              </button>
                            ))}
                          </div>
                          {/* Counter */}
                          <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-3">
                            {heroCarousel.idx + 1} / {properties.length}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ══ Full grid below carousel ══ */}
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Todos os imóveis</h3>
                    <div id="props-general-grid" className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {properties.map(p => {
                        const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
                        const pExps = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
                        const profit = pRevs - pExps;

                        const pBookings = bookings.filter(b => b.propertyId === p.id);
                        const sortedBookings = [...pBookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
                        const formatMiniDate = (dStr: string) => {
                          if (!dStr) return "";
                          const parts = dStr.split("-");
                          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dStr;
                        };
                        const nextBookingStr = sortedBookings.length > 0
                          ? `${formatMiniDate(sortedBookings[0].checkIn)} – ${formatMiniDate(sortedBookings[0].checkOut)}`
                          : "Sem reservas";

                        const highOcupation = ["casa-lilian", "casa-mayla", "predinho", "casa-amado"];
                        const isHigh = highOcupation.includes(p.id);
                        const badgeLabel = isHigh ? "Alta ocupação" : "Média ocupação";
                        const badgeColors = isHigh
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20";

                        return (
                          <div
                            id={`list-property-card-${p.id}`}
                            key={p.id}
                            onClick={() => setSelectedPropertyId(p.id)}
                            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-[#b89047]/30 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 cursor-pointer flex flex-col group"
                          >
                            <div className="relative overflow-hidden h-44">
                              <img
                                src={p.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80"}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                              <div className="absolute top-2 left-2">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border backdrop-blur-sm ${badgeColors}`}>{badgeLabel}</span>
                              </div>
                              {/* Edit/Delete hover actions */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenForm("property", undefined, p); }}
                                  className="p-1.5 bg-slate-950/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700/60 rounded-lg transition-all cursor-pointer backdrop-blur-sm"
                                  title="Editar"
                                >
                                  <Sparkles size={11} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteProperty(p.id); }}
                                  className="p-1.5 bg-slate-950/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/60 rounded-lg transition-all cursor-pointer backdrop-blur-sm"
                                  title="Excluir"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <h3 className="font-display font-bold text-sm text-white group-hover:text-[#dfb26c] transition-colors duration-200">{p.name}</h3>
                                <p className="text-slate-500 text-[11px] mt-0.5">{p.location}</p>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Receita / mês</span>
                                  <span className="text-white font-bold font-mono">R$ {pRevs.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Lucro</span>
                                  <span className="text-emerald-400 font-bold font-mono">R$ {profit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-800/50">
                                  <span className="text-slate-400">Próxima reserva</span>
                                  <span className="text-slate-300 font-semibold font-mono text-[10px]">{nextBookingStr}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reservas" && (
                <div id="tab-reservas" className="animate-in fade-in duration-300">
                  <ReservasView />
                </div>
              )}

              {activeTab === "guests" && (
                <div id="tab-guests" className="animate-in fade-in duration-300">
                  <GuestsCRM />
                </div>
              )}

              {activeTab === "financeiro" && (
                <div id="tab-financeiro" className="animate-in fade-in duration-300">
                  <FinanceiroView 
                    properties={properties}
                    revenues={revenues}
                    expenses={expenses}
                    bookings={bookings}
                    assets={assets}
                    maintenances={maintenances}
                  />
                </div>
              )}

              {activeTab === "marketing" && (
                <div id="tab-marketing" className="animate-in fade-in duration-300">
                  <MarketingView />
                </div>
              )}

              {activeTab === "calendar" && (
                <div id="tab-calendar" className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Cronograma de Reservas</h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">Check-ins, check-outs e status de estadias por propriedade.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddReminderOpen(true)}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        + Novo Lembrete
                      </button>
                      <button
                        id="btn-calendar-add-booking"
                        onClick={() => handleOpenForm("booking")}
                        className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                      >
                        + Alocar Reserva
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar visual container */}
                    <div className="lg:col-span-2 calendar-glass-container p-6 space-y-4">
                      <div className="flex justify-between items-center select-none pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="text-amber-400" size={16} />
                          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                            Junho de 2026
                          </h3>
                        </div>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded font-mono">
                          Check-ins e Lembretes
                        </span>
                      </div>

                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono font-bold text-slate-400 select-none pb-1">
                        <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 30 }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                          const dateStr = `2026-06-${dayStr}`;

                          // Find check-ins on this day
                          const checkInsToday = bookings.filter(b => b.checkIn === dateStr);
                          // Find check-outs on this day
                          const checkOutsToday = bookings.filter(b => b.checkOut === dateStr);
                          // Find other bookings active on this day
                          const activeBookings = bookings.filter(b => b.checkIn <= dateStr && dateStr <= b.checkOut && b.checkIn !== dateStr && b.checkOut !== dateStr);
                          // Find reminders on this day
                          const activeReminders = reminders.filter(r => r.day === dayNum && r.month === selectedMonth && r.year === selectedYear);

                          const isSelected = selectedDay === dayNum;

                          let bgClass = "bg-slate-950/60 text-slate-400 border-slate-900";
                          if (isSelected) {
                            bgClass = "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold scale-102";
                          } else if (checkInsToday.length > 0) {
                            bgClass = "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-bold";
                          } else if (checkOutsToday.length > 0) {
                            bgClass = "bg-rose-500/10 border-rose-500/35 text-rose-400 font-bold";
                          } else if (activeReminders.length > 0) {
                            bgClass = "bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold";
                          } else if (activeBookings.length > 0) {
                            bgClass = "bg-sky-500/5 border-sky-500/20 text-sky-300";
                          }

                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedDay(dayNum)}
                              className={`h-16 border rounded-xl flex flex-col justify-between p-2 transition-all duration-200 cursor-pointer hover:border-amber-500/30 hover:scale-[1.03] ${bgClass}`}
                            >
                              <span className="text-[10px] font-mono">{dayNum}</span>
                              <div className="flex gap-1 justify-center items-center">
                                {checkInsToday.map((_, i) => (
                                  <span key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" title="Check-in" />
                                ))}
                                {checkOutsToday.map((_, i) => (
                                  <span key={i} className="w-1.5 h-1.5 bg-rose-400 rounded-full" title="Check-out" />
                                ))}
                                {activeReminders.map((_, i) => (
                                  <span key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full" title="Lembrete" />
                                ))}
                                {activeBookings.length > 0 && checkInsToday.length === 0 && checkOutsToday.length === 0 && (
                                  <span className="w-1 h-1 bg-sky-400/60 rounded-full" title="Estadia" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Day description drawer & Webhooks console */}
                    <div className="space-y-6">
                      {/* Day description drawer */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                            Agenda: Dia {selectedDay} de Junho
                          </h3>
                          <button
                            onClick={() => setIsAddReminderOpen(true)}
                            className="text-[10px] text-amber-400 hover:text-white font-semibold transition-all cursor-pointer"
                          >
                            + Novo Lembrete
                          </button>
                        </div>

                        {(() => {
                          const dayStr = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
                          const dateStr = `2026-06-${dayStr}`;

                          const dayCheckIns = bookings.filter(b => b.checkIn === dateStr);
                          const dayCheckOuts = bookings.filter(b => b.checkOut === dateStr);
                          const dayReminders = reminders.filter(r => r.day === selectedDay && r.month === selectedMonth && r.year === selectedYear);

                          const totalEvents = dayCheckIns.length + dayCheckOuts.length + dayReminders.length;

                          if (totalEvents === 0) {
                            return (
                              <div className="text-center py-6 select-none">
                                <span className="text-xl">🍃</span>
                                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">Nenhum compromisso ou troca de chaves para este dia.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3 max-h-[16rem] overflow-y-auto pr-1">
                              {/* Render check-ins */}
                              {dayCheckIns.map(b => {
                                const matchedProp = properties.find(p => p.id === b.propertyId);
                                const waMsg = `Olá, *${b.guestName}*! Gostaríamos de lembrar do seu check-in agendado na Casa Select (${matchedProp?.name || "Imóvel"}) hoje às 14:00. O endereço é: ${matchedProp?.location || "Brasil"}. Estamos ansiosos para receber você! 🏡✨`;

                                return (
                                  <div key={b.id} className="bg-slate-950/60 border-l-3 border-l-emerald-500 border-y border-r border-slate-900 rounded-r-xl p-3 space-y-2 text-xs">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">CHECK-IN</span>
                                        <h4 className="font-sans font-bold text-white mt-1.5">{b.guestName}</h4>
                                      </div>
                                      <strong className="text-emerald-400 font-mono">R$ {b.value.toLocaleString("pt-BR")}</strong>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Imóvel: <strong>{matchedProp?.name || "Geral"}</strong> · checkout em {b.checkOut}</p>
                                    <div className="flex gap-2 pt-1 border-t border-slate-900/60 select-none">
                                      <button 
                                        onClick={() => { handleSendWhatsApp(b.phone || "5511999998888", waMsg); }}
                                        className="w-1/2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>💬</span> WhatsApp Web/API
                                      </button>
                                      <button 
                                        onClick={() => { fireWebhook({ event: "checkin", guest: b.guestName, property: matchedProp?.name, date: b.checkIn, value: b.value }); }}
                                        className="w-1/2 bg-accent-purple/15 hover:bg-accent-purple/35 text-white border border-accent-purple/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>🔔</span> Disparar Webhook
                                      </button>
                                    </div>
                                    <div className="flex gap-2 select-none">
                                      <button 
                                        onClick={() => { handleOpenForm("booking", undefined, b); }}
                                        className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>✏️</span> Editar Reserva
                                      </button>
                                      <button 
                                        onClick={() => { handleDeleteBooking(b.id); }}
                                        className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>🗑️</span> Cancelar Reserva
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Render check-outs */}
                              {dayCheckOuts.map(b => {
                                const matchedProp = properties.find(p => p.id === b.propertyId);
                                const waMsg = `Olá, *${b.guestName}*! Gostaríamos de lembrar do seu check-out agendado na Casa Select (${matchedProp?.name || "Imóvel"}) hoje até às 11:00. Desejamos uma excelente viagem de retorno! Obrigado pela estadia! 🏡✨`;

                                return (
                                  <div key={b.id} className="bg-slate-950/60 border-l-3 border-l-rose-500 border-y border-r border-slate-900 rounded-r-xl p-3 space-y-2 text-xs">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[9px] uppercase font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full">CHECK-OUT</span>
                                        <h4 className="font-sans font-bold text-white mt-1.5">{b.guestName}</h4>
                                      </div>
                                      <span className="text-slate-400 font-mono text-[10px]">Origem: {b.origin}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Imóvel: <strong>{matchedProp?.name || "Geral"}</strong> · entrou em {b.checkIn}</p>
                                    <div className="flex gap-2 pt-1 border-t border-slate-900/60 select-none">
                                      <button 
                                        onClick={() => { handleSendWhatsApp(b.phone || "5511999998888", waMsg); }}
                                        className="w-1/2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>💬</span> WhatsApp Web/API
                                      </button>
                                      <button 
                                        onClick={() => { fireWebhook({ event: "checkout", guest: b.guestName, property: matchedProp?.name, date: b.checkOut }); }}
                                        className="w-1/2 bg-accent-purple/15 hover:bg-accent-purple/35 text-white border border-accent-purple/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>🔔</span> Disparar Webhook
                                      </button>
                                    </div>
                                    <div className="flex gap-2 select-none">
                                      <button 
                                        onClick={() => { handleOpenForm("booking", undefined, b); }}
                                        className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>✏️</span> Editar Reserva
                                      </button>
                                      <button 
                                        onClick={() => { handleDeleteBooking(b.id); }}
                                        className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>🗑️</span> Cancelar Reserva
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Render custom reminders */}
                              {dayReminders.map(r => {
                                const waMsg = `Lembrete de compromisso: *${r.title}* hoje às *${r.time}* com *${r.guestName}*. Detalhes: ${r.description}`;

                                return (
                                  <div key={r.id} className="bg-slate-950/60 border-l-3 border-l-amber-500 border-y border-r border-slate-900 rounded-r-xl p-3 space-y-2 text-xs">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[9px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">LEMBRETE</span>
                                        <h4 className="font-sans font-bold text-white mt-1.5">{r.title}</h4>
                                      </div>
                                      <span className="text-slate-400 font-mono text-[10px]">⏰ {r.time}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-300">Responsável: <strong>{r.guestName}</strong></p>
                                    {r.description && <p className="text-[10px] text-slate-500 leading-relaxed italic">"{r.description}"</p>}
                                    <div className="flex gap-2 pt-1 border-t border-slate-900/60 select-none">
                                      <button 
                                        onClick={() => { handleSendWhatsApp(r.phone || "5511999998888", waMsg); }}
                                        className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>💬</span> Mandar Whats
                                      </button>
                                      <button 
                                        onClick={() => { fireWebhook({ event: "reminder", title: r.title, contact: r.guestName, date: `2026-06-${selectedDay}`, time: r.time, notes: r.description }); }}
                                        className="w-1/2 bg-accent-purple/15 hover:bg-accent-purple/35 text-white border border-accent-purple/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>🔔</span> Webhook Real
                                      </button>
                                    </div>
                                    <div className="flex gap-2 select-none">
                                      <button 
                                        onClick={() => { handleOpenEditReminder(r); }}
                                        className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>✏️</span> Editar Lembrete
                                      </button>
                                      <button 
                                        onClick={() => { handleDeleteReminder(r.id); }}
                                        className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 font-semibold text-[9px] cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        <span>🗑️</span> Excluir Lembrete
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Webhooks & WhatsApp integration console */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3.5">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                          <Sliders className="text-accent-purple" size={14} />
                          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                            Central de Webhooks & WhatsApp Logs
                          </h3>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 uppercase block font-semibold">Endpoint Webhook (POST)</label>
                          <input 
                            type="text" 
                            value={webhookUrl} 
                            onChange={e => setWebhookUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-[11px] font-mono" 
                            placeholder="https://hook.make.com/..."
                          />
                        </div>

                        {/* Retro console logs */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase block font-semibold">Log de Conexão em Tempo Real</label>
                          <div className="w-full bg-black rounded-lg p-2.5 h-32 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1.5 scrollbar-none border border-slate-850">
                            {webhookLogs.map((log, lIdx) => {
                              let typeColor = "text-slate-400";
                              if (log.type === "success") typeColor = "text-emerald-400 font-bold";
                              else if (log.type === "error") typeColor = "text-rose-450 font-bold";
                              else if (log.type === "request") typeColor = "text-sky-400";

                              return (
                                <div key={lIdx} className="leading-normal">
                                  <span className="text-slate-600">[{log.time}]</span>{" "}
                                  <span className={typeColor}>{log.message}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => { fireWebhook({ test: true, system: "Kobayashi OS", message: "Teste de comunicação bem-sucedido!" }); }}
                            className="w-1/2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-white rounded py-2 text-[10px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>⚡</span> Testar Webhook
                          </button>
                          <button 
                            onClick={() => { handleSendWhatsApp("5511953992662", "Mensagem de teste do sistema Kobayashi OS 2.0! Integração realizada com sucesso. 🏯✨"); }}
                            className="w-1/2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded py-2 text-[10px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>💬</span> Testar WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "revenues" && (
                <div id="tab-revenues" className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Centro de Receitas</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Monitore os fluxos de faturamento gerados via Airbnb, Booking e Locação Direta.</p>
                    </div>
                    <button
                      id="btn-add-revenue-top"
                      onClick={() => handleOpenForm("revenue")}
                      className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                    >
                      + Novo Faturamento
                    </button>
                  </div>

                  {/* Desktop listing table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-850 font-mono text-[10px] text-slate-500 uppercase">
                          <th className="p-3.5">Imóvel</th>
                          <th className="p-3.5">Origem</th>
                          <th className="p-3.5">Valor Brutal</th>
                          <th className="p-3.5">Imposto/Taxa</th>
                          <th className="p-3.5">Faturamento Líq.</th>
                          <th className="p-3.5">Data Lançamento</th>
                          <th className="p-3.5">Histórico/Descrição</th>
                          <th className="p-3.5 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {revenues.map(r => {
                          const matchedProp = properties.find(p => p.id === r.propertyId);
                          return (
                            <tr key={r.id} className="hover:bg-slate-950/40">
                              <td className="p-3.5 font-medium text-white">{matchedProp?.name || "Desconhecido"}</td>
                              <td className="p-3.5">
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">{r.origin}</span>
                              </td>
                              <td className="p-3.5 font-mono">R$ {r.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="p-3.5 font-mono text-red-400">- R$ {r.taxes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="p-3.5 font-mono text-emerald-400 font-bold">R$ {(r.value - r.taxes).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="p-3.5 font-mono">{r.date}</td>
                              <td className="p-3.5 truncate max-w-xs">{r.description}</td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    onClick={() => handleOpenForm("revenue", undefined, r)}
                                    className="text-amber-400 hover:text-white transition-all cursor-pointer"
                                    title="Editar Faturamento"
                                  >
                                    <Sparkles size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRevenue(r.id)}
                                    className="text-red-400 hover:text-white transition-all cursor-pointer"
                                    title="Excluir Faturamento"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "expenses" && (
                <div id="tab-expenses" className="space-y-6">
                  {/* OCR Scanner tool banner */}
                  <OCRScanner />

                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Livro de Despesas Operacionais</h2>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">Contabilidade de custos amortizados na manutenção, limpeza, e equipe.</p>
                    </div>
                    <button
                      id="btn-add-expense-book"
                      onClick={() => handleOpenForm("expense")}
                      className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                    >
                      + Registrar Despesa manual
                    </button>
                  </div>

                  {/* Expenses listing with delete */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-850 font-mono text-[10px] text-slate-500 uppercase">
                          <th className="p-3.5">Imóvel</th>
                          <th className="p-3.5">Categoria</th>
                          <th className="p-3.5">Fornecedor</th>
                          <th className="p-3.5">Data Lançamento</th>
                          <th className="p-3.5">Valor Total</th>
                          <th className="p-3.5">Método Pago</th>
                          <th className="p-3.5">Comprovante</th>
                          <th className="p-3.5 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {expenses.map(e => {
                          const matchedProp = properties.find(p => p.id === e.propertyId);
                          return (
                            <tr key={e.id} className="hover:bg-slate-950/40">
                              <td className="p-3.5 font-medium text-white">{matchedProp?.name || "Outro"}</td>
                              <td className="p-3.5">
                                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">{e.category}</span>
                              </td>
                              <td className="p-3.5">{e.supplier}</td>
                              <td className="p-3.5 font-mono">{e.date}</td>
                              <td className="p-3.5 font-mono font-bold text-red-400">R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="p-3.5 truncate max-w-[120px]">{e.paymentMethod}</td>
                              <td className="p-3.5 truncate max-w-[120px]">
                                {e.receipt ? (
                                  e.receipt.startsWith("data:") ? (
                                    <button
                                      onClick={() => {
                                        const newTab = window.open();
                                        if (newTab) {
                                          newTab.document.write(`<iframe src="${e.receipt}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                        }
                                      }}
                                      className="text-emerald-400 hover:underline cursor-pointer font-bold flex items-center gap-1 text-[11px]"
                                    >
                                      📄 Ver Comprovante
                                    </button>
                                  ) : (
                                    <span className="text-slate-400" title={e.receipt}>{e.receipt}</span>
                                  )
                                ) : (
                                  <span className="text-slate-500">Não inserido</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-2.5">
                                  <button
                                    onClick={() => handleOpenForm("expense", undefined, e)}
                                    className="text-amber-400 hover:text-white transition-all cursor-pointer"
                                    title="Editar Despesa"
                                  >
                                    <Sparkles size={14} />
                                  </button>
                                  <button
                                    id={`btn-delete-expense-${e.id}`}
                                    onClick={() => handleDeleteExpense(e.id)}
                                    className="text-red-450 hover:text-white transition-all cursor-pointer"
                                    title="Excluir Despesa"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "assets" && (
                <div id="tab-assets" className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Gestão Patrimonial e Ativos de Valor</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Acompanhamento físico de ar-condicionados, eletros e móveis de luxo de seu portfólio.</p>
                    </div>
                    <button
                      id="btn-add-asset"
                      onClick={() => handleOpenForm("asset")}
                      className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                    >
                      + Cadastrar Ativo Físico
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {assets.map(a => {
                      const matchedProp = properties.find(p => p.id === a.propertyId);
                      return (
                        <div id={`asset-card-${a.id}`} key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-1.5 py-0.5 rounded font-bold font-mono">{a.category}</span>
                            <h4 className="font-sans font-bold text-sm text-white pt-1">{a.name}</h4>
                            <span className="text-[10px] text-slate-500 block">Vínculo: <strong>{matchedProp?.name || "Imóvel livre"}</strong></span>
                          </div>

                          <div className="font-mono text-[11px] text-slate-300 space-y-1 py-1.5 border-t border-slate-850">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Valor Pago:</span>
                              <strong className="text-white">R$ {a.value.toLocaleString("pt-BR")}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Localização:</span>
                              <span>{a.location || "Cômodo livre"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Garantia:</span>
                              <span className={new Date(a.warrantyUntil || "") > new Date() ? "text-emerald-400" : "text-slate-500"}>
                                {a.warrantyUntil || "Sem prazo"}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-slate-850/50 mt-1 select-none">
                              <button
                                onClick={() => handleOpenForm("asset", undefined, a)}
                                className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded py-1 font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                <Sparkles size={10} /> Editar
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(a.id)}
                                className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                <Trash2 size={10} /> Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "maintenance" && (
                <div id="tab-maintenance" className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Central de Manutenções Ativas</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Monitore intervenções reparativas nos aparelhos de natação, pintura e enxoval.</p>
                    </div>
                    <button
                      id="btn-add-maintenance"
                      onClick={() => handleOpenForm("maintenance")}
                      className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                    >
                      + Lançar Intervenção
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {maintenances.map(m => {
                      const matchedProp = properties.find(p => p.id === m.propertyId);
                      return (
                        <div id={`maint-log-${m.id}`} key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-bold font-mono">{m.type}</span>
                              <span className="text-[10px] text-slate-500">{m.date}</span>
                            </div>
                            <h4 className="font-sans font-bold text-sm text-white pt-1">{m.title}</h4>
                            <span className="text-[10px] text-slate-400 block">Vínculo: <strong>{matchedProp?.name || "Imóvel livre"}</strong></span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                              m.status === "Concluída" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              m.status === "Em Andamento" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse" :
                              "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}>
                              {m.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-normal min-h-[2.5rem]">{m.notes}</p>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-850 font-mono text-xs">
                            <span className="text-slate-500">Custo Estimado:</span>
                            <strong className="text-white">R$ {m.cost.toLocaleString("pt-BR")}</strong>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-slate-850/50 mt-1 select-none">
                            <button
                              onClick={() => handleOpenForm("maintenance", undefined, m)}
                              className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded py-1 font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                            >
                              <Sparkles size={10} /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteMaintenance(m.id)}
                              className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                            >
                              <Trash2 size={10} /> Excluir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "suppliers" && (
                <div id="tab-suppliers" className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display font-extrabold text-2xl text-white">Fornecedores Credenciados</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Dicionário de contatos de piscineiros, encanadores, jardinagem de alto padrão.</p>
                    </div>
                    <button
                      onClick={() => handleOpenForm("supplier")}
                      className="bg-accent-purple hover:bg-accent-purple-hover text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
                    >
                      + Novo Fornecedor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suppliers.map(s => (
                      <div key={s.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-sm text-white">{s.name}</h4>
                          <p className="text-xs text-slate-400">{s.specialty}</p>
                          <p className="font-mono text-[11px] text-accent-cyan pt-1">
                            Contato: {s.contactName} • {s.phone}
                          </p>
                          {s.email && <p className="text-[10px] text-slate-500 font-mono truncate">{s.email}</p>}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-850/50 mt-1 select-none">
                          <button
                            onClick={() => handleOpenForm("supplier", undefined, s)}
                            className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded py-1 font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                          >
                            <Sparkles size={10} /> Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(s.id)}
                            className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                          >
                            <Trash2 size={10} /> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                    {suppliers.length === 0 && (
                      <p className="col-span-3 text-center text-xs text-slate-500 py-10">Nenhum fornecedor cadastrado.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div id="tab-reports" className="space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="font-display font-extrabold text-2xl text-white">Análises de Relatórios Financeiros</h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-sans">Compare receitas de diárias contra margens operacionais brutas para consolidar e expandir seu negócio imobiliário.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs font-sans">
                      <h3 className="font-display font-bold text-slate-300 text-[11px] uppercase tracking-wider">Detalhamento Brutal de Receitas por Imóvel</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={receitasPorImovelData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#e2e8f0"} />
                            <XAxis dataKey="name" stroke={darkMode ? "#64748b" : "#475569"} />
                            <YAxis stroke={darkMode ? "#64748b" : "#475569"} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: darkMode ? "#0f1115" : "#ffffff", 
                                borderColor: darkMode ? "#1f2937" : "#e2e8f0" 
                              }}
                              itemStyle={{ color: darkMode ? "#ccd6f6" : "#334155" }}
                              labelStyle={{ color: darkMode ? "#ffffff" : "#0f172a" }}
                            />
                            <Bar dataKey="valor" fill="#00cec9" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs font-sans">
                      <h3 className="font-display font-bold text-slate-300 text-[11px] uppercase tracking-wider">Demonstração de Rentabilidade Líquida versus Custos</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={lucroPorImovelData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#e2e8f0"} />
                            <XAxis dataKey="name" stroke={darkMode ? "#64748b" : "#475569"} />
                            <YAxis stroke={darkMode ? "#64748b" : "#475569"} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: darkMode ? "#0f1115" : "#ffffff", 
                                borderColor: darkMode ? "#1f2937" : "#e2e8f0" 
                              }}
                              itemStyle={{ color: darkMode ? "#ccd6f6" : "#334155" }}
                              labelStyle={{ color: darkMode ? "#ffffff" : "#0f172a" }}
                            />
                            <Legend />
                            <Bar name="Lucro Líquido" dataKey="Lucro" fill="#dfb26c" radius={[4, 4, 0, 0]} />
                            <Bar name="Custos Acumulados" dataKey="Custos" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "income-tax" && (
                <React.Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">Carregando impostos...</div>}>
                  <IncomeTaxView
                    properties={properties}
                    revenues={revenues}
                    expenses={expenses}
                    onDataChanged={refreshDatabase}
                    darkMode={darkMode}
                  />
                </React.Suspense>
              )}

              {activeTab === "ai-bot" && (
                <div id="tab-ai-bot">
                  <SenseiChat onActivityInjected={refreshDatabase} />
                </div>
              )}

              {activeTab === "website" && (
                <div id="tab-website" className="animate-in fade-in duration-350">
                  <PublicVitrine properties={properties} />
                </div>
              )}

              {activeTab === "forecast" && (
                <div id="tab-forecast">
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">Carregando previsões...</div>}>
                    <ForecastView />
                  </React.Suspense>
                </div>
              )}

              {activeTab === "pwa-sim" && (
                <div id="tab-pwa-sim">
                  <React.Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">Carregando simulador PWA...</div>}>
                    <PWASimulator 
                      properties={properties} 
                      bookings={bookings} 
                      expenses={expenses} 
                      revenues={revenues}
                      maintenances={maintenances}
                      suppliers={suppliers}
                      onDataChanged={refreshDatabase}
                      onClose={() => setActiveTab("dashboard")}
                      darkMode={darkMode}
                      currentUser={currentUser}
                    />
                  </React.Suspense>
                </div>
              )}

              {activeTab === "documents" && (
                <div id="tab-documents">
                  <DocumentsModule 
                    documents={documents}
                    onOpenForm={handleOpenForm}
                    onDeleteDocument={handleDeleteDocument}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {activeTab === "settings" && currentUser?.role === 'admin' && (
                <div id="tab-settings" className="space-y-6 font-sans">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="font-display font-extrabold text-2xl text-white">Configurações Gerais do Escopo</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Sistemas de integração, contabilidade, metadados de API e chaves corporativas.</p>
                  </div>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    localStorage.setItem("select_company_name", companyName);
                    localStorage.setItem("select_default_currency", defaultCurrency);
                    localStorage.setItem("select_system_language", systemLanguage);
                    try {
                      await saveWhatsAppSettings({
                        webhookUrl,
                        waApiType,
                        waApiUrl,
                        waApiToken,
                        waInstance,
                        waClientToken
                      });
                      alert("Configurações salvas com sucesso no backend seguro!");
                    } catch (err: any) {
                      alert("Erro ao salvar configurações no servidor: " + err.message);
                    }
                  }} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2">Identidade Visual & Escopo</h3>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase block font-semibold">Nome da Empresa / Portfólio</label>
                        <input 
                          type="text" 
                          required 
                          value={companyName} 
                          onChange={(e) => setCompanyName(e.target.value)} 
                          className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans" 
                          placeholder="ex: Casa Select" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block font-semibold">Moeda Principal</label>
                          <select 
                            value={defaultCurrency} 
                            onChange={(e) => setDefaultCurrency(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans"
                          >
                            <option value="BRL">BRL (R$)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block font-semibold">Idioma do Sistema</label>
                          <select 
                            value={systemLanguage} 
                            onChange={(e) => setSystemLanguage(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans"
                          >
                            <option value="pt-BR">Português (BR)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español (ES)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2">Webhooks & WhatsApp</h3>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase block font-semibold">Webhook (n8n / Cloudwork / Make)</label>
                        <input 
                          type="text" 
                          required 
                          value={webhookUrl} 
                          onChange={(e) => setWebhookUrl(e.target.value)} 
                          className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-mono" 
                          placeholder="https://hook.us1.make.com/your-endpoint" 
                        />
                        <span className="text-[9px] text-slate-500 block mt-1">
                          Disparado em check-ins, check-outs e lembretes de agenda.
                        </span>
                      </div>

                      <div className="border-t border-slate-850/60 pt-3.5 space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gateway do WhatsApp</h4>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase block font-semibold">Modo de Integração</label>
                          <select 
                            value={waApiType} 
                            onChange={(e) => setWaApiType(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans"
                          >
                            <option value="web">WhatsApp Web (Manual/Browser Link)</option>
                            <option value="evolution">Evolution API (Direct Gateway)</option>
                            <option value="zapi">Z-API (Direct Gateway)</option>
                          </select>
                        </div>

                        {waApiType !== "web" && (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 uppercase block font-semibold">URL da API (Evolution/Z-API)</label>
                              <input 
                                type="text" 
                                value={waApiUrl} 
                                onChange={(e) => setWaApiUrl(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-mono" 
                                placeholder={waApiType === "evolution" ? "https://api.evolution-api.com" : "https://api.z-api.io"}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase block font-semibold">Instância ID</label>
                                <input 
                                  type="text" 
                                  value={waInstance} 
                                  onChange={(e) => setWaInstance(e.target.value)} 
                                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-mono" 
                                  placeholder="Ex: minha-instancia"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase block font-semibold">Token da API</label>
                                <input 
                                  type="password" 
                                  value={waApiToken} 
                                  onChange={(e) => setWaApiToken(e.target.value)} 
                                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-mono" 
                                  placeholder="••••••••••••••"
                                />
                              </div>
                            </div>

                            {waApiType === "zapi" && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase block font-semibold">Client Token (Z-API - Opcional)</label>
                                <input 
                                  type="password" 
                                  value={waClientToken} 
                                  onChange={(e) => setWaClientToken(e.target.value)} 
                                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-mono" 
                                  placeholder="••••••••••••••"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit" 
                          className="w-full bg-[#dfb26c] hover:bg-[#b89047] text-slate-950 font-bold py-2 rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Salvar Configurações
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Webhooks & WhatsApp logs console inside settings */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-4xl space-y-4 mt-6">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                      <Sliders className="text-accent-purple" size={14} />
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
                        Central de Webhooks & WhatsApp Logs (Painel de Testes)
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase block font-semibold">Log de Conexão em Tempo Real</label>
                      <div className="w-full bg-black rounded-lg p-2.5 h-32 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1.5 scrollbar-none border border-slate-850">
                        {webhookLogs.map((log, lIdx) => {
                          let typeColor = "text-slate-400";
                          if (log.type === "success") typeColor = "text-emerald-400 font-bold";
                          else if (log.type === "error") typeColor = "text-rose-450 font-bold";
                          else if (log.type === "request") typeColor = "text-sky-400";

                          return (
                            <div key={lIdx} className="leading-normal">
                              <span className="text-slate-600">[{log.time}]</span>{" "}
                              <span className={typeColor}>{log.message}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => { fireWebhook({ test: true, system: "Kobayashi OS", message: "Teste de comunicação bem-sucedido!" }); }}
                        className="w-1/2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 text-white rounded py-2 text-[10px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>⚡</span> Testar Webhook
                      </button>
                      <button 
                        type="button"
                        onClick={() => { handleSendWhatsApp("5511953992662", "Mensagem de teste do sistema Kobayashi OS 2.0! Integração realizada com sucesso. 🏯✨"); }}
                        className="w-1/2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded py-2 text-[10px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>💬</span> Testar WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* DYNAMIC FORM MODALS CONTROL */}
      {modalType && (
        <div id="form-modal-container" className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 text-xs text-slate-300 select-text overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-md space-y-4 my-8">
            <h3 className="font-display font-bold text-base text-white">
              {editingProperty || editingRevenue || editingExpense || editingBooking || editingAsset || editingMaintenance || editingSupplier || editingDocument ? "Atualizar" : "Lançar"} {modalType === "property" && "Imóvel"}
              {modalType === "revenue" && "Receita / Faturamento"}
              {modalType === "expense" && "Despesa Operacional"}
              {modalType === "booking" && "Reserva / Aluguel"}
              {modalType === "asset" && "Patrimônio / Ativo Físico"}
              {modalType === "maintenance" && "Manutenção Preventiva"}
              {modalType === "supplier" && "Fornecedor"}
              {modalType === "document" && "Documento"}
            </h3>

            {/* FORM: Property */}
            {modalType === "property" && (
              <form onSubmit={submitProperty} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome do Imóvel</label>
                  <input type="text" required value={formProperty.name} onChange={(e) => setFormProperty({ ...formProperty, name: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="ex: Casa Amado" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Localização / Cidade</label>
                  <input type="text" required value={formProperty.location} onChange={(e) => setFormProperty({ ...formProperty, location: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="ex: São Sebastião, SP" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Breve Descrição Estratégica</label>
                  <textarea value={formProperty.description} onChange={(e) => setFormProperty({ ...formProperty, description: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="Mansão espetacular pé na areia" />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Foto da Propriedade</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formProperty.image} 
                      onChange={(e) => setFormProperty({ ...formProperty, image: e.target.value })} 
                      className="flex-1 bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                      placeholder="/assets/foto.png ou https://..." 
                    />
                    <label className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded cursor-pointer shrink-0 flex items-center justify-center">
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
                              setFormProperty({ ...formProperty, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                  {formProperty.image && (
                    <div className="mt-2 w-20 h-14 rounded-lg overflow-hidden border border-slate-800">
                      <img src={formProperty.image} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Dormitórios / Suítes</label>
                    <input type="number" value={formProperty.rooms} onChange={(e) => setFormProperty({ ...formProperty, rooms: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Tamanho m²</label>
                    <input type="number" value={formProperty.sizeSqM} onChange={(e) => setFormProperty({ ...formProperty, sizeSqM: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingProperty ? "Atualizar Imóvel" : "Sincronizar Imóvel"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Revenue */}
            {modalType === "revenue" && (
              <form onSubmit={submitRevenue} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Imóvel</label>
                  <select value={formRevenue.propertyId} onChange={(e) => setFormRevenue({ ...formRevenue, propertyId: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Origem do Faturamento</label>
                  <select value={formRevenue.origin} onChange={(e) => setFormRevenue({ ...formRevenue, origin: e.target.value as PropertyOrigin })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {Object.values(PropertyOrigin).map(or => (
                      <option key={or} value={or}>{or}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Valor Pago (R$)</label>
                    <input type="number" step="0.01" required value={formRevenue.value} onChange={(e) => setFormRevenue({ ...formRevenue, value: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Taxas / Comissão (R$)</label>
                    <input type="number" step="0.01" value={formRevenue.taxes} onChange={(e) => setFormRevenue({ ...formRevenue, taxes: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Data do Recebimento</label>
                  <input type="date" required value={formRevenue.date} onChange={(e) => setFormRevenue({ ...formRevenue, date: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Descrição de Lançamento</label>
                  <input type="text" value={formRevenue.description} onChange={(e) => setFormRevenue({ ...formRevenue, description: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="ex: Pacote de Outono reserva 6 dias" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingRevenue ? "Atualizar Faturamento" : "Salvar Faturamento"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Expense */}
            {modalType === "expense" && (
              <form onSubmit={submitExpense} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Imóvel Destino</label>
                  <select value={formExpense.propertyId} onChange={(e) => setFormExpense({ ...formExpense, propertyId: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Categoria de Despesa</label>
                  <select value={formExpense.category} onChange={(e) => setFormExpense({ ...formExpense, category: e.target.value as ExpenseCategory })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {Object.values(ExpenseCategory).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Fornecedor / Beneficiário</label>
                    <input type="text" required value={formExpense.supplier} onChange={(e) => setFormExpense({ ...formExpense, supplier: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="ex: ClimaMax Co" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Valor Total (R$)</label>
                    <input type="number" step="0.01" required value={formExpense.value} onChange={(e) => setFormExpense({ ...formExpense, value: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Método Pagamento</label>
                    <input type="text" value={formExpense.paymentMethod} onChange={(e) => setFormExpense({ ...formExpense, paymentMethod: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="Pix, boleto, cartão" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Data Pagamento</label>
                    <input type="date" required value={formExpense.date} onChange={(e) => setFormExpense({ ...formExpense, date: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Descrição / Notas</label>
                  <input type="text" value={formExpense.description} onChange={(e) => setFormExpense({ ...formExpense, description: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="Reforma de fiação lateral" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingExpense ? "Atualizar Despesa" : "Sincronizar Despesa"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Booking */}
            {modalType === "booking" && (
              <form onSubmit={submitBooking} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Imóvel Reservado</label>
                  <select value={formBooking.propertyId} onChange={(e) => setFormBooking({ ...formBooking, propertyId: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome do Hóspede Principal</label>
                  <input type="text" required value={formBooking.guestName} onChange={(e) => setFormBooking({ ...formBooking, guestName: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="ex: Roberto Silveira" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">WhatsApp / Telefone (para testes)</label>
                  <input type="text" required value={formBooking.phone} onChange={(e) => setFormBooking({ ...formBooking, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" placeholder="ex: +5511999998888" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Origem / Canal</label>
                    <select value={formBooking.origin} onChange={(e) => setFormBooking({ ...formBooking, origin: e.target.value as PropertyOrigin })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                      {Object.values(PropertyOrigin).map(or => (
                        <option key={or} value={or}>{or}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Status Reserva</label>
                    <select value={formBooking.status} onChange={(e) => setFormBooking({ ...formBooking, status: e.target.value as BookingStatus })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                      {Object.values(BookingStatus).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Check-In</label>
                    <input type="date" required value={formBooking.checkIn} onChange={(e) => setFormBooking({ ...formBooking, checkIn: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Check-Out</label>
                    <input type="date" required value={formBooking.checkOut} onChange={(e) => setFormBooking({ ...formBooking, checkOut: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Valor Reserva (R$)</label>
                    <input type="number" required value={formBooking.value} onChange={(e) => setFormBooking({ ...formBooking, value: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Taxa/Comissão (R$)</label>
                    <input type="number" value={formBooking.commission} onChange={(e) => setFormBooking({ ...formBooking, commission: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingBooking ? "Atualizar Reserva" : "Fechar Reserva"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Asset */}
            {modalType === "asset" && (
              <form onSubmit={submitAsset} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Imóvel</label>
                  <select value={formAsset.propertyId} onChange={(e) => setFormAsset({ ...formAsset, propertyId: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome do Ativo / Bem Físico</label>
                  <input type="text" required value={formAsset.name} onChange={(e) => setFormAsset({ ...formAsset, name: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="Ar Condicionado Split 24K" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Categoria Patrimonial</label>
                  <select value={formAsset.category} onChange={(e) => setFormAsset({ ...formAsset, category: e.target.value as AssetCategory })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {Object.values(AssetCategory).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Valor Pago (R$)</label>
                    <input type="number" required value={formAsset.value} onChange={(e) => setFormAsset({ ...formAsset, value: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Anos de Vida Útil</label>
                    <input type="number" value={formAsset.lifeSpanYears} onChange={(e) => setFormAsset({ ...formAsset, lifeSpanYears: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Data Compra</label>
                    <input type="date" required value={formAsset.purchaseDate} onChange={(e) => setFormAsset({ ...formAsset, purchaseDate: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Garantia Até</label>
                    <input type="date" value={formAsset.warrantyUntil} onChange={(e) => setFormAsset({ ...formAsset, warrantyUntil: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingAsset ? "Atualizar Ativo" : "Registrar Ativo"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Maintenance */}
            {modalType === "maintenance" && (
              <form onSubmit={submitMaint} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-mono">Imóvel</label>
                  <select value={formMaint.propertyId} onChange={(e) => setFormMaint({ ...formMaint, propertyId: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Título da Manutenção</label>
                  <input type="text" required value={formMaint.title} onChange={(e) => setFormMaint({ ...formMaint, title: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" placeholder="ex: Dedetização de insetos" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Tipo</label>
                    <select value={formMaint.type} onChange={(e) => setFormMaint({ ...formMaint, type: e.target.value as MaintenanceType })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                      {Object.values(MaintenanceType).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-mono">Status</label>
                    <select value={formMaint.status} onChange={(e) => setFormMaint({ ...formMaint, status: e.target.value as MaintenanceStatus })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-xs font-sans">
                      {Object.values(MaintenanceStatus).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Custo Estimado (R$)</label>
                    <input type="number" required value={formMaint.cost} onChange={(e) => setFormMaint({ ...formMaint, cost: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block font-sans">Data Programada</label>
                    <input type="date" required value={formMaint.date} onChange={(e) => setFormMaint({ ...formMaint, date: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-sans">Notas Adicionais</label>
                  <input type="text" value={formMaint.notes} onChange={(e) => setFormMaint({ ...formMaint, notes: e.target.value })} className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingMaintenance ? "Atualizar Lançamento" : "Agendar Lançamento"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Supplier */}
            {modalType === "supplier" && (
              <form onSubmit={submitSupplier} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome do Fornecedor</label>
                  <input 
                    type="text" 
                    required 
                    value={formSupplier.name} 
                    onChange={(e) => setFormSupplier({ ...formSupplier, name: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" 
                    placeholder="ex: ClimaMax Ar-Condicionados" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Especialidade / Ramo</label>
                  <input 
                    type="text" 
                    required 
                    value={formSupplier.specialty} 
                    onChange={(e) => setFormSupplier({ ...formSupplier, specialty: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" 
                    placeholder="ex: Refrigeração e Climatização" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome do Contato</label>
                  <input 
                    type="text" 
                    required 
                    value={formSupplier.contactName} 
                    onChange={(e) => setFormSupplier({ ...formSupplier, contactName: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" 
                    placeholder="ex: Carlos Silveira" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Telefone</label>
                    <input 
                      type="text" 
                      required 
                      value={formSupplier.phone} 
                      onChange={(e) => setFormSupplier({ ...formSupplier, phone: e.target.value })} 
                      className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                      placeholder="ex: (11) 98888-7777" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">E-mail</label>
                    <input 
                      type="email" 
                      value={formSupplier.email} 
                      onChange={(e) => setFormSupplier({ ...formSupplier, email: e.target.value })} 
                      className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                      placeholder="ex: carlos@climamax.com" 
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingSupplier ? "Atualizar Fornecedor" : "Cadastrar Fornecedor"}
                  </button>
                </div>
              </form>
            )}

            {/* FORM: Document */}
            {modalType === "document" && (
              <form onSubmit={submitDocument} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Nome do Arquivo</label>
                  <input 
                    type="text" 
                    required 
                    value={formDocument.name} 
                    onChange={(e) => setFormDocument({ ...formDocument, name: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                    placeholder="ex: Contrato_Aluguel_Mayla.pdf" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Tipo de Documento</label>
                  <select 
                    value={formDocument.type} 
                    onChange={(e) => setFormDocument({ ...formDocument, type: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs"
                  >
                    <option value="Contrato">Contrato</option>
                    <option value="Regulamento">Regulamento</option>
                    <option value="Recibo">Recibo</option>
                    <option value="Laudo">Laudo</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Breve Descrição</label>
                  <input 
                    type="text" 
                    required 
                    value={formDocument.description} 
                    onChange={(e) => setFormDocument({ ...formDocument, description: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-sans text-xs" 
                    placeholder="ex: Acordo anual de zeladoria" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Data de Emissão</label>
                    <input 
                      type="date" 
                      required 
                      value={formDocument.date} 
                      onChange={(e) => setFormDocument({ ...formDocument, date: e.target.value })} 
                      className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Tamanho (MB/KB)</label>
                    <input 
                      type="text" 
                      value={formDocument.fileSize} 
                      onChange={(e) => setFormDocument({ ...formDocument, fileSize: e.target.value })} 
                      className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                      placeholder="ex: 1.5 MB" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">URL do Arquivo (opcional)</label>
                  <input 
                    type="text" 
                    value={formDocument.fileUrl} 
                    onChange={(e) => setFormDocument({ ...formDocument, fileUrl: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white font-mono text-xs" 
                    placeholder="ex: https://storage.google.com/..." 
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalType(null)} className="w-1/2 border border-slate-850 text-slate-400 hover:text-white py-2 rounded cursor-pointer transition-all">Cancelar</button>
                  <button type="submit" className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-accent-purple-hover transition-all">
                    {editingDocument ? "Atualizar Documento" : "Salvar Documento"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ADD REMINDER MODAL */}
      {isAddReminderOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => {
                setIsAddReminderOpen(false);
                setEditingReminderId(null);
                setNewReminderTitle("");
                setNewReminderGuest("");
                setNewReminderPhone("+55");
                setNewReminderTime("12:00");
                setNewReminderDesc("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="font-display font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-amber-400" />
              {editingReminderId ? "Editar Compromisso" : `Agendar Compromisso (Dia ${selectedDay}/06)`}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingReminderId) {
                setReminders(prev => prev.map(rem => rem.id === editingReminderId ? {
                  ...rem,
                  title: newReminderTitle || "Manutenção Geral",
                  guestName: newReminderGuest || "Não especificado",
                  phone: newReminderPhone || "+55",
                  time: newReminderTime || "12:00",
                  description: newReminderDesc || ""
                } : rem));
                setEditingReminderId(null);
              } else {
                const newRem = {
                  id: `rem-${Date.now()}`,
                  title: newReminderTitle || "Manutenção Geral",
                  guestName: newReminderGuest || "Não especificado",
                  phone: newReminderPhone || "+55",
                  time: newReminderTime || "12:00",
                  day: selectedDay,
                  month: selectedMonth,
                  year: selectedYear,
                  description: newReminderDesc || ""
                };
                setReminders(prev => [...prev, newRem]);
              }
              setIsAddReminderOpen(false);
              // Clear fields
              setNewReminderTitle("");
              setNewReminderGuest("");
              setNewReminderPhone("+55");
              setNewReminderTime("12:00");
              setNewReminderDesc("");
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-semibold">Título do Lembrete</label>
                <input 
                  type="text" 
                  required 
                  value={newReminderTitle} 
                  onChange={e => setNewReminderTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-sm" 
                  placeholder="ex: Check-in de Hóspedes, Limpeza Piscina"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-semibold">Contato / Responsável</label>
                <input 
                  type="text" 
                  required 
                  value={newReminderGuest} 
                  onChange={e => setNewReminderGuest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-sm" 
                  placeholder="ex: Hóspede Lilian, Faxineira Maria"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-semibold">WhatsApp (Brasil)</label>
                  <input 
                    type="text" 
                    required 
                    value={newReminderPhone} 
                    onChange={e => setNewReminderPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-sm font-mono" 
                    placeholder="ex: +5511999998888"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block font-semibold">Horário</label>
                  <input 
                    type="time" 
                    required 
                    value={newReminderTime} 
                    onChange={e => setNewReminderTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-semibold">Descrição / Detalhes</label>
                <textarea 
                  value={newReminderDesc} 
                  onChange={e => setNewReminderDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-white text-sm resize-none" 
                  placeholder="Instruções para a notificação do whatsapp..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddReminderOpen(false);
                    setEditingReminderId(null);
                    setNewReminderTitle("");
                    setNewReminderGuest("");
                    setNewReminderPhone("+55");
                    setNewReminderTime("12:00");
                    setNewReminderDesc("");
                  }}
                  className="w-1/2 border border-slate-800 text-slate-400 hover:text-white py-2 rounded-lg text-sm transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-accent-purple text-white py-2 rounded-lg font-semibold text-sm hover:bg-accent-purple-hover transition-all"
                >
                  {editingReminderId ? "Salvar Alterações" : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Select Sensei Chat */}
      <button
        id="btn-floating-chat"
        onClick={() => setActiveTab("ai-bot")}
        className="fixed bottom-6 right-6 w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer z-40 animate-bounce"
        style={{ 
          animationDuration: "3s", 
          backgroundColor: darkMode ? "#dfb26c" : "#b89047",
          boxShadow: darkMode ? "0 10px 30px rgba(223, 178, 108, 0.35)" : "0 10px 30px rgba(184, 144, 71, 0.3)" 
        }}
        title="Conversar com Select Sensei"
      >
        <Sparkles size={20} className="text-white" />
      </button>

    </div>
  );
}
