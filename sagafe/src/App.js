import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage.js";
import SignUpPage from "./SignUpPage.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";


export function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  

  return (
    <div className="app">
      <Header user={user} setUser={setUser} />

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
        <Route
          path="/login"
          element={<LoginPage setUser={setUser} />}
        />
        <Route 
          path="/signup" 
          element={<SignUpPage />} 
        />
      </Routes>
    </div>
  );
}



function Header({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const iconRef = useRef(null);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
        <a href="/">
          <img src="/sagalogo.png" alt="Saga Golf" className="logo-image" />
        </a>
      </div>

      <nav className="nav">
        <a href="#" className="Active">About</a>
        <a href="#">Events</a>
        <a href="#">News</a>
        <a href="#">Photos</a>
        <a href="#">Contact</a>
      </nav>

      <div className="user-section">
        {user ? (
          <div className="user-info">
            <span className="user-name">{user.first_name}</span>
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
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}



function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>South Asian Golf League</h1>
        <p>NJ Golf</p>
        <button className="primary-btn">Explore Events</button>
      </div>
      <img
        src="https://i.ebayimg.com/images/g/UKIAAOSwLOViWckO/s-l1200.jpg"
        alt="Saga Golf"
        className="hero-image"
      />
    </section>
  );
}


export function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/items')
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="collection">
      <h2>Golf Courses 2026</h2>
      <div className="card-grid">
        {items.map((item, index) => (
          <div className="card" key={index}>
            <div className="card-image" />
            <h3>{item.golf_course}</h3>
            <p>{item.township}</p>
          </div>
        ))}
      </div>
    </section>
  );
}



