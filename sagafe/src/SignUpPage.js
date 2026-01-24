import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function SignUpPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    golf_handicap: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare data - convert golf_handicap to number if provided
      const userData = {
        ...form,
        golf_handicap: form.golf_handicap ? parseInt(form.golf_handicap, 10) : null,
      };

      await signup(userData);
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      const message = err.message || "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "first_name", label: "First Name", type: "text", placeholder: "John" },
    { key: "last_name", label: "Last Name", type: "text", placeholder: "Doe" },
    { key: "phone_number", label: "Phone Number", type: "tel", placeholder: "(555) 555-5555" },
    { key: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
    { key: "password", label: "Password", type: "password", placeholder: "Create a password" },
    { key: "golf_handicap", label: "Golf Handicap", type: "number", placeholder: "e.g., 12 (optional)" }
  ];

  return (
    <div className="login-page">
      <h1>Create Account</h1>
      <form onSubmit={handleSignUp} className="login-form">
        {fields.map((field) => (
          <div className="form-group" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              required={field.key !== "golf_handicap" && field.key !== "phone_number"}
              disabled={loading}
            />
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {error && (
          <div className="error-message" style={{ color: "#ef4444", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <p>
          Already have an account?{" "}
          <span
            style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 500 }}
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}
