import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./TablePage.css";

const STATUSES = [
  "All",
  "pending",
  "ready",
  "collected",
  "cancellation_pending",
  "cancelled",
];
const BADGE = {
  pending: "admin-badge--pending",
  ready: "admin-badge--ready",
  collected: "admin-badge--fulfilled",
  cancellation_pending: "admin-badge--cancellation_pending",
  cancelled: "admin-badge--cancelled",
};

const PAYMENT_METHODS = ["cash", "pos", "transfer"];
const PAYMENT_LABEL = { cash: "Cash", pos: "POS", transfer: "Transfer" };

function nextStatuses(current, isSuperAdmin) {
  if (isSuperAdmin && current === "cancellation_pending") return ["cancelled"];
  if (!isSuperAdmin && current === "cancellation_pending") return [];
  if (current === "cancelled" || current === "collected") return [];
  // "ready" → collect via pickup modal, not status dropdown
  if (current === "ready")
    return isSuperAdmin ? ["cancelled"] : ["cancellation_pending"];
  if (isSuperAdmin) return ["ready", "cancelled"];
  return ["ready", "cancellation_pending"];
}

// ── Pickup modal — records collection + payment method ────────────
function PickupModal({ order, onClose, onSaved }) {
  const [payMethod, setPayMethod] = useState("cash");
  const [saving, setSaving] = useState(false);

  async function handleCollect() {
    setSaving(true);
    // Update status first (trigger allows this)
    const { error: statusError } = await supabase
      .from("prescription_orders")
      .update({ status: "collected" })
      .eq("id", order.id);

    if (statusError) {
      alert("Error: " + statusError.message);
      setSaving(false);
      return;
    }

    // Then update payment_method separately
    await supabase
      .from("prescription_orders")
      .update({ payment_method: payMethod })
      .eq("id", order.id);

    setSaving(false);
    onSaved();
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="admin-modal-icon-wrap"
          style={{ background: "var(--teal-50)", color: "var(--teal-700)" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="admin-modal-title">Record collection</h2>
        <p className="admin-modal-body">
          <strong>{order.name}</strong> — {order.order_type} prescription
          <br />
          Select the payment method used at pickup.
        </p>

        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginBottom: "var(--space-6)",
          }}
        >
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              style={{
                flex: 1,
                padding: "var(--space-3)",
                border: `2px solid ${payMethod === m ? "var(--navy-800)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-md)",
                background:
                  payMethod === m ? "var(--navy-800)" : "var(--white)",
                color:
                  payMethod === m ? "var(--white)" : "var(--color-text-muted)",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: "var(--font-size-sm)",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
              onClick={() => setPayMethod(m)}
            >
              {PAYMENT_LABEL[m]}
            </button>
          ))}
        </div>

        <div className="admin-modal-actions">
          <button
            className="admin-btn admin-btn--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleCollect}
            disabled={saving}
          >
            {saving ? "Recording…" : "Mark as collected"}
          </button>
        </div>
      </div>
    </div>
  );
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

export default function Prescriptions() {
  const { isSuperAdmin } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [pickupOrder, setPickupOrder] = useState(null);

  async function load() {
    let q = supabase
      .from("prescription_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (status !== "All") q = q.eq("status", status);
    if (type !== "All") q = q.eq("order_type", type);
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
                      ) : o.status === "ready" ? (
                        <button
                          className="admin-btn admin-btn--primary tp-sm-btn"
                          onClick={() => setPickupOrder(o)}
                        >
                          Record pickup
                        </button>
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
                          {o.payment_method && (
                            <RxField
                              label="Payment method"
                              value={
                                PAYMENT_LABEL[o.payment_method] ||
                                o.payment_method
                              }
                            />
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

      {pickupOrder && (
        <PickupModal
          order={pickupOrder}
          onClose={() => setPickupOrder(null)}
          onSaved={() => {
            setPickupOrder(null);
            load();
          }}
        />
      )}
    </div>
  );
}
