import { useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Construction,
  Droplets,
  Factory,
  MapPin,
  Phone,
  Shovel,
  Wrench,
  Zap,
} from "lucide-react";

import { getPricing } from "../data/pricing";
import { saveQuoteRequest } from "../data/quotes";
import PerforationQuoteForm from "../components/PerforationQuoteForm";

import {
  calculateQuote,
  calculateQuoteTotal,
} from "../utils/quoteCalculator";

import type {
  QuoteItem,
  QuoteRequest,
  ServiceType,
} from "../types/quote";

interface QuoteCalculatorProps {
  onBack: () => void;
}

const SERVICES: {
  id: ServiceType;
  title: string;
  description: string;
  enabled: boolean;
}[] = [
    {
      id: "zanjeo",
      title: "Zanjeo",
      description:
        "Estimá trabajos de zanjeo según los metros aproximados.",
      enabled: true,
    },
    {
      id: "perforacion",
      title: "Perforación",
      description:
        "Perforaciones y soluciones para provisión de agua.",
      enabled: true,
    },
    {
      id: "bomba",
      title: "Bombas",
      description:
        "Instalación de bombas, cañerías y alimentación.",
      enabled: true,
    },
    {
      id: "electricidad",
      title: "Electricidad",
      description:
        "Trabajos eléctricos para campo, comercio y vivienda.",
      enabled: true,
    },
    {
      id: "molino",
      title: "Molinos / agua",
      description:
        "Instalaciones de molinos y sistemas de conducción de agua.",
      enabled: true,
    },
  ];

function QuoteCalculator({ onBack }: QuoteCalculatorProps) {
  const pricing = getPricing();

  const [selectedServices, setSelectedServices] =
    useState<ServiceType[]>([]);
  const [projectStarted, setProjectStarted] = useState(false);

  const [meters, setMeters] = useState<string>("100");
  const metersNumber = Number(meters) || 0;
  const [zanjeoUsage, setZanjeoUsage] =
    useState("Tendido de agua");

  const [depth, setDepth] = useState<string>("30");
  const [diameter, setDiameter] = useState<string>("4");
  const depthNumber = Number(depth) || 0;
  const [perforationUsage, setPerforationUsage] =
    useState("Abastecimiento de vivienda");
  /* BOMBA */

  const [pumpWorkType, setPumpWorkType] =
    useState("Instalación nueva");

  const [pumpType, setPumpType] =
    useState("Sumergible");

  const [pumpDepth, setPumpDepth] =
    useState<string>("");

  const [pumpPipeMeters, setPumpPipeMeters] =
    useState<string>("");

  const [pumpCableMeters, setPumpCableMeters] =
    useState<string>("");

  const [pumpUsage, setPumpUsage] =
    useState("Vivienda");

  const pumpDepthNumber =
    Number(pumpDepth) || 0;

  const pumpPipeMetersNumber =
    Number(pumpPipeMeters) || 0;

  const pumpCableMetersNumber =
    Number(pumpCableMeters) || 0;

  /* ELECTRICIDAD */

  const [electricalWorkType, setElectricalWorkType] =
    useState("Instalación nueva");

  const [electricalMeters, setElectricalMeters] =
    useState<string>("");

  const [electricalUsage, setElectricalUsage] =
    useState("Vivienda");

  const [electricalSupply, setElectricalSupply] =
    useState("Monofásica");

  const electricalMetersNumber =
    Number(electricalMeters) || 0;

  /* MOLINOS / AGUA */

  const [windmillWorkType, setWindmillWorkType] =
    useState("Instalación nueva");

  const [windmillTrenchingMeters, setWindmillTrenchingMeters] =
    useState<string>("");

  const [windmillPipeMeters, setWindmillPipeMeters] =
    useState<string>("");

  const [windmillUsage, setWindmillUsage] =
    useState("Ganadería");

  const windmillTrenchingMetersNumber =
    Number(windmillTrenchingMeters) || 0;

  const windmillPipeMetersNumber =
    Number(windmillPipeMeters) || 0;

  const [location, setLocation] = useState("Tres Arroyos");
  const [notes, setNotes] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [cuit, setCuit] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [sent, setSent] = useState(false);

  const toggleService = (service: ServiceType) => {
    setSelectedServices((current) => {
      if (current.includes(service)) {
        return current.filter((item) => item !== service);
      }

      return [...current, service];
    });
  };

  const continueWithServices = () => {
    if (selectedServices.length === 0) {
      return;
    }

    setProjectStarted(true);
  };

  const changeServices = () => {
    setProjectStarted(false);
  };

  const items = useMemo<QuoteItem[]>(() => {
    const combinedItems: QuoteItem[] = [];

    if (selectedServices.includes("zanjeo")) {
      combinedItems.push(
        ...calculateQuote(
          {
            serviceType: "zanjeo",
            meters: metersNumber,
          },
          pricing
        )
      );
    }

    if (selectedServices.includes("perforacion")) {
      combinedItems.push(
        ...calculateQuote(
          {
            serviceType: "perforacion",
            depth: depthNumber,
          },
          pricing
        )
      );
    }

    if (selectedServices.includes("bomba")) {
      combinedItems.push(
        ...calculateQuote(
          {
            serviceType: "bomba",
            pipeMeters:
              pumpPipeMetersNumber,
            cableMeters:
              pumpCableMetersNumber,
          },
          pricing
        )
      );
    }

    if (selectedServices.includes("electricidad")) {
      combinedItems.push(
        ...calculateQuote(
          {
            serviceType: "electricidad",
            meters: electricalMetersNumber,
          },
          pricing
        )
      );
    }

    if (selectedServices.includes("molino")) {
      combinedItems.push(
        ...calculateQuote(
          {
            serviceType: "molino",
            trenchingMeters:
              windmillTrenchingMetersNumber,
            pipeMeters:
              windmillPipeMetersNumber,
          },
          pricing
        )
      );
    }

    return combinedItems;
  }, [
    selectedServices,
    metersNumber,
    depthNumber,
    pumpPipeMetersNumber,
    pumpCableMetersNumber,
    electricalMetersNumber,
    windmillTrenchingMetersNumber,
    windmillPipeMetersNumber,
    pricing,
  ]);

  const estimatedTotal = calculateQuoteTotal(items);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);

  const selectedServiceLabels = selectedServices.map(
    (serviceType) =>
      SERVICES.find((service) => service.id === serviceType)?.title ||
      serviceType
  );

  const submitRequest = () => {
    if (
      selectedServices.length === 0 ||
      !customerName.trim() ||
      !phone.trim()
    ) {
      return;
    }

    const primaryServiceType = selectedServices[0];
    const primaryServiceLabel =
      selectedServiceLabels[0] || primaryServiceType;

    const details: Record<string, string | number | boolean> = {};

    if (selectedServices.includes("zanjeo")) {
      details.zanjeoMeters = metersNumber;
      details.zanjeoUsage = zanjeoUsage;
    }

    if (selectedServices.includes("perforacion")) {
      details.perforationDepth = depthNumber;
      details.perforationDiameter = diameter;
      details.perforationUsage = perforationUsage;
    }

    if (selectedServices.includes("bomba")) {
      details.pumpWorkType =
        pumpWorkType;

      details.pumpType =
        pumpType;

      details.pumpDepth =
        pumpDepthNumber;

      details.pumpPipeMeters =
        pumpPipeMetersNumber;

      details.pumpCableMeters =
        pumpCableMetersNumber;

      details.pumpUsage =
        pumpUsage;
    }

    if (selectedServices.includes("electricidad")) {
      details.electricalWorkType =
        electricalWorkType;

      details.electricalMeters =
        electricalMetersNumber;

      details.electricalUsage =
        electricalUsage;

      details.electricalSupply =
        electricalSupply;
    }

    if (selectedServices.includes("molino")) {
      details.windmillWorkType =
        windmillWorkType;

      details.windmillTrenchingMeters =
        windmillTrenchingMetersNumber;

      details.windmillPipeMeters =
        windmillPipeMetersNumber;

      details.windmillUsage =
        windmillUsage;
    }

    // Compatibilidad con solicitudes y vistas anteriores del panel.
    if (primaryServiceType === "zanjeo") {
      details.meters = metersNumber;
      details.usage = zanjeoUsage;
    }

    if (primaryServiceType === "perforacion") {
      details.depth = depthNumber;
      details.diameter = diameter;
      details.usage = perforationUsage;
    }

    if (primaryServiceType === "bomba") {
      details.pipeMeters =
        pumpPipeMetersNumber;

      details.cableMeters =
        pumpCableMetersNumber;

      details.usage =
        pumpUsage;
    }

    if (primaryServiceType === "electricidad") {
      details.meters =
        electricalMetersNumber;

      details.usage =
        electricalUsage;
    }

    if (primaryServiceType === "molino") {
      details.trenchingMeters =
        windmillTrenchingMetersNumber;

      details.pipeMeters =
        windmillPipeMetersNumber;

      details.usage =
        windmillUsage;
    }

    const quote: QuoteRequest = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),

      customerName: customerName.trim(),
      cuit: cuit.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),

      serviceType: primaryServiceType,
      serviceLabel: primaryServiceLabel,
      serviceTypes: selectedServices,
      serviceLabels: selectedServiceLabels,

      details,
      items,
      estimatedTotal,

      status: "Nueva",
      notes: notes.trim() || undefined,
    };

    saveQuoteRequest(quote);
    setSent(true);
  };

  if (sent) {
    return (
      <main className="quote-page">
        <div className="container quote-success-wrapper">
          <section className="quote-success">
            <div className="quote-success-icon">
              <Check size={34} />
            </div>

            <span className="quote-eyebrow">
              SOLICITUD RECIBIDA
            </span>

            <h1>Solicitud enviada correctamente</h1>

            <p>
              STY recibió los datos de tu proyecto y podrá revisar la
              estimación antes de preparar una cotización definitiva.
            </p>

            <div className="quote-success-summary">
              <div>
                <span>
                  {selectedServices.length > 1
                    ? "Servicios"
                    : "Servicio"}
                </span>
                <strong>{selectedServiceLabels.join(" · ")}</strong>
              </div>

              <div>
                <span>Estimación web</span>
                <strong>{formatMoney(estimatedTotal)}</strong>
              </div>

              <div>
                <span>Ubicación</span>
                <strong>{location}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="quote-primary-button"
            >
              Volver al inicio
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (!projectStarted) {
    return (
      <main className="quote-page">
        <div className="container quote-container">
          <button className="quote-back" onClick={onBack}>
            <ArrowLeft size={17} />
            Volver
          </button>

          <section className="quote-heading">
            <span>COTIZACIÓN ONLINE</span>

            <h1>¿Qué trabajos necesitás?</h1>

            <p>
              Podés seleccionar uno o varios servicios para armar tu
              proyecto y solicitar una única cotización.
            </p>
          </section>

          <div className="quote-services">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                className={`quote-service-card ${!service.enabled ? "disabled" : ""
                  } ${selectedServices.includes(service.id)
                    ? "selected"
                    : ""
                  }`}
                disabled={!service.enabled}
                onClick={() => toggleService(service.id)}
              >
                <div className="quote-service-icon">
                  {service.id === "zanjeo" && (
                    <Construction size={26} />
                  )}
                  {service.id === "perforacion" && (
                    <Droplets size={26} />
                  )}
                  {service.id === "bomba" && <Wrench size={26} />}
                  {service.id === "electricidad" && <Zap size={26} />}
                  {service.id === "molino" && <Factory size={26} />}
                </div>

                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                {service.enabled ? (
                  selectedServices.includes(service.id) ? (
                    <div className="quote-service-selected">
                      <Check size={17} />
                      Seleccionado
                    </div>
                  ) : (
                    <div className="quote-service-select">
                      Seleccionar
                    </div>
                  )
                ) : (
                  <span className="quote-coming">Próximamente</span>
                )}
              </button>
            ))}
          </div>

          <div className="quote-services-actions">
            <div className="quote-services-count">
              {selectedServices.length === 0
                ? "Seleccioná al menos un servicio"
                : selectedServices.length === 1
                  ? "1 servicio seleccionado"
                  : `${selectedServices.length} servicios seleccionados`}
            </div>

            <button
              type="button"
              className="quote-primary-button"
              disabled={selectedServices.length === 0}
              onClick={continueWithServices}
            >
              Continuar
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  const invalidZanjeo =
    selectedServices.includes("zanjeo") && metersNumber <= 0;
  const invalidPerforacion =
    selectedServices.includes("perforacion") && depthNumber <= 0;

  const invalidElectricidad =
    selectedServices.includes("electricidad") &&
    electricalMetersNumber <= 0;

  return (
    <main className="quote-page">
      <div className="container quote-container">
        <button
          type="button"
          className="quote-back"
          onClick={changeServices}
        >
          <ArrowLeft size={17} />
          Cambiar servicios
        </button>

        <section className="quote-heading">
          <span>COTIZACIÓN INICIAL</span>

          <h1>Datos del proyecto</h1>

          <p>
            Completá los datos de cada trabajo seleccionado. STY recibirá
            todo como una única solicitud.
          </p>
        </section>

        <div className="quote-layout">
          <div>
            {selectedServices.includes("zanjeo") && (
              <section className="quote-form-card">
                <div className="quote-card-title">
                  <Construction size={21} />

                  <div>
                    <span>SERVICIO 1</span>
                    <h2>Zanjeo</h2>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Metros aproximados de zanjeo</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={meters}
                      onChange={(e) => setMeters(e.target.value)}
                      placeholder="Ej: 100"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>¿Para qué se realizará?</label>

                  <select
                    value={zanjeoUsage}
                    onChange={(e) => setZanjeoUsage(e.target.value)}
                  >
                    <option>Tendido de agua</option>
                    <option>Instalación eléctrica</option>
                    <option>Sistema de bombeo</option>
                    <option>Molino</option>
                    <option>Otro</option>
                  </select>
                </div>
              </section>
            )}

            {selectedServices.includes("perforacion") && (
              <section
                className="quote-form-card"
                style={{ marginTop: "18px" }}
              >
                <div className="quote-card-title">
                  <Droplets size={21} />

                  <div>
                    <span>
                      {selectedServices.includes("zanjeo")
                        ? "SERVICIO 2"
                        : "SERVICIO 1"}
                    </span>
                    <h2>Perforación</h2>
                  </div>
                </div>

                <PerforationQuoteForm
                  depth={depth}
                  setDepth={setDepth}
                  diameter={diameter}
                  setDiameter={setDiameter}
                  usage={perforationUsage}
                  setUsage={setPerforationUsage}
                />
              </section>
            )}

            {selectedServices.includes("bomba") && (
              <section
                className="quote-form-card"
                style={{ marginTop: "18px" }}
              >
                <div className="quote-card-title">
                  <Wrench size={21} />

                  <div>
                    <span>
                      SERVICIO{" "}
                      {selectedServices.indexOf("bomba") + 1}
                    </span>
                    <h2>Bombas</h2>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Tipo de trabajo</label>

                  <select
                    value={pumpWorkType}
                    onChange={(e) =>
                      setPumpWorkType(e.target.value)
                    }
                  >
                    <option>Instalación nueva</option>
                    <option>Reemplazo de bomba</option>
                    <option>Reparación o revisión</option>
                  </select>
                </div>

                <div className="quote-field">
                  <label>Tipo de bomba</label>

                  <select
                    value={pumpType}
                    onChange={(e) =>
                      setPumpType(e.target.value)
                    }
                  >
                    <option>Sumergible</option>
                    <option>Centrífuga</option>
                    <option>Presurizadora</option>
                    <option>No sé</option>
                  </select>
                </div>

                <div className="quote-field">
                  <label>Profundidad aproximada</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={pumpDepth}
                      onChange={(e) =>
                        setPumpDepth(e.target.value)
                      }
                      placeholder="Opcional"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Metros de cañería necesarios</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={pumpPipeMeters}
                      onChange={(e) =>
                        setPumpPipeMeters(e.target.value)
                      }
                      placeholder="Opcional"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Metros de cable necesarios</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={pumpCableMeters}
                      onChange={(e) =>
                        setPumpCableMeters(e.target.value)
                      }
                      placeholder="Opcional"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Uso de la instalación</label>

                  <select
                    value={pumpUsage}
                    onChange={(e) =>
                      setPumpUsage(e.target.value)
                    }
                  >
                    <option>Vivienda</option>
                    <option>Campo o establecimiento rural</option>
                    <option>Riego</option>
                    <option>Ganadería</option>
                    <option>Otro</option>
                  </select>
                </div>

                <p className="quote-field-help">
                  Los metros de cañería y cable son opcionales.
                  Si el trabajo no los requiere, podés dejarlos vacíos.
                </p>
              </section>
            )}

            {selectedServices.includes("electricidad") && (
              <section
                className="quote-form-card"
                style={{ marginTop: "18px" }}
              >
                <div className="quote-card-title">
                  <Zap size={21} />

                  <div>
                    <span>
                      SERVICIO{" "}
                      {selectedServices.indexOf("electricidad") + 1}
                    </span>
                    <h2>Electricidad</h2>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Tipo de trabajo</label>

                  <select
                    value={electricalWorkType}
                    onChange={(e) =>
                      setElectricalWorkType(e.target.value)
                    }
                  >
                    <option>Instalación nueva</option>
                    <option>Ampliación de instalación</option>
                    <option>Reparación o revisión</option>
                  </select>
                </div>

                <div className="quote-field">
                  <label>Metros aproximados de instalación</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={electricalMeters}
                      onChange={(e) =>
                        setElectricalMeters(e.target.value)
                      }
                      placeholder="Ej: 50"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Tipo de alimentación</label>

                  <select
                    value={electricalSupply}
                    onChange={(e) =>
                      setElectricalSupply(e.target.value)
                    }
                  >
                    <option>Monofásica</option>
                    <option>Trifásica</option>
                    <option>No sé</option>
                  </select>
                </div>

                <div className="quote-field">
                  <label>Destino de la instalación</label>

                  <select
                    value={electricalUsage}
                    onChange={(e) =>
                      setElectricalUsage(e.target.value)
                    }
                  >
                    <option>Vivienda</option>
                    <option>Comercio</option>
                    <option>Campo o establecimiento rural</option>
                    <option>Sistema de bombeo</option>
                    <option>Galpón</option>
                    <option>Otro</option>
                  </select>
                </div>

                <p className="quote-field-help">
                  La estimación se calcula según los metros aproximados.
                  STY revisará las características de la instalación antes
                  de confirmar el presupuesto definitivo.
                </p>
              </section>
            )}

            {selectedServices.includes("molino") && (
              <section
                className="quote-form-card"
                style={{ marginTop: "18px" }}
              >
                <div className="quote-card-title">
                  <Factory size={21} />

                  <div>
                    <span>
                      SERVICIO{" "}
                      {selectedServices.indexOf("molino") + 1}
                    </span>
                    <h2>Molinos / Agua</h2>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Tipo de trabajo</label>

                  <select
                    value={windmillWorkType}
                    onChange={(e) =>
                      setWindmillWorkType(e.target.value)
                    }
                  >
                    <option>Instalación nueva</option>
                    <option>Reemplazo o renovación</option>
                    <option>Reparación o revisión</option>
                  </select>
                </div>

                <div className="quote-field">
                  <label>Metros de zanjeo necesarios</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={windmillTrenchingMeters}
                      onChange={(e) =>
                        setWindmillTrenchingMeters(e.target.value)
                      }
                      placeholder="Opcional"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Metros de cañería necesarios</label>

                  <div className="quote-meter-input">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={windmillPipeMeters}
                      onChange={(e) =>
                        setWindmillPipeMeters(e.target.value)
                      }
                      placeholder="Opcional"
                    />
                    <span>metros</span>
                  </div>
                </div>

                <div className="quote-field">
                  <label>Uso de la instalación</label>

                  <select
                    value={windmillUsage}
                    onChange={(e) =>
                      setWindmillUsage(e.target.value)
                    }
                  >
                    <option>Ganadería</option>
                    <option>Abastecimiento de agua</option>
                    <option>Riego</option>
                    <option>Vivienda</option>
                    <option>Campo o establecimiento rural</option>
                    <option>Otro</option>
                  </select>
                </div>

                <p className="quote-field-help">
                  El zanjeo y la cañería son opcionales. Si el trabajo
                  no los requiere, podés dejar esos campos vacíos.
                </p>
              </section>
            )}

            <section
              className="quote-form-card"
              style={{ marginTop: "18px" }}
            >
              <div className="quote-card-title">
                <Shovel size={21} />

                <div>
                  <span>DATOS GENERALES</span>
                  <h2>Ubicación del proyecto</h2>
                </div>
              </div>

              <div className="quote-field">
                <label>
                  <MapPin size={15} />
                  Ubicación del trabajo
                </label>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Tres Arroyos"
                />
              </div>

              <div className="quote-field">
                <label>Observaciones</label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: establecimiento rural, acceso por camino de tierra, características del terreno, referencias para llegar, etc."
                />
              </div>
            </section>
          </div>

          <aside className="quote-estimate-card">
            <span className="quote-estimate-label">ESTIMACIÓN WEB</span>

            <h2>{formatMoney(estimatedTotal)}</h2>

            <p className="quote-estimate-subtitle">
              Referencia inicial del proyecto completo según los datos
              ingresados.
            </p>

            <div className="quote-estimate-items">
              {items.map((item) => (
                <div key={item.id} className="quote-estimate-item">
                  <div>
                    <strong>{item.description}</strong>
                    <span>
                      {item.quantity} {item.unit} ×{" "}
                      {formatMoney(item.unitPrice)}
                    </span>
                  </div>

                  <strong>{formatMoney(item.subtotal)}</strong>
                </div>
              ))}
            </div>

            <div className="quote-disclaimer">
              <strong>Estimación orientativa</strong>

              <p>
                Los valores mostrados son estimativos y pueden variar por
                actualizaciones de proveedores, materiales,
                características del terreno y condiciones particulares del
                trabajo.
              </p>

              <p>
                STY revisará la solicitud y confirmará la cotización
                definitiva antes de realizar el trabajo.
              </p>
            </div>
          </aside>
        </div>

        <section className="quote-customer-card">
          <div className="quote-card-title">
            <Phone size={20} />

            <div>
              <span>DATOS DE CONTACTO</span>
              <h2>¿A quién contactamos?</h2>
            </div>
          </div>

          <div className="quote-customer-grid">
            <div className="quote-field">
              <label>Nombre o razón social</label>
              <input
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Ej: Juan Pérez / Empresa S.A."
              />
            </div>

            <div className="quote-field">
              <label>CUIT</label>
              <input
                value={cuit}
                onChange={(e) =>
                  setCuit(e.target.value)
                }
                placeholder="Opcional — Ej: 30-12345678-9"
                inputMode="numeric"
              />
            </div>

            <div className="quote-field">
              <label>WhatsApp</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 2983..."
              />
            </div>

            <div className="quote-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <button
            type="button"
            className="quote-primary-button"
            disabled={
              !customerName.trim() ||
              !phone.trim() ||
              invalidZanjeo ||
              invalidPerforacion ||
              invalidElectricidad
            }
            onClick={submitRequest}
          >
            Enviar solicitud a STY
            <ArrowRight size={18} />
          </button>
        </section>
      </div>
    </main>
  );
}

export default QuoteCalculator;
