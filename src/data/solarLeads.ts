import type {
  LeadHistoryEntry,
  LeadStatus,
  SolarLead,
} from "../types/lead";

const STORAGE_KEY = "sty_solar_leads";

/* =========================================================
   OBTENER CONSULTAS
========================================================= */

export function getSolarLeads(): SolarLead[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "Error al obtener consultas solares:",
      error
    );

    return [];
  }
}

/* =========================================================
   GUARDAR NUEVA CONSULTA
========================================================= */

export function saveSolarLead(
  lead: SolarLead
): void {
  try {
    const leads = getSolarLeads();

    const leadToSave: SolarLead = {
  ...lead,

  archived: false,

  history:
        lead.history && lead.history.length > 0
          ? lead.history
          : [
              {
                id: crypto.randomUUID(),
                status: "Nueva",
                createdAt: lead.createdAt,
                note: "Solicitud recibida desde el simulador solar.",
              },
            ],
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([leadToSave, ...leads])
    );
  } catch (error) {
    console.error(
      "Error al guardar consulta solar:",
      error
    );
  }
}

/* =========================================================
   ACTUALIZAR ESTADO SIMPLE
========================================================= */

export function updateSolarLead(
  id: string,
  status: LeadStatus
): void {
  try {
    const leads = getSolarLeads();

    const updatedLeads = leads.map((lead) =>
      lead.id === id
        ? {
            ...lead,
            status,
          }
        : lead
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLeads)
    );
  } catch (error) {
    console.error(
      "Error al actualizar consulta:",
      error
    );
  }
}

/* =========================================================
   REGISTRAR CAMBIO DE ESTADO + HISTORIAL
========================================================= */

export interface LeadStatusUpdate {
  status: LeadStatus;
  note?: string;
  budgetAmount?: number;
  scheduledDate?: string;
}

export function registerLeadStatusUpdate(
  leadId: string,
  update: LeadStatusUpdate
): void {
  try {
    const leads = getSolarLeads();

    const updatedLeads = leads.map((lead) => {
      if (lead.id !== leadId) {
        return lead;
      }

      const historyEntry: LeadHistoryEntry = {
        id: crypto.randomUUID(),
        status: update.status,
        createdAt: new Date().toISOString(),

        note: update.note?.trim() || undefined,

        budgetAmount:
          update.budgetAmount !== undefined
            ? update.budgetAmount
            : undefined,

        scheduledDate:
          update.scheduledDate || undefined,
      };

      return {
        ...lead,

        status: update.status,

        history: [
          ...(lead.history || []),
          historyEntry,
        ],
      };
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLeads)
    );
  } catch (error) {
    console.error(
      "Error al registrar cambio de estado:",
      error
    );
  }
}

/* =========================================================
   BUSCAR CONSULTA
========================================================= */

export function getSolarLeadById(
  id: string
): SolarLead | undefined {
  return getSolarLeads().find(
    (lead) => lead.id === id
  );
}

/* =========================================================
   ELIMINAR CONSULTA
========================================================= */

export function deleteSolarLead(
  id: string
): void {
  try {
    const leads = getSolarLeads();

    const updatedLeads = leads.filter(
      (lead) => lead.id !== id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLeads)
    );
  } catch (error) {
    console.error(
      "Error al eliminar consulta:",
      error
    );
    
  }
  
}
/* =========================================================
   ARCHIVAR / RESTAURAR CONSULTA
========================================================= */

export function setSolarLeadArchived(
  id: string,
  archived: boolean
): void {
  try {
    const leads = getSolarLeads();

    const updatedLeads = leads.map((lead) =>
      lead.id === id
        ? {
            ...lead,
            archived,
          }
        : lead
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLeads)
    );
  } catch (error) {
    console.error(
      "Error al archivar consulta solar:",
      error
    );
  }
}
/* =========================================================
   ACTUALIZAR CONSULTA SOLAR COMPLETA
========================================================= */

export function updateSolarLeadFull(
  updatedLead: SolarLead
): void {
  try {
    const leads = getSolarLeads();

    const updatedLeads = leads.map((lead) =>
      lead.id === updatedLead.id
        ? updatedLead
        : lead
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLeads)
    );
  } catch (error) {
    console.error(
      "Error al actualizar consulta solar:",
      error
    );
  }
}