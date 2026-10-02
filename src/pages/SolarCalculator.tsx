import { useState } from "react";

import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Factory,
    Home,
    MapPin,
    Sun,
    Tractor,
    Zap,
} from "lucide-react";

import type { SolarLead } from "../types/lead";
import { saveSolarLead } from "../data/solarLeads";


type ProjectType = "vivienda" | "comercio" | "campo" | "industria";

interface SolarCalculatorProps {
    onBack: () => void;
}

const projectTypes = [
    {
        id: "vivienda" as ProjectType,
        label: "Vivienda",
        description: "Casa de uso permanente o temporal",
        icon: Home,
    },
    {
        id: "comercio" as ProjectType,
        label: "Comercio",
        description: "Local, oficina u otro establecimiento",
        icon: Building2,
    },
    {
        id: "campo" as ProjectType,
        label: "Campo",
        description: "Establecimiento o instalación rural",
        icon: Tractor,
    },
    {
        id: "industria" as ProjectType,
        label: "Industria",
        description: "Planta o instalación productiva",
        icon: Factory,
    },
];

function SolarCalculator({ onBack }: SolarCalculatorProps) {
    const [step, setStep] = useState(1);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [requestSent, setRequestSent] = useState(false);
    const [projectType, setProjectType] = useState<ProjectType | null>(null);
    const [monthlyConsumption, setMonthlyConsumption] = useState("");
    const [objective, setObjective] = useState("");
    const [location, setLocation] = useState("");

    const consumption = Number(monthlyConsumption) || 0;

    // CÁLCULO EXCLUSIVAMENTE DEMO.
    // Más adelante lo reemplazamos por un cálculo técnico real.
    const estimatedPower = consumption
        ? Math.max(1, Math.ceil((consumption / 120) * 10) / 10)
        : 0;

    const estimatedPanels = estimatedPower
        ? Math.ceil(estimatedPower / 0.55)
        : 0;

    const nextStep = () => {
        if (step < 6) {
            setStep((current) => current + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const previousStep = () => {
        if (step === 1) {
            onBack();
            return;
        }

        setStep((current) => current - 1);
    };

    return (
        <div className="solar-calculator-page">
            <header className="calculator-header">
                <div className="container calculator-header-content">
                    <button className="calculator-back" onClick={previousStep}>
                        <ArrowLeft size={19} />
                        Volver
                    </button>

                    <div className="calculator-brand">
                        <Sun size={21} />
                        <div>
                            <strong>Simulador Solar</strong>
                            <span>STY Perforaciones y Energía</span>
                        </div>
                    </div>

                    <span className="calculator-step-label">
                        Paso {step} de 6
                    </span>
                </div>
            </header>

            <div className="calculator-progress">
                <div
                    className="calculator-progress-bar"
                    style={{ width: `${(step / 6) * 100}%` }}
                />
            </div>

            <main className="calculator-main">
                <div className="calculator-content">

                    {step === 1 && (
                        <>
                            <span className="calculator-eyebrow">
                                COMENCEMOS
                            </span>

                            <h1>¿Para qué tipo de proyecto necesitás energía solar?</h1>

                            <p className="calculator-intro">
                                Esto nos permite hacer una primera estimación adaptada
                                al tipo de instalación.
                            </p>

                            <div className="project-options">
                                {projectTypes.map((type) => {
                                    const Icon = type.icon;
                                    const selected = projectType === type.id;

                                    return (
                                        <button
                                            key={type.id}
                                            className={`project-option ${selected ? "selected" : ""
                                                }`}
                                            onClick={() => setProjectType(type.id)}
                                        >
                                            <div className="project-option-icon">
                                                <Icon size={28} />
                                            </div>

                                            <div>
                                                <strong>{type.label}</strong>
                                                <span>{type.description}</span>
                                            </div>

                                            {selected && (
                                                <div className="selected-check">
                                                    <Check size={16} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                className="calculator-next"
                                disabled={!projectType}
                                onClick={nextStep}
                            >
                                Continuar
                                <ArrowRight size={19} />
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <span className="calculator-eyebrow">
                                CONSUMO
                            </span>

                            <h1>¿Cuánta energía consumís aproximadamente?</h1>

                            <p className="calculator-intro">
                                Podés encontrar este dato en tu factura de electricidad.
                                Para este demo utilizaremos el consumo mensual en kWh.
                            </p>

                            <div className="consumption-card">
                                <Zap size={32} />

                                <label>Consumo mensual</label>

                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 850"
                                        value={monthlyConsumption}
                                        onChange={(e) =>
                                            setMonthlyConsumption(e.target.value)
                                        }
                                    />
                                    <span>kWh / mes</span>
                                </div>

                                <small>
                                    No hace falta que sea exacto para realizar esta
                                    primera simulación.
                                </small>
                            </div>

                            <button
                                className="calculator-next"
                                disabled={consumption <= 0}
                                onClick={nextStep}
                            >
                                Continuar
                                <ArrowRight size={19} />
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <span className="calculator-eyebrow">
                                OBJETIVO
                            </span>

                            <h1>¿Qué buscás lograr con la instalación?</h1>

                            <p className="calculator-intro">
                                Elegí la opción que mejor represente tu necesidad.
                            </p>

                            <div className="objective-options">
                                {[
                                    "Reducir el consumo de la red",
                                    "Generar mi propia energía",
                                    "Abastecer un lugar sin red eléctrica",
                                    "Bombeo de agua",
                                    "Quiero que STY me asesore",
                                ].map((item) => (
                                    <button
                                        key={item}
                                        className={objective === item ? "selected" : ""}
                                        onClick={() => setObjective(item)}
                                    >
                                        <span>{item}</span>

                                        {objective === item && <Check size={18} />}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="calculator-next"
                                disabled={!objective}
                                onClick={nextStep}
                            >
                                Continuar
                                <ArrowRight size={19} />
                            </button>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <span className="calculator-eyebrow">
                                UBICACIÓN
                            </span>

                            <h1>¿Dónde estaría ubicada la instalación?</h1>

                            <p className="calculator-intro">
                                Por ahora solo necesitamos una localidad o una referencia
                                general.
                            </p>

                            <div className="location-card">
                                <MapPin size={30} />

                                <label>Localidad / zona</label>

                                <input
                                    type="text"
                                    placeholder="Ej: Tres Arroyos"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <button
                                className="calculator-next"
                                disabled={!location.trim()}
                                onClick={nextStep}
                            >
                                Ver estimación
                                <ArrowRight size={19} />
                            </button>
                        </>
                    )}

                    {step === 5 && (
                        <>
                            <span className="calculator-eyebrow">
                                ESTIMACIÓN INICIAL
                            </span>

                            <h1>Este podría ser un punto de partida.</h1>

                            <p className="calculator-intro">
                                Con la información ingresada, generamos una referencia
                                inicial para que STY pueda evaluar tu proyecto.
                            </p>

                            <div className="solar-result">
                                <div className="result-main">
                                    <Sun size={36} />

                                    <span>Sistema solar estimado</span>

                                    <strong>
                                        {estimatedPower.toFixed(1)} kWp
                                    </strong>

                                    <small>
                                        Estimación demostrativa
                                    </small>
                                </div>

                                <div className="result-grid">
                                    <div>
                                        <span>Paneles estimados</span>
                                        <strong>{estimatedPanels}</strong>
                                        <small>Tomando 550 W como referencia</small>
                                    </div>

                                    <div>
                                        <span>Consumo informado</span>
                                        <strong>{consumption}</strong>
                                        <small>kWh / mes</small>
                                    </div>

                                    <div>
                                        <span>Proyecto</span>
                                        <strong>
                                            {projectType
                                                ? projectType.charAt(0).toUpperCase() +
                                                projectType.slice(1)
                                                : "-"}
                                        </strong>
                                        <small>{location}</small>
                                    </div>

                                    <div>
                                        <span>Objetivo</span>
                                        <strong className="result-objective">
                                            {objective}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="technical-warning">
                                <strong>Importante</strong>
                                <p>
                                    Este resultado es únicamente orientativo y forma parte
                                    del demo. El dimensionamiento definitivo debe realizarlo
                                    STY considerando ubicación, radiación solar, orientación,
                                    equipos, instalación y condiciones reales del proyecto.
                                </p>
                            </div>

                            <button
                                className="calculator-next"
                                onClick={nextStep}
                            >
                                Solicitar evaluación a STY
                                <ArrowRight size={19} />
                            </button>
                        </>
                    )}
                    {step === 6 && !requestSent && (
                        <>
                            <span className="calculator-eyebrow">
                                ÚLTIMO PASO
                            </span>

                            <h1>¿Cómo puede contactarte STY?</h1>

                            <p className="calculator-intro">
                                Dejanos tus datos para que STY pueda revisar la información
                                de tu proyecto y ponerse en contacto con vos.
                            </p>

                            <div className="contact-form-card">
                                <div className="form-group">
                                    <label>Nombre y apellido *</label>

                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Pérez"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>WhatsApp *</label>

                                    <input
                                        type="tel"
                                        placeholder="Ej: 2983 123456"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>

                                    <input
                                        type="email"
                                        placeholder="Ej: juan@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="project-summary">
                                    <span>Resumen de tu solicitud</span>

                                    <div>
                                        <p>
                                            <strong>Proyecto:</strong>{" "}
                                            {projectType
                                                ? projectType.charAt(0).toUpperCase() +
                                                projectType.slice(1)
                                                : "-"}
                                        </p>

                                        <p>
                                            <strong>Ubicación:</strong> {location}
                                        </p>

                                        <p>
                                            <strong>Consumo:</strong> {consumption} kWh/mes
                                        </p>

                                        <p>
                                            <strong>Estimación:</strong>{" "}
                                            {estimatedPower.toFixed(1)} kWp · {estimatedPanels} paneles
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="calculator-next"
                                disabled={!name.trim() || !phone.trim()}
                                onClick={() => {
                                    if (!projectType) {
                                        return;
                                    }

                                    const newLead: SolarLead = {
                                        id: crypto.randomUUID(),
                                        createdAt: new Date().toISOString(),

                                        name: name.trim(),
                                        phone: phone.trim(),
                                        email: email.trim(),

                                        projectType,
                                        monthlyConsumption: consumption,
                                        objective,
                                        location,

                                        estimatedPower,
                                        estimatedPanels,

                                        status: "Nueva",
                                    };

                                    saveSolarLead(newLead);

                                    setRequestSent(true);
                                }}
                            >
                                Enviar solicitud
                                <ArrowRight size={19} />
                            </button>
                        </>
                    )}
                    {step === 6 && requestSent && (
                        <div className="request-success">
                            <div className="success-icon">
                                <Check size={38} />
                            </div>

                            <span className="calculator-eyebrow">
                                SOLICITUD RECIBIDA
                            </span>

                            <h1>Gracias, {name.split(" ")[0]}.</h1>

                            <p>
                                Tu solicitud fue registrada correctamente.
                                STY ya cuenta con la información inicial de tu proyecto
                                para poder evaluarlo.
                            </p>

                            <div className="success-summary">
                                <div>
                                    <span>Sistema estimado</span>
                                    <strong>{estimatedPower.toFixed(1)} kWp</strong>
                                </div>

                                <div>
                                    <span>Paneles estimados</span>
                                    <strong>{estimatedPanels}</strong>
                                </div>

                                <div>
                                    <span>Ubicación</span>
                                    <strong>{location}</strong>
                                </div>
                            </div>

                            <button
                                className="calculator-next"
                                onClick={onBack}
                            >
                                Volver al inicio
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default SolarCalculator;