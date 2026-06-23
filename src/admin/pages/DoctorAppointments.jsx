import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import "./TablePage.css";

// Maps the profile branch name (stored in profiles table) to the
// short location value (stored in bookings.location from BookingModal)
const BRANCH_TO_LOCATION = {
  "Head Office — Bodija": "Royal Mall, Bodija, Ibadan",
  "Oluyole Branch": "Alaafin Avenue, Oluyole Estate, Ibadan",
  "New Bodija Branch": "3B Aare Avenue, New Bodija, Ibadan",
};

const BADGE = {
  upcoming: "admin-badge--upcoming",
  completed: "admin-badge--completed",
  "no-show": "admin-badge--no-show",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled: "admin-badge--cancelled",
};

export default function DoctorAppointments() {
  const { profile } = useAdminAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState("today");

  useEffect(() => {
    async function load() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dateStr = (day === "today" ? today : tomorrow)
        .toISOString()
        .split("T")[0];

      let q = supabase
        .from("bookings")
        .select(
          "id, name, phone, service, date, time_slot, location, booking_type, status",
        )
        .eq("date", dateStr)
        .order("time_slot");

      const locationValue = BRANCH_TO_LOCATION[profile?.branch];
      if (locationValue) q = q.eq("location", locationValue);

      const { data } = await q;
      setAppts(data || []);
      setLoading(false);
    }
    load();
  }, [day, profile?.branch]);

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowLabel = tomorrowDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">My Appointments</h1>
          <p className="admin-page-subtitle">
            {profile?.branch} — read-only view.
          </p>
        </div>
      </div>

      <div className="tp-filters">
        <button
          className={`admin-btn ${day === "today" ? "admin-btn--primary" : "admin-btn--ghost"}`}
          onClick={() => setDay("today")}
        >
          Today — {todayLabel}
        </button>
        <button
          className={`admin-btn ${day === "tomorrow" ? "admin-btn--primary" : "admin-btn--ghost"}`}
          onClick={() => setDay("tomorrow")}
        >
          Tomorrow — {tomorrowLabel}
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">
            <p className="admin-empty-body">Loading appointments…</p>
          </div>
        ) : appts.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">No appointments {day}.</p>
            <p className="admin-empty-body">
              There are no bookings scheduled at {profile?.branch} {day}.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Type</th>
                <th>Status</th>
                <th>Patient record</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: "var(--navy-800)" }}>
                    {a.time_slot}
                  </td>
                  <td>
                    <p style={{ fontWeight: 500, margin: 0 }}>{a.name}</p>
                    <p
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                        margin: 0,
                      }}
                    >
                      {a.phone}
                    </p>
                  </td>
                  <td>{a.service}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {a.booking_type}
                  </td>
                  <td>
                    <span className={`admin-badge ${BADGE[a.status] || ""}`}>
                      {a.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <button
                      className="tp-expand-btn"
                      onClick={() =>
                        navigate(
                          `/admin/patients?name=${encodeURIComponent(a.name)}&booking=${a.id}`,
                        )
                      }
                    >
                      Open record →
                    </button>
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
