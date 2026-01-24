import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    golf_handicap: ""
  });
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/auth/signup", form);
      alert("Signup successful!");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        alert(detail);
      } else if (Array.isArray(detail)) {
        alert(detail[0]?.msg || "Signup failed");
      } else if (typeof detail === "object") {
        alert(detail.message || "Signup failed");
      } else {
        alert("Signup failed");
      }
    }
  };

  const fields = [
    { key: "first_name", label: "First Name", type: "text", placeholder: "John" },
    { key: "last_name", label: "Last Name", type: "text", placeholder: "Doe" },
    { key: "phone_number", label: "Phone Number", type: "tel", placeholder: "(555) 555-5555" },
    { key: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
    { key: "password", label: "Password", type: "password", placeholder: "Create a password" },
    { key: "golf_handicap", label: "Golf Handicap", type: "text", placeholder: "e.g., 12 (optional)" }
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
              required={field.key !== "golf_handicap"}
            />
          </div>
        ))}
        <button type="submit">Create Account</button>
        <p>
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}
