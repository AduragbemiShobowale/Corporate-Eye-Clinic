import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

// Admin — foundation
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/layout/AdminLayout";
import RoleGuard from "./admin/guards/RoleGuard";

// Admin — pages
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Bookings from "./admin/pages/Bookings";
import ShopOrders from "./admin/pages/ShopOrders";
import Prescriptions from "./admin/pages/Prescriptions";
import PendingApprovals from "./admin/pages/PendingApprovals";
import StaffDirectory from "./admin/pages/StaffDirectory";
import Reporting from "./admin/pages/Reporting";
import DoctorAppointments from "./admin/pages/DoctorAppointments";
import PatientRecords from "./admin/pages/PatientRecords";
import PatientProfile from "./admin/pages/PatientProfile";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ── Admin portal — must come first so /admin/* is matched
            before the public catch-all below swallows it ── */}
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
                  <Route
                    index
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <Dashboard />
                      </RoleGuard>
                    }
                  />
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
                    path="staff"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <StaffDirectory />
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

        {/* ── Public site — path="/*" catches everything not matched
            above. Inner routes use relative paths (no leading slash)
            because they are children of the "/*" match. ── */}
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
