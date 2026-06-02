import { useState, useRef, useCallback } from "react";
import "./BeforeAfterSlider.css";

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Normal vision",
  afterLabel = "With condition",
  filterStyle = {},
  filterClass = "",
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDrag] = useState(false);
  const containerRef = useRef(null);

  const getPos = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(Math.max(pct, 2), 98);
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      setPos(getPos(e.clientX));
    },
    [dragging, getPos],
  );

  const onTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      setPos(getPos(e.touches[0].clientX));
    },
    [getPos],
  );

  return (
    <div
      className={`ba-slider${dragging ? " ba-slider--dragging" : ""}`}
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={() => setDrag(false)}
      onMouseLeave={() => setDrag(false)}
      onTouchMove={onTouchMove}
      onTouchEnd={() => setDrag(false)}
      role="img"
      aria-label="Vision comparison slider"
    >
      {/* AFTER — condition side, full width behind */}
      <div className="ba-slider__after">
        <img
          src={afterSrc}
          alt={afterLabel}
          draggable="false"
          style={filterStyle}
          className={filterClass}
        />
      </div>

      {/* BEFORE — normal vision, clipped via clipPath so image stays full size */}
      <div
        className="ba-slider__before"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={beforeSrc} alt={beforeLabel} draggable="false" />
      </div>

      {/* Labels rendered OUTSIDE clipped panels so they never get cut off */}
      <span className="ba-slider__label ba-slider__label--before">
        {beforeLabel}
      </span>
      <span className="ba-slider__label ba-slider__label--after">
        {afterLabel}
      </span>

      {/* Divider handle */}
      <div className="ba-slider__divider" style={{ left: `${pos}%` }}>
        <div className="ba-slider__line" />
        <button
          className="ba-slider__handle"
          onMouseDown={() => setDrag(true)}
          onTouchStart={() => setDrag(true)}
          aria-label="Drag to compare"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
