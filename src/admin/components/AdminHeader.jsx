import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Search } from "lucide-react";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import { fetchAdminProducts } from "../store/slices/adminProductSlice";

const READ_NOTIFICATIONS_KEY = "adminReadNotifications";

function loadReadNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function AdminHeader() {
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.adminAuth.admin);
  const orders = useSelector((state) => state.adminOrders.orders);
  const products = useSelector((state) => state.adminProducts.products);
  const [search, setSearch] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(loadReadNotifications);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (orders.length === 0) dispatch(fetchAdminOrders());
    if (products.length === 0) dispatch(fetchAdminProducts());
  }, [dispatch, orders.length, products.length]);

  useEffect(() => {
    try {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readNotificationIds));
    } catch {
      // Notifications still work for this session if browser storage is unavailable.
    }
  }, [readNotificationIds]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const notifications = useMemo(() => {
    const pendingOrders = orders
      .filter((order) => String(order.status || "pending").toLowerCase() === "pending")
      .map((order) => ({
        id: `order-${order.id}`,
        to: `/admin/orders/${order.id}`,
        title: `Order #${order.id} needs review`,
        detail: order.customer?.fullName || order.customer?.name || order.customer?.email || "New order",
        time: order.createdAt ? new Date(order.createdAt).toLocaleString() : "Pending order",
        type: "order",
      }));

    const lowStockProducts = products
      .filter((product) => Number(product.stock ?? 0) <= 5)
      .map((product) => ({
        id: `stock-${product.id}`,
        to: `/admin/products/edit/${product.id}`,
        title: Number(product.stock ?? 0) === 0 ? `${product.name} is out of stock` : `Low stock: ${product.name}`,
        detail: Number(product.stock ?? 0) === 0 ? "Restock this product" : `${product.stock} left in stock`,
        time: "Inventory alert",
        type: "stock",
      }));

    return [...pendingOrders, ...lowStockProducts].slice(0, 12);
  }, [orders, products]);

  const unreadCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;

  const markNotificationRead = (notificationId) => {
    setReadNotificationIds((current) => current.includes(notificationId) ? current : [...current, notificationId]);
  };

  const markAllRead = () => {
    setReadNotificationIds((current) => [...new Set([...current, ...notifications.map((item) => item.id)])]);
  };

  const emailInitial = admin?.email
    ? admin.email.charAt(0).toUpperCase()
    : "A";

  return (
    <header className="admin-header">
      {/* Search Bar */}
      <div className="admin-header-search">
        <Search size={15} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything..."
          aria-label="Search dashboard"
        />
        <span className="admin-header-search-badge">⌘ K</span>
      </div>

      {/* Header Actions */}
      <div className="admin-header-actions">
        <div className="admin-notifications" ref={notificationRef}>
          <button
            type="button"
            className="admin-header-btn"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={isNotificationsOpen}
            aria-controls="admin-notification-panel"
            title="Notifications"
            onClick={() => setIsNotificationsOpen((open) => !open)}
          >
            <Bell size={16} strokeWidth={1.8} />
            {unreadCount > 0 && <span className="admin-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>

          {isNotificationsOpen && (
            <section className="admin-notification-panel" id="admin-notification-panel" aria-label="Admin notifications">
              <div className="admin-notification-heading">
                <div><h2>Notifications</h2><span>{unreadCount ? `${unreadCount} unread` : "All caught up"}</span></div>
                <button type="button" onClick={markAllRead} disabled={!unreadCount}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              </div>
              <div className="admin-notification-list" aria-live="polite">
                {notifications.length ? notifications.map((item) => {
                  const isRead = readNotificationIds.includes(item.id);
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={`admin-notification-item${isRead ? " is-read" : " is-unread"}`}
                      onClick={() => { markNotificationRead(item.id); setIsNotificationsOpen(false); }}
                    >
                      <span className={`admin-notification-marker ${item.type}`} aria-hidden="true" />
                      <span className="admin-notification-copy">
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                        <small>{item.time}</small>
                      </span>
                    </Link>
                  );
                }) : <p className="admin-notification-empty">No new orders or inventory alerts.</p>}
              </div>
            </section>
          )}
        </div>

        <Link
          to="/admin/profile"
          className="admin-header-avatar"
          aria-label="Open admin profile"
          title={admin?.email || "Administrator"}
        >
          {admin?.photo ? <img src={admin.photo} alt="" /> : emailInitial}
        </Link>
      </div>
    </header>
  );
}

export default AdminHeader;
