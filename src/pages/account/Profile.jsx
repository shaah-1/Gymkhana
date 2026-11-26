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

  if (loading) {
    return (
      <main className="account-profile-page">
        <div className="account-profile-container">
          <div className="account-loading-box">LOADING PROFILE ARCHIVE...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="account-profile-page">
        <div className="account-profile-container">
          <div className="account-empty-state">
            <p className="account-empty-label">{error}</p>
            <button type="button" className="account-empty-btn" onClick={() => window.location.reload()}>
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
    <main className="account-profile-page">
      <div className="account-profile-container">
        {/* Breadcrumbs */}
        <nav className="account-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">HOME</Link>
          <span className="account-breadcrumb-sep">/</span>
          <Link to="/login">LOGIN</Link>
          <span className="account-breadcrumb-sep">/</span>
          <span className="account-breadcrumb-active">PROFILE</span>
        </nav>

        {/* Global Feedback Banners */}
        {profileMessage && (
          <div className="account-alert-banner success" role="status">
            <span>{profileMessage}</span>
            <button type="button" onClick={() => setProfileMessage("")} aria-label="Dismiss">✕</button>
          </div>
        )}
        {profileError && (
          <div className="account-alert-banner error" role="alert">
            <span>{profileError}</span>
            <button type="button" onClick={() => setProfileError("")} aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* Top Profile Dossier Box */}
        <header className="account-dossier-card">
          <div className="account-avatar-col">
            <div className="account-avatar-wrap">
              {user?.photo ? (
                <img src={user.photo} alt={displayName} className="account-avatar-image" />
              ) : (
                <span className="account-avatar-fallback">{initial}</span>
              )}
              <label className="account-avatar-edit-overlay" title="Upload profile photo">
                <Camera size={18} strokeWidth={1.8} />
                <span>PHOTO</span>
                <input
                  type="file"
                  accept="image/*"
                  className="account-avatar-file-input"
                  onChange={handlePhotoUpload}
                  disabled={photoLoading}
                />
              </label>
            </div>
            {user?.photo && (
              <button
                type="button"
                className="account-avatar-remove-btn"
                onClick={handlePhotoRemove}
                disabled={photoLoading}
                title="Remove profile photo"
              >
                REMOVE
              </button>
            )}
          </div>

          <div className="account-dossier-grid">
            <div className="account-field">
              <span className="account-field-label">FIRST NAME</span>
              <span className="account-field-value">{firstName}</span>
            </div>

            <div className="account-field">
              <span className="account-field-label">LAST NAME</span>
              <span className="account-field-value">{lastName}</span>
            </div>

            <div className="account-field">
              <span className="account-field-label">COUNTRY</span>
              <span className="account-field-value">{country}</span>
            </div>

            <div className="account-field">
              <span className="account-field-label">CITY</span>
              <span className="account-field-value">{city}</span>
            </div>

            <div className="account-field">
              <span className="account-field-label">E-MAIL</span>
              <span className="account-field-value">{user?.email || "NOT PROVIDED"}</span>
            </div>

            <div className="account-field">
              <span className="account-field-label">CLIENT ID</span>
              <span className="account-field-value">#{user?.id || userId || "000"}</span>
            </div>
          </div>

          <div className="account-dossier-action">
            <button
              type="button"
              className="account-btn-outline account-dossier-edit-btn"
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
            <button type="button" className="account-logout-link" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </header>

        {/* Horizontal Navigation Tabs */}
        <nav className="account-tabs-bar" aria-label="Profile Sections">
          <button
            type="button"
            className={`account-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setSelectedTab("details")}
          >
            PERSONAL INFO & SETTINGS
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setSelectedTab("orders")}
          >
            MY ORDERS <span className="account-tab-count">({orders.length})</span>
          </button>

          <button
            type="button"
            className={`account-tab-btn ${activeTab === "favourites" ? "active" : ""}`}
            onClick={() => setSelectedTab("favourites")}
          >
            FAVOURITES <span className="account-tab-count">({wishlistItems.length})</span>
          </button>
        </nav>

        {/* Main Tab View */}
        <div className="account-view-layout">
          <aside className="account-view-sidebar">
            <h2 className="account-section-title">
              {activeTab === "details"
                ? "PERSONAL INFO & SETTINGS"
                : activeTab === "orders"
                  ? "MY ORDERS"
                  : "FAVOURITES"}
            </h2>
          </aside>

          <div className="account-view-main">
            {/* 1. PERSONAL INFO & SETTINGS TAB */}
            {activeTab === "details" && (
              <section id="details">
                <div className="account-profile-edit-heading">
                  <div>
                    <span className="account-detail-k">PERSONAL INFORMATION & SETTINGS</span>
                    <p>Manage your personal profile, credentials, and shipping addresses.</p>
                  </div>
                  <button
                    type="button"
                    className="account-btn-outline"
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
                  <form className="account-edit-profile-form" onSubmit={handleProfileSave}>
                    <label>
                      First Name
                      <input
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileFieldChange}
                        autoComplete="given-name"
                        placeholder="First name"
                        required
                      />
                    </label>
                    <label>
                      Last Name
                      <input
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileFieldChange}
                        autoComplete="family-name"
                        placeholder="Last name"
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileFieldChange}
                        autoComplete="email"
                        placeholder="name@example.com"
                        required
                      />
                    </label>
                    <label>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={handleProfileFieldChange}
                        autoComplete="tel"
                        placeholder="10-digit phone number"
                      />
                    </label>
                    <label className="account-form-full-width">
                      Street Address
                      <input
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileFieldChange}
                        autoComplete="street-address"
                        placeholder="Flat, building, street, area"
                      />
                    </label>
                    
                    <label>
                      City
                      <input
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileFieldChange}
                        autoComplete="address-level2"
                        placeholder="City"
                      />
                    </label>
                    <label>
                      State
                      <input
                        name="state"
                        value={profileForm.state}
                        onChange={handleProfileFieldChange}
                        autoComplete="address-level1"
                        placeholder="State"
                      />
                    </label>
                    <label>
                      Pincode / Postal Code
                      <input
                        name="pincode"
                        value={profileForm.pincode}
                        onChange={handleProfileFieldChange}
                        autoComplete="postal-code"
                        placeholder="Postal code"
                      />
                    </label>
                    <label>
                      Country
                      <input
                        name="country"
                        value={profileForm.country}
                        onChange={handleProfileFieldChange}
                        autoComplete="country-name"
                        placeholder="Country"
                      />
                    </label>
                    <div className="account-edit-profile-actions">
                      <button
                        type="button"
                        className="account-btn-outline"
                        onClick={() => {
                          populateProfileForm(user || {});
                          setIsEditingProfile(false);
                          setProfileError("");
                        }}
                      >
                        CANCEL
                      </button>
                      <button className="account-btn-solid" type="submit" disabled={profileSaving}>
                        {profileSaving ? "SAVING…" : "SAVE CHANGES"}
                      </button>
                    </div>
                  </form>
                )}

                <article className="account-details-card">
                  <div className="account-details-grid">
                    <div className="account-detail-item">
                      <span className="account-detail-k">MEMBERSHIP TIER</span>
                      <span className="account-detail-v">GYMKHANA TIER I · ELITE ATHLETE</span>
                    </div>

                    <div className="account-detail-item">
                      <span className="account-detail-k">ACCOUNT STATUS</span>
                      <span className="account-detail-v">ACTIVE · VERIFIED</span>
                    </div>

                    <div className="account-detail-item">
                      <span className="account-detail-k">REGISTERED EMAIL</span>
                      <span className="account-detail-v">{user?.email || "NOT PROVIDED"}</span>
                    </div>

                    <div className="account-detail-item">
                      <span className="account-detail-k">PHONE NUMBER</span>
                      <span className="account-detail-v">{user?.phone || "NOT PROVIDED"}</span>
                    </div>

                    <div className="account-detail-item">
                      <span className="account-detail-k">DELIVERY LOCATION</span>
                      <span className="account-detail-v">
                        {user?.address ? `${user.address}, ` : ""}
                        {city}, {country}
                        {user?.pincode ? ` - ${user.pincode}` : ""}
                      </span>
                    </div>

                    <div className="account-detail-item">
                      <span className="account-detail-k">TOTAL ACQUISITIONS</span>
                      <span className="account-detail-v">{orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}</span>
                    </div>

                    <div className="account-detail-item">
                      <span className="account-detail-k">LIFETIME VALUE</span>
                      <span className="account-detail-v">{formatCurrency(totalSpend)}</span>
                    </div>
                  </div>

                  <button type="button" className="account-btn-outline" onClick={handleLogout}>
                    SIGN OUT OF ACCOUNT
                  </button>
                </article>

                {/* Security & Password Card */}
                <div className="account-profile-edit-heading account-security-heading">
                  <div>
                    <span className="account-detail-k">SECURITY & PASSWORD</span>
                    <p>Update your login credentials and secure your account.</p>
                  </div>
                  <button
                    type="button"
                    className="account-btn-outline"
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
                  <div className="account-alert-banner success" role="status">
                    <span>{passwordMessage}</span>
                    <button type="button" onClick={() => setPasswordMessage("")} aria-label="Dismiss">✕</button>
                  </div>
                )}
                {passwordError && (
                  <div className="account-alert-banner error" role="alert">
                    <span>{passwordError}</span>
                    <button type="button" onClick={() => setPasswordError("")} aria-label="Dismiss">✕</button>
                  </div>
                )}

                {isChangingPassword && (
                  <form className="account-edit-profile-form account-password-form" onSubmit={handlePasswordChange}>
                    <label className="account-form-full-width">
                      Current Password
                      <div className="account-password-input-wrap">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                          autoComplete="current-password"
                          required
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="account-pwd-toggle-btn"
                          onClick={() => setShowCurrentPassword((s) => !s)}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <label>
                      New Password (min 8 chars)
                      <div className="account-password-input-wrap">
                        <input
                          type={showNextPassword ? "text" : "password"}
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                          autoComplete="new-password"
                          required
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="account-pwd-toggle-btn"
                          onClick={() => setShowNextPassword((s) => !s)}
                          aria-label={showNextPassword ? "Hide password" : "Show password"}
                        >
                          {showNextPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <label>
                      Confirm New Password
                      <div className="account-password-input-wrap">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                          autoComplete="new-password"
                          required
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="account-pwd-toggle-btn"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>

                    <div className="account-edit-profile-actions">
                      <button
                        type="button"
                        className="account-btn-outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({ current: "", next: "", confirm: "" });
                          setPasswordError("");
                        }}
                      >
                        CANCEL
                      </button>
                      <button className="account-btn-solid" type="submit" disabled={passwordSaving}>
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
                  <div className="account-loading-box">LOADING ORDER ARCHIVE...</div>
                ) : ordersError ? (
                  <div className="account-empty-state">
                    <p className="account-empty-label">{ordersError}</p>
                    <button type="button" className="account-empty-btn" onClick={() => window.location.reload()}>
                      RETRY
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="account-empty-state">
                    <p className="account-empty-label">NO ORDERS RECORDED</p>
                    <p className="account-empty-desc">
                      Your purchase records and shipment tracking details will appear here once an order is placed.
                    </p>
                    <Link to="/shop" className="account-empty-btn">
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="account-orders-list">
                    {orders.map((order) => {
                      const items = order.items || order.products || [];
                      const status = String(order.status || "SENT").toLowerCase();
                      const statusClass = status.includes("delivered") || status.includes("complete")
                        ? "account-status-delivered"
                        : status.includes("cancel") || status.includes("fail")
                          ? "account-status-cancelled"
                          : "account-status-pending";

                      const trackingNumber =
                        order.trackingNumber ||
                        `000-${String(order.id).slice(-3).padStart(3, "0")}-${String(order.id).slice(0, 3).padStart(3, "0")}-00`.toUpperCase();
                      const orderTotal = Number(order.total || order.totalAmount || 0);

                      const customerCity = order.customer?.city || city;
                      const customerCountry = order.customer?.country || country;

                      return (
                        <div key={order.id} className="account-order-group">
                          {/* Order Header Summary */}
                          <div className="account-order-group-header">
                            <div>
                              <span className="account-order-id-label">ORDER #{order.id}</span>
                              <span className="account-order-date-label">
                                Placed on {formatDate(order.createdAt || order.date)}
                              </span>
                            </div>

                            <div className="account-order-header-right">
                              <span className={`account-spec-v account-spec-status ${statusClass}`}>
                                <span className="account-status-dot" aria-hidden="true" />
                                {String(order.status || "SENT").toUpperCase()}
                              </span>
                              <span className="account-order-total-badge">{formatCurrency(orderTotal)}</span>
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
                              <article className="account-order-card" key={`${order.id}-${item.id || idx}`}>
                                <Link to={`/products/${item.id}`} className="account-order-thumb-wrap">
                                  <img
                                    src={publicAssetUrl(itemImage)}
                                    alt={item.name}
                                    className="account-order-thumb"
                                    loading="lazy"
                                  />
                                </Link>

                                <div className="account-order-details">
                                  <div>
                                    <h3 className="account-order-product-name">
                                      <Link to={`/products/${item.id}`}>{item.name || item.title || "PRODUCT"}</Link>
                                    </h3>

                                    <div className="account-specs-table">
                                      <span className="account-spec-k">SIZE</span>
                                      <span className="account-spec-v">{item.size || "STANDARD"}</span>

                                      <span className="account-spec-k">QUANTITY</span>
                                      <span className="account-spec-v">{String(item.quantity || 1).padStart(2, "0")}</span>

                                      <span className="account-spec-k">AMOUNT</span>
                                      <span className="account-spec-v">{formatCurrency(itemTotal)}</span>

                                      <span className="account-spec-k">DESTINATION</span>
                                      <span className="account-spec-v">{customerCity}, {customerCountry}</span>

                                      <span className="account-spec-k">TRACKING</span>
                                      <span className="account-spec-v">{trackingNumber}</span>
                                    </div>
                                  </div>

                                  <div className="account-order-actions">
                                    <Link to="/#contact" className="account-btn-outline">
                                      ASK A QUESTION
                                    </Link>
                                    <Link to={`/products/${item.id}`} className="account-btn-outline">
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
                  <div className="account-empty-state">
                    <p className="account-empty-label">YOUR FAVOURITES LIST IS EMPTY</p>
                    <p className="account-empty-desc">
                      Add items to your wishlist while browsing our nutrition formulations to view them here.
                    </p>
                    <Link to="/" className="account-empty-btn">
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="account-favourites-grid">
                    {wishlistItems.map((product) => (
                      <article className="account-favourite-card" key={product.id}>
                        <button
                          type="button"
                          className="account-fav-remove-btn"
                          aria-label={`Remove ${product.name} from favourites`}
                          onClick={() => dispatch(toggleWishlist(product))}
                        >
                          ✕
                        </button>

                        <Link to={`/products/${product.productId || product.id}`} className="account-favourite-image-wrap">
                          <img src={publicAssetUrl(product.image)} alt={product.name} className="account-favourite-image" loading="lazy" />
                        </Link>

                        <div className="account-favourite-info">
                          <h3 className="account-favourite-name">
                            <Link to={`/products/${product.productId || product.id}`}>{product.name}</Link>
                          </h3>
                          <p className="account-favourite-price">{formatCurrency(product.price)}</p>
                        </div>

                        <button
                          type="button"
                          className={`account-add-cart-btn ${addedItemMap[product.productId || product.id] ? "added" : ""}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addedItemMap[product.productId || product.id] ? "ADDED ✓" : "ADD CART"}
                        </button>
                      </article>
                    ))}
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
