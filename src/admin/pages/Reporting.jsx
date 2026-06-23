import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Reporting.css";

const BRANCHES = [
  "Head Office — Bodija",
  "Oluyole Branch",
  "New Bodija Branch",
];

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
        supabase.from("products").select("stock_qty, price"),
      ]);

      // Bookings by branch
      const bookingsByBranch = {};
      BRANCHES.forEach((b) => {
        const branchBookings = (bookings || []).filter(
          (bk) => bk.location === b,
        );
        bookingsByBranch[b] = {
          total: branchBookings.length,
          completed: branchBookings.filter((bk) => bk.status === "completed")
            .length,
          upcoming: branchBookings.filter((bk) => bk.status === "upcoming")
            .length,
          cancelled: branchBookings.filter((bk) => bk.status === "cancelled")
            .length,
          noShow: branchBookings.filter((bk) => bk.status === "no-show").length,
        };
      });

      // Revenue from shop orders
      const completedOrders = (orders || []).filter(
        (o) => o.status === "fulfilled",
      );
      const totalRevenue = completedOrders.reduce(
        (sum, o) => sum + (o.paid_total || 0),
        0,
      );

      // Prescription stats
      const rxTotal = (rxOrders || []).length;
      const rxGlasses = (rxOrders || []).filter(
        (r) => r.order_type === "glasses",
      ).length;
      const rxContacts = (rxOrders || []).filter(
        (r) => r.order_type === "contacts",
      ).length;

      // Inventory
      const lowStock = (products || []).filter((p) => p.stock_qty <= 3).length;
      const totalProducts = (products || []).length;

      setData({
        bookingsByBranch,
        totalRevenue,
        rxTotal,
        rxGlasses,
        rxContacts,
        lowStock,
        totalProducts,
        totalOrders: (orders || []).length,
        fulfilledOrders: completedOrders.length,
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
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clinic-Wide Reporting</h1>
          <p className="admin-page-subtitle">
            Aggregate overview across all three branches.
          </p>
        </div>
      </div>

      {/* Top stat row */}
      <div className="rep-stat-row">
        <div className="rep-stat">
          <p className="rep-stat-val">₦{data.totalRevenue.toLocaleString()}</p>
          <p className="rep-stat-label">Fulfilled order revenue</p>
        </div>
        <div className="rep-stat">
          <p className="rep-stat-val">{data.totalOrders}</p>
          <p className="rep-stat-label">Total shop orders</p>
        </div>
        <div className="rep-stat">
          <p className="rep-stat-val">{data.rxTotal}</p>
          <p className="rep-stat-label">Prescription orders</p>
        </div>
        <div className="rep-stat rep-stat--warn">
          <p className="rep-stat-val">{data.lowStock}</p>
          <p className="rep-stat-label">Low-stock products</p>
        </div>
      </div>

      {/* Bookings by branch */}
      <p className="rep-section-title">Bookings by branch</p>
      <div className="admin-card" style={{ marginBottom: "var(--space-6)" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Total</th>
              <th>Upcoming</th>
              <th>Completed</th>
              <th>No-show</th>
              <th>Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((b) => {
              const s = data.bookingsByBranch[b];
              return (
                <tr key={b}>
                  <td style={{ fontWeight: 500 }}>{b}</td>
                  <td>{s.total}</td>
                  <td>
                    <span className="admin-badge admin-badge--upcoming">
                      {s.upcoming}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge--completed">
                      {s.completed}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge--no-show">
                      {s.noShow}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge--cancelled">
                      {s.cancelled}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Prescription breakdown */}
      <p className="rep-section-title">Prescription orders</p>
      <div className="rep-stat-row">
        <div className="rep-stat">
          <p className="rep-stat-val">{data.rxGlasses}</p>
          <p className="rep-stat-label">Glasses orders</p>
        </div>
        <div className="rep-stat">
          <p className="rep-stat-val">{data.rxContacts}</p>
          <p className="rep-stat-label">Contact lens orders</p>
        </div>
        <div className="rep-stat">
          <p className="rep-stat-val">{data.totalProducts}</p>
          <p className="rep-stat-label">Products in shop</p>
        </div>
      </div>
    </div>
  );
}
