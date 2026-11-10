import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import { formatCurrency } from "../../utils/formatters";

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.adminOrders);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const id = String(o.id).toLowerCase();
    const customer = (
      o.customer?.fullName ||
      o.customer?.name ||
      o.customer?.email ||
      o.fullName ||
      o.email ||
      ""
    ).toLowerCase();
    const status = String(o.status || "").toLowerCase();
    return id.includes(q) || customer.includes(q) || status.includes(q);
  });

  return (
    <section>
      {/* Breadcrumbs */}
      <div className="admin-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-black)", fontWeight: 500 }}>
          Orders
        </span>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          FULFILLMENT <span className="admin-title-num">({orders.length})</span>
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
          Live customer orders and shipping fulfillment statuses.
        </p>
      </div>

      {/* Filter line */}
      <div style={{ maxWidth: "340px", marginBottom: "24px" }}>
        <input
          type="search"
          className="admin-underline-input"
          placeholder="Filter by ID, customer name, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && orders.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>Loading orders queue...</p>
      ) : error ? (
        <div className="admin-error-notice">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>No orders found matching your search.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Placement Date</th>
                <th>Client</th>
                <th>Units</th>
                <th>Fulfillment</th>
                <th>Gross Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const customerName =
                  order.customer?.fullName ||
                  order.customer?.name ||
                  order.fullName ||
                  order.name ||
                  order.email ||
                  "—";

                const itemCount = (
                  order.items ||
                  order.products ||
                  []
                ).reduce((sum, i) => sum + Number(i.quantity || 1), 0);

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

                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="admin-clickable-row"
                    title={`Click to open order #${order.id}`}
                  >
                    <td>
                      <strong className="admin-num admin-order-id-link" style={{ color: "var(--admin-black)" }}>
                        #{order.id}
                      </strong>
                    </td>
                    <td className="admin-num-cell">{dateStr}</td>
                    <td>{customerName}</td>
                    <td className="admin-num-cell">
                      {itemCount} {itemCount === 1 ? "unit" : "units"}
                    </td>
                    <td>
                      <span className={`admin-status-tag ${statusKey}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <strong className="admin-num">
                        {formatCurrency(
                          Number(order.total ?? order.totalAmount ?? 0)
                        )}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Orders;
