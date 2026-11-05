import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { logout, setUser as setReduxUser } from "../../redux/authSlice";
import { addToCart } from "../../redux/cartSlice";
import { toggleWishlist } from "../../redux/wishlistSlice";
import { fetchProducts } from "../../redux/productSlice";
import { getUserByEmail, getUserById, updateUserById } from "../../services/authService";
import { getOrdersByUserId } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import "./Profile.css";

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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", city: "", country: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const activeTab =
    selectedTab ||
    defaultTab ||
    (location.pathname === "/orders" || location.hash === "#orders"
      ? "orders"
      : location.hash === "#favourites"
        ? "favourites"
        : "details");

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    if (!userId) return navigate("/login", { replace: true });
    let active = true;

    getUserById(userId)
      .then((data) => {
        if (!active) return;
        const safe = { ...data };
        delete safe.password;
        setUser(safe);
        setProfileForm({
          name: safe.name || safe.fullName || "",
          email: safe.email || "",
          phone: safe.phone || "",
          city: safe.city || "",
          country: safe.country || "",
        });
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

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { state: { message: "Logged out successfully!" }, replace: true });
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);

    const name = profileForm.name.trim();
    const email = profileForm.email.trim().toLowerCase();
    if (!name || !email) {
      setProfileError("Name and email are required.");
      setProfileSaving(false);
      return;
    }

    try {
      const matches = await getUserByEmail(email);
      if (matches.some((match) => String(match.id) !== String(userId))) {
        setProfileError("That email address is already used by another account.");
        return;
      }

      const updated = await updateUserById(userId, {
        name,
        email,
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        country: profileForm.country.trim(),
      });
      const safe = { ...updated };
      delete safe.password;
      setUser(safe);
      setProfileForm({
        name: safe.name || safe.fullName || "",
        email: safe.email || "",
        phone: safe.phone || "",
        city: safe.city || "",
        country: safe.country || "",
      });
      dispatch(setReduxUser(safe));
      setIsEditingProfile(false);
      setProfileMessage("Profile details saved.");
    } catch {
      setProfileError("Unable to save profile details. Check your connection and try again.");
    } finally {
      setProfileSaving(false);
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
      <main className="dunst-profile-page">
        <div className="dunst-profile-container">
          <div className="dunst-loading-box">LOADING PROFILE ARCHIVE...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dunst-profile-page">
        <div className="dunst-profile-container">
          <div className="dunst-empty-state">
            <p className="dunst-empty-label">{error}</p>
            <button type="button" className="dunst-empty-btn" onClick={() => window.location.reload()}>
              TRY AGAIN
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayName = user?.name || user?.fullName || "GYMKHANA ATHLETE";
  const nameParts = displayName.trim().split(" ");
  const firstName = nameParts[0] || "CLIENT";
  const lastName = nameParts.slice(1).join(" ") || "MEMBER";

  const latestOrder = orders[0];
  const city = user?.city || latestOrder?.customer?.city || "MUMBAI";
  const country = user?.country || latestOrder?.customer?.country || "INDIA";
  const initial = firstName.charAt(0).toUpperCase();

  const totalSpend = orders.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0);

  return (
    <main className="dunst-profile-page">
      <div className="dunst-profile-container">
        {/* Breadcrumbs */}
        <nav className="dunst-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">HOME</Link>
          <span className="dunst-breadcrumb-sep">/</span>
          <Link to="/login">LOGIN</Link>
          <span className="dunst-breadcrumb-sep">/</span>
          <span className="dunst-breadcrumb-active">PROFILE</span>
        </nav>

        {/* Top Profile Dossier Box */}
        <header className="dunst-dossier-card">
          <div className="dunst-avatar-wrap" aria-hidden="true">
            <span className="dunst-avatar-fallback">{initial}</span>
          </div>

          <div className="dunst-dossier-grid">
            <div className="dunst-field">
              <span className="dunst-field-label">FIRST NAME</span>
              <span className="dunst-field-value">{firstName}</span>
            </div>

            <div className="dunst-field">
              <span className="dunst-field-label">LAST NAME</span>
              <span className="dunst-field-value">{lastName}</span>
            </div>

            <div className="dunst-field">
              <span className="dunst-field-label">COUNTRY</span>
              <span className="dunst-field-value">{country}</span>
            </div>

            <div className="dunst-field">
              <span className="dunst-field-label">CITY</span>
              <span className="dunst-field-value">{city}</span>
            </div>

            <div className="dunst-field">
              <span className="dunst-field-label">E-MAIL</span>
              <span className="dunst-field-value">{user?.email || "NOT PROVIDED"}</span>
            </div>

            <div className="dunst-field">
              <span className="dunst-field-label">CLIENT ID</span>
              <span className="dunst-field-value">#{user?.id || userId || "000"}</span>
            </div>
          </div>

          <div className="dunst-dossier-action">
            <button type="button" className="dunst-logout-link" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        </header>

        {/* Horizontal Navigation Tabs */}
        <nav className="dunst-tabs-bar" aria-label="Profile Sections">
          <button
            type="button"
            className={`dunst-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setSelectedTab("details")}
          >
            PERSONAL INFO & SETTINGS
          </button>

          <button
            type="button"
            className={`dunst-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setSelectedTab("orders")}
          >
            MY ORDERS <span className="dunst-tab-count">({orders.length})</span>
          </button>

          <button
            type="button"
            className={`dunst-tab-btn ${activeTab === "favourites" ? "active" : ""}`}
            onClick={() => setSelectedTab("favourites")}
          >
            FAVOURITES <span className="dunst-tab-count">({wishlistItems.length})</span>
          </button>
        </nav>

        {/* Main Tab View */}
        <div className="dunst-view-layout">
          <aside className="dunst-view-sidebar">
            <h2 className="dunst-section-title">
              {activeTab === "details"
                ? "PERSONAL INFO & SETTINGS"
                : activeTab === "orders"
                  ? "MY ORDERS"
                  : "FAVOURITES"}
            </h2>
          </aside>

          <div className="dunst-view-main">
            {/* 1. PERSONAL INFO & SETTINGS TAB */}
            {activeTab === "details" && (
              <section id="details">
                <div className="dunst-profile-edit-heading">
                  <div>
                    <span className="dunst-detail-k">PERSONAL INFORMATION & SETTINGS</span>
                    <p>Manage your personal profile, credentials, and shipping addresses.</p>
                  </div>
                  <button
                    type="button"
                    className="dunst-btn-outline"
                    onClick={() => {
                      setProfileError("");
                      setProfileMessage("");
                      if (isEditingProfile) {
                        setProfileForm({
                          name: user?.name || user?.fullName || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          city: user?.city || "",
                          country: user?.country || "",
                        });
                      }
                      setIsEditingProfile((editing) => !editing);
                    }}
                  >
                    {isEditingProfile ? "CANCEL" : "EDIT PROFILE"}
                  </button>
                </div>

                {profileMessage && <p className="dunst-profile-feedback success" role="status">{profileMessage}</p>}
                {profileError && <p className="dunst-profile-feedback error" role="alert">{profileError}</p>}

                {isEditingProfile && (
                  <form className="dunst-edit-profile-form" onSubmit={handleProfileSave}>
                    <label>Full name<input name="name" value={profileForm.name} onChange={handleProfileFieldChange} autoComplete="name" required /></label>
                    <label>Email address<input name="email" type="email" value={profileForm.email} onChange={handleProfileFieldChange} autoComplete="email" required /></label>
                    <label>Phone number<input name="phone" type="tel" value={profileForm.phone} onChange={handleProfileFieldChange} autoComplete="tel" /></label>
                    <label>City<input name="city" value={profileForm.city} onChange={handleProfileFieldChange} autoComplete="address-level2" /></label>
                    <label>Country<input name="country" value={profileForm.country} onChange={handleProfileFieldChange} autoComplete="country-name" /></label>
                    <div className="dunst-edit-profile-actions">
                      <button className="dunst-btn-outline" type="submit" disabled={profileSaving}>
                        {profileSaving ? "SAVING…" : "SAVE CHANGES"}
                      </button>
                    </div>
                  </form>
                )}

                <article className="dunst-details-card">
                  <div className="dunst-details-grid">
                    <div className="dunst-detail-item">
                      <span className="dunst-detail-k">MEMBERSHIP TIER</span>
                      <span className="dunst-detail-v">GYMKHANA TIER I · ELITE ATHLETE</span>
                    </div>

                    <div className="dunst-detail-item">
                      <span className="dunst-detail-k">ACCOUNT STATUS</span>
                      <span className="dunst-detail-v">ACTIVE · VERIFIED</span>
                    </div>

                    <div className="dunst-detail-item">
                      <span className="dunst-detail-k">REGISTERED EMAIL</span>
                      <span className="dunst-detail-v">{user?.email || "NOT PROVIDED"}</span>
                    </div>

                    <div className="dunst-detail-item">
                      <span className="dunst-detail-k">DELIVERY LOCATION</span>
                      <span className="dunst-detail-v">{city}, {country}</span>
                    </div>

                    <div className="dunst-detail-item">
                      <span className="dunst-detail-k">TOTAL ACQUISITIONS</span>
                      <span className="dunst-detail-v">{orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}</span>
                    </div>

                    <div className="dunst-detail-item">
                      <span className="dunst-detail-k">LIFETIME VALUE</span>
                      <span className="dunst-detail-v">{formatCurrency(totalSpend)}</span>
                    </div>
                  </div>

                  <button type="button" className="dunst-btn-outline" onClick={handleLogout}>
                    SIGN OUT OF ACCOUNT
                  </button>
                </article>
              </section>
            )}

            {/* 2. MY ORDERS TAB (Order history & details) */}
            {activeTab === "orders" && (
              <section id="orders">
                {ordersLoading ? (
                  <div className="dunst-loading-box">LOADING ORDER ARCHIVE...</div>
                ) : ordersError ? (
                  <div className="dunst-empty-state">
                    <p className="dunst-empty-label">{ordersError}</p>
                    <button type="button" className="dunst-empty-btn" onClick={() => window.location.reload()}>
                      RETRY
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="dunst-empty-state">
                    <p className="dunst-empty-label">NO ORDERS RECORDED</p>
                    <p className="dunst-empty-desc">
                      Your purchase records and shipment tracking details will appear here once an order is placed.
                    </p>
                    <Link to="/shop" className="dunst-empty-btn">
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="dunst-orders-list">
                    {orders.map((order) => {
                      const items = order.items || order.products || [];
                      const status = String(order.status || "SENT").toLowerCase();
                      const statusClass = status.includes("delivered") || status.includes("complete")
                        ? "dunst-status-delivered"
                        : status.includes("cancel") || status.includes("fail")
                          ? "dunst-status-cancelled"
                          : "dunst-status-pending";

                      const trackingNumber =
                        order.trackingNumber ||
                        `000-${String(order.id).slice(-3).padStart(3, "0")}-${String(order.id).slice(0, 3).padStart(3, "0")}-00`.toUpperCase();
                      const orderTotal = Number(order.total || order.totalAmount || 0);

                      const customerCity = order.customer?.city || city;
                      const customerCountry = order.customer?.country || country;

                      return (
                        <div key={order.id} className="dunst-order-group">
                          {/* Order Header Summary */}
                          <div className="dunst-order-group-header">
                            <div>
                              <span className="dunst-order-id-label">ORDER #{order.id}</span>
                              <span className="dunst-order-date-label">
                                Placed on {formatDate(order.createdAt || order.date)}
                              </span>
                            </div>

                            <div className="dunst-order-header-right">
                              <span className={`dunst-spec-v dunst-spec-status ${statusClass}`}>
                                <span className="dunst-status-dot" aria-hidden="true" />
                                {String(order.status || "SENT").toUpperCase()}
                              </span>
                              <span className="dunst-order-total-badge">{formatCurrency(orderTotal)}</span>
                            </div>
                          </div>

                          {/* Order Items Breakdown */}
                          {items.map((item, idx) => {
                            const matchedProduct = products.find((p) => String(p.id) === String(item.id));
                            const itemImage = matchedProduct?.image || item.image || "/products/whey-protein.png";
                            const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                            return (
                              <article className="dunst-order-card" key={`${order.id}-${item.id || idx}`}>
                                <Link to={`/products/${item.id}`} className="dunst-order-thumb-wrap">
                                  <img
                                    src={publicAssetUrl(itemImage)}
                                    alt={item.name}
                                    className="dunst-order-thumb"
                                    loading="lazy"
                                  />
                                </Link>

                                <div className="dunst-order-details">
                                  <div>
                                    <h3 className="dunst-order-product-name">
                                      <Link to={`/products/${item.id}`}>{item.name || item.title || "PRODUCT"}</Link>
                                    </h3>

                                    <div className="dunst-specs-table">
                                      <span className="dunst-spec-k">SIZE</span>
                                      <span className="dunst-spec-v">{item.size || "STANDARD"}</span>

                                      <span className="dunst-spec-k">QUANTITY</span>
                                      <span className="dunst-spec-v">{String(item.quantity || 1).padStart(2, "0")}</span>

                                      <span className="dunst-spec-k">AMOUNT</span>
                                      <span className="dunst-spec-v">{formatCurrency(itemTotal)}</span>

                                      <span className="dunst-spec-k">DESTINATION</span>
                                      <span className="dunst-spec-v">{customerCity}, {customerCountry}</span>

                                      <span className="dunst-spec-k">TRACKING</span>
                                      <span className="dunst-spec-v">{trackingNumber}</span>
                                    </div>
                                  </div>

                                  <div className="dunst-order-actions">
                                    <Link to="/#contact" className="dunst-btn-outline">
                                      ASK A QUESTION
                                    </Link>
                                    <Link to={`/products/${item.id}`} className="dunst-btn-outline">
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
                  <div className="dunst-empty-state">
                    <p className="dunst-empty-label">YOUR FAVOURITES LIST IS EMPTY</p>
                    <p className="dunst-empty-desc">
                      Add items to your wishlist while browsing our nutrition formulations to view them here.
                    </p>
                    <Link to="/" className="dunst-empty-btn">
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="dunst-favourites-grid">
                    {wishlistItems.map((product) => (
                      <article className="dunst-favourite-card" key={product.id}>
                        <button
                          type="button"
                          className="dunst-fav-remove-btn"
                          aria-label={`Remove ${product.name} from favourites`}
                          onClick={() => dispatch(toggleWishlist(product))}
                        >
                          ✕
                        </button>

                        <Link to={`/products/${product.productId || product.id}`} className="dunst-favourite-image-wrap">
                          <img src={publicAssetUrl(product.image)} alt={product.name} className="dunst-favourite-image" loading="lazy" />
                        </Link>

                        <div className="dunst-favourite-info">
                          <h3 className="dunst-favourite-name">
                            <Link to={`/products/${product.productId || product.id}`}>{product.name}</Link>
                          </h3>
                          <p className="dunst-favourite-price">{formatCurrency(product.price)}</p>
                        </div>

                        <button
                          type="button"
                          className={`dunst-add-cart-btn ${addedItemMap[product.productId || product.id] ? "added" : ""}`}
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
