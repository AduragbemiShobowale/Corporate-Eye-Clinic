import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { contactInfo } from "../../data/siteData";
import { supabase } from "../../lib/supabase";
import "./CheckoutModal.css";

const fmt = (n) => "₦" + n.toLocaleString("en-NG");

// ── Replace with your real Paystack public key ──
const PAYSTACK_PUBLIC_KEY = "pk_test_1b9fdf16809a6da56ce4f9e59592732352bc8cf7";
const DELIVERY_FEE = 3500; // ₦3,500 flat fee — added only when Dispatch/Delivery is selected

export default function CheckoutModal({ onClose }) {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    fulfillment: "pickup",
    location: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // 'form' | 'paying' | 'success'

  const hasQuoteItems = items.some((i) => i.options?.isQuote);
  const hasPaidItems = items.some((i) => !i.options?.isQuote);
  const deliveryFee =
    form.fulfillment === "dispatch" && hasPaidItems ? DELIVERY_FEE : 0;
  const payableTotal = total + deliveryFee; // quote items have price 0, so they don't add to total

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "phone" && !/^[0-9\s+\-()]*$/.test(v)) return;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/[\s+\-()]/g, "").length < 11)
      e.phone = "Phone number must be at least 11 digits";
    if (form.fulfillment === "pickup" && !form.location)
      e.location = "Please select a pickup location";
    if (form.fulfillment === "dispatch" && !form.address.trim())
      e.address = "Delivery address is required";
    return e;
  };

  const buildOrderPayload = (paymentRef = null) => ({
    customer_name: form.name,
    customer_email: form.email,
    customer_phone: form.phone,
    fulfillment: form.fulfillment,
    location: form.fulfillment === "pickup" ? form.location : null,
    delivery_address: form.fulfillment === "dispatch" ? form.address : null,
    items: items.map((i) => ({
      name: i.product.name,
      qty: i.qty,
      price: i.options?.isQuote ? null : i.product.price,
      options: i.options || null,
    })),
    delivery_fee: deliveryFee,
    paid_total: payableTotal,
    has_quote_items: hasQuoteItems,
    payment_ref: paymentRef,
  });

  const saveOrderAndNotify = async (paymentRef = null) => {
    const payload = buildOrderPayload(paymentRef);
    const { error } = await supabase.from("shop_orders").insert([payload]);
    if (error) console.error("Order save failed:", error);

    try {
      await fetch(
        "https://cacniprnjuwuavhhfowu.supabase.co/functions/v1/send-order-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY25pcHJuanV3dWF2aGhmb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDYwODEsImV4cCI6MjA5NjE4MjA4MX0.UvpRbcH8Wq70tndFNqs9ygEiUXz4lKBd4Nzc-vg3jjg",
          },
          body: JSON.stringify(payload),
        },
      );
    } catch (e) {
      console.error("Order email failed:", e);
    }
  };

  const submitQuoteOnlyOrder = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep("paying");
    await saveOrderAndNotify(null);
    clearCart();
    setStep("success");
  };

  const initPaystack = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (PAYSTACK_PUBLIC_KEY.includes("xxxxxxxx")) {
      setErrors({
        submit:
          "Payments are not yet configured — the Paystack public key is still a placeholder. Replace PAYSTACK_PUBLIC_KEY in CheckoutModal.jsx with your real key.",
      });
      return;
    }

    setStep("paying");

    const launch = () => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: form.email,
        amount: payableTotal * 100,
        currency: "NGN",
        ref: "CEC-" + Date.now(),
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "name",
              value: form.name,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: form.phone,
            },
            {
              display_name: "Fulfillment",
              variable_name: "fulfillment",
              value: form.fulfillment,
            },
          ],
        },
        // IMPORTANT: must be a plain (non-async) function — Paystack's inline.js
        // validates callback.constructor === Function, and async functions fail
        // that check (their constructor is AsyncFunction), causing
        // "Attribute callback must be a valid function".
        callback: function (response) {
          saveOrderAndNotify(response.reference)
            .then(() => {
              clearCart();
              setStep("success");
            })
            .catch((err) => {
              console.error("Post-payment save failed:", err);
              // Payment already succeeded — still show success to the customer
              clearCart();
              setStep("success");
            });
        },
        onClose: () => setStep("form"),
      });
      handler.openIframe();
    };

    const existingScript = document.getElementById("paystack-script");
    if (existingScript) {
      launch();
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = launch;
    document.body.appendChild(script);
  };

  const handleSubmit = () => {
    if (payableTotal > 0) {
      initPaystack();
    } else {
      submitQuoteOnlyOrder();
    }
  };

  return (
    <div
      className="checkout-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="checkout-modal" role="dialog" aria-modal="true">
        <div className="checkout-modal__header">
          <h2 className="checkout-modal__title">
            {step === "success" ? "Order confirmed! 🎉" : "Checkout"}
          </h2>
          <button
            className="checkout-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {step === "success" ? (
          <div className="checkout-success">
            <div className="checkout-success__icon">
              <CheckIcon />
            </div>
            <h3>Thank you, {form.name}!</h3>
            <p>
              {hasQuoteItems ? (
                <>
                  Your order has been received. Our team will review any custom
                  prescription items and contact you on{" "}
                  <strong>{form.phone}</strong> with final pricing.
                </>
              ) : (
                <>
                  Your payment was successful. We'll contact you on{" "}
                  <strong>{form.phone}</strong> to arrange{" "}
                  {form.fulfillment === "pickup" ? "pickup" : "delivery"}.
                </>
              )}
            </p>
            <button className="btn btn--primary btn--lg" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="checkout-modal__body">
            {/* Order summary */}
            <div className="checkout-summary">
              <h3 className="checkout-summary__title">Order summary</h3>
              <ul className="checkout-summary__items">
                {items.map((i) => (
                  <li key={i.key} className="checkout-summary__item">
                    <span>
                      {i.product.name}{" "}
                      <span className="checkout-summary__qty">×{i.qty}</span>
                      {i.options?.isQuote && (
                        <span className="checkout-summary__quote-tag">
                          Quote needed
                        </span>
                      )}
                    </span>
                    <span>
                      {i.options?.isQuote ? "—" : fmt(i.product.price * i.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              {deliveryFee > 0 && (
                <div className="checkout-summary__delivery-fee">
                  <span>🚚 Delivery fee</span>
                  <span>{fmt(deliveryFee)}</span>
                </div>
              )}
              <div className="checkout-summary__total">
                <span>Total {hasQuoteItems && "(excl. quote items)"}</span>
                <span>{fmt(payableTotal)}</span>
              </div>
              {hasQuoteItems && (
                <p className="checkout-summary__quote-note">
                  💬 Custom prescription pricing will be sent to you privately
                  after review.
                </p>
              )}
            </div>

            {/* Customer + fulfillment details */}
            <div className="checkout-form">
              <h3 className="checkout-form__title">Your details</h3>

              <div className="checkout-field">
                <label>Full name *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={set("name")}
                  className={errors.name ? "input--error" : ""}
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              <div className="checkout-field">
                <label>Email address *</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className={errors.email ? "input--error" : ""}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>

              <div className="checkout-field">
                <label>Phone number *</label>
                <input
                  type="tel"
                  placeholder="+234 ..."
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="numeric"
                  className={errors.phone ? "input--error" : ""}
                />
                {errors.phone && (
                  <span className="field-error">{errors.phone}</span>
                )}
              </div>

              {/* Fulfillment toggle */}
              <div className="checkout-field">
                <label>How would you like to receive your order? *</label>
                <div className="checkout-toggle-row">
                  <button
                    type="button"
                    className={`checkout-toggle-btn${form.fulfillment === "pickup" ? " active" : ""}`}
                    onClick={() =>
                      setForm((f) => ({ ...f, fulfillment: "pickup" }))
                    }
                  >
                    🏥 Pickup at clinic
                  </button>
                  <button
                    type="button"
                    className={`checkout-toggle-btn${form.fulfillment === "dispatch" ? " active" : ""}`}
                    onClick={() =>
                      setForm((f) => ({ ...f, fulfillment: "dispatch" }))
                    }
                  >
                    🚚 Dispatch / Delivery
                  </button>
                </div>
              </div>

              {form.fulfillment === "pickup" ? (
                <div className="checkout-field">
                  <label>Pickup location *</label>
                  <div
                    className={`checkout-select-wrap${errors.location ? " checkout-select-wrap--error" : ""}`}
                  >
                    <select value={form.location} onChange={set("location")}>
                      <option value="">Select location</option>
                      {contactInfo.locations.map((loc) => (
                        <option key={loc.name} value={loc.name}>
                          {loc.name} — {loc.short}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                  {errors.location && (
                    <span className="field-error">{errors.location}</span>
                  )}
                </div>
              ) : (
                <div className="checkout-field">
                  <label>Delivery address *</label>
                  <textarea
                    rows={2}
                    placeholder="Enter your full delivery address"
                    value={form.address}
                    onChange={set("address")}
                    className={errors.address ? "input--error" : ""}
                  />
                  {errors.address && (
                    <span className="field-error">{errors.address}</span>
                  )}
                </div>
              )}

              <button
                className="btn btn--primary btn--lg checkout-form__pay"
                onClick={handleSubmit}
                disabled={step === "paying"}
              >
                {step === "paying"
                  ? "Processing…"
                  : payableTotal > 0
                    ? `Pay ${fmt(payableTotal)}`
                    : "Submit order request"}
              </button>

              <p className="checkout-form__note">
                <LockIcon />{" "}
                {payableTotal > 0
                  ? "Secured by Paystack. Your payment details are encrypted."
                  : "No payment required — we will contact you with a quote."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const LockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline", marginRight: 4 }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ChevronIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
