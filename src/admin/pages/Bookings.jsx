import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./TablePage.css";

const BRANCHES = [
  "All",
  "Head Office — Bodija",
  "Oluyole Branch",
  "New Bodija Branch",
];
const STATUSES = [
  "All",
  "upcoming",
  "completed",
  "no-show",
  "cancellation_pending",
  "cancelled",
];

const BADGE = {
  upcoming: "admin-badge--upcoming",
  completed: "admin-badge--completed",
  "no-show": "admin-badge--no-show",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled: "admin-badge--cancelled",
};

// Status transitions available per role
function nextStatuses(current, isSuperAdmin) {
  if (isSuperAdmin && current === "cancellation_pending") return ["cancelled"];
  if (!isSuperAdmin && current === "cancellation_pending") return [];
  if (current === "cancelled") return [];
  const base = ["upcoming", "completed", "no-show"];
  if (isSuperAdmin) return [...base, "cancelled"];
  return [...base, "cancellation_pending"];
}

export default function Bookings() {
  const { isSuperAdmin } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState("All");
  const [status, setStatus] = useState("All");
  const [updating, setUpdating] = useState(null);

  async function load() {
    let q = supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: false })
      .order("time_slot");
    if (branch !== "All") q = q.eq("location", branch);
    if (status !== "All") q = q.eq("status", status);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [branch, status]);

  async function updateStatus(booking, newStatus) {
    setUpdating(booking.id);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);
    if (error) alert("Error: " + error.message);
    setUpdating(null);
    load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bookings</h1>
          <p className="admin-page-subtitle">
            View and manage patient appointments across all branches.
          </p>
        </div>
      </div>

      <div className="tp-filters">
        <select
          className="admin-select"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All statuses" : s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">
            <p className="admin-empty-body">Loading bookings…</p>
          </div>
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
              {bookings.map((b) => {
                const options = nextStatuses(b.status, isSuperAdmin);
                return (
                  <tr key={b.id}>
                    <td>
                      <p style={{ fontWeight: 500, margin: 0 }}>{b.name}</p>
                      <p
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                          margin: 0,
                        }}
                      >
                        {b.phone}
                      </p>
                    </td>
                    <td>{b.service}</td>
                    <td>
                      {new Date(b.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{b.time_slot}</td>
                    <td
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {b.location}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {b.booking_type}
                    </td>
                    <td>
                      <span className={`admin-badge ${BADGE[b.status] || ""}`}>
                        {b.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {b.status === "cancellation_pending" && isSuperAdmin ? (
                        <div className="tp-action-btns">
                          <button
                            className="admin-btn admin-btn--danger tp-sm-btn"
                            disabled={updating === b.id}
                            onClick={() => updateStatus(b, "cancelled")}
                          >
                            Approve
                          </button>
                          <button
                            className="admin-btn admin-btn--ghost tp-sm-btn"
                            disabled={updating === b.id}
                            onClick={() =>
                              updateStatus(
                                b,
                                b.pre_cancellation_status || "upcoming",
                              )
                            }
                          >
                            Decline
                          </button>
                        </div>
                      ) : options.length > 0 ? (
                        <select
                          className="admin-select tp-status-select"
                          value={b.status}
                          disabled={updating === b.id}
                          onChange={(e) => updateStatus(b, e.target.value)}
                        >
                          <option value={b.status}>
                            {b.status.replace("_", " ")}
                          </option>
                          {options
                            .filter((o) => o !== b.status)
                            .map((o) => (
                              <option key={o} value={o}>
                                {o.replace("_", " ")}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          —
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
    </div>
  );
}
