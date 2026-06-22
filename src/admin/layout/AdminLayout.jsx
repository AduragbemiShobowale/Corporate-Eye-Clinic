import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
  {
    to: "/admin",
    end: true,
    icon: "⬛",
    label: "Dashboard",
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/products",
    icon: "🏷",
    label: "Products & Inventory",
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/bookings",
    icon: "📅",
    label: "Bookings",
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/orders",
    icon: "🛒",
    label: "Shop Orders",
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/prescriptions",
    icon: "📋",
    label: "Prescriptions",
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/approvals",
    icon: "⏳",
    label: "Pending Approvals",
    roles: ["super_admin"],
    badge: true,
  },
  {
    to: "/admin/staff",
    icon: "👥",
    label: "Staff Directory",
    roles: ["super_admin"],
  },
  {
    to: "/admin/reporting",
    icon: "📊",
    label: "Reporting",
    roles: ["super_admin"],
  },
  {
    to: "/admin/appointments",
    icon: "📅",
    label: "My Appointments",
    roles: ["doctor"],
  },
  {
    to: "/admin/patients",
    icon: "🗂",
    label: "Patient Records",
    roles: ["doctor", "super_admin"],
  },
];

export default function AdminLayout() {
  const { profile, signOut, isSuperAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const visibleNav = NAV_ITEMS.filter(
    (item) => profile && item.roles.includes(profile.role),
  );

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  async function handleConfirmLogout() {
    setSigningOut(true);
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img
            src="https://res.cloudinary.com/dgde8cwjk/image/upload/v1780805731/96AB81CC-BE2F-4C97-B0DB-BDEF573A840D_s6y2fd.png"
            alt="Corporate Eye Clinic"
            className="admin-sidebar-logo"
          />
          <div>
            <p className="admin-sidebar-clinic">Corporate Eye Clinic</p>
            <p className="admin-sidebar-portal">Admin Portal</p>
          </div>
        </div>

        <nav className="admin-nav">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "admin-nav-item" + (isActive ? " admin-nav-item--active" : "")
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── User strip — click anywhere to trigger logout modal ── */}
        <button
          className="admin-sidebar-user"
          onClick={() => setShowConfirm(true)}
          title="Log out"
        >
          <div className="admin-user-avatar">{initials}</div>
          <div className="admin-user-info">
            <p className="admin-user-name">{profile?.full_name}</p>
            <p className="admin-user-meta">
              {isSuperAdmin ? "Super Admin" : profile?.branch || profile?.role}
            </p>
          </div>
          <span className="admin-signout-icon">
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-main">
        <Outlet />
      </div>

      {/* ── Logout confirmation modal ── */}
      {showConfirm && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !signingOut && setShowConfirm(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon-wrap">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 className="admin-modal-title">Log out?</h2>
            <p className="admin-modal-body">
              Are you sure you want to log out of the admin portal?
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => setShowConfirm(false)}
                disabled={signingOut}
              >
                No, stay
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleConfirmLogout}
                disabled={signingOut}
              >
                {signingOut ? "Logging out…" : "Yes, log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
