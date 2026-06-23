import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./TablePage.css";

const STATUSES = [
  "All",
  "pending",
  "processing",
  "shipped",
  "fulfilled",
  "cancellation_pending",
  "cancelled",
];
const BADGE = {
  pending: "admin-badge--pending",
  processing: "admin-badge--processing",
  shipped: "admin-badge--shipped",
  fulfilled: "admin-badge--fulfilled",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled: "admin-badge--cancelled",
};

function nextStatuses(current, isSuperAdmin) {
  if (isSuperAdmin && current === "cancellation_pending") return ["cancelled"];
  if (!isSuperAdmin && current === "cancellation_pending") return [];
  if (current === "cancelled" || current === "fulfilled") return [];
  const flow = ["pending", "processing", "shipped", "fulfilled"];
  if (isSuperAdmin) return [...flow, "cancelled"];
  return [...flow, "cancellation_pending"];
}

function EditorStamp({ updatedBy, updatedAt, profileMap }) {
  if (!updatedBy || !profileMap[updatedBy]) return null;
  const profile = profileMap[updatedBy];
  return (
    <p
      style={{
        fontSize: "var(--font-size-xs)",
        color: "var(--color-text-muted)",
        margin: "4px 0 0",
        lineHeight: 1.4,
      }}
    >
      ✏️ {profile.full_name}
      {profile.branch
        ? ` · ${profile.branch.replace(" Branch", "").replace(" — Bodija", "")}`
        : ""}
      {updatedAt
        ? ` · ${new Date(updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
        : ""}
    </p>
  );
}

export default function ShopOrders() {
  const { isSuperAdmin } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  async function load() {
    let q = supabase
      .from("shop_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (status !== "All") q = q.eq("status", status);
    const [{ data }, { data: profs }] = await Promise.all([
      q,
      supabase.from("profiles").select("id, full_name, branch"),
    ]);
    setOrders(data || []);
    const map = {};
    (profs || []).forEach((p) => {
      map[p.id] = p;
    });
    setProfileMap(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [status]);

  async function updateStatus(order, newStatus) {
    setUpdating(order.id);
    const { error } = await supabase
      .from("shop_orders")
      .update({ status: newStatus })
      .eq("id", order.id);
    if (error) alert("Error: " + error.message);
    setUpdating(null);
    load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Shop Orders</h1>
          <p className="admin-page-subtitle">
            Track and manage product purchases from the clinic shop.
          </p>
        </div>
      </div>

      <div className="tp-filters">
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
            <p className="admin-empty-body">Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">No orders found.</p>
            <p className="admin-empty-body">Try adjusting your filter.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Fulfillment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const options = nextStatuses(o.status, isSuperAdmin);
                const isExpanded = expanded === o.id;
                return [
                  <tr key={o.id}>
                    <td>
                      <p
                        style={{
                          fontWeight: 500,
                          margin: 0,
                          fontSize: "var(--font-size-xs)",
                          fontFamily: "monospace",
                        }}
                      >
                        {o.payment_ref || "—"}
                      </p>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {o.fulfillment}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₦{(o.paid_total || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`admin-badge ${BADGE[o.status] || ""}`}>
                        {o.status?.replace("_", " ")}
                      </span>
                      <EditorStamp
                        updatedBy={o.status_updated_by}
                        updatedAt={o.status_updated_at}
                        profileMap={profileMap}
                      />
                    </td>
                    <td>
                      {o.status === "cancellation_pending" && isSuperAdmin ? (
                        <div className="tp-action-btns">
                          <button
                            className="admin-btn admin-btn--danger tp-sm-btn"
                            disabled={updating === o.id}
                            onClick={() => updateStatus(o, "cancelled")}
                          >
                            Approve
                          </button>
                          <button
                            className="admin-btn admin-btn--ghost tp-sm-btn"
                            disabled={updating === o.id}
                            onClick={() =>
                              updateStatus(
                                o,
                                o.pre_cancellation_status || "pending",
                              )
                            }
                          >
                            Decline
                          </button>
                        </div>
                      ) : options.length > 0 ? (
                        <select
                          className="admin-select tp-status-select"
                          value={o.status}
                          disabled={updating === o.id}
                          onChange={(e) => updateStatus(o, e.target.value)}
                        >
                          <option value={o.status}>
                            {o.status.replace("_", " ")}
                          </option>
                          {options
                            .filter((s) => s !== o.status)
                            .map((s) => (
                              <option key={s} value={s}>
                                {s.replace("_", " ")}
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
                    <td>
                      <button
                        className="tp-expand-btn"
                        onClick={() => setExpanded(isExpanded ? null : o.id)}
                      >
                        {isExpanded ? "Hide" : "View items"}
                      </button>
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr key={`${o.id}-exp`} className="tp-expanded-row">
                      <td colSpan={6}>
                        <div className="tp-expanded-grid">
                          <div className="tp-expanded-field">
                            <label>Items ordered</label>
                            {(o.items || []).map((item, i) => (
                              <p key={i}>
                                {item.name} × {item.qty ?? item.quantity ?? 1}
                                {item.price
                                  ? ` — ₦${(item.price * (item.qty ?? item.quantity ?? 1)).toLocaleString()}`
                                  : " — Quote item"}
                              </p>
                            ))}
                          </div>
                          {o.fulfillment === "dispatch" && (
                            <div className="tp-expanded-field">
                              <label>Delivery address</label>
                              <p>{o.delivery_address || "—"}</p>
                            </div>
                          )}
                          <div className="tp-expanded-field">
                            <label>Delivery fee</label>
                            <p>
                              {o.delivery_fee > 0
                                ? `₦${o.delivery_fee.toLocaleString()}`
                                : "No fee (pickup)"}
                            </p>
                          </div>
                        </div>
                      </td>
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
