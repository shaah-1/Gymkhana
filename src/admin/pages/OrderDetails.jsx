import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../store/slices/adminOrderSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [updating, setUpdating] = useState(false);

  const order = useSelector((state) =>
    state.adminOrders.orders.find((item) => String(item.id) === String(id))
  );

  useEffect(() => {
    if (!order) dispatch(fetchAdminOrders());
  }, [dispatch, order]);

  if (!order) {
    return (
      <section>
        <p style={{ color: "#8e9198" }}>Loading order details...</p>
      </section>
    );
  }

  const customer = order.customer || {};
  const customerName =
    customer.fullName ||
    customer.name ||
    order.fullName ||
    order.name ||
    order.email ||
    "—";

  const items = order.items || order.products || [];
  const statusStr = String(order.status || "pending").toLowerCase();
  const statusKey = statusStr.includes("deliv")
    ? "delivered"
    : statusStr.includes("process")
    ? "processing"
    : statusStr.includes("cancel")
    ? "cancelled"
    : "pending";

  const statusLabel =
    statusKey === "delivered"
      ? "Delivered"
      : statusKey === "processing"
      ? "Processing"
      : statusKey === "cancelled"
      ? "Cancelled"
      : "Pending";

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await dispatch(
        updateAdminOrderStatus({
          id: order.id,
          status: newStatus,
        })
      ).unwrap();
    } finally {
      setUpdating(false);
    }
  };

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <section>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">FULFILLMENT</p>
          <h2>Order #{order.id}</h2>
          <p>Placed on {orderDate}</p>
        </div>
        <Link
          to="/admin/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#8e9198",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to orders</span>
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Customer Information Card */}
        <div className="admin-card-panel">
          <p className="admin-eyebrow" style={{ marginBottom: "14px" }}>
            Customer & Delivery
          </p>
          <p style={{ margin: "0 0 6px", color: "#ffffff", fontWeight: 600 }}>
            {customerName}
          </p>
          <p style={{ margin: "0 0 4px", color: "#8e9198", fontSize: "12px" }}>
            Email: {customer.email || order.email || "—"}
          </p>
          <p style={{ margin: "0 0 12px", color: "#8e9198", fontSize: "12px" }}>
            Phone: {customer.phone || "—"}
          </p>
          {customer.address && (
            <div
              style={{
                marginTop: "12px",
                borderTop: "1px solid #1f2127",
                paddingTop: "12px",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  color: "#6e7178",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Shipping Address
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#d1d3d6",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                {customer.address}
                {customer.city ? `, ${customer.city}` : ""}
                {customer.pincode ? ` - ${customer.pincode}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Fulfillment & Payment Card */}
        <div className="admin-card-panel">
          <p className="admin-eyebrow" style={{ marginBottom: "14px" }}>
            Status & Payment
          </p>
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#8e9198",
                marginRight: "10px",
              }}
            >
              Current Status:
            </span>
            <span className={`admin-status-pill ${statusKey}`}>
              <span className="dot" />
              <span>{statusLabel}</span>
            </span>
          </div>

          <label style={{ display: "block", marginBottom: "16px" }}>
            <span
              style={{
                display: "block",
                fontSize: "11.5px",
                color: "#b0b2b8",
                marginBottom: "6px",
                fontWeight: 500,
              }}
            >
              Update Order Status:
            </span>
            <select
              value={statusStr}
              onChange={handleStatusChange}
              disabled={updating}
              style={{
                width: "100%",
                height: "38px",
                background: "#17181d",
                border: "1px solid #23252c",
                borderRadius: "8px",
                color: "#ffffff",
                padding: "0 12px",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <p style={{ margin: "0 0 6px", color: "#8e9198", fontSize: "12px" }}>
            Payment Method:{" "}
            <strong style={{ color: "#ffffff" }}>
              {String(order.paymentMethod || "COD").toUpperCase()}
            </strong>
          </p>
          <p style={{ margin: 0, color: "#8e9198", fontSize: "12px" }}>
            Payment Status:{" "}
            <span style={{ color: "#fbbf24", fontWeight: 500 }}>
              {String(order.paymentStatus || "Pending")
                .replace(/_/g, " ")
                .toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="admin-card-panel">
        <div className="admin-card-panel-header">
          <h3 className="admin-card-title">Ordered Items ({items.length})</h3>
        </div>

        {items.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>
            No item details available for this order.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const qty = Number(item.quantity || 1);
                  const price = Number(item.price || 0);
                  const lineTotal = price * qty;

                  return (
                    <tr key={item.id || item.productId || idx}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <img
                            src={publicAssetUrl(
                              item.image || "/products/whey-protein.png"
                            )}
                            alt={item.name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: "#17181d",
                              border: "1px solid #23252c",
                              objectFit: "cover",
                              padding: "2px",
                            }}
                          />
                          <span style={{ fontWeight: 500, color: "#ffffff" }}>
                            {item.name || item.title || "Product"}
                          </span>
                        </div>
                      </td>
                      <td>{formatCurrency(price)}</td>
                      <td>{qty}</td>
                      <td>
                        <strong style={{ color: "#ffffff" }}>
                          {formatCurrency(lineTotal)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "right",
                      fontWeight: 600,
                      padding: "16px",
                      color: "#6e7178",
                      borderTop: "1px solid #1f2127",
                    }}
                  >
                    Grand Total:
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      borderTop: "1px solid #1f2127",
                    }}
                  >
                    <strong style={{ fontSize: "15px", color: "#ffffff" }}>
                      {formatCurrency(
                        Number(order.total ?? order.totalAmount ?? 0)
                      )}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default OrderDetails;
