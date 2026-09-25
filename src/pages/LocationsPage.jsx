import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import "./LocationsPage.css";

/* Cloudinary delivery base — f_auto/q_auto keeps these fast on mobile */
const CLD_BASE =
  "https://res.cloudinary.com/dgde8cwjk/image/upload/f_auto,q_auto,w_900";

const METHODIST_ROAD_PHOTOS = [
  {
    v: "1789144769",
    id: "methodist-road-01-roadside-signage_sz64bk",
    caption: "Spot us from the road — our sign is hard to miss.",
  },
  {
    v: "1789144768",
    id: "methodist-road-02-storefront-signage_xwhz9b",
    caption:
      "Our storefront, right next to Living Proofs Bakery & Supermarket.",
  },
  {
    v: "1789144768",
    id: "methodist-road-03-entrance_bjuvmp",
    caption: "Welcome in — our door is open during business hours.",
  },
  {
    v: "1789144769",
    id: "methodist-road-15-entrance-angle-2_gmelm4",
    caption: "Just up the walkway from the street.",
  },
  {
    v: "1789144776",
    id: "methodist-road-04-optical-showroom_slupyg",
    caption: "Browse our full range of frames and sunglasses.",
  },
  {
    v: "1789144771",
    id: "methodist-road-09-optical-showroom-2_fttkzv",
    caption: "More styles on display — something for every face.",
  },
  {
    v: "1789144772",
    id: "methodist-road-10-frames-display_frycdk",
    caption: "Designer cases and premium frames, ready to try on.",
  },
  {
    v: "1789144773",
    id: "methodist-road-05-exam-room-equipment_ycgkwq",
    caption: "One of our exam rooms, fully equipped.",
  },
  {
    v: "1789144770",
    id: "methodist-road-14-exam-room-equipment-2_c5a4ni",
    caption: "A closer look at our diagnostic equipment.",
  },
  {
    v: "1789144774",
    id: "methodist-road-06-exam-in-progress_ark1lq",
    caption: "A routine eye exam in progress.",
  },
  {
    v: "1789144771",
    id: "methodist-road-07-phoropter-closeup_a7nxxc",
    caption: "Getting your prescription just right.",
  },
  {
    v: "1789144769",
    id: "methodist-road-11-phoropter-exam_csgpjl",
    caption: "Fine-tuning your lenses during a refraction test.",
  },
  {
    v: "1789144771",
    id: "methodist-road-12-autorefractor-in-use_fitcwd",
    caption: "Quick, precise readings with our autorefractor.",
  },
  {
    v: "1789144772",
    id: "methodist-road-08-consultation-room_oetxxa",
    caption: "Our doctors take time to explain every step.",
  },
  {
    v: "1789144769",
    id: "methodist-road-13-front-desk_aihf6l",
    caption: "Say hello at the front desk when you arrive.",
  },
];

const OLUYOLE_PHOTOS = [
  {
    v: "1789144775",
    id: "oluyole-01-building-exterior_xkukhw",
    caption: "Our Oluyole branch — easy to find, hard to miss.",
  },
  {
    v: "1789145274",
    id: "oluyole-09-street-approach_r8kgi3",
    caption: "The walk up to our entrance.",
  },
  {
    v: "1789144775",
    id: "oluyole-02-entrance_wibfim",
    caption: "Come in, we're open.",
  },
  {
    v: "1789144768",
    id: "oluyole-06-street-context_hbvznx",
    caption: "Located in a well-known business area.",
  },
  {
    v: "1789144773",
    id: "oluyole-03-optical-showroom_yph0ta",
    caption: "A bright, well-stocked optical showroom.",
  },
  {
    v: "1789145273",
    id: "oluyole-10-customers-browsing_oxpuhw",
    caption: "Customers browsing our frame selection.",
  },
  {
    v: "1789145275",
    id: "oluyole-11-showroom-activity_umtsd1",
    caption: "Our team helping a customer choose frames.",
  },
  {
    v: "1789145273",
    id: "oluyole-12-team-showroom_mnrgop",
    caption: "Always someone on hand to help you pick the right pair.",
  },
  {
    v: "1789145273",
    id: "oluyole-13-showroom-activity-2_dffh6r",
    caption: "Finding the perfect fit takes teamwork.",
  },
  {
    v: "1789145273",
    id: "oluyole-15-customer-trying-glasses_qwi2fd",
    caption: "Try before you buy — we encourage it.",
  },
  {
    v: "1789144770",
    id: "oluyole-07-front-desk_la6kns",
    caption: "Our front desk team is ready to welcome you.",
  },
  {
    v: "1789145272",
    id: "oluyole-14-waiting-area_zld8vp",
    caption: "A comfortable space to wait before your appointment.",
  },
  {
    v: "1789144771",
    id: "oluyole-05-exam-room_di2aty",
    caption: "Modern equipment for accurate results.",
  },
  {
    v: "1789144768",
    id: "oluyole-08-exam-room-empty_ikvfb5",
    caption: "Another look inside one of our exam rooms.",
  },
  {
    v: "1789144772",
    id: "oluyole-04-consultation-room_uskbiz",
    caption: "Consultations are unhurried and thorough.",
  },
];

const BRANCHES = [
  {
    key: "methodist-road",
    label: "Bodija (Head Office)",
    photos: METHODIST_ROAD_PHOTOS,
    comingSoon: false,
  },
  {
    key: "oluyole",
    label: "Oluyole",
    photos: OLUYOLE_PHOTOS,
    comingSoon: false,
  },
];

function cldUrl(photo) {
  return `${CLD_BASE}/v${photo.v}/${photo.id}.jpg`;
}

/* Larger version for the full-view lightbox */
function cldUrlLarge(photo) {
  return `https://res.cloudinary.com/dgde8cwjk/image/upload/f_auto,q_auto,w_1600/v${photo.v}/${photo.id}.jpg`;
}

export default function LocationsPage() {
  const [activeKey, setActiveKey] = useState(BRANCHES[0].key);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const active = BRANCHES.find((b) => b.key === activeKey);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () =>
    setLightboxIndex(
      (i) => (i - 1 + active.photos.length) % active.photos.length,
    );
  const showNext = () =>
    setLightboxIndex((i) => (i + 1) % active.photos.length);

  return (
    <div className="locations-page">
      <SEO
        path="/locations"
        title="Our Locations"
        description="Find Corporate Eye Clinic's branches in Bodija and Oluyole, Ibadan — photos, directions, and what to expect when you visit."
      />
      <div className="locations-page__header">
        <span className="locations-soon__badge">Our Branches</span>
        <h1 className="locations-page__title">Visit Us in Ibadan</h1>
        <p className="locations-page__subtitle">
          Take a look around before you come in — here's what to expect when you
          arrive at each of our branches.
        </p>
      </div>

      <div className="locations-page__tabs" role="tablist">
        {BRANCHES.map((b) => (
          <button
            key={b.key}
            role="tab"
            aria-selected={activeKey === b.key}
            className={`locations-page__tab${
              activeKey === b.key ? " locations-page__tab--active" : ""
            }`}
            onClick={() => {
              setActiveKey(b.key);
              closeLightbox();
            }}
          >
            {b.label}
            {b.comingSoon && (
              <span className="locations-page__tab-badge">Soon</span>
            )}
          </button>
        ))}
      </div>

      {active.comingSoon ? (
        <ComingSoonPanel branchLabel={active.label} />
      ) : (
        <PhotoGallery branch={active} onPhotoClick={openLightbox} />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          branch={active}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}

      <div className="locations-page__actions">
        <a
          href="https://wa.me/2348033372738"
          target="_blank"
          rel="noreferrer"
          className="btn btn--primary btn--lg"
        >
          WhatsApp us for directions
        </a>
        <Link to="/contact" className="btn btn--outline btn--lg">
          View address details
        </Link>
      </div>
    </div>
  );
}

/* ─── Photo gallery — horizontal scroll-snap, swipe on mobile ──── */
function PhotoGallery({ branch, onPhotoClick }) {
  return (
    <div className="locations-gallery">
      <div className="locations-gallery__track">
        {branch.photos.map((photo, i) => (
          <figure
            className="locations-gallery__card"
            key={photo.id}
            role="button"
            tabIndex={0}
            onClick={() => onPhotoClick(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPhotoClick(i);
              }
            }}
          >
            <img
              src={cldUrl(photo)}
              alt={`${branch.label} — ${photo.caption}`}
              loading={i < 2 ? "eager" : "lazy"}
            />
            <span className="locations-gallery__expand" aria-hidden="true">
              <ExpandIcon />
            </span>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
      <p className="locations-gallery__hint">
        ← Swipe through {branch.photos.length} photos · tap to view full size →
      </p>
    </div>
  );
}

/* ─── Lightbox — full-view, scrollable, with prev/next ──────────── */
function Lightbox({ branch, index, onClose, onPrev, onNext }) {
  const photo = branch.photos[index];

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="locations-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${branch.label} photo, full view`}
      onClick={onClose}
    >
      <button
        className="locations-lightbox__close"
        onClick={onClose}
        aria-label="Close"
      >
        <CloseIcon />
      </button>

      <button
        className="locations-lightbox__nav locations-lightbox__nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
      >
        <ChevronIcon direction="left" />
      </button>

      <div
        className="locations-lightbox__scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={cldUrlLarge(photo)}
          alt={`${branch.label} — ${photo.caption}`}
        />
        <p className="locations-lightbox__caption">{photo.caption}</p>
      </div>

      <button
        className="locations-lightbox__nav locations-lightbox__nav--next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
      >
        <ChevronIcon direction="right" />
      </button>

      <span className="locations-lightbox__count">
        {index + 1} / {branch.photos.length}
      </span>
    </div>
  );
}

function ExpandIcon() {
  return (
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
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  const d = direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

/* ─── Coming-soon panel for a branch without photos yet ─────────── */
function ComingSoonPanel({ branchLabel }) {
  return (
    <div className="locations-soon locations-soon--panel">
      <div className="locations-soon__bg" aria-hidden="true">
        <div className="locations-soon__blob locations-soon__blob--1" />
        <div className="locations-soon__blob locations-soon__blob--2" />
      </div>
      <div className="locations-soon__inner">
        <CharacterIllustration />
        <span className="locations-soon__badge">🚧 Under Construction</span>
        <h2 className="locations-soon__title">
          Photos of our {branchLabel} branch are coming soon!
        </h2>
        <p className="locations-soon__subtitle">
          We're putting together photos and clear directions for this branch.
          Check back soon, or reach out and we'll guide you there directly.
        </p>
      </div>
    </div>
  );
}

/* ─── Friendly cartoon character with a sign ─────────────────── */
function CharacterIllustration() {
  return (
    <svg
      viewBox="0 0 280 260"
      width="180"
      className="locations-soon__char"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="140" cy="245" rx="70" ry="10" fill="rgba(0,0,0,0.08)" />
      <rect x="205" y="120" width="8" height="100" rx="3" fill="#9B2D1F" />
      <rect
        x="185"
        y="95"
        width="80"
        height="46"
        rx="8"
        fill="#FFF8E1"
        stroke="#A07200"
        strokeWidth="3"
      />
      <text
        x="225"
        y="113"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#A07200"
        fontFamily="Arial"
      >
        SOON
      </text>
      <text
        x="225"
        y="128"
        textAnchor="middle"
        fontSize="18"
        fontFamily="Arial"
      >
        🚧
      </text>
      <ellipse cx="120" cy="175" rx="42" ry="50" fill="#0D1B3E" />
      <circle cx="120" cy="100" r="38" fill="#C68863" />
      <path
        d="M84 90 Q90 55 120 58 Q150 55 156 90 Q150 75 120 75 Q90 75 84 90Z"
        fill="#1a1a1a"
      />
      <rect
        x="92"
        y="95"
        width="22"
        height="16"
        rx="5"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      <rect
        x="126"
        y="95"
        width="22"
        height="16"
        rx="5"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      <line
        x1="114"
        y1="103"
        x2="126"
        y2="103"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      <path
        d="M108 118 Q120 128 132 118"
        stroke="#7a4a30"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M150 165 Q175 150 195 135"
        stroke="#C68863"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="197" cy="133" r="9" fill="#C68863" />
      <path
        d="M92 170 Q75 185 70 205"
        stroke="#C68863"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="69" cy="207" r="9" fill="#C68863" />
      <rect x="100" y="215" width="16" height="30" rx="7" fill="#1a1a1a" />
      <rect x="128" y="215" width="16" height="30" rx="7" fill="#1a1a1a" />
      <ellipse cx="108" cy="248" rx="12" ry="6" fill="#9B2D1F" />
      <ellipse cx="136" cy="248" rx="12" ry="6" fill="#9B2D1F" />
      <text x="40" y="60" fontSize="20">
        ✨
      </text>
      <text x="245" y="60" fontSize="16">
        ✨
      </text>
    </svg>
  );
}
