import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import "./CheckoutModal.css";

// ── Clinic bank details ───────────────────────────────────────────
const BANK_NAME = "Zenith Bank";
const ACCOUNT_NAME = "Corporate Eye Clinic";
const ACCOUNT_NO = "1234567890"; // ← Replace with real account number
const WHATSAPP_NO = "2348033372738";
const DELIVERY_FEE = 3500;

const fmt = (n) => "₦" + Number(n).toLocaleString("en-NG");

function generateRef() {
  const d = new Date();
  const ymd =
    d.getFullYear().toString().slice(-2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EYE-${ymd}-${rand}`;
}

// ── Step 1: Checkout form ─────────────────────────────────────────
function CheckoutForm({ onClose, onConfirmed }) {
  const { items, total, clearCart } = useCart();
  const deliveryFee = items.length > 0 ? 0 : 0; // calculated per fulfillment below
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    fulfillment: "pickup",
    branch: "Head Office — Bodija",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const payable = total + (form.fulfillment === "dispatch" ? DELIVERY_FEE : 0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.email.trim() || !form.email.includes("@"))
      e.email = "Valid email is required";
    if (form.fulfillment === "pickup" && !form.branch)
      e.branch = "Please select a pickup branch";
    if (form.fulfillment === "dispatch" && !form.address.trim())
      e.address = "Delivery address is required";
    return e;
  };

  const handleProceed = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);

    const ref = generateRef();

    try {
      // Create order with payment_status: unpaid
      const { error } = await supabase.from("shop_orders").insert({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        items: items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          qty: i.qty,
        })),
        fulfillment: form.fulfillment,
        delivery_address:
          form.fulfillment === "dispatch"
            ? form.address
            : `Pickup — ${form.branch}`,
        delivery_fee: form.fulfillment === "dispatch" ? DELIVERY_FEE : 0,
        paid_total: payable,
        payment_ref: ref,
        payment_method: "transfer",
        payment_status: "unpaid",
        status: "pending",
      });

      setSaving(false);

      if (error) {
        setErrors({ submit: `Could not create order: ${error.message}` });
        return;
      }
    } catch (err) {
      setSaving(false);
      setErrors({
        submit: "Network error. Please check your connection and try again.",
      });
      return;
    }

    // Fire order email (non-blocking)
    fetch(
      "https://cacniprnjuwuavhhfowu.supabase.co/functions/v1/send-order-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY25pcHJuanV3dWF2aGhmb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDYwODEsImV4cCI6MjA5NjE4MjA4MX0.UvpRbcH8Wq70tndFNqs9ygEiUXz4lKBd4Nzc-vg3jjg",
        },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          items: items.map((i) => ({
            name: i.product.name,
            price: i.product.price,
            qty: i.qty,
          })),
          fulfillment:
            form.fulfillment === "pickup"
              ? `pickup — ${form.branch}`
              : "dispatch",
          delivery_fee: form.fulfillment === "dispatch" ? DELIVERY_FEE : 0,
          paid_total: payable,
          payment_ref: ref,
          payment_method: "Bank Transfer",
          delivery_address:
            form.fulfillment === "dispatch" ? form.address : null,
        }),
      },
    ).catch(() => {});

    clearCart();
    onConfirmed({ ref, amount: payable, name: form.name, email: form.email });
  };

  return (
    <div className="co-modal">
      <div className="co-header">
        <h2>Checkout</h2>
        <button className="co-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="co-body">
        {/* Order summary */}
        <div className="co-section">
          <p className="co-section-label">ORDER SUMMARY</p>
          {items.map((item) => (
            <div key={item.key} className="co-item-row">
              <span>
                {item.product.name} × {item.qty}
              </span>
              <span>{fmt(item.product.price * item.qty)}</span>
            </div>
          ))}
          {form.fulfillment === "dispatch" && (
            <div className="co-item-row co-item-row--fee">
              <span>Delivery fee</span>
              <span>{fmt(DELIVERY_FEE)}</span>
            </div>
          )}
          <div className="co-total-row">
            <span>Total</span>
            <span>{fmt(payable)}</span>
          </div>
        </div>

        {/* Customer details */}
        <div className="co-section">
          <p className="co-section-label">YOUR DETAILS</p>
          <div className="co-field">
            <label>Full name</label>
            <input
              className={`co-input${errors.name ? " err" : ""}`}
              placeholder="John Doe"
              disabled={saving}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <p className="co-err">{errors.name}</p>}
          </div>
          <div className="co-field">
            <label>Phone number</label>
            <input
              className={`co-input${errors.phone ? " err" : ""}`}
              placeholder="08012345678"
              disabled={saving}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone && <p className="co-err">{errors.phone}</p>}
          </div>
          <div className="co-field">
            <label>Email address</label>
            <input
              className={`co-input${errors.email ? " err" : ""}`}
              type="email"
              placeholder="you@example.com"
              disabled={saving}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && <p className="co-err">{errors.email}</p>}
          </div>
        </div>

        {/* Fulfillment */}
        <div className="co-section">
          <p className="co-section-label">DELIVERY / PICKUP</p>
          <div
            className="co-toggle-row"
            style={{
              pointerEvents: saving ? "none" : "auto",
              opacity: saving ? 0.5 : 1,
            }}
          >
            <button
              className={`co-toggle${form.fulfillment === "pickup" ? " active" : ""}`}
              onClick={() => set("fulfillment", "pickup")}
              disabled={saving}
            >
              📦 Pickup in-store
            </button>
            <button
              className={`co-toggle${form.fulfillment === "dispatch" ? " active" : ""}`}
              onClick={() => set("fulfillment", "dispatch")}
              disabled={saving}
            >
              🚚 Delivery (+{fmt(DELIVERY_FEE)})
            </button>
          </div>
          {form.fulfillment === "pickup" && (
            <div className="co-field" style={{ marginTop: 12 }}>
              <label>Select pickup branch</label>
              <select
                className={`co-input${errors.branch ? " err" : ""}`}
                value={form.branch}
                disabled={saving}
                onChange={(e) => set("branch", e.target.value)}
              >
                <option value="Head Office — Bodija">
                  Head Office — Royal Mall, Bodija
                </option>
                <option value="Oluyole Branch">
                  Oluyole Branch — Alaafin Avenue, Oluyole Estate
                </option>
                <option value="New Bodija Branch">
                  New Bodija Branch — 3B Aare Avenue, New Bodija
                </option>
              </select>
              {errors.branch && <p className="co-err">{errors.branch}</p>}
            </div>
          )}
          {form.fulfillment === "dispatch" && (
            <div className="co-field" style={{ marginTop: 12 }}>
              <label>Delivery address</label>
              <input
                className={`co-input${errors.address ? " err" : ""}`}
                placeholder="Full delivery address"
                value={form.address}
                disabled={saving}
                onChange={(e) => set("address", e.target.value)}
              />
              {errors.address && <p className="co-err">{errors.address}</p>}
            </div>
          )}
        </div>

        {errors.submit && <p className="co-err">{errors.submit}</p>}
      </div>

      <div className="co-footer">
        <p className="co-secure">🔒 Pay by bank transfer — verified by admin</p>
        <button
          className="co-btn-primary"
          onClick={handleProceed}
          disabled={saving}
        >
          {saving ? "Creating order…" : `Proceed to payment — ${fmt(payable)}`}
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Bank transfer details ─────────────────────────────────
function BankTransferModal({ orderRef, amount, onPaid }) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(ACCOUNT_NO);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaid = async () => {
    setConfirming(true);
    // Mark as submitted — NOT verified
    await supabase
      .from("shop_orders")
      .update({ payment_status: "submitted" })
      .eq("payment_ref", orderRef);
    setConfirming(false);
    onPaid();
  };

  return (
    <div className="co-modal">
      <div className="co-header">
        <h2>Complete Your Payment</h2>
      </div>
      <div className="co-body">
        <div className="co-bank-amount">
          <p className="co-bank-label">Transfer exactly</p>
          <p className="co-bank-figure">{fmt(amount)}</p>
        </div>

        <div className="co-bank-card">
          <div className="co-bank-row">
            <span>Bank</span>
            <strong>{BANK_NAME}</strong>
          </div>
          <div className="co-bank-row">
            <span>Account Name</span>
            <strong>{ACCOUNT_NAME}</strong>
          </div>
          <div className="co-bank-row">
            <span>Account Number</span>
            <div className="co-acct-wrap">
              <strong className="co-acct-no">{ACCOUNT_NO}</strong>
              <button className="co-copy-btn" onClick={copy}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="co-ref-note">
          <p>
            Order reference: <strong>{orderRef}</strong>
          </p>
          <p>
            Use this as your transfer narration so we can identify your payment.
          </p>
        </div>

        <div className="co-warning">
          ⚠️ Transfer the exact amount. After transferring, click the button
          below.
        </div>
      </div>

      <div className="co-footer">
        <button
          className="co-btn-primary"
          onClick={handlePaid}
          disabled={confirming}
        >
          {confirming ? "Submitting…" : "I've Made the Payment"}
        </button>
      </div>
    </div>
  );
}

// ── Step 3: WhatsApp receipt submission ───────────────────────────
function PaymentSubmittedModal({ orderRef, amount, name, onClose }) {
  const msg = encodeURIComponent(
    `Hello Corporate Eye Clinic, I have made a bank transfer payment for Order ${orderRef} (${fmt(amount)}). Please find my payment receipt attached. Thank you.`,
  );
  const waLink = `https://wa.me/${WHATSAPP_NO}?text=${msg}`;

  return (
    <div className="co-modal">
      <div className="co-header">
        <h2>Payment Submitted ✅</h2>
      </div>
      <div className="co-body">
        <div className="co-success-box">
          <div className="co-success-icon">🎉</div>
          <p className="co-success-title">Thank you, {name.split(" ")[0]}!</p>
          <p className="co-success-sub">
            Your payment has been submitted for verification.
          </p>
        </div>

        <div className="co-bank-card">
          <div className="co-bank-row">
            <span>Order Reference</span>
            <strong>{orderRef}</strong>
          </div>
          <div className="co-bank-row">
            <span>Amount</span>
            <strong>{fmt(amount)}</strong>
          </div>
          <div className="co-bank-row">
            <span>Payment Status</span>
            <strong style={{ color: "#A07200" }}>Awaiting Verification</strong>
          </div>
        </div>

        <div className="co-whatsapp-note">
          <p>
            Please send your <strong>payment receipt</strong> to our WhatsApp so
            we can verify your payment quickly.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="co-wa-btn"
          >
            💬 Send Receipt on WhatsApp
          </a>
        </div>

        <p className="co-disclaimer">
          Your order will only be confirmed after the clinic verifies your
          payment. You will be notified by email once confirmed.
        </p>
      </div>
      <div className="co-footer">
        <button className="co-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export default function CheckoutModal({ onClose }) {
  const [step, setStep] = useState("form"); // form | transfer | submitted
  const [orderData, setOrderData] = useState(null);

  if (step === "form") {
    return (
      <div className="co-backdrop" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>
          <CheckoutForm
            onClose={onClose}
            onConfirmed={(data) => {
              setOrderData(data);
              setStep("transfer");
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "transfer") {
    return (
      <div className="co-backdrop">
        <div>
          <BankTransferModal
            orderRef={orderData.ref}
            amount={orderData.amount}
            onPaid={() => setStep("submitted")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="co-backdrop">
      <div>
        <PaymentSubmittedModal
          orderRef={orderData.ref}
          amount={orderData.amount}
          name={orderData.name}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
