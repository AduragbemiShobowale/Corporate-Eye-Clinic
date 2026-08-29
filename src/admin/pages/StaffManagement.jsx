import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import "./TablePage.css";
import "./StaffManagement.css";

const SUPABASE_URL  = "https://cacniprnjuwuavhhfowu.supabase.co";
const ANON_KEY      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY25pcHJuanV3dWF2aGhmb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDYwODEsImV4cCI6MjA5NjE4MjA4MX0.UvpRbcH8Wq70tndFNqs9ygEiUXz4lKBd4Nzc-vg3jjg";

const BRANCHES = [
  "Head Office — Bodija",
  "Oluyole Branch",
  "New Bodija Branch",
];

const ROLE_BADGE = {
  super_admin: { label: "Super Admin", color: "#9B2D1F", bg: "#FDF0EE" },
  staff:       { label: "Front Desk",  color: "#1a7a4a", bg: "#e6f9f0" },
  doctor:      { label: "Doctor",      color: "#0D1B3E", bg: "#e8ecf7" },
};

// ── Create Staff Modal ────────────────────────────────────────────
function CreateStaffModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirmPassword: "",
    role: "staff", branch: "Head Office — Bodija",
  });
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.email.trim())     e.email     = "Email is required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleCreate = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
        "apikey": ANON_KEY,
      },
      body: JSON.stringify({
        full_name: form.full_name,
        email:     form.email,
        password:  form.password,
        role:      form.role,
        branch:    form.branch,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) {
      toast.error(data.error || "Failed to create account");
      return;
    }

    toast.success(`Account created for ${form.full_name}`);
    onCreated();
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal sm-create-modal" onClick={e => e.stopPropagation()}>
        <h2 className="admin-modal-title">Create staff account</h2>
        <p className="admin-modal-body">
          The staff member can log in immediately with these credentials.
        </p>

        <div className="sm-form">
          {/* Full name */}
          <div className="sm-field">
            <label>Full name</label>
            <input className={`admin-input${errors.full_name ? " err" : ""}`}
              placeholder="e.g. Amina Bello"
              value={form.full_name}
              onChange={e => set("full_name", e.target.value)} />
            {errors.full_name && <p className="sm-err">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div className="sm-field">
            <label>Email address</label>
            <input className={`admin-input${errors.email ? " err" : ""}`}
              type="email" placeholder="staff@example.com"
              value={form.email}
              onChange={e => set("email", e.target.value)} />
            {errors.email && <p className="sm-err">{errors.email}</p>}
          </div>

          {/* Role + Branch */}
          <div className="sm-row">
            <div className="sm-field">
              <label>Role</label>
              <select className="admin-select" value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="staff">Front Desk</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="sm-field">
              <label>Branch</label>
              <select className="admin-select" value={form.branch} onChange={e => set("branch", e.target.value)}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="sm-field">
            <label>Initial password</label>
            <div className="sm-pass-wrap">
              <input
                className={`admin-input${errors.password ? " err" : ""}`}
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => set("password", e.target.value)} />
              <button type="button" className="sm-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && <p className="sm-err">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="sm-field">
            <label>Confirm password</label>
            <input
              className={`admin-input${errors.confirmPassword ? " err" : ""}`}
              type={showPass ? "text" : "password"}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={e => set("confirmPassword", e.target.value)} />
            {errors.confirmPassword && <p className="sm-err">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="admin-btn admin-btn--primary" onClick={handleCreate} disabled={saving}>
            {saving ? "Creating…" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────────────
function ResetPasswordModal({ staff, onClose }) {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const handleReset = async () => {
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }

    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
        "apikey": ANON_KEY,
      },
      body: JSON.stringify({ userId: staff.id, newPassword: password }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok || data.error) { toast.error(data.error || "Reset failed"); return; }
    toast.success(`Password reset for ${staff.full_name}`);
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h2 className="admin-modal-title">Reset password</h2>
        <p className="admin-modal-body">
          Setting a new password for <strong>{staff.full_name}</strong>.
          They will need to use this password on their next login.
        </p>

        <div className="sm-form">
          <div className="sm-field">
            <label>New password</label>
            <div className="sm-pass-wrap">
              <input
                className="admin-input"
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)} />
              <button type="button" className="sm-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <div className="sm-field">
            <label>Confirm password</label>
            <input
              className="admin-input"
              type={showPass ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)} />
          </div>
        </div>

        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={handleReset} disabled={saving}>
            {saving ? "Resetting…" : "Reset password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function StaffManagement() {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, branch, created_at")
      .order("created_at", { ascending: true });
    setStaff(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Staff Management</h1>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowCreate(true)}>
          + Create account
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p style={{ padding:"var(--space-6)", color:"var(--color-text-muted)" }}>Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => {
                const badge = ROLE_BADGE[s.role] || ROLE_BADGE.staff;
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                    <td>
                      <span style={{
                        display:"inline-block", padding:"3px 10px",
                        borderRadius:999, fontSize:12, fontWeight:600,
                        color: badge.color, background: badge.bg,
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:"var(--font-size-sm)", color:"var(--color-text-muted)" }}>
                        {s.branch?.replace(" Branch","").replace(" — Bodija","") || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:"var(--font-size-xs)", color:"var(--color-text-muted)" }}>
                        {new Date(s.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                      </span>
                    </td>
                    <td>
                      {s.role !== "super_admin" && (
                        <button
                          className="admin-btn admin-btn--ghost tp-sm-btn"
                          onClick={() => setResetTarget(s)}>
                          Reset password
                        </button>
                      )}
                      {s.role === "super_admin" && (
                        <span style={{ fontSize:"var(--font-size-xs)", color:"var(--color-text-muted)", fontStyle:"italic" }}>
                          Super admin
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          staff={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}