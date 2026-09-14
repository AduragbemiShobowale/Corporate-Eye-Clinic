import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import TableSkeleton from "./TableSkeleton";
import "./TablePage.css";

export default function PatientDirectory() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sex, setSex] = useState("All");

  useEffect(() => {
    supabase
      .from("patients")
      .select("id, serial_no, name, gender, date_of_birth, email")
      .order("serial_no", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Patient Directory error:", error);
          setError(error.message);
        } else {
          setPatients(data || []);
        }
        setLoading(false);
      });
  }, []);

  function calcAge(dob) {
    if (!dob) return null;
    return Math.floor(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    );
  }

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.serial_no?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q);
    const matchSex = sex === "All" || p.gender === sex;
    return matchSearch && matchSex;
  });

  const hasSearch = search.trim().length > 0;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Patient Directory</h1>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
              margin: "4px 0 0",
            }}
          >
            {patients.length} registered patient
            {patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => navigate("/admin/patients")}
        >
          + New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="tp-filters" style={{ marginBottom: "var(--space-4)" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <svg
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="admin-select"
            style={{ paddingLeft: 36, width: "100%", boxSizing: "border-box" }}
            placeholder="Search by name, email or medical no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          value={sex}
          onChange={(e) => setSex(e.target.value)}
        >
          <option value="All">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="admin-card">
        {loading ? (
          <TableSkeleton cols={8} rows={6} />
        ) : error ? (
          <div className="admin-empty">
            <p className="admin-empty-title">Could not load patients</p>
            <p
              className="admin-empty-body"
              style={{ color: "var(--teal-700)", fontSize: 12 }}
            >
              {error}
            </p>
          </div>
        ) : patients.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">No patients registered yet</p>
            <p className="admin-empty-body">
              Create a patient record from the Patient Records page.
            </p>
            <button
              className="admin-btn admin-btn--primary"
              style={{ marginTop: "var(--space-4)" }}
              onClick={() => navigate("/admin/patients")}
            >
              Go to Patient Records
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">
              No patient found{hasSearch ? ` for "${search}"` : ""}
            </p>
            <p className="admin-empty-body">
              {hasSearch
                ? "This patient may not have a record yet."
                : "No patients match the selected filter."}
            </p>
            {hasSearch && (
              <button
                className="admin-btn admin-btn--primary"
                style={{ marginTop: "var(--space-4)" }}
                onClick={() => navigate("/admin/patients")}
              >
                + Create new patient record
              </button>
            )}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Medical No.</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Date of Birth</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/admin/patients/${p.id}`)}
                  title="Click to view full record"
                >
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "var(--navy-800)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      {p.serial_no || "—"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.gender || "—"}</td>
                  <td>
                    {calcAge(p.date_of_birth) !== null
                      ? `${calcAge(p.date_of_birth)} yrs`
                      : "—"}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {p.date_of_birth
                        ? new Date(p.date_of_birth).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </span>
                  </td>
                  <td
                    style={{
                      color: p.email ? "inherit" : "var(--color-text-muted)",
                      fontStyle: p.email ? "normal" : "italic",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {p.email || "Not provided"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
