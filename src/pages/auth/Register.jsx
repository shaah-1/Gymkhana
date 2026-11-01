import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserByEmail, registerUser } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password) return setError("Please fill in all fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (form.password.length < 8) return setError("Password must contain at least 8 characters.");

    setLoading(true);
    try {
      const existing = await getUserByEmail(email);
      if (existing.length > 0) return setError("An account with this email already exists.");

      await registerUser({ name, email, password: form.password });
      navigate("/login", { state: { message: "Account created! Please log in." } });
    } catch {
      setError("Registration failed. Check whether JSON Server is running on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">JOIN THE MOVEMENT</p>
        <h1>Create account</h1>
        <p className="auth-subtitle">Start your next level with GYMKHANA.</p>

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="name">Full name</label>
        <input id="name" name="name" type="text" placeholder="Alex Morgan" value={form.name} onChange={handleChange} required />

        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />

        <label htmlFor="password">Password (min. 8 characters)</label>
        <input id="password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account →"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
