import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import TableSkeleton from "./TableSkeleton";
import "./TablePage.css";

export default function PendingApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  async function load() {
    const [{ data: bookings }, { data: orders }, { data: rxOrders }] =
      await Promise.all([
        supabase
          .from("bookings")
          .select(
            "id, name, phone, service, date, time_slot, location, pre_cancellation_status, status_updated_at",
          )
          .eq("status", "cancellation_pending")
          .order("status_updated_at"),
        supabase
          .from("shop_orders")
          .select(
            "id, customer_name, customer_phone, customer_email, payment_ref, paid_total, fulfillment, delivery_address, items, payment_method, pre_cancellation_status, status_updated_at",
          )
          .eq("status", "cancellation_pending")
          .order("status_updated_at"),
        supabase
          .from("prescription_orders")
          .select(
            "id, name, phone, order_type, fulfillment, location, re_sph_dist, le_sph_dist, re_cyl_dist, le_cyl_dist, lens_color, pre_cancellation_status, status_updated_at",
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
        _type: "booking",
      })),
      ...(orders || []).map((o) => ({
        ...o,
        _table: "shop_orders",
        _label: `Shop order — ${o.payment_ref || "no ref"}`,
        _detail: `₦${(o.paid_total || 0).toLocaleString()} · ${o.fulfillment}`,
        _type: "order",
      })),
      ...(rxOrders || []).map((r) => ({
        ...r,
        _table: "prescription_orders",
        _label: `Prescription — ${r.name}`,
        _detail: `${r.order_type} · ${r.fulfillment}`,
        _type: "prescription",
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

  function renderExpandedDetail(item) {
    if (item._type === "booking") {
      return (
        <div className="tp-expanded-grid">
          <div className="tp-expanded-field">
            <label>Patient</label>
            <p>{item.name}</p>
            <p>{item.phone || "—"}</p>
          </div>
          <div className="tp-expanded-field">
            <label>Service</label>
            <p>{item.service}</p>
          </div>
          <div className="tp-expanded-field">
            <label>Date & Time</label>
            <p>
              {item.date} at {item.time_slot}
            </p>
          </div>
          <div className="tp-expanded-field">
            <label>Branch</label>
            <p>{item.location}</p>
          </div>
          <div className="tp-expanded-field">
            <label>Previous status</label>
            <p>{item.pre_cancellation_status || "upcoming"}</p>
          </div>
        </div>
      );
    }

    if (item._type === "order") {
      return (
        <div className="tp-expanded-grid">
          <div className="tp-expanded-field">
            <label>Customer</label>
            <p>{item.customer_name}</p>
            <p>{item.customer_phone}</p>
            {item.customer_email &&
              !item.customer_email.includes("@internal") && (
                <p>{item.customer_email}</p>
              )}
          </div>
          <div className="tp-expanded-field">
            <label>Items</label>
            {(item.items || []).map((i, idx) => (
              <p key={idx}>
                {i.name} × {i.qty ?? 1} — ₦
                {((i.price || 0) * (i.qty ?? 1)).toLocaleString()}
              </p>
            ))}
          </div>
          <div className="tp-expanded-field">
            <label>Total</label>
            <p style={{ fontWeight: 600 }}>
              ₦{(item.paid_total || 0).toLocaleString()}
            </p>
          </div>
          <div className="tp-expanded-field">
            <label>Fulfilment</label>
            <p>{item.fulfillment}</p>
            {item.delivery_address && <p>{item.delivery_address}</p>}
          </div>
          <div className="tp-expanded-field">
            <label>Payment method</label>
            <p>{item.payment_method || "—"}</p>
          </div>
        </div>
      );
    }

    if (item._type === "prescription") {
      return (
        <div className="tp-expanded-grid">
          <div className="tp-expanded-field">
            <label>Patient</label>
            <p>{item.name}</p>
            <p>{item.phone || "—"}</p>
          </div>
          <div className="tp-expanded-field">
            <label>Order type</label>
            <p style={{ textTransform: "capitalize" }}>{item.order_type}</p>
          </div>
          <div className="tp-expanded-field">
            <label>Prescription</label>
            {item.re_sph_dist && (
              <p>
                RE SPH: {item.re_sph_dist}{" "}
                {item.re_cyl_dist ? `CYL: ${item.re_cyl_dist}` : ""}
              </p>
            )}
            {item.le_sph_dist && (
              <p>
                LE SPH: {item.le_sph_dist}{" "}
                {item.le_cyl_dist ? `CYL: ${item.le_cyl_dist}` : ""}
              </p>
            )}
            {item.lens_color && <p>Colour: {item.lens_color}</p>}
          </div>
          <div className="tp-expanded-field">
            <label>Fulfilment</label>
            <p>{item.fulfillment}</p>
            {item.location && <p>{item.location}</p>}
          </div>
        </div>
      );
    }
    return null;
  }

  const TYPE_ICON = {
    booking: "📅",
    order: "🛍️",
    prescription: "📋",
  };

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
          <TableSkeleton cols={8} rows={6} />
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isExpanded = expanded === `${item._table}-${item.id}`;
                return [
                  <tr
                    key={`${item._table}-${item.id}`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setExpanded(
                        isExpanded ? null : `${item._table}-${item.id}`,
                      )
                    }
                  >
                    <td style={{ fontWeight: 500 }}>
                      <span style={{ marginRight: 6 }}>
                        {TYPE_ICON[item._type]}
                      </span>
                      {item._label}
                    </td>
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
                    <td onClick={(e) => e.stopPropagation()}>
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
                    <td>
                      <button className="tp-expand-btn">
                        {isExpanded ? "Hide" : "View details"}
                      </button>
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr
                      key={`${item._table}-${item.id}-exp`}
                      className="tp-expanded-row"
                    >
                      <td colSpan={5}>{renderExpandedDetail(item)}</td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
