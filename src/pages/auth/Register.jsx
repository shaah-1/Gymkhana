import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserByEmail, registerUser } from "../../services/authService";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const isAdmin = useSelector((s) => s.adminAuth?.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // If already authenticated, redirect automatically
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else if (isAuth) {
      navigate("/", { replace: true });
    }
  }, [isAuth, isAdmin, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      return setError("Please fill in all fields.");
    }

    if (name.length < 2) {
      return setError("Please enter your full name.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    setLoading(true);

    try {
      const existing = await getUserByEmail(email);
      if (existing.length > 0) {
        return setError("An account with this email already exists.");
      }

      await registerUser({
        name,
        email,
        password,
        role: "customer",
        blocked: false,
      });

      navigate("/login", {
        state: {
          message: "Account created successfully! Please sign in.",
          registeredEmail: email,
        },
      });
    } catch {
      setError(
        "Registration failed. Please check whether JSON server is running on port 3000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-login-page editorial-register-page">
      {/* Top Header Bar across the screen */}
      <header className="editorial-login-nav">
        <div className="editorial-nav-left">
          <Link
            to="/"
            className="editorial-nav-menu-btn"
            aria-label="Home"
            title="Home"
          >
            <span className="editorial-nav-menu-line" />
            <span className="editorial-nav-menu-line" />
          </Link>
        </div>

        <Link to="/" className="editorial-nav-brand">
          GYMKHANA
        </Link>

        <div className="editorial-nav-right">
          <Link to="/login" className="editorial-nav-link">
            LOG IN
          </Link>
          <span className="editorial-nav-link active">CREATE ACCOUNT</span>
        </div>
      </header>

      {/* Main Full-Screen Layout */}
      <main className="editorial-login-main">
        <div className="editorial-login-content">
          {/* Left Column: Framed Editorial Photo */}
          <section className="editorial-photo-col">
            <div className="editorial-photo-frame">
              <img
                src={publicAssetUrl("/images/login-banner.jpg")}
                alt="GYMKHANA Training Space"
              />
            </div>
          </section>

          {/* Right Column: Register Form */}
          <section className="editorial-form-col">
            <h1 className="editorial-login-heading">Create account</h1>

            {error && (
              <p className="editorial-error-alert" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* FULL NAME */}
              <div className="editorial-field-group">
                <label
                  htmlFor="register-name"
                  className="editorial-field-label"
                >
                  FULL NAME
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !form.email.trim()) {
                      e.preventDefault();
                      emailInputRef.current?.focus();
                    }
                  }}
                  required
                  className="editorial-underline-input"
                />
              </div>

              {/* EMAIL */}
              <div className="editorial-field-group">
                <label
                  htmlFor="register-email"
                  className="editorial-field-label"
                >
                  EMAIL
                </label>
                <input
                  ref={emailInputRef}
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !form.password) {
                      e.preventDefault();
                      passwordInputRef.current?.focus();
                    }
                  }}
                  required
                  className="editorial-underline-input"
                />
              </div>

              {/* PASSWORD */}
              <div className="editorial-field-group">
                <div className="editorial-field-header">
                  <label
                    htmlFor="register-password"
                    className="editorial-field-label"
                  >
                    PASSWORD
                  </label>
                  <span className="editorial-field-hint">
                    Min. 8 characters
                  </span>
                </div>
                <div className="editorial-input-wrapper">
                  <input
                    ref={passwordInputRef}
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="editorial-underline-input"
                  />
                  <button
                    type="button"
                    className="editorial-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="editorial-signin-btn"
                disabled={loading}
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>

              {/* SIGN IN PROMPT */}
              <p className="editorial-signup-row">
                Already have an account?
                <Link to="/login">Sign in</Link>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
