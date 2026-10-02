import {
  ArrowRight,
  Droplets,
  Sun,
  Zap,
  ShieldCheck,
  MapPin,
  Phone,
  Gauge,
} from "lucide-react";
import logo from "./assets/logo.png";
import { useState } from "react";
import SolarCalculator from "./pages/SolarCalculator";
import AdminDashboard from "./pages/AdminDashboard";
import QuoteCalculator from "./pages/QuoteCalculator";
import "./App.css";

function App() {
  const [view, setView] = useState<
    "home" | "solar" | "admin" | "quote"
  >("home");

  if (view === "solar") {
    return <SolarCalculator onBack={() => setView("home")} />;
  }
  if (view === "admin") {
    return (
      <AdminDashboard
        onBack={() => setView("home")}
      />
    );
  }
  if (view === "quote") {
    return (
      <QuoteCalculator
        onBack={() => setView("home")}
      />
    );
  }
  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="container header-content">
          <div className="brand">
            <div className="logo-container">
              <img src={logo} alt="STY Perforaciones y Energía" />
            </div>

            <div className="brand-identity">
              <strong className="brand-sty">STY</strong>

              <span className="brand-owner">
                DE ALEJANDRO DE LA MATA
              </span>

              <small className="brand-services">
                ENERGÍA SOLAR · PERFORACIONES · ELECTRICIDAD
              </small>
            </div>
          </div>

          <nav>
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#trabajos">Trabajos</a>
            <a href="#contacto">Contacto</a>

            <button
              className="admin-button"
              onClick={() => setView("admin")}
            >
              Acceso STY
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="hero" id="inicio">
          <div className="hero-overlay" />

          <div className="container hero-content">
            <div className="hero-text">
              <div className="hero-tag">
                <Sun size={18} />
                Energía • Agua • Electricidad
              </div>

              <h1>
                Soluciones que hacen
                <span> avanzar tu proyecto.</span>
              </h1>

              <p>
                Energía solar, perforaciones y soluciones eléctricas
                para el campo, la industria, comercios y hogares.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => setView("quote")}
                >
                  Solicitar presupuesto
                  <ArrowRight size={18} />
                </button>

                <a href="#servicios" className="secondary-button">
                  Ver servicios
                </a>
              </div>

              <div className="hero-location">
                <MapPin size={18} />
                Tres Arroyos y zona
              </div>
            </div>

            <div className="hero-panel">
              <div className="hero-panel-icon">
                <Sun size={34} />
              </div>

              <span>ENERGÍA SOLAR</span>

              <h2>
                Aprovechá la energía
                del sol.
              </h2>

              <p>
                Sistemas diseñados según las necesidades reales
                de cada proyecto.
              </p>

              <div className="solar-stats">
                <div>
                  <strong>Campo</strong>
                  <span>Sistemas rurales</span>
                </div>

                <div>
                  <strong>Ciudad</strong>
                  <span>Hogares y comercios</span>
                </div>
              </div>

              <button
                className="calculate-button"
                onClick={() => setView("solar")}
              >
                <Gauge size={20} />
                Calcular mi sistema
              </button>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="services" id="servicios">
          <div className="container">
            <div className="section-heading">
              <span>NUESTROS SERVICIOS</span>
              <h2>Una solución para cada necesidad</h2>
              <p>
                Evaluamos cada proyecto para encontrar una solución
                eficiente, práctica y adaptada a cada cliente.
              </p>
            </div>

            <div className="services-grid">
              <article className="service-card featured">
                <div className="service-icon">
                  <Sun />
                </div>

                <span className="service-number">01</span>

                <h3>Energía Solar</h3>

                <p>
                  Sistemas fotovoltaicos para campo, ciudad,
                  comercios e instalaciones productivas.
                </p>

                <ul>
                  <li>Generación solar</li>
                  <li>Bombeo solar</li>
                  <li>Sistemas conectados a red</li>
                  <li>Soluciones autónomas</li>
                </ul>

                <button>
                  Calcular sistema
                  <ArrowRight size={18} />
                </button>
              </article>

              <article className="service-card">
                <div className="service-icon">
                  <Droplets />
                </div>

                <span className="service-number">02</span>

                <h3>Perforaciones y Agua</h3>

                <p>
                  Soluciones para abastecimiento y manejo de agua
                  en establecimientos rurales y otros proyectos.
                </p>

                <ul>
                  <li>Perforaciones</li>
                  <li>Bombas</li>
                  <li>Molinos</li>
                  <li>Mantenimiento de aguadas</li>
                </ul>

                <button>
                  Consultar
                  <ArrowRight size={18} />
                </button>
              </article>

              <article className="service-card">
                <div className="service-icon">
                  <Zap />
                </div>

                <span className="service-number">03</span>

                <h3>Electricidad</h3>

                <p>
                  Soluciones eléctricas integrales adaptadas
                  a cada tipo de instalación.
                </p>

                <ul>
                  <li>Instalaciones eléctricas</li>
                  <li>Campo e industria</li>
                  <li>Mantenimiento</li>
                  <li>Proyectos especiales</li>
                </ul>

                <button>
                  Consultar
                  <ArrowRight size={18} />
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* BLOQUE SOLAR */}
        <section className="solar-section">
          <div className="container solar-layout">
            <div>
              <span className="eyebrow">ENERGÍA SOLAR</span>

              <h2>
                ¿Cuánta energía solar
                necesitás realmente?
              </h2>

              <p>
                Nuestro simulador permite realizar una primera
                estimación de acuerdo con tu consumo y el tipo
                de proyecto.
              </p>

              <div className="benefits">
                <div>
                  <ShieldCheck />
                  <span>
                    <strong>Evaluación inicial</strong>
                    Según tus necesidades.
                  </span>
                </div>

                <div>
                  <Gauge />
                  <span>
                    <strong>Estimación del sistema</strong>
                    Potencia y cantidad aproximada de paneles.
                  </span>
                </div>

                <div>
                  <Sun />
                  <span>
                    <strong>Atención personalizada</strong>
                    STY revisa cada solicitud.
                  </span>
                </div>
              </div>
            </div>

            <div className="calculator-card">
              <span>SIMULADOR SOLAR</span>

              <h3>Empezá tu proyecto</h3>

              <p>
                Respondé unas preguntas y recibí una primera
                orientación para tu instalación.
              </p>

              <div className="calculator-options">
                <button>🏠 Vivienda</button>
                <button>🏪 Comercio</button>
                <button>🌾 Campo</button>
                <button>🏭 Industria</button>
              </div>

              <button
                className="primary-button full"
                onClick={() => setView("solar")}
              >
                Comenzar simulación
                <ArrowRight size={20} />
              </button>

              <small>
                La estimación es orientativa y deberá ser validada
                técnicamente por STY.
              </small>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="contact-section" id="contacto">
          <div className="container contact-content">
            <div>
              <span>HABLEMOS DE TU PROYECTO</span>
              <h2>¿Necesitás una solución?</h2>
              <p>
                Contanos qué necesitás y STY evaluará la mejor
                alternativa para tu proyecto.
              </p>
            </div>

            <button className="whatsapp-button">
              <Phone size={21} />
              Solicitar presupuesto
            </button>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-content">
          <div>
            <strong className="footer-sty">STY</strong>
            <span>ENERGÍA SOLAR · PERFORACIONES · ELECTRICIDAD</span>
          </div>

          <p>Tres Arroyos • Buenos Aires</p>
        </div>
      </footer>
    </div>
  );
}

export default App;