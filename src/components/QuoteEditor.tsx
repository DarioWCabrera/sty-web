import { useMemo, useState } from "react";

import {
  Calculator,
  Check,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type {
  QuoteItem,
  QuoteRequest,
} from "../types/quote";

interface QuoteEditorProps {
  quote: QuoteRequest;

  onCancel: () => void;

  onSave: (
    updatedQuote: QuoteRequest
  ) => void;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

const getQuoteServicesText = (
  quote: QuoteRequest
): string => {
  if (
    quote.serviceLabels &&
    quote.serviceLabels.length > 0
  ) {
    return quote.serviceLabels.join(" · ");
  }

  return quote.serviceLabel;
};

function QuoteEditor({
  quote,
  onCancel,
  onSave,
}: QuoteEditorProps) {
  /*
   * Si ya existe un presupuesto STY,
   * editamos ese.
   *
   * Si todavía no existe, tomamos como
   * punto de partida los conceptos de
   * la estimación web.
   */

  const [items, setItems] = useState<
    QuoteItem[]
  >(() =>
    (quote.finalItems || quote.items).map(
      (item) => ({
        ...item,
      })
    )
  );

  const [notes, setNotes] = useState(
    quote.quoteNotes || ""
  );

  const [validityDays, setValidityDays] =
    useState(
      quote.validityDays || 7
    );

  /* =======================================================
     TOTAL
  ======================================================= */

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          item.quantity *
          item.unitPrice,
        0
      ),
    [items]
  );

  /* =======================================================
     ACTUALIZAR ITEM
  ======================================================= */

  const updateItem = (
    id: string,
    field:
      | "description"
      | "quantity"
      | "unit"
      | "unitPrice",
    value: string
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updated = {
          ...item,
        };

        if (field === "description") {
          updated.description = value;
        }

        if (field === "unit") {
          updated.unit = value;
        }

        if (field === "quantity") {
          updated.quantity =
            Math.max(
              0,
              Math.floor(Number(value) || 0)
            );
        }

        if (field === "unitPrice") {
          updated.unitPrice =
            Number(value) || 0;
        }

        updated.subtotal =
          updated.quantity *
          updated.unitPrice;

        return updated;
      })
    );
  };

  /* =======================================================
     AGREGAR CONCEPTO
  ======================================================= */

  const addItem = () => {
    const newItem: QuoteItem = {
      id: crypto.randomUUID(),

      description: "",

      quantity: 1,

      unit: "servicio",

      unitPrice: 0,

      subtotal: 0,
    };

    setItems((current) => [
      ...current,
      newItem,
    ]);
  };

  /* =======================================================
     ELIMINAR
  ======================================================= */

  const removeItem = (id: string) => {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /* =======================================================
     GUARDAR
  ======================================================= */

  const saveQuote = () => {
    if (items.length === 0) {
      return;
    }

    const normalizedItems =
      items.map((item) => ({
        ...item,

        quantity:
          Number(item.quantity) || 0,

        unitPrice:
          Number(item.unitPrice) || 0,

        subtotal:
          (Number(item.quantity) || 0) *
          (Number(item.unitPrice) || 0),
      }));

    const finalTotal =
      normalizedItems.reduce(
        (sum, item) =>
          sum + item.subtotal,
        0
      );

    const updatedQuote: QuoteRequest = {
      ...quote,

      finalItems: normalizedItems,

      finalTotal,

      quoteNotes:
        notes.trim() || undefined,

      validityDays,

      quotedAt:
        new Date().toISOString(),

      status: "Cotizada",
    };

    onSave(updatedQuote);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="quote-editor">
      <div className="quote-editor-header">
        <div>
          <span>
            REVISIÓN DE COTIZACIÓN
          </span>

          <h3>
            {quote.customerName} ·{" "}
            {getQuoteServicesText(quote)}
          </h3>

          <p>
            Revisá la estimación generada
            por la web y prepará el
            presupuesto definitivo de STY.
          </p>
        </div>

        <button
          type="button"
          className="quote-editor-close"
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      {/* COMPARACIÓN */}

      <div className="quote-editor-reference">
        <Calculator size={18} />

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

        <p>
          Este valor se conserva como
          referencia y no será modificado.
        </p>
      </div>

      {/* TABLA */}

      <div className="quote-editor-table">
        <div className="quote-editor-row quote-editor-table-head">
          <span>Concepto</span>
          <span>Cantidad</span>
          <span>Unidad</span>
          <span>Precio unitario</span>
          <span>Subtotal</span>
          <span />
        </div>

        {items.map((item) => (
          <div
            className="quote-editor-row"
            key={item.id}
          >
            <input
              value={item.description}
              placeholder="Ej: Mangueras, traslado, conexiones..."
              onChange={(e) =>
                updateItem(
                  item.id,
                  "description",
                  e.target.value
                )
              }
              aria-label="Concepto"
            />

            <input
              type="number"
              min="0"
              step="1"
              value={item.quantity}
              onChange={(e) =>
                updateItem(
                  item.id,
                  "quantity",
                  e.target.value
                )
              }
              aria-label="Cantidad"
            />

            <select
              value={item.unit}
              onChange={(e) =>
                updateItem(
                  item.id,
                  "unit",
                  e.target.value
                )
              }
              aria-label="Unidad"
            >
              <option value="m">
                m
              </option>

              <option value="unidad">
                unidad
              </option>

              <option value="servicio">
                servicio
              </option>

              <option value="hora">
                hora
              </option>

              <option value="día">
                día
              </option>

              <option value="global">
                global
              </option>
            </select>

            <div className="quote-editor-money">
              <span>$</span>

              <input
                type="number"
                min="0"
                step="1"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(
                    item.id,
                    "unitPrice",
                    e.target.value
                  )
                }
                aria-label="Precio unitario"
              />
            </div>

            <strong>
              {formatMoney(
                item.quantity *
                item.unitPrice
              )}
            </strong>

            <button
              type="button"
              className="quote-editor-delete"
              onClick={() =>
                removeItem(item.id)
              }
              title="Eliminar concepto"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="quote-add-item"
        onClick={addItem}
      >
        <Plus size={16} />
        Agregar concepto
      </button>

      {/* TOTAL */}

      <div className="quote-editor-total">
        <div>
          <span>
            ESTIMACIÓN WEB
          </span>

          <strong>
            {formatMoney(
              quote.estimatedTotal
            )}
          </strong>
        </div>

        <div className="quote-editor-final-total">
          <span>
            PRESUPUESTO STY
          </span>

          <strong>
            {formatMoney(total)}
          </strong>
        </div>
      </div>

      {/* OBSERVACIONES */}

      <div className="quote-editor-bottom">
        <div className="quote-editor-field">
          <label>
            Observaciones para el cliente
          </label>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Ej: El presupuesto incluye mano de obra y zanjeo. No incluye materiales no especificados..."
          />
        </div>

        <div className="quote-editor-field">
          <label>
            Validez del presupuesto
          </label>

          <select
            value={validityDays}
            onChange={(e) =>
              setValidityDays(
                Number(e.target.value)
              )
            }
          >
            <option value={3}>
              3 días
            </option>

            <option value={5}>
              5 días
            </option>

            <option value={7}>
              7 días
            </option>

            <option value={10}>
              10 días
            </option>

            <option value={15}>
              15 días
            </option>

            <option value={30}>
              30 días
            </option>
          </select>
        </div>
      </div>

      <div className="quote-editor-warning">
        <strong>
          Presupuesto STY
        </strong>

        <p>
          El importe guardado será la
          cotización revisada por STY. La
          estimación original generada por
          la web permanecerá registrada
          para referencia interna.
        </p>
      </div>

      {/* BOTONES */}

      <div className="quote-editor-actions">
        <button
          type="button"
          className="quote-editor-cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="quote-editor-save"
          onClick={saveQuote}
        >
          <Check size={17} />
          Guardar presupuesto
        </button>
      </div>
    </div>
  );
}

export default QuoteEditor;