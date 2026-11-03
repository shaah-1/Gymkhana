import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, Eye } from "lucide-react";
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
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">FULFILLMENT</p>
          <h2>Orders ({orders.length})</h2>
          <p>Track, manage, and update customer order fulfillment.</p>
        </div>
      </div>

      <div className="admin-card-panel">
        <div
          style={{
            position: "relative",
            maxWidth: "320px",
            marginBottom: "20px",
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b6e76",
            }}
          />
          <input
            type="search"
            placeholder="Filter by ID, customer, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 14px 0 36px",
              background: "#17181d",
              border: "1px solid #23252c",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </div>

        {loading && orders.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>Loading orders...</p>
        ) : error ? (
          <p className="admin-login-error-banner">{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>
            No orders found matching your search.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Total</th>
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
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: "#ffffff" }}>
                          #{order.id}
                        </strong>
                      </td>
                      <td>{dateStr}</td>
                      <td>{customerName}</td>
                      <td>{itemCount} units</td>
                      <td>
                        <span className={`admin-status-pill ${statusKey}`}>
                          <span className="dot" />
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#ffffff" }}>
                          {formatCurrency(
                            Number(order.total ?? order.totalAmount ?? 0)
                          )}
                        </strong>
                      </td>
                      <td>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-icon-btn"
                          title="View order"
                        >
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
