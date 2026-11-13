import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "../../services/authService";
import { loginSuccess, logout } from "../../redux/authSlice";
import { adminLogin, adminLogout } from "../../admin/store/slices/adminAuthSlice";
import { verifyAdminCredentials } from "../../admin/utils/adminCredentials";
import { fetchCart } from "../../redux/cartSlice";
import { fetchWishlist } from "../../redux/wishlistSlice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuth = useSelector((s) => s.auth.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(location.state?.registeredEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);

  // If customer is already authenticated, redirect to home
  useEffect(() => {
    if (isAuth) {
      navigate("/", { replace: true });
    }
  }, [isAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return setError("Please enter your email and password.");
    }

    setLoading(true);

    try {
      let user = null;
      let fetchError = null;

      try {
        user = await loginUser(trimmedEmail, trimmedPassword);
      } catch (err) {
        fetchError = err;
      }

      // Check admin credentials (either via saved admin hash / default credentials)
      const isCredentialAdmin = await verifyAdminCredentials(
        trimmedEmail,
        trimmedPassword
      );

      // Synthesize user object if matched via admin credentials
      if (!user && isCredentialAdmin) {
        user = {
          id: "admin-1",
          name: "Admin",
          email: trimmedEmail,
          role: "admin",
          isAdmin: true,
        };
      }

      if (!user) {
        if (fetchError && !fetchError.response) {
          return setError(
            "Cannot connect to the server. Please ensure JSON server is running on port 3000."
          );
        }
        return setError("Invalid email or password.");
      }

      if (user.blocked) {
        return setError(
          "Your account has been suspended. Please contact support."
        );
      }

      const isUserAdmin =
        user.role === "admin" || user.isAdmin === true || isCredentialAdmin;

      const safeUser = { ...user };
      delete safeUser.password;

      // Admin and customer sessions are strictly separated:
      // If user has admin rights, log into admin session only and clear customer session.
      // If regular customer, log into customer session and clear admin session.
      if (isUserAdmin) {
        dispatch(adminLogin({ email: trimmedEmail, ...safeUser }));
        dispatch(logout());
      } else {
        dispatch(loginSuccess(safeUser));
        dispatch(adminLogout());

        if (safeUser.id) {
          dispatch(fetchCart(safeUser.id));
          dispatch(fetchWishlist(safeUser.id));
        }
      }

      const dest = location.state?.from;
      let next;

      if (dest?.pathname?.startsWith("/") && !dest.pathname.startsWith("//")) {
        // If regular user was trying to access /admin, redirect to home
        if (!isUserAdmin && dest.pathname.startsWith("/admin")) {
          next = "/";
        } else {
          next = {
            pathname: dest.pathname,
            search: dest.search || "",
            hash: dest.hash || "",
          };
        }
      } else {
        // Admin default landing is /admin; customer default landing is /
        next = isUserAdmin ? "/admin" : "/";
      }

      navigate(next, {
        replace: true,
        state: {
          message: "Welcome back.",
        },
      });
    } catch (err) {
      setError(
        err.response
          ? "Unable to log in. Please check your credentials and try again."
          : "Login failed. Check server connection."
      );
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
