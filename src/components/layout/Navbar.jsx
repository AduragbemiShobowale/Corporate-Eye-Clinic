import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navLinks, services } from "../../data/siteData";
import BookingModal from "../ui/BookingModal";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const hoverTimeout = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setActive(null);
  }, [location]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!showModal) document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      if (!showModal) document.body.style.overflow = "";
    };
  }, [menuOpen, showModal]);

  const handleMouseEnter = (label) => {
    clearTimeout(hoverTimeout.current);
    setActive(label);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setActive(null), 150);
  };

  return (
    <>
      {/* <div className="promo-bar">
        <strong>Special offer:</strong> 25% off your first contact lens order —{" "}
        <a href="tel:+2348033372738">call 0803-337-2738</a>
      </div> */}

      <header
        className={`navbar${scrolled ? " navbar--scrolled" : ""}`}
        ref={dropdownRef}
      >
        <div className="navbar__inner container">
          <Link to="/" className="navbar__logo">
            <img
              src="https://res.cloudinary.com/dgde8cwjk/image/upload/v1780805731/96AB81CC-BE2F-4C97-B0DB-BDEF573A840D_s6y2fd.png"
              alt="Corporate Eye Clinic"
              className="navbar__logo-img"
            />
          </Link>

          <nav className="navbar__nav" aria-label="Main navigation">
            {navLinks.map((link) =>
              link.label === "Shop" ? (
                <div
                  key={link.path}
                  className="navbar__dropdown-wrapper"
                  onMouseEnter={() => handleMouseEnter("Shop")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `navbar__link${isActive ? " navbar__link--active" : ""}`
                    }
                  >
                    Shop <ChevronIcon rotated={activeDropdown === "Shop"} />
                  </NavLink>
                  {activeDropdown === "Shop" && (
                    <div
                      className="navbar__mega"
                      onMouseEnter={() => handleMouseEnter("Shop")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="navbar__mega-img">
                        <img
                          src="https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&q=80"
                          alt="Eyewear collection"
                        />
                        <div className="navbar__mega-img-overlay">
                          <p>Can't find what you're looking for?</p>
                          <a
                            href="https://wa.me/2348033372738"
                            target="_blank"
                            rel="noreferrer"
                            className="navbar__mega-wa"
                          >
                            <WaIcon /> WHATSAPP
                          </a>
                        </div>
                      </div>
                      <div className="navbar__mega-links">
                        {[
                          "All Products",
                          "For Him",
                          "For Her",
                          "For Kids",
                          "Frames",
                          "Contact Lenses",
                          "Sunglasses",
                        ].map((cat) => (
                          <Link
                            key={cat}
                            to="/shop"
                            className="navbar__mega-link"
                            onClick={() => setActive(null)}
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : link.label === "Services" ? (
                <div
                  key={link.path}
                  className="navbar__dropdown-wrapper"
                  onMouseEnter={() => handleMouseEnter("Services")}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `navbar__link${isActive ? " navbar__link--active" : ""}`
                    }
                  >
                    Services{" "}
                    <ChevronIcon rotated={activeDropdown === "Services"} />
                  </NavLink>
                  {activeDropdown === "Services" && (
                    <div
                      className="navbar__mega navbar__mega--services"
                      onMouseEnter={() => handleMouseEnter("Services")}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="navbar__mega-img">
                        <img
                          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80"
                          alt="Eye care services"
                        />
                        <div className="navbar__mega-img-overlay">
                          <p>
                            Expert eye care for every member of your family.
                          </p>
                          <Link
                            to="/services"
                            className="navbar__mega-wa"
                            onClick={() => setActive(null)}
                          >
                            View all services →
                          </Link>
                        </div>
                      </div>
                      <div className="navbar__mega-links">
                        <Link
                          to="/services"
                          className="navbar__mega-link navbar__mega-link--all"
                          onClick={() => setActive(null)}
                        >
                          All Services
                        </Link>
                        <div className="navbar__mega-divider" />
                        {services.map((s) => (
                          <Link
                            key={s.id}
                            to={`/services#${s.id}`}
                            className="navbar__mega-link"
                            onClick={() => setActive(null)}
                          >
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : link.children ? (
                <div
                  key={link.path}
                  className="navbar__dropdown-wrapper"
                  onMouseEnter={() => handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`navbar__link navbar__link--btn${activeDropdown === link.label ? " active" : ""}`}
                  >
                    {link.label}{" "}
                    <ChevronIcon rotated={activeDropdown === link.label} />
                  </button>
                  {activeDropdown === link.label && (
                    <div className="navbar__dropdown">
                      {link.children.map((c) => (
                        <Link
                          key={c.path}
                          to={c.path}
                          className="navbar__dropdown-item"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `navbar__link${isActive ? " navbar__link--active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="navbar__actions">
            <button
              className="btn btn--primary btn--sm"
              onClick={() => setShowModal(true)}
            >
              Book an eye exam
            </button>
          </div>

          <button
            className={`navbar__hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`navbar__mobile${menuOpen ? " open" : ""}`}>
          {/* Close button inside the panel */}
          <button
            className="navbar__mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              width="22"
              height="22"
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
          <nav className="navbar__mobile-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar__mobile-link${isActive ? " active" : ""}`
              }
            >
              Home
            </NavLink>
            <div className="navbar__mobile-group">
              <span className="navbar__mobile-group-label">Services</span>
              <Link
                to="/services"
                className="navbar__mobile-link navbar__mobile-child"
              >
                All Services
              </Link>
              {services.map((s) => (
                <Link
                  key={s.id}
                  to={`/services#${s.id}`}
                  className="navbar__mobile-link navbar__mobile-child"
                >
                  {s.title}
                </Link>
              ))}
            </div>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `navbar__mobile-link${isActive ? " active" : ""}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `navbar__mobile-link${isActive ? " active" : ""}`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `navbar__mobile-link${isActive ? " active" : ""}`
              }
            >
              Contact
            </NavLink>
            <div className="navbar__mobile-cta">
              <button
                className="btn btn--primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  setMenuOpen(false);
                  setShowModal(true);
                }}
              >
                Book an eye exam
              </button>
              <a
                href="https://wa.me/2348033372738"
                className="btn btn--outline"
                style={{ width: "100%", justifyContent: "center" }}
              >
                WhatsApp us
              </a>
            </div>
          </nav>
        </div>
      </header>

      {showModal && <BookingModal onClose={() => setShowModal(false)} />}
    </>
  );
}

const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const ChevronIcon = ({ rotated }) => (
  <svg
    style={{
      transform: rotated ? "rotate(180deg)" : "none",
      transition: "transform 0.2s",
    }}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.533 5.849L.06 23.94l6.255-1.641A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.493-5.204-1.355l-.374-.222-3.865 1.014 1.033-3.77-.244-.388A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);
