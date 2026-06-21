import { useState, useEffect } from "react";
import { services, contactInfo } from "../../data/siteData";
import { supabase } from "../../lib/supabase";
import "./BookingModal.css";

const MAX_PER_SLOT = 2; // max individual bookings per time slot
const MAX_PER_DAY = 30; // max people (individual=1, group=its size) per branch per day

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
const THIS_DAY = new Date().getDate();
const YEARS = [THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2];

const HOURS_AM = [
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];
const HOURS_PM = [
  "12:00",
  "1:00",
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
];
const HOURS = [...HOURS_AM, ...HOURS_PM];
const PERIODS = ["AM", "PM"];

export default function BookingModal({ onClose }) {
  const [form, setForm] = useState({
    service: "",
    doctor: "",
    location: "",
    name: "",
    phone: "",
    day: "",
    month: "",
    year: String(THIS_YEAR),
    hour: "",
    period: "AM",
    bookingType: "individual",
    groupSize: "",
    organizationName: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dayFull, setDayFull] = useState(false);
  const [slotCounts, setSlotCounts] = useState({}); // per time-slot count of INDIVIDUAL bookings only
  const [headcount, setHeadcount] = useState(0); // total people booked that day at this location
  const [checkingSlots, setChecking] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Re-check availability whenever date OR location changes
  useEffect(() => {
    if (!form.day || !form.month || !form.year || !form.location) {
      setSlotCounts({});
      setHeadcount(0);
      setDayFull(false);
      return;
    }
    fetchSlots(`${form.day} ${form.month} ${form.year}`, form.location);
  }, [form.day, form.month, form.year, form.location]);

  const fetchSlots = async (dateStr, location) => {
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("time_slot, booking_type, group_size")
        .eq("date", dateStr)
        .eq("location", location);
      if (error) throw error;

      // Per-slot count — only individual bookings occupy a specific time slot
      const counts = {};
      let totalHeadcount = 0;
      data.forEach((b) => {
        const size = b.booking_type === "group" ? b.group_size || 0 : 1;
        totalHeadcount += size;
        if (b.booking_type !== "group") {
          counts[b.time_slot] = (counts[b.time_slot] || 0) + 1;
        }
      });
      setSlotCounts(counts);
      setHeadcount(totalHeadcount);
      setDayFull(totalHeadcount >= MAX_PER_DAY);
    } catch (e) {
      console.error("Slot check failed:", e);
    } finally {
      setChecking(false);
    }
  };

  const set = (k) => (e) => {
    let value = e.target.value;
    if (k === "phone" && !/^[0-9\s+\-()]*$/.test(value)) return;
    if (k === "groupSize" && !/^[0-9]*$/.test(value)) return;

    // Auto-switch AM/PM based on the hour selected
    if (k === "hour") {
      const autoPeriod = HOURS_PM.includes(value) ? "PM" : "AM";
      setForm((f) => ({ ...f, hour: value, period: autoPeriod }));
      if (errors.hour) setErrors((p) => ({ ...p, hour: "" }));
      return;
    }

    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.service) e.service = "Please select a service";
    if (!form.doctor) e.doctor = "Please select a doctor";
    if (!form.location) e.location = "Please select a location";
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (form.phone.replace(/[\s+\-()]/g, "").length < 11) {
      e.phone = "Phone number must be at least 11 digits";
    }
    if (form.bookingType === "group") {
      if (!form.organizationName.trim()) {
        e.organizationName = "Company / school name is required";
      }
      const size = Number(form.groupSize);
      if (!form.groupSize || size < 2) {
        e.groupSize = "Enter the number of people (2 or more)";
      } else if (size > MAX_PER_DAY) {
        e.groupSize = `Maximum group size is ${MAX_PER_DAY} people`;
      } else if (headcount + size > MAX_PER_DAY) {
        e.groupSize = `Only ${MAX_PER_DAY - headcount} slot(s) left at this branch on this day`;
      }
    }
    if (!form.day || !form.month || !form.year)
      e.date = "Please select a complete date";
    if (dayFull)
      e.date =
        "This day is fully booked at this branch — please choose another date or location";
    if (!form.hour) e.hour = "Please select a time";
    if (form.bookingType === "individual") {
      const slotKey = form.hour;
      if (form.hour && (slotCounts[slotKey] || 0) >= MAX_PER_SLOT) {
        e.hour = "This time slot is full — please choose another";
      }
    }
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
      const locationObj = contactInfo.locations.find(
        (l) => l.name === form.location,
      );

      const booking = {
        name: form.name,
        phone: form.phone,
        service: serviceName,
        doctor: form.doctor,
        date: dateStr,
        time_slot: timeSlot,
        location: locationObj ? locationObj.short : form.location,
        booking_type: form.bookingType,
        group_size:
          form.bookingType === "group" ? Number(form.groupSize) : null,
        organization_name:
          form.bookingType === "group" ? form.organizationName : null,
      };

      const { error } = await supabase.from("bookings").insert([booking]);
      if (error) throw error;

      // Email is best-effort — never block the success state if this fails
      try {
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
      } catch (emailErr) {
        console.error(
          "Booking email notification failed (booking still saved):",
          emailErr,
        );
      }

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

  const slotsLeft = MAX_PER_DAY - headcount;
  const fillPct = (slotsLeft / MAX_PER_DAY) * 100;

  return (
    <div
      className="bm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bm-modal" role="dialog" aria-modal="true">
        <div className="bm-photo">
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80"
            alt="Optometrist"
          />
          <div className="bm-photo__overlay">
            <p className="bm-photo__quote">
              "Protecting your vision is our highest priority."
            </p>
            <p className="bm-photo__attr">— Corporate Eye Clinic</p>
          </div>
        </div>

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

                {/* Location */}
                <div className="bm-field">
                  <label>LOCATION *</label>
                  <div
                    className={`bm-select-wrap${errors.location ? " bm-select-wrap--error" : ""}`}
                  >
                    <select value={form.location} onChange={set("location")}>
                      <option value="">Select Location</option>
                      {contactInfo.locations.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} — {loc.short}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                  {errors.location && (
                    <span className="bm-field-error">{errors.location}</span>
                  )}
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

                {/* Booking Type — always visible */}
                <div className="bm-field">
                  <label>BOOKING TYPE</label>
                  <div className="bm-toggle-row">
                    <button
                      type="button"
                      className={`bm-toggle-btn${form.bookingType === "individual" ? " active" : ""}`}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          bookingType: "individual",
                          groupSize: "",
                          organizationName: "",
                        }))
                      }
                    >
                      👤 Individual
                    </button>
                    <button
                      type="button"
                      className={`bm-toggle-btn${form.bookingType === "group" ? " active" : ""}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, bookingType: "group" }))
                      }
                    >
                      👥 Group (School/Work)
                    </button>
                  </div>

                  {form.bookingType === "group" && (
                    <div className="bm-group-size">
                      <label>COMPANY / SCHOOL NAME *</label>
                      <input
                        type="text"
                        placeholder="e.g. Bright Future Academy"
                        value={form.organizationName}
                        onChange={set("organizationName")}
                        className={
                          errors.organizationName ? "bm-input--error" : ""
                        }
                      />
                      {errors.organizationName && (
                        <span className="bm-field-error">
                          {errors.organizationName}
                        </span>
                      )}

                      <label style={{ marginTop: "12px", display: "block" }}>
                        NUMBER OF PEOPLE * (max {MAX_PER_DAY})
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 25"
                        value={form.groupSize}
                        onChange={set("groupSize")}
                        inputMode="numeric"
                        className={errors.groupSize ? "bm-input--error" : ""}
                      />
                      {errors.groupSize && (
                        <span className="bm-field-error">
                          {errors.groupSize}
                        </span>
                      )}
                      <p className="bm-group-note">
                        A group of {MAX_PER_DAY} fills the entire day at the
                        selected branch — no other bookings will be accepted
                        there that day.
                      </p>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="bm-field">
                  <label>DATE</label>
                  <div className="bm-date-row">
                    <div className="bm-select-wrap" style={{ flex: 1 }}>
                      <select value={form.day} onChange={set("day")}>
                        <option value="">Day</option>
                        {DAYS.map((d) => {
                          const isPast =
                            Number(form.year) === THIS_YEAR &&
                            MONTHS_ALL.indexOf(form.month) + 1 === THIS_MONTH &&
                            d < THIS_DAY;
                          return (
                            <option
                              key={d}
                              value={d}
                              disabled={isPast}
                              style={isPast ? { color: "#ccc" } : {}}
                            >
                              {d}
                              {isPast ? " (past)" : ""}
                            </option>
                          );
                        })}
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

                {/* Slots remaining bar — per branch, per day */}
                {form.day && form.month && form.year && form.location && (
                  <div className="bm-slots-bar">
                    {checkingSlots ? (
                      <span className="bm-slots-bar__checking">
                        Checking availability…
                      </span>
                    ) : dayFull ? (
                      <div className="bm-slots-bar__full">
                        <span className="bm-slots-bar__dot bm-slots-bar__dot--red" />
                        This day is fully booked at this branch — please choose
                        another date or location
                      </div>
                    ) : (
                      <div className="bm-slots-bar__wrap">
                        <div className="bm-slots-bar__info">
                          <span className="bm-slots-bar__dot bm-slots-bar__dot--green" />
                          <span>
                            <strong>{slotsLeft}</strong> of{" "}
                            <strong>{MAX_PER_DAY}</strong> slots available at
                            this branch for {form.day} {form.month}
                          </span>
                        </div>
                        <div className="bm-slots-bar__track">
                          <div
                            className="bm-slots-bar__fill"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Time */}
                <div className="bm-field">
                  <label>
                    TIME *{" "}
                    {checkingSlots && (
                      <span className="bm-checking">Checking…</span>
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
                          const full =
                            form.bookingType === "individual" &&
                            (slotCounts[h] || 0) >= MAX_PER_SLOT;
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
                  <p className="bm-group-note" style={{ marginTop: "4px" }}>
                    AM/PM is set automatically based on the time you pick.
                  </p>
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
