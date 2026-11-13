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

  // Inventory Status calculations
  const totalUnitsInStock =
    products.length > 0
      ? products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0)
      : 284;

  const inStockCount =
    products.length > 0
      ? products.filter((p) => Number(p.stock ?? 0) > 5).length
      : 21;

  const lowStockCount =
    products.length > 0
      ? products.filter(
          (p) => Number(p.stock ?? 0) > 0 && Number(p.stock ?? 0) <= 5
        ).length
      : 2;

  const outOfStockCount =
    products.length > 0
      ? products.filter((p) => Number(p.stock ?? 0) <= 0).length
      : 1;

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

  // Top Showcase Products in Admin portrait framed boxes
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
                  <p className="admin-metric-label">Total Revenue</p>
                  <p className="admin-metric-val">
                    <AdminPrice amount={totalRevenue > 0 ? totalRevenue : 54950} />
                  </p>
                  <span className="admin-metric-trend">↑ +14.2% THIS PERIOD</span>
                </div>

                <div className="admin-metric-card">
                  <p className="admin-metric-label">Total Orders</p>
                  <p className="admin-metric-val">{totalOrdersCount}</p>
                  <span className="admin-metric-trend">ACTIVE FULFILLMENT</span>
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
                    <span
                      className="admin-status-tag delivered"
                      style={{ minWidth: "auto", padding: "2px 7px", fontSize: "9px" }}
                    >
                      <strong className="admin-stock-qty" style={{ fontSize: "9px" }}>
                        {inStockCount}
                      </strong>{" "}
                      IN STOCK
                    </span>
                    {lowStockCount > 0 && (
                      <span
                        className="admin-status-tag pending"
                        style={{ minWidth: "auto", padding: "2px 7px", fontSize: "9px" }}
                      >
                        <strong className="admin-stock-qty" style={{ fontSize: "9px" }}>
                          {lowStockCount}
                        </strong>{" "}
                        LOW
                      </span>
                    )}
                    {outOfStockCount > 0 && (
                      <span
                        className="admin-status-tag cancelled"
                        style={{ minWidth: "auto", padding: "2px 7px", fontSize: "9px" }}
                      >
                        <strong className="admin-stock-qty" style={{ fontSize: "9px" }}>
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
                      Sales Volume ({timeRange})
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
                      <AdminPrice amount={2490} />
                    </span>
                  </div>
                  <div className="admin-submetric-item">
                    <span className="admin-submetric-label">
                      Top Category Volume
                    </span>
                    <span className="admin-submetric-val">PROTEIN (58%)</span>
                  </div>
                  <div className="admin-submetric-item">
                    <span className="admin-submetric-label">
                      Checkout Conversion
                    </span>
                    <span className="admin-submetric-val">3.8%</span>
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
                    {users.length || 1} ACCOUNTS
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
              <span>GROSS MERCHANDISE:</span>
              <span>
                <AdminPrice amount={totalRevenue > 0 ? totalRevenue : 54950} />
              </span>
            </div>
            <div className="admin-ledger-row">
              <span>ESTIMATED FULFILLMENT:</span>
              <span>COMPLIMENTARY</span>
            </div>
            <div className="admin-ledger-row total">
              <span>NET REVENUE:</span>
              <span>
                <AdminPrice amount={totalRevenue > 0 ? totalRevenue : 54950} />
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
