import { useState } from "react";

import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  DollarSign,
  FileText,
  Hammer,
  MapPin,
  MessageSquareText,
  Phone,
  Search,
  Send,
  Settings,
  Sun,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

import {
  deleteSolarLead,
  getSolarLeads,
  registerLeadStatusUpdate,
  setSolarLeadArchived,
  updateSolarLeadFull,
} from "../data/solarLeads";

import QuoteEditor from "../components/QuoteEditor";
import SolarQuoteEditor from "../components/SolarQuoteEditor";
import PricingManager from "../components/PricingManager";

import {
  generateQuotePdf,
  getQuoteNumber,
} from "../utils/generateQuotePdf";

import {
  generateSolarQuotePdf,
  getSolarQuoteNumber,
} from "../utils/generateSolarQuotePdf";

import {
  deleteQuoteRequest,
  getQuoteRequests,
  setQuoteArchived,
  updateQuoteRequest,
} from "../data/quotes";


import type { QuoteRequest } from "../types/quote";

import type {
  LeadStatus,
  SolarLead,
} from "../types/lead";

type QuoteFilter =
  | "all"
  | "new"
  | "active"
  | "closed"
  | "archived";

type SolarFilter =
  | "all"
  | "new"
  | "active"
  | "closed"
  | "archived";

interface AdminDashboardProps {
  onBack: () => void;
}

interface PendingStatusChange {
  leadId: string;
  status: LeadStatus;
}

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-AR");

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("es-AR");

const getQuoteServiceLabels = (
  quote: QuoteRequest
): string[] => {
  if (
    quote.serviceLabels &&
    quote.serviceLabels.length > 0
  ) {
    return quote.serviceLabels;
  }

  return [quote.serviceLabel];
};

const getQuoteServicesText = (
  quote: QuoteRequest
): string =>
  getQuoteServiceLabels(quote).join(" · ");

/* =========================================================
   COMPONENTE
========================================================= */

function AdminDashboard({
  onBack,
}: AdminDashboardProps) {
  const [leads, setLeads] =
    useState<SolarLead[]>(() => getSolarLeads());

  const [solarSearch, setSolarSearch] =
    useState("");

  const [solarFilter, setSolarFilter] =
    useState<SolarFilter>("all");

  const [solarPage, setSolarPage] =
    useState(1);

  const SOLAR_PER_PAGE = 10;

  const [quotes, setQuotes] =
    useState<QuoteRequest[]>(() =>
      getQuoteRequests()
    );

  const [quoteSearch, setQuoteSearch] =
    useState("");

  const [quoteFilter, setQuoteFilter] =
    useState<QuoteFilter>("all");

  const [quotePage, setQuotePage] =
    useState(1);

  const QUOTES_PER_PAGE = 10;

  const [
    editingQuoteId,
    setEditingQuoteId,
  ] = useState<string | null>(null);

  const [
    editingSolarQuoteId,
    setEditingSolarQuoteId,
  ] = useState<string | null>(null);

  const [adminSection, setAdminSection] =
    useState<"solar" | "quotes" | "pricing">("solar");

  const [
    pendingChange,
    setPendingChange,
  ] = useState<PendingStatusChange | null>(null);

  const [note, setNote] = useState("");
  const [budgetAmount, setBudgetAmount] =
    useState("");

  const [scheduledDate, setScheduledDate] =
    useState("");

  /* =======================================================
     MÉTRICAS
  ======================================================= */

  const newLeads = leads.filter(
    (lead) =>
      lead.status === "Nueva" &&
      lead.archived !== true
  ).length;

  const totalPower = leads.reduce(
    (total, lead) =>
      total + lead.estimatedPower,
    0
  );

  /* =======================================================
     CAMBIO DE ESTADO
  ======================================================= */

  const requestStatusChange = (
    leadId: string,
    status: LeadStatus
  ) => {
    setPendingChange({
      leadId,
      status,
    });

    setNote("");
    setBudgetAmount("");
    setScheduledDate("");
  };

  const cancelStatusChange = () => {
    setPendingChange(null);

    setNote("");
    setBudgetAmount("");
    setScheduledDate("");
  };

  const saveStatusChange = () => {
    if (!pendingChange) {
      return;
    }

    const {
      leadId,
      status,
    } = pendingChange;

    if (
      status === "Presupuestado" &&
      (!budgetAmount ||
        Number(budgetAmount) <= 0)
    ) {
      return;
    }

    if (
      (status === "Visita" ||
        status === "Aceptado" ||
        status === "Trabajo" ||
        status === "Finalizado") &&
      !scheduledDate
    ) {
      return;
    }

    registerLeadStatusUpdate(
      leadId,
      {
        status,

        note:
          note.trim() ||
          undefined,

        budgetAmount:
          status === "Presupuestado"
            ? Number(budgetAmount)
            : undefined,

        scheduledDate:
          [
            "Visita",
            "Aceptado",
            "Trabajo",
            "Finalizado",
          ].includes(status)
            ? scheduledDate
            : undefined,
      }
    );

    setLeads(getSolarLeads());

    cancelStatusChange();
  };

  /* =======================================================
     TEXTO DEL FORMULARIO SEGÚN ESTADO
  ======================================================= */

  const renderStatusForm = (
    lead: SolarLead
  ) => {
    if (
      !pendingChange ||
      pendingChange.leadId !== lead.id
    ) {
      return null;
    }

    const status = pendingChange.status;

    return (
      <div className="status-update-box">
        <div className="status-update-header">
          <div>
            <span>
              ACTUALIZAR SEGUIMIENTO
            </span>

            <h4>
              Cambiar a: {status}
            </h4>
          </div>

          <button
            type="button"
            className="status-close"
            onClick={cancelStatusChange}
            aria-label="Cancelar"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTACTADO */}

        {status === "Contactado" && (
          <div className="status-field">
            <label>
              <MessageSquareText size={16} />
              ¿Qué se acordó con el cliente?
            </label>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Ej: Se acordó enviar fotos del techo y volver a comunicarse el viernes."
            />
          </div>
        )}

        {/* VISITA */}

        {status === "Visita" && (
          <>
            <div className="status-field">
              <label>
                <CalendarDays size={16} />
                Fecha de visita técnica
              </label>

              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) =>
                  setScheduledDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="status-field">
              <label>
                Observaciones
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Ej: Visitar establecimiento rural. Solicitar acceso al tablero."
              />
            </div>
          </>
        )}

        {/* PRESUPUESTADO */}

        {status === "Presupuestado" && (
          <>
            <div className="status-field">
              <label>
                <DollarSign size={16} />
                Valor presupuestado
              </label>

              <div className="money-input">
                <span>$</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={budgetAmount}
                  onChange={(e) =>
                    setBudgetAmount(
                      e.target.value
                    )
                  }
                  placeholder="Ej: 4850000"
                />
              </div>
            </div>

            <div className="status-field">
              <label>
                Observaciones del presupuesto
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Ej: Incluye paneles, inversor, estructura, protecciones e instalación."
              />
            </div>

            <div className="status-price-warning">
              <strong>
                Presupuesto registrado
              </strong>

              <p>
                Este importe quedará guardado
                como referencia histórica de
                la cotización realizada al
                cliente.
              </p>
            </div>
          </>
        )}

        {/* ACEPTADO */}

        {status === "Aceptado" && (
          <>
            <div className="status-field">
              <label>
                <CalendarDays size={16} />
                Fecha prevista de realización
              </label>

              <input
                type="date"
                value={scheduledDate}
                onChange={(e) =>
                  setScheduledDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="status-field">
              <label>
                Observaciones
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Ej: Cliente confirma presupuesto. Coordinar materiales antes de la fecha."
              />
            </div>
          </>
        )}

        {/* TRABAJO */}

        {status === "Trabajo" && (
          <>
            <div className="status-field">
              <label>
                <CalendarDays size={16} />
                Fecha de inicio
              </label>

              <input
                type="date"
                value={scheduledDate}
                onChange={(e) =>
                  setScheduledDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="status-field">
              <label>
                Observaciones del trabajo
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Ej: Material recibido. Instalación iniciada."
              />
            </div>
          </>
        )}

        {/* FINALIZADO */}

        {status === "Finalizado" && (
          <>
            <div className="status-field">
              <label>
                <Check size={16} />
                Fecha de finalización
              </label>

              <input
                type="date"
                value={scheduledDate}
                onChange={(e) =>
                  setScheduledDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="status-field">
              <label>
                Observaciones finales
              </label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Ej: Instalación terminada y probada. Cliente conforme."
              />
            </div>
          </>
        )}

        {/* NUEVA */}

        {status === "Nueva" && (
          <div className="status-field">
            <label>
              Observación
            </label>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="Motivo por el cual la consulta vuelve al estado Nueva."
            />
          </div>
        )}

        <button
          type="button"
          className="status-save-button"
          onClick={saveStatusChange}
        >
          <Check size={17} />
          Guardar actualización
        </button>
      </div>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */
  const handleSaveQuote = (
    updatedQuote: QuoteRequest
  ) => {
    updateQuoteRequest(updatedQuote);

    setQuotes(getQuoteRequests());

    setEditingQuoteId(null);
  };

  const handleQuoteStatusChange = (
    quote: QuoteRequest,
    status: QuoteRequest["status"]
  ) => {
    updateQuoteRequest({
      ...quote,
      status,
    });

    setQuotes(getQuoteRequests());

    if (editingQuoteId === quote.id) {
      setEditingQuoteId(null);
    }
  };

  /* =======================================================
   GESTIÓN DE CONSULTAS SOLARES
======================================================= */

  const activeSolarLeads = leads.filter(
    (lead) => lead.archived !== true
  );

  const archivedSolarLeads = leads.filter(
    (lead) => lead.archived === true
  );

  const newSolarLeads = activeSolarLeads.filter(
    (lead) => lead.status === "Nueva"
  );

  const inProgressSolarLeads =
    activeSolarLeads.filter((lead) =>
      [
        "Contactado",
        "Visita",
        "Presupuestado",
        "Aceptado",
        "Trabajo",
      ].includes(lead.status)
    );

  const closedSolarLeads =
    activeSolarLeads.filter(
      (lead) => lead.status === "Finalizado"
    );

  const filteredSolarLeads = leads.filter(
    (lead) => {
      const isArchived =
        lead.archived === true;

      let matchesFilter = false;

      if (solarFilter === "archived") {
        matchesFilter = isArchived;
      }

      if (solarFilter === "all") {
        matchesFilter = !isArchived;
      }

      if (solarFilter === "new") {
        matchesFilter =
          !isArchived &&
          lead.status === "Nueva";
      }

      if (solarFilter === "active") {
        matchesFilter =
          !isArchived &&
          [
            "Contactado",
            "Visita",
            "Presupuestado",
            "Aceptado",
            "Trabajo",
          ].includes(lead.status);
      }

      if (solarFilter === "closed") {
        matchesFilter =
          !isArchived &&
          lead.status === "Finalizado";
      }

      const search = solarSearch
        .trim()
        .toLowerCase();

      if (!search) {
        return matchesFilter;
      }

      const searchableText = [
        lead.name,
        lead.phone,
        lead.email || "",
        lead.location,
        lead.projectType,
        lead.objective,
        lead.status,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesFilter &&
        searchableText.includes(search)
      );
    }
  );

  const totalSolarPages = Math.max(
    1,
    Math.ceil(
      filteredSolarLeads.length /
      SOLAR_PER_PAGE
    )
  );

  const safeSolarPage = Math.min(
    solarPage,
    totalSolarPages
  );

  const paginatedSolarLeads =
    filteredSolarLeads.slice(
      (safeSolarPage - 1) *
      SOLAR_PER_PAGE,
      safeSolarPage *
      SOLAR_PER_PAGE
    );

  const changeSolarFilter = (
    filter: SolarFilter
  ) => {
    setSolarFilter(filter);
    setSolarPage(1);
  };

  const handleArchiveSolarLead = (
    lead: SolarLead
  ) => {
    setSolarLeadArchived(
      lead.id,
      lead.archived !== true
    );

    setLeads(getSolarLeads());

    if (
      pendingChange?.leadId === lead.id
    ) {
      cancelStatusChange();
    }
  };

  const handleDeleteSolarLead = (
    lead: SolarLead
  ) => {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la consulta de ${lead.name}?\n\nTambién se eliminará todo su historial comercial. Esta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    deleteSolarLead(lead.id);

    setLeads(getSolarLeads());

    if (
      pendingChange?.leadId === lead.id
    ) {
      cancelStatusChange();
    }
  };

  /* =======================================================
   GESTIÓN DE COTIZACIONES
======================================================= */

  const activeQuotes = quotes.filter(
    (quote) => !quote.archived
  );

  const archivedQuotes = quotes.filter(
    (quote) => quote.archived
  );

  const newQuotes = activeQuotes.filter(
    (quote) => quote.status === "Nueva"
  );

  const inProgressQuotes = activeQuotes.filter(
    (quote) =>
      [
        "Revisando",
        "Cotizada",
        "Enviada",
      ].includes(quote.status)
  );

  const closedQuotes = activeQuotes.filter(
    (quote) =>
      [
        "Aceptada",
        "Rechazada",
      ].includes(quote.status)
  );

  const filteredQuotes = quotes.filter((quote) => {
    const isArchived = quote.archived === true;

    let matchesFilter = false;

    if (quoteFilter === "archived") {
      matchesFilter = isArchived;
    }

    if (quoteFilter === "all") {
      matchesFilter = !isArchived;
    }

    if (quoteFilter === "new") {
      matchesFilter =
        !isArchived &&
        quote.status === "Nueva";
    }

    if (quoteFilter === "active") {
      matchesFilter =
        !isArchived &&
        [
          "Revisando",
          "Cotizada",
          "Enviada",
        ].includes(quote.status);
    }

    if (quoteFilter === "closed") {
      matchesFilter =
        !isArchived &&
        [
          "Aceptada",
          "Rechazada",
        ].includes(quote.status);
    }

    const search = quoteSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return matchesFilter;
    }

    const searchableText = [
      quote.customerName,
      quote.cuit || "",
      quote.phone,
      quote.email || "",
      quote.location,
      getQuoteServicesText(quote),
      quote.status,
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesFilter &&
      searchableText.includes(search)
    );
  });

  const totalQuotePages = Math.max(
    1,
    Math.ceil(
      filteredQuotes.length /
      QUOTES_PER_PAGE
    )
  );

  const safeQuotePage = Math.min(
    quotePage,
    totalQuotePages
  );

  const paginatedQuotes =
    filteredQuotes.slice(
      (safeQuotePage - 1) *
      QUOTES_PER_PAGE,
      safeQuotePage *
      QUOTES_PER_PAGE
    );

  const changeQuoteFilter = (
    filter: QuoteFilter
  ) => {
    setQuoteFilter(filter);
    setQuotePage(1);
  };

  const handleArchiveQuote = (
    quote: QuoteRequest
  ) => {
    const shouldArchive =
      !quote.archived;

    setQuoteArchived(
      quote.id,
      shouldArchive
    );

    setQuotes(getQuoteRequests());

    if (
      editingQuoteId === quote.id
    ) {
      setEditingQuoteId(null);
    }
  };

  const handleDeleteQuote = (
    quote: QuoteRequest
  ) => {
    const confirmed =
      window.confirm(
        `¿Eliminar definitivamente la solicitud de ${quote.customerName}?\n\nEsta acción no se puede deshacer.`
      );

    if (!confirmed) {
      return;
    }

    deleteQuoteRequest(quote.id);

    setQuotes(getQuoteRequests());

    if (
      editingQuoteId === quote.id
    ) {
      setEditingQuoteId(null);
    }
  };

  const handleSaveSolarQuote = (
    updatedLead: SolarLead
  ) => {
    updateSolarLeadFull(updatedLead);

    setLeads(getSolarLeads());

    setEditingSolarQuoteId(null);
  };

  const handleGenerateSolarPdf = async (
    lead: SolarLead
  ) => {
    try {
      await generateSolarQuotePdf(lead);
    } catch (error) {
      console.error(
        "Error al generar presupuesto solar:",
        error
      );

      window.alert(
        "Primero tenés que preparar y guardar el presupuesto solar."
      );
    }
  };

  const handleSendSolarQuote = (
    lead: SolarLead
  ) => {
    if (
      !lead.solarQuoteItems ||
      lead.solarQuoteItems.length === 0 ||
      lead.solarQuoteTotal === undefined
    ) {
      window.alert(
        "Primero tenés que preparar y guardar el presupuesto solar."
      );

      return;
    }

    const quoteNumber =
      getSolarQuoteNumber(lead);

    const total =
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(
        lead.solarQuoteTotal
      );

    const validity =
      lead.solarQuoteValidityDays || 7;

    const message = [
      `Hola ${lead.name}, ¿cómo estás?`,
      "",
      "Te enviamos el presupuesto solicitado a *STY Perforaciones y Energía*.",
      "",
      `*Presupuesto:* ${quoteNumber}`,
      `*Sistema solar:* ${lead.estimatedPower.toFixed(1)} kWp`,
      `*Paneles estimados:* ${lead.estimatedPanels}`,
      `*Total:* ${total}`,
      `*Validez:* ${validity} días`,
      "",
      "Te enviamos junto a este mensaje el presupuesto en PDF con el detalle completo.",
      "",
      "Ante cualquier consulta, quedamos a disposición.",
      "",
      "*STY Perforaciones y Energía*",
    ].join("\n");
    const phone =
      lead.phone.replace(/\D/g, "");

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="sty-admin">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <div className="admin-brand">
            <strong>
              STY DIGITAL
            </strong>

            <span>
              Panel de gestión
            </span>
          </div>

          <button onClick={onBack}>
            <ArrowLeft size={18} />
            Volver al sitio
          </button>
        </div>
      </header>

      <main className="container admin-main">
        <section className="admin-title">
          <span>GESTIÓN COMERCIAL</span>

          <h1>Panel STY</h1>

          <p>
            Consultas, cotizaciones y seguimiento comercial
            de los trabajos recibidos desde la web.
          </p>
        </section>

        <div className="admin-tabs">
          <button
            type="button"
            className={
              adminSection === "solar"
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => setAdminSection("solar")}
          >
            <Sun size={18} />

            <span>
              Consultas solares
              <small>
                Solicitudes del simulador
              </small>
            </span>

            <strong>{leads.length}</strong>
          </button>

          <button
            type="button"
            className={
              adminSection === "quotes"
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => setAdminSection("quotes")}
          >
            <Hammer size={18} />

            <span>
              Cotizaciones de trabajos
              <small>
                Zanjeo, perforaciones y más
              </small>
            </span>

            <strong>{quotes.length}</strong>
          </button>
          <button
            type="button"
            className={
              adminSection === "pricing"
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => setAdminSection("pricing")}
          >
            <Settings size={18} />

            <span>
              Lista de precios
              <small>
                Valores utilizados por el sistema
              </small>
            </span>
          </button>
        </div>

        {/* MÉTRICAS */}

        {adminSection === "solar" && (
          <section className="admin-stats">
            <div className="admin-stat-card">
              <Users size={25} />

              <span>Total consultas</span>

              <strong>{leads.length}</strong>
            </div>

            <div className="admin-stat-card">
              <ClipboardList size={25} />

              <span>Consultas nuevas</span>

              <strong>{newLeads}</strong>
            </div>

            <div className="admin-stat-card">
              <Sun size={25} />

              <span>Potencia consultada</span>

              <strong>
                {totalPower.toFixed(1)} kWp
              </strong>
            </div>
          </section>
        )}

        {/* CONSULTAS */}

        {adminSection === "solar" && (
          <section className="admin-leads">
            <div className="admin-section-header">
              <div>
                <span>
                  SOLICITUDES
                </span>

                <h2>
                  Consultas recibidas
                </h2>
              </div>

              <div className="quote-management-bar">

                <div className="quote-search">
                  <Search size={18} />

                  <input
                    type="text"
                    value={solarSearch}
                    onChange={(e) => {
                      setSolarSearch(e.target.value);
                      setSolarPage(1);
                    }}
                    placeholder="Buscar por cliente, teléfono, ubicación..."
                  />

                  {solarSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setSolarSearch("");
                        setSolarPage(1);
                      }}
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="quote-filter-tabs">

                  <button
                    type="button"
                    className={
                      solarFilter === "all"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeSolarFilter("all")
                    }
                  >
                    Todas
                    <span>
                      {activeSolarLeads.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      solarFilter === "new"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeSolarFilter("new")
                    }
                  >
                    Nuevas
                    <span>
                      {newSolarLeads.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      solarFilter === "active"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeSolarFilter("active")
                    }
                  >
                    En gestión
                    <span>
                      {inProgressSolarLeads.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      solarFilter === "closed"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeSolarFilter("closed")
                    }
                  >
                    Cerradas
                    <span>
                      {closedSolarLeads.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      solarFilter === "archived"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeSolarFilter("archived")
                    }
                  >
                    <Archive size={15} />
                    Archivadas
                    <span>
                      {archivedSolarLeads.length}
                    </span>
                  </button>

                </div>

              </div>

              <div className="admin-counter">
                {leads.length} consultas
              </div>
            </div>

            {filteredSolarLeads.length === 0 ? (
              <div className="admin-empty">
                <Sun size={38} />

                <h3>
                  Todavía no hay solicitudes
                </h3>

                <p>
                  Realizá una consulta desde
                  el simulador solar para verla
                  aparecer acá.
                </p>
              </div>
            ) : (
              <div className="admin-lead-list">
                {paginatedSolarLeads.map((lead) => (
                  <article
                    className="admin-lead"
                    key={lead.id}
                  >
                    {/* CABECERA */}

                    <div className="lead-top">
                      <div>
                        <span className="lead-date">
                          {formatDateTime(
                            lead.createdAt
                          )}
                        </span>

                        <h3>
                          {lead.name}
                        </h3>

                        <p>
                          {lead.projectType
                            .charAt(0)
                            .toUpperCase() +
                            lead.projectType.slice(
                              1
                            )}
                        </p>
                      </div>

                      <div className="quote-card-top-actions">

                        <span
                          className={`lead-status status-${lead.status.toLowerCase()}`}
                        >
                          {lead.status}
                        </span>

                        <button
                          type="button"
                          className="quote-archive-button"
                          onClick={() =>
                            handleArchiveSolarLead(lead)
                          }
                        >
                          {lead.archived ? (
                            <>
                              <ArchiveRestore size={16} />
                              Restaurar
                            </>
                          ) : (
                            <>
                              <Archive size={16} />
                              Archivar
                            </>
                          )}
                        </button>

                        {lead.archived && (
                          <button
                            type="button"
                            className="quote-delete-button"
                            onClick={() =>
                              handleDeleteSolarLead(lead)
                            }
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        )}

                      </div>
                    </div>

                    {/* UBICACIÓN */}

                    <div className="lead-location">
                      <MapPin size={16} />
                      {lead.location}
                    </div>

                    {/* DATOS */}

                    <div className="lead-details">
                      <div>
                        <span>
                          <Zap size={15} />
                          Consumo
                        </span>

                        <strong>
                          {
                            lead.monthlyConsumption
                          }{" "}
                          kWh/mes
                        </strong>
                      </div>

                      <div>
                        <span>
                          <Sun size={15} />
                          Sistema estimado
                        </span>

                        <strong>
                          {lead.estimatedPower.toFixed(
                            1
                          )}{" "}
                          kWp
                        </strong>
                      </div>

                      <div>
                        <span>
                          Paneles estimados
                        </span>

                        <strong>
                          {lead.estimatedPanels}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Objetivo
                        </span>

                        <strong>
                          {lead.objective}
                        </strong>
                      </div>
                    </div>

                    {/* CONTACTO */}

                    <div className="lead-contact">
                      <div>
                        <span>
                          WhatsApp
                        </span>

                        <strong>
                          {lead.phone}
                        </strong>
                      </div>

                      {lead.email && (
                        <div>
                          <span>
                            Email
                          </span>

                          <strong>
                            {lead.email}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* ACCIONES */}

                    <div className="lead-actions">
                      <a
                        href={`https://wa.me/${lead.phone.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Phone size={17} />
                        Contactar por WhatsApp
                      </a>

                      <button
                        type="button"
                        className="quote-edit-button"
                        onClick={() =>
                          setEditingSolarQuoteId(lead.id)
                        }
                      >
                        <Calculator size={17} />

                        {lead.solarQuoteItems &&
                          lead.solarQuoteItems.length > 0
                          ? "Editar presupuesto"
                          : "Preparar presupuesto"}
                      </button>

                      {lead.solarQuoteItems &&
                        lead.solarQuoteItems.length > 0 &&
                        lead.solarQuoteTotal !== undefined && (
                          <>
                            <button
                              type="button"
                              className="quote-pdf-button"
                              onClick={() =>
                                handleGenerateSolarPdf(lead)
                              }
                            >
                              <FileText size={17} />
                              Generar PDF
                            </button>

                            <button
                              type="button"
                              className="quote-send-button"
                              onClick={() =>
                                handleSendSolarQuote(lead)
                              }
                            >
                              <Send size={17} />
                              Enviar presupuesto
                            </button>
                          </>
                        )}

                      <div className="lead-status-control">
                        <label>
                          Estado
                        </label>

                        <select
                          value={lead.status}
                          onChange={(e) =>
                            requestStatusChange(
                              lead.id,
                              e.target
                                .value as LeadStatus
                            )
                          }
                        >
                          <option value="Nueva">
                            Nueva
                          </option>

                          <option value="Contactado">
                            Contactado
                          </option>

                          <option value="Visita">
                            Visita
                          </option>

                          <option value="Presupuestado">
                            Presupuestado
                          </option>

                          <option value="Aceptado">
                            Aceptado
                          </option>

                          <option value="Trabajo">
                            Trabajo
                          </option>

                          <option value="Finalizado">
                            Finalizado
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* FORMULARIO DINÁMICO */}

                    {renderStatusForm(lead)}

                    {editingSolarQuoteId === lead.id && (
                      <SolarQuoteEditor
                        lead={lead}
                        onCancel={() =>
                          setEditingSolarQuoteId(null)
                        }
                        onSave={handleSaveSolarQuote}
                      />
                    )}

                    {/* HISTORIAL */}

                    {lead.history &&
                      lead.history.length > 0 && (
                        <div className="lead-history">
                          <div className="lead-history-title">
                            <Clock3 size={17} />

                            <strong>
                              Historial
                            </strong>
                          </div>

                          <div className="lead-history-list">
                            {[...lead.history]
                              .reverse()
                              .map((entry) => (
                                <div
                                  className="history-entry"
                                  key={entry.id}
                                >
                                  <div className="history-dot" />

                                  <div className="history-content">
                                    <div className="history-heading">
                                      <strong>
                                        {
                                          entry.status
                                        }
                                      </strong>

                                      <span>
                                        {formatDateTime(
                                          entry.createdAt
                                        )}
                                      </span>
                                    </div>

                                    {entry.budgetAmount !==
                                      undefined && (
                                        <p className="history-budget">
                                          Presupuesto:{" "}
                                          <strong>
                                            {formatMoney(
                                              entry.budgetAmount
                                            )}
                                          </strong>
                                        </p>
                                      )}

                                    {entry.scheduledDate && (
                                      <p>
                                        Fecha:{" "}
                                        <strong>
                                          {formatDate(
                                            entry.scheduledDate
                                          )}
                                        </strong>
                                      </p>
                                    )}

                                    {entry.note && (
                                      <p>
                                        {entry.note}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </article>
                ))}
              </div>
            )}

            {filteredSolarLeads.length >
              SOLAR_PER_PAGE && (
                <div className="quote-pagination">

                  <button
                    type="button"
                    disabled={
                      safeSolarPage === 1
                    }
                    onClick={() =>
                      setSolarPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                  >
                    <ChevronLeft size={17} />
                    Anterior
                  </button>

                  <span>
                    Página{" "}
                    <strong>
                      {safeSolarPage}
                    </strong>{" "}
                    de{" "}
                    <strong>
                      {totalSolarPages}
                    </strong>
                  </span>

                  <button
                    type="button"
                    disabled={
                      safeSolarPage ===
                      totalSolarPages
                    }
                    onClick={() =>
                      setSolarPage((page) =>
                        Math.min(
                          totalSolarPages,
                          page + 1
                        )
                      )
                    }
                  >
                    Siguiente
                    <ChevronRight size={17} />
                  </button>

                </div>
              )}

          </section>
        )}

        {adminSection === "quotes" && (
          <>
            <section className="admin-stats">
              <div className="admin-stat-card">
                <Hammer size={25} />

                <span>Solicitudes recibidas</span>

                <strong>{quotes.length}</strong>
              </div>

              <div className="admin-stat-card">
                <ClipboardList size={25} />

                <span>Nuevas solicitudes</span>

                <strong>
                  {
                    quotes.filter(
                      (quote) => quote.status === "Nueva"
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat-card">
                <Calculator size={25} />

                <span>Estimaciones web</span>

                <strong>
                  {formatMoney(
                    quotes.reduce(
                      (total, quote) =>
                        total + quote.estimatedTotal,
                      0
                    )
                  )}
                </strong>
              </div>
            </section>

            <section className="admin-leads">
              <div className="admin-section-header">
                <div>
                  <span>COTIZACIONES</span>

                  <h2>
                    Solicitudes de trabajos
                  </h2>
                </div>

                <div className="admin-counter">
                  {quotes.length} solicitudes
                </div>
              </div>

              <div className="quote-management-bar">

                <div className="quote-search">
                  <Search size={18} />

                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => {
                      setQuoteSearch(
                        e.target.value
                      );

                      setQuotePage(1);
                    }}
                    placeholder="Buscar por cliente, CUIT, teléfono, ubicación o servicio..."
                  />

                  {quoteSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuoteSearch("");
                        setQuotePage(1);
                      }}
                      aria-label="Limpiar búsqueda"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="quote-filter-tabs">

                  <button
                    type="button"
                    className={
                      quoteFilter === "all"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeQuoteFilter("all")
                    }
                  >
                    Todas
                    <span>{activeQuotes.length}</span>
                  </button>

                  <button
                    type="button"
                    className={
                      quoteFilter === "new"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeQuoteFilter("new")
                    }
                  >
                    Nuevas
                    <span>{newQuotes.length}</span>
                  </button>

                  <button
                    type="button"
                    className={
                      quoteFilter === "active"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeQuoteFilter("active")
                    }
                  >
                    En gestión
                    <span>
                      {inProgressQuotes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      quoteFilter === "closed"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeQuoteFilter("closed")
                    }
                  >
                    Cerradas
                    <span>{closedQuotes.length}</span>
                  </button>

                  <button
                    type="button"
                    className={
                      quoteFilter === "archived"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      changeQuoteFilter(
                        "archived"
                      )
                    }
                  >
                    <Archive size={15} />
                    Archivadas
                    <span>
                      {archivedQuotes.length}
                    </span>
                  </button>

                </div>
              </div>

              {filteredQuotes.length === 0 ? (
                <div className="admin-empty">
                  <Hammer size={38} />

                  <h3>
                    No hay solicitudes para mostrar
                  </h3>

                  <p>
                    Probá cambiando el filtro o la búsqueda.
                  </p>
                </div>
              ) : (
                <div className="admin-lead-list">
                  {paginatedQuotes.map((quote) => (
                    <article
                      className="admin-lead quote-admin-card"
                      key={quote.id}
                    >
                      {/* CABECERA */}

                      <div className="lead-top">
                        <div>
                          <span className="lead-date">
                            {formatDateTime(
                              quote.createdAt
                            )}
                          </span>

                          <h3>
                            {quote.customerName}
                          </h3>

                          <p>
                            {getQuoteServicesText(quote)}
                          </p>
                        </div>

                        <div className="quote-card-top-actions">

                          <span
                            className={`lead-status quote-status-${quote.status.toLowerCase()}`}
                          >
                            {quote.status === "Rechazada"
                              ? quote.status.toUpperCase()
                              : quote.status}
                          </span>

                          <button
                            type="button"
                            className="quote-archive-button"
                            onClick={() =>
                              handleArchiveQuote(quote)
                            }
                            title={
                              quote.archived
                                ? "Restaurar solicitud"
                                : "Archivar solicitud"
                            }
                          >
                            {quote.archived ? (
                              <>
                                <ArchiveRestore size={16} />
                                Restaurar
                              </>
                            ) : (
                              <>
                                <Archive size={16} />
                                Archivar
                              </>
                            )}
                          </button>

                          {quote.archived && (
                            <button
                              type="button"
                              className="quote-delete-button"
                              onClick={() =>
                                handleDeleteQuote(quote)
                              }
                              title="Eliminar definitivamente"
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          )}

                        </div>
                      </div>

                      {/* UBICACIÓN */}

                      <div className="lead-location">
                        <MapPin size={16} />
                        {quote.location}
                      </div>

                      {/* DATOS DEL TRABAJO */}

                      {/* RESUMEN DEL PROYECTO */}

                      <div className="quote-admin-details">
                        <div>
                          <span>Servicios solicitados</span>

                          <strong>
                            {getQuoteServicesText(quote)}
                          </strong>
                        </div>

                        <div>
                          <span>Cantidad de servicios</span>

                          <strong>
                            {getQuoteServiceLabels(quote).length}
                          </strong>
                        </div>

                        <div>
                          <span>Ubicación</span>

                          <strong>
                            {quote.location}
                          </strong>
                        </div>

                        <div className="quote-admin-estimate">
                          <span>
                            Estimación web
                          </span>

                          <strong>
                            {formatMoney(
                              quote.estimatedTotal
                            )}
                          </strong>
                        </div>
                      </div>


                      {/* DETALLE DE LA ESTIMACIÓN */}

                      <div className="quote-admin-items">
                        <span className="quote-admin-items-title">
                          CÁLCULO GENERADO POR LA WEB
                        </span>

                        {quote.items.map((item) => (
                          <div
                            className="quote-admin-item"
                            key={item.id}
                          >
                            <div>
                              <strong>
                                {item.description}
                              </strong>

                              <span>
                                {item.quantity} {item.unit}
                                {" × "}
                                {formatMoney(
                                  item.unitPrice
                                )}
                              </span>
                            </div>

                            <strong>
                              {formatMoney(
                                item.subtotal
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {/* OBSERVACIONES */}

                      {quote.notes && (
                        <div className="quote-admin-notes">
                          <span>
                            Observaciones del cliente
                          </span>

                          <p>{quote.notes}</p>
                        </div>
                      )}

                      {/* DATOS DEL CLIENTE */}

                      <div className="lead-contact">
                        {quote.cuit && (
                          <div>
                            <span>CUIT</span>

                            <strong>
                              {quote.cuit}
                            </strong>
                          </div>
                        )}

                        <div>
                          <span>WhatsApp</span>

                          <strong>
                            {quote.phone}
                          </strong>
                        </div>

                        {quote.email && (
                          <div>
                            <span>Email</span>

                            <strong>
                              {quote.email}
                            </strong>
                          </div>
                        )}
                      </div>

                      {quote.finalTotal !== undefined && (
                        <div className="quote-final-summary">
                          <div>
                            <span>
                              Estimación web original
                            </span>

                            <strong>
                              {formatMoney(
                                quote.estimatedTotal
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Presupuesto STY
                            </span>

                            <strong>
                              {formatMoney(
                                quote.finalTotal
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Validez
                            </span>

                            <strong>
                              {quote.validityDays || 7} días
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* ACCIONES */}

                      <div className="quote-admin-actions">
                        <a
                          href={`https://wa.me/${quote.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="quote-whatsapp-button"
                        >
                          <Phone size={17} />
                          Contactar por WhatsApp
                        </a>

                        <button
                          type="button"
                          className="quote-review-button"
                          onClick={() =>
                            setEditingQuoteId(quote.id)
                          }
                        >
                          <Calculator size={17} />
                          {quote.finalItems
                            ? "Editar presupuesto"
                            : "Revisar cotización"}
                        </button>
                        {quote.finalTotal !== undefined &&
                          quote.finalItems &&
                          quote.finalItems.length > 0 && (
                            <button
                              type="button"
                              className="quote-pdf-button"
                              onClick={async () => {
                                try {
                                  await generateQuotePdf(
                                    quote
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error generando PDF:",
                                    error
                                  );

                                  alert(
                                    "No se pudo generar el presupuesto."
                                  );
                                }
                              }}
                            >
                              <FileText size={17} />
                              Generar PDF
                            </button>
                          )}
                        {quote.finalTotal !== undefined &&
                          quote.finalItems &&
                          quote.finalItems.length > 0 && (
                            <button
                              type="button"
                              className="quote-send-button"
                              onClick={() => {
                                const quoteNumber =
                                  getQuoteNumber(quote);

                                const message = [
                                  `Hola ${quote.customerName}, ¿cómo estás?`,
                                  "",
                                  "Te enviamos el presupuesto solicitado.",
                                  "",
                                  `Presupuesto N.º ${quoteNumber}`,
                                  `Trabajos: ${getQuoteServicesText(quote)}`,
                                  `Total: ${formatMoney(
                                    quote.finalTotal!
                                  )}`,
                                  `Validez: ${quote.validityDays || 7
                                  } días`,
                                  "",
                                  "Ante cualquier consulta, quedamos a disposición.",
                                  "",
                                  "STY Perforaciones y Energía",
                                ].join("\n");

                                const phone =
                                  quote.phone.replace(
                                    /\D/g,
                                    ""
                                  );

                                /*
                                 * Si el cliente ingresó un número
                                 * argentino sin código de país,
                                 * agregamos 54.
                                 */

                                const whatsappPhone =
                                  phone.startsWith("54")
                                    ? phone
                                    : `54${phone}`;

                                const url =
                                  `https://wa.me/${whatsappPhone}` +
                                  `?text=${encodeURIComponent(
                                    message
                                  )}`;

                                window.open(
                                  url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                                handleQuoteStatusChange(
                                  quote,
                                  "Enviada"
                                );
                              }}
                            >
                              <Send size={17} />
                              Enviar presupuesto
                            </button>
                          )}
                        {quote.status === "Enviada" && (
                          <>
                            <button
                              type="button"
                              className="quote-accept-button"
                              onClick={() =>
                                handleQuoteStatusChange(
                                  quote,
                                  "Aceptada"
                                )
                              }
                            >
                              <Check size={17} />
                              Cliente aceptó
                            </button>

                            <button
                              type="button"
                              className="quote-reject-button"
                              onClick={() =>
                                handleQuoteStatusChange(
                                  quote,
                                  "Rechazada"
                                )
                              }
                            >
                              <X size={17} />
                              Cliente rechazó
                            </button>
                          </>
                        )}
                      </div>
                      {editingQuoteId === quote.id && (
                        <QuoteEditor
                          quote={quote}
                          onCancel={() =>
                            setEditingQuoteId(null)
                          }
                          onSave={handleSaveQuote}
                        />
                      )}
                    </article>
                  ))}
                </div>
              )}

              {filteredQuotes.length >
                QUOTES_PER_PAGE && (
                  <div className="quote-pagination">

                    <button
                      type="button"
                      disabled={
                        safeQuotePage === 1
                      }
                      onClick={() =>
                        setQuotePage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                    >
                      <ChevronLeft size={17} />
                      Anterior
                    </button>

                    <span>
                      Página{" "}
                      <strong>
                        {safeQuotePage}
                      </strong>{" "}
                      de{" "}
                      <strong>
                        {totalQuotePages}
                      </strong>
                    </span>

                    <button
                      type="button"
                      disabled={
                        safeQuotePage ===
                        totalQuotePages
                      }
                      onClick={() =>
                        setQuotePage((page) =>
                          Math.min(
                            totalQuotePages,
                            page + 1
                          )
                        )
                      }
                    >
                      Siguiente
                      <ChevronRight size={17} />
                    </button>

                  </div>
                )}

            </section>
          </>
        )}
        {adminSection === "pricing" && (
          <PricingManager />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;