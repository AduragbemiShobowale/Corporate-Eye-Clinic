import { Link } from "react-router-dom";
import "./LocationsPage.css";

export default function LocationsPage() {
  return (
    <div className="locations-soon">
      <SEO
        title="Our Locations — 3 Branches Across Ibadan"
        description="Visit Corporate Eye Clinic at any of our 3 branches in Ibadan — Head Office Bodija (Royal Mall), Oluyole Estate, and New Bodija. Get directions and contact details."
        canonical="/locations"
      />
      <div className="locations-soon__bg" aria-hidden="true">
        <div className="locations-soon__blob locations-soon__blob--1" />
        <div className="locations-soon__blob locations-soon__blob--2" />
      </div>

      <div className="locations-soon__inner">
        <CharacterIllustration />

        <span className="locations-soon__badge">🚧 Under Construction</span>
        <h1 className="locations-soon__title">
          Our Locations page is coming soon!
        </h1>
        <p className="locations-soon__subtitle">
          We're putting together photos and clear directions for all three of
          our Ibadan branches — Bodija, Oluyole, and New Bodija. Check back
          soon, or reach out and we'll guide you there directly.
        </p>

        <div className="locations-soon__actions">
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
    </div>
  );
}

/* ─── Friendly cartoon character with a sign ─────────────────── */
function CharacterIllustration() {
  return (
    <svg
      viewBox="0 0 280 260"
      width="220"
      className="locations-soon__char"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground shadow */}
      <ellipse cx="140" cy="245" rx="70" ry="10" fill="rgba(0,0,0,0.08)" />

      {/* Sign post */}
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

      {/* Body */}
      <ellipse cx="120" cy="175" rx="42" ry="50" fill="#0D1B3E" />

      {/* Head */}
      <circle cx="120" cy="100" r="38" fill="#C68863" />

      {/* Hair */}
      <path
        d="M84 90 Q90 55 120 58 Q150 55 156 90 Q150 75 120 75 Q90 75 84 90Z"
        fill="#1a1a1a"
      />

      {/* Glasses (on-brand!) */}
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

      {/* Smile */}
      <path
        d="M108 118 Q120 128 132 118"
        stroke="#7a4a30"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arm pointing to sign */}
      <path
        d="M150 165 Q175 150 195 135"
        stroke="#C68863"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="197" cy="133" r="9" fill="#C68863" />

      {/* Other arm */}
      <path
        d="M92 170 Q75 185 70 205"
        stroke="#C68863"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="69" cy="207" r="9" fill="#C68863" />

      {/* Legs */}
      <rect x="100" y="215" width="16" height="30" rx="7" fill="#1a1a1a" />
      <rect x="128" y="215" width="16" height="30" rx="7" fill="#1a1a1a" />
      <ellipse cx="108" cy="248" rx="12" ry="6" fill="#9B2D1F" />
      <ellipse cx="136" cy="248" rx="12" ry="6" fill="#9B2D1F" />

      {/* Sparkles */}
      <text x="40" y="60" fontSize="20">
        ✨
      </text>
      <text x="245" y="60" fontSize="16">
        ✨
      </text>
    </svg>
  );
}
