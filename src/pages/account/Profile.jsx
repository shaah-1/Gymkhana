import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { logout, setUser as setReduxUser } from "../../redux/authSlice";
import { addToCart, clearCart } from "../../redux/cartSlice";
import { toggleWishlist } from "../../redux/wishlistSlice";
import { fetchProducts } from "../../redux/productSlice";
import { getUserById } from "../../services/authService";
import { getOrdersByUserId } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";
import "./Profile.css";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const reduxUser = useSelector((s) => s.auth.user);
  const userId = useSelector((s) => s.auth.userId);
  const products = useSelector((s) => s.products.items);
  const wishlistItems = useSelector((s) => s.wishlist.items);

  const [user, setUser] = useState(reduxUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [selectedTab, setSelectedTab] = useState(null);
  const [addedItemMap, setAddedItemMap] = useState({});

  const activeTab = selectedTab || (location.hash === "#favourites" ? "favourites" : "orders");

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
    dispatch(clearCart());
    navigate("/", { state: { message: "Logged out successfully!" }, replace: true });
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
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
  const city = latestOrder?.customer?.city || user?.city || "MUMBAI";
  const country = latestOrder?.customer?.country || user?.country || "INDIA";
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

          <button
            type="button"
            className={`dunst-tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setSelectedTab("details")}
          >
            ACCOUNT DETAILS
          </button>
        </nav>

        {/* Main Tab View */}
        <div className="dunst-view-layout">
          <aside className="dunst-view-sidebar">
            <h2 className="dunst-section-title">
              {activeTab === "orders" ? "MY ORDERS" : activeTab === "favourites" ? "FAVOURITES" : "ACCOUNT DETAILS"}
            </h2>
          </aside>

          <div className="dunst-view-main">
            {/* 1. MY ORDERS TAB */}
            {activeTab === "orders" && (
              <section id="orders">
                {ordersLoading ? (
                  <div className="dunst-loading-box">LOADING ORDER RECORDS...</div>
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
                    <Link to="/" className="dunst-empty-btn">
                      EXPLORE COLLECTION
                    </Link>
                  </div>
                ) : (
                  <div className="dunst-orders-list">
                    {orders.flatMap((order) => {
                      const items = order.items || order.products || [];
                      const status = String(order.status || "SENT").toLowerCase();
                      const statusClass = status.includes("delivered") || status.includes("complete")
                        ? "dunst-status-delivered"
                        : status.includes("cancel") || status.includes("fail")
                          ? "dunst-status-cancelled"
                          : "dunst-status-pending";

                      const trackingNumber = order.trackingNumber || `000-${String(order.id).slice(-3).padStart(3, "0")}-${String(order.id).slice(0, 3).padStart(3, "0")}-00`.toUpperCase();

                      return items.map((item, idx) => {
                        const matchedProduct = products.find((p) => String(p.id) === String(item.id));
                        const itemImage = matchedProduct?.image || item.image || "/products/whey-protein.png";
                        const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                        return (
                          <article className="dunst-order-card" key={`${order.id}-${item.id || idx}`}>
                            <Link to={`/products/${item.id}`} className="dunst-order-thumb-wrap">
                              <img src={itemImage} alt={item.name} className="dunst-order-thumb" loading="lazy" />
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

                                  <span className="dunst-spec-k">ORDER STATUS</span>
                                  <span className={`dunst-spec-v dunst-spec-status ${statusClass}`}>
                                    <span className="dunst-status-dot" aria-hidden="true" />
                                    {String(order.status || "SENT").toUpperCase()}
                                  </span>

                                  <span className="dunst-spec-k">NUMBER FOR TRACKING</span>
                                  <span className="dunst-spec-v">{trackingNumber}</span>

                                  <span className="dunst-spec-k">DATE</span>
                                  <span className="dunst-spec-v">{formatDate(order.createdAt || order.date)}</span>
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
                      });
                    })}
                  </div>
                )}
              </section>
            )}

            {/* 2. FAVOURITES TAB */}
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

                        <Link to={`/products/${product.id}`} className="dunst-favourite-image-wrap">
                          <img src={product.image} alt={product.name} className="dunst-favourite-image" loading="lazy" />
                        </Link>

                        <div className="dunst-favourite-info">
                          <h3 className="dunst-favourite-name">
                            <Link to={`/products/${product.id}`}>{product.name}</Link>
                          </h3>
                          <p className="dunst-favourite-price">{formatCurrency(product.price)}</p>
                        </div>

                        <button
                          type="button"
                          className={`dunst-add-cart-btn ${addedItemMap[product.id] ? "added" : ""}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addedItemMap[product.id] ? "ADDED ✓" : "ADD CART"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 3. ACCOUNT DETAILS TAB */}
            {activeTab === "details" && (
              <section id="details">
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
          </div>
        </div>
      </div>
    </main>
  );
}
