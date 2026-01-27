import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, NavLink, Link } from "react-router-dom";
import LoginPage from "./LoginPage.js";
import SignUpPage from "./SignUpPage.js";
import ForgotPasswordPage from "./ForgotPasswordPage.js";
import ResetPasswordPage from "./ResetPasswordPage.js";
import AboutPage from "./pages/AboutPage.js";
import EventsPage from "./pages/EventsPage.js";
import NewsPage from "./pages/NewsPage.js";
import PhotosPage from "./pages/PhotosPage.js";
import ContactPage from "./pages/ContactPage.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Banner from "./Banner";
import { useAuth } from "./context/AuthContext";
import { eventsApi } from "./lib/api";


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
        <Route path="/news" element={<NewsPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
        <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>Events</NavLink>
        <NavLink to="/news" className={({ isActive }) => isActive ? 'active' : ''}>News</NavLink>
        <NavLink to="/photos" className={({ isActive }) => isActive ? 'active' : ''}>Photos</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
      </nav>

      <div className="user-section">
        {user ? (
          <div className="user-info">
            <span className="user-name">{user.first_name}</span>
            {user.golf_handicap && (
              <span className="user-handicap" title="Golf Handicap">
                HCP: {user.golf_handicap}
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
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-value">150+</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="hero-stat">
            <span className="stat-value">24</span>
            <span className="stat-label">Events/Year</span>
          </div>
        </div>
      </div>
    </section>
  );
}


export function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getAll();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Unable to load events');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="collection">
      <div className="section-header">
        <div>
          <h2>Featured Courses</h2>
          <p className="section-subtitle">Our partner courses across New Jersey</p>
        </div>
        <button className="view-all-btn" onClick={() => navigate("/events")}>
          View All Events
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="card-grid">
        {loading ? (
          <div className="empty-state">
            <p>Loading courses...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
              Make sure the backend server is running.
            </p>
          </div>
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <div className="card" key={item.id || index}>
              <div className="card-image" style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div className="card-content">
                <h3>{item.golf_course}</h3>
                <p className="card-location">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {item.township}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No courses available at the moment.</p>
          </div>
        )}
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
