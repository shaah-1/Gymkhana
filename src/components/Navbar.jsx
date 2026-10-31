
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { logout } from "../redux/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );
  const cartItemCount = useSelector((state) =>
    state.cart.items.reduce((count, item) => count + Number(item.quantity || 0), 0)
  );
  const isCheckout = location.pathname === "/checkout";

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [navbarSearch, setNavbarSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setShowProfile(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    setNavbarSearch(new URLSearchParams(location.search).get("search") || "");
  }, [location.search]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = navbarSearch.trim();
    navigate({
      pathname: "/",
      search: query ? `?search=${encodeURIComponent(query)}` : "",
      hash: "#products",
    });
    setSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleNavbarSearchChange = (event) => {
    const value = event.target.value;
    setNavbarSearch(value);
    const query = value.trim();
    navigate({
      pathname: "/",
      search: query ? `?search=${encodeURIComponent(query)}` : "",
      hash: "#products",
    }, { replace: true });
  };

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
    <header className={`navbar ${showMobileMenu ? "mobile-open" : ""} ${isCheckout ? "checkout-navbar" : ""}`}>
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        onClick={() => setShowMobileMenu((previous) => !previous)}
      >
        {showMobileMenu ? "✕" : "☰"}
      </button>

      <Link
        to="/"
        className="brand"
        aria-label="GYMKHANA Nutrition home"
      >
        <span>GYMKHANA</span>
        <small>NUTRITION</small>
      </Link>

      <div className="navbar-menu">
        <nav className="navbar-links navbar-links-left" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/#contact">Contact</Link>
        </nav>

        <nav className="navbar-links navbar-links-right" aria-label="Shopping and account">
          <form
            className={`navbar-search ${searchOpen ? "is-open" : ""}`}
            role="search"
            onSubmit={handleSearch}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setSearchOpen(false);
              }
            }}
          >
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={navbarSearch}
              onChange={handleNavbarSearchChange}
              tabIndex={searchOpen ? 0 : -1}
            />
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              onClick={(event) => {
                if (searchOpen) event.currentTarget.blur();
                setSearchOpen((open) => !open);
              }}
            >
              <Search size={17} strokeWidth={1.8} />
            </button>
          </form>
          <Link
            to="/cart"
            className="navbar-cart-icon-link"
            aria-label={`Cart, ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
            title="Cart"
          >
            <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" />
            {cartItemCount > 0 && (
              <span className="navbar-item-count" aria-hidden="true">{cartItemCount}</span>
            )}
          </Link>

          <Link to="/wishlist" className="navbar-wishlist" aria-label="Wishlist" title="Wishlist">
            <Heart size={18} strokeWidth={1.7} className="navbar-wishlist-icon" aria-hidden="true" />
          </Link>

          {isAuthenticated ? (
            <div className="profile-container" ref={profileRef}>
              <button
                type="button"
                className="profile-icon"
                aria-label="Open profile menu"
                aria-expanded={showProfile}
                aria-controls="profile-dropdown"
                onClick={() => setShowProfile((previous) => !previous)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
              </button>

              {showProfile && (
                <div className="profile-dropdown" id="profile-dropdown">
                  <p className="profile-title">My Account</p>
                  <Link to="/profile">Profile</Link>
                  <Link to="/profile#orders">My Orders</Link>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="profile-icon" aria-label="Sign in">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
