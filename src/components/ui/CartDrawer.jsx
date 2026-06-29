import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CheckoutModal from "./CheckoutModal";
import "./CartDrawer.css";

const fmt = (n) => "₦" + n.toLocaleString("en-NG");

export default function CartDrawer() {
  const {
    items,
    total,
    count,
    removeFromCart,
    updateQty,
    setDrawer,
    drawerOpen,
  } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div className="cart-backdrop" onClick={() => setDrawer(false)} />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${drawerOpen ? "cart-drawer--open" : ""}`}>
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <CartIcon />
            <span>Your cart</span>
            {count > 0 && <span className="cart-drawer__count">{count}</span>}
          </div>
          <button
            className="cart-drawer__close"
            onClick={() => setDrawer(false)}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">
                <CartIcon />
              </div>
              <p>Your cart is empty</p>
              <Link
                to="/shop"
                className="btn btn--outline"
                onClick={() => setDrawer(false)}
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__items">
              {items.map(({ product, qty, options, key }) => (
                <li key={key} className="cart-item">
                  <div className="cart-item__illustration">
                    <EyeglassIllustration category={product.category[0]} />
                  </div>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{product.name}</p>
                    {options && (
                      <p className="cart-item__options">
                        RE: {options.re} · LE: {options.le} · {options.color}
                      </p>
                    )}
                    <p className="cart-item__price">{fmt(product.price)}</p>
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQty(key, qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{qty}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQty(key, qty + 1)}
                        aria-label="Increase quantity"
                        disabled={qty >= (product.stock_qty ?? Infinity)}
                        style={
                          qty >= (product.stock_qty ?? Infinity)
                            ? { opacity: 0.35, cursor: "not-allowed" }
                            : {}
                        }
                      >
                        +
                      </button>
                    </div>
                    {qty >= (product.stock_qty ?? Infinity) && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#9B2D1F",
                          margin: "4px 0 0",
                          fontWeight: 500,
                        }}
                      >
                        Max stock reached
                      </p>
                    )}
                  </div>
                  <div className="cart-item__right">
                    <p className="cart-item__subtotal">
                      {fmt(product.price * qty)}
                    </p>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeFromCart(key)}
                      aria-label="Remove item"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <span className="cart-drawer__total-value">{fmt(total)}</span>
            </div>
            <button
              className="btn btn--primary btn--lg cart-drawer__checkout"
              onClick={() => {
                setDrawer(false);
                setShowCheckout(true);
              }}
            >
              Checkout <ArrowIcon />
            </button>
            <Link
              to="/shop"
              className="btn btn--outline cart-drawer__continue"
              onClick={() => setDrawer(false)}
            >
              Continue shopping
            </Link>
          </div>
        )}
      </div>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </>
  );
}

/* ─── Mini eye illustration for cart items ─── */
function EyeglassIllustration({ category }) {
  const colors = {
    frames: { bg: "#FDF0EE", stroke: "#9B2D1F" },
    contacts: { bg: "#EEF4FF", stroke: "#1E40AF" },
    sunglasses: { bg: "#FFF8E1", stroke: "#A07200" },
  };
  const c = colors[category] || colors.frames;
  return (
    <svg
      viewBox="0 0 80 50"
      width="100%"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect width="80" height="50" fill={c.bg} rx="6" />
      {category === "contacts" ? (
        <>
          <circle
            cx="28"
            cy="25"
            r="12"
            fill="none"
            stroke={c.stroke}
            strokeWidth="2.5"
          />
          <circle
            cx="28"
            cy="25"
            r="5"
            fill="none"
            stroke={c.stroke}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <circle
            cx="52"
            cy="25"
            r="12"
            fill="none"
            stroke={c.stroke}
            strokeWidth="2.5"
          />
          <circle
            cx="52"
            cy="25"
            r="5"
            fill="none"
            stroke={c.stroke}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        </>
      ) : (
        <>
          <rect
            x="8"
            y="16"
            width="26"
            height="18"
            rx={category === "sunglasses" ? 9 : 4}
            fill={c.bg}
            stroke={c.stroke}
            strokeWidth="2.5"
          />
          <rect
            x="46"
            y="16"
            width="26"
            height="18"
            rx={category === "sunglasses" ? 9 : 4}
            fill={c.bg}
            stroke={c.stroke}
            strokeWidth="2.5"
          />
          <line
            x1="34"
            y1="25"
            x2="46"
            y2="25"
            stroke={c.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="20"
            x2="8"
            y2="22"
            stroke={c.stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="77"
            y1="20"
            x2="72"
            y2="22"
            stroke={c.stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {category === "sunglasses" && (
            <>
              <rect
                x="11"
                y="19"
                width="20"
                height="12"
                rx="6"
                fill={c.stroke}
                opacity="0.15"
              />
              <rect
                x="49"
                y="19"
                width="20"
                height="12"
                rx="6"
                fill={c.stroke}
                opacity="0.15"
              />
            </>
          )}
        </>
      )}
    </svg>
  );
}

const CartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
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
const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
