import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "../../services/authService";
import { loginSuccess } from "../../redux/authSlice";
import { adminLogin, adminLogout } from "../../admin/store/slices/adminAuthSlice";
import { fetchCart } from "../../redux/cartSlice";
import { fetchWishlist } from "../../redux/wishlistSlice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const isAdminAuth = useSelector((s) => s.adminAuth.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(location.state?.registeredEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(location.state?.error || "");
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);

  // If already authenticated, redirect to appropriate landing page
  useEffect(() => {
    if (isAdminAuth) {
      navigate("/admin", { replace: true });
    } else if (isAuth) {
      navigate("/", { replace: true });
    }
  }, [isAdminAuth, isAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      return setError("Please enter your email address.");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      return setError("Please enter a valid email address.");
    }

    if (!trimmedPassword) {
      return setError("Please enter your password.");
    }

    setLoading(true);

    try {
      const user = await loginUser(trimmedEmail, trimmedPassword);

      if (user.blocked) {
        return setError("Your account has been suspended. Please contact support.");
      }

      const isUserAdmin = user.role === "admin";

      const safeUser = { ...user };
      delete safeUser.password;

      dispatch(loginSuccess(safeUser));
      if (isUserAdmin) {
        dispatch(adminLogin({ email: trimmedEmail, ...safeUser }));
      } else {
        dispatch(adminLogout());
      }

      if (safeUser.id) {
        dispatch(fetchCart(safeUser.id));
        dispatch(fetchWishlist(safeUser.id));
      }

      const dest = location.state?.from;
      let next;

      if (isUserAdmin) {
        // Administrators land in the dashboard unless they requested an admin sub-path.
        if (dest?.pathname?.startsWith("/admin")) {
          next = {
            pathname: dest.pathname,
            search: dest.search || "",
            hash: dest.hash || "",
          };
        } else {
          next = "/admin";
        }
      } else {
        // Regular customers go to their intended customer route, or "/" by default.
        if (
          dest?.pathname?.startsWith("/") &&
          !dest.pathname.startsWith("//") &&
          !dest.pathname.startsWith("/admin")
        ) {
          next = {
            pathname: dest.pathname,
            search: dest.search || "",
            hash: dest.hash || "",
          };
        } else {
          next = "/";
        }
      }

      navigate(next, {
        replace: true,
        state: {
          message: "Welcome back.",
        },
      });
    } catch (err) {
      const message = err.message || "";
      setError(message.includes("Invalid login credentials")
        ? "Invalid email or password."
        : message || "Unable to log in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-login-page">
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
          <span className="editorial-nav-link active">LOG IN</span>
          <Link to="/register" className="editorial-nav-link">
            CREATE ACCOUNT
          </Link>
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

          {/* Right Column: Login Form */}
          <section className="editorial-form-col">
            <h1 className="editorial-login-heading">Log in</h1>

            {error && (
              <p className="editorial-error-alert" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* EMAIL */}
              <div className="editorial-field-group">
                <label htmlFor="login-email" className="editorial-field-label">
                  EMAIL
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!password.trim()) {
                        e.preventDefault();
                        if (error) setError("");
                        passwordInputRef.current?.focus();
                      }
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
                    htmlFor="login-password"
                    className="editorial-field-label"
                  >
                    PASSWORD
                  </label>
                  <Link
                    to="/forgot-password"
                    className="editorial-forgot-link"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="editorial-input-wrapper">
                  <input
                    ref={passwordInputRef}
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
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

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                className="editorial-signin-btn"
                disabled={loading}
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>

              {/* SIGNUP PROMPT */}
              <p className="editorial-signup-row">
                Don't have an account yet?
                <Link to="/register">Create account</Link>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
