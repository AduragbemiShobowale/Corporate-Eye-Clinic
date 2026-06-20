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

export default function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
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
              <Route path="*" element={<PageError />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppFloat />
          <CartDrawer />
        </div>
      </Router>
    </CartProvider>
  );
}
