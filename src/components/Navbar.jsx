import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { logout } from "../redux/authSlice";
import { adminLogout } from "../admin/store/slices/adminAuthSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const profileRef = useRef(null);
  const headerRef = useRef(null);

  const isAuth = useSelector(
    (s) =>
      Boolean(
        s.auth.isAuthenticated &&
          s.auth.user &&
          s.auth.user.role !== "admin" &&
          !s.auth.user.isAdmin
      )
  );
  const cartCount = useSelector((s) => s.cart.items.reduce((t, i) => t + Number(i.quantity || 0), 0));
  const wishlistCount = useSelector((s) => (s.wishlist?.items || []).length);

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  const mobileMenuTimerRef = useRef(null);
  const profileTimerRef = useRef(null);

  const closeMenus = () => {
    if (mobileMenuTimerRef.current) clearTimeout(mobileMenuTimerRef.current);
    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    setShowProfile(false);
    setShowMobileMenu(false);
  };

  const handleMenuEnter = () => {
    if (mobileMenuTimerRef.current) {
      clearTimeout(mobileMenuTimerRef.current);
      mobileMenuTimerRef.current = null;
    }
    setShowMobileMenu(true);
  };

  const handleMenuLeave = () => {
    if (mobileMenuTimerRef.current) clearTimeout(mobileMenuTimerRef.current);
    mobileMenuTimerRef.current = setTimeout(() => {
      setShowMobileMenu(false);
    }, 220);
  };

  const handleProfileEnter = () => {
    if (profileTimerRef.current) {
      clearTimeout(profileTimerRef.current);
      profileTimerRef.current = null;
    }
    setShowProfile(true);
  };

  const handleProfileLeave = () => {
    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    profileTimerRef.current = setTimeout(() => {
      setShowProfile(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (mobileMenuTimerRef.current) clearTimeout(mobileMenuTimerRef.current);
      if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const checkScroll = () => {
      const heroEl = document.getElementById("home");
      const navH = window.innerWidth <= 768 ? 64 : 72;
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setIsScrolledPastHero(rect.bottom <= navH);
      } else {
        setIsScrolledPastHero(window.scrollY >= window.innerHeight - 80);
      }
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [location.pathname]);

  const isHeroNavbar = location.pathname === "/" && !isScrolledPastHero;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (headerRef.current && !headerRef.current.contains(e.target)) setShowMobileMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(adminLogout());
    navigate("/", { state: { message: "See you soon." }, replace: true });
  };

  return (
    <header
      ref={headerRef}
      className={`navbar ${showMobileMenu ? "mobile-open" : ""} ${isHeroNavbar ? "navbar-hero" : ""}`}
      onMouseLeave={handleMenuLeave}
    >
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        onClick={() => setShowMobileMenu((o) => !o)}
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleMenuLeave}
      >
        {showMobileMenu ? (
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>

      <Link to="/" className="brand" aria-label="GYMKHANA Nutrition home">
        <span>GYMKHANA</span>
        <small>NUTRITION</small>
      </Link>

      <div
        className="navbar-menu"
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleMenuLeave}
      >
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
            <div
              className="profile-container"
              ref={profileRef}
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
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
                <div
                  className="profile-dropdown"
                  id="profile-dropdown"
                  onClick={closeMenus}
                  onMouseEnter={handleProfileEnter}
                  onMouseLeave={handleProfileLeave}
                >
                  <p className="profile-title">My Account</p>
                  <Link to="/profile">Profile & Settings</Link>
                  <Link to="/orders">My Orders</Link>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" onClick={closeMenus} className="navbar-signin-link">
                Sign in
              </Link>
              <Link to="/register" onClick={closeMenus} className="navbar-mobile-register-link">
                New customer? Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
