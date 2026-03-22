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
import EventRegistrationModal from "./components/EventRegistrationModal.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import ScholarshipsPage from "./pages/ScholarshipPage.js";
import RenewMembershipPage from "./pages/RenewMembershipPage.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Banner from "./Banner";
import { useAuth } from "./context/AuthContext";
import { eventsApi, api, carouselApi, partnersApi, authApi} from "./lib/api";
import { isAdmin } from "./lib/auth";
import ScrollToTop from "./components/ScrollToTop.js";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

// Safe date parser that avoids UTC timezone issues with YYYY-MM-DD strings
function parseEventDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string') {
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
  }
  return new Date(dateStr);
}

export function App() {
  return (
    <div className="app">
      <Header />
      <Banner />
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <ItemList />
              <LeaderboardSection />
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
        <Route path="/renew-membership" element={<ProtectedRoute allowExpired><RenewMembershipPage /></ProtectedRoute>} />
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
  const navRef = useRef(null);
  const toggleRef = useRef(null);
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

    const handleMobileClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleMobileClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleMobileClickOutside);
    };
  }, [mobileMenuOpen]);


  return (
    <>
    <div className="instagram-bar">
      <a
        href="https://www.instagram.com/sagagolfofficial"
        target="_blank"
        style={{fontWeight: 'bold'}}
        rel="noopener noreferrer"
        className="instagram-follow"
      >
        Follow us on Instagram @sagagolfofficial
      </a>
    </div>
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/sagalogo.png" alt="Saga Golf" className="logo-image" />
        </Link>
      </div>

      <button
        ref={toggleRef}
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav ref={navRef} className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>About</NavLink>
        <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Events</NavLink>
        <NavLink to="/photos" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Photos</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
        <NavLink to="/sagatour" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Saga Tour</NavLink>
        <NavLink to="/scholarships" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Scholarships</NavLink>

        {/* Auth buttons inside mobile dropdown */}
        {!user && (
          <div className="mobile-auth-buttons">
            <button className="login-btn" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>Login</button>
            <button className="signup-btn" onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }}>Membership Sign Up</button>
          </div>
        )}
        {user && (
          <div className="mobile-auth-buttons">
            <button className="login-btn" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}>Dashboard</button>
            {isAdmin() && (
              <button className="login-btn" onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}>Admin Dashboard</button>
            )}
            <button className="signup-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</button>
          </div>
        )}
      </nav>

      <div className="user-section">
        {user ? (
          <div className="user-info">
            <div className="user-name-group">
              <span className="user-name">{user.first_name}</span>
              {user.handicap && (
                <span className="user-handicap" title="Golf Handicap">
                  HCP: {user.handicap}
                </span>
              )}
            </div>
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
                {isAdmin() && (
                  <button onClick={() => { navigate("/admin"); setMenuOpen(false); }} className="admin-menu-item">
                    Admin Dashboard
                  </button>
                )}
                {user.membership_expired && (
                  <button onClick={() => { navigate("/renew-membership"); setMenuOpen(false); }} className="renew-menu-item">
                    Renew Membership
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
    </>
  );
}

function ProtectedRoute({ children, allowExpired = false }) {
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

  if (user.membership_expired && !allowExpired && user.role !== 'admin') {
    return <Navigate to="/renew-membership" replace />;
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
  const REGULAR_ITEMS_PER_SLIDE = 2;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
            const eventDate = parseEventDate(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          })
          .sort((a, b) => {
            const dateA = parseEventDate(a.date);
            const dateB = parseEventDate(b.date);
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

  // ✅ Split events by event_type: regular, championship, ryder_cup
  const slides = useMemo(() => {
    const championshipEvent = items.find(e => e.event_type === 'championship') || null;
    const ryderCupEvent = items.find(e => e.event_type === 'ryder_cup') || null;
    const regularEvents = items.filter(e => !e.event_type || e.event_type === 'regular');

    const result = [];
    for (let i = 0; i < regularEvents.length; i += REGULAR_ITEMS_PER_SLIDE) {
      result.push(regularEvents.slice(i, i + REGULAR_ITEMS_PER_SLIDE));
    }

    return { slides: result, championshipEvent, ryderCupEvent };
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
  {/* On mobile: show ALL regular events in scrollable row; on desktop: show current slide only */}
  {(isMobile ? items.filter(e => !e.event_type || e.event_type === 'regular') : slides.slides[currentSlide]).map((event) => (
    <div key={event.id} className="card">
      <div
        className="card-image"
        style={{
          backgroundImage: event.image_url 
          ? `url(${getFullImageUrl(event.image_url)})` 
          : 'url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
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
          {parseEventDate(event.date).toLocaleDateString('en-US')}
        </p>
        {/* ✅ Button pushed to bottom */}
        <button
          className={`register-btn ${event.registration_open === false ? 'register-btn-disabled' : ''}`}
          style={{ marginTop: 'auto' }}
          onClick={() => event.registration_open !== false && openRegistration(event)}
          disabled={event.registration_open === false}
        >
          {event.registration_open === false ? 'Registration Closed' : 'Register'}
        </button>
      </div>
    </div>
  ))}

  {/* ✅ Ryder Cup card - sticky to slider with red/blue border */}
  {slides.ryderCupEvent && (() => {
    const rcDate = parseEventDate(slides.ryderCupEvent.date);
    const day2 = new Date(rcDate);
    day2.setDate(day2.getDate() + 1);
    return (
      <div className="ryder-cup-card">
        <div
          className="ryder-cup-image"
          style={{
            backgroundImage: slides.ryderCupEvent.image_url
            ? `url(${getFullImageUrl(slides.ryderCupEvent.image_url)})`
            : 'url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800)',
          }}
        />
        <div className="ryder-cup-content">
          <div className="ryder-cup-badge">
            SAGA Ryder Cup
          </div>
          <h3>SAGA Ryder Cup {rcDate.getFullYear()}</h3>
          <p className="ryder-cup-location">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {slides.ryderCupEvent.township}, {slides.ryderCupEvent.state}
          </p>
          <p className="ryder-cup-date">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {rcDate.toLocaleDateString('en-US')} – {day2.toLocaleDateString('en-US')}
          </p>
          <button
            className={`ryder-cup-register ${slides.ryderCupEvent.registration_open === false ? 'register-btn-disabled' : ''}`}
            onClick={() => slides.ryderCupEvent.registration_open !== false && openRegistration(slides.ryderCupEvent)}
            disabled={slides.ryderCupEvent.registration_open === false}
          >
            {slides.ryderCupEvent.registration_open === false ? 'Registration Closed' : 'Register for Ryder Cup'}
            {slides.ryderCupEvent.registration_open !== false && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  })()}

  {/* ✅ Championship card - sticky to slider */}
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
        <h3>SAGA Open {parseEventDate(slides.championshipEvent.date).getFullYear()}</h3>
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
          {parseEventDate(slides.championshipEvent.date).toLocaleDateString('en-US')}
        </p>
        <button
          className={`championship-register ${slides.championshipEvent.registration_open === false ? 'register-btn-disabled' : ''}`}
          onClick={() => slides.championshipEvent.registration_open !== false && openRegistration(slides.championshipEvent)}
          disabled={slides.championshipEvent.registration_open === false}
        >
          {slides.championshipEvent.registration_open === false ? 'Registration Closed' : 'Register for Championship'}
          {slides.championshipEvent.registration_open !== false && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )}
</div>

          
          
          
          {showRegistrationModal && selectedEvent && (
            <EventRegistrationModal
              event={selectedEvent}
              onClose={closeRegistration}
              displayName={
                slides.championshipEvent && selectedEvent.id === slides.championshipEvent.id
                  ? `SAGA Open ${parseEventDate(selectedEvent.date).getFullYear()}`
                  : slides.ryderCupEvent && selectedEvent.id === slides.ryderCupEvent.id
                    ? `SAGA Ryder Cup ${parseEventDate(selectedEvent.date).getFullYear()}`
                    : undefined
              }
              onSuccess={() => {
                closeRegistration();
                eventsApi.getAll().then(data => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const upcomingEvents = data
                    .filter(event => {
                      if (!event.date) return false;
                      const eventDate = parseEventDate(event.date);
                      eventDate.setHours(0, 0, 0, 0);
                      return eventDate >= today;
                    })
                    .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));
                  setItems(upcomingEvents);
                });
              }}
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


export function LeaderboardSection() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [roundWinner, setRoundWinner] = useState(null);
  const [leaderboardUrl, setLeaderboardUrl] = useState(null);
  const [loadingWinner, setLoadingWinner] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchLeaderboardUrl();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      const sorted = [...data].sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));
      setEvents(sorted);
      if (sorted.length > 0) {
        setSelectedEventId(String(sorted[0].id));
        fetchRoundWinner(sorted[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchLeaderboardUrl = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await api.get('/api/leaderboard/pdf');
      setLeaderboardUrl(data?.url || null);
    } catch {
      setLeaderboardUrl(null);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchRoundWinner = async (eventId) => {
    if (!eventId) return;
    setLoadingWinner(true);
    setRoundWinner(null);
    try {
      const data = await api.get(`/api/round-winners/${eventId}`);
      setRoundWinner(data);
    } catch {
      setRoundWinner(null);
    } finally {
      setLoadingWinner(false);
    }
  };

  const handleEventChange = (e) => {
    const id = e.target.value;
    setSelectedEventId(id);
    fetchRoundWinner(id);
  };

  const selectedEvent = events.find(ev => String(ev.id) === selectedEventId);

  return (
    
    <section className="collection">
        <div className="section-header">
          <div>
            <h2>SAGA Standings</h2>
            <p className="section-subtitle">Track the season leaderboard and celebrate our monthly champions</p>
            </div>
        </div>

        <div className="ss-tab-bar">
          <button
            className={`ss-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            SAGA Leaderboard
          </button>
          <button
            className={`ss-tab ${activeTab === 'winners' ? 'active' : ''}`}
            onClick={() => setActiveTab('winners')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
            Monthly Round Winners
          </button>
        </div>

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="ss-panel">
            {loadingLeaderboard ? (
              <div className="ss-empty"><div className="ss-spinner" /></div>
            ) : leaderboardUrl ? (
              <div className="ss-pdf-card">
                <div className="ss-pdf-left">
                  <div className="ss-pdf-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="36" height="36">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="ss-pdf-title">SAGA Season Leaderboard</h3>
                    <p className="ss-pdf-desc">Current standings for all SAGA members this season. Updated by the association.</p>
                  </div>
                </div>
                <a
                  href={`${API_URL}${leaderboardUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ss-pdf-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  View Leaderboard
                </a>
              </div>
            ) : (
              <div className="ss-empty">
                <span className="ss-empty-icon">📄</span>
                <p>The season leaderboard hasn't been uploaded yet.</p>
                <span>Check back after the first event!</span>
              </div>
            )}
          </div>
        )}

        {/* WINNERS TAB */}
        {activeTab === 'winners' && (
          <div className="ss-panel">
            {events.length === 0 ? (
              <div className="ss-empty">
                <span className="ss-empty-icon">📅</span>
                <p>No events found.</p>
              </div>
            ) : (
              <>
                <div className="ss-event-picker">
                  <label htmlFor="ss-event-select">Select Event</label>
                  <select
                    id="ss-event-select"
                    value={selectedEventId}
                    onChange={handleEventChange}
                    className="ss-select"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.golf_course} — {parseEventDate(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingWinner ? (
                  <div className="ss-empty"><div className="ss-spinner" /></div>
                ) : !roundWinner ? (
                  <div className="ss-empty">
                    <span className="ss-empty-icon">🏌️</span>
                    <p>No results recorded for this event yet.</p>
                  </div>
                ) : (
                  <div className="ss-winners-card">
                    {roundWinner.sponsors && roundWinner.sponsors.length > 0 && (
                      <div className="ss-sponsor-banner">
                        {roundWinner.sponsors.map((s, i) => (
                          <div key={i} className="ss-sponsor-line">
                           
                            <span className="ss-sponsor-msg">
                              Big thank you to our Sponsor{' '}
                              {s.company_name && <strong>{s.company_name}</strong>}
                              {s.sponsor_name && (
                                <> (Courtesy <strong>{s.sponsor_name}</strong>)</>
                              )}!!!
                            </span>
                            
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="ss-winners-heading">
                      <h3>{selectedEvent?.golf_course}</h3>
                      {selectedEvent && (
                        <span className="ss-winners-date">
                          {parseEventDate(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div className="ss-table-wrap">
                      <table className="ss-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Winner</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roundWinner.lowest_gross_winner && (
                            <tr>
                              <td><span className="ss-cat-icon">🏌️</span> Lowest Gross Score</td>
                              <td><strong>{roundWinner.lowest_gross_winner}</strong></td>
                              <td className="ss-result">{roundWinner.lowest_gross_score != null ? roundWinner.lowest_gross_score : '—'}</td>
                            </tr>
                          )}
                          {roundWinner.stableford_winner && (
                            <tr>
                              <td><span className="ss-cat-icon">📊</span> Highest Stableford Points</td>
                              <td><strong>{roundWinner.stableford_winner}</strong></td>
                              <td className="ss-result">{roundWinner.stableford_points != null ? `${roundWinner.stableford_points} pts` : '—'}</td>
                            </tr>
                          )}
                          {roundWinner.straightest_drive_winner && (
                            <tr>
                              <td><span className="ss-cat-icon">🎯</span> Straightest Drive
                              {roundWinner.straightest_drive_hole && <span className="ss-hole-badge">Hole {roundWinner.straightest_drive_hole}</span>}</td>
                              <td><strong>{roundWinner.straightest_drive_winner}</strong></td>
                              <td className="ss-result">
                                {roundWinner.straightest_drive_distance ? `${roundWinner.straightest_drive_distance}` : '—'}
                              </td>
                            </tr>
                          )}
                          {roundWinner.close_to_pin && roundWinner.close_to_pin.map((ctp, i) => (
                            <tr key={i}>
                              <td>
                                <span className="ss-cat-icon">📍</span> Close to Pin
                                {ctp.hole && <span className="ss-hole-badge">Hole {ctp.hole}</span>}
                              </td>
                              <td><strong>{ctp.winner}</strong></td>
                              <td className="ss-result">{ctp.distance ? `${ctp.distance}` : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
     

      <style>{`
      .saga-standings-section {
          background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
          padding: 5rem 2rem;
          position: relative;
          overflow: hidden;
        }
        .saga-standings-section::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .saga-standings-inner { max-width: 860px; margin: 0 auto; }
        .ss-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.25rem; }
        .ss-title { font-size: 2rem; font-weight: 800; color: #111827; letter-spacing: -0.03em; margin: 0 0 0.4rem; }
        .ss-subtitle { color: #6b7280; font-size: 1rem; margin: 0; }
        .ss-header-icon { font-size: 3rem; opacity: 0.15; }
        .ss-tab-bar {
          display: flex; gap: 0;
          background: #f3f4f6; border-radius: 12px; padding: 4px;
          margin-bottom: 1.75rem; width: fit-content; max-width: 100%;
        }
        .ss-tab {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 1.25rem; border: none; border-radius: 9px;
          background: transparent; color: #6b7280;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s ease; white-space: nowrap;
        }
        @media (max-width: 480px) {
          .ss-tab-bar { width: 100%; }
          .ss-tab { flex: 1; justify-content: center; padding: 0.6rem 0.75rem; font-size: 0.7rem; white-space: normal; text-align: center; }
          .ss-tab svg { display: none; }
        }
        .ss-tab.active { background: white; color: #065f46; box-shadow: 0 1px 6px rgba(0,0,0,0.1); }
        .ss-tab:hover:not(.active) { color: #374151; }
        .ss-panel {
          background: white; border: 1px solid #e5e7eb;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06); min-height: 200px;
        }
        .ss-pdf-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; padding: 2rem 2.5rem; flex-wrap: wrap;
        }
        .ss-pdf-left { display: flex; align-items: center; gap: 1.25rem; }
        .ss-pdf-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          color: #065f46; flex-shrink: 0;
        }
        .ss-pdf-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.35rem; }
        .ss-pdf-desc { font-size: 0.875rem; color: #6b7280; margin: 0; max-width: 380px; }
        .ss-pdf-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.5rem;
          background: linear-gradient(135deg, #059669, #047857);
          color: white; border-radius: 10px; font-weight: 700;
          font-size: 0.9rem; text-decoration: none; white-space: nowrap;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 2px 8px rgba(5,150,105,0.3);
        }
        .ss-pdf-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(5,150,105,0.4); }
        .ss-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 3.5rem 2rem;
          gap: 0.5rem; color: #9ca3af; text-align: center;
        }
        .ss-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .ss-empty p { font-size: 1rem; color: #6b7280; margin: 0; font-weight: 500; }
        .ss-empty span { font-size: 0.875rem; }
        .ss-spinner {
          width: 32px; height: 32px;
          border: 3px solid #e5e7eb; border-top-color: #059669;
          border-radius: 50%; animation: ss-spin 0.7s linear infinite;
        }
        @keyframes ss-spin { to { transform: rotate(360deg); } }
        .ss-event-picker {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.25rem 1.75rem; border-bottom: 1px solid #f3f4f6;
          background: #fafafa; flex-wrap: wrap;
        }
        .ss-event-picker label { font-size: 0.875rem; font-weight: 600; color: #374151; white-space: nowrap; }
        .ss-select {
          flex: 1; min-width: 220px; padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db; border-radius: 8px;
          font-size: 0.9rem; color: #111827; background: white; cursor: pointer;
        }
        .ss-select:focus { outline: none; border-color: #059669; }
        .ss-winners-card { padding: 0 0 1.5rem; }
        .ss-sponsor-banner {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.35rem; padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-bottom: 1px solid #fcd34d; text-align: center;
        }
        .ss-sponsor-line {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; flex-wrap: wrap;
        }
        .ss-sponsor-star { font-size: 1.1rem; }
        .ss-sponsor-msg { font-size: 0.925rem; color: #78350f; font-weight: 500; }
        .ss-sponsor-msg strong { color: #92400e; }
        .ss-winners-heading { padding: 1.25rem 1.75rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
        .ss-winners-heading h3 { font-size: 1.2rem; font-weight: 800; color: #111827; margin: 0 0 0.2rem; }
        .ss-winners-date { font-size: 0.85rem; color: #6b7280; }
        .ss-table-wrap { overflow-x: auto; }
        .ss-table { width: 100%; border-collapse: collapse; font-size: 0.925rem; }
        .ss-table thead tr { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .ss-table th {
          padding: 0.75rem 1.75rem; text-align: left;
          font-size: 0.78rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;
        }
        .ss-table td { padding: 1rem 1.75rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
        .ss-table tbody tr:last-child td { border-bottom: none; }
        .ss-table tbody tr:hover td { background: #f9fafb; }
        .ss-cat-icon { margin-right: 0.4rem; }
        .ss-hole-badge {
          display: inline-block; margin-left: 0.5rem;
          padding: 0.1rem 0.5rem; background: #e0f2fe; color: #0369a1;
          border-radius: 10px; font-size: 0.72rem; font-weight: 700;
        }
        .ss-result { font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }
        @media (max-width: 640px) {
          .saga-standings-section { padding: 3rem 1rem; }
          .ss-tab-bar { width: 100%; }
          .ss-tab { flex: 1; justify-content: center; font-size: 0.8rem; padding: 0.55rem 0.75rem; white-space: normal; text-align: center; }
          .ss-pdf-card { flex-direction: column; padding: 1.5rem; }
          .ss-pdf-btn { width: 100%; justify-content: center; }
          .ss-table th, .ss-table td { padding: 0.75rem 1rem; }
        }
	      `}</style>
    </section>
  );
}

export function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(window.innerWidth <= 1024);

  const PARTNERS_PER_SLIDE = 3;

  useEffect(() => {
    const onResize = () => setIsTabletOrMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  // On tablet/mobile show all partners in one scrollable row; on desktop paginate into slides of 3
  const slides = [];
  if (isTabletOrMobile) {
    slides.push(partners);
  } else {
    for (let i = 0; i < partners.length; i += PARTNERS_PER_SLIDE) {
      slides.push(partners.slice(i, i + PARTNERS_PER_SLIDE));
    }
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
