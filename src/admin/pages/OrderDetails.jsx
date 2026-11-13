import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../store/slices/adminOrderSlice";
import AdminPrice from "../components/AdminPrice";
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
    : statusStr.includes("ship")
    ? "shipped"
    : statusStr.includes("process")
    ? "processing"
    : statusStr.includes("cancel")
    ? "cancelled"
    : "pending";

  const statusLabel =
    statusKey === "delivered"
      ? "Delivered"
      : statusKey === "shipped"
      ? "Shipped"
      : statusKey === "processing"
      ? "Processing"
      : statusKey === "cancelled"
      ? "Cancelled"
      : "Pending";

  const totalAmount = Number(order.total ?? order.totalAmount ?? 0);

  const STAGES = [
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.key === statusKey);
  const isCancelled = statusKey === "cancelled";

  // Calculate rail fill across 3 segments:
  // pending (index 0): 0%
  // processing (index 1): 33.333%
  // shipped (index 2): 66.666%
  // delivered (index 3): 100%
  const stageFillPercent = isCancelled
    ? 0
    : currentStageIndex <= 0
    ? 0
    : currentStageIndex === 1
    ? 33.333
    : currentStageIndex === 2
    ? 66.666
    : 100;

  const getPointClass = (st, idx) => {
    if (isCancelled) {
      return "pending is-dimmed";
    }

    if (statusKey === "delivered") {
      return "completed";
    }

    if (idx < currentStageIndex) {
      return "completed";
    }
    if (idx === currentStageIndex) {
      return "in-progress active";
    }
    return "pending";
  };

  const handleSetStatus = async (targetStatus) => {
    if (updating || targetStatus === statusKey) return;
    setUpdating(true);
    try {
      await dispatch(
        updateAdminOrderStatus({
          id: order.id,
          status: targetStatus,
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
      <div className="admin-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <Link to="/admin/orders">Orders</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-black)" }} className="admin-num">
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
          <h1 className="admin-page-title" style={{ margin: 0 }}>
            ORDER <span className="admin-title-num">#{order.id}</span>
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
            Placed on <span className="admin-num">{orderDate}</span>
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

      {/* Editorial Order & Fulfillment Status Stepper (Matches Luxury Design) */}
      <div className={`admin-stepper-panel ${isCancelled ? "is-cancelled" : ""}`}>
        <div className="admin-stepper-top-bar">
          <div className="admin-stepper-title-group">
            <p className="admin-stepper-kicker">Order Fulfillment Status</p>
            <span className={`admin-status-tag ${statusKey}`}>
              {statusLabel}
            </span>
            {updating && (
              <span style={{ fontSize: "11px", color: "#6f7177", fontStyle: "italic" }}>
                Updating status...
              </span>
            )}
          </div>
          <div className="admin-stepper-badges">
            {isCancelled ? (
              <button
                type="button"
                onClick={() => handleSetStatus("pending")}
                disabled={updating}
                className="admin-restore-order-btn"
                title="Restore order to pending"
              >
                Restore Order
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSetStatus("cancelled")}
                disabled={updating}
                className="admin-cancel-order-btn"
                title="Cancel this order"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* The Exact Minimalist 4-Step Progress Track (Pending -> Processing -> Shipped -> Delivered) */}
        <div className="admin-stepper-track-wrap">
          <div className="admin-stepper-rail">
            <div
              className="admin-stepper-rail-fill"
              style={{
                width: `${stageFillPercent}%`,
              }}
            />
          </div>

          {STAGES.map((st, idx) => {
            const pointClass = getPointClass(st, idx);

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => handleSetStatus(st.key)}
                disabled={updating}
                className={`admin-stepper-point ${pointClass}`}
                title={`Click to set status to ${st.label}`}
              >
                <span className="admin-stepper-point-label">{st.label}</span>
                <div className="admin-stepper-point-circle" />
              </button>
            );
          })}
        </div>

        <div className="admin-stepper-footer-hint">
          {isCancelled ? (
            <span>
              Order is cancelled. Click any stage above or <strong>Restore Order</strong> to reactivate fulfillment.
            </span>
          ) : (
            <span>Click any step above to update fulfillment status.</span>
          )}
        </div>
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
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
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
          <p style={{ margin: "0 0 6px", color: "var(--admin-black)", fontWeight: 600 }}>
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
                borderTop: "1px solid var(--admin-border)",
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

        {/* Order Summary Card */}
        <div
          style={{
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
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
            2 ORDER SUMMARY
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--admin-border-light)",
              }}
            >
              <span style={{ color: "#6f7177", fontSize: "12px" }}>
                Order Reference:
              </span>
              <strong className="admin-num" style={{ color: "var(--admin-black)", fontSize: "12.5px" }}>
                #{order.id}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--admin-border-light)",
              }}
            >
              <span style={{ color: "#6f7177", fontSize: "12px" }}>
                Total Items:
              </span>
              <strong className="admin-num" style={{ color: "var(--admin-black)", fontSize: "12.5px" }}>
                {items.reduce((sum, i) => sum + Number(i.quantity || 1), 0)} units
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "2px",
              }}
            >
              <span style={{ color: "#6f7177", fontSize: "12px" }}>
                Payable Amount:
              </span>
              <strong
                className="admin-num"
                style={{
                  color: "var(--admin-black)",
                  fontSize: "14px",
                }}
              >
                <AdminPrice amount={totalAmount} />
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="admin-table-container">
        <table className="admin-table">
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
                          background: "var(--admin-light-box)",
                          border: "1px solid var(--admin-border)",
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
                      <span style={{ fontWeight: 600, color: "var(--admin-black)" }}>
                        {item.name || item.title || "Product"}
                      </span>
                    </div>
                  </td>
                  <td className="admin-num-cell">
                    <AdminPrice amount={price} />
                  </td>
                  <td className="admin-num-cell">{qty}</td>
                  <td>
                    <strong className="admin-num">
                      <AdminPrice amount={lineTotal} />
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
                  color: "#6f7177",
                  borderTop: "1px solid var(--admin-border)",
                  letterSpacing: "0.1em",
                }}
              >
                TOTAL:
              </td>
              <td
                style={{
                  padding: "16px",
                  borderTop: "1px solid var(--admin-border)",
                }}
              >
                <strong className="admin-num" style={{ fontSize: "15px", color: "var(--admin-black)" }}>
                  <AdminPrice
                    amount={order.total ?? order.totalAmount ?? 0}
                  />
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
