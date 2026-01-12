import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [form, setForm] = useState({ first_name: "", last_name: "", phone_number:"", email: "", password: "", golf_handicap: "" });
  const navigate = useNavigate();

  const handleSignUp = async () => {
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

  return (
    <div>
      <h1>Sign Up</h1>
      {["first_name","last_name","phone_number","email","password","golf_handicap"].map((key) => (
        <input
          key={key}
          placeholder={key.replace("_"," ")}
          type={key==="password"?"password":"text"}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
