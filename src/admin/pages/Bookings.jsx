import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./TablePage.css";
import "./Bookings.css";

const BRANCHES = [
  { label: "All branches",        value: "All" },
  { label: "Head Office — Bodija",  value: "Royal Mall, Bodija, Ibadan" },
  { label: "Oluyole Branch",        value: "Alaafin Avenue, Oluyole Estate, Ibadan" },
  { label: "New Bodija Branch",     value: "3B Aare Avenue, New Bodija, Ibadan" },
];

const BRANCH_OPTIONS = BRANCHES.filter(b => b.value !== "All");

const SERVICES = [
  "Comprehensive Eye Examination",
  "Contact Lens Fitting",
  "Contact Lens Practice",
  "Eye Pressure Test",
  "Glaucoma Management",
  "Industrial & Pre-Employment Screening",
  "Low Vision Rehabilitation",
  "Pediatric Eye Care",
  "Retina Examination",
  "School Eye Screening",
  "Vision Therapy Session",
];

const TIME_SLOTS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
];

const STATUSES = ["All","upcoming","completed","no-show","cancellation_pending","cancelled"];

const BADGE = {
  upcoming:             "admin-badge--upcoming",
  completed:            "admin-badge--completed",
  "no-show":            "admin-badge--no-show",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled:            "admin-badge--cancelled",
};

const EMPTY_WALKIN = {
  name: "", phone: "", service: "", location: "", time_slot: "",
  date: new Date().toISOString().split("T")[0],
  booking_type: "individual", group_size: "", organization_name: "",
};

function nextStatuses(current, isSuperAdmin) {
  if (isSuperAdmin && current === "cancellation_pending") return ["cancelled"];
  if (!isSuperAdmin && current === "cancellation_pending") return [];
  if (current === "cancelled") return [];
  const base = ["upcoming", "completed", "no-show"];
  if (isSuperAdmin) return [...base, "cancelled"];
  return [...base, "cancellation_pending"];
}

// ── Walk-in modal ──────────────────────────────────────────────────
function WalkInModal({ onClose, onSaved }) {
  const [form, setForm]     = useState({ ...EMPTY_WALKIN });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())      e.name     = "Patient name is required.";
    if (!form.phone.trim())     e.phone    = "Phone number is required.";
    else if (form.phone.replace(/[\s+\-()/]/g, "").length < 11)
                                e.phone    = "Enter at least 11 digits.";
    if (!form.service)          e.service  = "Select a service.";
    if (!form.location)         e.location = "Select a branch.";
    if (!form.time_slot)        e.time_slot = "Select a time slot.";
    if (!form.date)             e.date     = "Select a date.";
    if (form.booking_type === "group") {
      if (!form.group_size || Number(form.group_size) < 2)
                                e.group_size = "Group size must be at least 2.";
    }
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);

    const payload = {
      name:              form.name.trim(),
      phone:             form.phone.trim(),
      service:           form.service,
      doctor:            "Dr. Onoja G.",
      date:              form.date,
      time_slot:         form.time_slot,
      location:          form.location,
      booking_type:      form.booking_type,
      group_size:        form.booking_type === "group" ? Number(form.group_size) : 1,
      organization_name: form.booking_type === "group" ? form.organization_name || null : null,
      status:            "upcoming",
    };

    const { error } = await supabase.from("bookings").insert([payload]);
    setSaving(false);
    if (error) { alert("Error saving booking: " + error.message); return; }
    onSaved();
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal walkin-modal" onClick={e => e.stopPropagation()}>
        <div className="walkin-modal-header">
          <div>
            <h2 className="admin-modal-title" style={{margin:0}}>Record walk-in</h2>
            <p className="walkin-note">
              Slot capacity limits are bypassed — front desk has full discretion.
            </p>
          </div>
          <span className="walkin-badge">Walk-in</span>
        </div>

        <div className="walkin-form">
          {/* Patient details */}
          <div className="walkin-section-title">Patient</div>
          <div className="walkin-row">
            <div className="walkin-field">
              <label className="walkin-label">Full name *</label>
              <input className={`walkin-input${errors.name?" walkin-input--err":""}`}
                value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Patient's full name" />
              {errors.name && <span className="walkin-err">{errors.name}</span>}
            </div>
            <div className="walkin-field">
              <label className="walkin-label">Phone number *</label>
              <input className={`walkin-input${errors.phone?" walkin-input--err":""}`}
                value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="08012345678" />
              {errors.phone && <span className="walkin-err">{errors.phone}</span>}
            </div>
          </div>

          {/* Appointment details */}
          <div className="walkin-section-title">Appointment</div>
          <div className="walkin-row">
            <div className="walkin-field">
              <label className="walkin-label">Service *</label>
              <select className={`walkin-input walkin-select${errors.service?" walkin-input--err":""}`}
                value={form.service} onChange={e => set("service", e.target.value)}>
                <option value="">Select service</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.service && <span className="walkin-err">{errors.service}</span>}
            </div>
            <div className="walkin-field">
              <label className="walkin-label">Branch *</label>
              <select className={`walkin-input walkin-select${errors.location?" walkin-input--err":""}`}
                value={form.location} onChange={e => set("location", e.target.value)}>
                <option value="">Select branch</option>
                {BRANCH_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
              {errors.location && <span className="walkin-err">{errors.location}</span>}
            </div>
          </div>

          <div className="walkin-row">
            <div className="walkin-field">
              <label className="walkin-label">Date *</label>
              <input type="date" className={`walkin-input${errors.date?" walkin-input--err":""}`}
                value={form.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => set("date", e.target.value)} />
              {errors.date && <span className="walkin-err">{errors.date}</span>}
            </div>
            <div className="walkin-field">
              <label className="walkin-label">Time slot *</label>
              <select className={`walkin-input walkin-select${errors.time_slot?" walkin-input--err":""}`}
                value={form.time_slot} onChange={e => set("time_slot", e.target.value)}>
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.time_slot && <span className="walkin-err">{errors.time_slot}</span>}
            </div>
          </div>

          {/* Booking type */}
          <div className="walkin-section-title">Booking type</div>
          <div className="walkin-type-toggle">
            {["individual", "group"].map(type => (
              <button key={type} type="button"
                className={`walkin-type-btn${form.booking_type === type ? " walkin-type-btn--on" : ""}`}
                onClick={() => set("booking_type", type)}>
                {type === "individual" ? "👤 Individual" : "👥 Group"}
              </button>
            ))}
          </div>

          {form.booking_type === "group" && (
            <div className="walkin-row">
              <div className="walkin-field">
                <label className="walkin-label">Group size *</label>
                <input type="number" min="2"
                  className={`walkin-input${errors.group_size?" walkin-input--err":""}`}
                  value={form.group_size}
                  onChange={e => set("group_size", e.target.value)}
                  placeholder="e.g. 10" />
                {errors.group_size && <span className="walkin-err">{errors.group_size}</span>}
              </div>
              <div className="walkin-field">
                <label className="walkin-label">Organisation name</label>
                <input className="walkin-input"
                  value={form.organization_name}
                  onChange={e => set("organization_name", e.target.value)}
                  placeholder="e.g. Heritage Academy" />
              </div>
            </div>
          )}
        </div>

        <div className="admin-modal-actions" style={{marginTop:"var(--space-6)"}}>
          <button className="admin-btn admin-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? "Recording…" : "Record walk-in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Bookings page ─────────────────────────────────────────────
const PER_PAGE = 10;

export default function Bookings() {
  const { isSuperAdmin }        = useAdminAuth();
  const [bookings, setBookings]  = useState([]);
  const [total, setTotal]        = useState(0);
  const [loading, setLoading]    = useState(true);
  const [branch, setBranch]      = useState("All");
  const [status, setStatus]      = useState("All");
  const [page, setPage]          = useState(1);
  const [updating, setUpdating]  = useState(null);
  const [showWalkIn, setShowWalkIn] = useState(false);

  async function load(p = page) {
    setLoading(true);
    const from = (p - 1) * PER_PAGE;
    const to   = from + PER_PAGE - 1;

    let q = supabase.from("bookings").select("*", { count: "exact" })
      .order("date", { ascending: false })
      .order("time_slot")
      .range(from, to);

    if (branch !== "All") q = q.eq("location", branch);
    if (status !== "All") q = q.eq("status", status);

    const { data, count } = await q;
    setBookings(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
    load(1);
  }, [branch, status]);

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  async function updateStatus(booking, newStatus) {
    setUpdating(booking.id);
    const { error } = await supabase
      .from("bookings").update({ status: newStatus }).eq("id", booking.id);
    if (error) alert("Error: " + error.message);
    setUpdating(null);
    load(page);
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bookings</h1>
          <p className="admin-page-subtitle">
            View and manage patient appointments across all branches.
            {total > 0 && <> · <strong>{total}</strong> total</>}
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowWalkIn(true)}>
          + Record walk-in
        </button>
      </div>

      <div className="tp-filters">
        <select className="admin-select" value={branch} onChange={e => setBranch(e.target.value)}>
          {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All statuses" : s.replace("_", " ")}</option>)}
        </select>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty"><p className="admin-empty-body">Loading bookings…</p></div>
        ) : bookings.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">No bookings found.</p>
            <p className="admin-empty-body">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Branch</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const options = nextStatuses(b.status, isSuperAdmin);
                return (
                  <tr key={b.id}>
                    <td>
                      <p style={{fontWeight:500,margin:0}}>{b.name}</p>
                      <p style={{fontSize:"var(--font-size-xs)",color:"var(--color-text-muted)",margin:0}}>{b.phone}</p>
                    </td>
                    <td>{b.service}</td>
                    <td>{new Date(b.date).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"})}</td>
                    <td>{b.time_slot}</td>
                    <td style={{fontSize:"var(--font-size-xs)",color:"var(--color-text-muted)"}}>{b.location}</td>
                    <td style={{textTransform:"capitalize"}}>{b.booking_type}</td>
                    <td>
                      <span className={`admin-badge ${BADGE[b.status] || ""}`}>
                        {b.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {b.status === "cancellation_pending" && isSuperAdmin ? (
                        <div className="tp-action-btns">
                          <button className="admin-btn admin-btn--danger tp-sm-btn"
                            disabled={updating === b.id}
                            onClick={() => updateStatus(b, "cancelled")}>Approve</button>
                          <button className="admin-btn admin-btn--ghost tp-sm-btn"
                            disabled={updating === b.id}
                            onClick={() => updateStatus(b, b.pre_cancellation_status || "upcoming")}>Decline</button>
                        </div>
                      ) : options.length > 0 ? (
                        <select className="admin-select tp-status-select"
                          value={b.status}
                          disabled={updating === b.id}
                          onChange={e => updateStatus(b, e.target.value)}>
                          <option value={b.status}>{b.status.replace("_", " ")}</option>
                          {options.filter(o => o !== b.status).map(o => (
                            <option key={o} value={o}>{o.replace("_", " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{fontSize:"var(--font-size-xs)",color:"var(--color-text-muted)"}}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showWalkIn && (
        <WalkInModal
          onClose={() => setShowWalkIn(false)}
          onSaved={() => { setShowWalkIn(false); setPage(1); load(1); }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bk-pagination">
          <p className="bk-pagination-info">
            Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} of {total}
          </p>
          <div className="bk-pagination-controls">
            <button
              className="bk-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >← Prev</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…"
                  ? <span key={`ellipsis-${i}`} className="bk-page-ellipsis">…</span>
                  : <button key={p}
                      className={`bk-page-btn${p === page ? " bk-page-btn--active" : ""}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
              )
            }

            <button
              className="bk-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}