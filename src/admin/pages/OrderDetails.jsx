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
        <p style={{ color: "#7a7c82" }}>Loading order record...</p>
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
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <section>
      {/* Breadcrumbs */}
      <div className="eden-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <Link to="/admin/orders">Orders</Link>
        <span>/</span>
        <span style={{ color: "var(--eden-black)", fontWeight: 500 }} className="eden-num">
          #{order.id}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 className="eden-page-title" style={{ margin: 0 }}>
            ORDER <span className="eden-title-num">#{order.id}</span>
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
            Placed on <span className="eden-num">{orderDate}</span>
          </p>
        </div>

        <Link
          to="/admin/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#6f7177",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={13} />
          <span>Queue</span>
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "36px",
        }}
      >
        {/* Customer Information Card */}
        <div
          style={{
            background: "var(--eden-surface)",
            border: "1px solid var(--eden-border)",
            padding: "24px",
          }}
        >
          <p
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6f7177",
              margin: "0 0 16px",
            }}
          >
            1 CLIENT & SHIPPING
          </p>
          <p style={{ margin: "0 0 6px", color: "var(--eden-black)", fontWeight: 600 }}>
            {customerName}
          </p>
          <p style={{ margin: "0 0 4px", color: "#6f7177", fontSize: "12px" }}>
            Email: {customer.email || order.email || "—"}
          </p>
          <p style={{ margin: "0 0 14px", color: "#6f7177", fontSize: "12px" }}>
            Phone: {customer.phone || "—"}
          </p>
          {customer.address && (
            <div
              style={{
                marginTop: "12px",
                borderTop: "1px solid var(--eden-border)",
                paddingTop: "12px",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  color: "#989aa0",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Delivery Address:
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#3b3d42",
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
        <div
          style={{
            background: "var(--eden-surface)",
            border: "1px solid var(--eden-border)",
            padding: "24px",
          }}
        >
          <p
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6f7177",
              margin: "0 0 16px",
            }}
          >
            2 STATUS & PAYMENT
          </p>
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#6f7177",
                marginRight: "10px",
              }}
            >
              Fulfillment Status:
            </span>
            <span className={`eden-status-tag ${statusKey}`}>
              {statusLabel}
            </span>
          </div>

          <label style={{ display: "block", marginBottom: "16px" }}>
            <span
              style={{
                display: "block",
                fontSize: "11px",
                color: "#6f7177",
                marginBottom: "6px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Update Status:
            </span>
            <select
              value={statusStr}
              onChange={handleStatusChange}
              disabled={updating}
              className="eden-underline-input"
              style={{ cursor: "pointer" }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <p style={{ margin: "0 0 6px", color: "#6f7177", fontSize: "12px" }}>
            Payment Method:{" "}
            <strong style={{ color: "var(--eden-black)" }}>
              {String(order.paymentMethod || "COD").toUpperCase()}
            </strong>
          </p>
          <p style={{ margin: 0, color: "#6f7177", fontSize: "12px" }}>
            Payment Status:{" "}
            <span style={{ color: "#7a5e24", fontWeight: 600 }}>
              {String(order.paymentStatus || "Pending")
                .replace(/_/g, " ")
                .toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="eden-table-container">
        <table className="eden-table">
          <thead>
            <tr>
              <th>Ordered Formulation</th>
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
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          background: "var(--eden-light-box)",
                          border: "1px solid var(--eden-border)",
                          display: "grid",
                          placeItems: "center",
                          padding: "4px",
                          boxSizing: "border-box",
                        }}
                      >
                        <img
                          src={publicAssetUrl(
                            item.image || "/products/whey-protein.png"
                          )}
                          alt={item.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--eden-black)" }}>
                        {item.name || item.title || "Product"}
                      </span>
                    </div>
                  </td>
                  <td className="eden-num-cell">{formatCurrency(price)}</td>
                  <td className="eden-num-cell">{qty}</td>
                  <td>
                    <strong className="eden-num">{formatCurrency(lineTotal)}</strong>
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
                  color: "#6f7177",
                  borderTop: "1px solid var(--eden-border)",
                  letterSpacing: "0.1em",
                }}
              >
                TOTAL:
              </td>
              <td
                style={{
                  padding: "16px",
                  borderTop: "1px solid var(--eden-border)",
                }}
              >
                <strong className="eden-num" style={{ fontSize: "15px", color: "var(--eden-black)" }}>
                  {formatCurrency(
                    Number(order.total ?? order.totalAmount ?? 0)
                  )}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default OrderDetails;
