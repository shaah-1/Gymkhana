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
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const cartCount = useSelector((s) => s.cart.items.reduce((t, i) => t + Number(i.quantity || 0), 0));
  const isCheckout = location.pathname === "/checkout";

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const search = new URLSearchParams(location.search).get("search") || "";

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

  const openSearch = () => {
    setIsSearchExpanded(true);
    requestAnimationFrame(() => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      (isMobile ? mobileSearchInputRef : desktopSearchInputRef).current?.focus();
    });
  };

  const handleSearchHover = () => {
    if (!window.matchMedia("(max-width: 768px)").matches) setIsSearchExpanded(true);
  };

  const handleSearchLeave = () => {
    if (!window.matchMedia("(max-width: 768px)").matches) setIsSearchExpanded(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = search.trim();
    navigate({ pathname: "/", search: query ? `?search=${encodeURIComponent(query)}` : "", hash: "#products" });
    setIsSearchExpanded(false);
    closeMenus();
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    navigate(
      { pathname: "/", search: val ? `?search=${encodeURIComponent(val)}` : "", hash: "#products" },
      { replace: true }
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { state: { message: "Logged out successfully!" }, replace: true });
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

      <form
        className={`navbar-search navbar-search-mobile${isSearchExpanded ? " is-expanded" : ""}`}
        role="search"
        onSubmit={handleSearch}
        onMouseEnter={handleSearchHover}
        onMouseLeave={handleSearchLeave}
      >
        <input
          ref={mobileSearchInputRef}
          type="search"
          aria-label="Search products"
          placeholder="Search products..."
          value={search}
          tabIndex={isSearchExpanded ? 0 : -1}
          aria-hidden={!isSearchExpanded}
          onChange={handleSearchChange}
          onKeyDown={(event) => { if (event.key === "Escape") setIsSearchExpanded(false); }}
        />
        <button
          type="button"
          aria-label={isSearchExpanded ? "Focus search field" : "Open search"}
          onClick={openSearch}
        >
          <Search size={17} strokeWidth={1.8} />
        </button>
      </form>

      <Link to="/" className="brand" aria-label="GYMKHANA Nutrition home">
        <span>GYMKHANA</span>
        <small>NUTRITION</small>
      </Link>

      <div className="navbar-menu">
        <nav className="navbar-links navbar-links-left" aria-label="Main navigation" onClick={closeMenus}>
          <Link to="/">Home</Link>
          <Link to="/#contact">Contact</Link>
        </nav>

        <nav className="navbar-links navbar-links-right" aria-label="Shopping and account">
          <form
            className={`navbar-search navbar-search-desktop${isSearchExpanded ? " is-expanded" : ""}`}
            role="search"
            onSubmit={handleSearch}
            onMouseEnter={handleSearchHover}
            onMouseLeave={handleSearchLeave}
          >
            <input
              ref={desktopSearchInputRef}
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={search}
              tabIndex={isSearchExpanded ? 0 : -1}
              aria-hidden={!isSearchExpanded}
              onChange={handleSearchChange}
              onKeyDown={(event) => { if (event.key === "Escape") setIsSearchExpanded(false); }}
            />
            <button
              type="button"
              aria-label={isSearchExpanded ? "Focus search field" : "Open search"}
              onClick={openSearch}
            >
              <Search size={17} strokeWidth={1.8} />
            </button>
          </form>

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

          <Link to="/wishlist" onClick={closeMenus} className="navbar-wishlist" aria-label="Wishlist" title="Wishlist">
            <Heart size={18} strokeWidth={1.7} className="navbar-wishlist-icon" aria-hidden="true" />
            <span className="navbar-mobile-label">Wishlist</span>
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
                  <Link to="/profile">Profile</Link>
                  <Link to="/profile#orders">My Orders</Link>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" onClick={closeMenus} className="profile-icon" aria-label="Sign in">
              <User size={18} strokeWidth={1.7} aria-hidden="true" />
              <span className="navbar-mobile-label">Sign in</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
