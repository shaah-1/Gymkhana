import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff } from "lucide-react";

import { logout, setUser as setReduxUser } from "../../redux/authSlice";
import { adminLogout } from "../../admin/store/slices/adminAuthSlice";
import { addToCart } from "../../redux/cartSlice";
import { toggleWishlist } from "../../redux/wishlistSlice";
import { fetchProducts } from "../../redux/productSlice";
import {
  getUserById,
  signOutUser,
  updatePassword,
  updateUserById,
} from "../../services/authService";
import { getOrdersByUserId } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

const btnOutlineClass =
  "box-border inline-flex cursor-pointer items-center justify-center border border-[#ebebef] bg-white px-5 py-[10px] font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.16em] text-[#121214] uppercase no-underline transition-all duration-200 hover:border-[#121214] hover:bg-[#121214] hover:text-white disabled:cursor-wait disabled:opacity-50";

const btnSolidClass =
  "box-border inline-flex cursor-pointer items-center justify-center rounded-none border border-[#121214] bg-[#121214] px-5 py-[10px] font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.16em] text-white uppercase no-underline transition-all duration-200 hover:bg-white hover:text-[#121214] disabled:cursor-wait disabled:opacity-50";

const formLabelClass =
  "grid gap-2 font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.14em] text-[#8b8e96] uppercase";

const formInputClass =
  "box-border min-h-[42px] w-full rounded-none border border-[#ebebef] bg-white px-3 py-[10px] font-inherit text-[13.5px] tracking-normal text-[#121214] normal-case outline-0 transition-colors duration-200 focus:border-[#121214]";

const emptyStateClass =
  "box-border border border-[#ebebef] bg-[#fbfbfd] px-6 py-[60px] text-center";

const emptyBtnClass =
  "inline-block border border-[#121214] bg-[#121214] px-6 py-3 font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.18em] text-white uppercase no-underline transition-all duration-200 hover:border-[#2b2b30] hover:bg-[#2b2b30] hover:text-white cursor-pointer";

export default function Profile({ defaultTab }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const reduxUser = useSelector((s) => s.auth.user);
  const userId = useSelector((s) => s.auth.userId);
  const products = useSelector((s) => s.products.items);
  const wishlistItems = useSelector((s) => s.wishlist?.items || []);

  const [user, setUser] = useState(reduxUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [selectedTab, setSelectedTab] = useState(null);
  const [addedItemMap, setAddedItemMap] = useState({});

  // Profile details edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Photo management state
  const [photoLoading, setPhotoLoading] = useState(false);

  // Password & Security change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNextPassword, setShowNextPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const activeTab =
    selectedTab ||
    defaultTab ||
    (location.pathname === "/orders" || location.hash === "#orders"
      ? "orders"
      : location.hash === "#favourites"
        ? "favourites"
        : "details");

  const populateProfileForm = (safe) => {
    const rawName = (safe?.name || safe?.fullName || "").trim();
    const parts = rawName.split(" ");
    setProfileForm({
      firstName: safe.firstName || parts[0] || "",
      lastName: safe.lastName !== undefined ? safe.lastName : parts.slice(1).join(" ") || "",
      email: safe.email || "",
      phone: safe.phone || "",
      address: safe.address || "",
      city: safe.city || "",
      state: safe.state || "",
      pincode: safe.pincode || "",
      country: safe.country || "",
    });
  };

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    if (!userId) return navigate("/login", { replace: true });
    let active = true;

    getUserById(userId)
      .then(async (data) => {
        if (!active) return;
        if (data.blocked) {
          try {
            await signOutUser();
          } catch (signOutError) {
            console.error("Could not sign out a blocked account:", signOutError);
          }
          dispatch(logout());
          navigate("/login", {
            replace: true,
            state: {
              error: "Your account has been suspended by an administrator.",
              message: "Your account has been suspended by an administrator.",
            },
          });
          return;
        }
        const safe = { ...data };
        delete safe.password;
        setUser(safe);
        populateProfileForm(safe);
        dispatch(setReduxUser(safe));
      })
      .catch(() => active && setError("Unable to load profile. Please check connection."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [userId, navigate, dispatch]);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    getOrdersByUserId(userId)
      .then((data) => active && setOrders(data.filter((o) => String(o.userId) === String(userId))))
      .catch(() => active && setOrdersError("Unable to retrieve order archive."))
      .finally(() => active && setOrdersLoading(false));

    return () => { active = false; };
  }, [userId]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      dispatch(logout());
      dispatch(adminLogout());
    } catch (logoutError) {
      setError(logoutError.message || "Unable to sign out. Please try again.");
      return;
    }
    navigate("/", { state: { message: "See you soon." }, replace: true });
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileError("");
    setProfileMessage("");

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Profile photo must be less than 2MB.");
      return;
    }

    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const photoData = String(reader.result || "");
        const updated = await updateUserById(userId, { photo: photoData });
        const safe = { ...updated };
        delete safe.password;
        setUser(safe);
        populateProfileForm(safe);
        dispatch(setReduxUser(safe));
        setProfileMessage("Profile photo updated successfully.");
      } catch {
        setProfileError("Could not update profile photo. Check your connection.");
      } finally {
        setPhotoLoading(false);
      }
    };
    reader.onerror = () => {
      setProfileError("Error reading image file. Please try another image.");
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = async () => {
    setProfileError("");
    setProfileMessage("");
    setPhotoLoading(true);
    try {
      const updated = await updateUserById(userId, { photo: "" });
      const safe = { ...updated };
      delete safe.password;
      setUser(safe);
      populateProfileForm(safe);
      dispatch(setReduxUser(safe));
      setProfileMessage("Profile photo removed.");
    } catch {
      setProfileError("Could not remove profile photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);

    const firstNameVal = profileForm.firstName.trim();
    const lastNameVal = profileForm.lastName.trim();
    const fullName = [firstNameVal, lastNameVal].filter(Boolean).join(" ");
    const email = profileForm.email.trim().toLowerCase();

    if (!firstNameVal || !email) {
      setProfileError("First name and email are required.");
      setProfileSaving(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError("Please enter a valid email address.");
      setProfileSaving(false);
      return;
    }

    try {
      const updated = await updateUserById(userId, {
        name: fullName,
        firstName: firstNameVal,
        lastName: lastNameVal,
        email,
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        pincode: profileForm.pincode.trim(),
        country: profileForm.country.trim(),
      });
      const safe = { ...updated };
      delete safe.password;
      setUser(safe);
      populateProfileForm(safe);
      if (email !== user?.email) {
        setProfileForm((current) => ({ ...current, email }));
      }
      dispatch(setReduxUser(safe));
      setIsEditingProfile(false);
      setProfileMessage(
        email !== user?.email
          ? "Profile saved. Confirm the email change using the link sent to your new address."
          : "Profile details saved successfully.",
      );
    } catch (updateError) {
      setProfileError(updateError.message || "Unable to save profile details.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordForm.current) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await updatePassword(passwordForm.current, passwordForm.next);
      setPasswordMessage("Password updated successfully. Use your new password next time you sign in.");
      setPasswordForm({ current: "", next: "", confirm: "" });
      setIsChangingPassword(false);
    } catch (passwordUpdateError) {
      setPasswordError(passwordUpdateError.message || "Could not update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    const prodId = product.productId || product.id;
    setAddedItemMap((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [prodId]: false }));
    }, 1200);
  };

  const formatDate = (d) => {
    if (!d) return "DATE UNAVAILABLE";
    const date = new Date(d);
    return isNaN(date.getTime())
      ? "DATE UNAVAILABLE"
      : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  };

  const pageShellClass =
    "box-border min-h-[calc(100vh-80px)] bg-white px-[5%] pt-10 pb-[100px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] text-[#121214] max-[640px]:px-4 max-[640px]:pt-6 max-[640px]:pb-[60px]";

  if (loading) {
    return (
      <main className={pageShellClass}>
        <div className="mx-auto max-w-[1200px]">
          <div className="px-5 py-20 text-center font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.16em] text-[#71737d] uppercase">
            LOADING PROFILE ARCHIVE...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={pageShellClass}>
        <div className="mx-auto max-w-[1200px]">
          <div className={emptyStateClass}>
            <p className="mb-2 font-[Arial,sans-serif] text-xs font-bold tracking-[0.16em] text-[#121214] uppercase">
              {error}
            </p>
            <button type="button" className={emptyBtnClass} onClick={() => window.location.reload()}>
              TRY AGAIN
            </button>
          </div>
        </div>
      </main>
    );
  }

  const firstName =
    user?.firstName ||
    (user?.name || user?.fullName || "ATHLETE").trim().split(" ")[0] ||
    "CLIENT";
  const lastName =
    user?.lastName !== undefined && user?.lastName !== null
      ? user.lastName
      : (user?.name || user?.fullName || "").trim().split(" ").slice(1).join(" ") || "MEMBER";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "GYMKHANA ATHLETE";

  const latestOrder = orders[0];
  const city = user?.city || latestOrder?.customer?.city || "MUMBAI";
  const country = user?.country || latestOrder?.customer?.country || "INDIA";
  const initial = (firstName || displayName || "A").trim().charAt(0).toUpperCase();

  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);

  return (
    <main className={pageShellClass}>
      <div className="mx-auto max-w-[1200px]">
        {/* Breadcrumbs */}
        <nav
          className="mb-6 flex items-center gap-2 font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="text-[#8b8e96] no-underline transition-colors duration-150 hover:text-[#121214]">
            HOME
          </Link>
          <span className="text-[#d1d1d6]">/</span>
          <Link to="/login" className="text-[#8b8e96] no-underline transition-colors duration-150 hover:text-[#121214]">
            LOGIN
          </Link>
          <span className="text-[#d1d1d6]">/</span>
          <span className="text-[#121214]">PROFILE</span>
        </nav>

        {/* Global Feedback Banners */}
        {profileMessage && (
          <div
            className="mb-6 flex items-center justify-between border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-[14px] font-[Arial,sans-serif] text-xs font-semibold tracking-[0.04em] text-[#166534]"
            role="status"
          >
            <span>{profileMessage}</span>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent px-1 text-sm text-inherit opacity-70 transition-opacity duration-150 hover:opacity-100"
              onClick={() => setProfileMessage("")}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
        {profileError && (
          <div
            className="mb-6 flex items-center justify-between border border-[#fecaca] bg-[#fef2f2] px-5 py-[14px] font-[Arial,sans-serif] text-xs font-semibold tracking-[0.04em] text-[#991b1b]"
            role="alert"
          >
            <span>{profileError}</span>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent px-1 text-sm text-inherit opacity-70 transition-opacity duration-150 hover:opacity-100"
              onClick={() => setProfileError("")}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Profile Dossier Box */}
        <header className="box-border grid grid-cols-[90px_minmax(0,1fr)_auto] items-center gap-10 border border-[#ebebef] bg-[#fbfbfd] px-9 py-8 max-[992px]:grid-cols-[80px_minmax(0,1fr)] max-[992px]:gap-6 max-[640px]:grid-cols-1 max-[640px]:gap-5 max-[640px]:p-5">
          <div className="flex w-[90px] shrink-0 flex-col items-center gap-2 max-[640px]:w-[72px]">
            <div className="group relative flex aspect-square h-[90px] w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ebebef] bg-white max-[640px]:h-[72px] max-[640px]:w-[72px]">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={displayName}
                  className="block aspect-square h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="font-[Arial,sans-serif] text-[28px] font-bold tracking-[0.05em] text-[#121214]">
                  {initial}
                </span>
              )}
              <label
                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-full bg-[rgba(18,18,20,0.72)] font-[Arial,sans-serif] text-[9px] font-bold tracking-[0.12em] text-white uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100"
                title="Upload profile photo"
              >
                <Camera size={18} strokeWidth={1.8} />
                <span>PHOTO</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoUpload}
                  disabled={photoLoading}
                />
              </label>
            </div>
            {user?.photo && (
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent px-1 py-[2px] font-[Arial,sans-serif] text-[9px] font-bold tracking-[0.14em] text-[#8b8e96] uppercase transition-colors duration-150 hover:text-[#b91c1c] disabled:cursor-wait disabled:opacity-50"
                onClick={handlePhotoRemove}
                disabled={photoLoading}
                title="Remove profile photo"
              >
                REMOVE
              </button>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-x-8 gap-y-[18px] max-[992px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-[14px]">
            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                FIRST NAME
              </span>
              <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase [overflow-wrap:anywhere]">
                {firstName}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                LAST NAME
              </span>
              <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase [overflow-wrap:anywhere]">
                {lastName}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                COUNTRY
              </span>
              <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase [overflow-wrap:anywhere]">
                {country}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                CITY
              </span>
              <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase [overflow-wrap:anywhere]">
                {city}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                E-MAIL
              </span>
              <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase [overflow-wrap:anywhere]">
                {user?.email || "NOT PROVIDED"}
              </span>
            </div>

            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                CLIENT ID
              </span>
              <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase [overflow-wrap:anywhere]">
                #{user?.id || userId || "000"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-[14px] self-center max-[992px]:col-span-full max-[640px]:flex-row max-[640px]:items-start max-[640px]:gap-4">
            <button
              type="button"
              className={`${btnOutlineClass} px-4 py-2 text-[9.5px] whitespace-nowrap`}
              onClick={() => {
                setSelectedTab("details");
                setIsEditingProfile(true);
                setProfileError("");
                setProfileMessage("");
                setTimeout(() => {
                  const el = document.getElementById("details");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
            >
              EDIT PROFILE
            </button>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.14em] text-[#8b8e96] uppercase underline underline-offset-4 transition-colors duration-150 hover:text-[#b91c1c]"
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Horizontal Navigation Tabs */}
        <nav
          className="my-9 mb-11 flex items-center gap-10 overflow-x-auto border-y border-[#ebebef] py-4 [scrollbar-width:none] max-[640px]:mt-6 max-[640px]:mb-8 max-[640px]:gap-6 [&::-webkit-scrollbar]:hidden"
          aria-label="Profile Sections"
        >
          {[
            { id: "details", label: "PERSONAL INFO & SETTINGS" },
            { id: "orders", label: "MY ORDERS", count: orders.length },
            { id: "favourites", label: "FAVOURITES", count: wishlistItems.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`relative cursor-pointer border-0 bg-transparent px-0 py-1 font-[Arial,sans-serif] text-[11px] tracking-[0.16em] whitespace-nowrap uppercase transition-colors duration-150 hover:text-[#121214] ${
                  isActive
                    ? "font-bold text-[#121214] after:absolute after:inset-x-0 after:-bottom-[17px] after:h-[2px] after:bg-[#121214] after:content-['']"
                    : "font-semibold text-[#71737d]"
                }`}
                onClick={() => setSelectedTab(tab.id)}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.05em] text-[#8b8e96]">
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Main Tab View */}
        <div className="grid grid-cols-[190px_minmax(0,1fr)] items-start gap-12 max-[992px]:grid-cols-1 max-[992px]:gap-6">
          <aside className="sticky top-[90px] max-[992px]:static">
            <h2 className="m-0 font-[Arial,sans-serif] text-xs font-bold tracking-[0.16em] text-[#121214] uppercase">
              {activeTab === "details"
                ? "PERSONAL INFO & SETTINGS"
                : activeTab === "orders"
                  ? "MY ORDERS"
                  : "FAVOURITES"}
            </h2>
          </aside>

          <div className="min-w-0">
            {/* 1. PERSONAL INFO & SETTINGS TAB */}
            {activeTab === "details" && (
              <section id="details">
                <div className="mb-4 flex items-center justify-between gap-5 border border-[#ebebef] bg-[#fbfbfd] px-6 py-5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:p-[18px]">
                  <div>
                    <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                      PERSONAL INFORMATION &amp; SETTINGS
                    </span>
                    <p className="mt-[7px] mb-0 text-[13px] text-[#55575e]">
                      Manage your personal profile, credentials, and shipping addresses.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={btnOutlineClass}
                    onClick={() => {
                      setProfileError("");
                      setProfileMessage("");
                      if (isEditingProfile) {
                        populateProfileForm(user || {});
                      }
                      setIsEditingProfile((editing) => !editing);
                    }}
                  >
                    {isEditingProfile ? "CANCEL" : "EDIT PROFILE"}
                  </button>
                </div>

                {isEditingProfile && (
                  <form
                    className="mb-4 grid grid-cols-2 gap-[18px] border border-[#ebebef] bg-[#fbfbfd] p-6 max-[640px]:grid-cols-1 max-[640px]:p-[18px]"
                    onSubmit={handleProfileSave}
                  >
                    <label className={formLabelClass}>
                      First Name
                      <input
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileFieldChange}
                        autoComplete="given-name"
                        placeholder="First name"
                        required
                        className={formInputClass}
                      />
                    </label>
                    <label className={formLabelClass}>
                      Last Name
                      <input
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileFieldChange}
                        autoComplete="family-name"
                        placeholder="Last name"
                        className={formInputClass}
                      />
                    </label>
                    <label className={formLabelClass}>
                      Email address
                      <input
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileFieldChange}
                        autoComplete="email"
                        placeholder="name@example.com"
                        required
                        className={formInputClass}
                      />
                    </label>
                    <label className={formLabelClass}>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={handleProfileFieldChange}
                        autoComplete="tel"
                        placeholder="10-digit phone number"
                        className={formInputClass}
                      />
                    </label>
                    <label className={`${formLabelClass} col-span-full`}>
                      Street Address
                      <input
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileFieldChange}
                        autoComplete="street-address"
                        placeholder="Flat, building, street, area"
                        className={formInputClass}
                      />
                    </label>

                    <label className={formLabelClass}>
                      City
                      <input
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileFieldChange}
                        autoComplete="address-level2"
                        placeholder="City"
                        className={formInputClass}
                      />
                    </label>
                    <label className={formLabelClass}>
                      State
                      <input
                        name="state"
                        value={profileForm.state}
                        onChange={handleProfileFieldChange}
                        autoComplete="address-level1"
                        placeholder="State"
                        className={formInputClass}
                      />
                    </label>
                    <label className={formLabelClass}>
                      Pincode / Postal Code
                      <input
                        name="pincode"
                        value={profileForm.pincode}
                        onChange={handleProfileFieldChange}
                        autoComplete="postal-code"
                        placeholder="Postal code"
                        className={formInputClass}
                      />
                    </label>
                    <label className={formLabelClass}>
                      Country
                      <input
                        name="country"
                        value={profileForm.country}
                        onChange={handleProfileFieldChange}
                        autoComplete="country-name"
                        placeholder="Country"
                        className={formInputClass}
                      />
                    </label>
                    <div className="col-span-full flex justify-end gap-3 max-[640px]:col-span-1 max-[640px]:justify-stretch">
                      <button
                        type="button"
                        className={`${btnOutlineClass} max-[640px]:w-full`}
                        onClick={() => {
                          populateProfileForm(user || {});
                          setIsEditingProfile(false);
                          setProfileError("");
                        }}
                      >
                        CANCEL
                      </button>
                      <button
                        className={`${btnSolidClass} max-[640px]:w-full`}
                        type="submit"
                        disabled={profileSaving}
                      >
                        {profileSaving ? "SAVING…" : "SAVE CHANGES"}
                      </button>
                    </div>
                  </form>
                )}

                <article className="box-border border border-[#ebebef] bg-[#fbfbfd] p-8">
                  <div className="mb-9 grid grid-cols-2 gap-x-9 gap-y-6 max-[640px]:grid-cols-1">
                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        MEMBERSHIP TIER
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        GYMKHANA TIER I · ELITE ATHLETE
                      </span>
                    </div>

                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        ACCOUNT STATUS
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        ACTIVE · VERIFIED
                      </span>
                    </div>

                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        REGISTERED EMAIL
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        {user?.email || "NOT PROVIDED"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        PHONE NUMBER
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        {user?.phone || "NOT PROVIDED"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        DELIVERY LOCATION
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        {user?.address ? `${user.address}, ` : ""}
                        {city}, {country}
                        {user?.pincode ? ` - ${user.pincode}` : ""}
                      </span>
                    </div>

                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        TOTAL ACQUISITIONS
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-[6px] border-b border-[#ebebef] pb-4">
                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                        LIFETIME VALUE
                      </span>
                      <span className="font-[Arial,sans-serif] text-[13.5px] font-semibold tracking-[0.02em] text-[#121214] uppercase">
                        {formatCurrency(totalSpend)}
                      </span>
                    </div>
                  </div>

                  <button type="button" className={btnOutlineClass} onClick={handleLogout}>
                    SIGN OUT OF ACCOUNT
                  </button>
                </article>

                {/* Security & Password Card */}
                <div className="mt-9 mb-4 flex items-center justify-between gap-5 border border-[#ebebef] bg-[#fbfbfd] px-6 py-5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:p-[18px]">
                  <div>
                    <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.18em] text-[#8b8e96] uppercase">
                      SECURITY &amp; PASSWORD
                    </span>
                    <p className="mt-[7px] mb-0 text-[13px] text-[#55575e]">
                      Update your login credentials and secure your account.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={btnOutlineClass}
                    onClick={() => {
                      setPasswordError("");
                      setPasswordMessage("");
                      setPasswordForm({ current: "", next: "", confirm: "" });
                      setIsChangingPassword((c) => !c);
                    }}
                  >
                    {isChangingPassword ? "CANCEL" : "CHANGE PASSWORD"}
                  </button>
                </div>

                {passwordMessage && (
                  <div
                    className="mb-6 flex items-center justify-between border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-[14px] font-[Arial,sans-serif] text-xs font-semibold tracking-[0.04em] text-[#166534]"
                    role="status"
                  >
                    <span>{passwordMessage}</span>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent px-1 text-sm text-inherit opacity-70 transition-opacity duration-150 hover:opacity-100"
                      onClick={() => setPasswordMessage("")}
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {passwordError && (
                  <div
                    className="mb-6 flex items-center justify-between border border-[#fecaca] bg-[#fef2f2] px-5 py-[14px] font-[Arial,sans-serif] text-xs font-semibold tracking-[0.04em] text-[#991b1b]"
                    role="alert"
                  >
                    <span>{passwordError}</span>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent px-1 text-sm text-inherit opacity-70 transition-opacity duration-150 hover:opacity-100"
                      onClick={() => setPasswordError("")}
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {isChangingPassword && (
                  <form
                    className="mt-4 mb-4 grid grid-cols-2 gap-[18px] border border-[#ebebef] bg-[#fbfbfd] p-6 max-[640px]:grid-cols-1 max-[640px]:p-[18px]"
                    onSubmit={handlePasswordChange}
                  >
                    <label className={`${formLabelClass} col-span-full`}>
                      Current Password
                      <div className="relative flex w-full items-center">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                          autoComplete="current-password"
                          required
                          placeholder="Enter current password"
                          className={`${formInputClass} pr-[42px]`}
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#8b8e96] transition-colors duration-150 hover:text-[#121214]"
                          onClick={() => setShowCurrentPassword((s) => !s)}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <label className={formLabelClass}>
                      New Password (min 8 chars)
                      <div className="relative flex w-full items-center">
                        <input
                          type={showNextPassword ? "text" : "password"}
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                          autoComplete="new-password"
                          required
                          placeholder="Enter new password"
                          className={`${formInputClass} pr-[42px]`}
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#8b8e96] transition-colors duration-150 hover:text-[#121214]"
                          onClick={() => setShowNextPassword((s) => !s)}
                          aria-label={showNextPassword ? "Hide password" : "Show password"}
                        >
                          {showNextPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <label className={formLabelClass}>
                      Confirm New Password
                      <div className="relative flex w-full items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                          autoComplete="new-password"
                          required
                          placeholder="Confirm new password"
                          className={`${formInputClass} pr-[42px]`}
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#8b8e96] transition-colors duration-150 hover:text-[#121214]"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <div className="col-span-full flex justify-end gap-3 max-[640px]:col-span-1 max-[640px]:justify-stretch">
                      <button
                        type="button"
                        className={`${btnOutlineClass} max-[640px]:w-full`}
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ current: "", next: "", confirm: "" });
                          setPasswordError("");
                        }}
                      >
                        CANCEL
                      </button>
                      <button
                        className={`${btnSolidClass} max-[640px]:w-full`}
                        type="submit"
                        disabled={passwordSaving}
                      >
                        {passwordSaving ? "UPDATING PASSWORD…" : "UPDATE PASSWORD"}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {/* 2. MY ORDERS TAB (Order history & details) */}
            {activeTab === "orders" && (
              <section id="orders">
                {ordersLoading ? (
                  <div className="px-5 py-20 text-center font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.16em] text-[#71737d] uppercase">
                    LOADING ORDER ARCHIVE...
                  </div>
                ) : ordersError ? (
                  <div className={emptyStateClass}>
                    <p className="mb-2 font-[Arial,sans-serif] text-xs font-bold tracking-[0.16em] text-[#121214] uppercase">
                      {ordersError}
                    </p>
                    <button type="button" className={emptyBtnClass} onClick={() => window.location.reload()}>
                      RETRY
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className={emptyStateClass}>
                    <p className="mb-2 font-[Arial,sans-serif] text-xs font-bold tracking-[0.16em] text-[#121214] uppercase">
                      NO ORDERS RECORDED
                    </p>
                    <p className="mx-auto mb-6 max-w-[400px] text-[13px] leading-[1.6] text-[#55575e]">
                      Your purchase records and shipment tracking details will appear here once an order is placed.
                    </p>
                    <Link to="/shop" className={emptyBtnClass}>
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((order) => {
                      const items = order.items || order.products || [];
                      const status = String(order.status || "SENT").toLowerCase();
                      const isDelivered = status.includes("delivered") || status.includes("complete");
                      const isCancelled = status.includes("cancel") || status.includes("fail");

                      const statusClasses = isDelivered
                        ? "border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]"
                        : isCancelled
                          ? "border border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                          : "border border-[#fef08a] bg-[#fefce8] text-[#854d0e]";

                      const dotClass = isDelivered
                        ? "bg-[#16a34a]"
                        : isCancelled
                          ? "bg-[#dc2626]"
                          : "bg-[#ca8a04]";

                      const trackingNumber =
                        order.trackingNumber ||
                        `000-${String(order.id).slice(-3).padStart(3, "0")}-${String(order.id).slice(0, 3).padStart(3, "0")}-00`.toUpperCase();
                      const orderTotal = Number(order.total || order.totalAmount || 0);

                      const customerCity = order.customer?.city || city;
                      const customerCountry = order.customer?.country || country;

                      return (
                        <div
                          key={order.id}
                          className="mb-7 overflow-hidden border border-[#ebebef] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#121214]"
                        >
                          {/* Order Header Summary */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebebef] bg-[#fbfbfd] px-6 py-4">
                            <div>
                              <span className="mb-1 block font-[Arial,sans-serif] text-[11.5px] font-bold tracking-[0.14em] text-[#121214] uppercase">
                                ORDER #{order.id}
                              </span>
                              <span className="block font-[Arial,sans-serif] text-[11px] tracking-[0.04em] text-[#71737d]">
                                Placed on {formatDate(order.createdAt || order.date)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span
                                className={`inline-flex items-center gap-[6px] rounded-none px-[10px] py-1 font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.02em] uppercase tabular-nums ${statusClasses}`}
                              >
                                <span className={`h-[6px] w-[6px] rounded-full ${dotClass}`} aria-hidden="true" />
                                {String(order.status || "SENT").toUpperCase()}
                              </span>
                              <span className="font-[Arial,sans-serif] text-sm font-bold tracking-[0.04em] text-[#121214] tabular-nums">
                                {formatCurrency(orderTotal)}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Breakdown */}
                          {items.map((item, idx) => {
                            const matchedProduct = products.find(
                              (p) =>
                                String(p.id) === String(item.productId || item.id) ||
                                String(p.name || "").trim().toLowerCase() === String(item.name || item.title || "").trim().toLowerCase()
                            );
                            const itemImage =
                              item.image ||
                              matchedProduct?.image ||
                              "/products/whey-protein.png";
                            const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                            return (
                              <article
                                className="box-border grid grid-cols-[140px_minmax(0,1fr)] items-start gap-8 border-b border-[#ebebef] bg-transparent p-7 last:border-b-0 max-[640px]:grid-cols-1 max-[640px]:gap-5 max-[640px]:p-5"
                                key={`${order.id}-${item.id || idx}`}
                              >
                                <Link
                                  to={`/products/${item.id}`}
                                  className="group box-border flex h-[175px] w-[140px] items-center justify-center border border-[#ebebef] bg-[#f7f7f9] p-3 no-underline transition-[border-color,background] duration-200 hover:border-[#121214] hover:bg-[#f0f0f4] max-[640px]:h-[190px] max-[640px]:w-full"
                                >
                                  <img
                                    src={publicAssetUrl(itemImage)}
                                    alt={item.name}
                                    className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                                    loading="lazy"
                                  />
                                </Link>

                                <div className="flex min-h-[175px] min-w-0 flex-col justify-between">
                                  <div>
                                    <h3 className="m-0 mb-4 font-[Arial,sans-serif] text-[13.5px] leading-[1.4] font-bold tracking-[0.08em] text-[#121214] uppercase">
                                      <Link
                                        to={`/products/${item.id}`}
                                        className="text-[#121214] no-underline transition-colors duration-150 hover:text-[#55575e]"
                                      >
                                        {item.name || item.title || "PRODUCT"}
                                      </Link>
                                    </h3>

                                    <div className="mb-[22px] grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs max-[640px]:grid-cols-[120px_minmax(0,1fr)]">
                                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase">
                                        SIZE
                                      </span>
                                      <span className="font-[Arial,sans-serif] font-semibold tracking-[0.02em] text-[#121214] uppercase tabular-nums">
                                        {item.size || "STANDARD"}
                                      </span>

                                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase">
                                        QUANTITY
                                      </span>
                                      <span className="font-[Arial,sans-serif] font-semibold tracking-[0.02em] text-[#121214] uppercase tabular-nums">
                                        {String(item.quantity || 1).padStart(2, "0")}
                                      </span>

                                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase">
                                        AMOUNT
                                      </span>
                                      <span className="font-[Arial,sans-serif] font-semibold tracking-[0.02em] text-[#121214] uppercase tabular-nums">
                                        {formatCurrency(itemTotal)}
                                      </span>

                                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase">
                                        DESTINATION
                                      </span>
                                      <span className="font-[Arial,sans-serif] font-semibold tracking-[0.02em] text-[#121214] uppercase tabular-nums">
                                        {customerCity}, {customerCountry}
                                      </span>

                                      <span className="font-[Arial,sans-serif] text-[9.5px] font-bold tracking-[0.16em] text-[#8b8e96] uppercase">
                                        TRACKING
                                      </span>
                                      <span className="font-[Arial,sans-serif] font-semibold tracking-[0.02em] text-[#121214] uppercase tabular-nums">
                                        {trackingNumber}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-[14px] pt-[10px]">
                                    <Link to="/#contact" className={btnOutlineClass}>
                                      ASK A QUESTION
                                    </Link>
                                    <Link to={`/products/${item.id}`} className={btnOutlineClass}>
                                      VIEW PRODUCT
                                    </Link>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* 3. FAVOURITES TAB */}
            {activeTab === "favourites" && (
              <section id="favourites">
                {wishlistItems.length === 0 ? (
                  <div className={emptyStateClass}>
                    <p className="mb-2 font-[Arial,sans-serif] text-xs font-bold tracking-[0.16em] text-[#121214] uppercase">
                      YOUR FAVOURITES LIST IS EMPTY
                    </p>
                    <p className="mx-auto mb-6 max-w-[400px] text-[13px] leading-[1.6] text-[#55575e]">
                      Add items to your wishlist while browsing our nutrition formulations to view them here.
                    </p>
                    <Link to="/" className={emptyBtnClass}>
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 max-[992px]:grid-cols-2 max-[640px]:grid-cols-1">
                    {wishlistItems.map((product) => {
                      const prodId = product.productId || product.id;
                      const isAdded = Boolean(addedItemMap[prodId]);
                      return (
                        <article
                          className="relative box-border flex flex-col border border-[#ebebef] bg-white p-[18px] transition-[border-color,box-shadow] duration-200 hover:border-[#121214]"
                          key={product.id}
                        >
                          <button
                            type="button"
                            className="absolute top-[10px] right-[10px] z-[2] flex h-6 w-6 cursor-pointer items-center justify-center border-0 bg-transparent text-[15px] leading-none text-[#8b8e96] transition-colors duration-150 hover:text-[#b91c1c]"
                            aria-label={`Remove ${product.name} from favourites`}
                            onClick={() => dispatch(toggleWishlist(product))}
                          >
                            ✕
                          </button>

                          <Link
                            to={`/products/${prodId}`}
                            className="group mb-4 box-border flex aspect-[3/4] w-full items-center justify-center border border-[#ebebef] bg-[#f7f7f9] p-4 no-underline transition-[border-color] duration-200 hover:border-[#121214]"
                          >
                            <img
                              src={publicAssetUrl(product.image)}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                              loading="lazy"
                            />
                          </Link>

                          <div className="mb-4 flex-1">
                            <h3 className="m-0 mb-[6px] font-[Arial,sans-serif] text-[11.5px] leading-[1.35] font-bold tracking-[0.08em] text-[#121214] uppercase">
                              <Link
                                to={`/products/${prodId}`}
                                className="text-[#121214] no-underline transition-colors duration-150 hover:text-[#55575e]"
                              >
                                {product.name}
                              </Link>
                            </h3>
                            <p className="m-0 font-[Arial,sans-serif] text-[13px] font-bold tracking-[0.02em] text-[#121214] tabular-nums">
                              {formatCurrency(product.price)}
                            </p>
                          </div>

                          <button
                            type="button"
                            className={`box-border w-full cursor-pointer border p-3 font-[Arial,sans-serif] text-[10px] font-bold tracking-[0.16em] text-white uppercase transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                              isAdded
                                ? "border-[#15803d] bg-[#15803d]"
                                : "border-[#121214] bg-[#121214] hover:-translate-y-px hover:border-[#2b2b30] hover:bg-[#2b2b30]"
                            }`}
                            onClick={() => handleAddToCart(product)}
                          >
                            {isAdded ? "ADDED ✓" : "ADD CART"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
