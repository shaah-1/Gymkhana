
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const profileRef = useRef(null);

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setShowProfile(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

const handleLogout = () => {
  dispatch(logout());

  navigate("/", {
    state: { message: "Logged out successfully!" },
    replace: true,
  });
};

  return (
    <header className="navbar">
      <Link
        to="/"
        className="brand"
        aria-label="GYMKHANA Nutrition home"
      >
        <span>GYMKHANA</span>
        <small>NUTRITION</small>
      </Link>

      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        onClick={() => setShowMobileMenu((previous) => !previous)}
      >
        {showMobileMenu ? "✕" : "☰"}
      </button>

      <nav
        className={`navbar-links ${showMobileMenu ? "mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>

        
        <Link to="/wishlist" className="navbar-wishlist">
          ♡ Wishlist
        </Link>

        {isAuthenticated ? (
          <div className="profile-container" ref={profileRef}>
            <button
              type="button"
              className="profile-icon"
              aria-label="Open profile menu"
              aria-expanded={showProfile}
              aria-controls="profile-dropdown"
              onClick={() =>
                setShowProfile((previous) => !previous)
              }
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
            </button>

            {showProfile && (
              <div
                className="profile-dropdown"
                id="profile-dropdown"
              >
                <p className="profile-title">My Account</p>
                <Link to="/profile">Profile</Link>
                <Link to="/profile#orders">My Orders</Link>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="navbar-register">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
