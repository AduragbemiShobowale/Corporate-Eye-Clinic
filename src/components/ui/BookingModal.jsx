import { useState, useEffect } from "react";
import { services } from "../../data/siteData";
import { supabase } from "../../lib/supabase";
import "./BookingModal.css";

// ── Configurable limits ──────────────────────────────────────────
const MAX_PER_SLOT = 2; // max bookings per time slot
const MAX_PER_DAY = 30; // max bookings per day — change here to adjust

const DOCTORS = ["Dr. Onoja G."];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS_ALL = [
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
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const YEARS = [THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2];
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
    year: String(THIS_YEAR),
    hour: "",
    period: "AM",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // slot availability
  const [dayFull, setDayFull] = useState(false);
  const [slotCounts, setSlotCounts] = useState({}); // { "8:00 AM": 2, ... }
  const [checkingSlots, setChecking] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Fetch slot counts when date is fully selected
  useEffect(() => {
    if (!form.day || !form.month || !form.year) {
      setSlotCounts({});
      setDayFull(false);
      return;
    }
    const dateStr = `${form.day} ${form.month} ${form.year}`;
    fetchSlots(dateStr);
  }, [form.day, form.month, form.year]);

  const fetchSlots = async (dateStr) => {
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("time_slot")
        .eq("date", dateStr);

      if (error) throw error;

      // Count per slot
      const counts = {};
      data.forEach((b) => {
        counts[b.time_slot] = (counts[b.time_slot] || 0) + 1;
      });
      setSlotCounts(counts);
      setDayFull(data.length >= MAX_PER_DAY);
    } catch (e) {
      console.error("Slot check failed:", e);
    } finally {
      setChecking(false);
    }
  };

  const set = (k) => (e) => {
    let value = e.target.value;
    if (k === "phone" && !/^[0-9\s+\-()]*$/.test(value)) return;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
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
    if (dayFull)
      e.date = "This day is fully booked — please choose another date";
    const slotKey = `${form.hour} ${form.period}`;
    if (form.hour && (slotCounts[slotKey] || 0) >= MAX_PER_SLOT)
      e.hour = "This time slot is full — please choose another time";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const dateStr = `${form.day} ${form.month} ${form.year}`;
      const timeSlot = `${form.hour} ${form.period}`;
      const serviceName =
        services.find((s) => s.id === form.service)?.title ||
        form.service ||
        "General eye exam";

      // 1. Save to Supabase
      const booking = {
        name: form.name,
        phone: form.phone,
        service: serviceName,
        doctor: form.doctor,
        date: dateStr,
        time_slot: timeSlot,
      };

      const { error } = await supabase.from("bookings").insert([booking]);
      if (error) throw error;

      // 2. Trigger email notification via Edge Function
      await fetch(
        "https://cacniprnjuwuavhhfowu.supabase.co/functions/v1/send-booking-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY25pcHJuanV3dWF2aGhmb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDYwODEsImV4cCI6MjA5NjE4MjA4MX0.UvpRbcH8Wq70tndFNqs9ygEiUXz4lKBd4Nzc-vg3jjg",
          },
          body: JSON.stringify(booking),
        },
      );

      setSubmitted(true);
    } catch (err) {
      console.error("Booking failed:", err);
      setErrors({
        submit: "Something went wrong. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bm-modal" role="dialog" aria-modal="true">
        {/* ── Left photo panel ── */}
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

        {/* ── Right form panel ── */}
        <div className="bm-form-wrap">
          <button className="bm-close" onClick={onClose} aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
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
              <h3>Booking confirmed! 🎉</h3>
              <p>
                Your appointment has been booked. The clinic has been notified
                and will contact you on <strong>{form.phone}</strong> to
                confirm.
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
                {/* Service + Doctor */}
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

                {/* Name + Phone */}
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

                {/* Date */}
                <div className="bm-field">
                  <label>
                    DATE{" "}
                    {dayFull && (
                      <span className="bm-slot-full">— Day fully booked</span>
                    )}
                  </label>
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
                        {MONTHS_ALL.map((m, i) => {
                          const isPast =
                            Number(form.year) === THIS_YEAR &&
                            i + 1 < THIS_MONTH;
                          return (
                            <option
                              key={m}
                              value={m}
                              disabled={isPast}
                              style={isPast ? { color: "#ccc" } : {}}
                            >
                              {m}
                              {isPast ? " (past)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronIcon />
                    </div>
                    <div className="bm-select-wrap" style={{ flex: 1 }}>
                      <select value={form.year} onChange={set("year")}>
                        {YEARS.map((y) => (
                          <option key={y} value={String(y)}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  {errors.date && (
                    <span className="bm-field-error">{errors.date}</span>
                  )}
                </div>

                {/* Time */}
                <div className="bm-field">
                  <label>
                    TIME *{" "}
                    {checkingSlots && (
                      <span className="bm-checking">
                        Checking availability…
                      </span>
                    )}
                  </label>
                  <div className="bm-date-row">
                    <div
                      className={`bm-select-wrap${errors.hour ? " bm-select-wrap--error" : ""}`}
                      style={{ flex: 3 }}
                    >
                      <select
                        value={form.hour}
                        onChange={set("hour")}
                        disabled={dayFull}
                      >
                        <option value="">Select time</option>
                        {HOURS.map((h) => {
                          const slotKey = `${h} ${form.period}`;
                          const count = slotCounts[slotKey] || 0;
                          const full = count >= MAX_PER_SLOT;
                          return (
                            <option
                              key={h}
                              value={h}
                              disabled={full}
                              style={full ? { color: "#ccc" } : {}}
                            >
                              {h}
                              {full ? " — Full" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronIcon />
                    </div>
                    <div className="bm-select-wrap" style={{ flex: 1 }}>
                      <select
                        value={form.period}
                        onChange={set("period")}
                        disabled={dayFull}
                      >
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

                {errors.submit && (
                  <div className="bm-error-banner">{errors.submit}</div>
                )}

                <button
                  type="submit"
                  className="bm-submit"
                  disabled={loading || dayFull}
                >
                  {loading ? "Saving your slot…" : "BOOK AN APPOINTMENT"}
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
