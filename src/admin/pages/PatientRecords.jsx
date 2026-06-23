import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./PatientRecords.css";

function calcAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientRecords() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAdminAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("name") || "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    gender: "",
    date_of_birth: "",
  });
  const [newErrors, setNewErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const isSerial = /^CEC-/i.test(q.trim());
    let qb = supabase
      .from("patients")
      .select("id, serial_no, name, gender, date_of_birth, branch, created_at");
    if (isSerial) {
      qb = qb.ilike("serial_no", `%${q.trim()}%`);
    } else {
      qb = qb.ilike("name", `%${q.trim()}%`);
    }
    const { data } = await qb.order("name").limit(20);
    setResults(data || []);
    setSearching(false);
  }, []);

  // Live search with debounce
  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  // Auto-search if arrived from appointments page with a name
  useEffect(() => {
    if (params.get("name")) search(params.get("name"));
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
      alert("Error: " + error.message);
      return;
    }
    setShowNew(false);
    setNewForm({ name: "", gender: "", date_of_birth: "" });
    navigate(`/admin/patients/${data.id}`);
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Patient Records</h1>
          <p className="admin-page-subtitle">
            Search by patient name or serial number (e.g. CEC-0001).
          </p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowNew(true)}
        >
          + New patient
        </button>
      </div>

      {/* Search */}
      <div className="pr-search-wrap">
        <span className="pr-search-icon">🔍</span>
        <input
          className="pr-search"
          placeholder="Search by name or serial number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {searching && <span className="pr-searching">Searching…</span>}
      </div>

      {/* Results */}
      {query.trim() && !searching && (
        <div className="pr-results">
          {results.length === 0 ? (
            <div className="admin-card admin-empty">
              <p className="admin-empty-title">
                No patients found for "{query}".
              </p>
              <p className="admin-empty-body">
                If this is a new patient, click "+ New patient" to register
                them.
              </p>
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                className="pr-result-card"
                onClick={() => navigate(`/admin/patients/${p.id}`)}
              >
                <div className="pr-result-serial">{p.serial_no}</div>
                <div className="pr-result-main">
                  <p className="pr-result-name">{p.name}</p>
                  <p className="pr-result-meta">
                    {calcAge(p.date_of_birth)} yrs &middot; {p.gender}
                    {p.branch && <> &middot; {p.branch}</>}
                  </p>
                </div>
                <span className="pr-result-arrow">View →</span>
              </div>
            ))
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="pr-empty-state">
          <p className="pr-empty-icon">👁</p>
          <p className="pr-empty-title">Search for a patient</p>
          <p className="pr-empty-body">
            Type a patient's name or serial number above to pull up their
            records.
          </p>
        </div>
      )}

      {/* New patient modal */}
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
              A serial number (CEC-XXXX) will be assigned automatically.
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
