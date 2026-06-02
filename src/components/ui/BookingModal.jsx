import { useState, useEffect } from "react";
import { services } from "../../data/siteData";
import "./BookingModal.css";

const DOCTORS = ["Dr. Onoja G."];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = [2025, 2026, 2027];
const HOURS = [
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "1:00",
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
];
const PERIODS = ["AM", "PM"];

export default function BookingModal({ onClose }) {
  const [form, setForm] = useState({
    service: "",
    doctor: "",
    name: "",
    phone: "",
    day: "",
    month: "",
    year: "",
    hour: "",
    period: "AM",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (k) => (e) => {
    let value = e.target.value;
    // Phone: only digits, spaces, + - ()
    if (k === "phone") {
      if (!/^[0-9\s+\-()]*$/.test(value)) return;
    }
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.service) e.service = "Please select a service";
    if (!form.doctor) e.doctor = "Please select a doctor";
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/[\s+\-()]/g, "").length < 7)
      e.phone = "Enter a valid phone number";
    if (!form.day || !form.month || !form.year)
      e.date = "Please select a complete date";
    if (!form.hour) e.hour = "Please select a time";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Build WhatsApp message
    const serviceName =
      services.find((s) => s.id === form.service)?.title ||
      form.service ||
      "General eye exam";
    const msg = [
      "👁️ *New Appointment Request*",
      "",
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      `*Service:* ${serviceName}`,
      form.doctor ? `*Doctor:* ${form.doctor}` : null,
      `*Date:* ${form.day} ${form.month} ${form.year}`,
      `*Time:* ${form.hour} ${form.period}`,
      "",
      "_Sent via Corporate Eye Clinic website_",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/234908549539?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setSubmitted(true);
  };

  return (
    <div
      className="bm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Book an appointment"
      >
        {/* Left photo panel */}
        <div className="bm-photo">
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80"
            alt="Optometrist at Corporate Eye Clinic"
          />
          <div className="bm-photo__overlay">
            <p className="bm-photo__quote">
              "Protecting your vision is our highest priority."
            </p>
            <p className="bm-photo__attr">— Corporate Eye Clinic</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bm-form-wrap">
          <button className="bm-close" onClick={onClose} aria-label="Close">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {submitted ? (
            <div className="bm-success">
              <div className="bm-success__icon">
                <svg
                  width="40"
                  height="40"
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
              </div>
              <h3>Almost there! 🎉</h3>
              <p>
                A WhatsApp message has been pre-filled with your details. Just
                tap <strong>Send</strong> in WhatsApp to confirm your booking —
                the clinic will reply shortly.
              </p>
              <button className="btn btn--primary" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <>
              <span className="bm-eyebrow">Take the next step</span>
              <h2 className="bm-title">Schedule an Appointment</h2>

              <form className="bm-form" onSubmit={submit} noValidate>
                <div className="bm-row">
                  <div className="bm-field">
                    <label>SERVICE *</label>
                    <div
                      className={`bm-select-wrap${errors.service ? " bm-select-wrap--error" : ""}`}
                    >
                      <select value={form.service} onChange={set("service")}>
                        <option value="">Select Service</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                        <option value="general">General eye exam</option>
                      </select>
                      <ChevronIcon />
                    </div>
                    {errors.service && (
                      <span className="bm-field-error">{errors.service}</span>
                    )}
                  </div>
                  <div className="bm-field">
                    <label>DOCTOR *</label>
                    <div
                      className={`bm-select-wrap${errors.doctor ? " bm-select-wrap--error" : ""}`}
                    >
                      <select value={form.doctor} onChange={set("doctor")}>
                        <option value="">Select Doctor</option>
                        {DOCTORS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                    {errors.doctor && (
                      <span className="bm-field-error">{errors.doctor}</span>
                    )}
                  </div>
                </div>

                <div className="bm-row">
                  <div className="bm-field">
                    <label>YOUR NAME *</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={set("name")}
                      className={errors.name ? "bm-input--error" : ""}
                    />
                    {errors.name && (
                      <span className="bm-field-error">{errors.name}</span>
                    )}
                  </div>
                  <div className="bm-field">
                    <label>YOUR PHONE *</label>
                    <input
                      type="tel"
                      placeholder="+234 ..."
                      value={form.phone}
                      onChange={set("phone")}
                      inputMode="numeric"
                      className={errors.phone ? "bm-input--error" : ""}
                    />
                    {errors.phone && (
                      <span className="bm-field-error">{errors.phone}</span>
                    )}
                  </div>
                </div>

                {/* ── Date row ── */}
                <div className="bm-field">
                  <label>DATE</label>
                  <div className="bm-date-row">
                    <div className="bm-select-wrap" style={{ flex: 1 }}>
                      <select value={form.day} onChange={set("day")}>
                        <option value="">Day</option>
                        {DAYS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                    <div className="bm-select-wrap" style={{ flex: 2 }}>
                      <select value={form.month} onChange={set("month")}>
                        <option value="">Month</option>
                        {MONTHS.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                    <div className="bm-select-wrap" style={{ flex: 1 }}>
                      <select value={form.year} onChange={set("year")}>
                        {YEARS.map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  {errors.date && (
                    <span className="bm-field-error">{errors.date}</span>
                  )}
                </div>

                {/* ── Time row — separate and clean ── */}
                <div className="bm-field">
                  <label>TIME *</label>
                  <div className="bm-date-row">
                    <div
                      className={`bm-select-wrap${errors.hour ? " bm-select-wrap--error" : ""}`}
                      style={{ flex: 2 }}
                    >
                      <select value={form.hour} onChange={set("hour")}>
                        <option value="">Select time</option>
                        {HOURS.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                    <div className="bm-select-wrap" style={{ flex: 1 }}>
                      <select value={form.period} onChange={set("period")}>
                        {PERIODS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  {errors.hour && (
                    <span className="bm-field-error">{errors.hour}</span>
                  )}
                </div>

                <button type="submit" className="bm-submit">
                  BOOK AN APPOINTMENT
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
