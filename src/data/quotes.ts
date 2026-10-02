import type {
  QuoteRequest,
  QuoteStatus,
} from "../types/quote";

const STORAGE_KEY = "sty_quote_requests";

/* =========================================================
   OBTENER SOLICITUDES
========================================================= */

export function getQuoteRequests(): QuoteRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Error al obtener solicitudes de cotización:",
      error
    );

    return [];
  }
}

/* =========================================================
   GUARDAR TODAS
========================================================= */

function saveAllQuotes(
  quotes: QuoteRequest[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(quotes)
  );
}

/* =========================================================
   GUARDAR SOLICITUD
========================================================= */

export function saveQuoteRequest(
  quote: QuoteRequest
): void {
  try {
    const quotes = getQuoteRequests();

    const newQuote: QuoteRequest = {
      ...quote,
      archived: false,
    };

    saveAllQuotes([
      newQuote,
      ...quotes,
    ]);
  } catch (error) {
    console.error(
      "Error al guardar solicitud de cotización:",
      error
    );
  }
}

/* =========================================================
   BUSCAR SOLICITUD
========================================================= */

export function getQuoteRequestById(
  id: string
): QuoteRequest | undefined {
  return getQuoteRequests().find(
    (quote) => quote.id === id
  );
}

/* =========================================================
   ACTUALIZAR SOLICITUD COMPLETA
========================================================= */

export function updateQuoteRequest(
  updatedQuote: QuoteRequest
): void {
  try {
    const quotes = getQuoteRequests();

    const updatedQuotes = quotes.map(
      (quote) =>
        quote.id === updatedQuote.id
          ? updatedQuote
          : quote
    );

    saveAllQuotes(updatedQuotes);
  } catch (error) {
    console.error(
      "Error al actualizar cotización:",
      error
    );
  }
}

/* =========================================================
   CAMBIAR ESTADO
========================================================= */

export function updateQuoteStatus(
  id: string,
  status: QuoteStatus
): void {
  try {
    const quotes = getQuoteRequests();

    const updatedQuotes = quotes.map(
      (quote) =>
        quote.id === id
          ? {
              ...quote,
              status,
            }
          : quote
    );

    saveAllQuotes(updatedQuotes);
  } catch (error) {
    console.error(
      "Error al actualizar estado:",
      error
    );
  }
}

/* =========================================================
   ARCHIVAR / RESTAURAR
========================================================= */

export function setQuoteArchived(
  id: string,
  archived: boolean
): void {
  try {
    const quotes = getQuoteRequests();

    const updatedQuotes = quotes.map(
      (quote) =>
        quote.id === id
          ? {
              ...quote,
              archived,
            }
          : quote
    );

    saveAllQuotes(updatedQuotes);
  } catch (error) {
    console.error(
      "Error al archivar cotización:",
      error
    );
  }
}

/* =========================================================
   ELIMINAR DEFINITIVAMENTE
========================================================= */

export function deleteQuoteRequest(
  id: string
): void {
  try {
    const quotes = getQuoteRequests();

    const updatedQuotes = quotes.filter(
      (quote) => quote.id !== id
    );

    saveAllQuotes(updatedQuotes);
  } catch (error) {
    console.error(
      "Error al eliminar cotización:",
      error
    );
  }
}