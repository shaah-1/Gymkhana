import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { logout } from "../redux/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartCount = useSelector((s) => s.cart.items.reduce((t, i) => t + Number(i.quantity || 0), 0));
  const isCheckout = location.pathname === "/checkout";

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const urlSearch = new URLSearchParams(location.search).get("search") || "";
  const [navbarSearch, setNavbarSearch] = useState(urlSearch);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setShowProfile(false);
    setShowMobileMenu(false);
  }

  const [prevSearch, setPrevSearch] = useState(location.search);
  if (prevSearch !== location.search) {
    setPrevSearch(location.search);
    setNavbarSearch(urlSearch);
  }

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = navbarSearch.trim();
    navigate({ pathname: "/", search: query ? `?search=${encodeURIComponent(query)}` : "", hash: "#products" });
    setSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setNavbarSearch(val);
    const query = val.trim();
    navigate({ pathname: "/", search: query ? `?search=${encodeURIComponent(query)}` : "", hash: "#products" }, { replace: true });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { state: { message: "Logged out successfully!" }, replace: true });
  };

  const toggleSearch = (e) => {
    if (searchOpen) e.currentTarget.blur();
    setSearchOpen((o) => !o);
  };

  return (
    <header className={`navbar ${showMobileMenu ? "mobile-open" : ""} ${isCheckout ? "checkout-navbar" : ""}`}>
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        onClick={() => setShowMobileMenu((o) => !o)}
      >
        {showMobileMenu ? "✕" : "☰"}
      </button>

      <Link to="/" className="brand" aria-label="GYMKHANA Nutrition home">
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
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setSearchOpen(false)}
          >
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={navbarSearch}
              onChange={handleSearchChange}
              tabIndex={searchOpen ? 0 : -1}
            />
            <button type="button" aria-label={searchOpen ? "Close search" : "Open search"} aria-expanded={searchOpen} onClick={toggleSearch}>
              <Search size={17} strokeWidth={1.8} />
            </button>
          </form>

          <Link to="/cart" className="navbar-cart-icon-link" aria-label={`Cart, ${cartCount} items`} title="Cart">
            <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" />
            {cartCount > 0 && <span className="navbar-item-count" aria-hidden="true">{cartCount}</span>}
          </Link>

          <Link to="/wishlist" className="navbar-wishlist" aria-label="Wishlist" title="Wishlist">
            <Heart size={18} strokeWidth={1.7} className="navbar-wishlist-icon" aria-hidden="true" />
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
              <User size={18} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
