import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./TablePage.css";
import "./PatientDirectory.css";

const BRANCHES = [
  { label: "All branches",       value: "All" },
  { label: "Head Office — Bodija", value: "Head Office — Bodija" },
  { label: "Oluyole Branch",     value: "Oluyole Branch" },
  { label: "New Bodija Branch",  value: "New Bodija Branch" },
];

export default function PatientDirectory() {
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [branch, setBranch]       = useState("All");
  const [sexFilter, setSexFilter] = useState("All");

  useEffect(() => {
    supabase
      .from("patients")
      .select("id, serial_number, name, gender, phone, email, branch, date_of_birth, created_at")
      .order("serial_number", { ascending: true })
      .then(({ data }) => {
        setPatients(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = patients.filter(p => {
    const matchSearch = !search.trim() ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.serial_number?.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branch === "All" || p.branch === branch;
    const matchSex    = sexFilter === "All" || p.gender === sexFilter;
    return matchSearch && matchBranch && matchSex;
  });

  return (
    <div className="admin-page">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Patient Directory</h1>
          <p className="admin-page-sub">
            {patients.length} registered patient{patients.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="tp-filters" style={{ marginBottom: "var(--space-4)" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--color-text-muted)" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="admin-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search name, phone, email, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="admin-select" value={branch} onChange={e => setBranch(e.target.value)}>
          {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>

        <select className="admin-select" value={sexFilter} onChange={e => setSexFilter(e.target.value)}>
          <option value="All">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Results count */}
      {search && (
        <p style={{ fontSize:"var(--font-size-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-3)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<strong>{search}</strong>"
        </p>
      )}

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <p style={{ padding:"var(--space-6)", color:"var(--color-text-muted)" }}>Loading patients…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding:"var(--space-6)", color:"var(--color-text-muted)" }}>No patients found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Medical No.</th>
                <th>Name</th>
                <th>Sex</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Date of Birth</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontFamily:"monospace", fontWeight:600, color:"var(--navy-800)", fontSize:"var(--font-size-sm)" }}>
                      {p.serial_number || "—"}
                    </span>
                  </td>
                  <td style={{ fontWeight:500 }}>{p.name}</td>
                  <td>{p.gender || "—"}</td>
                  <td>{p.phone || "—"}</td>
                  <td>{p.email || <span style={{ color:"var(--color-text-muted)", fontStyle:"italic" }}>Not provided</span>}</td>
                  <td>
                    <span style={{ fontSize:"var(--font-size-xs)", color:"var(--color-text-muted)" }}>
                      {p.branch?.replace(" Branch","").replace(" — Bodija","") || "—"}
                    </span>
                  </td>
                  <td>
                    {p.date_of_birth
                      ? new Date(p.date_of_birth).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
                      : "—"}
                  </td>
                  <td>
                    <span style={{ fontSize:"var(--font-size-xs)", color:"var(--color-text-muted)" }}>
                      {new Date(p.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                    </span>
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