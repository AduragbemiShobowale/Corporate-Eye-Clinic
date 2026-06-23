import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Reporting.css";

const BRANCHES = [
  "Royal Mall, Bodija, Ibadan",
  "Alaafin Avenue, Oluyole Estate, Ibadan",
  "3B Aare Avenue, New Bodija, Ibadan",
];

const BRANCH_SHORT = {
  "Royal Mall, Bodija, Ibadan": "Head Office",
  "Alaafin Avenue, Oluyole Estate, Ibadan": "Oluyole",
  "3B Aare Avenue, New Bodija, Ibadan": "New Bodija",
};

function naira(amount) {
  return "NGN " + (amount || 0).toLocaleString("en-NG");
}

function StatHero({ label, value, sub, accent }) {
  return (
    <div className={`rep-hero-card${accent ? " rep-hero-card--accent" : ""}`}>
      <p className="rep-hero-value">{value}</p>
      <p className="rep-hero-label">{label}</p>
      {sub && <p className="rep-hero-sub">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rep-mini-stat">
      <p className="rep-mini-value">{value}</p>
      <p className="rep-mini-label">{label}</p>
    </div>
  );
}

export default function Reporting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { data: bookings },
        { data: orders },
        { data: rxOrders },
        { data: products },
      ] = await Promise.all([
        supabase.from("bookings").select("location, status"),
        supabase.from("shop_orders").select("paid_total, status"),
        supabase
          .from("prescription_orders")
          .select("order_type, status, location"),
        supabase.from("products").select("stock_qty, price, name"),
      ]);

      const byBranch = {};
      BRANCHES.forEach((b) => {
        const bk = (bookings || []).filter((x) => x.location === b);
        byBranch[b] = {
          total: bk.length,
          upcoming: bk.filter((x) => x.status === "upcoming").length,
          completed: bk.filter((x) => x.status === "completed").length,
          noShow: bk.filter((x) => x.status === "no-show").length,
          cancelled: bk.filter((x) => x.status === "cancelled").length,
        };
      });

      // Revenue only from FULFILLED orders (payment confirmed via Paystack)
      const fulfilledOrders = (orders || []).filter(
        (o) => o.status === "fulfilled",
      );
      const totalRevenue = fulfilledOrders.reduce(
        (s, o) => s + (o.paid_total || 0),
        0,
      );
      const totalOrders = (orders || []).length;
      const pendingOrders = (orders || []).filter(
        (o) => o.status === "pending",
      ).length;

      const totalBookings = (bookings || []).length;
      const totalCompleted = (bookings || []).filter(
        (b) => b.status === "completed",
      ).length;
      const completionRate =
        totalBookings > 0
          ? Math.round((totalCompleted / totalBookings) * 100)
          : 0;

      const rxTotal = (rxOrders || []).length;
      const rxGlasses = (rxOrders || []).filter(
        (r) => r.order_type === "glasses",
      ).length;
      const rxContacts = (rxOrders || []).filter(
        (r) => r.order_type === "contacts",
      ).length;

      const totalProducts = (products || []).length;
      const lowStock = (products || []).filter((p) => p.stock_qty <= 3).length;
      const outOfStock = (products || []).filter(
        (p) => p.stock_qty === 0,
      ).length;

      const maxBranchBookings = Math.max(
        ...BRANCHES.map((b) => byBranch[b].total),
        1,
      );

      setData({
        byBranch,
        totalRevenue,
        totalOrders,
        pendingOrders,
        fulfilledOrders: fulfilledOrders.length,
        totalBookings,
        completionRate,
        rxTotal,
        rxGlasses,
        rxContacts,
        totalProducts,
        lowStock,
        outOfStock,
        maxBranchBookings,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="admin-empty">
        <p className="admin-empty-body">Loading report…</p>
      </div>
    );

  return (
    <div className="rep">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clinic-Wide Reporting</h1>
          <p className="admin-page-subtitle">
            Live aggregate overview across all three branches. Revenue reflects
            confirmed Paystack payments only.
          </p>
        </div>
      </div>

      {/* ── Hero stats ── */}
      <div className="rep-hero-grid">
        <StatHero
          label="Confirmed revenue"
          value={naira(data.totalRevenue)}
          sub={`From ${data.fulfilledOrders} fulfilled order${data.fulfilledOrders !== 1 ? "s" : ""}`}
        />
        <StatHero
          label="Booking completion rate"
          value={`${data.completionRate}%`}
          sub={`${data.totalCompleted || data.completionRate} of ${data.totalBookings} bookings completed`}
        />
        <StatHero
          label="Total bookings"
          value={data.totalBookings}
          sub="Across all branches"
        />
        <StatHero
          label="Prescription orders"
          value={data.rxTotal}
          sub={`${data.rxGlasses} glasses · ${data.rxContacts} contacts`}
        />
      </div>

      {/* ── Shop & inventory row ── */}
      <div className="rep-section">
        <p className="rep-section-title">Shop & Inventory</p>
        <div className="rep-mini-grid">
          <MiniStat label="Total shop orders" value={data.totalOrders} />
          <MiniStat label="Pending orders" value={data.pendingOrders} />
          <MiniStat label="Fulfilled orders" value={data.fulfilledOrders} />
          <MiniStat label="Products in shop" value={data.totalProducts} />
          <MiniStat label="Low-stock items (≤3)" value={data.lowStock} />
          <MiniStat label="Out of stock" value={data.outOfStock} />
        </div>
      </div>

      {/* ── Bookings by branch ── */}
      <div className="rep-section">
        <p className="rep-section-title">Bookings by branch</p>
        <div className="rep-branches">
          {BRANCHES.map((b) => {
            const s = data.byBranch[b];
            const pct =
              data.maxBranchBookings > 0
                ? (s.total / data.maxBranchBookings) * 100
                : 0;
            return (
              <div key={b} className="rep-branch-card">
                <div className="rep-branch-header">
                  <p className="rep-branch-name">{BRANCH_SHORT[b]}</p>
                  <p className="rep-branch-total">{s.total} total</p>
                </div>
                <div className="rep-branch-bar-track">
                  <div
                    className="rep-branch-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="rep-branch-stats">
                  <div className="rep-branch-stat">
                    <span className="rep-dot rep-dot--upcoming" />
                    <span>{s.upcoming} upcoming</span>
                  </div>
                  <div className="rep-branch-stat">
                    <span className="rep-dot rep-dot--completed" />
                    <span>{s.completed} completed</span>
                  </div>
                  <div className="rep-branch-stat">
                    <span className="rep-dot rep-dot--noshow" />
                    <span>{s.noShow} no-show</span>
                  </div>
                  <div className="rep-branch-stat">
                    <span className="rep-dot rep-dot--cancelled" />
                    <span>{s.cancelled} cancelled</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
