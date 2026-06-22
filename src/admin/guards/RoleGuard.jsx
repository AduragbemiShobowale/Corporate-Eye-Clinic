import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

/**
 * RoleGuard wraps a route and redirects if the logged-in user's role
 * isn't in the `allowed` array.
 *
 * Usage:
 *   <RoleGuard allowed={["super_admin"]}>
 *     <StaffDirectoryPage />
 *   </RoleGuard>
 *
 * If `allowed` is omitted, any authenticated user passes through.
 */
export default function RoleGuard({ children, allowed }) {
  const { profile, loading } = useAdminAuth();

  // Still loading session — render nothing to avoid a flash of wrong content.
  if (loading) return null;

  // Not logged in at all → back to login.
  if (!profile) return <Navigate to="/admin/login" replace />;

  // Role not in the allowed list → back to their own home page.
  if (allowed && !allowed.includes(profile.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}