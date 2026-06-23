import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./TablePage.css";

const ROLE_BADGE = {
  super_admin: { label: "Super Admin", cls: "admin-badge--upcoming" },
  staff: { label: "Staff", cls: "admin-badge--fulfilled" },
  doctor: { label: "Doctor", cls: "admin-badge--processing" },
};

export default function StaffDirectory() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("role")
      .order("full_name")
      .then(({ data }) => {
        setStaff(data || []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="admin-empty">
        <p className="admin-empty-body">Loading…</p>
      </div>
    );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Staff Directory</h1>
          <p className="admin-page-subtitle">
            All admin portal users. To add or remove staff, use Supabase →
            Authentication → Users, then insert or delete their row in the
            profiles table.
          </p>
        </div>
      </div>

      <div className="admin-card">
        {staff.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-body">No staff profiles found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Member since</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => {
                const badge = ROLE_BADGE[s.role] || { label: s.role, cls: "" };
                return (
                  <tr key={s.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "var(--navy-800)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 700,
                            color: "var(--white)",
                            flexShrink: 0,
                          }}
                        >
                          {s.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{s.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      {s.branch || "All branches"}
                    </td>
                    <td
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      {new Date(s.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
