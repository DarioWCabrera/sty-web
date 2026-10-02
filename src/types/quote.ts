export type ServiceType =
  | "zanjeo"
  | "perforacion"
  | "bomba"
  | "electricidad"
  | "molino";

export type QuoteStatus =
  | "Nueva"
  | "Revisando"
  | "Cotizada"
  | "Enviada"
  | "Aceptada"
  | "Rechazada";

export interface QuoteItem {
  id: string;

  description: string;

  quantity: number;
  unit: string;

  unitPrice: number;
  subtotal: number;
}

export interface QuoteRequest {
  id: string;
  createdAt: string;

  /* CLIENTE */

  customerName: string;
  cuit?: string;
  phone: string;
  email: string;
  location: string;
  /* SERVICIO */

  /*
   * Campos originales.
   * Se mantienen para conservar compatibilidad
   * con cotizaciones creadas anteriormente.
   */
  serviceType: ServiceType;
  serviceLabel: string;

  /*
   * Nuevos campos para proyectos que incluyen
   * uno o varios servicios.
   */
  serviceTypes?: ServiceType[];
  serviceLabels?: string[];

  /* DATOS INGRESADOS */

  details: Record<
    string,
    string | number | boolean
  >;

  /* ESTIMACIÓN ORIGINAL DE LA WEB */

  items: QuoteItem[];
  estimatedTotal: number;

  /* PRESUPUESTO DEFINITIVO STY */

  finalItems?: QuoteItem[];
  finalTotal?: number;

  quoteNotes?: string;
  validityDays?: number;

  quotedAt?: string;

  /* GESTIÓN */

  status: QuoteStatus;

  notes?: string;

  /* GESTIÓN DEL PANEL */

  archived?: boolean;
}