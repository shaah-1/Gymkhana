
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/orders");

        const userOrders = response.data.filter(
          (order) => String(order.userId) === String(userId)
        );

        setOrders(userOrders.reverse());
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return <div className="orders-page">Loading your orders...</div>;
  }

  if (error) {
    return <div className="orders-page">{error}</div>;
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      <p className="orders-subtitle">
        Your GYMKHANA Nutrition order history
      </p>

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
                  <p>
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>

                <span className="order-status">
                  {order.status || "Placed"}
                </span>
              </div>

              <div className="order-products">
                {(order.items || []).map((item, index) => (
                  <div
                    className="order-product"
                    key={item.id ?? index}
                  >
                    <span>{item.name || item.title || "Product"}</span>
                    <span>Qty: {item.quantity || 1}</span>
                    <span>
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>Total</span>
                <strong>
                  ₹{Number(order.total || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
