import { useState } from "react";
import { contactInfo } from "../../data/siteData";
import { supabase } from "../../lib/supabase";
import "./PrescriptionGlassesSection.css";

const FIELDS = ["sph", "cyl", "axis", "prism", "base"];
const emptyRow = () => ({ sph: "", cyl: "", axis: "", prism: "", base: "" });

export default function PrescriptionGlassesSection({ onSuccess, inline }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    fulfillment: "pickup",
    location: "",
    address: "",
    notes: "",
  });
  const [re, setRe] = useState({ dist: emptyRow(), read: emptyRow() });
  const [le, setLe] = useState({ dist: emptyRow(), read: emptyRow() });
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
  // Only allow digits, +, -, and . — nothing else
  const setEye = (eyeSetter) => (row, field) => (e) => {
    const value = e.target.value;
    if (!/^[0-9+\-.]*$/.test(value)) return;
    eyeSetter((prev) => ({ ...prev, [row]: { ...prev[row], [field]: value } }));
  };

  const hasAnyValue = (eye) =>
    Object.values(eye.dist).some((v) => v.trim()) ||
    Object.values(eye.read).some((v) => v.trim());

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/[\s+\-()]/g, "").length < 11)
      e.phone = "Phone number must be at least 11 digits";
    if (form.fulfillment === "pickup" && !form.location)
      e.location = "Please select a pickup location";
    if (form.fulfillment === "dispatch" && !form.address.trim())
      e.address = "Delivery address is required";
    if (!hasAnyValue(re) && !hasAnyValue(le))
      e.prescription = "Please enter at least one prescription value";
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
        order_type: "glasses",
        name: form.name,
        phone: form.phone,
        fulfillment: form.fulfillment,
        location: form.fulfillment === "pickup" ? form.location : null,
        delivery_address: form.fulfillment === "dispatch" ? form.address : null,
        re_sph_dist: re.dist.sph,
        re_cyl_dist: re.dist.cyl,
        re_axis_dist: re.dist.axis,
        re_prism_dist: re.dist.prism,
        re_base_dist: re.dist.base,
        re_sph_read: re.read.sph,
        re_cyl_read: re.read.cyl,
        re_axis_read: re.read.axis,
        re_prism_read: re.read.prism,
        re_base_read: re.read.base,
        le_sph_dist: le.dist.sph,
        le_cyl_dist: le.dist.cyl,
        le_axis_dist: le.dist.axis,
        le_prism_dist: le.dist.prism,
        le_base_dist: le.dist.base,
        le_sph_read: le.read.sph,
        le_cyl_read: le.read.cyl,
        le_axis_read: le.read.axis,
        le_prism_read: le.read.prism,
        le_base_read: le.read.base,
        notes: form.notes,
      };

      const { error } = await supabase
        .from("prescription_orders")
        .insert([payload]);
      if (error) throw error;

      // Email is best-effort — never block the success state if this fails
      try {
        await fetch(
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
        );
      } catch (emailErr) {
        console.error(
          "Prescription email notification failed (order still saved):",
          emailErr,
        );
      }

      onSuccess(form.name);
      // reset form
      setForm({
        name: "",
        phone: "",
        email: "",
        fulfillment: "pickup",
        location: "",
        address: "",
        notes: "",
      });
      setRe({ dist: emptyRow(), read: emptyRow() });
      setLe({ dist: emptyRow(), read: emptyRow() });
    } catch (err) {
      console.error("Prescription order failed:", err);
      setErrors({
        submit: "Something went wrong. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const EyeTable = ({ label, dist, read, eyeSetter }) => (
    <div className="rxs-eye">
      <h4 className="rxs-eye__label">{label}</h4>
      <div className="rxs-table">
        <div className="rxs-table__header">
          <span></span>
          {FIELDS.map((f) => (
            <span key={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
          ))}
        </div>
        <div className="rxs-table__row">
          <span className="rxs-table__rowlabel">Distance</span>
          {FIELDS.map((f) => (
            <input
              key={f}
              type="text"
              inputMode="decimal"
              value={dist[f]}
              onChange={setEye(eyeSetter)("dist", f)}
              placeholder="—"
            />
          ))}
        </div>
        <div className="rxs-table__row">
          <span className="rxs-table__rowlabel">Reading</span>
          {FIELDS.map((f) => (
            <input
              key={f}
              type="text"
              inputMode="decimal"
              value={read[f]}
              onChange={setEye(eyeSetter)("read", f)}
              placeholder="—"
            />
          ))}
        </div>
      </div>
    </div>
  );

  const FormBody = (
    <form className="rxs-form" onSubmit={submit} noValidate>
      <div className="rxs-row">
        <div className="rxs-field">
          <label>FULL NAME *</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={setField("name")}
            className={errors.name ? "rxs-input--error" : ""}
          />
          {errors.name && (
            <span className="rxs-field-error">{errors.name}</span>
          )}
        </div>
        <div className="rxs-field">
          <label>PHONE *</label>
          <input
            type="tel"
            placeholder="+234 ..."
            value={form.phone}
            onChange={setPhone}
            inputMode="numeric"
            className={errors.phone ? "rxs-input--error" : ""}
          />
          {errors.phone && (
            <span className="rxs-field-error">{errors.phone}</span>
          )}
        </div>
      </div>

      {/* Prescription card */}
      <div className="rxs-card">
        <EyeTable
          label="RIGHT EYE (RE)"
          dist={re.dist}
          read={re.read}
          eyeSetter={setRe}
        />
        <EyeTable
          label="LEFT EYE (LE)"
          dist={le.dist}
          read={le.read}
          eyeSetter={setLe}
        />
      </div>
      {errors.prescription && (
        <span className="rxs-field-error">{errors.prescription}</span>
      )}

      <div className="rxs-field">
        <label>FRAME / LENS PREFERENCE (OPTIONAL)</label>
        <textarea
          rows={2}
          placeholder="e.g. Rimless frame, blue-cut lens, etc."
          value={form.notes}
          onChange={setField("notes")}
        />
      </div>

      {/* Fulfillment */}
      <div className="rxs-field">
        <label>HOW WOULD YOU LIKE TO RECEIVE YOUR GLASSES? *</label>
        <div className="rxs-toggle-row">
          <button
            type="button"
            className={`rxs-toggle-btn${form.fulfillment === "pickup" ? " active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, fulfillment: "pickup" }))}
          >
            🏥 Pickup at clinic
          </button>
          <button
            type="button"
            className={`rxs-toggle-btn${form.fulfillment === "dispatch" ? " active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, fulfillment: "dispatch" }))}
          >
            🚚 Dispatch / Delivery
          </button>
        </div>
      </div>

      {form.fulfillment === "pickup" ? (
        <div className="rxs-field">
          <label>PICKUP LOCATION *</label>
          <div
            className={`rxs-select-wrap${errors.location ? " rxs-select-wrap--error" : ""}`}
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
            <span className="rxs-field-error">{errors.location}</span>
          )}
        </div>
      ) : (
        <div className="rxs-field">
          <label>DELIVERY ADDRESS *</label>
          <textarea
            rows={2}
            placeholder="Enter your full delivery address"
            value={form.address}
            onChange={setField("address")}
            className={errors.address ? "rxs-input--error" : ""}
          />
          {errors.address && (
            <span className="rxs-field-error">{errors.address}</span>
          )}
        </div>
      )}

      {errors.submit && <div className="rxs-error-banner">{errors.submit}</div>}

      <button type="submit" className="rxs-submit" disabled={loading}>
        {loading ? "Submitting…" : "SUBMIT PRESCRIPTION ORDER"}
      </button>
    </form>
  );

  if (inline) return <div className="rxs-inline-wrap">{FormBody}</div>;

  return (
    <section id="order-glasses-rx" className="rxs-section">
      <div className="container">
        <div className="rxs-header">
          <span className="rxs-eyebrow">Already have a prescription?</span>
          <h2 className="rxs-title">Order glasses with your prescription</h2>
          <p className="rxs-subtitle">
            Fill in your details and lens prescription below — our optometrist
            will review it and contact you with pricing and fitting details.
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
