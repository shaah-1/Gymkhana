import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import AdminPrice from "../components/AdminPrice";
import {
  adminBreadcrumbLinkClass,
  adminBreadcrumbsClass,
  adminErrorNoticeClass,
  adminNumClass,
  adminPageHeaderClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
  adminSearchWrapClass,
  adminStatusTagClass,
  adminTableClass,
  adminTableContainerClass,
  adminTdClass,
  adminThClass,
  adminTitleNumClass,
  adminUnderlineInputClass,
} from "../adminClasses";

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
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className="font-medium text-[#121214]">Orders</span>
      </div>

      <div className={adminPageHeaderClass}>
        <div>
          <h1 className={adminPageTitleClass}>
            FULFILLMENT <span className={adminTitleNumClass}>({orders.length})</span>
          </h1>
          <p className={adminPageSubtitleClass}>
            Live customer orders and shipping fulfillment statuses.
          </p>
        </div>
      </div>

      {/* Filter line */}
      <div className={adminSearchWrapClass}>
        <input
          type="search"
          className={adminUnderlineInputClass}
          placeholder="Filter by ID, customer name, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-[#7a7c82]">Loading orders queue...</p>
      ) : error ? (
        <div className={adminErrorNoticeClass}>{error}</div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-[#7a7c82]">No orders found matching your search.</p>
      ) : (
        <div className={adminTableContainerClass}>
          <table className={adminTableClass}>
            <thead>
              <tr>
                <th className={adminThClass}>Order ID</th>
                <th className={adminThClass}>Placement Date</th>
                <th className={adminThClass}>Client</th>
                <th className={adminThClass}>Units</th>
                <th className={adminThClass}>Fulfillment</th>
                <th className={adminThClass}>Gross Total</th>
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
                    className="group/row cursor-pointer transition-colors duration-150 hover:bg-[#f2f2f5]"
                    title={`Click to open order #${order.id}`}
                  >
                    <td className={adminTdClass}>
                      <strong
                        className={`${adminNumClass} group-hover/row:underline`}
                      >
                        #{order.id}
                      </strong>
                    </td>
                    <td className={`${adminTdClass} ${adminNumClass}`}>{dateStr}</td>
                    <td className={adminTdClass}>{customerName}</td>
                    <td className={`${adminTdClass} ${adminNumClass}`}>
                      {itemCount} {itemCount === 1 ? "unit" : "units"}
                    </td>
                    <td className={adminTdClass}>
                      <span className={adminStatusTagClass(statusKey)}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className={adminTdClass}>
                      <strong className={adminNumClass}>
                        <AdminPrice
                          amount={order.total ?? order.totalAmount ?? 0}
                        />
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
