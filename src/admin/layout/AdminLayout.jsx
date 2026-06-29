import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { supabase } from "../../lib/supabase";
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
    badge: "pending",
  },
  {
    to: "/admin/notifications",
    icon: "🔔",
    label: "Notifications",
    roles: ["super_admin"],
    badge: "notif",
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
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refetch both counts on every route change
  useEffect(() => {
    if (!isSuperAdmin) return;
    async function fetchCounts() {
      const [{ count: b }, { count: s }, { count: p }, { count: n }] =
        await Promise.all([
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "cancellation_pending"),
          supabase
            .from("shop_orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "cancellation_pending"),
          supabase
            .from("prescription_orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "cancellation_pending"),
          supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("read", false),
        ]);
      setPendingCount((b || 0) + (s || 0) + (p || 0));
      setNotifCount(n || 0);
    }
    fetchCounts();
  }, [isSuperAdmin, location.pathname]);

  // Close sidebar on route change (tablet)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
    <>
      {/* ── Small screen block (<768px) ── */}
      <div className="admin-mobile-block">
        <img
          src="https://res.cloudinary.com/a7n4qcvi/image/upload/v1782668966/96AB81CC-BE2F-4C97-B0DB-BDEF573A840D_f68v8c.png"
          alt="Corporate Eye Clinic"
          className="admin-mobile-logo"
        />
        <h2 className="admin-mobile-title">Admin Portal</h2>
        <p className="admin-mobile-msg">
          The admin portal is not supported on phones. Please open it on an iPad
          Mini, tablet, or desktop computer.
        </p>
      </div>

      {/* ── Full admin shell (≥768px) ── */}
      <div className="admin-shell">
        {/* Backdrop — closes sidebar on tablet when clicked outside */}
        {sidebarOpen && (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`admin-sidebar${sidebarOpen ? " admin-sidebar--open" : ""}`}
        >
          <div className="admin-sidebar-brand">
            <img
              src="https://res.cloudinary.com/a7n4qcvi/image/upload/v1782668966/96AB81CC-BE2F-4C97-B0DB-BDEF573A840D_f68v8c.png"
              alt="Corporate Eye Clinic"
              className="admin-sidebar-logo"
            />
            <div>
              <p className="admin-sidebar-clinic">Corporate Eye Clinic</p>
              <p className="admin-sidebar-portal">Admin Portal</p>
            </div>
            {/* Close button — tablet only */}
            <button
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
                {item.badge === "pending" && pendingCount > 0 && (
                  <span className="admin-nav-badge">{pendingCount}</span>
                )}
                {item.badge === "notif" && notifCount > 0 && (
                  <span className="admin-nav-badge admin-nav-badge--notif">
                    {notifCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            className="admin-sidebar-user"
            onClick={() => setShowConfirm(true)}
            title="Log out"
          >
            <div className="admin-user-avatar">{initials}</div>
            <div className="admin-user-info">
              <p className="admin-user-name">{profile?.full_name}</p>
              <p className="admin-user-meta">
                {isSuperAdmin
                  ? "Super Admin"
                  : profile?.branch || profile?.role}
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
          {/* Hamburger — only visible on tablet */}
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Outlet />
        </div>
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
    </>
  );
}
