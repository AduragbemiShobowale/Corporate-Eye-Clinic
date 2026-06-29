import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { signIn, profile } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (profile) {
    navigate("/admin", { replace: true });
    return null;
  }

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Please enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch {
      setServerError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="al-page">
      <div className="al-panel">
        <div className="al-panel-overlay" />
        <div className="al-panel-content">
          <div className="al-panel-logo-wrap">
            {/* Logo links back to public homepage */}
            <Link to="/">
              <img
                src="https://res.cloudinary.com/a7n4qcvi/image/upload/v1782668966/96AB81CC-BE2F-4C97-B0DB-BDEF573A840D_f68v8c.png"
                alt="Go to Corporate Eye Clinic homepage"
                className="al-panel-logo"
              />
            </Link>
          </div>
          <h1 className="al-panel-name">Corporate Eye Clinic</h1>
          <p className="al-panel-tagline">
            Caring for your vision, one patient at a time.
          </p>
          <div className="al-panel-divider" />
          <div className="al-panel-badges">
            <span className="al-badge">🏥 3 Branches</span>
            <span className="al-badge">👁 Expert Optometry</span>
            <span className="al-badge">🔒 Secure Staff Portal</span>
          </div>
        </div>
      </div>

      <div className="al-form-panel">
        <div className="al-form-card">
          <div className="al-form-header">
            <p className="al-form-eyebrow">Staff Portal</p>
            <h2 className="al-form-title">Welcome back</h2>
            <p className="al-form-subtitle">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form className="al-form" onSubmit={handleSubmit} noValidate>
            <div className="al-field">
              <label className="al-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`al-input${errors.email ? " al-input--error" : ""}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="you@corporateeyeclinic.com"
                autoComplete="email"
              />
              {errors.email && (
                <span className="al-field-error">{errors.email}</span>
              )}
            </div>

            <div className="al-field">
              <label className="al-label" htmlFor="password">
                Password
              </label>
              <div className="al-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`al-input al-input--padded-right${errors.password ? " al-input--error" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-password-toggle"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="al-field-error">{errors.password}</span>
              )}
            </div>

            {serverError && <p className="al-error">{serverError}</p>}

            <button type="submit" className="al-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="al-spinner" /> Signing in…
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          <p className="al-footer">
            Access restricted to authorised clinic staff only.
            <br />
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
