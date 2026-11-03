import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { adminLogin } from "../store/slices/adminAuthSlice";
import "../admin.css";

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === "admin@gymkhana.com" && password === "admin123") {
      dispatch(adminLogin({ email: trimmedEmail, password }));
      navigate("/admin", { replace: true });
    } else {
      setError("Invalid credentials. Please use admin@gymkhana.com / admin123");
    }
  };

  return (
    <main className="eden-login-container">
      {/* Top Black Luxury Header Bar */}
      <header className="eden-topbar">
        <div className="eden-topbar-inner">
          <div className="eden-brand-row">
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#8a8c92", textTransform: "uppercase" }}>
              Administration
            </span>
            <Link to="/" className="eden-brand-title">
              Gymkhana
            </Link>
            <Link to="/" className="eden-topbar-link">
              <span>Storefront</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Luxury Content Body */}
      <div className="eden-login-body">
        <div className="eden-login-grid">
          {/* Left Editorial Narrative Column */}
          <div className="eden-login-brand-col">
            <p className="eden-login-eyebrow">PORTAL ACCESS / MANAGEMENT</p>
            <h1 className="eden-login-display-title">ADMIN LOGIN</h1>
            <p className="eden-login-desc">
              Access the central operations terminal to oversee active inventory,
              customer records, and order fulfillment with refined precision.
            </p>

            <div className="eden-login-pillars">
              <div className="eden-login-pillar-item">
                <span className="eden-login-pillar-num">01</span>
                <span className="eden-login-pillar-text">Catalog & Stock Control</span>
              </div>
              <div className="eden-login-pillar-item">
                <span className="eden-login-pillar-num">02</span>
                <span className="eden-login-pillar-text">Fulfillment & Shipping Oversight</span>
              </div>
              <div className="eden-login-pillar-item">
                <span className="eden-login-pillar-num">03</span>
                <span className="eden-login-pillar-text">Client Accounts & Security</span>
              </div>
            </div>
          </div>

          {/* Right Luxury Form Card Column (Edén Style) */}
          <div className="eden-login-card">
            <div className="eden-login-card-header">
              <h2 className="eden-login-card-title">1 CREDENTIALS</h2>
            </div>

            {error && <div className="eden-error-notice">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="eden-login-form-fields">
                {/* Email Field with Underline Hairline */}
                <div className="eden-field-group">
                  <label htmlFor="eden-email" className="eden-field-label">
                    Email Address
                  </label>
                  <input
                    id="eden-email"
                    type="email"
                    className="eden-underline-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gymkhana.com"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password Field with Underline Hairline */}
                <div className="eden-field-group" style={{ position: "relative" }}>
                  <label htmlFor="eden-pass" className="eden-field-label">
                    Password
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      id="eden-pass"
                      type={showPassword ? "text" : "password"}
                      className="eden-underline-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 0,
                        background: "none",
                        border: "none",
                        color: "#7e8088",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta Row */}
              <div className="eden-login-meta-row">
                <label className="eden-login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this device</span>
                </label>

                <span style={{ color: "#8a8c92", fontSize: "11px" }}>
                  admin@gymkhana.com / admin123
                </span>
              </div>

              {/* Actions */}
              <div className="eden-login-btn-row">
                <button type="submit" className="eden-btn-black">
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </button>

                <Link to="/" className="eden-return-link">
                  ← Return to Storefront
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;
