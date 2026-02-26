import './App.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, NavLink, Link, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage.js";
import SignUpPage from "./pages/SignUpPage.js";
import ForgotPasswordPage from "./ForgotPasswordPage.js";
import ResetPasswordPage from "./ResetPasswordPage.js";
import AboutPage from "./pages/AboutPage.js";
import EventsPage from "./pages/EventsPage.js";
import PhotosPage from "./pages/PhotosPage.js";
import ContactPage from "./pages/ContactPage.js";
import SagaTourPage from "./pages/SagatourPage.js";
import DashboardPage from "./pages/DashboardPage.js";
import GuestRegistrationPage from "./pages/GuestRegistrationPage.js";
import MembershipPage from "./pages/MembershipPage.js";
import PaymentHistoryPage from "./pages/PaymentHistoryPage.js";
import AdminMembershipTiersPage from "./pages/AdminMembershipTiersPage.js";
import AdminPaymentsPage from "./pages/AdminPaymentsPage.js";
import EventRegistrationModal from "./components/EventRegistrationModal.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import ScholarshipsPage from "./pages/ScholarshipPage.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Banner from "./Banner";
import { useAuth } from "./context/AuthContext";
import { eventsApi, carouselApi, partnersApi } from "./lib/api";
import { isAdmin } from "./lib/auth";


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

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
              <PartnersSection />
            </>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/sagatour" element={<SagaTourPage />} />
        <Route path="/scholarships" element={<ScholarshipsPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
        <Route
          path="/membership"
          element={<ProtectedRoute><MembershipPage /></ProtectedRoute>}
        />
        <Route
          path="/payments"
          element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/tiers"
          element={<ProtectedRoute><AdminMembershipTiersPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/payments"
          element={<ProtectedRoute><AdminPaymentsPage /></ProtectedRoute>}
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
        <NavLink to="/sagatour" className={({ isActive }) => isActive ? 'active' : ''}>Saga Tour</NavLink>
        <NavLink to="/scholarships" className={({ isActive }) => isActive ? 'active' : ''}>Scholarships</NavLink>
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
                <button onClick={() => { navigate("/membership"); setMenuOpen(false); }}>Membership</button>
                <button onClick={() => { navigate("/payments"); setMenuOpen(false); }}>Payment History</button>
                {user.role === 'admin' && (
                  <>
                    <div className="user-menu-divider" />
                    <button onClick={() => { navigate("/admin/tiers"); setMenuOpen(false); }}>Manage Tiers</button>
                    <button onClick={() => { navigate("/admin/payments"); setMenuOpen(false); }}>Payment Admin</button>
                  </>
                {isAdmin() && (
                  <button onClick={() => { navigate("/admin"); setMenuOpen(false); }} className="admin-menu-item">
                    Admin Dashboard
                  </button>
                )}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="signup-btn" onClick={() => navigate("/signup")}>Membership Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        color: 'var(--text-secondary)'
      }}>
        Verifying session...
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Hero() {
  const navigate = useNavigate();
  const [carouselImages, setCarouselImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // ✅ Always construct full URL
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const images = await carouselApi.getImages();
        if (images && images.length > 0) {
          // ✅ Pre-process all URLs to full URLs immediately
          const fullUrls = images.map(img => getImageUrl(img));
          setCarouselImages(fullUrls);
        } else {
          setCarouselImages(['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920']);
        }
      } catch (error) {
        console.error('Failed to load carousel:', error);
        setCarouselImages(['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920']);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselImages();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  if (loading) {
    return (
      <section className="hero hero-loading">
        <div className="hero-content">
          <span className="hero-badge">Est. 2004 • New Jersey</span>
          <h1>South Asian Golf Association</h1>
          <p>Join New Jersey's premier golf community.</p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/events")}>
              View Events
            </button>
            <button className="secondary-btn" onClick={() => navigate("/about")}>Learn More</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      {/* Left Side - Text Content */}
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-dot"></span>
          <span>Est. 2004 • New Jersey</span>
        </div>
        <h1>
          South Asian <br />
          <span className="hero-title-accent">Golf Association</span>
        </h1>
        <p>Join New Jersey's premier golf community. Connect with fellow enthusiasts, compete in tournaments, and enjoy the game we love.</p>
  
       
  
        <div className="hero-buttons">
          <button className="primary-btn" onClick={() => navigate("/events")}>
            View Events
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <button className="secondary-btn" onClick={() => navigate("/about")}>
            Learn More
          </button>
        </div>
      </div>
  
      {/* Right Side - Carousel */}
      <div className="hero-carousel-side">
        {/* Decorative frame */}
        <div className="carousel-frame"></div>
  
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
  
        {carouselImages.length > 1 && (
          <>
            <button className="carousel-arrow carousel-prev" onClick={prevImage}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button className="carousel-arrow carousel-next" onClick={nextImage}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
  
        {carouselImages.length > 1 && (
          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
  
       
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
  const REGULAR_ITEMS_PER_SLIDE = 3;

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
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingEvents = data
          .filter(event => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
          });
        
        setItems(upcomingEvents);
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

  // ✅ Split events: championship (last) and regular events (rest)
  const slides = useMemo(() => {
    const championshipEvent = items.length > 0 ? items[items.length - 1] : null;
    const regularEvents = items.slice(0, -1);
    
    const result = [];
    for (let i = 0; i < regularEvents.length; i += REGULAR_ITEMS_PER_SLIDE) {
      result.push(regularEvents.slice(i, i + REGULAR_ITEMS_PER_SLIDE));
    }
    
    return { slides: result, championshipEvent };
  }, [items]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.slides.length - 1 : prev - 1
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
      ) : slides.slides.length > 0 ? (
        <>
          {/* ✅ Slider Container with Regular Events + Championship */}
          <div className="slider-container">
  {/* ✅ Regular cards sit directly in the grid - no wrapper div */}
  {slides.slides[currentSlide].map((event) => (
    <div key={event.id} className="card">
      <div
        className="card-image"
        style={{
          backgroundImage: event.image_url 
          ? `url(${getFullImageUrl(event.image_url)})` 
          : 'url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="card-content">
        <h3>{event.golf_course}</h3>
        <p className="card-location">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {event.township}, {event.state}
        </p>
        <p className="card-date">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          {new Date(event.date).toLocaleDateString('en-US')}
        </p>
        {/* ✅ Button pushed to bottom */}
        <button
          className="register-btn"
          style={{ marginTop: 'auto' }}
          onClick={() => openRegistration(event)}
        >
          Register
        </button>
      </div>
    </div>
  ))}

  {/* ✅ Championship card is the 4th column - same size as others */}
  {slides.championshipEvent && (
    <div className="championship-card">
      <div
        className="championship-image"
        style={{
          backgroundImage: slides.championshipEvent.image_url
          ? `url(${getFullImageUrl(slides.championshipEvent.image_url)})`
          : 'url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800)',
        }}
      />
      <div className="championship-content">
        <div className="championship-badge">
          
          🏆 Championship Round
        </div>
        <h3>{slides.championshipEvent.golf_course}</h3>
        <p className="championship-location">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {slides.championshipEvent.township}, {slides.championshipEvent.state}
        </p>
        <p className="championship-date">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          {new Date(slides.championshipEvent.date).toLocaleDateString('en-US')}
        </p>
        <button
          className="championship-register"
          onClick={() => openRegistration(slides.championshipEvent)}
        >
          Register for Championship
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  )}
</div>
{showRegistrationModal && selectedEvent && (
            <EventRegistrationModal
              event={selectedEvent}
              onClose={closeRegistration}
              onSuccess={closeRegistration}
            />
          )}

          {/* Slider Navigation */}
          <div className="slider-nav">
            <button
              className="slider-arrow"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              &#10094;
            </button>

            <div className="slider-dots">
              {slides.slides.map((_, index) => (
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

export function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const PARTNERS_PER_SLIDE = 3;

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnersApi.getAll();
      setPartners(data);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  // Split partners into slides of 3
  const slides = [];
  for (let i = 0; i < partners.length; i += PARTNERS_PER_SLIDE) {
    slides.push(partners.slice(i, i + PARTNERS_PER_SLIDE));
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return null;
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    
    <section className="collection">
      <div className="partners-container">
        <div className="section-header">
          <div>
            <h2>Our Partners</h2>
            <p className="section-subtitle">Proud to be supported by these incredible organizations</p>
          </div>
        </div>

        <div className="partners-slider-wrapper">
          <div className="partners-slider-viewport">
            <div 
              className="partners-track"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="partners-slide">
                  {slide.map((partner) => (
                    <div
                      key={partner.id}
                      className="partner-card"
                      onClick={() => partner.website_url && window.open(partner.website_url, '_blank')}
                      style={{ cursor: partner.website_url ? 'pointer' : 'default' }}
                    >
                      <div className="partner-logo-wrapper">
                        <img
                          src={getFullImageUrl(partner.logo_url)}
                          alt={partner.name}
                          className="partner-logo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <h3 className="partner-name">{partner.name}</h3>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Navigation */}
            {slides.length > 1 && (
              <>
                <button className="partner-arrow partner-prev" onClick={prevSlide}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button className="partner-arrow partner-next" onClick={nextSlide}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dots - outside viewport */}
          {slides.length > 1 && (
            <div className="partner-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`partner-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
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
            <Link to="/sagatour">Saga Tour</Link>
            <Link to="/scholarships">Scholarships</Link>
          </div>
          <div className="footer-column">
            <h4>Connect</h4>
            <Link to="/contact">Contact</Link>
            <Link to="/photos">Photos</Link>
            <a href="https://www.instagram.com/sagagolfofficial">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SAGA Golf. All rights reserved.</p>
      </div>
    </footer>
  );
}