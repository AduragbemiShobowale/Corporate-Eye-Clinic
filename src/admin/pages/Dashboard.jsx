import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./Dashboard.css";

const BRANCH_TO_LOCATION = {
  "Head Office — Bodija": "Royal Mall, Bodija, Ibadan",
  "Oluyole Branch": "Alaafin Avenue, Oluyole Estate, Ibadan",
  "New Bodija Branch": "3B Aare Avenue, New Bodija, Ibadan",
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`dash-card${accent ? " dash-card--accent" : ""}`}>
      <p className="dash-card-value">{value ?? "—"}</p>
      <p className="dash-card-label">{label}</p>
      {sub && <p className="dash-card-sub">{sub}</p>}
    </div>
  );
}

const STATUS_BADGE = {
  upcoming: "admin-badge--upcoming",
  completed: "admin-badge--completed",
  "no-show": "admin-badge--no-show",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled: "admin-badge--cancelled",
};

export default function Dashboard() {
  const { isSuperAdmin, profile } = useAdminAuth();
  const today = new Date().toISOString().split("T")[0];

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const todayBase = supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("date", today)
        .eq("status", "upcoming");

      if (!isSuperAdmin && profile?.branch) {
        todayBase.eq(
          "location",
          BRANCH_TO_LOCATION[profile.branch] || profile.branch,
        );
      }

      const [
        { count: todayBookings },
        { count: pendingOrders },
        { count: pendingRx },
        { count: lowStock },
        { count: pendingApprovals },
        { data: recentBookings },
      ] = await Promise.all([
        todayBase,
        supabase
          .from("shop_orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("prescription_orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .lte("stock_qty", 3),
        isSuperAdmin
          ? Promise.all([
              supabase
                .from("bookings")
                .select("*", { count: "exact", head: true })
                .eq("status", "cancellation_pending"),
              supabase
                .from("shop_orders")
                .select("*", { count: "exact", head: true })
                .eq("status", "cancellation_pending"),
              supabase
                .from("prescription_orders")
                .select("*", { count: "exact", head: true })
                .eq("status", "cancellation_pending"),
            ]).then(([b, s, p]) => ({
              count: (b.count || 0) + (s.count || 0) + (p.count || 0),
            }))
          : { count: 0 },
        supabase
          .from("bookings")
          .select("id, name, service, date, time_slot, location, status")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      setStats({
        todayBookings,
        pendingOrders,
        pendingRx,
        lowStock,
        pendingApprovals,
      });
      setRecent(recentBookings || []);
      setLoading(false);
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading)
    return (
      <div className="admin-empty">
        <p className="admin-empty-body">Loading dashboard…</p>
      </div>
    );

  return (
    <div className="dash">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {greeting()}, {profile?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="admin-page-subtitle">
            Here's what's happening at the clinic today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-grid">
        <StatCard
          label="Today's bookings"
          value={stats.todayBookings}
          sub={!isSuperAdmin ? profile?.branch : "All branches"}
        />
        <StatCard label="Pending shop orders" value={stats.pendingOrders} />
        <StatCard label="Pending prescriptions" value={stats.pendingRx} />
        <StatCard
          label="Low-stock products"
          value={stats.lowStock}
          accent={stats.lowStock > 0}
        />
        {isSuperAdmin && (
          <StatCard
            label="Pending approvals"
            value={stats.pendingApprovals}
            accent={stats.pendingApprovals > 0}
          />
        )}
      </div>

      {/* Recent bookings */}
      <div className="dash-section">
        <p className="dash-section-title">Recent bookings</p>
        <div className="admin-card">
          {recent.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty-body">No bookings yet.</p>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.name}</td>
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
                    <td>
                      <span
                        className={`admin-badge ${STATUS_BADGE[b.status] || ""}`}
                      >
                        {b.status?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
