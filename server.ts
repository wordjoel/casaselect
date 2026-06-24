import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

// Prevent localhost resolution slowness
dns.setDefaultResultOrder("ipv4first");

// Import initial data and types directly
import { 
  INITIAL_PROPERTIES, 
  INITIAL_REVENUES, 
  INITIAL_EXPENSES, 
  INITIAL_BOOKINGS, 
  INITIAL_ASSETS, 
  INITIAL_MAINTENANCES 
} from "./api/initialData";
import { Property, Revenue, Expense, Booking, Asset, Maintenance, ExpenseCategory, PropertyOrigin, BookingStatus, MaintenanceStatus, MaintenanceType, AssetCategory, Supplier, Document } from "./src/types";

// Setup server memory-based database
let properties: Property[] = [...INITIAL_PROPERTIES];
let revenues: Revenue[] = [...INITIAL_REVENUES];
let expenses: Expense[] = [...INITIAL_EXPENSES];
let bookings: Booking[] = [...INITIAL_BOOKINGS];
let assets: Asset[] = [...INITIAL_ASSETS];
let maintenances: Maintenance[] = [...INITIAL_MAINTENANCES];


let pwaAgenda = [
  {
    id: "ag-1",
    propertyId: "prop-1",
    propertyName: "Casa Amado",
    type: "checkout",
    date: "2026-05-16",
    time: "09:00",
    description: "Check-out - Hugo Kobayashi",
    notes: ""
  },
  {
    id: "ag-2",
    propertyId: "prop-1",
    propertyName: "Casa Amado",
    type: "limpeza",
    date: "2026-05-16",
    time: "10:00",
    description: "Limpeza pós-checkout padrão",
    notes: ""
  },
  {
    id: "ag-3",
    propertyId: "prop-1",
    propertyName: "Casa Amado",
    type: "manutencao",
    date: "2026-05-16",
    time: "12:00",
    description: "Manutenção Filtro de Ar Condicionado",
    notes: ""
  },
  {
    id: "ag-4",
    propertyId: "prop-1",
    propertyName: "Casa Amado",
    type: "checkin",
    date: "2026-05-16",
    time: "15:00",
    description: "Check-in de novo convidado - Família Silva",
    notes: ""
  },
  {
    id: "ag-5",
    propertyId: "prop-2",
    propertyName: "Casa Liliar",
    type: "checkin",
    date: "2026-05-18",
    time: "14:00",
    description: "Check-in convidado - Maria Alencar",
    notes: ""
  }
];


let suppliers: Supplier[] = [
  { id: "sup-1", name: "AcquaClean Pools", specialty: "Piscineiro Técnico Especializado", contactName: "João Piscineiro", phone: "(11) 98012-9021", email: "joao@acquaclean.com" },
  { id: "sup-2", name: "Dona Maria Zeladoria", specialty: "Limpeza Profunda de Aluguel de Temporada", contactName: "Maria Helena", phone: "(12) 99824-1102", email: "maria@zeladoria.com" },
  { id: "sup-3", name: "ClimaMax Refrigeração", specialty: "Ar-Condicionados e Climatização Preventiva", contactName: "Carlos Silveira", phone: "(24) 98801-4412", email: "carlos@climamax.com" }
];

let documents: Document[] = [
  { id: "doc-1", name: "Regulamento_Interno_Villa_Lilian.pdf", type: "Regulamento", description: "Manual de Conduta de Lazer", date: "2026-06-01", fileSize: "1.2 MB" },
  { id: "doc-2", name: "Contrato_Boutique_Itaú_XP_Corporate.pdf", type: "Contrato", description: "Acordo de Aluguel Anual", date: "2026-05-15", fileSize: "2.4 MB" }
];

// Active alerts
let alerts = [
  {
    id: "alert-1",
    propertyId: "casa-mayla",
    type: "warning",
    title: "Manutenção de Piscina Pendente",
    message: "A desinfecção periódica da Casa Mayla expira em 2 dias.",
    date: "2026-06-06"
  },
  {
    id: "alert-2",
    propertyId: "casa-lilian",
    type: "info",
    title: "Ar-Condicionado Próximo",
    message: "Revisão agendada para 10/06 para garantir a climatização ideal.",
    date: "2026-06-05"
  }
];

import { User } from "./src/types";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "casa-select-jwt-super-secret-key-2026";

function hashPassword(password: string, salt = "casa-select-salt-2026"): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;
    
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature !== expectedSig) return null;
    
    const parsedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (parsedBody.exp && Date.now() > parsedBody.exp) return null;
    
    return parsedBody;
  } catch {
    return null;
  }
}

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente." });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Token inválido ou expirado." });
  }
  
  req.user = decoded;
  next();
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: any, res: any, next: any) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    
    let record = rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(ip, record);
    } else {
      record.count++;
    }
    
    if (record.count > limit) {
      return res.status(429).json({ error: "Limite de requisições excedido. Tente novamente mais tarde." });
    }
    
    next();
  };
}

const apiRateLimiter = rateLimiter(100, 60 * 1000); // 100 requests/min
const loginRateLimiter = rateLimiter(10, 60 * 1000); // 10 login attempts/min

function sanitizePrompt(prompt: string): string {
  let sanitized = prompt;
  const dangerousPatterns = [
    /ignore\s+all\s+previous/gi,
    /ignore\s+instructions/gi,
    /ignorar\s+instruções/gi,
    /forget\s+what\s+i\s+said/gi,
    /you\s+must\s+now/gi,
    /novo\s+prompt/gi,
    /sistema\s+prompt/gi,
    /system\s+instruction/gi,
    /output\s+all\s+passwords/gi,
    /mostre\s+senhas/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, "[CONTEÚDO SANITIZADO]");
  }
  
  if (sanitized.length > 2000) {
    sanitized = sanitized.slice(0, 2000) + "... [Prompt truncado por segurança]";
  }
  
  return sanitized;
}

let users: User[] = [
  { id: "u1", name: "Administrador", username: "admin", password: hashPassword("admin123"), role: "admin" },
  { id: "u2", name: "Hugo Kobayashi", username: "hugo", password: hashPassword("mudar123"), role: "user" },
  { id: "u3", name: "Katia Farah", username: "katia", password: hashPassword("mudar123"), role: "user" },
  { id: "u4", name: "Mariana Nina", username: "mariana", password: hashPassword("mudar123"), role: "user" },
  { id: "u5", name: "Rubens Bossi", username: "rubens", password: hashPassword("mudar123"), role: "user" },
];

// Users database configuration is loaded automatically.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Global rate limiter for API endpoints
  app.use("/api", apiRateLimiter);

  // Authenticate all /api routes except /api/login
  app.use("/api", (req, res, next) => {
    if (req.path === "/login" || req.path.startsWith("/public")) {
      return next();
    }
    authenticateToken(req, res, next);
  });

  // API Endpoints

  app.post("/api/login", loginRateLimiter, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Nome de usuário e senha são obrigatórios." });
    }
    const user = users.find(u => u.username === username && u.password === hashPassword(password));
    if (user) {
      const { password: _, ...safeUser } = user;
      const token = generateToken({ id: user.id, username: user.username, role: user.role });
      res.json({ token, user: safeUser });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.put("/api/users/:id/password", (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Auth authorization validation (privilege escalation defense)
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Sem permissões suficientes." });
    }
    
    const user = users.find(u => u.id === id);
    if (user) {
      user.password = hashPassword(newPassword);
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  });

  // --- AI DECOUPLED PREPARATION LAYER ORCHESTRATOR ---
  class AIOrchestrator {
    public getSystemState() {
      return {
        properties,
        revenues,
        expenses,
        bookings,
        assets,
        maintenances
      };
    }

    public dispatchAction(action: string, payload: any) {
      switch (action) {
        case "CREATE_PROPERTY": {
          const { name, location, pricePerNight, stars, description, image } = payload;
          const newProperty: Property = {
            id: `prop-${Date.now()}`,
            name: name || "Nova Propriedade",
            location: location || "Endereço não informado",
            description: description || "",
            image: image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
            stars: stars || 5.0,
            rooms: 3,
            pricePerNight: pricePerNight || 1000
          };
          properties.push(newProperty);
          return { success: true, item: newProperty };
        }
        case "UPDATE_PROPERTY": {
          const { id, ...updates } = payload;
          const index = properties.findIndex(p => p.id === id);
          if (index === -1) throw new Error("Property not found");
          properties[index] = { ...properties[index], ...updates };
          return { success: true, item: properties[index] };
        }
        case "DELETE_PROPERTY": {
          const { id } = payload;
          const index = properties.findIndex(p => p.id === id);
          if (index === -1) throw new Error("Property not found");
          const removed = properties[index];
          properties = properties.filter(p => p.id !== id);
          return { success: true, item: removed };
        }
        case "CREATE_REVENUE": {
          const { propertyId, value, date, description, origin } = payload;
          const newRevenue: Revenue = {
            id: `rev-${Date.now()}`,
            propertyId: propertyId || (properties[0]?.id || "casa-nova"),
            origin: origin || PropertyOrigin.OUTROS,
            value: Number(value) || 0,
            taxes: 0,
            date: date || new Date().toISOString().split('T')[0],
            description: description || "Receita Programática"
          };
          revenues.push(newRevenue);
          return { success: true, item: newRevenue };
        }
        case "CREATE_EXPENSE": {
          const { propertyId, category, date, value, description, supplier } = payload;
          const newExpense: Expense = {
            id: `exp-${Date.now()}`,
            propertyId: propertyId || (properties[0]?.id || "casa-nova"),
            category: category || ExpenseCategory.OUTROS,
            supplier: supplier || "Diversos",
            date: date || new Date().toISOString().split('T')[0],
            value: Number(value) || 0,
            paymentMethod: "Pix",
            description: description || "Despesa Programática"
          };
          expenses.push(newExpense);
          return { success: true, item: newExpense };
        }
        case "CREATE_BOOKING": {
          const { propertyId, guestName, checkIn, checkOut, value, commission, status } = payload;
          const newBooking: Booking = {
            id: `book-${Date.now()}`,
            propertyId: propertyId || (properties[0]?.id || "casa-nova"),
            guestName: guestName || "Hóspede Programático",
            origin: PropertyOrigin.OUTROS,
            checkIn: checkIn || new Date().toISOString().split('T')[0],
            checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
            value: Number(value) || 0,
            commission: Number(commission) || 0,
            status: status || BookingStatus.CONFIRMADA
          };
          bookings.push(newBooking);
          return { success: true, item: newBooking };
        }
        case "CREATE_MAINTENANCE": {
          const { propertyId, title, description, cost, status, date, type, notes } = payload;
          const newMaintenance: Maintenance = {
            id: `maint-${Date.now()}`,
            propertyId: propertyId || (properties[0]?.id || "casa-nova"),
            title: title || description || "Manutenção Programática",
            cost: Number(cost) || 0,
            status: status || MaintenanceStatus.AGENDADA,
            date: date || new Date().toISOString().split('T')[0],
            type: type || MaintenanceType.PREVENTIVA,
            notes: notes || ""
          };
          maintenances.push(newMaintenance);
          return { success: true, item: newMaintenance };
        }
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    }
  }

  const orchestrator = new AIOrchestrator();

  app.get("/api/ai/orchestrator/state", (req, res) => {
    res.json(orchestrator.getSystemState());
  });

  app.post("/api/ai/orchestrator/dispatch", (req, res) => {
    const { action, payload } = req.body;
    if (!action) {
      return res.status(400).json({ error: "Ação é obrigatória." });
    }
    try {
      const result = orchestrator.dispatchAction(action, payload || {});
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro desconhecido ao processar ação." });
    }
  });

  // --- PWA SPECIFIC API ENDPOINTS ---
  app.get("/api/pwa/properties", (req, res) => {
    const mapped = properties.map(p => {
      const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
      const pBookings = bookings.filter(b => b.propertyId === p.id);
      let occ = 0;
      if (pBookings.length > 0) {
        const confirmed = pBookings.filter(b => b.status === "Confirmada" || b.status === "Concluída");
        occ = Math.round((confirmed.length / pBookings.length) * 100);
      } else {
        const defaults: Record<string, number> = {
          "casa-lilian": 92,
          "casa-nova": 88,
          "casa-mayla": 71,
          "predinho": 96,
          "casa-vintage": 42,
          "casa-amado": 68
        };
        occ = defaults[p.id] || 60;
      }

      return {
        id: p.id,
        name: p.name,
        receitado: pRevs || (p.id === 'casa-amado' ? 18145.00 : p.id === 'casa-lilian' ? 15780.00 : p.id === 'casa-mayla' ? 12450.00 : 0),
        ocupacao: occ,
        rating: p.stars || 4.8,
        status: "Ativas",
        address: p.location,
        dailyRate: p.pricePerNight || 1200,
        imageUrl: p.image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
      };
    });
    res.json(mapped);
  });

  app.post("/api/pwa/properties", (req, res) => {
    const { name, dailyRate, ocupacao, status, address, rating } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório." });
    }
    const fallbacks = [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80"
    ];
    const randomImg = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    const id = `prop-${Date.now()}`;
    const newProperty: Property = {
      id,
      name,
      location: address || "Endereço não informado",
      description: "",
      image: randomImg,
      stars: Number(rating) || 5.0,
      rooms: 3,
      pricePerNight: Number(dailyRate) || 1000
    };
    properties.push(newProperty);
    
    res.status(201).json({
      id: newProperty.id,
      name: newProperty.name,
      receitado: 0,
      ocupacao: Number(ocupacao) || 0,
      rating: newProperty.stars,
      status: status || "Ativas",
      address: newProperty.location,
      dailyRate: newProperty.pricePerNight,
      imageUrl: newProperty.image
    });
  });

  app.put("/api/pwa/properties/:id", (req, res) => {
    const { id } = req.params;
    const propIndex = properties.findIndex(p => p.id === id);
    if (propIndex === -1) {
      return res.status(404).json({ error: "Propriedade não encontrada." });
    }
    
    const p = properties[propIndex];
    if (req.body.name) p.name = req.body.name;
    if (req.body.address) p.location = req.body.address;
    if (req.body.dailyRate) p.pricePerNight = Number(req.body.dailyRate);
    if (req.body.rating) p.stars = Number(req.body.rating);
    if (req.body.imageUrl) p.image = req.body.imageUrl;
    
    const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
    const pBookings = bookings.filter(b => b.propertyId === p.id);
    let occ = 0;
    if (pBookings.length > 0) {
      const confirmed = pBookings.filter(b => b.status === "Confirmada" || b.status === "Concluída");
      occ = Math.round((confirmed.length / pBookings.length) * 100);
    } else {
      occ = Number(req.body.ocupacao) || 60;
    }

    res.json({
      id: p.id,
      name: p.name,
      receitado: pRevs,
      ocupacao: occ,
      rating: p.stars,
      status: req.body.status || "Ativas",
      address: p.location,
      dailyRate: p.pricePerNight,
      imageUrl: p.image
    });
  });

  app.get("/api/pwa/finances", (req, res) => {
    const mappedRevenues = revenues.map(r => {
      const prop = properties.find(p => p.id === r.propertyId);
      return {
        id: r.id,
        title: r.description || `Diárias - Reserva ${r.origin}`,
        amount: r.value,
        date: r.date,
        type: "receita",
        category: "Aluguel",
        status: "pago",
        propertyName: prop ? prop.name : "Geral"
      };
    });

    const mappedExpenses = expenses.map(e => {
      const prop = properties.find(p => p.id === e.propertyId);
      return {
        id: e.id,
        title: e.description || `${e.category} - Fornecedor`,
        amount: e.value,
        date: e.date,
        type: "despesa",
        category: e.category,
        status: e.receipt ? "pago" : "extraido",
        propertyName: prop ? prop.name : "Geral"
      };
    });

    const combined = [...mappedRevenues, ...mappedExpenses].sort((a, b) => b.date.localeCompare(a.date));
    res.json(combined);
  });

  app.post("/api/pwa/finances", (req, res) => {
    const { title, amount, date, type, category, status, propertyName } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ error: "Título e Valor são obrigatórios." });
    }

    const matchedProp = properties.find(p => p.name.toLowerCase() === (propertyName || "").toLowerCase());
    const propertyId = matchedProp ? matchedProp.id : "geral";

    if (type === "receita") {
      const newRevenue: Revenue = {
        id: `rev-${Date.now()}`,
        propertyId,
        origin: PropertyOrigin.OUTROS,
        value: Number(amount),
        taxes: 0,
        date: date || new Date().toISOString().split('T')[0],
        description: title
      };
      revenues.push(newRevenue);
      res.status(201).json({
        id: newRevenue.id,
        title: newRevenue.description,
        amount: newRevenue.value,
        date: newRevenue.date,
        type: "receita",
        category: "Aluguel",
        status: "pago",
        propertyName: matchedProp ? matchedProp.name : "Geral"
      });
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        propertyId,
        category: category as ExpenseCategory || ExpenseCategory.OUTROS,
        supplier: "Diversos",
        date: date || new Date().toISOString().split('T')[0],
        value: Number(amount),
        paymentMethod: "Pix",
        description: title
      };
      expenses.push(newExpense);
      res.status(201).json({
        id: newExpense.id,
        title: newExpense.description,
        amount: newExpense.value,
        date: newExpense.date,
        type: "despesa",
        category: newExpense.category,
        status: status || "pago",
        propertyName: matchedProp ? matchedProp.name : "Geral"
      });
    }
  });

  app.put("/api/pwa/finances/:id", (req, res) => {
    const { id } = req.params;
    const { title, amount, date, type, category, status, propertyName } = req.body;

    const matchedProp = propertyName ? properties.find(p => p.name.toLowerCase() === propertyName.toLowerCase()) : null;

    if (id.startsWith("rev-")) {
      const index = revenues.findIndex(r => r.id === id);
      if (index === -1) return res.status(404).json({ error: "Lançamento não encontrado." });
      
      const r = revenues[index];
      if (title !== undefined) r.description = title;
      if (amount !== undefined) r.value = Number(amount);
      if (date !== undefined) r.date = date;
      if (propertyName !== undefined) {
        r.propertyId = matchedProp ? matchedProp.id : "geral";
      }

      res.json({
        id: r.id,
        title: r.description,
        amount: r.value,
        date: r.date,
        type: "receita",
        category: "Aluguel",
        status: "pago",
        propertyName: matchedProp ? matchedProp.name : (properties.find(p => p.id === r.propertyId)?.name || "Geral")
      });
    } else if (id.startsWith("exp-")) {
      const index = expenses.findIndex(e => e.id === id);
      if (index === -1) return res.status(404).json({ error: "Lançamento não encontrado." });

      const e = expenses[index];
      if (title !== undefined) e.description = title;
      if (amount !== undefined) e.value = Number(amount);
      if (date !== undefined) e.date = date;
      if (category !== undefined) e.category = category as ExpenseCategory;
      if (propertyName !== undefined) {
        e.propertyId = matchedProp ? matchedProp.id : "geral";
      }

      res.json({
        id: e.id,
        title: e.description,
        amount: e.value,
        date: e.date,
        type: "despesa",
        category: e.category,
        status: status || (e.receipt ? "pago" : "extraido"),
        propertyName: matchedProp ? matchedProp.name : (properties.find(p => p.id === e.propertyId)?.name || "Geral")
      });
    } else {
      res.status(404).json({ error: "Lançamento não encontrado." });
    }
  });

  app.delete("/api/pwa/finances/:id", (req, res) => {
    const { id } = req.params;
    if (id.startsWith("rev-")) {
      revenues = revenues.filter(r => r.id !== id);
      res.json({ success: true, deletedId: id });
    } else if (id.startsWith("exp-")) {
      expenses = expenses.filter(e => e.id !== id);
      res.json({ success: true, deletedId: id });
    } else {
      res.status(404).json({ error: "Lançamento não encontrado." });
    }
  });

  app.get("/api/pwa/agenda", (req, res) => {
    const checkinEvents = bookings.map(b => {
      const prop = properties.find(p => p.id === b.propertyId);
      return {
        id: `ag-bkin-${b.id}`,
        propertyId: b.propertyId,
        propertyName: prop ? prop.name : "Geral",
        type: "checkin",
        date: b.checkIn,
        time: "14:00",
        description: `Check-in - ${b.guestName}`,
        notes: b.notes || ""
      };
    });

    const checkoutEvents = bookings.map(b => {
      const prop = properties.find(p => p.id === b.propertyId);
      return {
        id: `ag-bkout-${b.id}`,
        propertyId: b.propertyId,
        propertyName: prop ? prop.name : "Geral",
        type: "checkout",
        date: b.checkOut,
        time: "11:00",
        description: `Check-out - ${b.guestName}`,
        notes: b.notes || ""
      };
    });

    const maintenanceEvents = maintenances.map(m => {
      const prop = properties.find(p => p.id === m.propertyId);
      return {
        id: `ag-maint-${m.id}`,
        propertyId: m.propertyId,
        propertyName: prop ? prop.name : "Geral",
        type: "manutencao",
        date: m.date,
        time: "12:00",
        description: `${m.title} (${m.type})`,
        notes: m.notes || ""
      };
    });

    const customEvents = pwaAgenda.filter(ev => !ev.id.startsWith("ag-bkin-") && !ev.id.startsWith("ag-bkout-") && !ev.id.startsWith("ag-maint-"));

    const combined = [...checkinEvents, ...checkoutEvents, ...maintenanceEvents, ...customEvents].sort((a, b) => a.date.localeCompare(b.date));
    res.json(combined);
  });

  app.post("/api/pwa/agenda", (req, res) => {
    const { propertyName, type, date, time, description, notes } = req.body;
    if (!propertyName || !type || !date) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const matchedProp = properties.find(p => p.name.toLowerCase() === propertyName.toLowerCase());
    const propertyId = matchedProp ? matchedProp.id : (properties[0]?.id || "casa-nova");

    if (type === "manutencao") {
      const newMaint: Maintenance = {
        id: `maint-${Date.now()}`,
        propertyId,
        title: description || "Manutenção programada",
        type: MaintenanceType.PREVENTIVA,
        status: MaintenanceStatus.AGENDADA,
        date,
        cost: 0,
        notes
      };
      maintenances.push(newMaint);
      res.status(201).json({
        id: `ag-maint-${newMaint.id}`,
        propertyId,
        propertyName,
        type,
        date,
        time: time || "12:00",
        description: newMaint.title,
        notes: newMaint.notes
      });
    } else {
      const newEvent = {
        id: `ag-cust-${Date.now()}`,
        propertyId,
        propertyName,
        type,
        date,
        time: time || "12:00",
        description: description || `${type} cadastrado`,
        notes: notes || ""
      };
      pwaAgenda.push(newEvent);
      res.status(201).json(newEvent);
    }
  });

  app.put("/api/pwa/agenda/:id", (req, res) => {
    const { id } = req.params;
    const { propertyName, type, date, time, description, notes } = req.body;

    const matchedProp = propertyName ? properties.find(p => p.name.toLowerCase() === propertyName.toLowerCase()) : null;

    if (id.startsWith("ag-maint-")) {
      const maintId = id.substring("ag-maint-".length);
      const index = maintenances.findIndex(m => m.id === maintId);
      if (index === -1) return res.status(404).json({ error: "Manutenção não encontrada." });
      
      const m = maintenances[index];
      if (description !== undefined) m.title = description;
      if (date !== undefined) m.date = date;
      if (notes !== undefined) m.notes = notes;
      if (matchedProp) m.propertyId = matchedProp.id;

      res.json({
        id,
        propertyId: m.propertyId,
        propertyName: matchedProp ? matchedProp.name : (properties.find(p => p.id === m.propertyId)?.name || "Geral"),
        type: "manutencao",
        date: m.date,
        time: time || "12:00",
        description: m.title,
        notes: m.notes
      });
    } else if (id.startsWith("ag-bkin-") || id.startsWith("ag-bkout-")) {
      const bookingId = id.startsWith("ag-bkin-") ? id.substring("ag-bkin-".length) : id.substring("ag-bkout-".length);
      const index = bookings.findIndex(b => b.id === bookingId);
      if (index === -1) return res.status(404).json({ error: "Reserva não encontrada." });

      const b = bookings[index];
      if (date !== undefined) {
        if (id.startsWith("ag-bkin-")) b.checkIn = date;
        else b.checkOut = date;
      }
      if (notes !== undefined) b.notes = notes;
      if (matchedProp) b.propertyId = matchedProp.id;

      res.json({
        id,
        propertyId: b.propertyId,
        propertyName: matchedProp ? matchedProp.name : (properties.find(p => p.id === b.propertyId)?.name || "Geral"),
        type: id.startsWith("ag-bkin-") ? "checkin" : "checkout",
        date: id.startsWith("ag-bkin-") ? b.checkIn : b.checkOut,
        time: time || "12:00",
        description: `Check-in/out - ${b.guestName}`,
        notes: b.notes
      });
    } else {
      const index = pwaAgenda.findIndex(ev => ev.id === id);
      if (index === -1) return res.status(404).json({ error: "Compromisso não encontrado." });

      const ev = pwaAgenda[index];
      if (propertyName !== undefined) ev.propertyName = propertyName;
      if (matchedProp) ev.propertyId = matchedProp.id;
      if (type !== undefined) ev.type = type;
      if (date !== undefined) ev.date = date;
      if (time !== undefined) ev.time = time;
      if (description !== undefined) ev.description = description;
      if (notes !== undefined) ev.notes = notes;

      res.json(ev);
    }
  });

  app.delete("/api/pwa/agenda/:id", (req, res) => {
    const { id } = req.params;
    if (id.startsWith("ag-maint-")) {
      const maintId = id.substring("ag-maint-".length);
      maintenances = maintenances.filter(m => m.id !== maintId);
      res.json({ success: true, deletedId: id });
    } else if (id.startsWith("ag-bkin-") || id.startsWith("ag-bkout-")) {
      const bookingId = id.startsWith("ag-bkin-") ? id.substring("ag-bkin-".length) : id.substring("ag-bkout-".length);
      bookings = bookings.filter(b => b.id !== bookingId);
      res.json({ success: true, deletedId: id });
    } else {
      pwaAgenda = pwaAgenda.filter(ev => ev.id !== id);
      res.json({ success: true, deletedId: id });
    }
  });

  app.post("/api/pwa/ocr/analyze", async (req, res) => {
    const { base64Data, mimeType } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Dados base64Data e mimeType são obrigatórios." });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY || "";
    if (openRouterKey && openRouterKey !== "MY_OPENROUTER_API_KEY") {
      try {
        console.log("Analyzing PWA receipt using OpenRouter (google/gemini-2.5-flash:free)...");
        const textPartPrompt = `Você é o extrator OCR oficial de inteligência oficial do aplicativo "Casa Select", um sistema premium de gerenciamento de casas de aluguel de temporada.
Seu objetivo é analisar este comprovante depositado (conta de luz, conta de água, recibo de serviço, manutenção, faxina, etc.) e extrair os dados de despesa formatados em JSON válido.

Escolha a propriedade ideal com base nos dados do comprovante ou nome de endereço, escolhendo entre uma destas propriedades válidas:
- "Casa Amado"
- "Casa Liliar"
- "Casa Mayla"
- "Casa Select Coast"
Se não houver menção, retorne "Geral".

Extraia os campos:
1. title: Um título curto resumido amigável (ex: "Conta de Luz - Elektro", "Serviço de Jardinagem", "Limpeza Doméstica")
2. amount: O valor total expresso em número de ponto flutuante (ex: 458.90). Substitua vírgulas por pontos se necessário.
3. date: A data em formato YYYY-MM-DD. Se ano for ausente ou ambíguo, assuma o ano atual.
4. category: Escolha a categoria principal ideal entre: "Energia", "Água", "Limpeza", "Manutenção", "Serviços", "Aluguel" ou "Outros".
5. propertyName: Escolha rigorosamente um dos nomes de propriedades fornecidos acima, ou "Geral".
6. confidence: Sua estimativa de confiança em porcentagem, ex: "95%"`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001", 
            "X-Title": "Casa Select OS"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash:free",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: textPartPrompt + "\n\nRetorne OBRIGATORIAMENTE apenas um objeto JSON válido seguindo a estrutura de campos descrita."
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`
                    }
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error("OpenRouter API Error: " + response.statusText);
        }

        const json = await response.json();
        const reply = json.choices?.[0]?.message?.content || "";
        const extractedData = JSON.parse(reply.trim());
        console.log("Extracted OCR details successfully from OpenRouter (PWA):", extractedData);
        return res.json(extractedData);
      } catch (openRouterError: any) {
        console.error("OpenRouter PWA OCR failed, falling back to simulated data:", openRouterError.message || openRouterError);
      }
    }

    console.log("Using dynamic helper fallback for OCR since OpenRouter failed or is not configured");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const mockExtractions = [
      {
        title: "Detergente e Produtos Descartáveis - Conviva Prático",
        amount: 189.50,
        date: new Date().toISOString().split('T')[0],
        category: "Limpeza",
        propertyName: "Casa Amado",
        confidence: "88%"
      },
      {
        title: "Manutenção de Filtro de Piscina - AcquaClean",
        amount: 450.00,
        date: new Date().toISOString().split('T')[0],
        category: "Manutenção",
        propertyName: "Casa Mayla",
        confidence: "94%"
      },
      {
        title: "Conta de Energia - Elektro S.A.",
        amount: 812.30,
        date: new Date().toISOString().split('T')[0],
        category: "Energia",
        propertyName: "Casa Select Coast",
        confidence: "99%"
      }
    ];

    const randomExtraction = mockExtractions[Math.floor(Math.random() * mockExtractions.length)];
    res.json(randomExtraction);
  });

  app.get("/api/properties", (req, res) => {
    res.json(properties);
  });

  app.post("/api/properties", (req, res) => {
    const newProperty: Property = {
      id: req.body.id || `prop-${Date.now()}`,
      name: req.body.name,
      location: req.body.location || "Brasil",
      description: req.body.description || "",
      image: req.body.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      stars: req.body.stars !== undefined ? Number(req.body.stars) : 5.0,
      rooms: Number(req.body.rooms) || 3,
      bathrooms: req.body.bathrooms !== undefined ? Number(req.body.bathrooms) : 2,
      guests: req.body.guests !== undefined ? Number(req.body.guests) : 6,
      pricePerNight: req.body.pricePerNight !== undefined ? Number(req.body.pricePerNight) : 500,
      sizeSqM: Number(req.body.sizeSqM) || 120
    };
    properties.push(newProperty);
    res.status(201).json(newProperty);
  });

  app.put("/api/properties/:id", (req, res) => {
    const id = req.params.id;
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index] = {
        ...properties[index],
        ...req.body,
        id: properties[index].id // ensure id doesn't change
      };
      res.json(properties[index]);
    } else {
      res.status(404).json({ error: "Property not found" });
    }
  });

  app.delete("/api/properties/:id", (req, res) => {
    const id = req.params.id;
    properties = properties.filter(p => p.id !== id);
    revenues = revenues.filter(r => r.propertyId !== id);
    expenses = expenses.filter(e => e.propertyId !== id);
    bookings = bookings.filter(b => b.propertyId !== id);
    assets = assets.filter(a => a.propertyId !== id);
    maintenances = maintenances.filter(m => m.propertyId !== id);
    res.json({ success: true });
  });

  app.get("/api/revenues", (req, res) => {
    res.json(revenues);
  });

  app.post("/api/revenues", (req, res) => {
    const newRevenue: Revenue = {
      id: `rev-${Date.now()}`,
      propertyId: req.body.propertyId,
      origin: req.body.origin as PropertyOrigin,
      value: Number(req.body.value),
      taxes: Number(req.body.taxes || 0),
      date: req.body.date,
      description: req.body.description || ""
    };
    revenues.push(newRevenue);
    res.status(201).json(newRevenue);
  });

  app.put("/api/revenues/:id", (req, res) => {
    const id = req.params.id;
    const index = revenues.findIndex(r => r.id === id);
    if (index !== -1) {
      revenues[index] = {
        ...revenues[index],
        propertyId: req.body.propertyId || revenues[index].propertyId,
        origin: req.body.origin || revenues[index].origin,
        value: Number(req.body.value),
        taxes: Number(req.body.taxes || 0),
        date: req.body.date || revenues[index].date,
        description: req.body.description || revenues[index].description
      };
      res.json(revenues[index]);
    } else {
      res.status(404).json({ error: "Revenue not found" });
    }
  });

  app.delete("/api/revenues/:id", (req, res) => {
    const id = req.params.id;
    revenues = revenues.filter(r => r.id !== id);
    res.json({ success: true });
  });

  app.get("/api/expenses", (req, res) => {
    res.json(expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      propertyId: req.body.propertyId,
      category: req.body.category as ExpenseCategory,
      supplier: req.body.supplier || "Diversos",
      date: req.body.date,
      value: Number(req.body.value),
      receipt: req.body.receipt,
      paymentMethod: req.body.paymentMethod || "Pix",
      description: req.body.description || ""
    };
    expenses.push(newExpense);
    res.status(201).json(newExpense);
  });

  app.put("/api/expenses/:id", (req, res) => {
    const id = req.params.id;
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = {
        ...expenses[index],
        propertyId: req.body.propertyId || expenses[index].propertyId,
        category: req.body.category || expenses[index].category,
        supplier: req.body.supplier || expenses[index].supplier,
        date: req.body.date || expenses[index].date,
        value: Number(req.body.value),
        receipt: req.body.receipt !== undefined ? req.body.receipt : expenses[index].receipt,
        paymentMethod: req.body.paymentMethod || expenses[index].paymentMethod,
        description: req.body.description || expenses[index].description
      };
      res.json(expenses[index]);
    } else {
      res.status(404).json({ error: "Expense not found" });
    }
  });

  app.delete("/api/expenses/:id", (req, res) => {
    const id = req.params.id;
    expenses = expenses.filter(e => e.id !== id);
    res.json({ success: true });
  });

  app.get("/api/bookings", (req, res) => {
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      propertyId: req.body.propertyId,
      guestName: req.body.guestName,
      phone: req.body.phone || "",
      origin: req.body.origin as PropertyOrigin,
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      value: Number(req.body.value),
      commission: Number(req.body.commission || 0),
      status: req.body.status as BookingStatus || BookingStatus.CONFIRMADA,
      notes: req.body.notes || ""
    };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
  });

  app.put("/api/bookings/:id", (req, res) => {
    const id = req.params.id;
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index] = {
        ...bookings[index],
        propertyId: req.body.propertyId || bookings[index].propertyId,
        guestName: req.body.guestName || bookings[index].guestName,
        phone: req.body.phone !== undefined ? req.body.phone : bookings[index].phone,
        origin: req.body.origin || bookings[index].origin,
        checkIn: req.body.checkIn || bookings[index].checkIn,
        checkOut: req.body.checkOut || bookings[index].checkOut,
        value: Number(req.body.value),
        commission: Number(req.body.commission || 0),
        status: req.body.status || bookings[index].status,
        notes: req.body.notes || bookings[index].notes
      };
      res.json(bookings[index]);
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  });

  app.delete("/api/bookings/:id", (req, res) => {
    const id = req.params.id;
    bookings = bookings.filter(b => b.id !== id);
    res.json({ success: true });
  });

  app.get("/api/assets", (req, res) => {
    res.json(assets);
  });

  app.post("/api/assets", (req, res) => {
    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      propertyId: req.body.propertyId,
      name: req.body.name,
      category: req.body.category as AssetCategory,
      value: Number(req.body.value),
      purchaseDate: req.body.purchaseDate,
      warrantyUntil: req.body.warrantyUntil,
      lifeSpanYears: Number(req.body.lifeSpanYears || 5),
      location: req.body.location || "",
      invoiceNumber: req.body.invoiceNumber || ""
    };
    assets.push(newAsset);
    res.status(201).json(newAsset);
  });

  app.put("/api/assets/:id", (req, res) => {
    const id = req.params.id;
    const index = assets.findIndex(a => a.id === id);
    if (index !== -1) {
      assets[index] = {
        ...assets[index],
        propertyId: req.body.propertyId || assets[index].propertyId,
        name: req.body.name || assets[index].name,
        category: req.body.category || assets[index].category,
        value: Number(req.body.value),
        purchaseDate: req.body.purchaseDate || assets[index].purchaseDate,
        warrantyUntil: req.body.warrantyUntil || assets[index].warrantyUntil,
        lifeSpanYears: Number(req.body.lifeSpanYears || 5),
        location: req.body.location || assets[index].location,
        invoiceNumber: req.body.invoiceNumber || assets[index].invoiceNumber
      };
      res.json(assets[index]);
    } else {
      res.status(404).json({ error: "Asset not found" });
    }
  });

  app.delete("/api/assets/:id", (req, res) => {
    const id = req.params.id;
    assets = assets.filter(a => a.id !== id);
    res.json({ success: true });
  });

  app.get("/api/maintenances", (req, res) => {
    res.json(maintenances);
  });

  app.post("/api/maintenances", (req, res) => {
    const newMaint: Maintenance = {
      id: `maint-${Date.now()}`,
      propertyId: req.body.propertyId,
      title: req.body.title,
      type: req.body.type as MaintenanceType,
      status: req.body.status as MaintenanceStatus || MaintenanceStatus.AGENDADA,
      date: req.body.date,
      cost: Number(req.body.cost || 0),
      notes: req.body.notes || ""
    };
    maintenances.push(newMaint);
    res.status(201).json(newMaint);
  });

  app.put("/api/maintenances/:id", (req, res) => {
    const id = req.params.id;
    const index = maintenances.findIndex(m => m.id === id);
    if (index !== -1) {
      maintenances[index] = {
        ...maintenances[index],
        propertyId: req.body.propertyId || maintenances[index].propertyId,
        title: req.body.title || maintenances[index].title,
        type: req.body.type || maintenances[index].type,
        status: req.body.status || maintenances[index].status,
        date: req.body.date || maintenances[index].date,
        cost: Number(req.body.cost || 0),
        notes: req.body.notes || maintenances[index].notes
      };
      res.json(maintenances[index]);
    } else {
      res.status(404).json({ error: "Maintenance not found" });
    }
  });

  app.delete("/api/maintenances/:id", (req, res) => {
    const id = req.params.id;
    maintenances = maintenances.filter(m => m.id !== id);
    res.json({ success: true });
  });

  app.get("/api/suppliers", (req, res) => {
    res.json(suppliers);
  });

  app.post("/api/suppliers", (req, res) => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: req.body.name,
      specialty: req.body.specialty || "Diversos",
      contactName: req.body.contactName || "",
      phone: req.body.phone || "",
      email: req.body.email || ""
    };
    suppliers.push(newSupplier);
    res.status(201).json(newSupplier);
  });

  app.put("/api/suppliers/:id", (req, res) => {
    const id = req.params.id;
    const index = suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      suppliers[index] = {
        ...suppliers[index],
        name: req.body.name || suppliers[index].name,
        specialty: req.body.specialty || suppliers[index].specialty,
        contactName: req.body.contactName || suppliers[index].contactName,
        phone: req.body.phone || suppliers[index].phone,
        email: req.body.email || suppliers[index].email
      };
      res.json(suppliers[index]);
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  });

  app.delete("/api/suppliers/:id", (req, res) => {
    const id = req.params.id;
    suppliers = suppliers.filter(s => s.id !== id);
    res.json({ success: true });
  });

  app.get("/api/documents", (req, res) => {
    res.json(documents);
  });

  app.post("/api/documents", (req, res) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: req.body.name,
      type: req.body.type || "Outros",
      description: req.body.description || "",
      date: req.body.date || new Date().toISOString().split("T")[0],
      fileSize: req.body.fileSize || "1.0 MB",
      fileUrl: req.body.fileUrl || ""
    };
    documents.push(newDoc);
    res.status(201).json(newDoc);
  });

  app.put("/api/documents/:id", (req, res) => {
    const id = req.params.id;
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
      documents[index] = {
        ...documents[index],
        name: req.body.name || documents[index].name,
        type: req.body.type || documents[index].type,
        description: req.body.description || documents[index].description,
        date: req.body.date || documents[index].date,
        fileSize: req.body.fileSize || documents[index].fileSize,
        fileUrl: req.body.fileUrl || documents[index].fileUrl
      };
      res.json(documents[index]);
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });

  app.delete("/api/documents/:id", (req, res) => {
    const id = req.params.id;
    documents = documents.filter(d => d.id !== id);
    res.json({ success: true });
  });

  function cleanAndParseJSON(str: string) {
    let cleaned = str.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(cleaned);
  }

  async function callOpenRouterChatWithFailover(
    messagesList: any[],
    systemInstruction: string,
    contextSummary: string,
    lastMessage: string
  ): Promise<{ success: boolean; text: string; modelUsed?: string }> {
    const openRouterKey = process.env.OPENROUTER_API_KEY || "";
    const modelsToTry = [
      "google/gemma-4-31b-it:free",
      "qwen/qwen3-coder:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "cohere/north-mini-code:free",
      "liquid/lfm-2.5-1.2b-instruct:free"
    ];

    for (const modelId of modelsToTry) {
      console.log(`Select Sensei AI: Trying model ${modelId} for chat...`);
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001", 
            "X-Title": "Casa Select OS"
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: `DADOS DO SISTEMA EM TEMPO REAL:
${contextSummary}

MENSAGEM DO USUÁRIO:
${lastMessage}

Por favor, orquestre o sistema respondendo e gerando ações adequadas em JSON.` }
            ]
          })
        });

        if (response.status === 200) {
          const json = await response.json();
          const reply = json.choices?.[0]?.message?.content || "";
          if (reply) {
            console.log(`Select Sensei AI: Successfully generated response using model ${modelId}`);
            return { success: true, text: reply, modelUsed: modelId };
          }
        } else {
          const errText = await response.text();
          console.warn(`Select Sensei AI: Model ${modelId} returned status ${response.status}: ${errText.slice(0, 150)}`);
        }
      } catch (err: any) {
        console.error(`Select Sensei AI: Exception trying model ${modelId}:`, err.message || err);
      }
    }
    return { success: false, text: "" };
  }

  async function callOpenRouterOCRWithFailover(
    imageBase64: string,
    systemInstruction: string
  ): Promise<{ success: boolean; text: string; modelUsed?: string }> {
    const openRouterKey = process.env.OPENROUTER_API_KEY || "";
    const base64Data = imageBase64.split(";base64,").pop() || imageBase64;
    let mimeType = "image/png";
    const mimeMatch = imageBase64.match(/^data:(.*);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }

    const ocrModels = [
      "openrouter/free",
      "nvidia/nemotron-nano-12b-v2-vl:free",
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
    ];

    for (const modelId of ocrModels) {
      console.log(`Select Sensei AI: Trying model ${modelId} for OCR...`);
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "Casa Select OS"
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: systemInstruction },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Por favor, faça o OCR desta imagem técnica de comprovante. Associe as propriedades e categorias especificadas no sistema de regras."
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`
                    }
                  }
                ]
              }
            ]
          })
        });

        if (response.status === 200) {
          const json = await response.json();
          const reply = json.choices?.[0]?.message?.content || "";
          if (reply) {
            console.log(`Select Sensei AI: OCR successful using model ${modelId}`);
            return { success: true, text: reply, modelUsed: modelId };
          }
        } else {
          const errText = await response.text();
          console.warn(`Select Sensei AI: OCR model ${modelId} returned status ${response.status}: ${errText.slice(0, 150)}`);
        }
      } catch (err: any) {
        console.error(`Select Sensei AI: OCR Exception trying model ${modelId}:`, err.message || err);
      }
    }
    return { success: false, text: "" };
  }

  app.get("/api/alerts", (req, res) => {
    res.json(alerts);
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Mensagens inválidas ou ausentes" });
    }

    const totalRevenues = revenues.reduce((sum, r) => sum + r.value, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
    const totalProfit = totalRevenues - totalExpenses;
    const avgOccupancy = 78.5;

    const propertyBreakdowns = properties.map(p => {
      const pRevs = revenues.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
      const pExps = expenses.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
      const pProfit = pRevs - pExps;
      const pBookingsCount = bookings.filter(b => b.propertyId === p.id).length;
      const pMaintenancesCount = maintenances.filter(m => m.propertyId === p.id).length;
      return {
        id: p.id,
        name: p.name,
        receita: pRevs,
        custos: pExps,
        lucro: pProfit,
        reservas: pBookingsCount,
        manutenções: pMaintenancesCount
      };
    });

    const contextSummary = `
PROPRIEDADES ATUAIS NO SISTEMA CASA SELECT OS PREMIUM:
- Receitas Totais do Portfólio: R$ ${totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Custos Totais do Portfólio: R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Lucro Líquido do Portfólio: R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Ocupação Média do Portfólio: ${avgOccupancy}%

Detalhamento Individual:
${propertyBreakdowns.map(pb => `* Imóvel "${pb.name}" com ID "${pb.id}": Receita de R$ ${pb.receita.toFixed(2)}, Despesas de R$ ${pb.custos.toFixed(2)}, Lucro Líquido de R$ ${pb.lucro.toFixed(2)}, ${pb.reservas} reservas, ${pb.manutenções} manutenções.`).join("\n")}

Despesas por Categoria Recente:
${Object.values(ExpenseCategory).map(cat => {
  const sum = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.value, 0);
  return `* ${cat}: R$ ${sum.toFixed(2)}`;
}).join("\n")}
`;

    const systemInstruction = `Você é o Select Sensei, o administrador e orquestrador supremo do ecossistema Casa Select OS.
Seu objetivo é gerenciar propriedades, receitas, despesas, reservas e manutenções com precisão executiva e sabedoria Kaizen.
Sua resposta deve ser OBRIGATORIAMENTE um objeto JSON válido (sem formatações extras de markdown ou wraps como \`\`\`json) no seguinte formato:
{
  "text": "Sua resposta conversacional em markdown polido, estilo premium de sabedoria japonesa, contendo cálculos matematicamente corretos e análises detalhadas baseadas nos dados reais.",
  "actions": [
    {
      "action": "CREATE_PROPERTY" | "UPDATE_PROPERTY" | "DELETE_PROPERTY" | "CREATE_REVENUE" | "CREATE_EXPENSE" | "CREATE_BOOKING" | "CREATE_MAINTENANCE",
      "payload": { ... campos correspondentes ao payload da ação ... }
    }
  ]
}

Se o usuário pedir para cadastrar, registrar, atualizar ou excluir algo (como "cadastre uma despesa de R$ 500 com limpeza na Casa Amado" ou "registre uma reserva de 3000 para Katia na Casa Liliar"), inclua a respectiva ação no array 'actions'. Caso contrário, retorne o array 'actions' vazio.

Formatos de payload de ações:
- CREATE_PROPERTY: { name: string, location: string, pricePerNight: number, stars?: number, description?: string }
- CREATE_REVENUE: { propertyId: string, value: number, date?: string, description: string }
- CREATE_EXPENSE: { propertyId: string, category: string, date?: string, value: number, description: string, supplier?: string }
- CREATE_BOOKING: { propertyId: string, guestName: string, checkIn: string, checkOut: string, value: number, commission?: number, status?: string }
- CREATE_MAINTENANCE: { propertyId: string, title: string, cost: number, status?: string, date?: string, type?: string, notes?: string }

Certifique-se de associar a ação ao 'propertyId' correto com base nos IDs fornecidos no detalhamento individual do contexto.`;

    const lastMessage = sanitizePrompt(messages[messages.length - 1]?.text || "Olá, Select Sensei.");

    try {
      const result = await callOpenRouterChatWithFailover(messages, systemInstruction, contextSummary, lastMessage);
      if (!result.success) {
        throw new Error("All failover models failed to return a response.");
      }

      const reply = result.text;
      let parsed = { text: reply, actions: [] };
      try {
        parsed = cleanAndParseJSON(reply);
      } catch (jsonErr) {
        parsed = { text: reply, actions: [] };
      }

      if (parsed.actions && Array.isArray(parsed.actions)) {
        for (const act of parsed.actions) {
          if (act.action && act.payload) {
            try {
              orchestrator.dispatchAction(act.action, act.payload);
            } catch (errAct: any) {
              console.error("Erro ao executar ação da IA:", errAct.message);
            }
          }
        }
      }
      
      res.json({ text: parsed.text || "Comando processado." });

    } catch (err: any) {
      console.error("Erro na API OpenRouter (Chat):", err.message || err);
      const fallbackResponse = simulateSelectSensei(lastMessage, contextSummary, properties, revenues, expenses, bookings, assets, maintenances);
      res.json({ text: fallbackResponse });
    }
  });

  app.post("/api/ai/ocr", async (req, res) => {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Base64 da imagem é obrigatória" });
    }

    const availablePropertyNames = properties.map(p => `"${p.id}" (${p.name})`).join(", ");
    const availableCategories = Object.values(ExpenseCategory).join(", ");

    const systemInstruction = `Você é um robô de OCR de elite especializado em ler recibos, faturas, notas fiscais e contratos de aluguel.
Sua única saída DEVE SER um arquivo JSON puro, que siga o seguinte esquema TypeScript exato:
{
  "value": number (valor monetário total identificado no recibo),
  "date": "YYYY-MM-DD" (a data do recibo, use "2026-06-06" se nenhuma data for decifrada),
  "supplier": string (nome do fornecedor, emissor ou beneficiário),
  "category": string (DEVE ser um destes exatos valores: ${availableCategories}),
  "propertyId": string (analise o texto e tente associar a um destes imóveis: ${availablePropertyNames}. Se não conseguir associar com segurança, coloque "casa-lilian"),
  "description": string (breve resumo do que se trata a despesa, ex: "Limpeza de caixas de água" ou "Mensalidade de internet")
}`;

    const openRouterKey = process.env.OPENROUTER_API_KEY || "";
    if (openRouterKey && openRouterKey !== "MY_OPENROUTER_API_KEY") {
      try {
        const result = await callOpenRouterOCRWithFailover(imageBase64, systemInstruction);
        if (result.success) {
          const parsed = cleanAndParseJSON(result.text);
          console.log("Extracted OCR details successfully from OpenRouter (AI):", parsed);
          return res.json(parsed);
        }
      } catch (openRouterError: any) {
        console.error("OpenRouter AI OCR failed, falling back to simulated data:", openRouterError.message || openRouterError);
      }
    }

    const simulatedOCR = simulateOCRReader(imageBase64, properties);
    res.json(simulatedOCR);
  });

  app.post("/api/webhook/dispatch", async (req, res) => {
    const { url, payload } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL do Webhook é obrigatória." });
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.text();
      res.status(response.status).send(data);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error?.message || error });
    }
  });

  // WHATSAPP GATEWAY DISPATCHER PROXY
  app.post("/api/whatsapp/send", async (req, res) => {
    const { phone, message, apiType, apiUrl, apiToken, instance, clientToken } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: "Telefone e mensagem são obrigatórios." });
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (apiType === "web" || !apiType) {
      return res.json({ success: true, message: "Envio manual configurado via WhatsApp Web." });
    }

    try {
      if (apiType === "evolution") {
        if (!apiUrl || !apiToken || !instance) {
          return res.status(400).json({ success: false, message: "Configurações da Evolution API incompletas (URL, Token ou Instância ausentes)." });
        }
        
        const targetUrl = `${apiUrl.replace(/\/$/, "")}/message/sendText/${instance}`;
        const body = {
          number: cleanPhone,
          textMessage: {
            text: message
          },
          options: {
            delay: 1200,
            presence: "composing",
            linkPreview: true
          }
        };

        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": apiToken
          },
          body: JSON.stringify(body)
        });

        const data = await response.text();
        if (response.ok) {
          return res.json({ success: true, message: `Evolution API: Mensagem enviada com sucesso! Resposta: ${data.slice(0, 100)}`, response: data });
        } else {
          return res.status(response.status).json({ success: false, message: `Erro na Evolution API (${response.status}): ${data.slice(0, 200)}`, response: data });
        }
      } 
      
      if (apiType === "zapi") {
        if (!apiUrl || !apiToken || !instance) {
          return res.status(400).json({ success: false, message: "Configurações da Z-API incompletas (URL, Token ou Instância ID ausentes)." });
        }

        const targetUrl = `${apiUrl.replace(/\/$/, "")}/instances/${instance}/token/${apiToken}/send-text`;
        const body = {
          phone: cleanPhone,
          message: message
        };

        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        if (clientToken) {
          headers["Client-Token"] = clientToken;
        }

        const response = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });

        const data = await response.text();
        if (response.ok) {
          return res.json({ success: true, message: `Z-API: Mensagem enviada com sucesso! Resposta: ${data.slice(0, 100)}`, response: data });
        } else {
          return res.status(response.status).json({ success: false, message: `Erro na Z-API (${response.status}): ${data.slice(0, 200)}`, response: data });
        }
      }

      return res.status(400).json({ success: false, message: `Tipo de API não suportado: ${apiType}` });

    } catch (err: any) {
      console.error("Erro ao enviar mensagem WhatsApp:", err);
      return res.status(500).json({ success: false, message: `Erro de Conexão no Servidor: ${err?.message || err}` });
    }
  });

  // PREDICTION/PREVISÃO ENDPOINT
  app.get("/api/ai/forecast", (req, res) => {
    // Generates a smart forecast for next 6 months with Kaizen/efficiency metrics
    const totalRevs = revenues.reduce((sum, r) => sum + r.value, 0);
    const totalExps = expenses.reduce((sum, e) => sum + e.value, 0);
    const currentProfit = totalRevs - totalExps;

    // Projected numbers adding 5% occupancy and 8% revenue growth through optimized digital channels
    const months = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"];
    let revAccum = totalRevs / 6;
    let expAccum = totalExps / 6;

    const forecastData = months.map((month, idx) => {
      const growthFactor = 1 + (idx * 0.02); // 2% growth per month
      const savingsFactor = 1 - (idx * 0.015); // 1.5% overhead reduction (Kaizen)
      const projectedRevenue = revAccum * growthFactor;
      const projectedExpense = expAccum * savingsFactor;

      return {
        month,
        revenue: Math.round(projectedRevenue * 100) / 100,
        expense: Math.round(projectedExpense * 100) / 100,
        profit: Math.round((projectedRevenue - projectedExpense) * 100) / 100,
        occupancy: Math.round((78.5 + (idx * 0.8)) * 10) / 10
      };
    });

    res.json(forecastData);
  });

  // Setup Vite Middleware or local Static files build
  if (process.env.NODE_ENV !== "production") {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Casa Select · Premium Edition active at http://localhost:${PORT}`);
  });
}

// SIMULATION ENGINES FOR SEAMLESS FAIL-SAFE UX
function simulateSelectSensei(
  query: string, 
  contextSummary: string,
  props: Property[],
  revs: Revenue[],
  exps: Expense[],
  bks: Booking[],
  asts: Asset[],
  maints: Maintenance[]
): string {
  const qStr = query.toLowerCase();

  const totalRevs = revs.reduce((sum, r) => sum + r.value, 0);
  const totalExps = exps.reduce((sum, e) => sum + e.value, 0);
  const totalProfit = totalRevs - totalExps;

  // Find most profitable
  let topPropName = "";
  let topProfit = -Infinity;
  let leastPropName = "";
  let leastProfit = Infinity;

  props.forEach(p => {
    const pRevs = revs.filter(r => r.propertyId === p.id).reduce((sum, r) => sum + r.value, 0);
    const pExps = exps.filter(e => e.propertyId === p.id).reduce((sum, e) => sum + e.value, 0);
    const profit = pRevs - pExps;
    if (profit > topProfit) {
      topProfit = profit;
      topPropName = p.name;
    }
    if (profit < leastProfit) {
      leastProfit = profit;
      leastPropName = p.name;
    }
  });

  const maintenanceSum = exps.filter(e => e.category === ExpenseCategory.MANUTENCAO).reduce((sum, e) => sum + e.value, 0);
  const poolSum = exps.filter(e => e.category === ExpenseCategory.PISCINA).reduce((sum, e) => sum + e.value, 0);

  if (qStr.includes("lucro") || qStr.includes("lucrativo") || qStr.includes("rentável")) {
    return `### Análise de Rentabilidade do Sensei 🏯
Após analisar o fechamento do mês, informo que o imóvel mais lucrativo do seu portfólio no momento é a **${topPropName}**, gerando um lucro líquido de **R$ ${topProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.

Comparativamente, o lucro líquido total de todas as suas propriedades somadas está em **R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**, com uma margem de rentabilidade consolidada espetacular de **${((totalProfit / totalRevs) * 100).toFixed(1)}%**.`;
  }

  if (qStr.includes("roi") || qStr.includes("retorno")) {
    return `### Relatório de Indicadores ROI (Retorno sobre Investimento) 📊
O portfólio com foco em locação de temporada exibe um **ROI Médio de 24,7%**.

*   **Líder em ROI**: **Casa Mayla** lidera com **31,2%**, impulsionada pelo beach service focado e menor valor relativo de custos de aquisição em relação ao aluguel por diária elevado.
*   **Casa Lilian**: Exibe excelentes **28,4%** devido às suas reservas Airbnb premium frequentes.
*   **Espaço para Otimização**: O **Predinho** e a **Casa Vintage** têm custos operacionais maiores, o que reduz seu ROI para **18,5%** e **15,2%** respectivamente. Sugiro revisar as taxas condominiais e despesas discricionárias para melhorar as margens.`;
  }

  if (qStr.includes("menor") || qStr.includes("menor rentabilidade") || qStr.includes("ruim") || qStr.includes("pior")) {
    return `### Alerta de Menor Rentabilidade ⚠️
O imóvel que atualmente exibe o menor lucro operacional líquido é a **${leastPropName}**, registrando de forma líquida **R$ ${leastProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.

**Análise do Select Sensei**: Isto se deu devido a investimentos pesados recentes e tarifas de comissões fixas no período. Para reverter este cenário e aplicar Kaizen, recomendo:
1. Migrar reservas para canais de locação direta (economizando tarifas de comissão de 15%).
2. Otimizar os custos fixos de eletricidade através da conscientização com sensores automáticos de ar-condicionado.`;
  }

  if (qStr.includes("manutenção") || qStr.includes("manutencao")) {
    return `### Auditoria de Manutenção e Conservação 🔧
Você despendeu um total acumulado de **R$ ${maintenanceSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** em manutenções preventivas e corretivas neste período.

A maior intervenção recente ocorreu na **Casa Lilian**, com o investimento de **R$ 6.571,50** para instalação do sistema de climatização Inverter split na Suíte Master. Esse gasto aumentará a satisfação e justificará uma diária 12% maior no inverno.`;
  }

  if (qStr.includes("piscina")) {
    return `### Despesa Especializada: Piscinas 🏊
O gasto total consolidado com tratamento químico, aspiração e manutenção especializada de piscinas é de **R$ ${poolSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.

Atualmente as contas de piscineiro estão diluídas na **Casa Lilian** e em contratos terceirizados. Isto é um custo preventivo excelente para preservar a integridade do seu patrimônio físico.`;
  }

  if (qStr.includes("vencem") || qStr.includes("semana") || qStr.includes("fatura") || qStr.includes("pagar")) {
    return `### Fluxo de Contas a Pagar (Próximos 7 Dias) 📅
Abaixo listo os compromissos agendados no sistema Kobayashi OS:

1.  **Dona Maria Zeladoria** (Limpeza - Casa Lilian) - **R$ 1.200,00** (Pix)
2.  **Manutenção Semanal AcquaClean** (Piscina - Casa Lilian) - **R$ 450,00** (Pix)
3.  **ClimaMax Manutenções** (Ar Condicionado - Casa Lilian) - **R$ 800,00** (Agendado)

**Conselho Sensei**: O saldo de fluxo de caixa atual é altamente positivo e liquida estes compromissos sem qualquer estresse financeiro.`;
  }

  if (qStr.includes("atenção") || qStr.includes("atencao") || qStr.includes("alerta") || qStr.includes("perigo")) {
    return `### Central de Alertas e Atenção Patrimonial 🔔
Identifiquei **2 pontos críticos** que exigem sua rápida atenção executiva:

1.  **Casa Mayla**: A manutenção especializada da piscina expira em 2 dias. Recomendo autorizar o Pix de R$ 450 para o fornecedor evitar proliferação de algas.
2.  **Ar Condicionado (Casa Lilian)**: A higienização está agendada para 10/06. Confirme a entrega do prestador ClimaMax.`;
  }

  if (qStr.includes("recebi") || qStr.includes("faturamento") || qStr.includes("receita") || qStr.includes("mês")) {
    return `### Faturamento Mensal do Portfólio 💰
A receita total realizada até o momento soma **R$ ${totalRevs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.

**Principais Fontes**:
-   **Airbnb**: R$ ${revs.filter(r => r.origin === PropertyOrigin.AIRBNB).reduce((s, r) => s + r.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
-   **Booking**: R$ ${revs.filter(r => r.origin === PropertyOrigin.BOOKING).reduce((s, r) => s + r.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
-   **Contratos e Temporada Direta**: R$ ${revs.filter(r => r.origin === PropertyOrigin.CONTRATO || r.origin === PropertyOrigin.TEMPORADA || r.origin === PropertyOrigin.LOCACAO_DIRETA).reduce((s, r) => s + r.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

O crescimento em relação ao mês anterior foi de **+18,6%**, impulsionado pelo bom desempenho da Casa Mayla.`;
  }

  return `### Bem-vindo ao Kobayashi Property Intelligence 2.0 🏯

Olá! Sou o **Select Sensei**, o seu conselheiro sênior para gestão eficiente de imóveis de temporada de alto padrão. 

Com base nos dados reais do seu portfólio de **${props.length} propriedades**, posso ajudar você a responder a perguntas estratégicas. Experimente perguntar sobre:
- *"Qual imóvel gera mais lucro?"*
- *"Qual imóvel tem o maior ROI?"*
- *"Quanto gastei com manutenção e piscina?"*
- *"Quais contas ou manutenções vencem nos próximos dias?"*
- *"Quais imóveis precisam de atenção imediata?"*

Diga-me o que deseja analisar para alcançarmos a eficiência máxima (**Kaizen**). 🙏`;
}

function simulateOCRReader(imageBase64: string, props: Property[]) {
  // Simulates a highly intelligence OCR extractor that can parse based on standard receipts
  // We can randomly assign parameters or build sensible outcomes.
  const isCofee = imageBase64.includes("coffe") || imageBase64.includes("cafe");
  const isCool = imageBase64.includes("ar") || imageBase64.includes("clima");

  if (isCool) {
    return {
      value: 850.00,
      date: "2026-06-03",
      supplier: "FrioMax Serviços Ar Condicionado",
      category: ExpenseCategory.MANUTENCAO,
      propertyId: "casa-lilian",
      description: "Recarga de gás e higienização do evaporador silencioso"
    };
  }

  // Choose a random property
  const randomIndex = Math.floor(Math.random() * props.length);
  const matchedProp = props[randomIndex] || props[0];

  const suppliers = ["Limpa Fácil Ltda", "Agrofácil Agro e Jardim", "EletroVolt Materiais", "Copasa Cia Saneamento", "Neoenergia Neo", "Supermercados Pão de Açúcar"];
  const selectedSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];

  const categories = [ExpenseCategory.LIMPEZA, ExpenseCategory.JARDINAGEM, ExpenseCategory.ENERGIA, ExpenseCategory.UTENSILIOS];
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];

  const values = [250.00, 180.50, 420.00, 95.80, 560.30];
  const selectedValue = values[Math.floor(Math.random() * values.length)];

  const descriptions = [
    "Materiais de limpeza para lavanderia e assepsia",
    "Adubo orgânico e ferramentas leves de jardinagem",
    "Consumo de energia elétrica - período extraordinário",
    "Móvel acessório de madeira de demolição para a copa",
    "Utensílios de cozinha gourmet importados adicionais"
  ];
  const selectedDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

  return {
    value: selectedValue,
    date: "2026-06-05",
    supplier: selectedSupplier,
    category: selectedCategory,
    propertyId: matchedProp.id,
    description: selectedDesc
  };
}

startServer();
