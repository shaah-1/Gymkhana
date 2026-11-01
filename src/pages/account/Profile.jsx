import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import { getUserById } from "../../services/authService";
import { getOrdersByUserId } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";
import "./Profile.css";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxUser = useSelector((s) => s.auth.user);
  const userId = useSelector((s) => s.auth.userId);

  const [user, setUser] = useState(reduxUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!userId) return navigate("/login", { replace: true });
    let active = true;

    getUserById(userId)
      .then((data) => {
        if (!active) return;
        const safe = { ...data };
        delete safe.password;
        setUser(safe);
      })
      .catch(() => active && setError("Unable to load your profile. Please try again."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    getOrdersByUserId(userId)
      .then((data) => active && setOrders(data.filter((o) => String(o.userId) === String(userId))))
      .catch(() => active && setOrdersError("Unable to load your order history."))
      .finally(() => active && setOrdersLoading(false));

    return () => { active = false; };
  }, [userId]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login", { replace: true });
  };

  const formatDate = (d) => {
    if (!d) return "Date unavailable";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) return <main className="profile-page"><div className="profile-container"><p className="profile-message">Loading your profile...</p></div></main>;
  if (error) return (
    <main className="profile-page">
      <div className="profile-container">
        <p className="profile-error">{error}</p>
        <button className="profile-button" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    </main>
  );

  const displayName = user?.name || user?.fullName || user?.username || "GYMKHANA Member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <p className="profile-eyebrow">GYMKHANA NUTRITION</p>
          <h1 className="profile-title">My Account<span>.</span></h1>
          <p className="profile-subtitle">Manage your personal details and keep track of your orders.</p>
        </header>

        <section className="profile-hero profile-card">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-hero-info">
            <p className="profile-eyebrow">WELCOME BACK</p>
            <h2>{displayName}</h2>
            <p className="profile-muted">{user?.email || "No email provided"}</p>
            <span className="profile-member-badge"><span className="profile-status-dot" />Member Account</span>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-icon">✦</div>
            <div>
              <h2 className="profile-card-title">Personal Information</h2>
              <p className="profile-muted">Your registered account details.</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item"><span className="profile-label">Full Name</span><p className="profile-value">{displayName}</p></div>
            <div className="profile-info-item"><span className="profile-label">Email Address</span><p className="profile-value">{user?.email || "Not provided"}</p></div>
            <div className="profile-info-item"><span className="profile-label">User ID</span><p className="profile-value profile-gold">{user?.id || userId || "Unavailable"}</p></div>
            <div className="profile-info-item"><span className="profile-label">Account Status</span><p className="profile-value profile-gold"><span className="profile-status-dot" />Active</p></div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-icon">↗</div>
            <div>
              <h2 className="profile-card-title">Order History</h2>
              <p className="profile-muted">Your purchases from GYMKHANA Nutrition.</p>
            </div>
            <span className="profile-order-count">{orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}</span>
          </div>

          {ordersLoading ? (
            <p className="profile-message">Loading your orders...</p>
          ) : ordersError ? (
            <p className="profile-error">{ordersError}</p>
          ) : orders.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">◇</div>
              <h3>No orders yet</h3>
              <p className="profile-muted">Your purchases will appear here when you place an order.</p>
              <button className="profile-button" onClick={() => navigate("/")}>Explore Products <span>→</span></button>
            </div>
          ) : (
            <div className="profile-orders">
              {orders.map((order) => {
                const items = order.items || order.products || [];
                return (
                  <article className="profile-order" key={order.id}>
                    <div className="profile-order-top">
                      <div><span className="profile-label">ORDER ID</span><p className="profile-value">#{order.id}</p></div>
                      <span className="profile-status">{order.status || "Processing"}</span>
                    </div>

                    <div className="profile-order-details">
                      <p className="profile-muted">{formatDate(order.createdAt || order.date)}</p>
                      <p className="profile-muted">{items.length} {items.length === 1 ? "item" : "items"}</p>
                    </div>

                    {items.length > 0 && (
                      <div className="profile-order-items">
                        {items.map((item, idx) => (
                          <div className="profile-order-item" key={item.id || idx}>
                            <span>{item.name || item.title || "Product"} × {item.quantity || 1}</span>
                            <span>{formatCurrency(item.price || 0)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="profile-order-bottom">
                      <span className="profile-label">ORDER TOTAL</span>
                      <strong className="profile-order-total">{formatCurrency(order.total ?? order.totalAmount ?? 0)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="profile-actions">
          <div>
            <h3>Ready to leave?</h3>
            <p className="profile-muted">You can sign back in whenever you're ready.</p>
          </div>
          <button className="profile-button profile-logout" onClick={handleLogout}>↗ Sign Out</button>
        </section>

        <footer className="profile-footer">GYMKHANA NUTRITION <span>·</span> BUILT FOR PROGRESS</footer>
      </div>
    </main>
  );
}
