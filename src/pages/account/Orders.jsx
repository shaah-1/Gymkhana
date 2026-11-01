import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrdersByUserId } from "../../services/orderService";
import { formatCurrency } from "../../utils/formatters";

export default function Orders() {
  const userId = localStorage.getItem("userId");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let active = true;

    getOrdersByUserId(userId)
      .then((data) => {
        if (!active) return;
        const userOrders = data.filter((o) => String(o.userId) === String(userId));
        setOrders(userOrders.reverse());
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to fetch orders:", err);
        setError("Unable to load your orders. Please try again.");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [userId]);

  if (loading) return <div className="orders-page">Loading your orders...</div>;
  if (error) return <div className="orders-page">{error}</div>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      <p className="orders-subtitle">Your GYMKHANA Nutrition order history</p>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here.</p>
          <Link to="/">Explore Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>{order.date || order.createdAt ? new Date(order.date || order.createdAt).toLocaleDateString() : "Date unavailable"}</p>
                </div>
                <span className="order-status">{order.status || "Placed"}</span>
              </div>

              <div className="order-products">
                {(order.items || []).map((item, idx) => (
                  <div className="order-product" key={item.id ?? idx}>
                    <span>{item.name || item.title || "Product"}</span>
                    <span>Qty: {item.quantity || 1}</span>
                    <span>{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>Total</span>
                <strong>{formatCurrency(order.total || 0)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
