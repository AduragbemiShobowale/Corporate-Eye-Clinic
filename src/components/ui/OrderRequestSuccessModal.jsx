import "./OrderRequestSuccessModal.css";

export default function OrderRequestSuccessModal({ onClose, name }) {
  return (
    <div className="os-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="os-modal" role="dialog" aria-modal="true">
        <div className="os-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3>Request received! 🎉</h3>
        <p>
          Thank you{name ? `, ${name}` : ""}. Our team has been notified and will
          review your prescription. You'll be contacted shortly with pricing
          and confirmation details.
        </p>
        <button className="btn btn--primary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
