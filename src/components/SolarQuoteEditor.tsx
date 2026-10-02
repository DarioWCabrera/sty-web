import {
    useMemo,
    useState,
} from "react";

import {
    Check,
    Plus,
    Sun,
    Trash2,
    X,
} from "lucide-react";

import type { QuoteItem } from "../types/quote";
import type { SolarLead } from "../types/lead";

interface SolarQuoteEditorProps {
    lead: SolarLead;

    onCancel: () => void;

    onSave: (
        updatedLead: SolarLead
    ) => void;
}

const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(value);

/* =========================================================
   CONCEPTOS INICIALES
========================================================= */

function createInitialItems(
    lead: SolarLead
): QuoteItem[] {
    /*
     * Si ya existe un presupuesto solar,
     * editamos exactamente esos conceptos.
     */
    if (
        lead.solarQuoteItems &&
        lead.solarQuoteItems.length > 0
    ) {
        return lead.solarQuoteItems.map(
            (item) => ({
                ...item,
            })
        );
    }

    /*
     * Si todavía no existe presupuesto,
     * generamos la estructura inicial.
     *
     * NO distribuimos automáticamente el
     * importe presupuestado entre conceptos.
     * Los precios los define STY.
     */

    return [
        {
            id: crypto.randomUUID(),
            description: "Paneles solares",
            quantity:
                lead.estimatedPanels || 1,
            unit: "unidad",
            unitPrice: 0,
            subtotal: 0,
        },

        {
            id: crypto.randomUUID(),
            description:
                "Inversor fotovoltaico",
            quantity: 1,
            unit: "unidad",
            unitPrice: 0,
            subtotal: 0,
        },

        {
            id: crypto.randomUUID(),
            description:
                "Estructura de montaje",
            quantity: 1,
            unit: "servicio",
            unitPrice: 0,
            subtotal: 0,
        },

        {
            id: crypto.randomUUID(),
            description:
                "Protecciones eléctricas",
            quantity: 1,
            unit: "servicio",
            unitPrice: 0,
            subtotal: 0,
        },

        {
            id: crypto.randomUUID(),
            description:
                "Instalación y puesta en marcha",
            quantity: 1,
            unit: "servicio",
            unitPrice: 0,
            subtotal: 0,
        },
    ];
}

/* =========================================================
   COMPONENTE
========================================================= */

function SolarQuoteEditor({
    lead,
    onCancel,
    onSave,
}: SolarQuoteEditorProps) {
    const [items, setItems] = useState<
        QuoteItem[]
    >(() => createInitialItems(lead));

    const [notes, setNotes] = useState(
        lead.solarQuoteNotes || ""
    );

    const [
        validityDays,
        setValidityDays,
    ] = useState(
        lead.solarQuoteValidityDays || 7
    );

    /* =======================================================
       ÚLTIMO IMPORTE PRESUPUESTADO DEL HISTORIAL
    ======================================================= */

    const historicalBudget =
        [...(lead.history || [])]
            .reverse()
            .find(
                (entry) =>
                    entry.budgetAmount !== undefined
            )?.budgetAmount;

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
                    updated.quantity = Math.max(
                        0,
                        Math.floor(
                            Number(value) || 0
                        )
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
            unit: "unidad",
            unitPrice: 0,
            subtotal: 0,
        };

        setItems((current) => [
            ...current,
            newItem,
        ]);
    };

    /* =======================================================
       ELIMINAR CONCEPTO
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

        const updatedLead: SolarLead = {
            ...lead,

            solarQuoteItems:
                normalizedItems,

            solarQuoteTotal:
                finalTotal,

            solarQuoteNotes:
                notes.trim() || undefined,

            solarQuoteValidityDays:
                validityDays,

            solarQuotedAt:
                new Date().toISOString(),

            };

        onSave(updatedLead);
    };

    return (
        <div className="quote-editor">

            {/* HEADER */}

            <div className="quote-editor-header">
                <div>
                    <span>
                        PRESUPUESTO SOLAR
                    </span>

                    <h3>
                        {lead.name} · Sistema solar
                    </h3>

                    <p>
                        Prepará el presupuesto
                        definitivo que recibirá el
                        cliente.
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

            {/* REFERENCIA DEL SIMULADOR */}

            <div className="quote-editor-reference">
                <Sun size={18} />

                <div>
                    <span>
                        Sistema estimado por la web
                    </span>

                    <strong>
                        {lead.estimatedPower.toFixed(
                            1
                        )}{" "}
                        kWp ·{" "}
                        {lead.estimatedPanels} paneles
                    </strong>
                </div>

                <p>
                    Consumo informado:{" "}
                    <strong>
                        {lead.monthlyConsumption}{" "}
                        kWh/mes
                    </strong>
                </p>
            </div>

            {/* IMPORTE DEL HISTORIAL */}

            {historicalBudget !==
                undefined && (
                    <div className="quote-editor-reference">
                        <div>
                            <span>
                                Importe registrado al pasar
                                a Presupuestado
                            </span>

                            <strong>
                                {formatMoney(
                                    historicalBudget
                                )}
                            </strong>
                        </div>

                        <p>
                            Se conserva como referencia.
                            El presupuesto definitivo será
                            el total de los conceptos
                            detallados abajo.
                        </p>
                    </div>
                )}

            {/* TABLA */}

            <div className="quote-editor-table">

                <div className="quote-editor-row quote-editor-table-head">
                    <span>Concepto</span>
                    <span>Cantidad</span>
                    <span>Unidad</span>
                    <span>
                        Precio unitario
                    </span>
                    <span>Subtotal</span>
                    <span />
                </div>

                {items.map((item) => (
                    <div
                        className="quote-editor-row"
                        key={item.id}
                    >
                        <input
                            value={
                                item.description
                            }
                            placeholder="Ej: Panel, inversor, batería, traslado..."
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
                            <option value="unidad">
                                unidad
                            </option>

                            <option value="servicio">
                                servicio
                            </option>

                            <option value="m">
                                m
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
                                type="text"
                                inputMode="numeric"
                                value={new Intl.NumberFormat("es-AR").format(
                                    item.unitPrice
                                )}
                                onFocus={(e) => {
                                    if (item.unitPrice === 0) {
                                        e.target.select();
                                    }
                                }}
                                onChange={(e) => {
                                    const rawValue =
                                        e.target.value.replace(/\D/g, "");

                                    updateItem(
                                        item.id,
                                        "unitPrice",
                                        rawValue
                                    );
                                }}
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
                        SISTEMA ESTIMADO
                    </span>

                    <strong>
                        {lead.estimatedPower.toFixed(
                            1
                        )}{" "}
                        kWp
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
                        placeholder="Ej: Incluye provisión, instalación y puesta en marcha. No incluye trabajos adicionales no especificados..."
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
                                Number(
                                    e.target.value
                                )
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
                    El presupuesto guardado será
                    el valor definitivo preparado
                    por STY para este proyecto
                    solar. Los datos del simulador
                    permanecerán registrados como
                    referencia interna.
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

export default SolarQuoteEditor;