import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import "./StaffManagement.css";

export default function ChangePassword() {
  const [form, setForm]     = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleChange = async () => {
    if (!form.current)          { toast.error("Enter your current password"); return; }
    if (form.newPass.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (form.newPass !== form.confirm) { toast.error("Passwords do not match"); return; }

    setSaving(true);

    // Re-authenticate with current password first
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: form.current,
    });

    if (signInError) {
      setSaving(false);
      toast.error("Current password is incorrect");
      return;
    }

    // Update password
    const { error } = await supabase.auth.updateUser({ password: form.newPass });
    setSaving(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Password changed successfully");
    setForm({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Change Password</h1>
      </div>

      <div className="admin-card" style={{ maxWidth: 480, padding: "var(--space-6)" }}>
        <div className="sm-form">

          <div className="sm-field">
            <label>Current password</label>
            <div className="sm-pass-wrap">
              <input
                className="admin-input"
                type={showPass ? "text" : "password"}
                placeholder="Your current password"
                value={form.current}
                onChange={e => set("current", e.target.value)} />
              <button type="button" className="sm-eye" onClick={() => setShowPass(p => !p)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="sm-field">
            <label>New password</label>
            <input
              className="admin-input"
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={form.newPass}
              onChange={e => set("newPass", e.target.value)} />
          </div>

          <div className="sm-field">
            <label>Confirm new password</label>
            <input
              className="admin-input"
              type={showPass ? "text" : "password"}
              placeholder="Re-enter new password"
              value={form.confirm}
              onChange={e => set("confirm", e.target.value)} />
          </div>

          <button
            className="admin-btn admin-btn--primary"
            onClick={handleChange}
            disabled={saving}
            style={{ alignSelf: "flex-start" }}>
            {saving ? "Saving…" : "Change password"}
          </button>
        </div>
      </div>
    </div>
  );
}