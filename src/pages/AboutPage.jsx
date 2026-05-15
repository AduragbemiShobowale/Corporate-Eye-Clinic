import { Link } from "react-router-dom";
import { team, stats } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <span className="about-hero__eyebrow">
          <span className="about-hero__pulse" /> Est. 2001 · Ibadan, Nigeria
        </span>
        <h1>About Us</h1>
        <p>Affordable, high-quality eye care for Ibadan since 2001.</p>
      </div>

      <MissionSection />
      <FunStatsSection />
      <TeamSection />
      <LocationsSection />
      <CtaSection />
    </>
  );
}

/* ─── Mission ───────────────────────────────────────────────── */
function MissionSection() {
  const leftRef = useScrollReveal({ threshold: 0.1 });
  const rightRef = useScrollReveal({ threshold: 0.1 });
  return (
    <section className="section about-mission-section">
      <div className="about-deco about-deco--1" aria-hidden="true">
        <GlassesSVG />
      </div>
      <div className="about-deco about-deco--2" aria-hidden="true">
        <BigEyeSVG />
      </div>
      <div className="container about-mission__grid">
        <div className="reveal reveal--left" ref={leftRef}>
          <span className="section-label">Our mission</span>
          <h2 className="section-title">
            Eye care that serves the whole community
          </h2>
          <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
            Corporate Eye Clinic was established in 2001 with a clear purpose:
            to provide affordable, high-quality general eye care services to the
            society. We are active participants in ensuring the ocular
            well-being of our host community and its environs.
          </p>
          <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
            We are conveniently located in Bodija, Ibadan, with additional
            branches at Cocoa House Heritage Mall and Oluyole Estate — making
            quality eye care accessible wherever you are in the city.
          </p>
          <p className="section-subtitle">
            Our reputation is our biggest asset. We only employ the finest
            consultants and highly qualified staff, and we are committed to
            ensuring that every patient enjoys the highest standard of care at a
            price they can afford.
          </p>
        </div>
        <div className="about-mission__values stagger-children" ref={rightRef}>
          {[
            {
              title: "Affordability",
              emoji: "💚",
              desc: "High-quality products and services at prices every family in Ibadan can access.",
            },
            {
              title: "Excellence",
              emoji: "🏆",
              desc: "We invest in computerised technology and ongoing training to deliver the best outcomes.",
            },
            {
              title: "Community",
              emoji: "🤝",
              desc: "We run school screenings and community outreach to ensure no one is left without care.",
            },
            {
              title: "Professionalism",
              emoji: "⚕️",
              desc: "Our staff are vaccinated, qualified, and committed to the highest clinical standards.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="card card--hover about-mission__value-card"
            >
              <span className="about-mission__value-emoji">{v.emoji}</span>
              <h3 className="about-mission__value-title">{v.title}</h3>
              <p className="about-mission__value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Fun Stats ─────────────────────────────────────────────── */
function FunStatsSection() {
  const ref = useScrollReveal({ threshold: 0.1 });
  return (
    <section className="about-fun-stats">
      <div className="about-fun-stats__bg" aria-hidden="true" />
      <div
        className="about-fun-stats__bounce about-fun-stats__bounce--1"
        aria-hidden="true"
      >
        <PlusSVG />
      </div>
      <div
        className="about-fun-stats__bounce about-fun-stats__bounce--2"
        aria-hidden="true"
      >
        <StarSVG />
      </div>
      <div
        className="about-fun-stats__bounce about-fun-stats__bounce--3"
        aria-hidden="true"
      >
        <HeartEyeSVG />
      </div>
      <div
        className="container about-fun-stats__inner stagger-children"
        ref={ref}
      >
        {[
          {
            value: "2001",
            label: "Year established",
            color: "#9FE1CB",
          },
          {
            value: "3",
            label: "Clinic locations",
            color: "#C9A84C",
          },
          {
            value: "20+",
            label: "Years of care",
            color: "#9FE1CB",
          },
          {
            value: "5★",
            label: "Patient rated",
            color: "#C9A84C",
          },
        ].map((s) => (
          <div key={s.label} className="about-fun-stat">
            <span className="about-fun-stat__emoji">{s.emoji}</span>
            <span className="about-fun-stat__value" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="about-fun-stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Team ──────────────────────────────────────────────────── */
function TeamSection() {
  const ref = useScrollReveal({ threshold: 0.1 });
  return (
    <section className="section section--alt about-team-section">
      <div className="about-deco about-deco--3" aria-hidden="true">
        <HeartEyeSVG />
      </div>
      <div className="container" ref={ref}>
        <span className="section-label">Our team</span>
        <h2 className="section-title">Meet the doctor</h2>
        <div className="about-team__grid">
          {team.map((member) => (
            <div key={member.name} className="card about-team__card">
              <div className="about-team__avatar-wrap">
                <div className="about-team__avatar" aria-hidden="true">
                  {member.initials}
                </div>
                <div className="about-team__avatar-ring" aria-hidden="true" />
                <span className="about-team__avatar-badge">👨‍⚕️</span>
              </div>
              <div className="about-team__info">
                <h3 className="about-team__name">{member.name}</h3>
                <p className="about-team__role">{member.role}</p>
                <p className="about-team__bio">{member.bio}</p>
                <div className="about-team__specialties">
                  {member.specialties.map((sp) => (
                    <span key={sp} className="badge badge--teal">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Locations ─────────────────────────────────────────────── */
function LocationsSection() {
  const ref = useScrollReveal({ threshold: 0.05 });
  const locations = [
    {
      name: "Old Bodija (Main Branch)",
      address: "33 Osuntokun Avenue, Old Bodija, Ibadan",
      note: "Our flagship clinic with the full range of services",
      emoji: "🏠",
    },
    {
      name: "Cocoa House Heritage Mall",
      address: "Cocoa House Heritage Mall, Ibadan",
      note: "Conveniently located in the heart of the city",
      emoji: "🏢",
    },
    {
      name: "Oluyole Estate",
      address: "LA Goshen, Opp. Bovas Station, Oluyole Estate, Ibadan",
      note: "Serving the Oluyole and Ring Road corridor",
      emoji: "📍",
    },
  ];
  return (
    <section className="section about-locations-section">
      <div className="about-deco about-deco--4" aria-hidden="true">
        <GlassesSVG />
      </div>
      <div className="about-deco about-deco--5" aria-hidden="true">
        <StarSVG />
      </div>
      <div className="container">
        <span className="section-label">Find us</span>
        <h2 className="section-title">Our locations in Ibadan</h2>
        <p className="section-subtitle" style={{ marginBottom: "2.5rem" }}>
          Three branches across the city — always within reach.
        </p>
        <div className="about-locations__grid stagger-children" ref={ref}>
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="card card--hover about-location__card"
            >
              <div className="about-location__emoji">{loc.emoji}</div>
              <h3 className="about-location__name">{loc.name}</h3>
              <p className="about-location__address">{loc.address}</p>
              <p className="about-location__note">{loc.note}</p>
              <a
                href={
                  "https://maps.google.com/?q=" +
                  encodeURIComponent(loc.address)
                }
                target="_blank"
                rel="noreferrer"
                className="btn btn--outline"
                style={{ marginTop: "1rem", fontSize: "0.8rem" }}
              >
                Get directions
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="section about-cta">
      <div className="about-cta__bg" aria-hidden="true">
        <div className="about-cta__blob about-cta__blob--1" />
        <div className="about-cta__blob about-cta__blob--2" />
      </div>
      <div
        className="about-cta__bounce about-cta__bounce--1"
        aria-hidden="true"
      >
        <BigEyeSVG />
      </div>
      <div
        className="about-cta__bounce about-cta__bounce--2"
        aria-hidden="true"
      >
        <HeartEyeSVG />
      </div>
      <div
        className="about-cta__bounce about-cta__bounce--3"
        aria-hidden="true"
      >
        <StarSVG />
      </div>
      <div
        className="container"
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <span className="about-cta__tag">👁️ Your vision matters</span>
        <h2
          className="section-title section-title--white"
          style={{ marginBottom: "1rem" }}
        >
          Ready to see the difference?
        </h2>
        <p
          className="section-subtitle section-subtitle--white"
          style={{ marginBottom: "2rem", marginInline: "auto" }}
        >
          Book your comprehensive eye exam today and take the first step towards
          better vision.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/contact" className="btn btn--white btn--lg">
            Book an appointment
          </Link>
          <a
            href="https://wa.me/2348033372738"
            target="_blank"
            rel="noreferrer"
            className="btn btn--outline-white btn--lg"
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── SVG Icons ─────────────────────────────────────────────── */
function BigEyeSVG() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse
        cx="30"
        cy="30"
        rx="28"
        ry="16"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="30"
        cy="30"
        r="10"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="30" cy="30" r="5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="26" cy="27" r="2.5" fill="white" fillOpacity="0.8" />
    </svg>
  );
}

function GlassesSVG() {
  return (
    <svg viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="2"
        y="6"
        width="28"
        height="20"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <rect
        x="50"
        y="6"
        width="28"
        height="20"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <line
        x1="30"
        y1="16"
        x2="50"
        y2="16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="0"
        y1="10"
        x2="2"
        y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="10"
        x2="78"
        y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartEyeSVG() {
  return (
    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="25"
        cy="25"
        r="22"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M25 34s-10-6-10-13a6 6 0 0 1 10-4.5A6 6 0 0 1 35 21c0 7-10 13-10 13z"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  );
}

function StarSVG() {
  return (
    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25 5l5.5 11 12 1.7-8.7 8.5 2 12-10.8-5.7L14.2 38l2-12L7.5 17.7l12-1.7z"
        fill="currentColor"
        fillOpacity="0.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusSVG() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="20"
        y1="4"
        x2="20"
        y2="36"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="20"
        x2="36"
        y2="20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
