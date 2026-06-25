import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./TablePage.css";
import "./WalkInSale.css";

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
const PAYMENT_LABEL = {
  cash: "Cash",
  pos: "POS",
  transfer: "Transfer",
  online: "Online (Paystack)",
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

function genWalkInRef() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `WLK-${date}-${rand}`;
}

// ── Walk-in Sale Modal ────────────────────────────────────────────
function WalkInSaleModal({ onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [payMethod, setPayMethod] = useState("cash");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, price, stock_qty, discount_percent, category")
      .gt("stock_qty", 0)
      .order("name")
      .then(({ data }) => setProducts(data || []));
  }, []);

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  function addItem(product) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch("");
  }

  function setQty(id, qty) {
    if (qty < 1) return removeItem(id);
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function removeItem(id) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function effectivePrice(p) {
    return p.discount_percent > 0
      ? Math.round(p.price * (1 - p.discount_percent / 100))
      : p.price;
  }

  const total = cartItems.reduce(
    (sum, i) => sum + effectivePrice(i) * i.qty,
    0,
  );

  function validate() {
    const e = {};
    if (!customer.name.trim()) e.name = "Customer name is required.";
    if (!customer.phone.trim()) e.phone = "Phone number is required.";
    if (cartItems.length === 0) e.items = "Add at least one product.";
    // Check stock
    cartItems.forEach((i) => {
      const prod = products.find((p) => p.id === i.id);
      if (prod && i.qty > prod.stock_qty)
        e[`stock_${i.id}`] = `Only ${prod.stock_qty} left for ${i.name}.`;
    });
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);

    const ref = genWalkInRef();
    const items = cartItems.map((i) => ({
      name: i.name,
      price: effectivePrice(i),
      qty: i.qty,
    }));

    const { error } = await supabase.from("shop_orders").insert([
      {
        customer_name: customer.name.trim(),
        customer_email:
          customer.email.trim() || `walkin-${Date.now()}@internal`,
        customer_phone: customer.phone.trim(),
        items,
        fulfillment: "pickup",
        delivery_fee: 0,
        paid_total: total,
        payment_ref: ref,
        payment_method: payMethod,
        status: "fulfilled",
      },
    ]);

    if (error) {
      setSaving(false);
      alert("Error: " + error.message);
      return;
    }

    // Decrement stock for each item
    for (const item of cartItems) {
      try {
        const { data: prod } = await supabase
          .from("products")
          .select("stock_qty")
          .eq("id", item.id)
          .single();
        if (prod) {
          await supabase
            .from("products")
            .update({ stock_qty: Math.max(0, prod.stock_qty - item.qty) })
            .eq("id", item.id);
        }
      } catch (e) {
        console.error("Stock decrement failed:", e);
      }
    }

    setSaving(false);
    onSaved(ref);
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal wis-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wis-header">
          <div>
            <h2 className="admin-modal-title" style={{ margin: 0 }}>
              Record walk-in sale
            </h2>
            <p className="wis-note">
              Saved as fulfilled immediately · stock decremented automatically
            </p>
          </div>
          <span className="walkin-badge">Walk-in</span>
        </div>

        <div className="wis-body">
          {/* Customer */}
          <p className="wis-section">Customer</p>
          <div className="wis-row">
            <div className="wis-field">
              <label className="wis-label">Full name *</label>
              <input
                className={`wis-input${errors.name ? " wis-input--err" : ""}`}
                value={customer.name}
                onChange={(e) => {
                  setCustomer((c) => ({ ...c, name: e.target.value }));
                  if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="Customer name"
              />
              {errors.name && <span className="wis-err">{errors.name}</span>}
            </div>
            <div className="wis-field">
              <label className="wis-label">Phone *</label>
              <input
                className={`wis-input${errors.phone ? " wis-input--err" : ""}`}
                value={customer.phone}
                onChange={(e) => {
                  setCustomer((c) => ({ ...c, phone: e.target.value }));
                  if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                }}
                placeholder="08012345678"
              />
              {errors.phone && <span className="wis-err">{errors.phone}</span>}
            </div>
          </div>
          <div className="wis-field">
            <label className="wis-label">
              Email{" "}
              <span
                style={{ fontWeight: 400, color: "var(--color-text-muted)" }}
              >
                (optional)
              </span>
            </label>
            <input
              className="wis-input"
              value={customer.email}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, email: e.target.value }))
              }
              placeholder="customer@email.com"
            />
          </div>

          {/* Product search */}
          <p className="wis-section">Items</p>
          {errors.items && (
            <p className="wis-err" style={{ marginBottom: 8 }}>
              {errors.items}
            </p>
          )}
          <div className="wis-search-wrap">
            <input
              className="wis-input wis-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products to add…"
            />
            {search && filtered.length > 0 && (
              <div className="wis-dropdown">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    className="wis-dropdown-item"
                    onClick={() => addItem(p)}
                  >
                    <span>{p.name}</span>
                    <span className="wis-dropdown-meta">
                      ₦{effectivePrice(p).toLocaleString()}
                      {p.discount_percent > 0 && (
                        <span className="wis-disc">
                          {" "}
                          ({p.discount_percent}% off)
                        </span>
                      )}
                      · {p.stock_qty} left
                    </span>
                  </button>
                ))}
              </div>
            )}
            {search && filtered.length === 0 && (
              <div className="wis-dropdown">
                <p
                  style={{
                    padding: "var(--space-3)",
                    margin: 0,
                    color: "var(--color-text-muted)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  No products found.
                </p>
              </div>
            )}
          </div>

          {/* Cart */}
          {cartItems.length > 0 && (
            <div className="wis-cart">
              {cartItems.map((item) => {
                const stockErr = errors[`stock_${item.id}`];
                return (
                  <div key={item.id} className="wis-cart-row">
                    <div className="wis-cart-name">
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        ₦{effectivePrice(item).toLocaleString()} each
                      </p>
                      {stockErr && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-xs)",
                            color: "var(--teal-700)",
                          }}
                        >
                          {stockErr}
                        </p>
                      )}
                    </div>
                    <div className="wis-qty-ctrl">
                      <button
                        className="wis-qty-btn"
                        onClick={() => setQty(item.id, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="wis-qty-val">{item.qty}</span>
                      <button
                        className="wis-qty-btn"
                        onClick={() => setQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)",
                        minWidth: 80,
                        textAlign: "right",
                      }}
                    >
                      ₦{(effectivePrice(item) * item.qty).toLocaleString()}
                    </p>
                    <button
                      className="wis-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              <div className="wis-total-row">
                <span>Total</span>
                <span className="wis-total-val">₦{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Payment method */}
          <p className="wis-section">Payment method</p>
          <div className="wis-pay-row">
            {["cash", "pos", "transfer"].map((m) => (
              <button
                key={m}
                type="button"
                className={`wis-pay-btn${payMethod === m ? " wis-pay-btn--on" : ""}`}
                onClick={() => setPayMethod(m)}
              >
                {m === "cash"
                  ? "💵 Cash"
                  : m === "pos"
                    ? "💳 POS"
                    : "🏦 Transfer"}
              </button>
            ))}
          </div>
        </div>

        <div
          className="admin-modal-actions"
          style={{ marginTop: "var(--space-5)" }}
        >
          <button
            className="admin-btn admin-btn--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={saving || cartItems.length === 0}
          >
            {saving ? "Recording…" : `Record sale · ₦${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ShopOrders page ──────────────────────────────────────────
export default function ShopOrders() {
  const { isSuperAdmin } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [lastRef, setLastRef] = useState(null);

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
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => {
            setLastRef(null);
            setShowWalkIn(true);
          }}
        >
          + Record walk-in sale
        </button>
      </div>

      {lastRef && (
        <div
          style={{
            background: "#e6f9f0",
            border: "1px solid #1a7a4a",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "#1a7a4a",
              fontWeight: 500,
            }}
          >
            ✅ Walk-in sale recorded · Ref: <strong>{lastRef}</strong>
          </p>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1a7a4a",
              fontSize: 16,
            }}
            onClick={() => setLastRef(null)}
          >
            ✕
          </button>
        </div>
      )}

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
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Payment</th>
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
                const isWalkIn = o.payment_ref?.startsWith("WLK-");
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
                      {isWalkIn && (
                        <span
                          style={{
                            fontSize: 10,
                            background: "var(--amber-50)",
                            color: "var(--amber-600)",
                            border: "1px solid var(--amber-300)",
                            borderRadius: 99,
                            padding: "1px 6px",
                            fontWeight: 700,
                          }}
                        >
                          Walk-in
                        </span>
                      )}
                    </td>
                    <td>
                      <p style={{ fontWeight: 500, margin: 0 }}>
                        {o.customer_name}
                      </p>
                      <p
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                          margin: 0,
                        }}
                      >
                        {o.customer_phone}
                      </p>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {o.fulfillment}
                    </td>
                    <td>
                      {o.payment_method ? (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 600,
                            color: "var(--navy-800)",
                          }}
                        >
                          {PAYMENT_LABEL[o.payment_method] || o.payment_method}
                        </span>
                      ) : (
                        "—"
                      )}
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
                      <td colSpan={8}>
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
                          {o.payment_method && (
                            <div className="tp-expanded-field">
                              <label>Payment method</label>
                              <p>
                                {PAYMENT_LABEL[o.payment_method] ||
                                  o.payment_method}
                              </p>
                            </div>
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

      {showWalkIn && (
        <WalkInSaleModal
          onClose={() => setShowWalkIn(false)}
          onSaved={(ref) => {
            setShowWalkIn(false);
            setLastRef(ref);
            load();
          }}
        />
      )}
    </div>
  );
}
