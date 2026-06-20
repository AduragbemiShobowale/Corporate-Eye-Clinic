import { Link } from "react-router-dom";
import "./PageError.css";

export default function PageError() {
  return (
    <div className="page-error">
      <div className="page-error__bg" aria-hidden="true">
        <div className="page-error__blob page-error__blob--1" />
        <div className="page-error__blob page-error__blob--2" />
      </div>

      <div className="page-error__inner">
        <CharacterIllustration />

        <span className="page-error__code">404</span>
        <h1 className="page-error__title">
          Looks like you've wandered off the path
        </h1>
        <p className="page-error__subtitle">
          The page you're looking for doesn't exist or may have moved. Let's get
          you back to clearer vision.
        </p>

        <div className="page-error__actions">
          <Link to="/" className="btn btn--primary btn--lg">
            Back to homepage
          </Link>
          <Link to="/contact" className="btn btn--outline btn--lg">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Confused cartoon character holding a map ───────────────── */
function CharacterIllustration() {
  return (
    <svg
      viewBox="0 0 280 260"
      width="220"
      className="page-error__char"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="140" cy="245" rx="70" ry="10" fill="rgba(0,0,0,0.08)" />

      {/* Body */}
      <ellipse cx="140" cy="175" rx="42" ry="50" fill="#0D1B3E" />

      {/* Head */}
      <circle cx="140" cy="100" r="38" fill="#C68863" />

      {/* Hair */}
      <path
        d="M104 90 Q110 55 140 58 Q170 55 176 90 Q170 75 140 75 Q110 75 104 90Z"
        fill="#1a1a1a"
      />

      {/* Glasses askew (lost/confused) */}
      <g transform="rotate(-8 140 103)">
        <rect
          x="112"
          y="95"
          width="22"
          height="16"
          rx="5"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <rect
          x="146"
          y="95"
          width="22"
          height="16"
          rx="5"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <line
          x1="134"
          y1="103"
          x2="146"
          y2="103"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
      </g>

      {/* Confused mouth */}
      <path
        d="M128 120 Q140 116 152 120"
        stroke="#7a4a30"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Question marks */}
      <text
        x="185"
        y="70"
        fontSize="26"
        fontWeight="700"
        fill="#9B2D1F"
        fontFamily="Arial"
      >
        ?
      </text>
      <text
        x="60"
        y="55"
        fontSize="18"
        fontWeight="700"
        fill="#A07200"
        fontFamily="Arial"
      >
        ?
      </text>

      {/* Arms holding a map */}
      <path
        d="M105 165 Q85 175 75 190"
        stroke="#C68863"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M175 165 Q195 175 205 190"
        stroke="#C68863"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* Map */}
      <g transform="translate(95,180) rotate(-5)">
        <rect
          x="0"
          y="0"
          width="90"
          height="55"
          rx="4"
          fill="#FFF8E1"
          stroke="#A07200"
          strokeWidth="2.5"
        />
        <path
          d="M10 15 L35 30 L55 12 L80 28"
          stroke="#9B2D1F"
          strokeWidth="2"
          fill="none"
          strokeDasharray="3 3"
        />
        <circle cx="10" cy="15" r="3" fill="#9B2D1F" />
        <circle cx="80" cy="28" r="3" fill="#9B2D1F" />
        <text
          x="45"
          y="46"
          textAnchor="middle"
          fontSize="9"
          fill="#A07200"
          fontFamily="Arial"
        >
          ?
        </text>
      </g>

      {/* Legs */}
      <rect x="120" y="215" width="16" height="30" rx="7" fill="#1a1a1a" />
      <rect x="148" y="215" width="16" height="30" rx="7" fill="#1a1a1a" />
      <ellipse cx="128" cy="248" rx="12" ry="6" fill="#9B2D1F" />
      <ellipse cx="156" cy="248" rx="12" ry="6" fill="#9B2D1F" />
    </svg>
  );
}
