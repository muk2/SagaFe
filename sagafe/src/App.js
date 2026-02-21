import './App.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, NavLink, Link, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage.js";
import SignUpPage from "./SignUpPage.js";
import ForgotPasswordPage from "./ForgotPasswordPage.js";
import ResetPasswordPage from "./ResetPasswordPage.js";
import AboutPage from "./pages/AboutPage.js";
import EventsPage from "./pages/EventsPage.js";
import PhotosPage from "./pages/PhotosPage.js";
import ContactPage from "./pages/ContactPage.js";
import DashboardPage from "./pages/DashboardPage.js";
import GuestRegistrationPage from "./pages/GuestRegistrationPage.js";
import EventRegistrationModal from "./components/EventRegistrationModal.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Banner from "./Banner";
import { useAuth } from "./context/AuthContext";
import { eventsApi, authApi } from "./lib/api";



export function App() {
  return (
    <div className="app">
      <Header />
      <Banner />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <ItemList />
            </>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/signup"
          element={<SignUpPage />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/guest-registration"
          element={<GuestRegistrationPage />}
        />
      </Routes>

      <Footer />
    </div>
  );
}


function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const iconRef = useRef(null);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/sagalogo.png" alt="Saga Golf" className="logo-image" />
        </Link>
      </div>

      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
      <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
        <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>Events</NavLink>
        <NavLink to="/photos" className={({ isActive }) => isActive ? 'active' : ''}>Photos</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
      </nav>

      <div className="user-section">
        {user ? (
          <div className="user-info">
            <span className="user-name">{user.first_name}</span>
            {user.handicap && (
              <span className="user-handicap" title="Golf Handicap">
                HCP: {user.handicap}
              </span>
            )}
            <div ref={iconRef} style={{ display: "inline-block" }}>
            <FontAwesomeIcon
            icon={faUser}
              size="2x"
              className="user-icon"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ cursor: "pointer" }}
            />
            </div>



            {menuOpen && (
              <div className="user-menu" ref={menuRef}>
                <div className="user-menu-header">
                  <span>{user.first_name} {user.last_name}</span>
                  <small>{user.role}</small>
                </div>
                <button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>Dashboard</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = authApi.isAuthenticated(); // Checks localStorage directly
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated); // 👈 Add this
  console.log('ProtectedRoute - token:', localStorage.getItem('access_token')); // 👈 Add this
  if (!isAuthenticated) {
    console.log('REDIRECTING TO LOGIN'); // 👈 Add this
    return <Navigate to="/login" replace />;
  }

  console.log('RENDERING PROTECTED CONTENT');
  return children;
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">Est. 2018 • New Jersey</span>
        <h1>South Asian Golf Association</h1>
        <p>Join New Jersey's premier golf community. Connect with fellow enthusiasts, compete in tournaments, and enjoy the game we love.</p>
        <div className="hero-buttons">
          <button className="primary-btn" onClick={() => navigate("/events")}>
            View Events
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button className="secondary-btn" onClick={() => navigate("/about")}>Learn More</button>
        </div>
      </div>
      <div className="hero-image-container">
        <img
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800"
          alt="Golf Course"
          className="hero-image"
        />
    
      </div>
    </section>
  );
}


export function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const ITEMS_PER_SLIDE = 4;

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const openRegistration = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const closeRegistration = () => {
    setShowRegistrationModal(false);
    setSelectedEvent(null);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getAll();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Unable to load events");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  // 🔹 Split events into slides of 4
  const slides = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_SLIDE) {
      result.push(items.slice(i, i + ITEMS_PER_SLIDE));
    }
    return result;
  }, [items]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <section className="collection">
      <div className="section-header">
        <div>
          <h2>Upcoming Events</h2>
          <p className="section-subtitle">
            Our upcoming events for this season
          </p>
        </div>

        <button className="view-all-btn" onClick={() => navigate("/events")}>
          View All Events
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            width="16"
            height="16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      ) : slides.length > 0 ? (
        <>
          {/* 🔹 Slide */}
          <div className="card-grid slider">
            {slides[currentSlide].map((item, index) => (
              <div className="card" key={item.id || index}>
                <div
                  className="card-image"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="card-content">
                  <h3>{item.golf_course}</h3>

                  <p className="card-location">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      width="16"
                      height="16"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    {item.township}, {item.state}
                  </p>

                  <p className="card-date">
                  <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
</svg>

                    {item.date}
                  </p>
                </div>
                <div class = "homepage-actions">
                <button
                className="compact-register"
                onClick={() => openRegistration(item)}
              >
                Register
              </button>
              </div>
              </div>
            ))}

{showRegistrationModal && selectedEvent && (
            <EventRegistrationModal
              event={selectedEvent}
              onClose={closeRegistration}
              onSuccess={closeRegistration}
            />
          )}

          </div>
{/* 🔹 Slider Navigation */}
<div className="slider-nav">
  <button
    className="slider-arrow"
    onClick={prevSlide}
    aria-label="Previous slide"
  >
    &#10094;
  </button>

  <div className="slider-dots">
    {slides.map((_, index) => (
      <button
        key={index}
        className={`slider-dot ${
          index === currentSlide ? "active" : ""
        }`}
        onClick={() => setCurrentSlide(index)}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))}
  </div>

  <button
    className="slider-arrow"
    onClick={nextSlide}
    aria-label="Next slide"
  >
    &#10095;
  </button>
</div>

        </>
      ) : (
        <div className="empty-state">
          <p>No events available at the moment.</p>
        </div>
      )}
    </section>
  );
  
}


function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>SAGA Golf</h3>
          <p>South Asian Golf Association of New Jersey</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/about">About Us</Link>
            <Link to="/events">Events</Link>
            <Link to="/news">News</Link>
          </div>
          <div className="footer-column">
            <h4>Connect</h4>
            <Link to="/contact">Contact</Link>
            <Link to="/photos">Photos</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SAGA Golf. All rights reserved.</p>
      </div>
    </footer>
  );
}
