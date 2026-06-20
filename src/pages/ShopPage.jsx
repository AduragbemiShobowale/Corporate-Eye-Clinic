import React, { useState } from "react";
import { shopCategories } from "../data/siteData";
import { useCart } from "../context/CartContext";
import PrescriptionGlassesSection from "../components/ui/PrescriptionGlassesSection";
import ContactLensPrescriptionSection from "../components/ui/ContactLensPrescriptionSection";
import OrderRequestSuccessModal from "../components/ui/OrderRequestSuccessModal";
import "./ShopPage.css";

const fmt = (n) => "₦" + n.toLocaleString("en-NG");

const products = [
  {
    id: 1,
    name: "Classic Oval Frame",
    price: 35000,
    category: ["frames", "for-her"],
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Bold Square Frame",
    price: 28000,
    category: ["frames", "for-him"],
    tag: null,
  },
  {
    id: 3,
    name: "Kids Flex Frame",
    price: 18000,
    category: ["frames", "for-kids"],
    tag: "New",
  },
  {
    id: 4,
    name: "Aviator Sunglasses",
    price: 42000,
    category: ["sunglasses", "for-him"],
    tag: null,
  },
  {
    id: 5,
    name: "Cat-Eye Sunglasses",
    price: 38000,
    category: ["sunglasses", "for-her"],
    tag: "Bestseller",
  },
  {
    id: 6,
    name: "Daily Contact Lenses (30pk)",
    price: 22000,
    category: ["contacts"],
    tag: null,
  },
  {
    id: 7,
    name: "Monthly Contact Lenses (6pk)",
    price: 32000,
    category: ["contacts"],
    tag: "25% off first order",
  },
  {
    id: 8,
    name: "Rimless Reading Glasses",
    price: 15000,
    category: ["frames", "for-him", "for-her"],
    tag: null,
  },
  {
    id: 9,
    name: "Kids Sunglasses",
    price: 12000,
    category: ["sunglasses", "for-kids"],
    tag: "New",
  },
];

function formatNGN(n) {
  return "₦" + n.toLocaleString("en-NG");
}

export default function ShopPage() {
  const [active, setActive] = useState("all");
  const { addToCart, items } = useCart();
  const [successName, setSuccessName] = useState(null);
  const [contactsMode, setContactsMode] = useState("regular"); // 'regular' | 'prescription'
  const [prescriptionType, setPrescriptionType] = useState("glasses"); // 'glasses' | 'contacts'

  // Reset contacts sub-mode whenever category changes away from contacts
  const handleCategoryClick = (catId) => {
    setActive(catId);
    if (catId !== "contacts") setContactsMode("regular");
  };

  const filtered =
    active === "all"
      ? products
      : products.filter((p) => p.category.includes(active));

  return (
    <>
      {/* ── Photo Hero ── */}
      <div className="page-hero shop-page-hero">
        <div className="page-hero__photo" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1600&q=85"
            alt=""
          />
        </div>
        <div className="page-hero__overlay" aria-hidden="true" />
        <div className="page-hero__content">
          <span className="page-hero__badge">
            ✦ Affordable eyewear for every family
          </span>
          <h1>
            Shop <span>Eyewear</span>
          </h1>
          <p>
            Designer frames, contact lenses, and sunglasses — for every member
            of the family. 25% off your first contacts order.
          </p>
        </div>
      </div>

      {/* ── Promo bar ── */}
      <div className="shop-promo">
        <div className="container shop-promo__inner">
          <span className="badge badge--amber">Limited offer</span>
          <span className="shop-promo__text">
            <strong>25% off your first contact lens order.</strong> Use code{" "}
            <code>FIRSTLENS</code> at checkout.
          </span>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="shop__filters">
            {shopCategories.map((cat) => (
              <button
                key={cat.id}
                className={
                  "shop__filter-btn" +
                  (active === cat.id ? " active" : "") +
                  (cat.id === "prescription" ? " shop__filter-btn--rx" : "")
                }
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.id === "prescription" && "📋 "}
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Contact Lenses: Regular vs Prescription inline switch ── */}
          {active === "contacts" && (
            <div className="shop__mode-switch">
              <button
                className={`shop__mode-btn${contactsMode === "regular" ? " active" : ""}`}
                onClick={() => setContactsMode("regular")}
              >
                🛍️ Regular — browse & buy
              </button>
              <button
                className={`shop__mode-btn${contactsMode === "prescription" ? " active" : ""}`}
                onClick={() => setContactsMode("prescription")}
              >
                📋 I have a prescription
              </button>
            </div>
          )}

          {/* ── Prescription tab: Glasses vs Contacts switch ── */}
          {active === "prescription" && (
            <div className="shop__mode-switch">
              <button
                className={`shop__mode-btn${prescriptionType === "glasses" ? " active" : ""}`}
                onClick={() => setPrescriptionType("glasses")}
              >
                👓 Glasses
              </button>
              <button
                className={`shop__mode-btn${prescriptionType === "contacts" ? " active" : ""}`}
                onClick={() => setPrescriptionType("contacts")}
              >
                👁️ Contact Lenses
              </button>
            </div>
          )}

          {/* ── Main content area: grid OR prescription form ── */}
          {active === "prescription" ? (
            prescriptionType === "glasses" ? (
              <PrescriptionGlassesSection
                onSuccess={(name) => setSuccessName(name)}
                inline
              />
            ) : (
              <ContactLensPrescriptionSection
                onSuccess={(name) => setSuccessName(name)}
                inline
              />
            )
          ) : active === "contacts" && contactsMode === "prescription" ? (
            <ContactLensPrescriptionSection
              onSuccess={(name) => setSuccessName(name)}
              inline
            />
          ) : filtered.length === 0 ? (
            <div className="shop__empty">
              <p>No products found in this category yet. Check back soon!</p>
            </div>
          ) : (
            <div className="shop__grid">
              {filtered.map((p) => (
                <div key={p.id} className="card card--hover shop__card">
                  <div className="shop__card-img" aria-hidden="true">
                    <EyeglassIllustration category={p.category[0]} />
                  </div>
                  <div className="shop__card-body">
                    {p.tag && (
                      <span className="badge badge--teal shop__tag">
                        {p.tag}
                      </span>
                    )}
                    <h3 className="shop__card-name">{p.name}</h3>
                    <p className="shop__card-price">{formatNGN(p.price)}</p>
                    <AddToCartBtn product={p} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="shop__note card">
            <EyeIcon />
            <div>
              <h3>Need help choosing?</h3>
              <p>
                Book a free frame-fitting consultation with our optometrist and
                get personalised recommendations for your face shape,
                prescription, and lifestyle.
              </p>
              <a
                href="/contact"
                className="btn btn--primary"
                style={{ marginTop: "1rem", display: "inline-flex" }}
              >
                Book a consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Small success confirmation modal ── */}
      {successName !== null && (
        <OrderRequestSuccessModal
          name={successName}
          onClose={() => setSuccessName(null)}
        />
      )}

      {/* ── Floating cart bar ── */}
      <FloatingCart />
    </>
  );
}

function AddToCartBtn({ product }) {
  const { addToCart, items } = useCart();
  const [flash, setFlash] = React.useState(false);
  const inCart = items.find((i) => i.product.id === product.id);

  const handleAdd = () => {
    addToCart(product);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  return (
    <button
      className={`btn btn--primary shop__add-btn${flash ? " shop__add-btn--flash" : ""}`}
      onClick={handleAdd}
    >
      {inCart ? (
        <>
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
          In cart ({inCart.qty})
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
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
          Add to cart
        </>
      )}
    </button>
  );
}

function FloatingCart() {
  const { count, total, setDrawer } = useCart();
  if (count === 0) return null;
  return (
    <div className="shop-cart-bar" onClick={() => setDrawer(true)}>
      <div className="shop-cart-bar__left">
        <span className="shop-cart-bar__badge">{count}</span>
        <span className="shop-cart-bar__label">View cart</span>
      </div>
      <div className="shop-cart-bar__right">
        <span className="shop-cart-bar__total">{fmt(total)}</span>
        <svg
          width="18"
          height="18"
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
      </div>
    </div>
  );
}

/* ─── SVG Illustrations ─────────────────────────────────────── */
function GlassesFrameSVG({ color = "#9FE1CB" }) {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="20"
        width="70"
        height="42"
        rx="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <rect
        x="120"
        y="20"
        width="70"
        height="42"
        rx="12"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <line
        x1="80"
        y1="41"
        x2="120"
        y2="41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="28"
        x2="10"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="190"
        y1="28"
        x2="198"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunglassesSVG({ color = "#C9A84C" }) {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="10"
        y="20"
        width="70"
        height="42"
        rx="21"
        stroke={color}
        strokeWidth="4"
        fill={color}
        fillOpacity="0.15"
      />
      <rect
        x="120"
        y="20"
        width="70"
        height="42"
        rx="21"
        stroke={color}
        strokeWidth="4"
        fill={color}
        fillOpacity="0.15"
      />
      <line
        x1="80"
        y1="41"
        x2="120"
        y2="41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="28"
        x2="10"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="190"
        y1="28"
        x2="198"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlassesRoundSVG({ color = "#9FE1CB" }) {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="55"
        cy="41"
        r="30"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="145"
        cy="41"
        r="30"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <line
        x1="85"
        y1="41"
        x2="115"
        y2="41"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="28"
        x2="25"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="198"
        y1="28"
        x2="175"
        y2="34"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContactLensSVG({ color = "#9FE1CB" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r="22"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="6 4"
        fill="none"
      />
      <circle cx="50" cy="50" r="8" fill={color} fillOpacity="0.4" />
    </svg>
  );
}

function EyeglassIllustration({ category }) {
  const colors = {
    frames: { bg: "#E1F5EE", stroke: "#0F6E56" },
    contacts: { bg: "#E6F1FB", stroke: "#185FA5" },
    sunglasses: { bg: "#FAEEDA", stroke: "#BA7517" },
  };
  const c = colors[category] || colors.frames;
  return (
    <svg
      viewBox="0 0 160 100"
      width="100%"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect width="160" height="100" fill={c.bg} rx="8" />
      {category === "contacts" ? (
        <>
          <circle
            cx="60"
            cy="50"
            r="22"
            fill="none"
            stroke={c.stroke}
            strokeWidth="3"
          />
          <circle
            cx="60"
            cy="50"
            r="10"
            fill="none"
            stroke={c.stroke}
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <circle
            cx="100"
            cy="50"
            r="22"
            fill="none"
            stroke={c.stroke}
            strokeWidth="3"
          />
          <circle
            cx="100"
            cy="50"
            r="10"
            fill="none"
            stroke={c.stroke}
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </>
      ) : (
        <>
          <rect
            x="18"
            y="35"
            width="52"
            height="32"
            rx={category === "sunglasses" ? 16 : 8}
            fill={c.bg}
            stroke={c.stroke}
            strokeWidth="3"
          />
          <rect
            x="90"
            y="35"
            width="52"
            height="32"
            rx={category === "sunglasses" ? 16 : 8}
            fill={c.bg}
            stroke={c.stroke}
            strokeWidth="3"
          />
          <line
            x1="70"
            y1="51"
            x2="90"
            y2="51"
            stroke={c.stroke}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="44"
            x2="18"
            y2="48"
            stroke={c.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="142"
            y1="44"
            x2="152"
            y2="48"
            stroke={c.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {category === "sunglasses" && (
            <>
              <rect
                x="22"
                y="39"
                width="44"
                height="24"
                rx="12"
                fill={c.stroke}
                opacity="0.15"
              />
              <rect
                x="94"
                y="39"
                width="44"
                height="24"
                rx="12"
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

const EyeIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--teal-700)", flexShrink: 0, marginTop: "4px" }}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
