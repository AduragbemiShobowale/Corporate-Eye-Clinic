import React, { useState, useEffect, useRef, useCallback } from "react";
import { shopCategories } from "../data/siteData";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import PrescriptionGlassesSection from "../components/ui/PrescriptionGlassesSection";
import ContactLensPrescriptionSection from "../components/ui/ContactLensPrescriptionSection";
import OrderRequestSuccessModal from "../components/ui/OrderRequestSuccessModal";
import "./ShopPage.css";

const fmt = (n) => "₦" + n.toLocaleString("en-NG");
function formatNGN(n) {
  return "₦" + n.toLocaleString("en-NG");
}

// ── Skeleton loader card ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="shop__skeleton-card">
      <div className="shop__skeleton-img" />
      <div className="shop__skeleton-body">
        <div className="shop__skeleton-line shop__skeleton-line--short" />
        <div className="shop__skeleton-line" />
        <div className="shop__skeleton-line shop__skeleton-line--price" />
        <div className="shop__skeleton-btn" />
      </div>
    </div>
  );
}

// ── Mouse-follow empty / no-results state ────────────────────────
function ShopEmptyState({ search }) {
  const containerRef = useRef(null);
  const glassesRef = useRef(null);
  const particle1Ref = useRef(null);
  const particle2Ref = useRef(null);
  const particle3Ref = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };

    // Touch support
    const handleTouch = (e) => {
      const t = e.touches[0];
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: ((t.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((t.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };

    const animate = () => {
      // Smooth lerp toward target
      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * 0.06;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * 0.06;
      const { x, y } = currentRef.current;

      if (glassesRef.current) {
        glassesRef.current.style.transform = `translate(${x * 22}px, ${y * 14}px) rotate(${x * 4}deg)`;
      }
      if (particle1Ref.current) {
        particle1Ref.current.style.transform = `translate(${x * 36}px, ${y * 28}px)`;
      }
      if (particle2Ref.current) {
        particle2Ref.current.style.transform = `translate(${x * -28}px, ${y * 20}px)`;
      }
      if (particle3Ref.current) {
        particle3Ref.current.style.transform = `translate(${x * 18}px, ${y * -30}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    container.addEventListener("touchmove", handleTouch, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      container.removeEventListener("touchmove", handleTouch);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="shop__empty-state" ref={containerRef}>
      {/* Floating particles */}
      <div
        className="shop__empty-particle shop__empty-particle--1"
        ref={particle1Ref}
      />
      <div
        className="shop__empty-particle shop__empty-particle--2"
        ref={particle2Ref}
      />
      <div
        className="shop__empty-particle shop__empty-particle--3"
        ref={particle3Ref}
      />

      {/* Glasses SVG that follows the mouse */}
      <div className="shop__empty-glasses" ref={glassesRef}>
        <svg width="140" height="64" viewBox="0 0 140 64" fill="none">
          {/* Left lens */}
          <rect
            x="4"
            y="8"
            width="54"
            height="44"
            rx="22"
            stroke="#0D1B3E"
            strokeWidth="5"
            fill="rgba(13,27,62,0.05)"
          />
          {/* Right lens */}
          <rect
            x="82"
            y="8"
            width="54"
            height="44"
            rx="22"
            stroke="#0D1B3E"
            strokeWidth="5"
            fill="rgba(13,27,62,0.05)"
          />
          {/* Bridge */}
          <path
            d="M58 28 C64 22 76 22 82 28"
            stroke="#0D1B3E"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Left arm */}
          <line
            x1="4"
            y1="24"
            x2="-10"
            y2="24"
            stroke="#0D1B3E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Right arm */}
          <line
            x1="136"
            y1="24"
            x2="150"
            y2="24"
            stroke="#0D1B3E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Gold shimmer inside lenses */}
          <ellipse cx="27" cy="26" rx="12" ry="8" fill="rgba(160,114,0,0.12)" />
          <ellipse
            cx="109"
            cy="26"
            rx="12"
            ry="8"
            fill="rgba(160,114,0,0.12)"
          />
        </svg>
      </div>

      <div className="shop__empty-text">
        {search ? (
          <>
            <h3>
              No results for "<strong>{search}</strong>"
            </h3>
            <p>Try a different search term or browse our categories above.</p>
          </>
        ) : (
          <>
            <h3>No products here yet</h3>
            <p>Check back soon — new eyewear is on its way.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [active, setActive] = useState("all");
  const { addToCart, items } = useCart();
  const [successName, setSuccessName] = useState(null);
  const [contactsMode, setContactsMode] = useState("regular");
  const [prescriptionType, setPrescriptionType] = useState("glasses");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    supabase
      .from("products")
      .select(
        "id, name, price, category, tag, stock_qty, discount_percent, image_url",
      )
      .order("name", { ascending: true })
      .then(({ data }) => {
        setProducts(data || []);
        setLoadingProducts(false);
      });
  }, []);

  const handleCategoryClick = (catId) => {
    setActive(catId);
    setSearch("");
    setPage(1);
    if (catId !== "contacts") setContactsMode("regular");
  };

  // Filter by category then by search query
  const categoryFiltered =
    active === "all"
      ? products
      : products.filter((p) => p.category.includes(active));

  const filtered = search.trim()
    ? categoryFiltered.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : categoryFiltered;

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setPage(1);
  }, [search, active]);

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

          {/* ── Search bar ── */}
          {active !== "prescription" && (
            <div className="shop__search-wrap">
              <svg
                className="shop__search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="shop__search-input"
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="shop__search-clear"
                  onClick={() => setSearch("")}
                >
                  ✕
                </button>
              )}
            </div>
          )}

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
          ) : loadingProducts ? (
            <div className="shop__grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <ShopEmptyState search={search} />
          ) : (
            <>
              {/* Results count */}
              {search && (
                <p className="shop__results-count">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""} for
                  "<strong>{search}</strong>"
                </p>
              )}
              <div className="shop__grid">
                {paginated.map((p) => {
                  const outOfStock = p.stock_qty === 0;
                  const discountedPrice =
                    p.discount_percent > 0
                      ? Math.round(p.price * (1 - p.discount_percent / 100))
                      : null;

                  return (
                    <div
                      key={p.id}
                      className={`card card--hover shop__card${outOfStock ? " shop__card--oos" : ""}`}
                    >
                      <div className="shop__card-img" aria-hidden="true">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="shop__card-photo"
                          />
                        ) : (
                          <EyeglassIllustration category={p.category[0]} />
                        )}
                        {outOfStock && (
                          <div className="shop__oos-overlay">
                            <span>Out of stock</span>
                          </div>
                        )}
                      </div>
                      <div className="shop__card-body">
                        {p.tag && (
                          <span className="badge badge--teal shop__tag">
                            {p.tag}
                          </span>
                        )}
                        <h3 className="shop__card-name">{p.name}</h3>
                        <div className="shop__card-price-wrap">
                          {discountedPrice ? (
                            <>
                              <p className="shop__card-price shop__card-price--discounted">
                                {formatNGN(discountedPrice)}
                              </p>
                              <p className="shop__card-price--original">
                                {formatNGN(p.price)}
                              </p>
                              <span className="shop__discount-badge">
                                {p.discount_percent}% off
                              </span>
                            </>
                          ) : (
                            <p className="shop__card-price">
                              {formatNGN(p.price)}
                            </p>
                          )}
                        </div>

                        {/* Stock indicator — always shown */}
                        {!outOfStock && (
                          <p
                            className={`shop__stock-label${
                              p.stock_qty <= 3
                                ? " shop__stock-label--critical"
                                : p.stock_qty <= 10
                                  ? " shop__stock-label--low"
                                  : " shop__stock-label--ok"
                            }`}
                          >
                            {p.stock_qty <= 3
                              ? "🔴"
                              : p.stock_qty <= 10
                                ? "🟡"
                                : "🟢"}{" "}
                            {p.stock_qty <= 3
                              ? `Only ${p.stock_qty} left — order soon`
                              : p.stock_qty <= 10
                                ? `Only ${p.stock_qty} left`
                                : `${p.stock_qty} in stock`}
                          </p>
                        )}

                        <AddToCartBtn product={p} disabled={outOfStock} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="shop__pagination">
                  <button
                    className="shop__page-btn"
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        className={`shop__page-btn${page === n ? " shop__page-btn--active" : ""}`}
                        onClick={() => {
                          setPage(n);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {n}
                      </button>
                    ),
                  )}

                  <button
                    className="shop__page-btn"
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
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

      {successName !== null && (
        <OrderRequestSuccessModal
          name={successName}
          onClose={() => setSuccessName(null)}
        />
      )}

      <FloatingCart />
    </>
  );
}

function AddToCartBtn({ product, disabled }) {
  const { addToCart, items } = useCart();
  const [flash, setFlash] = React.useState(false);
  const inCart = items.find((i) => i.product.id === product.id);

  if (disabled) {
    return (
      <button
        className="btn btn--primary shop__add-btn shop__add-btn--oos"
        disabled
      >
        Out of stock
      </button>
    );
  }

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
