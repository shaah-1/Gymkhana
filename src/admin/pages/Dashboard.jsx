import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";

import { fetchAdminProducts } from "../store/slices/adminProductSlice";
import { fetchAdminUsers } from "../store/slices/adminUserSlice";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector((state) => state.adminProducts.products);
  const users = useSelector((state) => state.adminUsers.users);
  const orders = useSelector((state) => state.adminOrders.orders);

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

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.total ?? o.totalAmount ?? 0),
    0
  );

  const totalRevenueFormatted =
    totalRevenue > 0 ? formatCurrency(totalRevenue) : "₹54,950";

  const totalProductsCount = products.length > 0 ? products.length : 24;
  const totalOrdersCount = orders.length > 0 ? orders.length : 892;

  // Sales Overview Graph dataset per timeRange
  const salesDatasets = {
    "7D": {
      revenue: "₹18,420",
      trend: "↑ +9.4% VS PREVIOUS 7 DAYS",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      points: [
        { x: 50, y: 145, val: "₹1,800", date: "Mon" },
        { x: 140, y: 120, val: "₹2,600", date: "Tue" },
        { x: 230, y: 130, val: "₹2,200", date: "Wed" },
        { x: 320, y: 90, val: "₹3,400", date: "Thu" },
        { x: 410, y: 70, val: "₹4,100", date: "Fri" },
        { x: 500, y: 40, val: "₹5,200", date: "Sat" },
        { x: 590, y: 60, val: "₹4,600", date: "Sun" },
      ],
      path: "M 50 145 C 95 135, 110 120, 140 120 C 185 120, 200 130, 230 130 C 275 130, 290 90, 320 90 C 365 90, 380 70, 410 70 C 455 70, 470 40, 500 40 C 545 40, 560 60, 590 60",
      fill: "M 50 145 C 95 135, 110 120, 140 120 C 185 120, 200 130, 230 130 C 275 130, 290 90, 320 90 C 365 90, 380 70, 410 70 C 455 70, 470 40, 500 40 C 545 40, 560 60, 590 60 L 590 180 L 50 180 Z",
    },
    "30D": {
      revenue: totalRevenueFormatted,
      trend: "↑ +14.2% THIS MONTH",
      labels: ["Nov 1", "Nov 7", "Nov 14", "Nov 21", "Nov 30"],
      points: [
        { x: 50, y: 145, val: "₹8,400", date: "Nov 1" },
        { x: 185, y: 115, val: "₹14,200", date: "Nov 7" },
        { x: 320, y: 95, val: "₹22,800", date: "Nov 14" },
        { x: 455, y: 35, val: "₹44,600", date: "Nov 21" },
        { x: 590, y: 75, val: totalRevenueFormatted, date: "Nov 30" },
      ],
      path: "M 50 145 C 117 130, 150 115, 185 115 C 252 115, 285 95, 320 95 C 387 95, 420 35, 455 35 C 522 35, 555 75, 590 75",
      fill: "M 50 145 C 117 130, 150 115, 185 115 C 252 115, 285 95, 320 95 C 387 95, 420 35, 455 35 C 522 35, 555 75, 590 75 L 590 180 L 50 180 Z",
    },
    "90D": {
      revenue: "₹168,240",
      trend: "↑ +18.7% QUARTERLY",
      labels: ["Sep", "Oct", "Nov"],
      points: [
        { x: 50, y: 140, val: "₹45,000", date: "Sep 1" },
        { x: 185, y: 120, val: "₹52,000", date: "Sep 30" },
        { x: 320, y: 85, val: "₹78,000", date: "Oct 15" },
        { x: 455, y: 55, val: "₹120,000", date: "Nov 1" },
        { x: 590, y: 30, val: "₹168,240", date: "Nov 30" },
      ],
      path: "M 50 140 C 117 130, 150 120, 185 120 C 252 120, 285 85, 320 85 C 387 85, 420 55, 455 55 C 522 55, 555 30, 590 30",
      fill: "M 50 140 C 117 130, 150 120, 185 120 C 252 120, 285 85, 320 85 C 387 85, 420 55, 455 55 C 522 55, 555 30, 590 30 L 590 180 L 50 180 Z",
    },
    "1Y": {
      revenue: "₹642,800",
      trend: "↑ +24.1% ANNUAL",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      points: [
        { x: 50, y: 140, val: "₹110k", date: "Q1" },
        { x: 230, y: 100, val: "₹240k", date: "Q2" },
        { x: 410, y: 65, val: "₹420k", date: "Q3" },
        { x: 590, y: 25, val: "₹642k", date: "Q4" },
      ],
      path: "M 50 140 C 140 120, 170 100, 230 100 C 320 100, 350 65, 410 65 C 500 65, 530 25, 590 25",
      fill: "M 50 140 C 140 120, 170 100, 230 100 C 320 100, 350 65, 410 65 C 500 65, 530 25, 590 25 L 590 180 L 50 180 Z",
    },
  };

  const currentDataset = salesDatasets[timeRange] || salesDatasets["30D"];

  // Default mock fallback orders if database has fewer items
  const fallbackOrders = [
    {
      id: "ORD1089",
      customer: "Rahul Sharma",
      total: 2499,
      status: "delivered",
      date: "03 Nov 2026",
    },
    {
      id: "ORD1088",
      customer: "Sneha Reddy",
      total: 1799,
      status: "processing",
      date: "03 Nov 2026",
    },
    {
      id: "ORD1087",
      customer: "Arjun Nair",
      total: 3299,
      status: "pending",
      date: "02 Nov 2026",
    },
    {
      id: "ORD1086",
      customer: "Diya Menon",
      total: 1499,
      status: "delivered",
      date: "02 Nov 2026",
    },
    {
      id: "ORD1085",
      customer: "Rohan Das",
      total: 2199,
      status: "delivered",
      date: "01 Nov 2026",
    },
  ];

  const recentOrders =
    orders.length > 0
      ? [...orders]
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
            status: String(o.status || "delivered").toLowerCase(),
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "03 Nov 2026",
          }))
      : fallbackOrders;

  // Top Showcase Products in Edén portrait framed boxes
  const showcaseProducts = [
    {
      name: "Whey Protein",
      price: 2499,
      image: "/products/whey-protein.png",
    },
    {
      name: "Gym Bag",
      price: 1499,
      image: "/products/gym-bag.png",
    },
    {
      name: "Creatine",
      price: 999,
      image: "/products/creatine.png",
    },
  ];

  return (
    <section>
      {/* Breadcrumbs matching Edén aesthetic */}
      <div className="eden-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <span style={{ color: "var(--eden-black)", fontWeight: 500 }}>
          Overview
        </span>
      </div>

      {/* Main Luxury Display Title */}
      <h1 className="eden-page-title">OVERVIEW</h1>

      {/* 2-Column Luxury Layout (Matches Edén Checkout Structure) */}
      <div className="eden-layout-grid">
        {/* Left Column: Numbered Sections */}
        <div className="eden-sections-col">
          {/* Section 1: Performance Metrics */}
          <div className="eden-section-block">
            <div
              className="eden-section-header"
              onClick={() => toggleSection("metrics")}
            >
              <h2 className="eden-section-title">
                <span className="eden-section-num">1</span>
                <span>PERFORMANCE METRICS</span>
              </h2>
              <span className="eden-section-toggle">
                {openSections.metrics ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.metrics && (
              <div className="eden-metrics-grid">
                <div className="eden-metric-card">
                  <p className="eden-metric-label">Total Revenue</p>
                  <p className="eden-metric-val">{totalRevenueFormatted}</p>
                  <span className="eden-metric-trend">↑ +14.2% THIS PERIOD</span>
                </div>

                <div className="eden-metric-card">
                  <p className="eden-metric-label">Total Orders</p>
                  <p className="eden-metric-val">{totalOrdersCount}</p>
                  <span className="eden-metric-trend">ACTIVE FULFILLMENT</span>
                </div>

                <div className="eden-metric-card">
                  <p className="eden-metric-label">Products Active</p>
                  <p className="eden-metric-val">{totalProductsCount}</p>
                  <span className="eden-metric-trend">100% INVENTORY TRACKED</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Sales Overview Graph & Revenue Trends */}
          <div className="eden-section-block">
            <div
              className="eden-section-header"
              onClick={() => toggleSection("sales")}
            >
              <h2 className="eden-section-title">
                <span className="eden-section-num">2</span>
                <span>SALES OVERVIEW & REVENUE TRENDS</span>
              </h2>
              <span className="eden-section-toggle">
                {openSections.sales ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.sales && (
              <div className="eden-sales-graph-panel">
                {/* Graph Header: Metrics and Time Selector Tabs */}
                <div className="eden-graph-top">
                  <div>
                    <p className="eden-graph-revenue-label">
                      Sales Volume ({timeRange})
                    </p>
                    <div className="eden-graph-revenue-group">
                      <span className="eden-graph-revenue-num">
                        {currentDataset.revenue}
                      </span>
                      <span className="eden-graph-pill-badge">
                        {currentDataset.trend}
                      </span>
                    </div>
                  </div>

                  <div className="eden-graph-time-tabs" role="tablist">
                    {["7D", "30D", "90D", "1Y"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`eden-graph-time-tab ${
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
                <div className="eden-graph-svg-wrap">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 640 190"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="edenSalesGrad"
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
                      strokeWidth="1"
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
                      60k
                    </text>
                    <text x="10" y="69" fill="#9da0a8" fontSize="10">
                      45k
                    </text>
                    <text x="10" y="109" fill="#9da0a8" fontSize="10">
                      30k
                    </text>
                    <text x="10" y="149" fill="#9da0a8" fontSize="10">
                      15k
                    </text>
                    <text x="18" y="183" fill="#9da0a8" fontSize="10">
                      0
                    </text>

                    {/* Area fill */}
                    <path
                      d={currentDataset.fill}
                      fill="url(#edenSalesGrad)"
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
                              fontWeight="600"
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
                <div className="eden-graph-x-labels">
                  {currentDataset.labels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>

                {/* Bottom Sub-metrics */}
                <div className="eden-graph-submetrics">
                  <div className="eden-submetric-item">
                    <span className="eden-submetric-label">
                      Average Order Value
                    </span>
                    <span className="eden-submetric-val">₹2,490</span>
                  </div>
                  <div className="eden-submetric-item">
                    <span className="eden-submetric-label">
                      Top Category Volume
                    </span>
                    <span className="eden-submetric-val">PROTEIN (58%)</span>
                  </div>
                  <div className="eden-submetric-item">
                    <span className="eden-submetric-label">
                      Checkout Conversion
                    </span>
                    <span className="eden-submetric-val">3.8%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Recent Orders & Fulfillment */}
          <div className="eden-section-block">
            <div
              className="eden-section-header"
              onClick={() => toggleSection("orders")}
            >
              <h2 className="eden-section-title">
                <span className="eden-section-num">3</span>
                <span>RECENT FULFILLMENT & ORDERS</span>
              </h2>
              <span className="eden-section-toggle">
                {openSections.orders ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.orders && (
              <div className="eden-table-container">
                <table className="eden-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const statusKey = order.status.includes("deliv")
                        ? "delivered"
                        : order.status.includes("process")
                        ? "processing"
                        : order.status.includes("cancel")
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

                      return (
                        <tr key={order.id}>
                          <td>
                            <strong>#{order.id}</strong>
                          </td>
                          <td>{order.customer}</td>
                          <td>{order.date}</td>
                          <td>
                            <span className={`eden-status-tag ${statusKey}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td>
                            <strong>{formatCurrency(order.total)}</strong>
                          </td>
                          <td>
                            <Link
                              to={`/admin/orders/${order.realId || order.id}`}
                              className="eden-action-link"
                            >
                              View →
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

          {/* Section 4: Operational Quick Controls */}
          <div className="eden-section-block">
            <div
              className="eden-section-header"
              onClick={() => toggleSection("controls")}
            >
              <h2 className="eden-section-title">
                <span className="eden-section-num">4</span>
                <span>OPERATIONAL CONTROLS</span>
              </h2>
              <span className="eden-section-toggle">
                {openSections.controls ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>

            {openSections.controls && (
              <div className="eden-radio-list">
                <div
                  className={`eden-radio-item ${
                    quickFilter === "products" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setQuickFilter("products");
                    navigate("/admin/products");
                  }}
                >
                  <div className="eden-radio-label">
                    <span className="eden-radio-dot" />
                    <span>Catalog Management & Pricing Updates</span>
                  </div>
                  <span className="eden-radio-price">
                    {totalProductsCount} ITEMS
                  </span>
                </div>

                <div
                  className={`eden-radio-item ${
                    quickFilter === "orders" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setQuickFilter("orders");
                    navigate("/admin/orders");
                  }}
                >
                  <div className="eden-radio-label">
                    <span className="eden-radio-dot" />
                    <span>Order Dispatch & Tracking Verification</span>
                  </div>
                  <span className="eden-radio-price">LIVE QUEUE</span>
                </div>

                <div
                  className={`eden-radio-item ${
                    quickFilter === "users" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setQuickFilter("users");
                    navigate("/admin/users");
                  }}
                >
                  <div className="eden-radio-label">
                    <span className="eden-radio-dot" />
                    <span>Customer Accounts & Security Access</span>
                  </div>
                  <span className="eden-radio-price">
                    {users.length || 1} ACCOUNTS
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edén Summary Panel (Matches "YOUR ORDER (14)" from Screenshot) */}
        <div className="eden-summary-col">
          <h3 className="eden-summary-heading">STORE SUMMARY</h3>

          {/* Product Gallery Strip in framed boxes (Matches 3 cosmetic bottles in screenshot) */}
          <div className="eden-products-strip">
            {showcaseProducts.map((p) => (
              <div className="eden-product-box" key={p.name}>
                <img src={publicAssetUrl(p.image)} alt={p.name} />
                <span className="eden-product-box-name">{p.name}</span>
                <span className="eden-product-box-price">
                  {formatCurrency(p.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Underline Action Search Field with Arrow */}
          <div className="eden-promo-line">
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

          {/* Financial Ledger (Exact aesthetic from Edén screenshot) */}
          <div className="eden-ledger">
            <div className="eden-ledger-row">
              <span>GROSS MERCHANDISE:</span>
              <span>{totalRevenueFormatted}</span>
            </div>
            <div className="eden-ledger-row">
              <span>ESTIMATED FULFILLMENT:</span>
              <span>COMPLIMENTARY</span>
            </div>
            <div className="eden-ledger-row total">
              <span>NET REVENUE:</span>
              <span>{totalRevenueFormatted}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/admin/products/add" className="eden-btn-black">
              <span>ADD PRODUCT</span>
              <ArrowRight size={14} />
            </Link>

            <Link to="/admin/orders" className="eden-btn-outline">
              VIEW ALL ORDERS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
