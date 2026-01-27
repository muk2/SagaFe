import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "./lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <h1>Check Your Email</h1>
        <div className="login-form">
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            We've sent password reset instructions to <strong>{email}</strong>.
            Please check your email and follow the link to reset your password.
          </p>
          <button onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#666" }}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {error && (
          <div className="error-message" style={{ color: "#ef4444", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <p>
          Remember your password?{" "}
          <span
            style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 500 }}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </span>
        </p>
      </form>
    </div>
  );
}
