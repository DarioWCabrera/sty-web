import type { QuoteItem } from "./quote";

export type LeadStatus =
  | "Nueva"
  | "Contactado"
  | "Visita"
  | "Presupuestado"
  | "Aceptado"
  | "Trabajo"
  | "Finalizado";

export interface LeadHistoryEntry {
  id: string;
  status: LeadStatus;
  createdAt: string;

  // Observación general
  note?: string;

  // Para presupuestos
  budgetAmount?: number;

  // Para visitas, trabajos, instalaciones, etc.
  scheduledDate?: string;
}

export interface SolarLead {
  id: string;
  createdAt: string;

  // CLIENTE
  name: string;
  phone: string;
  email: string;

  // PROYECTO
  projectType: string;
  monthlyConsumption: number;
  objective: string;
  location: string;

  // ESTIMACIÓN
  estimatedPower: number;
  estimatedPanels: number;

  // GESTIÓN COMERCIAL
  status: LeadStatus;

  // HISTORIAL
  history?: LeadHistoryEntry[];

  // ARCHIVO
  archived?: boolean;

  // PRESUPUESTO SOLAR DEFINITIVO
  solarQuoteItems?: QuoteItem[];
  solarQuoteTotal?: number;
  solarQuoteNotes?: string;
  solarQuoteValidityDays?: number;
  solarQuotedAt?: string;
}