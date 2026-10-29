
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logout } from "../redux/authSlice";
import "./Profile.css";
import Orders from "./Orders";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxUser = useSelector((state) => state.auth.user);
  const userId = useSelector((state) => state.auth.userId);

  const [user, setUser] = useState(reduxUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // Fetch the logged-in user's profile
  useEffect(() => {
    let active = true;

    async function fetchUser() {
      if (!userId) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/users/${userId}`
        );

        if (!active) return;

        const { password, ...safeUser } = response.data;
        setUser(safeUser);
      } catch (err) {
        if (active) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      active = false;
    };
  }, [userId, navigate]);

  // Fetch orders belonging to the logged-in user
  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      if (!userId) return;

      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response = await axios.get(`${API_URL}/orders`, {
          params: { userId: String(userId) },
        });

        if (!active) return;

        const userOrders = response.data.filter(
          (order) => String(order.userId) === String(userId)
        );

        setOrders(userOrders);
      } catch (err) {
        if (active) {
          setOrdersError("Unable to load your order history.");
        }
      } finally {
        if (active) setOrdersLoading(false);
      }
    }

    fetchOrders();

    return () => {
      active = false;
    };
  }, [userId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderItems = (order) =>
    order.items || order.products || [];

  const getOrderTotal = (order) =>
    order.total ?? order.totalAmount ?? 0;

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p className="profile-message">Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p className="profile-error">{error}</p>
          <button
            className="profile-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const displayName =
    user?.name || user?.fullName || user?.username || "GYMKHANA Member";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <div className="profile-container">
        {/* Page heading */}
        <header className="profile-heading">
          <p className="profile-eyebrow">GYMKHANA NUTRITION</p>
          <h1 className="profile-title">My Account<span>.</span></h1>
          <p className="profile-subtitle">
            Manage your personal details and keep track of your orders.
          </p>
        </header>

        {/* User summary */}
        <section className="profile-hero profile-card">
          <div className="profile-avatar">{initial}</div>

          <div className="profile-hero-info">
            <p className="profile-eyebrow">WELCOME BACK</p>
            <h2>{displayName}</h2>
            <p className="profile-muted">
              {user?.email || "No email provided"}
            </p>
            <span className="profile-member-badge">
              <span className="profile-status-dot" />
              Member Account
            </span>
          </div>
        </section>

        {/* Personal information */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-icon">✦</div>
            <div>
              <h2 className="profile-card-title">
                Personal Information
              </h2>
              <p className="profile-muted">
                Your registered account details.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-label">Full Name</span>
              <p className="profile-value">{displayName}</p>
            </div>

            <div className="profile-info-item">
              <span className="profile-label">Email Address</span>
              <p className="profile-value">
                {user?.email || "Not provided"}
              </p>
            </div>

            <div className="profile-info-item">
              <span className="profile-label">User ID</span>
              <p className="profile-value profile-gold">
                {user?.id || userId || "Unavailable"}
              </p>
            </div>

            <div className="profile-info-item">
              <span className="profile-label">Account Status</span>
              <p className="profile-value profile-gold">
                <span className="profile-status-dot" />
                Active
              </p>
            </div>
          </div>
        </section>

        {/* Order history */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-icon">↗</div>
            <div>
              <h2 className="profile-card-title">Order History</h2>
              <p className="profile-muted">
                Your purchases from GYMKHANA Nutrition.
              </p>
            </div>
            <span className="profile-order-count">
              {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
            </span>
          </div>

          {ordersLoading ? (
            <p className="profile-message">Loading your orders...</p>
          ) : ordersError ? (
            <p className="profile-error">{ordersError}</p>
          ) : orders.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">◇</div>
              <h3>No orders yet</h3>
              <p className="profile-muted">
                Your purchases will appear here when you place an order.
              </p>
              <button
                className="profile-button"
                onClick={() => navigate("/")}
              >
                Explore Products <span>→</span>
              </button>
            </div>
          ) : (
            <div className="profile-orders">
              {orders.map((order) => {
                const items = getOrderItems(order);
                const status = order.status || "Processing";

                return (
                  <article
                    className="profile-order"
                    key={order.id}
                  >
                    <div className="profile-order-top">
                      <div>
                        <span className="profile-label">ORDER ID</span>
                        <p className="profile-value">
                          #{order.id}
                        </p>
                      </div>

                      <span className="profile-status">
                        {status}
                      </span>
                    </div>

                    <div className="profile-order-details">
                      <p className="profile-muted">
                        {formatDate(order.createdAt || order.date)}
                      </p>

                      <p className="profile-muted">
                        {items.length}{" "}
                        {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    {items.length > 0 && (
                      <div className="profile-order-items">
                        {items.map((item, index) => (
                          <div
                            className="profile-order-item"
                            key={item.id || item.productId || index}
                          >
                            <span>
                              {item.name ||
                                item.title ||
                                item.product?.name ||
                                item.product?.title ||
                                "Product"}
                              {" × "}
                              {item.quantity || 1}
                            </span>

                            <span>
                              {formatPrice(
                                item.price ??
                                  item.product?.price ??
                                  0
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="profile-order-bottom">
                      <span className="profile-label">
                        ORDER TOTAL
                      </span>
                      <strong className="profile-order-total">
                        {formatPrice(getOrderTotal(order))}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Account actions */}
        <section className="profile-actions">
          <div>
            <h3>Ready to leave?</h3>
            <p className="profile-muted">
              You can sign back in whenever you're ready.
            </p>
          </div>

          <button
            className="profile-button profile-logout"
            onClick={handleLogout}
          >
            ↗ Sign Out
          </button>
        </section>

        <footer className="profile-footer">
          GYMKHANA NUTRITION <span>·</span> BUILT FOR PROGRESS
        </footer>
      </div>
    </main>
  );
}
