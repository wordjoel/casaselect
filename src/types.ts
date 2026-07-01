export enum PropertyOrigin {
  AIRBNB = "Airbnb",
  BOOKING = "Booking",
  CONTRATO = "Contrato",
  TEMPORADA = "Temporada",
  LOCACAO_DIRETA = "Locação Direta",
  OUTROS = "Outros"
}

export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image?: string;
  stars?: number;
  rooms?: number;
  bathrooms?: number;
  guests?: number;
  pricePerNight?: number;
  sizeSqM?: number;
}

export interface Revenue {
  id: string;
  propertyId: string;
  origin: PropertyOrigin;
  value: number;
  taxes: number;
  date: string; // YYYY-MM-DD
  description: string;
  attachment?: string;
}

export enum ExpenseCategory {
  MANUTENCAO = "Manutenção",
  PISCINA = "Piscina",
  LIMPEZA = "Limpeza",
  FUNCIONARIOS = "Funcionários",
  INTERNET = "Internet",
  AGUA = "Água",
  ENERGIA = "Energia",
  JARDINAGEM = "Jardinagem",
  ALIMENTACAO = "Alimentação",
  MOVEIS = "Móveis",
  UTENSILIOS = "Utensílios",
  ELETRONICOS = "Eletrônicos",
  COMISSOES = "Comissões",
  TAXAS = "Taxas",
  IMPOSTOS = "Impostos",
  OUTROS = "Outros"
}

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  supplier: string;
  date: string; // YYYY-MM-DD
  value: number;
  receipt?: string;
  paymentMethod: string;
  description: string;
}

export enum BookingStatus {
  CONFIRMADA = "Confirmada",
  PENDENTE = "Pendente",
  CONCLUIDA = "Concluída",
  CANCELADA = "Cancelada"
}

export interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  origin: PropertyOrigin;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  value: number;
  commission: number;
  status: BookingStatus;
  phone?: string;
  documents?: string[];
  notes?: string;
  guestsCount?: number;
  selectedServices?: string[];
  isRecurrent?: boolean;
  daysCount?: number;
  airbnbUrl?: string;
}


export enum AssetCategory {
  MOVEIS = "Móveis",
  ELETRONICOS = "Eletrônicos",
  ELETRODOMESTICOS = "Eletrodomésticos",
  EQUIPAMENTOS = "Equipamentos",
  PISCINA = "Piscina",
  JARDIM = "Jardim",
  AR_CONDICIONADO = "Ar-condicionado"
}

export interface Asset {
  id: string;
  propertyId: string;
  name: string;
  category: AssetCategory;
  value: number;
  purchaseDate: string; // YYYY-MM-DD
  warrantyUntil?: string; // YYYY-MM-DD
  lifeSpanYears?: number;
  location?: string;
  photoUrl?: string;
  invoiceNumber?: string;
}

export enum MaintenanceType {
  PREVENTIVA = "Preventiva",
  CORRETIVA = "Corretiva",
  EMERGENCIAL = "Emergencial"
}

export enum MaintenanceStatus {
  AGENDADA = "Agendada",
  EM_ANDAMENTO = "Em Andamento",
  CONCLUIDA = "Concluída"
}

export interface Maintenance {
  id: string;
  propertyId: string;
  title: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  date: string; // YYYY-MM-DD
  cost: number;
  notes?: string;
}

export interface SystemAlert {
  id: string;
  propertyId?: string;
  type: "warning" | "info" | "success" | "danger";
  title: string;
  message: string;
  date: string;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  specialty: string;
  contactName: string;
  phone: string;
  email?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  description: string;
  date: string;
  fileSize?: string;
  fileUrl?: string;
}
export interface User { id: string; name: string; username: string; password?: string; role: 'admin' | 'user'; }