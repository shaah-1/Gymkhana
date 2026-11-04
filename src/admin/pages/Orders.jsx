import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import { formatCurrency } from "../../utils/formatters";

function Orders() {
  const dispatch = useDispatch();
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
      <div className="eden-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <span style={{ color: "var(--eden-black)", fontWeight: 500 }}>
          Orders
        </span>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h1 className="eden-page-title" style={{ margin: 0 }}>
          FULFILLMENT ({orders.length})
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
          Live customer orders, shipping dispatch, and payment statuses.
        </p>
      </div>

      {/* Filter line */}
      <div style={{ maxWidth: "340px", marginBottom: "24px" }}>
        <input
          type="search"
          className="eden-underline-input"
          placeholder="Filter by ID, customer name, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && orders.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>Loading orders queue...</p>
      ) : error ? (
        <div className="eden-error-notice">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>No orders found matching your search.</p>
      ) : (
        <div className="eden-table-container">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Placement Date</th>
                <th>Client</th>
                <th>Units</th>
                <th>Fulfillment</th>
                <th>Gross Total</th>
                <th>Action</th>
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
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: "var(--eden-black)" }}>
                        #{order.id}
                      </strong>
                    </td>
                    <td>{dateStr}</td>
                    <td>{customerName}</td>
                    <td>
                      {itemCount} {itemCount === 1 ? "unit" : "units"}
                    </td>
                    <td>
                      <span className={`eden-status-tag ${statusKey}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {formatCurrency(
                          Number(order.total ?? order.totalAmount ?? 0)
                        )}
                      </strong>
                    </td>
                    <td>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="eden-action-link"
                      >
                        Inspect →
                      </Link>
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
