import { useState } from "react";
import { services } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import BookingModal from "../components/ui/BookingModal";
import "./ServicesPage.css";

const PHOTOS = {
  "eye-exam":
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
  glaucoma:
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80",
  contacts:
    "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=700&q=80",
  "low-vision":
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=700&q=80",
  pediatric:
    "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=700&q=80",
  industrial:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80",
};

export default function ServicesPage() {
  const [showModal, setShowModal] = useState(false);
  const gridRef = useScrollReveal({ threshold: 0.05 });
  const techRef = useScrollReveal();

  return (
    <>
      <div className="page-hero">
        <h1>Our Services</h1>
        <p>
          Comprehensive eye care for every member of your family, at every stage
          of life.
        </p>
      </div>

      {/* Quick nav pills */}
      <section className="section" style={{ paddingBlock: "var(--space-6)" }}>
        <div className="container">
          <div className="svc-pills">
            {services.map((s) => (
              <a key={s.id} href={"#" + s.id} className="svc-pill">
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Photo grid — with floating glasses deco */}
      <section
        className="section section--alt svc-deco-section"
        style={{ paddingTop: 0 }}
      >
        <div className="svc-deco svc-deco--glasses-1" aria-hidden="true">
          <GlassesFrameSVG color="#0F6E56" opacity="0.08" />
        </div>
        <div className="svc-deco svc-deco--glasses-2" aria-hidden="true">
          <SunglassesSVG color="#0F6E56" opacity="0.06" />
        </div>
        <div className="svc-deco svc-deco--ring-1" aria-hidden="true">
          <EyeRingSVG color="#0F6E56" opacity="0.06" />
        </div>
        <div className="container">
          <div className="svc-photo-grid stagger-children" ref={gridRef}>
            {services.map((s) => (
              <a key={s.id} href={"#" + s.id} className="svc-photo-card">
                <img
                  src={PHOTOS[s.id] || PHOTOS["eye-exam"]}
                  alt={s.title}
                  className="svc-photo-card__img"
                  loading="lazy"
                />
                <div className="svc-photo-card__overlay" />
                <div className="svc-photo-card__body">
                  <h3 className="svc-photo-card__title">{s.title}</h3>
                  <span className="svc-photo-card__cta">Read more</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Tech feature — with floating contact lens deco */}
      <section className="section svc-deco-section">
        <div className="svc-deco svc-deco--contact-1" aria-hidden="true">
          <ContactLensSVG color="#0F6E56" opacity="0.07" />
        </div>
        <div className="svc-deco svc-deco--glasses-3" aria-hidden="true">
          <GlassesRoundSVG color="#0F6E56" opacity="0.06" />
        </div>
        <div className="container svc-tech-grid reveal" ref={techRef}>
          <div className="svc-tech-text">
            <span className="section-label">Eye Diagnosis</span>
            <h2 className="section-title">
              Cutting-edge diagnostic equipment and technology
            </h2>
            <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
              Our optometrists perform routine eye exams designed to give you an
              insight into your overall vision. Ensure your vision prescription
              is up-to-date and identify concerns before they become problematic
              with routine, annual eye exams.
            </p>
            <button
              className="btn btn--primary btn--lg"
              onClick={() => setShowModal(true)}
            >
              Book an eye exam
            </button>
          </div>
          <div className="svc-tech-stack">
            {services.slice(0, 4).map((s) => (
              <a key={s.id} href={"#" + s.id} className="svc-tech-card">
                <img
                  src={PHOTOS[s.id] || PHOTOS["eye-exam"]}
                  alt={s.title}
                  className="svc-tech-card__img"
                  loading="lazy"
                />
                <div className="svc-tech-card__overlay" />
                <div className="svc-tech-card__body">
                  <h3 className="svc-tech-card__title">{s.title}</h3>
                  <span className="svc-tech-card__cta">Read more</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Individual service detail sections */}
      {services.map((s, i) => (
        <ServiceDetail
          key={s.id}
          s={s}
          i={i}
          photo={PHOTOS[s.id] || PHOTOS["eye-exam"]}
          onBook={() => setShowModal(true)}
        />
      ))}

      {/* Emergency CTA */}
      <section className="section section--teal">
        <div className="container" style={{ textAlign: "center" }}>
          <span className="section-label section-label--white">
            Emergency care
          </span>
          <h2
            className="section-title section-title--white"
            style={{ marginBottom: "1rem" }}
          >
            Eye emergency? We are available 7 days a week.
          </h2>
          <p
            className="section-subtitle section-subtitle--white"
            style={{ marginBottom: "2rem", marginInline: "auto" }}
          >
            Don't wait — call us immediately for any sudden vision changes, eye
            injuries, or pain.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a href="tel:+2348033372738" className="btn btn--white btn--lg">
              Call now
            </a>
            <a
              href="https://wa.me/2348033372738"
              className="btn btn--outline-white btn--lg"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {showModal && <BookingModal onClose={() => setShowModal(false)} />}
    </>
  );
}

/* ─── ServiceDetail ─────────────────────────────────────────── */
function ServiceDetail({ s, i, photo, onBook }) {
  const photoRef = useScrollReveal({ threshold: 0.1 });
  const textRef = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id={s.id}
      className={
        "section svc-detail svc-deco-section" +
        (i % 2 !== 0 ? " section--alt" : "")
      }
    >
      {/* Alternating decorative elements per section */}
      {i % 3 === 0 && (
        <div className="svc-deco svc-deco--glasses-alt-1" aria-hidden="true">
          <GlassesFrameSVG
            color={i % 2 !== 0 ? "#0F6E56" : "#0F6E56"}
            opacity="0.06"
          />
        </div>
      )}
      {i % 3 === 1 && (
        <div className="svc-deco svc-deco--contact-alt-1" aria-hidden="true">
          <ContactLensSVG color="#0F6E56" opacity="0.07" />
        </div>
      )}
      {i % 3 === 2 && (
        <div className="svc-deco svc-deco--ring-alt-1" aria-hidden="true">
          <EyeRingSVG color="#0F6E56" opacity="0.06" />
        </div>
      )}

      {i % 2 === 0 && <div className="svc-detail__deco" aria-hidden="true" />}
      <div className="container svc-detail__grid">
        <div className="svc-detail__photo reveal reveal--left" ref={photoRef}>
          <img src={photo} alt={s.title} />
          <div className="svc-detail__photo-badge">
            <span>{s.title}</span>
          </div>
          <div className="svc-detail__photo-ring" aria-hidden="true" />
        </div>
        <div className="svc-detail__text reveal reveal--right" ref={textRef}>
          <span className="section-label">Our service</span>
          <h2 className="section-title">{s.title}</h2>
          <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
            {s.description}
          </p>
          <div className="svc-detail__symptoms">
            <h4 className="svc-detail__symptoms-title">Signs and symptoms</h4>
            <ul className="svc-detail__symptoms-list">
              {s.symptoms.map((sym) => (
                <li key={sym} className="svc-detail__symptom">
                  <CheckIcon /> {sym}
                </li>
              ))}
            </ul>
          </div>
          <div className="svc-detail__actions">
            <button className="btn btn--primary" onClick={onBook}>
              Book an appointment
            </button>
            <a href="tel:+2348033372738" className="btn btn--outline">
              Call us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Decorative SVGs ───────────────────────────────────────── */
function GlassesFrameSVG({ color = "#0F6E56", opacity = 0.08 }) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <rect
        x="10"
        y="20"
        width="70"
        height="42"
        rx="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <rect
        x="120"
        y="20"
        width="70"
        height="42"
        rx="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <line
        x1="80"
        y1="41"
        x2="120"
        y2="41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="28"
        x2="10"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="190"
        y1="28"
        x2="198"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunglassesSVG({ color = "#0F6E56", opacity = 0.06 }) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <rect
        x="10"
        y="20"
        width="70"
        height="42"
        rx="21"
        stroke={color}
        strokeWidth="4"
        fill={color}
        fillOpacity="0.12"
      />
      <rect
        x="120"
        y="20"
        width="70"
        height="42"
        rx="21"
        stroke={color}
        strokeWidth="4"
        fill={color}
        fillOpacity="0.12"
      />
      <line
        x1="80"
        y1="41"
        x2="120"
        y2="41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="28"
        x2="10"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="190"
        y1="28"
        x2="198"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlassesRoundSVG({ color = "#0F6E56", opacity = 0.06 }) {
  return (
    <svg
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <circle
        cx="55"
        cy="41"
        r="30"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="145"
        cy="41"
        r="30"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <line
        x1="85"
        y1="41"
        x2="115"
        y2="41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="28"
        x2="25"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="198"
        y1="28"
        x2="175"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContactLensSVG({ color = "#0F6E56", opacity = 0.07 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="6 4"
        fill="none"
      />
      <circle cx="50" cy="50" r="12" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

function EyeRingSVG({ color = "#0F6E56", opacity = 0.06 }) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <ellipse
        cx="100"
        cy="60"
        rx="96"
        ry="54"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 60 C40 10 160 10 192 60 C160 110 40 110 8 60Z"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="100"
        cy="60"
        r="22"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <circle cx="100" cy="60" r="10" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

const CheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
