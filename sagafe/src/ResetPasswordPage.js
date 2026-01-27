import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "./lib/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <h1>Password Reset Successful</h1>
        <div className="login-form">
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="login-page">
        <h1>Invalid Reset Link</h1>
        <div className="login-form">
          <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#ef4444" }}>
            This password reset link is invalid or has expired.
          </p>
          <button onClick={() => navigate("/forgot-password")}>
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#666" }}>
          Enter your new password below.
        </p>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {error && (
          <div className="error-message" style={{ color: "#ef4444", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
