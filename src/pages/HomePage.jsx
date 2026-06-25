import { useState } from "react";
import { Link } from "react-router-dom";
import { services, testimonials, faqs, conditions } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import BeforeAfterSlider from "../components/ui/BeforeAfterSlider";
import BookingModal from "../components/ui/BookingModal";
import "./HomePage.css";

const PHOTOS = {
  "eye-exam":
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
  glaucoma:
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
  contacts:
    "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=600&q=80",
  "low-vision":
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=600&q=80",
  pediatric:
    "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&q=80",
  industrial:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
};

const VISION_IMG =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=90";

const EYE_CONDITIONS = [
  {
    id: "myopia",
    label: "Myopia",
    subtitle: "Nearsightedness",
    description:
      "Distant objects appear blurry while close objects remain clear. One of the most common refractive errors, easily corrected with glasses or contact lenses.",
    filterStyle: { filter: "blur(5px)", transform: "scale(1.05)" },
  },
  {
    id: "cataracts",
    label: "Cataracts",
    subtitle: "Cloudy lens",
    description:
      "The lens of the eye becomes progressively cloudy, causing hazy, yellowed, and glare-affected vision. Common in older adults and treatable with surgery.",
    filterStyle: {
      filter: "blur(2px) brightness(1.4) contrast(0.6) sepia(0.5)",
      transform: "scale(1.02)",
    },
  },
  {
    id: "glaucoma",
    label: "Glaucoma",
    subtitle: "Tunnel vision",
    description:
      "Increased eye pressure damages the optic nerve, progressively narrowing the visual field. Often symptomless until advanced — regular screening is critical.",
    filterStyle: {},
    overlayClass: "ba-overlay--glaucoma",
  },
  {
    id: "astigmatism",
    label: "Astigmatism",
    subtitle: "Distorted vision",
    description:
      "An irregularly shaped cornea causes light to focus unevenly, resulting in blurred or streaky vision at all distances. Correctable with glasses or contact lenses.",
    filterStyle: { filter: "blur(2px)", transform: "scale(1.02) skewX(1deg)" },
  },
  {
    id: "macular",
    label: "Macular Degeneration",
    subtitle: "Central vision loss",
    description:
      "Deterioration of the macula causes a dark or distorted blind spot in the centre of vision. Central tasks like reading and recognising faces become difficult.",
    filterStyle: {},
    overlayClass: "ba-overlay--macular",
  },
  {
    id: "diabetic",
    label: "Diabetic Retinopathy",
    subtitle: "Patchy dark spots",
    description:
      "Damage to retinal blood vessels from diabetes causes dark floating spots, blurring, and eventual vision loss. Annual diabetic eye screening is essential.",
    filterStyle: { filter: "blur(1px) contrast(0.8)" },
    overlayClass: "ba-overlay--diabetic",
  },
];

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <HeroSection onBook={() => setShowModal(true)} />
      <TrustBar />
      <WelcomeSection onBook={() => setShowModal(true)} />
      <VisionSliderSection onBook={() => setShowModal(true)} />
      <ServicesSection />
      <ConditionsSection onBook={() => setShowModal(true)} />
      <TestimonialsSection />
      <FaqSection />
      <ShopCta />
      {showModal && <BookingModal onClose={() => setShowModal(false)} />}
    </>
  );
}

/* ─── Hero ─────────────────────────────────────────────────── */
function HeroSection({ onBook }) {
  return (
    <section className="hero">
      {/* Background photo */}
      <div className="hero__photo-bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&q=85"
          alt=""
        />
      </div>
      <div className="hero__photo-overlay" aria-hidden="true" />
      <div className="hero__gradient" aria-hidden="true" />

      {/* ── Gold aurora sweep ── */}
      <div className="hero__aurora" aria-hidden="true" />
      <div className="hero__aurora-2" aria-hidden="true" />

      {/* ── Light beams ── */}
      <div className="hero__beam hero__beam--1" aria-hidden="true" />
      <div className="hero__beam hero__beam--2" aria-hidden="true" />
      <div className="hero__beam hero__beam--3" aria-hidden="true" />

      {/* ── Floating gold particles ── */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`hero__particle hero__particle--${i + 1}`}
          aria-hidden="true"
        />
      ))}

      {/* ── Decorative rings ── */}
      <div className="hero__ring hero__ring--1" aria-hidden="true" />
      <div className="hero__ring hero__ring--2" aria-hidden="true" />
      <div className="hero__ring hero__ring--3" aria-hidden="true" />

      {/* ── Ambient orbs ── */}
      <div className="hero__orb hero__orb--1" aria-hidden="true" />
      <div className="hero__orb hero__orb--2" aria-hidden="true" />
      <div className="hero__orb hero__orb--3" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__content">
          {/* Logo */}
          <div className="hero__logo-wrap" aria-hidden="true">
            <div className="hero__logo-ring" />
            <div className="hero__logo-glow" />
            <img
              src="https://res.cloudinary.com/dgde8cwjk/image/upload/v1780805731/96AB81CC-BE2F-4C97-B0DB-BDEF573A840D_s6y2fd.png"
              alt="Corporate Eye Clinic"
              className="hero__logo"
            />
          </div>

          <h1 className="hero__clinic-name">Corporate Eye Clinic</h1>

          <p className="hero__motto">
            Caring for your vision, one patient at a time.
          </p>

          <div className="hero__divider" aria-hidden="true" />

          <div className="hero__badges">
            <span className="hero__badge-pill">🏥 3 Branches · Ibadan</span>
            <span className="hero__badge-pill">👁 Expert Optometry</span>
            <span className="hero__badge-pill">✦ Serving since 2001</span>
          </div>

          <div className="hero__btns">
            <button
              className="btn btn--white btn--lg hero__btn-primary"
              onClick={onBook}
            >
              Book an eye exam <ArrowRight />
            </button>
            <Link to="/services" className="btn btn--outline-white btn--lg">
              Our services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Bar ─────────────────────────────────────────────── */
function TrustBar() {
  const ref = useScrollReveal();
  return (
    <div className="trust-bar reveal" ref={ref}>
      <div className="container trust-bar__inner">
        {[
          { icon: <ComputerIcon />, text: "Computerised eye exams" },
          { icon: <ShieldIcon2 />, text: "Glaucoma screening" },
          { icon: <ContactIcon />, text: "All contact lens types" },
          { icon: <SchoolIcon />, text: "School vision screening" },
          { icon: <CorporateIcon />, text: "Corporate & industrial" },
        ].map((item) => (
          <div key={item.text} className="trust-bar__item">
            <span className="trust-bar__icon">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Welcome ────────────────────────────────────────────────── */
function WelcomeSection({ onBook }) {
  const textRef = useScrollReveal({ threshold: 0.1 });
  const imgRef = useScrollReveal({ threshold: 0.1 });
  return (
    <section className="section section--alt">
      <div className="container welcome__grid">
        <div className="reveal reveal--left" ref={textRef}>
          <span className="section-label">Welcome</span>
          <h2 className="section-title">Ibadan's trusted eye care clinic</h2>
          <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
            Our goal is to provide affordable, high-quality general eye care
            services to the society. We are active participants in ensuring the
            ocular well-being of our host community and its environs.
          </p>
          <p className="section-subtitle">
            With branches in Bodija, Cocoa House, and Oluyole Estate, expert eye
            care is never far away — for every member of your family.
          </p>
          <div className="welcome__actions">
            <button className="btn btn--primary" onClick={onBook}>
              Book appointment
            </button>
            <Link to="/about" className="btn btn--outline">
              Our story →
            </Link>
          </div>
        </div>
        <div className="welcome__photo-grid reveal reveal--right" ref={imgRef}>
          <div className="welcome__photo welcome__photo--tall">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80"
              alt="Eye care consultation"
            />
          </div>
          <div className="welcome__photo-col">
            <div className="welcome__photo">
              <img
                src="https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400&q=80"
                alt="Eye examination"
              />
            </div>
            <div className="welcome__photo welcome__photo--badge">
              <img
                src="https://res.cloudinary.com/dgde8cwjk/image/upload/v1780425302/download_ekzxzu.jpg"
                alt="Optometry equipment"
              />
              <div className="welcome__photo-label">
                <span>20+</span> years of trusted care
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Vision Slider ──────────────────────────────────────────── */
function VisionSliderSection({ onBook }) {
  const [active, setActive] = useState(0);
  const ref = useScrollReveal({ threshold: 0.1 });
  const condition = EYE_CONDITIONS[active];
  return (
    <section className="section vision-section">
      <div className="container">
        <div className="vision-head reveal" ref={ref}>
          <span className="section-label">See the difference</span>
          <h2 className="section-title">
            How eye conditions affect your vision
          </h2>
          <p className="section-subtitle">
            Drag the slider to experience how each condition distorts sight.
            Early detection and treatment can preserve your vision.
          </p>
        </div>
        <div className="vision-tabs">
          {EYE_CONDITIONS.map((c, i) => (
            <button
              key={c.id}
              className={`vision-tab${active === i ? " vision-tab--active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="vision-tab__label">{c.label}</span>
              <span className="vision-tab__sub">{c.subtitle}</span>
            </button>
          ))}
        </div>
        <div className="vision-slider-wrap">
          <div className="vision-slider-container">
            <BeforeAfterSlider
              key={condition.id}
              beforeSrc={VISION_IMG}
              afterSrc={VISION_IMG}
              beforeLabel="Normal vision"
              afterLabel={condition.label}
              filterStyle={condition.filterStyle}
              filterClass={condition.overlayClass || ""}
            />
          </div>
          <div className="vision-info">
            <div className="vision-info__badge">{condition.label}</div>
            <p className="vision-info__desc">{condition.description}</p>
            <button className="btn btn--primary" onClick={onBook}>
              Get screened today →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Services ───────────────────────────────────────────────── */
function ServicesSection() {
  const headRef = useScrollReveal();
  const gridRef = useScrollReveal({ threshold: 0.05 });
  return (
    <section className="section section--alt">
      <div className="container">
        <div className="services__head reveal" ref={headRef}>
          <span className="section-label">What we offer</span>
          <h2 className="section-title">Our services</h2>
          <p className="section-subtitle">
            From routine eye exams to specialist care — the full spectrum of
            optometric services for individuals and organisations.
          </p>
        </div>
        <div className="svc-grid stagger-children" ref={gridRef}>
          {services.map((s) => (
            <Link key={s.id} to={`/services#${s.id}`} className="svc-card">
              <img
                src={PHOTOS[s.id] || PHOTOS["eye-exam"]}
                alt={s.title}
                className="svc-card__img"
                loading="lazy"
              />
              <div className="svc-card__overlay" />
              <div className="svc-card__body">
                <h3 className="svc-card__title">{s.title}</h3>
                <span className="svc-card__link">
                  Read more <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Conditions ─────────────────────────────────────────────── */
function ConditionsSection({ onBook }) {
  const leftRef = useScrollReveal();
  const rightRef = useScrollReveal();
  return (
    <section className="section section--alt">
      <div className="container conditions__grid">
        <div className="reveal reveal--left" ref={leftRef}>
          <span className="section-label">What we treat</span>
          <h2 className="section-title">
            Comprehensive care for all eye conditions
          </h2>
          <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
            Our team is experienced across the full range of ocular health needs
            — from routine vision correction to complex eye disease management.
          </p>
          <ul className="conditions__list">
            {conditions.map((c) => (
              <li key={c} className="conditions__item">
                <span className="conditions__check">
                  <CheckIcon />
                </span>{" "}
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="conditions__aside reveal reveal--right" ref={rightRef}>
          <div className="conditions__aside-photo">
            <img
              src="https://res.cloudinary.com/dgde8cwjk/image/upload/v1780423158/1000_F_547386801_cirwq1I4QUZHPdoMTbgSky83Cy3YtqVq_iwbhal.jpg"
              alt="School eye health programme"
            />
          </div>
          <div className="conditions__aside-content">
            <h3>School eye health programme</h3>
            <p>
              Our school vision screening programme delivers comprehensive eye
              health services to children across Ibadan. Early detection means
              no child struggles through school with uncorrected vision.
            </p>
            <button className="btn btn--white" onClick={onBook}>
              Book a school screening →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────── */
function TestimonialsSection() {
  const headRef = useScrollReveal();
  const gridRef = useScrollReveal({ threshold: 0.05 });
  return (
    <section className="section testimonials">
      <div className="testimonials__bg" aria-hidden="true" />
      <div className="container">
        <div className="reveal" ref={headRef}>
          <span className="section-label">Patient experience</span>
          <h2 className="section-title">What our patients say</h2>
          <p className="section-subtitle">
            Trusted by thousands of patients across Ibadan and the south-west.
          </p>
        </div>
        <div className="testimonials__grid stagger-children" ref={gridRef}>
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className={`card testimonials__card${i === 0 ? " testimonials__card--featured" : ""}`}
            >
              <div className="testimonials__quote" aria-hidden="true">
                "
              </div>
              <div className="testimonials__stars">{"★".repeat(t.rating)}</div>
              <p className="testimonials__text">{t.text}</p>
              <div className="testimonials__author">
                <div className="testimonials__avatar">{t.initials}</div>
                <span className="testimonials__name">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────── */
function FaqSection() {
  const ref = useScrollReveal({ threshold: 0.05 });
  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: "2.5rem" }}>
          <span className="section-label">FAQs</span>
          <h2 className="section-title">Frequently asked questions</h2>
        </div>
        <div className="faq__grid stagger-children" ref={ref}>
          {faqs.map((f, i) => (
            <div key={i} className="card faq__card">
              <h3 className="faq__q">
                <span className="faq__q-icon">
                  <QuestionIcon />
                </span>
                {f.q}
              </h3>
              <p className="faq__a">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Shop CTA ───────────────────────────────────────────────── */
function ShopCta() {
  const ref = useScrollReveal();
  return (
    <section className="shop-cta">
      <div className="shop-cta__animated-bg" aria-hidden="true">
        <div className="shop-cta__blob shop-cta__blob--1" />
        <div className="shop-cta__blob shop-cta__blob--2" />
      </div>
      <div className="container shop-cta__inner reveal" ref={ref}>
        <span className="section-label section-label--white">Eyewear shop</span>
        <h2
          className="section-title section-title--white"
          style={{ textAlign: "center" }}
        >
          Designer eyewear at affordable prices
        </h2>
        <p
          className="section-subtitle section-subtitle--white"
          style={{
            marginBottom: "2rem",
            textAlign: "center",
            marginInline: "auto",
          }}
        >
          Stylish frames, contact lenses, blue cut lenses, photochromic lenses,
          and sunglasses — for kids and adults. 25% off your first contacts
          order.
        </p>
        <div className="shop-cta__btns">
          <Link to="/shop" className="btn btn--white btn--lg">
            Browse frames
          </Link>
          <Link to="/shop" className="btn btn--outline-white btn--lg">
            Contact lenses
          </Link>
          <Link to="/shop" className="btn btn--outline-white btn--lg">
            Sunglasses
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Eye Illustration ───────────────────────────────────────── */
function EyeIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hero__eye-svg"
      aria-hidden="true"
    >
      <ellipse
        cx="120"
        cy="95"
        rx="110"
        ry="60"
        fill="rgba(159,225,203,0.06)"
      />
      <path
        d="M10 95 C50 35 190 35 230 95 C190 155 50 155 10 95Z"
        fill="white"
      />
      <path
        d="M10 95 C50 35 190 35 230 95 C190 155 50 155 10 95Z"
        stroke="rgba(15,110,86,0.3)"
        strokeWidth="1.5"
      />
      <circle cx="120" cy="95" r="44" fill="url(#irisGrad)" />
      <circle
        cx="120"
        cy="95"
        r="44"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      {[0, 30, 60, 90, 120, 150, 210, 240, 270, 300, 330].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={120 + 20 * Math.cos(r)}
            y1={95 + 20 * Math.sin(r)}
            x2={120 + 42 * Math.cos(r)}
            y2={95 + 42 * Math.sin(r)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      <circle cx="120" cy="95" r="22" fill="#0a0a0a" className="hero__pupil" />
      <circle cx="120" cy="95" r="18" fill="url(#pupilGrad)" />
      <line
        x1="30"
        y1="95"
        x2="210"
        y2="95"
        stroke="rgba(159,225,203,0.6)"
        strokeWidth="1.5"
        className="hero__scan-line"
      />
      <ellipse
        cx="106"
        cy="82"
        rx="9"
        ry="6"
        fill="rgba(255,255,255,0.55)"
        transform="rotate(-20 106 82)"
      />
      <circle cx="130" cy="88" r="3" fill="rgba(255,255,255,0.25)" />
      {[0.15, 0.3, 0.5, 0.7, 0.85].map((t, i) => {
        const x = 10 + t * 220,
          by = 95 - Math.sqrt(Math.max(0, 3600 - (x - 120) * (x - 120)));
        return (
          <line
            key={i}
            x1={x}
            y1={by}
            x2={x - 1 + t * 2}
            y2={by - 8 - (i % 2) * 3}
            stroke="rgba(4,44,32,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      <path
        d="M10 95 C50 35 190 35 230 95 C190 155 50 155 10 95Z"
        fill="none"
        stroke="rgba(15,110,86,0.5)"
        strokeWidth="2"
      />
      <circle cx="12" cy="95" r="3" fill="var(--teal-200)" opacity="0.8" />
      <circle cx="228" cy="95" r="3" fill="var(--teal-200)" opacity="0.8" />
      <defs>
        <radialGradient id="irisGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1D9E75" />
          <stop offset="40%" stopColor="#0F6E56" />
          <stop offset="100%" stopColor="#042C20" />
        </radialGradient>
        <radialGradient id="pupilGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const ArrowRight = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ShieldIcon2 = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const LocationIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ComputerIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const ContactIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);
const SchoolIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const CorporateIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8L6 7h12z" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const QuestionIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
