import { useState } from "react";
import { useCart } from "../../context/CartContext";
import "./CheckoutModal.css";

const fmt = (n) => "₦" + n.toLocaleString("en-NG");

// ── Replace with your real Paystack public key ──
const PAYSTACK_PUBLIC_KEY = "pk_test_1b9fdf16809a6da56ce4f9e59592732352bc8cf7";

export default function CheckoutModal({ onClose }) {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // 'form' | 'paying' | 'success'

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "phone" && !/^[0-9\s+\-()\b]*$/.test(v)) return;
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
    else if (form.phone.replace(/[\s+\-()]/g, "").length < 7)
      e.phone = "Enter a valid phone number";
    return e;
  };

  const initPaystack = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep("paying");

    // Load Paystack inline script dynamically
    const existingScript = document.getElementById("paystack-script");
    const launch = () => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: form.email,
        amount: total * 100, // Paystack uses kobo
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
              display_name: "Items",
              variable_name: "items",
              value: items.map((i) => `${i.product.name} x${i.qty}`).join(", "),
            },
          ],
        },
        callback: () => {
          clearCart();
          setStep("success");
        },
        onClose: () => {
          setStep("form");
        },
      });
      handler.openIframe();
    };

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

  return (
    <div
      className="checkout-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="checkout-modal" role="dialog" aria-modal="true">
        {/* Header */}
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
              Your payment was successful. We'll contact you on{" "}
              <strong>{form.phone}</strong> to arrange collection or delivery.
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
                {items.map(({ product, qty }) => (
                  <li key={product.id} className="checkout-summary__item">
                    <span>
                      {product.name}{" "}
                      <span className="checkout-summary__qty">×{qty}</span>
                    </span>
                    <span>{fmt(product.price * qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="checkout-summary__total">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            {/* Customer details */}
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

              <button
                className="btn btn--primary btn--lg checkout-form__pay"
                onClick={initPaystack}
                disabled={step === "paying"}
              >
                {step === "paying" ? "Opening Paystack…" : `Pay ${fmt(total)}`}
              </button>

              <p className="checkout-form__note">
                <LockIcon /> Secured by Paystack. Your payment details are
                encrypted.
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
