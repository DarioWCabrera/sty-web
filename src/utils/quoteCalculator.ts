import type {
  QuoteItem,
  ServiceType,
} from "../types/quote";

import type { StyPricing } from "../types/pricing";

interface QuoteCalculationInput {
  serviceType: ServiceType;

  meters?: number;
  depth?: number;

  pipeMeters?: number;
  cableMeters?: number;
  trenchingMeters?: number;

  includeTrenching?: boolean;
  includePipe?: boolean;
  includeCable?: boolean;
}

/* =========================================================
   CREAR ITEM
========================================================= */

function createItem(
  description: string,
  quantity: number,
  unit: string,
  unitPrice: number
): QuoteItem {
  return {
    id: crypto.randomUUID(),

    description,

    quantity,

    unit,

    unitPrice,

    subtotal: quantity * unitPrice,
  };
}

/* =========================================================
   CALCULAR COTIZACIÓN
========================================================= */

export function calculateQuote(
  input: QuoteCalculationInput,
  pricing: StyPricing
): QuoteItem[] {
  const items: QuoteItem[] = [];

  /* ======================
     ZANJEO
  ====================== */

  if (input.serviceType === "zanjeo") {
    const meters = input.meters || 0;

    items.push(
      createItem(
        "Zanjeo",
        meters,
        "m",
        pricing.trenchingPerMeter
      )
    );
  }

  /* ======================
     PERFORACIÓN
  ====================== */

  if (input.serviceType === "perforacion") {
    const depth = input.depth || 0;

    items.push(
      createItem(
        "Perforación",
        depth,
        "m",
        pricing.drillingPerMeter
      )
    );
  }

  /* ======================
     BOMBA
  ====================== */

  if (input.serviceType === "bomba") {
  /* Instalación base */
  items.push(
    createItem(
      "Instalación de bomba",
      1,
      "servicio",
      pricing.pumpInstallationBase
    )
  );

  /* Cañería opcional */
  const pipeMeters =
    input.pipeMeters || 0;

  if (pipeMeters > 0) {
    items.push(
      createItem(
        "Cañería para bomba",
        pipeMeters,
        "m",
        pricing.pumpPipePerMeter
      )
    );
  }

  /* Cable opcional */
  const cableMeters =
    input.cableMeters || 0;

  if (cableMeters > 0) {
    items.push(
      createItem(
        "Cableado para bomba",
        cableMeters,
        "m",
        pricing.pumpCablePerMeter
      )
    );
  }
}

  /* ======================
     ELECTRICIDAD
  ====================== */

  if (input.serviceType === "electricidad") {
    items.push(
      createItem(
        "Instalación eléctrica",
        input.meters || 0,
        "m",
        pricing.electricalPerMeter
      )
    );
  }

  /* ======================
     MOLINO
  ====================== */

  if (input.serviceType === "molino") {
  /* Instalación base */
  items.push(
    createItem(
      "Instalación de molino",
      1,
      "servicio",
      pricing.windmillInstallationBase
    )
  );

  /* Zanjeo opcional */
  const trenchingMeters =
    input.trenchingMeters || 0;

  if (trenchingMeters > 0) {
    items.push(
      createItem(
        "Zanjeo para molino / agua",
        trenchingMeters,
        "m",
        pricing.windmillTrenchingPerMeter
      )
    );
  }

  /* Cañería opcional */
  const pipeMeters =
    input.pipeMeters || 0;

  if (pipeMeters > 0) {
    items.push(
      createItem(
        "Cañería para molino / agua",
        pipeMeters,
        "m",
        pricing.windmillPipePerMeter
      )
    );
  }
}

  return items;
}

/* =========================================================
   TOTAL
========================================================= */

export function calculateQuoteTotal(
  items: QuoteItem[]
): number {
  return items.reduce(
    (total, item) =>
      total + item.subtotal,
    0
  );
}