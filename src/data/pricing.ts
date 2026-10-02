import type { StyPricing } from "../types/pricing";

const STORAGE_KEY = "sty_pricing";

/*
  PRECIOS DEMO

  Son únicamente valores de prueba para desarrollar
  el funcionamiento del sistema.

  Después STY cargará sus precios reales desde
  el panel de administración.
*/

const DEFAULT_PRICING: StyPricing = {
  /* ZANJEO */

  trenchingPerMeter: 8500,

  /* PERFORACIÓN */

  drillingPerMeter: 32000,

  /* BOMBAS */

  pumpInstallationBase: 180000,
  pumpPipePerMeter: 6500,
  pumpCablePerMeter: 4200,

  /* ELECTRICIDAD */

  electricalPerMeter: 9500,

  /* MOLINOS */

  windmillInstallationBase: 350000,
  windmillTrenchingPerMeter: 8500,
  windmillPipePerMeter: 6500,
};

export function getPricing(): StyPricing {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return DEFAULT_PRICING;
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_PRICING,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Error al obtener precios STY:",
      error
    );

    return DEFAULT_PRICING;
  }
}

export function savePricing(
  pricing: StyPricing
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(pricing)
    );
  } catch (error) {
    console.error(
      "Error al guardar precios STY:",
      error
    );
  }
}

export function resetPricing(): void {
  localStorage.removeItem(STORAGE_KEY);
}