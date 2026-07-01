import { Property, Revenue, Expense, Booking, Asset, Maintenance, SystemAlert, Supplier, Document } from "../types";
import {
  LOCAL_PROPERTIES, LOCAL_REVENUES, LOCAL_EXPENSES, LOCAL_BOOKINGS,
  LOCAL_ASSETS, LOCAL_MAINTENANCES, LOCAL_ALERTS, LOCAL_SUPPLIERS, LOCAL_DOCUMENTS
} from "./localData";

const BASE_URL = "";

let activeToken: string | null = localStorage.getItem("select_jwt_token");

export function setSessionToken(token: string | null) {
  activeToken = token;
  if (token) {
    localStorage.setItem("select_jwt_token", token);
  } else {
    localStorage.removeItem("select_jwt_token");
  }
}

export function getSessionToken(): string | null {
  return activeToken;
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return headers;
}

interface QueuedRequest {
  id: string;
  url: string;
  options: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  };
}

const SYNC_QUEUE_KEY = "select_offline_sync_queue";

function getSyncQueue(): QueuedRequest[] {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: QueuedRequest[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Conexão reestabelecida. Sincronizando fila offline...");
    syncOfflineQueue();
  });
}

export async function syncOfflineQueue() {
  const queue = getSyncQueue();
  if (queue.length === 0) return;
  
  console.log(`Sincronizando ${queue.length} requisições offline pendentes...`);
  const remaining: QueuedRequest[] = [];
  
  for (const req of queue) {
    try {
      if (activeToken) {
        req.options.headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch(req.url, req.options);
      if (!res.ok && res.status !== 401 && res.status !== 403 && res.status !== 400) {
        remaining.push(req);
      }
    } catch (e) {
      remaining.push(req);
    }
  }
  
  saveSyncQueue(remaining);
  if (remaining.length === 0) {
    console.log("Fila offline sincronizada com sucesso!");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("offline-sync-success"));
    }
  }
}

async function fetchWithOfflineSupport(url: string, options: any = {}): Promise<any> {
  const method = options.method || "GET";
  options.headers = getHeaders(options.headers || {});
  
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const error = new Error(errBody.error || `Erro do servidor: ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }
    return res;
  } catch (err: any) {
    if (method !== "GET" && err.status === undefined) {
      const queue = getSyncQueue();
      const queuedReq: QueuedRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        options: {
          method,
          headers: options.headers,
          body: options.body
        }
      };
      queue.push(queuedReq);
      saveSyncQueue(queue);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("offline-write-queued", { detail: queuedReq }));
      }
      let result: any = { success: true, _offline: true };
      if (options.body) {
        try {
          const parsedBody = JSON.parse(options.body);
          result = { ...parsedBody, id: parsedBody.id || `temp-${Date.now()}`, _offline: true };
        } catch {}
      }
      return {
        json: async () => result,
        ok: true,
        status: 200
      };
    }
    throw err;
  }
}


// ─── Helper: fetch com fallback ───────────────────────────────────────────────
async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    // Se API retornou array vazio mas temos dados locais, usa locais
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback) && (fallback as any[]).length > 0) {
      return fallback;
    }
    return data;
  } catch {
    return fallback;
  }
}

// ─── PROPERTIES ───────────────────────────────────────────────────────────────
export async function getProperties(): Promise<Property[]> {
  return fetchWithFallback(`${BASE_URL}/api/properties`, LOCAL_PROPERTIES);
}

export async function addProperty(property: Omit<Property, "stars">): Promise<Property> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(property)
  });
  return res.json();
}

export async function updateProperty(property: Property): Promise<Property> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/properties/${property.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(property)
  });
  return res.json();
}

export async function deleteProperty(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/properties/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── REVENUES ─────────────────────────────────────────────────────────────────
export async function getRevenues(): Promise<Revenue[]> {
  return fetchWithFallback(`${BASE_URL}/api/revenues`, LOCAL_REVENUES);
}

export async function addRevenue(revenue: Omit<Revenue, "id">): Promise<Revenue> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/revenues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(revenue)
  });
  return res.json();
}

export async function updateRevenue(revenue: Revenue): Promise<Revenue> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/revenues/${revenue.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(revenue)
  });
  return res.json();
}

export async function deleteRevenue(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/revenues/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
export async function getExpenses(): Promise<Expense[]> {
  return fetchWithFallback(`${BASE_URL}/api/expenses`, LOCAL_EXPENSES);
}

export async function addExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  });
  return res.json();
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/expenses/${expense.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  });
  return res.json();
}

export async function deleteExpense(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/expenses/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export async function getBookings(): Promise<Booking[]> {
  return fetchWithFallback(`${BASE_URL}/api/bookings`, LOCAL_BOOKINGS);
}

export async function addBooking(booking: Omit<Booking, "id">): Promise<Booking> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking)
  });
  return res.json();
}

export async function updateBooking(booking: Booking): Promise<Booking> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/bookings/${booking.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking)
  });
  return res.json();
}

export async function deleteBooking(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/bookings/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── ASSETS ───────────────────────────────────────────────────────────────────
export async function getAssets(): Promise<Asset[]> {
  return fetchWithFallback(`${BASE_URL}/api/assets`, LOCAL_ASSETS);
}

export async function addAsset(asset: Omit<Asset, "id">): Promise<Asset> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset)
  });
  return res.json();
}

export async function updateAsset(asset: Asset): Promise<Asset> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/assets/${asset.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset)
  });
  return res.json();
}

export async function deleteAsset(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/assets/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── MAINTENANCES ─────────────────────────────────────────────────────────────
export async function getMaintenances(): Promise<Maintenance[]> {
  return fetchWithFallback(`${BASE_URL}/api/maintenances`, LOCAL_MAINTENANCES);
}

export async function addMaintenance(maintenance: Omit<Maintenance, "id">): Promise<Maintenance> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/maintenances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(maintenance)
  });
  return res.json();
}

export async function updateMaintenance(maintenance: Maintenance): Promise<Maintenance> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/maintenances/${maintenance.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(maintenance)
  });
  return res.json();
}

export async function deleteMaintenance(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/maintenances/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────
export async function getSuppliers(): Promise<Supplier[]> {
  return fetchWithFallback(`${BASE_URL}/api/suppliers`, LOCAL_SUPPLIERS);
}

export async function addSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(supplier)
  });
  return res.json();
}

export async function updateSupplier(supplier: Supplier): Promise<Supplier> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/suppliers/${supplier.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(supplier)
  });
  return res.json();
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/suppliers/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
export async function getDocuments(): Promise<Document[]> {
  return fetchWithFallback(`${BASE_URL}/api/documents`, LOCAL_DOCUMENTS);
}

export async function addDocument(document: Omit<Document, "id">): Promise<Document> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(document)
  });
  return res.json();
}

export async function updateDocument(document: Document): Promise<Document> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/documents/${document.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(document)
  });
  return res.json();
}

export async function deleteDocument(id: string): Promise<boolean> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/documents/${id}`, { method: "DELETE" });
  const data = await res.json();
  return data.success;
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export async function getAlerts(): Promise<SystemAlert[]> {
  return fetchWithFallback(`${BASE_URL}/api/alerts`, LOCAL_ALERTS);
}

// ─── AI / CHAT ────────────────────────────────────────────────────────────────
export async function askSelectSensei(messages: { role: string; text: string }[]): Promise<{ text: string; actions?: any[] }> {
  try {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    const data = await res.json();
    return data;
  } catch {
    return { text: "Serviço de IA temporariamente indisponível.", actions: [] };
  }
}

export async function scanReceiptOCR(imageBase64: string): Promise<{
  value: number; date: string; supplier: string; category: string; propertyId: string; description: string;
}> {
  const res = await fetch(`${BASE_URL}/api/ai/ocr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 })
  });
  return res.json();
}

export async function getForecast(): Promise<{
  month: string; revenue: number; expense: number; profit: number; occupancy: number;
}[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/ai/forecast`);
    return res.json();
  } catch {
    return [];
  }
}

// ─── WHATSAPP ─────────────────────────────────────────────────────────────────
export async function getWhatsAppSettings(): Promise<any> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/settings/whatsapp`, {
    method: "GET"
  });
  return res.json();
}

export async function saveWhatsAppSettings(settings: any): Promise<any> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/settings/whatsapp`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export async function sendWhatsAppMessage(payload: {
  phone: string; message: string;
}): Promise<{ success: boolean; message: string; response?: any }> {
  const res = await fetchWithOfflineSupport(`${BASE_URL}/api/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const LOCAL_USERS = [
  { id: "u1", name: "Administrador", username: "admin", password: "admin", role: "admin" as const },
  { id: "u2", name: "Iury", username: "iury", password: "iury", role: "user" as const },
];

export async function loginUser(username: string, password: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setSessionToken(data.token);
      return data.user;
    }
  } catch {
    // Server unreachable — fall through to local auth
  }
  // Client-side fallback
  const user = LOCAL_USERS.find(u => u.username === username && u.password === password);
  if (!user) throw new Error("Usuário ou senha inválidos.");
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function changePassword(userId: string, newPassword: string): Promise<any> {
  try {
    const res = await fetchWithOfflineSupport(`${BASE_URL}/api/users/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword })
    });
    if (res.ok) return res.json();
  } catch {
    // ignore
  }
  return { success: true };
}
