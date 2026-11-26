import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { logout } from "../redux/authSlice";
import { adminLogout } from "../admin/store/slices/adminAuthSlice";
import { signOutUser } from "../services/authService";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const profileRef = useRef(null);
  const headerRef = useRef(null);

  const authUser = useSelector((s) => s.auth.user);
  const isAuth = useSelector(
    (s) => Boolean(s.auth.isAuthenticated && s.auth.user)
  );
  const cartCount = useSelector((s) => s.cart.items.reduce((t, i) => t + Number(i.quantity || 0), 0));
  const wishlistCount = useSelector((s) => (s.wishlist?.items || []).length);

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  const profileTimerRef = useRef(null);

  const closeMenus = () => {
    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    setShowProfile(false);
    setShowMobileMenu(false);
  };

  const handleProfileEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) return;
    if (profileTimerRef.current) {
      clearTimeout(profileTimerRef.current);
      profileTimerRef.current = null;
    }
    setShowProfile(true);
  };

  const handleProfileLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) return;
    if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
    profileTimerRef.current = setTimeout(() => {
      setShowProfile(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
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
  const isAboutNavbar = location.pathname === "/about" && !isScrolledPastHero;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (headerRef.current && !headerRef.current.contains(e.target)) setShowMobileMenu(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Could not sign out:", error);
      return;
    }
    dispatch(logout());
    dispatch(adminLogout());
    navigate("/", { state: { message: "See you soon." }, replace: true });
  };

  const headerThemeClass = isHeroNavbar
    ? "bg-[#e1e0dc] border-b border-[#d4d3cf]"
    : isAboutNavbar
      ? "bg-[#e6e5e3] border-b-0 shadow-none"
      : "bg-white border-b border-[#ebebef] max-[768px]:border-[#f0f0f2]";

  const mobileNavLinkClass = `text-[#121214] transition-colors duration-150 hover:text-[#71737d] max-[768px]:flex max-[768px]:w-full max-[768px]:min-h-11 max-[768px]:box-border max-[768px]:items-center max-[768px]:border-b max-[768px]:px-[2px] max-[768px]:py-3 max-[768px]:font-['Helvetica_Neue',Helvetica,Arial,sans-serif] max-[768px]:text-[11.5px] max-[768px]:font-normal max-[768px]:tracking-[0.2em] max-[768px]:uppercase max-[768px]:text-[#111113] max-[768px]:no-underline max-[768px]:rounded-none max-[768px]:transition-[opacity,padding-left] max-[768px]:duration-150 max-[768px]:hover:opacity-60 max-[768px]:hover:pl-1 max-[768px]:active:opacity-60 max-[768px]:active:pl-1 max-[768px]:animate-[editorialItemDropDown_0.18s_cubic-bezier(0.16,1,0.3,1)_both] ${
    isHeroNavbar ? "max-[768px]:border-[#d4d3cf]" : "max-[768px]:border-[#f0f0f2]"
  }`;

  const mobileSecondaryLinkBase = `text-[#121214] transition-colors duration-150 hover:text-[#71737d] min-[769px]:relative min-[769px]:inline-flex min-[769px]:flex-[0_0_28px] min-[769px]:w-7 min-[769px]:h-8 min-[769px]:items-center min-[769px]:justify-center max-[768px]:flex max-[768px]:w-full max-[768px]:max-w-full max-[768px]:flex-none max-[768px]:h-auto max-[768px]:min-h-11 max-[768px]:box-border max-[768px]:flex-row max-[768px]:items-center max-[768px]:justify-start max-[768px]:px-[2px] max-[768px]:py-3 max-[768px]:border-0 max-[768px]:border-b max-[768px]:rounded-none max-[768px]:text-[#111113] max-[768px]:font-['Helvetica_Neue',Helvetica,Arial,sans-serif] max-[768px]:text-[11.5px] max-[768px]:font-normal max-[768px]:tracking-[0.2em] max-[768px]:uppercase max-[768px]:no-underline max-[768px]:text-left max-[768px]:relative max-[768px]:transition-[opacity,padding-left] max-[768px]:duration-150 max-[768px]:hover:opacity-60 max-[768px]:hover:pl-1 max-[768px]:active:opacity-60 max-[768px]:active:pl-1 max-[768px]:animate-[editorialItemDropDown_0.18s_cubic-bezier(0.16,1,0.3,1)_both] ${
    isHeroNavbar ? "max-[768px]:border-[#d4d3cf]" : "max-[768px]:border-[#f0f0f2]"
  }`;

  const countBadgeClass =
    "tabular-nums font-['DM_Sans',Inter,-apple-system,sans-serif] font-bold leading-none bg-[#121214] text-white rounded-full min-[769px]:absolute min-[769px]:-top-[3px] min-[769px]:-right-[5px] min-[769px]:grid min-[769px]:min-w-4 min-[769px]:h-4 min-[769px]:px-1 min-[769px]:place-items-center min-[769px]:text-[10px] min-[769px]:shadow-[0_0_0_1.5px_#ffffff] max-[768px]:static max-[768px]:inline-flex max-[768px]:items-center max-[768px]:justify-center max-[768px]:ml-auto max-[768px]:min-w-[18px] max-[768px]:h-[18px] max-[768px]:px-[5px] max-[768px]:text-[9px] max-[768px]:tracking-normal max-[768px]:shrink-0 max-[768px]:shadow-none";

  const dropdownItemClass = `flex items-center w-full min-h-9 px-4 py-2 box-border font-[Arial,'Helvetica_Neue',sans-serif] text-[11px] font-medium tracking-[0.14em] uppercase no-underline text-[#121214] bg-transparent border-0 cursor-pointer text-left transition-[background,color] duration-150 hover:bg-[#f7f7f9] hover:text-[#121214] max-[768px]:min-h-[38px] max-[768px]:px-1 max-[768px]:py-2 max-[768px]:border-b max-[768px]:border-[#f0f0f4] max-[768px]:rounded-none max-[768px]:font-['Helvetica_Neue',Helvetica,Arial,sans-serif] max-[768px]:font-normal max-[768px]:tracking-[0.16em] max-[768px]:text-[#111113] max-[768px]:hover:opacity-65 max-[768px]:hover:bg-transparent`;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 z-[1000] box-border flex h-[var(--navbar-height,72px)] min-h-[var(--navbar-height,72px)] w-full items-center justify-between gap-6 px-[clamp(24px,5vw,88px)] backdrop-blur-none transition-[background-color,border-color] duration-250 ease-in-out max-[768px]:gap-3 max-[768px]:px-5 max-[480px]:px-[14px] max-[360px]:px-[10px] ${headerThemeClass}`}
    >
      <button
        type="button"
        className={`z-[3] ml-auto hidden h-9 min-h-9 w-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none transition-[opacity,transform] duration-200 hover:opacity-65 max-[768px]:inline-flex ${
          isHeroNavbar ? "text-[#0d0d0f]" : "text-[#111113]"
        }`}
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        onClick={() => setShowMobileMenu((o) => !o)}
      >
        {showMobileMenu ? (
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>

      <Link
        to="/"
        className="pointer-events-auto absolute top-1/2 left-1/2 z-[2] m-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center p-0 text-center whitespace-nowrap no-underline"
        aria-label="GYMKHANA Nutrition home"
      >
        <span className="m-0 block p-0 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[15px] font-light tracking-[0.28em] text-[#111113] max-[480px]:text-[13.5px] max-[480px]:tracking-[0.22em] max-[360px]:text-xs max-[360px]:tracking-[0.16em]">
          GYMKHANA
        </span>
        <small className="mt-1 mb-0 block p-0 font-[Arial,sans-serif] text-[7.5px] font-bold tracking-[0.3em] text-[#8b8e96] max-[480px]:text-[7px] max-[480px]:tracking-[0.24em] max-[360px]:hidden">
          NUTRITION
        </small>
      </Link>

      <div
        className={`min-[769px]:contents ${
          showMobileMenu
            ? `max-[768px]:absolute max-[768px]:top-[var(--navbar-height,64px)] max-[768px]:right-0 max-[768px]:left-0 max-[768px]:z-[999] max-[768px]:box-border max-[768px]:flex max-[768px]:max-h-[calc(100dvh-var(--navbar-height,64px))] max-[768px]:w-full max-[768px]:max-w-[100vw] max-[768px]:origin-top max-[768px]:flex-col max-[768px]:overflow-x-hidden max-[768px]:overflow-y-auto max-[768px]:overscroll-contain max-[768px]:border-b max-[768px]:px-5 max-[768px]:pt-4 max-[768px]:pb-7 max-[768px]:shadow-[0_16px_36px_rgba(0,0,0,0.05)] max-[768px]:animate-[editorialDropDown_0.22s_cubic-bezier(0.16,1,0.3,1)_both] max-[480px]:px-4 max-[480px]:pt-[14px] max-[480px]:pb-6 ${
                isHeroNavbar
                  ? "max-[768px]:border-[#d4d3cf] max-[768px]:bg-[#e1e0dc]"
                  : "max-[768px]:border-[#f0f0f2] max-[768px]:bg-white"
              }`
            : "max-[768px]:hidden"
        }`}
      >
        <nav
          className="z-[1] flex min-w-0 items-center justify-start gap-[clamp(18px,2.5vw,44px)] text-xs tracking-[0.08em] uppercase max-[768px]:static max-[768px]:flex max-[768px]:max-h-none max-[768px]:w-full max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-0 max-[768px]:overflow-visible max-[768px]:rounded-none max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none"
          aria-label="Main navigation"
        >
          <Link
            to="/"
            className={`${mobileNavLinkClass} max-[768px]:[animation-delay:0.02s]`}
            onClick={() => {
              closeMenus();
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`${mobileNavLinkClass} max-[768px]:[animation-delay:0.04s]`}
            onClick={closeMenus}
          >
            Shop
          </Link>
          <Link
            to="/about"
            className={`${mobileNavLinkClass} max-[768px]:[animation-delay:0.06s]`}
            onClick={closeMenus}
          >
            About
          </Link>
          <Link
            to="/#contact"
            className={`${mobileNavLinkClass} max-[768px]:[animation-delay:0.08s]`}
            onClick={() => {
              closeMenus();
              if (location.pathname === "/") {
                const el = document.getElementById("contact");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
          >
            Contact
          </Link>
        </nav>

        <nav
          className="z-[1] ml-auto flex min-w-0 items-center justify-end gap-[14px] text-xs tracking-[0.08em] uppercase max-[768px]:static max-[768px]:mt-[2px] max-[768px]:ml-0 max-[768px]:flex max-[768px]:max-h-none max-[768px]:w-full max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-0 max-[768px]:overflow-visible max-[768px]:rounded-none max-[768px]:border-0 max-[768px]:bg-transparent max-[768px]:p-0 max-[768px]:shadow-none"
          aria-label="Shopping and account"
        >
          <Link
            to="/cart"
            onClick={closeMenus}
            className={`${mobileSecondaryLinkBase} max-[768px]:[animation-delay:0.10s]`}
            aria-label={`Cart${isAuth && cartCount ? `, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : ""}`}
            title="Cart"
          >
            <ShoppingBag
              size={18}
              strokeWidth={1.7}
              className="max-[768px]:mr-[10px] max-[768px]:inline-block max-[768px]:h-4 max-[768px]:min-h-4 max-[768px]:w-4 max-[768px]:min-w-4 max-[768px]:shrink-0 max-[768px]:stroke-[#111113] max-[768px]:[stroke-width:1.5]"
              aria-hidden="true"
            />
            <span className="hidden max-[768px]:inline-block max-[768px]:flex-1 max-[768px]:font-inherit max-[768px]:text-[11.5px] max-[768px]:font-normal max-[768px]:tracking-[0.2em] max-[768px]:whitespace-nowrap max-[768px]:text-[#111113] max-[768px]:uppercase">
              Cart
            </span>
            {isAuth && cartCount > 0 && (
              <span className={countBadgeClass} aria-hidden="true">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMenus}
            className={`${mobileSecondaryLinkBase} max-[768px]:[animation-delay:0.12s]`}
            aria-label={`Wishlist with ${wishlistCount} items`}
            title="Wishlist"
          >
            <Heart
              size={18}
              strokeWidth={1.7}
              className="h-[15px] w-[15px] stroke-[#121214] max-[768px]:mr-[10px] max-[768px]:inline-block max-[768px]:h-4 max-[768px]:min-h-4 max-[768px]:w-4 max-[768px]:min-w-4 max-[768px]:shrink-0 max-[768px]:stroke-[#111113] max-[768px]:[stroke-width:1.5]"
              aria-hidden="true"
            />
            <span className="hidden max-[768px]:inline-block max-[768px]:flex-1 max-[768px]:font-inherit max-[768px]:text-[11.5px] max-[768px]:font-normal max-[768px]:tracking-[0.2em] max-[768px]:whitespace-nowrap max-[768px]:text-[#111113] max-[768px]:uppercase">
              Wishlist
            </span>
            {isAuth && wishlistCount > 0 && (
              <span className={countBadgeClass} aria-hidden="true">
                {wishlistCount}
              </span>
            )}
          </Link>

          {isAuth ? (
            <div
              className="relative inline-flex shrink-0 items-center max-[768px]:static max-[768px]:mt-[2px] max-[768px]:box-border max-[768px]:block max-[768px]:w-full max-[768px]:animate-[editorialItemDropDown_0.18s_cubic-bezier(0.16,1,0.3,1)_both] max-[768px]:[animation-delay:0.14s]"
              ref={profileRef}
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <button
                type="button"
                className="flex aspect-square h-9 min-h-9 w-9 min-w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#ebebef] bg-white p-0 text-[#121214] transition-[border-color,background,opacity] duration-150 hover:border-[#121214] hover:bg-[#f7f7f9] hover:text-[#121214] max-[768px]:box-border max-[768px]:flex max-[768px]:aspect-auto max-[768px]:h-auto max-[768px]:min-h-11 max-[768px]:w-full max-[768px]:min-w-0 max-[768px]:max-w-full max-[768px]:flex-row max-[768px]:items-center max-[768px]:justify-start max-[768px]:rounded-none max-[768px]:border-0 max-[768px]:border-b max-[768px]:border-[#ededef] max-[768px]:bg-transparent max-[768px]:px-[2px] max-[768px]:py-3 max-[768px]:font-['Helvetica_Neue',Helvetica,Arial,sans-serif] max-[768px]:text-[11.5px] max-[768px]:font-normal max-[768px]:tracking-[0.2em] max-[768px]:text-[#111113] max-[768px]:uppercase max-[768px]:hover:bg-transparent max-[768px]:hover:opacity-60"
                aria-label="Open profile menu"
                aria-expanded={showProfile}
                aria-controls="profile-dropdown"
                onClick={() => setShowProfile((o) => !o)}
              >
                {authUser?.photo ? (
                  <img
                    src={authUser.photo}
                    alt={authUser.name || "Profile"}
                    className="block aspect-square h-full w-full rounded-full object-cover max-[768px]:mr-[10px] max-[768px]:inline-block max-[768px]:h-5 max-[768px]:min-h-5 max-[768px]:w-5 max-[768px]:min-w-5 max-[768px]:shrink-0 max-[768px]:border max-[768px]:border-[#ebebef]"
                  />
                ) : (
                  <User
                    size={18}
                    strokeWidth={1.7}
                    className="max-[768px]:mr-[10px] max-[768px]:inline-block max-[768px]:h-4 max-[768px]:min-h-4 max-[768px]:w-4 max-[768px]:min-w-4 max-[768px]:shrink-0 max-[768px]:stroke-[#111113] max-[768px]:[stroke-width:1.5]"
                    aria-hidden="true"
                  />
                )}
                <span className="hidden max-[768px]:inline-block max-[768px]:flex-1 max-[768px]:text-left max-[768px]:font-inherit max-[768px]:text-[11.5px] max-[768px]:font-normal max-[768px]:tracking-[0.2em] max-[768px]:whitespace-nowrap max-[768px]:text-[#111113] max-[768px]:uppercase">
                  Profile
                </span>
              </button>

              {showProfile && (
                <div
                  className={`absolute top-[calc(100%+10px)] right-0 z-[1200] box-border flex w-[200px] min-w-[190px] origin-top-right flex-col rounded-none border border-[#ebebef] bg-white py-[6px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] animate-[profileDropDown_0.18s_cubic-bezier(0.16,1,0.3,1)_both] before:absolute before:-top-3 before:right-0 before:left-0 before:h-3 before:content-[''] max-[768px]:static max-[768px]:my-2 max-[768px]:mb-3 max-[768px]:box-border max-[768px]:w-full max-[768px]:min-w-0 max-[768px]:animate-none max-[768px]:rounded-none max-[768px]:border max-[768px]:border-[#f0f0f2] max-[768px]:bg-[#fafafc] max-[768px]:px-3 max-[768px]:py-[6px] max-[768px]:shadow-none max-[768px]:before:hidden max-[480px]:right-0 max-[480px]:max-w-[calc(100vw-20px)] ${
                    isHeroNavbar ? "max-[768px]:border-[#d4d3cf]" : ""
                  }`}
                  id="profile-dropdown"
                  onClick={closeMenus}
                  onMouseEnter={handleProfileEnter}
                  onMouseLeave={handleProfileLeave}
                >
                  <p className="pointer-events-none m-0 mb-1 border-b border-[#f0f0f3] px-4 pt-2 pb-[6px] font-[Arial,'Helvetica_Neue',sans-serif] text-[10px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase max-[768px]:mx-0 max-[768px]:my-[6px] max-[768px]:ml-1 max-[768px]:border-[#ededef] max-[768px]:px-0 max-[768px]:pt-0 max-[768px]:pb-1 max-[768px]:font-['Helvetica_Neue',Helvetica,Arial,sans-serif] max-[768px]:text-[9.5px] max-[768px]:font-medium max-[768px]:tracking-[0.2em]">
                    My Account
                  </p>
                  <Link to="/profile" className={dropdownItemClass}>
                    Profile &amp; Settings
                  </Link>
                  <Link to="/orders" className={dropdownItemClass}>
                    My Orders
                  </Link>
                  {authUser?.role === "admin" && (
                    <Link to="/admin" className={dropdownItemClass}>
                      Store Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${dropdownItemClass} mt-1 border-t border-[#f0f0f3] pt-[10px] text-[#b91c1c] hover:bg-[#fef2f2] hover:text-[#dc2626] max-[768px]:mt-0 max-[768px]:border-t-0 max-[768px]:border-b-0 max-[768px]:pt-2 max-[768px]:text-[#b91c1c] max-[768px]:hover:bg-transparent`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenus}
                className="inline-flex items-center justify-center rounded-none border-0 bg-transparent p-0 font-inherit text-xs font-medium tracking-[0.08em] text-[#121214] uppercase no-underline shadow-none transition-colors duration-150 hover:bg-transparent hover:text-[#71737d] max-[768px]:mt-5 max-[768px]:box-border max-[768px]:flex max-[768px]:min-h-11 max-[768px]:w-full max-[768px]:max-w-full max-[768px]:bg-[#121214] max-[768px]:px-4 max-[768px]:py-3 max-[768px]:text-center max-[768px]:font-['Helvetica_Neue',Helvetica,Arial,sans-serif] max-[768px]:text-[11.5px] max-[768px]:font-light max-[768px]:tracking-[0.22em] max-[768px]:text-white max-[768px]:animate-[editorialItemDropDown_0.18s_cubic-bezier(0.16,1,0.3,1)_both] max-[768px]:[animation-delay:0.14s] max-[768px]:hover:bg-[#2a2a30] max-[768px]:hover:text-white max-[768px]:active:bg-[#2a2a30]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={closeMenus}
                className="hidden text-center font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[11px] font-light tracking-[0.12em] text-[#8b8e96] uppercase underline underline-offset-4 transition-colors duration-150 hover:text-[#111113] max-[768px]:mt-[14px] max-[768px]:box-border max-[768px]:block max-[768px]:w-full max-[768px]:max-w-full max-[768px]:animate-[editorialItemDropDown_0.18s_cubic-bezier(0.16,1,0.3,1)_both] max-[768px]:[animation-delay:0.16s]"
              >
                New customer? Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
