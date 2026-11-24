import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";

import { fetchAdminProducts } from "../store/slices/adminProductSlice";
import { fetchAdminUsers } from "../store/slices/adminUserSlice";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import { formatCurrency } from "../../utils/formatters";
import AdminPrice from "../components/AdminPrice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

const DAY_MS = 24 * 60 * 60 * 1000;

function getSalesDataset(orders, range) {
  const daysByRange = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365 };
  const bucketCounts = { "7D": 7, "30D": 5, "90D": 3, "1Y": 12 };
  const days = daysByRange[range];
  const bucketCount = bucketCounts[range];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = today.getTime() - (days - 1) * DAY_MS;
  const rangeEnd = today.getTime() + DAY_MS;
  const previousStart = rangeStart - days * DAY_MS;
  const validOrders = orders
    .filter((order) => String(order.status).toLowerCase() !== "cancelled")
    .map((order) => ({
      date: new Date(order.createdAt).getTime(),
      total: Number(order.total ?? order.totalAmount ?? 0),
    }))
    .filter((order) => Number.isFinite(order.date));
  const previousRevenue = validOrders
    .filter((order) => order.date >= previousStart && order.date < rangeStart)
    .reduce((sum, order) => sum + order.total, 0);
  const bucketWidth = (rangeEnd - rangeStart) / bucketCount;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const start = rangeStart + index * bucketWidth;
    const end = start + bucketWidth;
    const date = new Date(start);
    const revenue = validOrders
      .filter((order) => order.date >= start && order.date < end)
      .reduce((sum, order) => sum + order.total, 0);
    const labelOptions =
      range === "7D"
        ? { weekday: "short" }
        : range === "1Y"
          ? { month: "short" }
          : { month: "short", day: "numeric" };
    return {
      date: date.toLocaleDateString("en-IN", labelOptions),
      revenue,
    };
  });
  const totalRevenue = buckets.reduce((sum, bucket) => sum + bucket.revenue, 0);
  const maxRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 0);
  const axisMaximum = Math.max(1000, Math.ceil(maxRevenue / 1000) * 1000);
  const compactCurrency = new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 0,
  });
  const points = buckets.map((bucket, index) => ({
    x: 50 + (index * 540) / Math.max(bucketCount - 1, 1),
    y: 160 - (bucket.revenue / axisMaximum) * 130,
    val: formatCurrency(bucket.revenue),
    date: bucket.date,
  }));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const currentOrders = validOrders.filter(
    (order) => order.date >= rangeStart && order.date < rangeEnd
  );
  const trend =
    previousRevenue === 0
      ? totalRevenue > 0
        ? "NEW SALES IN THIS PERIOD"
        : "NO SALES IN THIS PERIOD"
      : `${totalRevenue >= previousRevenue ? "↑ +" : "↓ -"}${Math.abs(
          ((totalRevenue - previousRevenue) / previousRevenue) * 100
        ).toFixed(1)}% VS PREVIOUS PERIOD`;

  return {
    revenue: totalRevenue,
    trend,
    labels: buckets.map((bucket) => bucket.date),
    points,
    path,
    fill: `${path} L 590 180 L 50 180 Z`,
    axisLabels: [1, 0.75, 0.5, 0.25, 0].map((fraction) =>
      compactCurrency.format(axisMaximum * fraction)
    ),
    orderCount: currentOrders.length,
    averageOrderValue: currentOrders.length
      ? totalRevenue / currentOrders.length
      : 0,
  };
}

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector((state) => state.adminProducts.products);
  const productsError = useSelector((state) => state.adminProducts.error);
  const users = useSelector((state) => state.adminUsers.users);
  const usersError = useSelector((state) => state.adminUsers.error);
  const orders = useSelector((state) => state.adminOrders.orders);
  const ordersError = useSelector((state) => state.adminOrders.error);
  const dataErrors = [productsError, usersError, ordersError].filter(Boolean);

  const [openSections, setOpenSections] = useState({
    metrics: true,
    sales: true,
    orders: true,
    controls: true,
  });

  const [timeRange, setTimeRange] = useState("30D");
  const [activePoint, setActivePoint] = useState(null);
  const [quickFilter, setQuickFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalRevenue = orders
    .filter((order) => String(order.status).toLowerCase() !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? order.totalAmount ?? 0), 0);
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const totalUnitsInStock = products.reduce(
    (sum, product) => sum + Number(product.stock ?? 0),
    0
  );
  const inStockCount = products.filter(
    (product) => Number(product.stock ?? 0) > 5
  ).length;
  const lowStockCount = products.filter(
    (product) => Number(product.stock ?? 0) > 0 && Number(product.stock ?? 0) <= 5
  ).length;
  const outOfStockCount = products.filter(
    (product) => Number(product.stock ?? 0) <= 0
  ).length;
  const currentDataset = getSalesDataset(orders, timeRange);

  const recentOrders =
    [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map((o) => ({
        id: String(o.id).startsWith("ORD") ? o.id : `ORD${o.id}`,
        realId: o.id,
        customer:
          o.customer?.fullName ||
          o.customer?.name ||
          o.fullName ||
          o.name ||
          o.email ||
          "Customer",
        total: Number(o.total ?? o.totalAmount ?? 0),
        status: String(o.status || "pending").toLowerCase(),
        date: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
      }));

  // Top Showcase Products in Admin portrait framed boxes
  const showcaseProducts = products.slice(0, 3);

  return (
    <section>
      {dataErrors.map((error) => (
        <div className="admin-error-notice" key={error}>
          {error}
        </div>
      ))}
      {/* Breadcrumbs matching Admin aesthetic */}
      <div className="admin-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-black)", fontWeight: 500 }}>
          Overview
        </span>
      </div>

      {/* Main Luxury Display Title */}
      <h1 className="admin-page-title">OVERVIEW</h1>

      {/* 2-Column Luxury Layout (Matches Admin Checkout Structure) */}
      <div className="admin-layout-grid">
        {/* Left Column: Numbered Sections */}
        <div className="admin-sections-col">
          {/* Section 1: Performance Metrics */}
          <div className="admin-section-block">
            <div
              className="admin-section-header"
              onClick={() => toggleSection("metrics")}
            >
              <h2 className="admin-section-title">
                <span className="admin-section-num">1</span>
                <span>PERFORMANCE METRICS</span>
              </h2>
              <span className="admin-section-toggle">
                {openSections.metrics ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.metrics && (
              <div className="admin-metrics-grid">
                <div className="admin-metric-card">
                  <p className="admin-metric-label">Order value (excl. cancelled)</p>
                  <p className="admin-metric-val">
                    <AdminPrice amount={totalRevenue} />
                  </p>
                  <span className="admin-metric-trend">ALL RECORDED ORDERS</span>
                </div>

                <div className="admin-metric-card">
                  <p className="admin-metric-label">Total Orders</p>
                  <p className="admin-metric-val">{totalOrdersCount}</p>
                  <span className="admin-metric-trend">ORDERS ON RECORD</span>
                </div>

                <div className="admin-metric-card">
                  <p className="admin-metric-label">Products Active</p>
                  <p className="admin-metric-val">{totalProductsCount}</p>
                  <span className="admin-metric-trend">100% INVENTORY TRACKED</span>
                </div>

                <div
                  className="admin-metric-card"
                  onClick={() => navigate("/admin/products")}
                  style={{ cursor: "pointer" }}
                  title="View full inventory in Catalog"
                >
                  <p className="admin-metric-label">Inventory Status</p>
                  <p className="admin-metric-val">
                    {totalUnitsInStock}{" "}
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        color: "#6f7177",
                        letterSpacing: "0.04em",
                      }}
                    >
                      UNITS
                    </span>
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: "3px",
                    }}
                  >
                    <span className="admin-status-tag delivered">
                      <strong className="admin-stock-qty">
                        {inStockCount}
                      </strong>{" "}
                      IN STOCK
                    </span>
                    {lowStockCount > 0 && (
                      <span className="admin-status-tag pending">
                        <strong className="admin-stock-qty">
                          {lowStockCount}
                        </strong>{" "}
                        LOW
                      </span>
                    )}
                    {outOfStockCount > 0 && (
                      <span className="admin-status-tag cancelled">
                        <strong className="admin-stock-qty">
                          {outOfStockCount}
                        </strong>{" "}
                        OUT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Sales Overview Graph & Revenue Trends */}
          <div className="admin-section-block">
            <div
              className="admin-section-header"
              onClick={() => toggleSection("sales")}
            >
              <h2 className="admin-section-title">
                <span className="admin-section-num">2</span>
                <span>SALES OVERVIEW & REVENUE TRENDS</span>
              </h2>
              <span className="admin-section-toggle">
                {openSections.sales ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.sales && (
              <div className="admin-sales-graph-panel">
                {/* Graph Header: Metrics and Time Selector Tabs */}
                <div className="admin-graph-top">
                  <div>
                    <p className="admin-graph-revenue-label">
                      Order value ({timeRange})
                    </p>
                    <div className="admin-graph-revenue-group">
                      <span className="admin-graph-revenue-num">
                        <AdminPrice amount={currentDataset.revenue} />
                      </span>
                      <span className="admin-graph-pill-badge">
                        {currentDataset.trend}
                      </span>
                    </div>
                  </div>

                  <div className="admin-graph-time-tabs" role="tablist">
                    {["7D", "30D", "90D", "1Y"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`admin-graph-time-tab ${
                          timeRange === tab ? "active" : ""
                        }`}
                        onClick={() => {
                          setTimeRange(tab);
                          setActivePoint(null);
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Area & Bezier Line Graph */}
                <div className="admin-graph-svg-wrap">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 640 190"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="adminSalesGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#121214"
                          stopOpacity="0.08"
                        />
                        <stop
                          offset="100%"
                          stopColor="#121214"
                          stopOpacity="0.00"
                        />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Hairlines */}
                    <line
                      x1="45"
                      y1="25"
                      x2="630"
                      y2="25"
                      stroke="#f0f0f3"
                      strokeWidth="1"
                    />
                    <line
                      x1="45"
                      y1="65"
                      x2="630"
                      y2="65"
                      stroke="#f0f0f3"
                      strokeWidth="1"
                    />
                    <line
                      x1="45"
                      y1="105"
                      x2="630"
                      y2="105"
                      stroke="#f0f0f3"
        f              strokeWidth="1"
                    />
                    <line
                      x1="45"
                      y1="145"
                      x2="630"
                      y2="145"
                      stroke="#f0f0f3"
                      strokeWidth="1"
                    />
                    <line
                      x1="45"
                      y1="180"
                      x2="630"
                      y2="180"
                      stroke="#e5e5e8"
                      strokeWidth="1"
                    />

                    {/* Y Axis Legend */}
                    <text x="10" y="29" fill="#9da0a8" fontSize="10">
                      {currentDataset.axisLabels[0]}
                    </text>
                    <text x="10" y="69" fill="#9da0a8" fontSize="10">
                      {currentDataset.axisLabels[1]}
                    </text>
                    <text x="10" y="109" fill="#9da0a8" fontSize="10">
                      {currentDataset.axisLabels[2]}
                    </text>
                    <text x="10" y="149" fill="#9da0a8" fontSize="10">
                      {currentDataset.axisLabels[3]}
                    </text>
                    <text x="18" y="183" fill="#9da0a8" fontSize="10">
                      {currentDataset.axisLabels[4]}
                    </text>

                    {/* Area fill */}
                    <path
                      d={currentDataset.fill}
                      fill="url(#adminSalesGrad)"
                    />

                    {/* Line Stroke */}
                    <path
                      d={currentDataset.path}
                      stroke="#121214"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Data Node Points */}
                    {currentDataset.points.map((pt, idx) => (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={activePoint?.date === pt.date ? "5.5" : "3.5"}
                          fill="#ffffff"
                          stroke="#121214"
                          strokeWidth="2"
                          style={{ cursor: "pointer", transition: "all 0.16s ease" }}
                          onMouseEnter={() => setActivePoint(pt)}
                          onMouseLeave={() => setActivePoint(null)}
                        />
                        {activePoint?.date === pt.date && (
                          <g>
                            <rect
                              x={pt.x - 42}
                              y={pt.y - 34}
                              width="84"
                              height="24"
                              fill="#121214"
                              rx="2"
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 18}
                              fill="#ffffff"
                              fontSize="10.5"
                              fontWeight="300"
                              textAnchor="middle"
                            >
                              {pt.val}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>

                {/* X Axis Date Labels */}
                <div className="admin-graph-x-labels">
                  {currentDataset.labels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>

                {/* Bottom Sub-metrics */}
                <div className="admin-graph-submetrics">
                  <div className="admin-submetric-item">
                    <span className="admin-submetric-label">
                      Average Order Value
                    </span>
                    <span className="admin-submetric-val">
                      <AdminPrice amount={currentDataset.averageOrderValue} />
                    </span>
                  </div>
                  <div className="admin-submetric-item">
                    <span className="admin-submetric-label">
                      Orders in period
                    </span>
                    <span className="admin-submetric-val">{currentDataset.orderCount}</span>
                  </div>
                  <div className="admin-submetric-item">
                    <span className="admin-submetric-label">
                      Cancelled orders
                    </span>
                    <span className="admin-submetric-val">
                      {orders.filter((order) => String(order.status).toLowerCase() === "cancelled").length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Recent Orders & Fulfillment */}
          <div className="admin-section-block">
            <div
              className="admin-section-header"
              onClick={() => toggleSection("orders")}
            >
              <h2 className="admin-section-title">
                <span className="admin-section-num">3</span>
                <span>RECENT FULFILLMENT & ORDERS</span>
              </h2>
              <span className="admin-section-toggle">
                {openSections.orders ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.orders && (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5}>No orders yet.</td>
                      </tr>
                    )}
                    {recentOrders.map((order) => {
                      const statusKey = order.status.includes("deliv")
                        ? "delivered"
                        : order.status.includes("ship")
                        ? "shipped"
                        : order.status.includes("process")
                        ? "processing"
                        : order.status.includes("cancel")
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

                      return (
                        <tr
                          key={order.id}
                          onClick={() => navigate(`/admin/orders/${order.realId || order.id}`)}
                          className="admin-clickable-row"
                          title={`Click to open order #${order.id}`}
                        >
                          <td>
                            <strong className="admin-order-id-link">#{order.id}</strong>
                          </td>
                          <td>{order.customer}</td>
                          <td>{order.date}</td>
                          <td>
                            <span className={`admin-status-tag ${statusKey}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td>
                            <strong><AdminPrice amount={order.total} /></strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Operational Quick Controls */}
          <div className="admin-section-block">
            <div
              className="admin-section-header"
              onClick={() => toggleSection("controls")}
            >
              <h2 className="admin-section-title">
                <span className="admin-section-num">4</span>
                <span>OPERATIONAL CONTROLS</span>
              </h2>
              <span className="admin-section-toggle">
                {openSections.controls ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.controls && (
              <div className="admin-radio-list">
                <div
                  className={`admin-radio-item ${
                    quickFilter === "products" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setQuickFilter("products");
                    navigate("/admin/products");
                  }}
                >
                  <div className="admin-radio-label">
                    <span className="admin-radio-dot" />
                    <span>Catalog Management & Pricing Updates</span>
                  </div>
                  <span className="admin-radio-price">
                    {totalProductsCount} ITEMS ({totalUnitsInStock} UNITS)
                  </span>
                </div>

                <div
                  className={`admin-radio-item ${
                    quickFilter === "orders" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setQuickFilter("orders");
                    navigate("/admin/orders");
                  }}
                >
                  <div className="admin-radio-label">
                    <span className="admin-radio-dot" />
                    <span>Order Dispatch & Tracking Verification</span>
                  </div>
                  <span className="admin-radio-price">LIVE QUEUE</span>
                </div>

                <div
                  className={`admin-radio-item ${
                    quickFilter === "users" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setQuickFilter("users");
                    navigate("/admin/users");
                  }}
                >
                  <div className="admin-radio-label">
                    <span className="admin-radio-dot" />
                    <span>Customer Accounts & Security Access</span>
                  </div>
                  <span className="admin-radio-price">
                    {users.length} ACCOUNTS
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Admin Summary Panel (Matches "YOUR ORDER (14)" from Screenshot) */}
        <div className="admin-summary-col">
          <h3 className="admin-summary-heading">STORE SUMMARY</h3>

          {/* Product Gallery Strip in framed boxes (Matches 3 cosmetic bottles in screenshot) */}
          <div className="admin-products-strip">
            {showcaseProducts.length === 0 && (
              <p>No products have been added yet.</p>
            )}
            {showcaseProducts.map((p) => (
              <div className="admin-product-box" key={p.name}>
                <img src={publicAssetUrl(p.image)} alt={p.name} />
                <span className="admin-product-box-name">{p.name}</span>
                <span className="admin-product-box-price">
                  <AdminPrice amount={p.price} />
                </span>
              </div>
            ))}
          </div>

          {/* Underline Action Search Field with Arrow */}
          <div className="admin-promo-line">
            <input
              type="text"
              placeholder="Search product code or SKU..."
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate("/admin/products");
              }}
            />
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              aria-label="Search"
            >
              →
            </button>
          </div>

          {/* Financial Ledger (Exact aesthetic from Admin screenshot) */}
          <div className="admin-ledger">
            <div className="admin-ledger-row">
              <span>GROSS ORDER VALUE:</span>
              <span>
                <AdminPrice amount={totalRevenue} />
              </span>
            </div>
            <div className="admin-ledger-row">
              <span>ESTIMATED FULFILLMENT:</span>
              <span>COMPLIMENTARY</span>
            </div>
            <div className="admin-ledger-row total">
              <span>TOTAL ORDER VALUE:</span>
              <span>
                <AdminPrice amount={totalRevenue} />
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/admin/products/add" className="admin-btn-black">
              <span>ADD PRODUCT</span>
              <ArrowRight size={14} />
            </Link>

            <Link to="/admin/orders" className="admin-btn-outline">
              VIEW ALL ORDERS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
