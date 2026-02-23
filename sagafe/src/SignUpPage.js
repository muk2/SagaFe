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
    golf_handicap: "",
    membership: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [membershipError, setMembershipError] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();
  const { signup } = useAuth();

  // ✅ Membership options
  const membershipOptions = [
    { value: "individual", label: "Individual", subtitle: null, price: 375.00 },
    { value: "junior", label: "Junior", subtitle: "(Under 26)", price: 150.00 },
    { value: "brunswick", label: "SAGA", subtitle: "Brunswick Member", price: 275.00 }
  ];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setMembershipError(false); 

    if (!form.membership) {
      setError("Please select a membership type");
      setMembershipError(true); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      
      let message = "Signup failed. Please try again.";
      
      // Check different error formats
      if (typeof err === 'string') {
        message = err;
      } else if (err?.response?.data?.detail) {
        // FastAPI error format
        message = err.response.data.detail;
      } else if (err?.detail) {
        // Direct detail field
        message = err.detail;
      } else if (err?.message) {
        // Standard error message
        message = err.message;
      }
      
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("email already") || 
          lowerMessage.includes("already registered") ||
          lowerMessage.includes("email exists")) {
        message = "This email is already registered. Please use a different email or try logging in.";
      } else if (lowerMessage.includes("invalid email")) {
        message = "Please enter a valid email address.";
      } else if (lowerMessage.includes("password")) {
        message = "Password must be at least 6 characters long.";
      }
      
      setError(message);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (555) 555-5555
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };
  
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setForm({ ...form, phone_number: formatted });
  };

  const fields = [
    { key: "first_name", label: "First Name *", type: "text", placeholder: "John", required: true },
    { key: "last_name", label: "Last Name *", type: "text", placeholder: "Doe", required: true },
    { key: "phone_number", label: "Phone Number *", type: "tel", placeholder: "(555) 555-5555", required: true },
    { key: "email", label: "Email Address *", type: "email", placeholder: "john@example.com", required: true },
    { key: "golf_handicap", label: "Golf Handicap", type: "number", placeholder: "e.g., 12", required: false }
  ];

  return (
    <div className="login-page">
      <h1>Membership Sign Up</h1>
    
      {error && (
        <div className="error-banner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignUp} className="login-form">
        {fields.map((field) => (
          <div className="form-group" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={field.key === "phone_number" ? handlePhoneChange : (e) => setForm({ ...form, [field.key]: e.target.value })}
              required={field.required}
              disabled={loading}
            />
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ✅ Membership Options */}
        <div className={`form-group membership-section ${membershipError ? 'has-error' : ''}`}>
          <label className="section-label">
            Select Membership Type *
            {membershipError && <span className="error-indicator"> - Required</span>}
          </label>
          <div className="membership-options">
            {membershipOptions.map((option) => (
              <label 
                key={option.value} 
                className={`membership-option ${form.membership === option.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="membership"
                  value={option.value}
                  checked={form.membership === option.value}
                  onChange={(e) => {
                    setForm({ ...form, membership: e.target.value });
                    setMembershipError(false); // ✅ Clear error when selection is made
                    setError(""); // ✅ Clear general error too
                  }}
                  disabled={loading}
                />
                <div className="option-content">
                  <div className="option-text">
                    <span className="option-label">{option.label}</span>
                    {option.subtitle && <span className="option-subtitle">{option.subtitle}</span>}
                  </div>
                  <span className="option-price">${option.price.toFixed(2)}/year</span>
                </div>
                <div className="radio-indicator"></div>
              </label>
            ))}
          </div>
        
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

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

      <style jsx>{`
        /* Error Banner */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: var(--radius-lg);
          color: #991b1b;
          margin-bottom: 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        .error-banner svg {
          flex-shrink: 0;
          color: #ef4444;
        }

        .error-banner span {
          font-weight: 500;
          line-height: 1.5;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Membership Section Error State */
        .membership-section.has-error {
          border-color: #ef4444;
          background: #fef2f2;
          animation: shake 0.4s ease-in-out;
        }

        .error-indicator {
          color: #ef4444;
          font-weight: 700;
          font-size: 0.875rem;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Password Input Wrapper */
        .password-input-wrapper {
          position: relative;
          width: 100%;
        }

        .password-input-wrapper input {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: var(--primary);
        }

        
        .membership-section {
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }

        .section-label {
          display: block;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .membership-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .membership-option {
          position: relative;
          display: flex;
          align-items: center;
          padding: 1.25rem;
          background: white;
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .membership-option:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);
        }

        .membership-option.selected {
          border-color: var(--primary);
          background: rgba(13, 148, 136, 0.05);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
        }

        .membership-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .option-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .option-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .option-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .option-subtitle {
          font-weight: 400;
          color: var(--text-secondary);
          font-size: 0.743rem;
        }

        .option-price {
          font-weight: 700;
          color: var(--primary);
          font-size: 1.125rem;
        }

        .radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border);
          position: relative;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .membership-option:hover .radio-indicator {
          border-color: var(--primary);
        }

        .membership-option.selected .radio-indicator {
          border-color: var(--primary);
          background: var(--primary);
        }

        .membership-option.selected .radio-indicator::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }

    

        @media (max-width: 768px) {
          .membership-section {
            padding: 1rem;
          }

          .membership-option {
            padding: 1rem;
          }

          .option-content {
            align-items: flex-start;
          }

          .option-price {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}