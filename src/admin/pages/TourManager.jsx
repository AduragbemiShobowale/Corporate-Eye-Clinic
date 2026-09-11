import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TourManager.css";

// ── Steps per role ────────────────────────────────────────────────
const STEPS = {
  super_admin: [
    {
      path: "/admin",
      highlight: ".dash-grid",
      title: "Your Dashboard",
      body: "These cards show today's bookings across all branches, pending shop orders, low-stock alerts, and how many bank transfer payments are waiting for your verification.",
      position: "top",
    },
    {
      path: "/admin/bookings",
      highlight: ".admin-table",
      title: "Bookings",
      body: "All patient appointments in one place. Update statuses as patients arrive, approve or decline cancellation requests, and track group bookings for schools and organisations.",
      position: "top",
    },
    {
      path: "/admin/orders",
      highlight: ".admin-card",
      title: "Shop Orders & Payment Verification",
      body: "Orders with an amber 'Awaiting Verification' badge have been paid by bank transfer. Check your Zenith Bank account, then click '✓ Confirm Payment' — the customer gets an email automatically.",
      position: "top",
    },
    {
      path: "/admin/prescriptions",
      highlight: ".admin-table",
      title: "Prescriptions",
      body: "Track glasses and contact lens orders here. When lenses are ready, update the status to 'Ready' so staff know to call the patient for pickup.",
      position: "top",
    },
    {
      path: "/admin/approvals",
      highlight: ".admin-card",
      title: "Pending Approvals",
      body: "When staff submit a cancellation request, it appears here for your decision. Click a row to see full details before approving or declining.",
      position: "top",
    },
    {
      path: "/admin/staff-management",
      highlight: ".admin-page-header",
      title: "Staff Management",
      body: "Create login accounts for your front desk and doctors directly here — no need to go into any backend. You can also reset anyone's password at any time.",
      position: "bottom",
    },
    {
      path: "/admin/patients",
      highlight: ".pr-grid",
      title: "Patient Records",
      body: "Clinical profiles managed by your doctors — visual acuity, auto-refraction, IOP, and consultation notes. Each patient gets a unique CEC medical number automatically.",
      position: "top",
    },
    {
      path: "/admin/patient-directory",
      highlight: ".admin-card",
      title: "Patient Directory",
      body: "A quick contact lookup for all patients — name, gender, date of birth, and email. Click any row to open their full clinical profile.",
      position: "top",
    },
  ],

  staff: [
    {
      path: "/admin",
      highlight: ".dash-grid",
      title: "Your Dashboard",
      body: "Your daily overview — today's bookings for your branch, pending orders, and anything that needs attention. Check this every morning when you log in.",
      position: "top",
    },
    {
      path: "/admin/bookings",
      highlight: ".admin-table",
      title: "Bookings",
      body: "All patient appointments. When a patient arrives, update their status to 'Completed'. If they want to cancel, use the cancellation option — the clinic manager will approve it.",
      position: "top",
    },
    {
      path: "/admin/orders",
      highlight: ".admin-btn--primary",
      title: "Shop Orders & Walk-in Sales",
      body: "Click '+ Record walk-in sale' to log any in-person purchase. For online orders, you can view what was ordered and update fulfilment status.",
      position: "bottom",
    },
    {
      path: "/admin/prescriptions",
      highlight: ".admin-table",
      title: "Prescriptions",
      body: "When a patient comes to collect their glasses or lenses, find their order here and click 'Record pickup' to mark it as collected.",
      position: "top",
    },
    {
      path: "/admin/patient-directory",
      highlight: ".admin-card",
      title: "Patient Directory",
      body: "Need a patient's phone number quickly? Search here by name or medical number for instant contact details without opening full clinical records.",
      position: "top",
    },
  ],

  doctor: [
    {
      path: "/admin/appointments",
      highlight: ".admin-table",
      title: "My Appointments",
      body: "Your full appointment schedule. All patients booked for your clinic appear here — see their service, time, and branch before the consultation.",
      position: "top",
    },
    {
      path: "/admin/patients",
      highlight: ".pr-grid",
      title: "Patient Records",
      body: "Create a new patient profile with the '+ New patient' button. Each patient gets a unique CEC medical number. Click any patient card to open their full clinical profile and add consultation notes.",
      position: "top",
    },
    {
      path: "/admin/patient-directory",
      highlight: ".admin-card",
      title: "Patient Directory",
      body: "A quick contact list of all registered patients. Search by name, medical number or email. Click any row to go straight to their full clinical record.",
      position: "top",
    },
  ],
};

const DONE = {
  path: null,
  title: "You're all set! 🎉",
  body: "You've seen everything you need to get started. The sidebar is always there if you need to jump between sections. Happy working!",
};

export default function TourManager({ profile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const highlightRef = useRef(null);
  const storageKey = `cec_tour_${profile?.id}`;

  const steps = STEPS[profile?.role] || STEPS.staff;

  // Show on first login
  useEffect(() => {
    if (!profile?.id) return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setTimeout(() => setActive(true), 800); // slight delay for page load
    }
  }, [profile?.id]);

  // Navigate to step page + add highlight
  useEffect(() => {
    if (!active || done) return;
    const current = steps[step];
    if (!current) return;

    if (location.pathname !== current.path) {
      navigate(current.path);
    }
  }, [active, step, done]);

  // Add highlight class to target element
  useEffect(() => {
    if (!active || done) return;
    const current = steps[step];
    if (!current?.highlight) return;

    // Wait for page to render then add highlight
    const timer = setTimeout(() => {
      // Remove previous highlights
      document
        .querySelectorAll(".tour-highlight")
        .forEach((el) => el.classList.remove("tour-highlight"));

      const el = document.querySelector(current.highlight);
      if (el) {
        el.classList.add("tour-highlight");
        highlightRef.current = el;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      document
        .querySelectorAll(".tour-highlight")
        .forEach((el) => el.classList.remove("tour-highlight"));
    };
  }, [active, step, done]);

  function finish() {
    document
      .querySelectorAll(".tour-highlight")
      .forEach((el) => el.classList.remove("tour-highlight"));
    localStorage.setItem(storageKey, "1");
    setActive(false);
    setDone(false);
    setStep(0);
  }

  function skip() {
    document
      .querySelectorAll(".tour-highlight")
      .forEach((el) => el.classList.remove("tour-highlight"));
    setDone(true);
  }

  function next() {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      setDone(true);
    }
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (!active) return null;

  const current = done ? DONE : steps[step];
  const position = (!done && steps[step]?.position) || "bottom";

  return (
    <>
      {/* Dimmed overlay — doesn't block clicks */}
      <div className="tour-overlay" />

      {/* Floating tour card */}
      <div className={`tour-card tour-card--${position}`}>
        <div className="tour-card-inner">
          {/* Step indicator */}
          {!done && (
            <div className="tour-progress">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`tour-dot${i === step ? " active" : i < step ? " done" : ""}`}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="tour-content">
            <h3 className="tour-title">{current.title}</h3>
            <p className="tour-body">{current.body}</p>
          </div>

          {/* Actions */}
          <div className="tour-actions">
            {!done ? (
              <>
                <div className="tour-actions-left">
                  <button className="tour-btn tour-btn--ghost" onClick={skip}>
                    Skip tour
                  </button>
                  {step > 0 && (
                    <button className="tour-btn tour-btn--ghost" onClick={prev}>
                      ← Back
                    </button>
                  )}
                </div>
                <div className="tour-actions-right">
                  <span className="tour-count">
                    {step + 1} / {steps.length}
                  </span>
                  <button className="tour-btn tour-btn--primary" onClick={next}>
                    {step === steps.length - 1 ? "Finish →" : "Next →"}
                  </button>
                </div>
              </>
            ) : (
              <button
                className="tour-btn tour-btn--primary tour-btn--full"
                onClick={finish}
              >
                Let's get started 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
