import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Menu, ShoppingBag, User } from "lucide-react";
import { logout } from "../redux/authSlice";
import { adminLogout } from "../admin/store/slices/adminAuthSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const profileRef = useRef(null);

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const isAdmin = useSelector(
    (s) =>
      s.adminAuth?.isAuthenticated ||
      s.auth.user?.role === "admin" ||
      s.auth.user?.isAdmin === true
  );
  const cartCount = useSelector((s) => s.cart.items.reduce((t, i) => t + Number(i.quantity || 0), 0));
  const wishlistCount = useSelector((s) => (s.wishlist?.items || []).length);

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const closeMenus = () => {
    setShowProfile(false);
    setShowMobileMenu(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(adminLogout());
    navigate("/", { state: { message: "Logged out successfully!" }, replace: true });
  };

  return (
    <header
      className={`navbar ${showMobileMenu ? "mobile-open" : ""}`}
      onMouseLeave={() => {
        if (window.matchMedia("(max-width: 768px)").matches) setShowMobileMenu(false);
      }}
    >
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        onClick={() => setShowMobileMenu((o) => !o)}
        onMouseEnter={() => {
          if (window.matchMedia("(max-width: 768px)").matches) setShowMobileMenu(true);
        }}
      >
        <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <Link to="/" className="brand" aria-label="GYMKHANA Nutrition home">
        <span>GYMKHANA</span>
        <small>NUTRITION</small>
      </Link>

      <div className="navbar-menu">
        <nav className="navbar-links navbar-links-left" aria-label="Main navigation">
          <Link
            to="/"
            onClick={() => {
              closeMenus();
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Home
          </Link>
          <Link to="/shop" onClick={closeMenus}>
            Shop
          </Link>
          <Link to="/about" onClick={closeMenus}>
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => {
              closeMenus();
            }}
          >
            Contact
          </Link>
        </nav>

        <nav className="navbar-links navbar-links-right" aria-label="Shopping and account">
          <Link
            to="/cart"
            onClick={closeMenus}
            className="navbar-cart-icon-link"
            aria-label={`Cart${isAuth && cartCount ? `, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : ""}`}
            title="Cart"
          >
            <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" />
            <span className="navbar-mobile-label">Cart</span>
            {isAuth && cartCount > 0 && (
              <span className="navbar-item-count" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/wishlist" onClick={closeMenus} className="navbar-wishlist" aria-label={`Wishlist with ${wishlistCount} items`} title="Wishlist">
            <Heart size={18} strokeWidth={1.7} className="navbar-wishlist-icon" aria-hidden="true" />
            <span className="navbar-mobile-label">Wishlist</span>
            {isAuth && wishlistCount > 0 && (
              <span className="navbar-item-count" aria-hidden="true">
                {wishlistCount}
              </span>
            )}
          </Link>

          {isAuth ? (
            <div className="profile-container" ref={profileRef}>
              <button
                type="button"
                className="profile-icon"
                aria-label="Open profile menu"
                aria-expanded={showProfile}
                aria-controls="profile-dropdown"
                onClick={() => setShowProfile((o) => !o)}
              >
                <User size={18} strokeWidth={1.7} aria-hidden="true" />
                <span className="navbar-mobile-label">Profile</span>
              </button>

              {showProfile && (
                <div className="profile-dropdown" id="profile-dropdown" onClick={closeMenus}>
                  <p className="profile-title">My Account</p>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      style={{
                        fontWeight: 600,
                        color: "var(--accent, #e53e3e)",
                      }}
                    >
                      Admin Dashboard →
                    </Link>
                  )}
                  <Link to="/profile">Profile & Settings</Link>
                  <Link to="/orders">My Orders</Link>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" onClick={closeMenus} className="navbar-signin-link">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
