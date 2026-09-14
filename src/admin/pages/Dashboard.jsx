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

// ── Dashboard Skeleton ────────────────────────────────────────────
function SkeletonPulse({ w = "100%", h = 16, r = 6, mb = 0 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        marginBottom: mb,
        background:
          "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
        backgroundSize: "800px 100%",
        animation: "dashShimmer 1.4s ease-in-out infinite",
      }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="dash">
      {/* Header */}
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonPulse w={220} h={28} r={8} />
          <SkeletonPulse w={160} h={14} r={6} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-grid" style={{ marginBottom: 32 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="dash-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              opacity: 1 - i * 0.06,
            }}
          >
            <SkeletonPulse w={60} h={32} r={6} />
            <SkeletonPulse w="70%" h={14} r={6} />
            <SkeletonPulse w="40%" h={11} r={4} />
          </div>
        ))}
      </div>

      {/* Recent bookings table */}
      <div style={{ marginBottom: 8 }}>
        <SkeletonPulse w={140} h={16} r={6} mb={16} />
      </div>
      <div className="admin-card" style={{ overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 16,
            padding: "12px 16px",
            borderBottom: "1px solid #f3f4f6",
            background: "#f9fafb",
          }}
        >
          {["Patient", "Service", "Date", "Time", "Branch", "Status"].map(
            (col) => (
              <SkeletonPulse key={col} w="70%" h={11} r={4} />
            ),
          )}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              gap: 16,
              padding: "14px 16px",
              borderBottom: i < 5 ? "1px solid #f9fafb" : "none",
              opacity: 1 - i * 0.1,
            }}
          >
            <SkeletonPulse w="85%" h={13} r={4} />
            <SkeletonPulse w="75%" h={13} r={4} />
            <SkeletonPulse w="65%" h={13} r={4} />
            <SkeletonPulse w="50%" h={13} r={4} />
            <SkeletonPulse w="80%" h={13} r={4} />
            <SkeletonPulse w={60} h={22} r={99} />
          </div>
        ))}
      </div>
    </div>
  );
}

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

  if (loading) return <DashboardSkeleton />;

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
