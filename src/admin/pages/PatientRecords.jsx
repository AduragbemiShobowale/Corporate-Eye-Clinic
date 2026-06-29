import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PatientRecords.css";

function calcAge(dob) {
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

const GENDER_ICON = { Male: "👨", Female: "👩", Other: "🧑" };

export default function PatientRecords() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [query, setQuery] = useState(params.get("name") || "");
  const [all, setAll] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    gender: "",
    date_of_birth: "",
  });
  const [newErrors, setNewErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAll(data || []);
        setResults(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(all);
      return;
    }
    const q = query.trim().toLowerCase();
    setResults(
      all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.serial_no.toLowerCase().includes(q),
      ),
    );
  }, [query, all]);

  useEffect(() => {
    if (params.get("name")) setQuery(params.get("name"));
  }, []);

  function validateNew() {
    const e = {};
    if (!newForm.name.trim()) e.name = "Full name is required.";
    if (!newForm.gender) e.gender = "Please select gender.";
    if (!newForm.date_of_birth) e.date_of_birth = "Date of birth is required.";
    return e;
  }

  async function handleRegister() {
    const e = validateNew();
    if (Object.keys(e).length) {
      setNewErrors(e);
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("patients")
      .insert([
        {
          name: newForm.name.trim(),
          gender: newForm.gender,
          date_of_birth: newForm.date_of_birth,
        },
      ])
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error?.message || "Something went wrong");
      return;
    }
    setShowNew(false);
    setNewForm({ name: "", gender: "", date_of_birth: "" });
    navigate(`/admin/patients/${data.id}`);
  }

  return (
    <div className="pr-page">
      {/* ── Hero ── */}
      <div className="pr-hero">
        <div className="pr-ring pr-ring--1" />
        <div className="pr-ring pr-ring--2" />
        <div className="pr-ring pr-ring--3" />
        <svg className="pr-hero-eye" viewBox="0 0 100 50" fill="none">
          <path
            d="M5 25 C20 5,80 5,95 25 C80 45,20 45,5 25Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
          />
          <circle
            cx="50"
            cy="25"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <circle cx="50" cy="25" r="4" fill="currentColor" opacity="0.2" />
        </svg>
        <div className="pr-hero-content">
          <div>
            <h1 className="pr-hero-title">Patient Records</h1>
            <p className="pr-hero-sub">
              {loading
                ? "Loading…"
                : `${all.length} patient${all.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>
          <button className="pr-new-btn" onClick={() => setShowNew(true)}>
            + New patient
          </button>
        </div>
      </div>

      {/* ── Floating search bar — sits between hero and body ── */}
      <div className="pr-search-float">
        <div className="pr-search-wrap">
          <span className="pr-search-icon">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="pr-search"
            placeholder="Search by name or serial number (e.g. CEC-0001)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="pr-search-clear" onClick={() => setQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Patient list ── */}
      <div className="pr-body">
        {loading ? (
          <div className="pr-loading">
            <div className="pr-loading-spinner" />
            <p>Loading patients…</p>
          </div>
        ) : results.length === 0 ? (
          <div className="pr-empty">
            <p className="pr-empty-title">
              {query
                ? `No patients match "${query}"`
                : "No patients registered yet."}
            </p>
            <p className="pr-empty-body">
              {query
                ? "Try a different name or serial number."
                : 'Click "+ New patient" to get started.'}
            </p>
          </div>
        ) : (
          <>
            {query && (
              <p className="pr-result-count">
                {results.length} result{results.length !== 1 ? "s" : ""} for "
                {query}"
              </p>
            )}
            <div className="pr-grid">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="pr-card"
                  onClick={() => navigate(`/admin/patients/${p.id}`)}
                >
                  <div className="pr-card-avatar">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="pr-card-body">
                    <div className="pr-card-top">
                      <p className="pr-card-name">{p.name}</p>
                      <span className="pr-card-serial">{p.serial_no}</span>
                    </div>
                    <p className="pr-card-meta">
                      {GENDER_ICON[p.gender] || "🧑"} {p.gender} ·{" "}
                      {calcAge(p.date_of_birth)} yrs
                      {p.branch && (
                        <>
                          {" "}
                          ·{" "}
                          <span className="pr-card-branch">
                            {p.branch
                              .replace(" Branch", "")
                              .replace(" — Bodija", "")}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="pr-card-dob">
                      DOB:{" "}
                      {new Date(p.date_of_birth).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="pr-card-arrow">→</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── New patient modal ── */}
      {showNew && (
        <div className="admin-modal-backdrop" onClick={() => setShowNew(false)}>
          <div
            className="admin-modal pr-new-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="admin-modal-title">Register new patient</h2>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-muted)",
                marginBottom: "var(--space-5)",
              }}
            >
              A serial number (CEC-XXXX) is assigned automatically.
            </p>
            <div className="pr-form">
              <div className="pr-field">
                <label className="pr-label">Full name</label>
                <input
                  className={`prod-input${newErrors.name ? " prod-input--err" : ""}`}
                  value={newForm.name}
                  onChange={(e) => {
                    setNewForm((f) => ({ ...f, name: e.target.value }));
                    if (newErrors.name)
                      setNewErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Patient's full name"
                />
                {newErrors.name && (
                  <span className="prod-err">{newErrors.name}</span>
                )}
              </div>
              <div className="pr-row">
                <div className="pr-field">
                  <label className="pr-label">Gender</label>
                  <select
                    className={`prod-input admin-select${newErrors.gender ? " prod-input--err" : ""}`}
                    value={newForm.gender}
                    onChange={(e) => {
                      setNewForm((f) => ({ ...f, gender: e.target.value }));
                      if (newErrors.gender)
                        setNewErrors((p) => ({ ...p, gender: "" }));
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {newErrors.gender && (
                    <span className="prod-err">{newErrors.gender}</span>
                  )}
                </div>
                <div className="pr-field">
                  <label className="pr-label">Date of birth</label>
                  <input
                    type="date"
                    className={`prod-input${newErrors.date_of_birth ? " prod-input--err" : ""}`}
                    value={newForm.date_of_birth}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setNewForm((f) => ({
                        ...f,
                        date_of_birth: e.target.value,
                      }));
                      if (newErrors.date_of_birth)
                        setNewErrors((p) => ({ ...p, date_of_birth: "" }));
                    }}
                  />
                  {newErrors.date_of_birth && (
                    <span className="prod-err">{newErrors.date_of_birth}</span>
                  )}
                </div>
              </div>
            </div>
            <div
              className="admin-modal-actions"
              style={{ marginTop: "var(--space-6)" }}
            >
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => setShowNew(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleRegister}
                disabled={saving}
              >
                {saving ? "Registering…" : "Register patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
