import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./TablePage.css";

export default function PendingApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  async function load() {
    const [{ data: bookings }, { data: orders }, { data: rxOrders }] =
      await Promise.all([
        supabase
          .from("bookings")
          .select(
            "id, name, service, date, time_slot, location, pre_cancellation_status, status_updated_at",
          )
          .eq("status", "cancellation_pending")
          .order("status_updated_at"),
        supabase
          .from("shop_orders")
          .select(
            "id, payment_ref, paid_total, fulfillment, pre_cancellation_status, status_updated_at",
          )
          .eq("status", "cancellation_pending")
          .order("status_updated_at"),
        supabase
          .from("prescription_orders")
          .select(
            "id, name, order_type, fulfillment, pre_cancellation_status, status_updated_at",
          )
          .eq("status", "cancellation_pending")
          .order("status_updated_at"),
      ]);

    const all = [
      ...(bookings || []).map((b) => ({
        ...b,
        _table: "bookings",
        _label: `Booking — ${b.name}`,
        _detail: `${b.service} · ${b.date} · ${b.time_slot}`,
      })),
      ...(orders || []).map((o) => ({
        ...o,
        _table: "shop_orders",
        _label: `Shop order — ${o.payment_ref || "no ref"}`,
        _detail: `₦${(o.paid_total || 0).toLocaleString()} · ${o.fulfillment}`,
      })),
      ...(rxOrders || []).map((r) => ({
        ...r,
        _table: "prescription_orders",
        _label: `Prescription — ${r.name}`,
        _detail: `${r.order_type} · ${r.fulfillment}`,
      })),
    ].sort(
      (a, b) => new Date(a.status_updated_at) - new Date(b.status_updated_at),
    );

    setItems(all);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(item, approve) {
    setUpdating(item.id);
    const newStatus = approve
      ? "cancelled"
      : item.pre_cancellation_status || "upcoming";
    const { error } = await supabase
      .from(item._table)
      .update({ status: newStatus })
      .eq("id", item.id);
    if (error) toast.error(error?.message || "Something went wrong");
    setUpdating(null);
    load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Pending Approvals</h1>
          <p className="admin-page-subtitle">
            Cancellation requests from staff awaiting your decision.
          </p>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">
            <p className="admin-empty-body">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">All clear.</p>
            <p className="admin-empty-body">
              No pending cancellation requests right now.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Details</th>
                <th>Requested at</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item._table}-${item.id}`}>
                  <td style={{ fontWeight: 500 }}>{item._label}</td>
                  <td
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item._detail}
                  </td>
                  <td
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item.status_updated_at
                      ? new Date(item.status_updated_at).toLocaleString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "—"}
                  </td>
                  <td>
                    <div className="tp-action-btns">
                      <button
                        className="admin-btn admin-btn--danger tp-sm-btn"
                        disabled={updating === item.id}
                        onClick={() => resolve(item, true)}
                      >
                        Approve cancellation
                      </button>
                      <button
                        className="admin-btn admin-btn--ghost tp-sm-btn"
                        disabled={updating === item.id}
                        onClick={() => resolve(item, false)}
                      >
                        Decline
                      </button>
                    </div>
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
