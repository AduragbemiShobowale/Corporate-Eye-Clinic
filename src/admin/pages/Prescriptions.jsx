import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./TablePage.css";

const STATUSES = [
  "All",
  "pending",
  "ready",
  "cancellation_pending",
  "cancelled",
];
const BADGE = {
  pending: "admin-badge--pending",
  ready: "admin-badge--ready",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled: "admin-badge--cancelled",
};

function nextStatuses(current, isSuperAdmin) {
  if (isSuperAdmin && current === "cancellation_pending") return ["cancelled"];
  if (!isSuperAdmin && current === "cancellation_pending") return [];
  if (current === "cancelled" || current === "ready") return [];
  if (isSuperAdmin) return ["ready", "cancelled"];
  return ["ready", "cancellation_pending"];
}

function RxField({ label, value }) {
  if (!value) return null;
  return (
    <div className="tp-expanded-field">
      <label>{label}</label>
      <p>{value}</p>
    </div>
  );
}

export default function Prescriptions() {
  const { isSuperAdmin } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  async function load() {
    let q = supabase
      .from("prescription_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (status !== "All") q = q.eq("status", status);
    if (type !== "All") q = q.eq("order_type", type);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [status, type]);

  async function updateStatus(order, newStatus) {
    setUpdating(order.id);
    const { error } = await supabase
      .from("prescription_orders")
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
          <h1 className="admin-page-title">Prescriptions</h1>
          <p className="admin-page-subtitle">
            Manage prescription orders for glasses and contact lenses.
          </p>
        </div>
      </div>

      <div className="tp-filters">
        <select
          className="admin-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="All">All types</option>
          <option value="glasses">Glasses</option>
          <option value="contacts">Contacts</option>
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
            <p className="admin-empty-body">Loading prescriptions…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-title">No prescription orders found.</p>
            <p className="admin-empty-body">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Fulfillment</th>
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
                      <p style={{ fontWeight: 500, margin: 0 }}>{o.name}</p>
                      <p
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                          margin: 0,
                        }}
                      >
                        {o.phone}
                      </p>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {o.order_type}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {o.fulfillment}
                    </td>
                    <td>
                      <span className={`admin-badge ${BADGE[o.status] || ""}`}>
                        {o.status?.replace("_", " ")}
                      </span>
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
                        {isExpanded ? "Hide" : "View Rx"}
                      </button>
                    </td>
                  </tr>,
                  isExpanded && (
                    <tr key={`${o.id}-exp`} className="tp-expanded-row">
                      <td colSpan={6}>
                        <div className="tp-expanded-grid">
                          {o.order_type === "glasses" ? (
                            <>
                              <RxField
                                label="RE Sph (Dist)"
                                value={o.re_sph_dist}
                              />
                              <RxField
                                label="RE Cyl (Dist)"
                                value={o.re_cyl_dist}
                              />
                              <RxField
                                label="RE Axis (Dist)"
                                value={o.re_axis_dist}
                              />
                              <RxField
                                label="LE Sph (Dist)"
                                value={o.le_sph_dist}
                              />
                              <RxField
                                label="LE Cyl (Dist)"
                                value={o.le_cyl_dist}
                              />
                              <RxField
                                label="LE Axis (Dist)"
                                value={o.le_axis_dist}
                              />
                              <RxField
                                label="RE Sph (Read)"
                                value={o.re_sph_read}
                              />
                              <RxField
                                label="LE Sph (Read)"
                                value={o.le_sph_read}
                              />
                            </>
                          ) : (
                            <>
                              <RxField label="RE Power" value={o.re_sph_dist} />
                              <RxField label="LE Power" value={o.le_sph_dist} />
                              <RxField
                                label="Lens color"
                                value={o.lens_color}
                              />
                            </>
                          )}
                          <RxField label="Fulfillment" value={o.fulfillment} />
                          {o.delivery_address && (
                            <RxField
                              label="Delivery address"
                              value={o.delivery_address}
                            />
                          )}
                          {o.location && (
                            <RxField label="Pickup branch" value={o.location} />
                          )}
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
