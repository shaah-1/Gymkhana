import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loginUser } from "../../services/authService";
import { loginSuccess } from "../../redux/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must contain at least 8 characters.");

    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      if (!user) return setError("Invalid email or password");

      const safeUser = { ...user };
      delete safeUser.password;
      dispatch(loginSuccess(safeUser));

      const dest = location.state?.from;
      const next = dest?.pathname?.startsWith("/") && !dest.pathname.startsWith("//")
        ? { pathname: dest.pathname, search: dest.search || "", hash: dest.hash || "" }
        : "/";

      navigate(next, { replace: true, state: { message: "Login successful!" } });
    } catch (err) {
      setError(err.response ? "Unable to log in. Please try again." : "Login failed. Check server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-split-layout">
      <section className="auth-image-panel">
        <img src="/images/login-banner.jpg" alt="GYMKHANA fitness training space" />
        <div className="auth-image-overlay">
          <p className="auth-image-brand">GYMKHANA</p>
          <div>
            <p className="auth-image-eyebrow">BUILT THROUGH DISCIPLINE</p>
            <h2>Stronger every day.<br />Better every rep.</h2>
            <p className="auth-image-description">Your journey. Your strength. Your rules.</p>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Log in</h1>
          <p className="auth-subtitle">Continue your journey with GYMKHANA.</p>

          {message && (
            <div className="login-success-popup" role="status">
              <span className="success-icon">✓</span>
              <div>
                <strong>{message}</strong>
                <p>Thank you for being part of GYMKHANA.</p>
              </div>
            </div>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}

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
          <div className="password-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In →"}
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
