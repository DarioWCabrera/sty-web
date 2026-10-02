import { useState } from "react";
import {
  Check,
  RotateCcw,
  Save,
  Settings,
} from "lucide-react";

import type { StyPricing } from "../types/pricing";

import {
  getPricing,
  resetPricing,
  savePricing,
} from "../data/pricing";

const formatInputMoney = (value: number) =>
  new Intl.NumberFormat("es-AR").format(value);

function PricingManager() {
  const [pricing, setPricing] =
    useState<StyPricing>(() => getPricing());

  const [saved, setSaved] =
    useState(false);

  const updatePrice = (
    field: keyof StyPricing,
    value: string
  ) => {
    const numericValue =
      Number(value.replace(/\D/g, "")) || 0;

    setPricing((current) => ({
      ...current,
      [field]: numericValue,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    savePricing(pricing);

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "¿Querés restaurar todos los precios iniciales de STY?"
    );

    if (!confirmed) {
      return;
    }

    resetPricing();

    setPricing(getPricing());
    setSaved(false);
  };

  const renderPriceInput = (
    field: keyof StyPricing,
    label: string,
    description: string
  ) => (
    <div className="pricing-field">
      <div className="pricing-field-info">
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <div className="pricing-input-wrapper">
        <span>$</span>

        <input
          type="text"
          inputMode="numeric"
          value={formatInputMoney(
            pricing[field]
          )}
          onFocus={(e) => {
            if (pricing[field] === 0) {
              e.target.select();
            }
          }}
          onChange={(e) =>
            updatePrice(
              field,
              e.target.value
            )
          }
        />
      </div>
    </div>
  );

  return (
    <section className="pricing-manager">
      <div className="pricing-header">
        <div>
          <div className="pricing-title">
            <Settings size={22} />

            <h2>Lista de precios STY</h2>
          </div>

          <p>
            Actualizá los valores utilizados por
            el sistema para calcular las
            estimaciones de los clientes.
          </p>
        </div>
      </div>

      <div className="pricing-warning">
        Los cambios se aplicarán a las nuevas
        cotizaciones. Las solicitudes ya
        registradas conservarán los valores con
        los que fueron calculadas.
      </div>

      <div className="pricing-sections">
        {/* ZANJEO */}

        <div className="pricing-card">
          <div className="pricing-card-header">
            <h3>Zanjeos</h3>
          </div>

          {renderPriceInput(
            "trenchingPerMeter",
            "Precio por metro",
            "Valor utilizado para calcular trabajos de zanjeo."
          )}
        </div>

        {/* PERFORACIONES */}

        <div className="pricing-card">
          <div className="pricing-card-header">
            <h3>Perforaciones</h3>
          </div>

          {renderPriceInput(
            "drillingPerMeter",
            "Precio por metro",
            "Valor base utilizado según la profundidad de la perforación."
          )}
        </div>

        {/* BOMBAS */}

        <div className="pricing-card">
          <div className="pricing-card-header">
            <h3>Bombas</h3>
          </div>

          {renderPriceInput(
            "pumpInstallationBase",
            "Instalación base",
            "Valor inicial por instalación de bomba."
          )}

          {renderPriceInput(
            "pumpPipePerMeter",
            "Cañería por metro",
            "Precio por cada metro de cañería."
          )}

          {renderPriceInput(
            "pumpCablePerMeter",
            "Cableado por metro",
            "Precio por cada metro de cableado."
          )}
        </div>

        {/* ELECTRICIDAD */}

        <div className="pricing-card">
          <div className="pricing-card-header">
            <h3>Electricidad</h3>
          </div>

          {renderPriceInput(
            "electricalPerMeter",
            "Instalación por metro",
            "Valor utilizado para trabajos eléctricos calculados por metro."
          )}
        </div>

        {/* MOLINOS */}

        <div className="pricing-card">
          <div className="pricing-card-header">
            <h3>Molinos</h3>
          </div>

          {renderPriceInput(
            "windmillInstallationBase",
            "Instalación base",
            "Valor inicial de instalación del molino."
          )}

          {renderPriceInput(
            "windmillTrenchingPerMeter",
            "Zanjeo por metro",
            "Precio de zanjeo asociado al trabajo."
          )}

          {renderPriceInput(
            "windmillPipePerMeter",
            "Cañería por metro",
            "Precio por metro de cañería asociado al molino."
          )}
        </div>
      </div>

      <div className="pricing-actions">
        <button
          type="button"
          className="pricing-reset-button"
          onClick={handleReset}
        >
          <RotateCcw size={17} />
          Restaurar valores iniciales
        </button>

        <button
          type="button"
          className="pricing-save-button"
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Check size={17} />
              Precios guardados
            </>
          ) : (
            <>
              <Save size={17} />
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default PricingManager;