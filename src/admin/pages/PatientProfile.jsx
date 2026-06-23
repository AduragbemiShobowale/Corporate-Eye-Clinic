import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./PatientProfile.css";

function calcAge(dob) {
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

const EMPTY_ENTRY = {
  chief_complaint: "",
  complaint: "",
  social_history: "",
  allergy: "",
  medication: "",
  medical_history: "",
  family_ocular_history: "",
  family_medical_history: "",
  va_re: "",
  va_le: "",
  ar_re: "",
  ar_le: "",
  cyclo_re: "",
  cyclo_le: "",
  subj_re: "",
  subj_le: "",
  add_re: "",
  add_le: "",
  iop_re: "",
  iop_le: "",
  comment: "",
};

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="pp-field">
      <p className="pp-field-label">{label}</p>
      <p className="pp-field-value">{value}</p>
    </div>
  );
}

function EyeRow({ label, re, le }) {
  if (!re && !le) return null;
  return (
    <tr>
      <td className="pp-rx-label">{label}</td>
      <td>{re || "—"}</td>
      <td>{le || "—"}</td>
    </tr>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isSuperAdmin } = useAdminAuth();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [entry, setEntry] = useState({ ...EMPTY_ENTRY });
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: pat }, { data: recs }, { data: profs }] = await Promise.all([
      supabase.from("patients").select("*").eq("id", id).single(),
      supabase
        .from("patient_records")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, role"),
    ]);
    setPatient(pat);
    setRecords(recs || []);
    // Build a map of auth user id → display name for the audit trail
    const map = {};
    (profs || []).forEach((p) => {
      map[p.id] = p.full_name;
    });
    setDoctorMap(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  function set(k, v) {
    setEntry((e) => ({ ...e, [k]: v }));
  }

  async function handleAddEntry() {
    setSaving(true);
    const payload = { ...entry, patient_id: id };
    const bookingId = params.get("booking");
    if (bookingId) payload.booking_id = bookingId;
    // Remove empty strings
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") delete payload[k];
    });
    const { error } = await supabase.from("patient_records").insert([payload]);
    setSaving(false);
    if (error) {
      alert("Error saving entry: " + error.message);
      return;
    }
    setEntry({ ...EMPTY_ENTRY });
    setShowForm(false);
    load();
  }

  if (loading)
    return (
      <div className="admin-empty">
        <p className="admin-empty-body">Loading patient record…</p>
      </div>
    );
  if (!patient)
    return (
      <div className="admin-empty">
        <p className="admin-empty-title">Patient not found.</p>
      </div>
    );

  return (
    <div className="pp">
      {/* Back */}
      <button className="pp-back" onClick={() => navigate("/admin/patients")}>
        ← Back to search
      </button>

      {/* Patient header */}
      <div className="pp-header">
        <div className="pp-avatar">
          {patient.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="pp-header-info">
          <p className="pp-serial">{patient.serial_no}</p>
          <h1 className="pp-name">{patient.name}</h1>
          <div className="pp-meta-row">
            <span>{calcAge(patient.date_of_birth)} years old</span>
            <span>·</span>
            <span>{patient.gender}</span>
            <span>·</span>
            <span>
              DOB:{" "}
              {new Date(patient.date_of_birth).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span>{patient.branch}</span>
          </div>
        </div>
        <button
          className="admin-btn admin-btn--primary pp-add-btn"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cancel" : "+ Add consultation entry"}
        </button>
      </div>

      {/* New entry form */}
      {showForm && (
        <div className="pp-entry-form admin-card">
          <p className="pp-entry-form-title">New consultation entry</p>
          <p className="pp-entry-form-sub">
            All fields are optional — fill in what's relevant to today's visit.
          </p>

          <div className="pp-form-sections">
            {/* History */}
            <div className="pp-form-section">
              <p className="pp-form-section-title">History</p>
              <div className="pp-form-grid">
                {[
                  ["chief_complaint", "Chief Complaint"],
                  ["complaint", "Complaint"],
                  ["social_history", "Social History"],
                  ["allergy", "Allergy"],
                  ["medication", "Medication"],
                  ["medical_history", "Medical History"],
                  ["family_ocular_history", "Family Ocular History"],
                  ["family_medical_history", "Family Medical History"],
                ].map(([k, label]) => (
                  <div key={k} className="pp-form-field">
                    <label className="pp-form-label">{label}</label>
                    <textarea
                      className="pp-form-input pp-form-textarea"
                      rows={2}
                      value={entry[k]}
                      onChange={(e) => set(k, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Measurements */}
            <div className="pp-form-section">
              <p className="pp-form-section-title">Measurements</p>
              <p className="pp-form-meas-hint">
                Only numbers, +, −, and . are accepted in these fields.
              </p>
              <div className="pp-form-grid pp-form-grid--4">
                {[
                  ["va_re", "Visual Acuity RE"],
                  ["va_le", "Visual Acuity LE"],
                  ["ar_re", "Auto Refraction RE"],
                  ["ar_le", "Auto Refraction LE"],
                  ["cyclo_re", "Cycloplegic RE"],
                  ["cyclo_le", "Cycloplegic LE"],
                  ["subj_re", "Subjective RE"],
                  ["subj_le", "Subjective LE"],
                  ["add_re", "ADD Reading RE"],
                  ["add_le", "ADD Reading LE"],
                  ["iop_re", "IOP RE"],
                  ["iop_le", "IOP LE"],
                ].map(([k, label]) => (
                  <div key={k} className="pp-form-field">
                    <label className="pp-form-label">{label}</label>
                    <input
                      className="pp-form-input"
                      value={entry[k]}
                      onChange={(e) => {
                        // Only allow digits, +, -, . and /
                        const cleaned = e.target.value.replace(
                          /[^0-9+\-./]/g,
                          "",
                        );
                        set(k, cleaned);
                      }}
                      placeholder="e.g. 6/6"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="pp-form-section">
              <p className="pp-form-section-title">
                Doctor's notes / prescription
              </p>
              <textarea
                className="pp-form-input pp-form-textarea pp-form-textarea--lg"
                rows={4}
                value={entry.comment}
                onChange={(e) => set("comment", e.target.value)}
                placeholder="Prescriptions, referrals, follow-up instructions…"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              marginTop: "var(--space-6)",
            }}
          >
            <button
              className="admin-btn admin-btn--ghost"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleAddEntry}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </div>
        </div>
      )}

      {/* Consultation log */}
      <div className="pp-log-header">
        <p className="pp-log-title">Consultation history</p>
        <span className="pp-log-count">
          {records.length} {records.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="admin-card admin-empty">
          <p className="admin-empty-title">No consultations recorded yet.</p>
          <p className="admin-empty-body">
            Click "Add consultation entry" to record the first visit.
          </p>
        </div>
      ) : (
        <div className="pp-entries">
          {records.map((r, i) => (
            <div key={r.id} className="admin-card pp-entry">
              <div className="pp-entry-header">
                <div>
                  <p className="pp-entry-date">
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(r.created_at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="pp-entry-branch">
                    {r.branch}
                    {r.created_by && doctorMap[r.created_by] && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="pp-entry-doctor">
                          👨‍⚕️ {doctorMap[r.created_by]}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <span className="pp-entry-num">Entry {records.length - i}</span>
              </div>

              {/* History fields */}
              <div className="pp-entry-section">
                <Field label="Chief Complaint" value={r.chief_complaint} />
                <Field label="Complaint" value={r.complaint} />
                <Field label="Allergy" value={r.allergy} />
                <Field label="Medication" value={r.medication} />
                <Field label="Medical History" value={r.medical_history} />
                <Field label="Social History" value={r.social_history} />
                <Field
                  label="Family Ocular History"
                  value={r.family_ocular_history}
                />
                <Field
                  label="Family Medical History"
                  value={r.family_medical_history}
                />
              </div>

              {/* Measurements table */}
              {(r.va_re ||
                r.va_le ||
                r.ar_re ||
                r.cyclo_re ||
                r.subj_re ||
                r.add_re ||
                r.iop_re) && (
                <div className="pp-rx-wrap">
                  <p className="pp-rx-title">Measurements</p>
                  <table className="pp-rx-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Right Eye (RE)</th>
                        <th>Left Eye (LE)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <EyeRow label="Visual Acuity" re={r.va_re} le={r.va_le} />
                      <EyeRow
                        label="Auto Refraction"
                        re={r.ar_re}
                        le={r.ar_le}
                      />
                      <EyeRow
                        label="Cycloplegic Refraction"
                        re={r.cyclo_re}
                        le={r.cyclo_le}
                      />
                      <EyeRow
                        label="Subjective Refraction"
                        re={r.subj_re}
                        le={r.subj_le}
                      />
                      <EyeRow label="ADD Reading" re={r.add_re} le={r.add_le} />
                      <EyeRow label="IOP" re={r.iop_re} le={r.iop_le} />
                    </tbody>
                  </table>
                </div>
              )}

              {r.comment && (
                <div className="pp-comment">
                  <p className="pp-comment-label">Doctor's notes</p>
                  <p className="pp-comment-text">{r.comment}</p>
                </div>
              )}

              {r.booking_name_mismatch && (
                <p className="pp-mismatch-warn">
                  ⚠️ Name mismatch detected — booking name may differ from
                  patient registration.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
