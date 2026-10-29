
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../services/authService";
import { loginSuccess } from "../redux/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(email.trim(), password);

      if (!user) {
        setError("Invalid email or password");
        return;
      }

      // Never store the password in Redux user state.
      const { password: _password, ...safeUser } = user;

      dispatch(loginSuccess(safeUser));

      const destination = location.state?.from;
      const nextPath =
        destination?.pathname?.startsWith("/") &&
        !destination.pathname.startsWith("//")
          ? destination.pathname
          : "/";

    navigate(nextPath, {
  replace: true,
  state: { message: "Login successful!" },
});
    } catch (err) {
      if (err.response) {
        setError("Unable to log in. Please try again.");
      } else {
        setError(
          "Login failed. Check JSON Server and your API configuration."
        );
      }
    } finally {
      setLoading(false);
    }
  };


return (
  <main className="auth-page auth-split-layout">
    <section className="auth-image-panel">
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85"
        alt="GYMKHANA fitness training space"
      />

      <div className="auth-image-overlay">
        <p className="auth-image-brand">GYMKHANA</p>
        <div>
          <p className="auth-image-eyebrow">
            BUILT THROUGH DISCIPLINE
          </p>
          <h2>
            Stronger every day.
            <br />
            Better every rep.
          </h2>
          <p className="auth-image-description">
            Your journey. Your strength. Your rules.
          </p>
        </div>
      </div>
    </section>

    <section className="auth-form-panel">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Log in</h1>
        <p className="auth-subtitle">
          Continue your journey with GYMKHANA.
        </p>

       {message && (
  <div className="login-success-popup" role="status">
    <span className="success-icon">✓</span>
    <div>
      <strong>{message}</strong>
      <p>Thank you for being part of GYMKHANA.</p>
    </div>
  </div>
)}
        
        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In →"}
        </button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </section>
  </main>
);
}
