import { useState } from "react";
import { contactInfo } from "../../data/siteData";
import { supabase } from "../../lib/supabase";
import "./ContactLensPrescriptionSection.css";

const SPH_OPTIONS = [
  "Plano",
  "-0.25",
  "-0.50",
  "-0.75",
  "-1.00",
  "-1.25",
  "-1.50",
  "-1.75",
  "-2.00",
  "-2.25",
  "-2.50",
  "-2.75",
  "-3.00",
  "-3.50",
  "-4.00",
  "-4.50",
  "-5.00",
  "-5.50",
  "-6.00",
  "+0.25",
  "+0.50",
  "+0.75",
  "+1.00",
  "+1.25",
  "+1.50",
  "+1.75",
  "+2.00",
];
const COLORS = [
  "Clear / Natural",
  "Hazel",
  "Grey",
  "Blue",
  "Green",
  "Brown",
  "Honey",
];

export default function ContactLensPrescriptionSection({ onSuccess, inline }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    re: "",
    le: "",
    color: "",
    fulfillment: "pickup",
    location: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };
  const setPhone = (e) => {
    if (!/^[0-9\s+\-()]*$/.test(e.target.value)) return;
    setForm((f) => ({ ...f, phone: e.target.value }));
    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/[\s+\-()]/g, "").length < 11)
      e.phone = "Phone number must be at least 11 digits";
    if (!form.re) e.re = "Select right eye power";
    if (!form.le) e.le = "Select left eye power";
    if (!form.color) e.color = "Select a lens color";
    if (form.fulfillment === "pickup" && !form.location)
      e.location = "Please select a pickup location";
    if (form.fulfillment === "dispatch" && !form.address.trim())
      e.address = "Delivery address is required";
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
      const payload = {
        order_type: "contacts",
        name: form.name,
        phone: form.phone,
        fulfillment: form.fulfillment,
        location: form.fulfillment === "pickup" ? form.location : null,
        delivery_address: form.fulfillment === "dispatch" ? form.address : null,
        re_sph_dist: form.re,
        le_sph_dist: form.le,
        lens_color: form.color,
      };

      const { error } = await supabase
        .from("prescription_orders")
        .insert([payload]);
      if (error) throw error;

      // Email notification — fire and forget, never block success state
      fetch(
        "https://cacniprnjuwuavhhfowu.supabase.co/functions/v1/send-prescription-email",
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
        console.error("Contact lens email failed (non-blocking):", err),
      );

      onSuccess(form.name);
      setForm({
        name: "",
        phone: "",
        re: "",
        le: "",
        color: "",
        fulfillment: "pickup",
        location: "",
        address: "",
      });
    } catch (err) {
      console.error("Contact lens order failed:", err);
      setErrors({
        submit: "Something went wrong. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const FormBody = (
    <form className="cls-form" onSubmit={submit} noValidate>
      <div className="cls-row">
        <div className="cls-field">
          <label>FULL NAME *</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={setField("name")}
            className={errors.name ? "cls-input--error" : ""}
          />
          {errors.name && (
            <span className="cls-field-error">{errors.name}</span>
          )}
        </div>
        <div className="cls-field">
          <label>PHONE *</label>
          <input
            type="tel"
            placeholder="+234 ..."
            value={form.phone}
            onChange={setPhone}
            inputMode="numeric"
            className={errors.phone ? "cls-input--error" : ""}
          />
          {errors.phone && (
            <span className="cls-field-error">{errors.phone}</span>
          )}
        </div>
      </div>

      <div className="cls-row">
        <div className="cls-field">
          <label>RIGHT EYE (RE) *</label>
          <div
            className={`cls-select-wrap${errors.re ? " cls-select-wrap--error" : ""}`}
          >
            <select value={form.re} onChange={setField("re")}>
              <option value="">Select power</option>
              {SPH_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
          {errors.re && <span className="cls-field-error">{errors.re}</span>}
        </div>
        <div className="cls-field">
          <label>LEFT EYE (LE) *</label>
          <div
            className={`cls-select-wrap${errors.le ? " cls-select-wrap--error" : ""}`}
          >
            <select value={form.le} onChange={setField("le")}>
              <option value="">Select power</option>
              {SPH_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
          {errors.le && <span className="cls-field-error">{errors.le}</span>}
        </div>
      </div>

      <div className="cls-field">
        <label>LENS COLOR *</label>
        <div
          className={`cls-select-wrap${errors.color ? " cls-select-wrap--error" : ""}`}
        >
          <select value={form.color} onChange={setField("color")}>
            <option value="">Select color</option>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
        {errors.color && (
          <span className="cls-field-error">{errors.color}</span>
        )}
      </div>

      {/* Fulfillment */}
      <div className="cls-field">
        <label>HOW WOULD YOU LIKE TO RECEIVE YOUR LENSES? *</label>
        <div className="cls-toggle-row">
          <button
            type="button"
            className={`cls-toggle-btn${form.fulfillment === "pickup" ? " active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, fulfillment: "pickup" }))}
          >
            🏥 Pickup at clinic
          </button>
          <button
            type="button"
            className={`cls-toggle-btn${form.fulfillment === "dispatch" ? " active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, fulfillment: "dispatch" }))}
          >
            🚚 Dispatch / Delivery
          </button>
        </div>
      </div>

      {form.fulfillment === "pickup" ? (
        <div className="cls-field">
          <label>PICKUP LOCATION *</label>
          <div
            className={`cls-select-wrap${errors.location ? " cls-select-wrap--error" : ""}`}
          >
            <select value={form.location} onChange={setField("location")}>
              <option value="">Select location</option>
              {contactInfo.locations.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} — {loc.short}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
          {errors.location && (
            <span className="cls-field-error">{errors.location}</span>
          )}
        </div>
      ) : (
        <div className="cls-field">
          <label>DELIVERY ADDRESS *</label>
          <textarea
            rows={2}
            placeholder="Enter your full delivery address"
            value={form.address}
            onChange={setField("address")}
            className={errors.address ? "cls-input--error" : ""}
          />
          {errors.address && (
            <span className="cls-field-error">{errors.address}</span>
          )}
        </div>
      )}

      {errors.submit && <div className="cls-error-banner">{errors.submit}</div>}

      <button type="submit" className="cls-submit" disabled={loading}>
        {loading ? "Submitting…" : "SUBMIT CONTACT LENS ORDER"}
      </button>
    </form>
  );

  if (inline) return <div className="cls-inline-wrap">{FormBody}</div>;

  return (
    <section id="order-contacts-rx" className="cls-section">
      <div className="container">
        <div className="cls-header">
          <span className="cls-eyebrow">Have a contact lens prescription?</span>
          <h2 className="cls-title">
            Order contact lenses with your prescription
          </h2>
          <p className="cls-subtitle">
            Tell us your prescription and preferred color — we'll prepare your
            lenses and contact you with pricing. Don't have a prescription? Just
            browse and buy directly from the shop below.
          </p>
        </div>
        {FormBody}
      </div>
    </section>
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
