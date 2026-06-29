import { useState } from "react";
import { contactInfo, hours, services } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { supabase } from "../lib/supabase";
import "./ContactPage.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    location: "",
    date: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useScrollReveal({ threshold: 0.05 });
  const sidebarRef = useScrollReveal({ threshold: 0.05 });

  const handle = (e) => {
    const { name, value } = e.target;
    // Phone: only allow digits, spaces, +, -
    if (name === "phone") {
      if (!/^[0-9\s+\-()]*$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (form.phone && form.phone.replace(/[\s+\-()]/g, "").length < 7)
      e.phone = "Enter a valid phone number";
    if (!form.service) e.service = "Please select a service";
    if (!form.message.trim())
      e.message = "Please tell us more about your needs";
    if (!form.location) e.location = "Please select a preferred location";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const serviceLabels = {
      "eye-exam": "Comprehensive Eye Examination",
      glaucoma: "Glaucoma Management",
      contacts: "Contact Lens Practice",
      "low-vision": "Low Vision Rehabilitation",
      pediatric: "Pediatric Eye Care",
      industrial: "Industrial & Pre-Employment Screening",
      general: "General eye exam",
      other: "Other / Not sure",
    };

    const locationObj = contactInfo.locations.find(
      (l) => l.name === form.location,
    );

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      service: form.service
        ? serviceLabels[form.service] || form.service
        : null,
      location: locationObj ? locationObj.short : form.location,
      preferred_date: form.date || null,
      message: form.message,
    };

    setLoading(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([payload]);
      if (error) throw error;

      // Email is best-effort — fire and forget, never block success state
      fetch(
        "https://cacniprnjuwuavhhfowu.supabase.co/functions/v1/send-contact-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY25pcHJuanV3dWF2aGhmb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDYwODEsImV4cCI6MjA5NjE4MjA4MX0.UvpRbcH8Wq70tndFNqs9ygEiUXz4lKBd4Nzc-vg3jjg",
          },
          body: JSON.stringify(payload),
        },
      ).catch((err) =>
        console.error("Contact email failed (non-blocking):", err),
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setErrors({
        submit: "Something went wrong. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <div className="contact-hero">
        {/* Photo background */}
        <div className="contact-hero__photo-bg" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&q=85"
            alt=""
          />
        </div>
        <div className="contact-hero__photo-overlay" aria-hidden="true" />
        <div className="contact-hero__grid" aria-hidden="true" />

        <div className="container contact-hero__inner">
          <span className="contact-hero__eyebrow">
            <span className="contact-hero__pulse" /> We'd love to hear from you
          </span>
          <h1 className="contact-hero__title">Contact Us</h1>
          <p className="contact-hero__subtitle">
            Book an appointment or get in touch — our team is ready to help with
            all your eye care needs.
          </p>
          <div className="contact-hero__pills">
            <a
              href={"tel:" + contactInfo.phone.replace(/\s/g, "")}
              className="contact-hero__pill"
            >
              <PhoneIcon /> {contactInfo.phone}
            </a>
            <a
              href={contactInfo.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="contact-hero__pill contact-hero__pill--wa"
            >
              <WaIcon /> WhatsApp us
            </a>
            <a
              href={"mailto:" + contactInfo.email}
              className="contact-hero__pill"
            >
              <MailIcon /> {contactInfo.email}
            </a>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="section contact-section">
        {/* Animated background scenes */}
        <div className="contact-scene" aria-hidden="true">
          {/* Road strip */}
          <div className="contact-scene__road">
            <div className="contact-scene__road-line" />
            <div className="contact-scene__road-line contact-scene__road-line--2" />
          </div>
          {/* Moving car */}
          <div className="contact-scene__car">
            <CarSVG />
          </div>
          {/* Walking person */}
          <div className="contact-scene__walker">
            <WalkerSVG />
          </div>
          {/* Phone caller */}
          <div className="contact-scene__caller">
            <CallerSVG />
          </div>
          {/* Second caller on right */}
          <div className="contact-scene__caller2">
            <CallerSVG />
          </div>
        </div>

        <div className="container contact__grid">
          {/* ── Form ── */}
          <div className="contact__form-wrap reveal reveal--left" ref={formRef}>
            <div className="contact__form-header">
              <span className="section-label">Appointment</span>
              <h2 className="contact__form-title">Book an appointment</h2>
              <p className="contact__form-sub">
                Fill in the form and we'll confirm your appointment within 24
                hours.
              </p>
            </div>

            {submitted ? (
              <div className="contact__success">
                <div className="contact__success-icon">
                  <CheckCircleIcon />
                </div>
                <h3>Message received! 🎉</h3>
                <p>
                  Thank you, <strong>{form.name}</strong>. The clinic has been
                  notified and will get back to you on{" "}
                  <strong>{form.email}</strong> shortly.
                </p>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      service: "",
                      location: "",
                      date: "",
                      message: "",
                    });
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={submit} noValidate>
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label htmlFor="name">Full name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handle}
                      placeholder="Your full name"
                      aria-invalid={!!errors.name}
                      className={errors.name ? "input--error" : ""}
                    />
                    {errors.name && (
                      <span className="field-error">{errors.name}</span>
                    )}
                  </div>
                  <div className="contact__field">
                    <label htmlFor="email">Email address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handle}
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      className={errors.email ? "input--error" : ""}
                    />
                    {errors.email && (
                      <span className="field-error">{errors.email}</span>
                    )}
                  </div>
                </div>
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handle}
                      placeholder="+234 ..."
                      inputMode="numeric"
                      aria-invalid={!!errors.phone}
                      className={errors.phone ? "input--error" : ""}
                    />
                    {errors.phone && (
                      <span className="field-error">{errors.phone}</span>
                    )}
                  </div>
                  <div className="contact__field">
                    <label htmlFor="date">Preferred date</label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handle}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="contact__field">
                  <label htmlFor="service">Service needed *</label>
                  <div
                    className={`contact__select-wrap${errors.service ? " input--error" : ""}`}
                  >
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handle}
                      aria-invalid={!!errors.service}
                    >
                      <option value="">Select a service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                      <option value="general">General eye exam</option>
                      <option value="other">Other / Not sure</option>
                    </select>
                    <ChevronIcon />
                  </div>
                  {errors.service && (
                    <span className="field-error">{errors.service}</span>
                  )}
                </div>
                <div className="contact__field">
                  <label htmlFor="location">Preferred location *</label>
                  <div
                    className={`contact__select-wrap${errors.location ? " input--error" : ""}`}
                  >
                    <select
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handle}
                      aria-invalid={!!errors.location}
                    >
                      <option value="">Select a location</option>
                      {contactInfo.locations.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} — {loc.short}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                  {errors.location && (
                    <span className="field-error">{errors.location}</span>
                  )}
                </div>
                <div className="contact__field">
                  <label htmlFor="message">Additional notes *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handle}
                    rows={4}
                    placeholder="Tell us more about your symptoms or any questions you have…"
                    aria-invalid={!!errors.message}
                    className={errors.message ? "input--error" : ""}
                  />
                  {errors.message && (
                    <span className="field-error">{errors.message}</span>
                  )}
                </div>
                {errors.submit && (
                  <div className="contact__error-banner">{errors.submit}</div>
                )}
                <button
                  type="submit"
                  className="btn btn--primary btn--lg contact__submit"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Submit booking request"}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div
            className="contact__sidebar reveal reveal--right"
            ref={sidebarRef}
          >
            <div className="card contact__info-card">
              <h3 className="contact__info-title">Get in touch</h3>
              <div className="contact__info-list">
                {[
                  {
                    icon: <PhoneIcon />,
                    label: "Phone",
                    value: contactInfo.phone,
                    href: "tel:" + contactInfo.phone.replace(/\s/g, ""),
                  },
                  {
                    icon: <MailIcon />,
                    label: "Email",
                    value: contactInfo.email,
                    href: "mailto:" + contactInfo.email,
                  },
                  {
                    icon: <WaIcon />,
                    label: "WhatsApp",
                    value: "Message us on WhatsApp",
                    href: contactInfo.whatsapp,
                    external: true,
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="contact__info-item"
                  >
                    <div className="contact__info-icon">{item.icon}</div>
                    <div>
                      <span className="contact__info-label">{item.label}</span>
                      <span className="contact__info-value">{item.value}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Our Locations ── */}
            <div className="card contact__locations-card">
              <h3 className="contact__info-title">Our locations</h3>
              <div className="contact__locations-list">
                {contactInfo.locations.map((loc) => (
                  <a
                    key={loc.name}
                    href={
                      "https://maps.google.com/?q=" +
                      encodeURIComponent(loc.address)
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="contact__location-item"
                  >
                    <span className="contact__location-emoji">{loc.emoji}</span>
                    <div>
                      <span className="contact__location-name">{loc.name}</span>
                      <span className="contact__location-address">
                        {loc.address}
                      </span>
                    </div>
                    <ArrowIcon />
                  </a>
                ))}
              </div>
            </div>

            <div className="card contact__hours-card">
              <h3 className="contact__info-title">Opening hours</h3>
              <ul className="contact__hours-list">
                {hours.map((h) => {
                  const today = new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  return (
                    <li
                      key={h.day}
                      className={
                        "contact__hours-row" + (h.day === today ? " today" : "")
                      }
                    >
                      <span>{h.day}</span>
                      <span>
                        {h.open ? h.open + " – " + h.close : "Closed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="contact__emergency-note">
                <span className="contact__emergency-dot" />
                <p>
                  <strong>Eye emergency?</strong> We're on call 7 days a week —
                  call us any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Animated Scene SVGs ───────────────────────────────────── */
function CarSVG() {
  return (
    <svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="18"
        width="100"
        height="24"
        rx="6"
        fill="#0F6E56"
        fillOpacity="0.7"
      />
      <rect
        x="22"
        y="10"
        width="70"
        height="20"
        rx="5"
        fill="#0F6E56"
        fillOpacity="0.5"
      />
      <rect
        x="26"
        y="13"
        width="28"
        height="14"
        rx="3"
        fill="#9FE1CB"
        fillOpacity="0.4"
      />
      <rect
        x="62"
        y="13"
        width="24"
        height="14"
        rx="3"
        fill="#9FE1CB"
        fillOpacity="0.4"
      />
      <circle
        cx="30"
        cy="42"
        r="8"
        fill="#042C20"
        stroke="#0F6E56"
        strokeWidth="2"
      />
      <circle cx="30" cy="42" r="3" fill="#9FE1CB" fillOpacity="0.5" />
      <circle
        cx="90"
        cy="42"
        r="8"
        fill="#042C20"
        stroke="#0F6E56"
        strokeWidth="2"
      />
      <circle cx="90" cy="42" r="3" fill="#9FE1CB" fillOpacity="0.5" />
      <rect
        x="108"
        y="24"
        width="8"
        height="6"
        rx="2"
        fill="#C9A84C"
        fillOpacity="0.8"
      />
      <rect
        x="4"
        y="26"
        width="6"
        height="4"
        rx="1"
        fill="#C9A84C"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function WalkerSVG() {
  return (
    <svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="20" cy="10" r="8" fill="#0F6E56" fillOpacity="0.6" />
      {/* Body */}
      <rect
        x="14"
        y="20"
        width="12"
        height="22"
        rx="4"
        fill="#0F6E56"
        fillOpacity="0.5"
      />
      {/* Left arm */}
      <line
        x1="14"
        y1="24"
        x2="4"
        y2="36"
        stroke="#0F6E56"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinecap="round"
        className="walker-arm-l"
      />
      {/* Right arm */}
      <line
        x1="26"
        y1="24"
        x2="34"
        y2="32"
        stroke="#0F6E56"
        strokeOpacity="0.6"
        strokeWidth="3"
        strokeLinecap="round"
        className="walker-arm-r"
      />
      {/* Left leg */}
      <line
        x1="18"
        y1="42"
        x2="10"
        y2="62"
        stroke="#0F6E56"
        strokeOpacity="0.6"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="walker-leg-l"
      />
      {/* Right leg */}
      <line
        x1="22"
        y1="42"
        x2="30"
        y2="58"
        stroke="#0F6E56"
        strokeOpacity="0.6"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="walker-leg-r"
      />
    </svg>
  );
}

function CallerSVG() {
  return (
    <svg viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="30" cy="14" r="12" fill="#0F6E56" fillOpacity="0.55" />
      {/* Body */}
      <rect
        x="18"
        y="28"
        width="24"
        height="32"
        rx="6"
        fill="#0F6E56"
        fillOpacity="0.45"
      />
      {/* Phone held up */}
      <rect
        x="38"
        y="18"
        width="10"
        height="18"
        rx="3"
        fill="#042C20"
        fillOpacity="0.7"
        stroke="#9FE1CB"
        strokeWidth="1.5"
      />
      <rect
        x="40"
        y="21"
        width="6"
        height="10"
        rx="1"
        fill="#9FE1CB"
        fillOpacity="0.3"
      />
      {/* Arm holding phone */}
      <line
        x1="38"
        y1="34"
        x2="42"
        y2="24"
        stroke="#0F6E56"
        strokeOpacity="0.6"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Other arm */}
      <line
        x1="18"
        y1="34"
        x2="10"
        y2="48"
        stroke="#0F6E56"
        strokeOpacity="0.5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Signal waves */}
      <path
        d="M50 14 Q55 18 50 22"
        stroke="#9FE1CB"
        strokeOpacity="0.6"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        className="signal-1"
      />
      <path
        d="M53 10 Q60 18 53 26"
        stroke="#9FE1CB"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        className="signal-2"
      />
      {/* Legs */}
      <line
        x1="24"
        y1="60"
        x2="18"
        y2="82"
        stroke="#0F6E56"
        strokeOpacity="0.5"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="60"
        x2="40"
        y2="80"
        stroke="#0F6E56"
        strokeOpacity="0.5"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeLineSVG() {
  return (
    <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 30 C30 5 90 5 116 30 C90 55 30 55 4 30Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="60"
        cy="30"
        r="14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="60" cy="30" r="6" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function RingSVG() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="40"
        cy="40"
        r="24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        fill="none"
      />
      <circle cx="40" cy="40" r="8" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

/* ─── Icons ─────────────────────────────────────────────────── */
const CheckCircleIcon = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
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
const PinIcon = () => (
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
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const PhoneIcon = () => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.57 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 5.48 5.48l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
  </svg>
);
const MailIcon = () => (
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
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.533 5.849L.06 23.94l6.255-1.641A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.493-5.204-1.355l-.374-.222-3.865 1.014 1.033-3.77-.244-.388A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);
const ChevronIcon = () => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
