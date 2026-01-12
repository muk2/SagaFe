import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // for inline error messages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });
  
      // Save user
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
  
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };
  

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {/* Inline error display */}
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

        <p>
          Don't have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
