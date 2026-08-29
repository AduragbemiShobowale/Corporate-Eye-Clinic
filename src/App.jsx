import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAdminAuth } from "./admin/context/AdminAuthContext";

function AdminIndex() {
  const { profile, loading } = useAdminAuth();
  if (loading) return null;
  if (profile?.role === "doctor")
    return <Navigate to="/admin/appointments" replace />;
  return <Dashboard />;
}

import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import WhatsAppFloat from "./components/ui/WhatsAppFloat";
import CartDrawer from "./components/ui/CartDrawer";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ShopPage from "./pages/ShopPage";
import LocationsPage from "./pages/LocationsPage";
import PageError from "./pages/PageError";
import ScrollToTop from "./components/layout/ScrollToTop";

import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/layout/AdminLayout";
import RoleGuard from "./admin/guards/RoleGuard";

import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Bookings from "./admin/pages/Bookings";
import ShopOrders from "./admin/pages/ShopOrders";
import Prescriptions from "./admin/pages/Prescriptions";
import PendingApprovals from "./admin/pages/PendingApprovals";
import StaffDirectory from "./admin/pages/StaffDirectory";
import StaffManagement from "./admin/pages/StaffManagement";
import ChangePassword from "./admin/pages/ChangePassword";
import PatientDirectory from "./admin/pages/PatientDirectory";
import Reporting from "./admin/pages/Reporting";
import DoctorAppointments from "./admin/pages/DoctorAppointments";
import PatientRecords from "./admin/pages/PatientRecords";
import PatientProfile from "./admin/pages/PatientProfile";
import Notifications from "./admin/pages/Notifications";

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "var(--font-sans, Inter, sans-serif)",
            fontSize: "14px",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
          success: {
            iconTheme: { primary: "#1a7a4a", secondary: "#fff" },
            style: { border: "1px solid #e6f9f0", background: "#fff" },
          },
          error: {
            iconTheme: { primary: "#9B2D1F", secondary: "#fff" },
            style: { border: "1px solid #fde8e4", background: "#fff" },
          },
        }}
      />
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <Routes>
                <Route path="login" element={<AdminLogin />} />

                <Route
                  element={
                    <RoleGuard allowed={["super_admin", "staff", "doctor"]}>
                      <AdminLayout />
                    </RoleGuard>
                  }
                >
                  <Route index element={<AdminIndex />} />
                  <Route
                    path="products"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <Products />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="bookings"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <Bookings />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <ShopOrders />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="prescriptions"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <Prescriptions />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="approvals"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <PendingApprovals />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="notifications"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <Notifications />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="staff"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <StaffDirectory />
                      </RoleGuard>
                    }
                  />
                  {/* ── New: Staff Management (create accounts + reset passwords) ── */}
                  <Route
                    path="staff-management"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <StaffManagement />
                      </RoleGuard>
                    }
                  />
                  {/* ── New: Patient Directory (all roles) ── */}
                  <Route
                    path="patient-directory"
                    element={
                      <RoleGuard allowed={["super_admin", "staff", "doctor"]}>
                        <PatientDirectory />
                      </RoleGuard>
                    }
                  />
                  {/* ── New: Change Password (all roles) ── */}
                  <Route
                    path="change-password"
                    element={
                      <RoleGuard allowed={["super_admin", "staff", "doctor"]}>
                        <ChangePassword />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="reporting"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <Reporting />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="appointments"
                    element={
                      <RoleGuard allowed={["doctor"]}>
                        <DoctorAppointments />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="patients"
                    element={
                      <RoleGuard allowed={["doctor", "super_admin"]}>
                        <PatientRecords />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="patients/:id"
                    element={
                      <RoleGuard allowed={["doctor", "super_admin"]}>
                        <PatientProfile />
                      </RoleGuard>
                    }
                  />
                </Route>

                <Route path="*" element={<PageError />} />
              </Routes>
            </AdminAuthProvider>
          }
        />

        <Route
          path="/*"
          element={
            <CartProvider>
              <div className="app">
                <Navbar />
                <main>
                  <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="locations" element={<LocationsPage />} />
                    <Route path="*" element={<PageError />} />
                  </Routes>
                </main>
                <Footer />
                <WhatsAppFloat />
                <CartDrawer />
              </div>
            </CartProvider>
          }
        />
      </Routes>
    </Router>
  );
}
