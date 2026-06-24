export interface Property {
  id: string;
  name: string;
  receitado: number;
  ocupacao: number;
  rating: number;
  status: "Ativas" | "Inativas";
  address: string;
  dailyRate: number;
  imageUrl: string;
}

export interface FinanceItem {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: "receita" | "despesa";
  category: string;
  status: "pago" | "pendente" | "extraido";
  propertyName: string;
}

export interface AgendaEvent {
  id: string;
  propertyId: string;
  propertyName: string;
  type: "checkin" | "checkout" | "limpeza" | "manutencao";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  notes?: string;
}
