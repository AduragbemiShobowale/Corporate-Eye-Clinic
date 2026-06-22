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

// Admin
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/layout/AdminLayout";
import RoleGuard from "./admin/guards/RoleGuard";
import AdminPlaceholder from "./admin/pages/AdminPlaceholder";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ── Public site ── */}
        <Route
          path="/"
          element={
            <CartProvider>
              <div className="app">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/locations" element={<LocationsPage />} />
                    
                  </Routes>
                </main>
                <Footer />
                <WhatsAppFloat />
                <CartDrawer />
              </div>
            </CartProvider>
          }
        />

        {/* ── Admin portal — no Navbar/Footer/Cart ── */}
        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <Routes>
                <Route path="login" element={<AdminLogin />} />

                {/* All protected admin pages share the AdminLayout shell */}
                <Route
                  element={
                    <RoleGuard allowed={["super_admin", "staff", "doctor"]}>
                      <AdminLayout />
                    </RoleGuard>
                  }
                >
                  {/* Staff + super_admin pages */}
                  <Route
                    index
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <AdminPlaceholder title="Dashboard" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <AdminPlaceholder title="Products & Inventory" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="bookings"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <AdminPlaceholder title="Bookings" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <AdminPlaceholder title="Shop Orders" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="prescriptions"
                    element={
                      <RoleGuard allowed={["super_admin", "staff"]}>
                        <AdminPlaceholder title="Prescriptions" />
                      </RoleGuard>
                    }
                  />

                  {/* Super admin only */}
                  <Route
                    path="approvals"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <AdminPlaceholder title="Pending Approvals" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="staff"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <AdminPlaceholder title="Staff Directory" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="reporting"
                    element={
                      <RoleGuard allowed={["super_admin"]}>
                        <AdminPlaceholder title="Reporting" />
                      </RoleGuard>
                    }
                  />

                  {/* Doctor pages */}
                  <Route
                    path="appointments"
                    element={
                      <RoleGuard allowed={["doctor"]}>
                        <AdminPlaceholder title="My Appointments" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="patients"
                    element={
                      <RoleGuard allowed={["doctor", "super_admin"]}>
                        <AdminPlaceholder title="Patient Records" />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="patients/:id"
                    element={
                      <RoleGuard allowed={["doctor", "super_admin"]}>
                        <AdminPlaceholder title="Patient Profile" />
                      </RoleGuard>
                    }
                  />
                </Route>

                {/* Catch-all within /admin */}
                <Route
                  path="*"
                  element={<AdminPlaceholder title="Page not found" />}
                />
              </Routes>
            </AdminAuthProvider>
          }
        />

        {/* Public 404 */}
        <Route path="*" element={<PageError />} />
      </Routes>
    </Router>
  );
}
