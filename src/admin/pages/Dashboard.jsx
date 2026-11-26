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
import {
  adminBreadcrumbLinkClass,
  adminBreadcrumbsClass,
  adminBtnBlackClass,
  adminBtnOutlineClass,
  adminErrorNoticeClass,
  adminNumClass,
  adminPageTitleClass,
  adminStatusTagClass,
  adminTableClass,
  adminTableContainerClass,
  adminTdClass,
  adminThClass,
} from "../adminClasses";

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

const sectionBlockClass = "border-b border-[#e6e6e9] pb-[30px] last:border-b-0";
const sectionHeaderClass =
  "mb-5 flex cursor-pointer items-center justify-between select-none max-[480px]:mb-[14px] max-[480px]:px-3 max-[480px]:py-[10px]";
const sectionTitleClass =
  "m-0 flex items-center gap-[10px] text-xs font-bold tracking-[0.16em] text-[#121214] uppercase max-[480px]:gap-2 max-[480px]:text-[10.5px]";
const sectionNumClass =
  "text-[13px] font-light tracking-[0.02em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums";
const metricCardClass =
  "flex flex-col gap-2 border border-[#e6e6e9] bg-white p-5 transition-all duration-150 hover:border-[#b5b7bc] max-[480px]:gap-[5px] max-[480px]:px-2 max-[480px]:py-[10px] max-[380px]:px-[6px] max-[380px]:py-2";
const metricLabelClass =
  "m-0 text-[10.5px] font-semibold tracking-[0.16em] text-[#7b7e86] uppercase max-[480px]:text-[8px] max-[480px]:tracking-[0.1em]";
const metricValClass =
  "m-0 text-[26px] leading-[1.1] font-light tracking-[-0.01em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums max-[480px]:text-[18px] max-[380px]:text-base";
const metricTrendClass =
  "flex items-center gap-1 text-[11px] font-light tracking-[0.03em] text-[#44464c] uppercase [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums max-[480px]:text-[7px]";

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

  const recentOrders = [...orders]
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

  const showcaseProducts = products.slice(0, 3);

  const controlItems = [
    {
      key: "products",
      to: "/admin/products",
      label: "Catalog Management & Pricing Updates",
      right: `${totalProductsCount} ITEMS (${totalUnitsInStock} UNITS)`,
    },
    {
      key: "orders",
      to: "/admin/orders",
      label: "Order Dispatch & Tracking Verification",
      right: "LIVE QUEUE",
    },
    {
      key: "users",
      to: "/admin/users",
      label: "Customer Accounts & Security Access",
      right: `${users.length} ACCOUNTS`,
    },
  ];

  return (
    <section>
      {dataErrors.map((error) => (
        <div className={adminErrorNoticeClass} key={error}>
          {error}
        </div>
      ))}
      {/* Breadcrumbs matching Admin aesthetic */}
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className="font-medium text-[#121214]">Overview</span>
      </div>

      {/* Main Luxury Display Title */}
      <h1 className={`${adminPageTitleClass} mb-9 max-[768px]:mb-6`}>OVERVIEW</h1>

      {/* 2-Column Luxury Layout */}
      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] items-start gap-[clamp(36px,5vw,72px)] max-[1200px]:gap-9 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        {/* Left Column: Numbered Sections */}
        <div className="flex flex-col gap-8">
          {/* Section 1: Performance Metrics */}
          <div className={sectionBlockClass}>
            <div className={sectionHeaderClass} onClick={() => toggleSection("metrics")}>
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>1</span>
                <span>PERFORMANCE METRICS</span>
              </h2>
              <span className="text-sm text-[#717379]">
                {openSections.metrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>

            {openSections.metrics && (
              <div className="mb-6 grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[900px]:gap-[14px] max-[480px]:grid-cols-2 max-[480px]:gap-2 max-[380px]:gap-[6px]">
                <div className={metricCardClass}>
                  <p className={metricLabelClass}>Order value (excl. cancelled)</p>
                  <p className={metricValClass}>
                    <AdminPrice amount={totalRevenue} />
                  </p>
                  <span className={metricTrendClass}>ALL RECORDED ORDERS</span>
                </div>

                <div className={metricCardClass}>
                  <p className={metricLabelClass}>Total Orders</p>
                  <p className={metricValClass}>{totalOrdersCount}</p>
                  <span className={metricTrendClass}>ORDERS ON RECORD</span>
                </div>

                <div className={metricCardClass}>
                  <p className={metricLabelClass}>Products Active</p>
                  <p className={metricValClass}>{totalProductsCount}</p>
                  <span className={metricTrendClass}>100% INVENTORY TRACKED</span>
                </div>

                <div
                  className={`${metricCardClass} cursor-pointer`}
                  onClick={() => navigate("/admin/products")}
                  title="View full inventory in Catalog"
                >
                  <p className={metricLabelClass}>Inventory Status</p>
                  <p className={metricValClass}>
                    {totalUnitsInStock}{" "}
                    <span className="text-[13px] font-normal tracking-[0.04em] text-[#6f7177]">
                      UNITS
                    </span>
                  </p>
                  <div className="mt-[3px] flex flex-wrap items-center gap-[5px]">
                    <span className={adminStatusTagClass("delivered")}>
                      <strong className="inline-block min-w-max shrink-0 text-[10.5px] font-light tracking-[0.02em] text-inherit">
                        {inStockCount}
                      </strong>{" "}
                      IN STOCK
                    </span>
                    {lowStockCount > 0 && (
                      <span className={adminStatusTagClass("pending")}>
                        <strong className="inline-block min-w-max shrink-0 text-[10.5px] font-light tracking-[0.02em] text-inherit">
                          {lowStockCount}
                        </strong>{" "}
                        LOW
                      </span>
                    )}
                    {outOfStockCount > 0 && (
                      <span className={adminStatusTagClass("cancelled")}>
                        <strong className="inline-block min-w-max shrink-0 text-[10.5px] font-light tracking-[0.02em] text-inherit">
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
          <div className={sectionBlockClass}>
            <div className={sectionHeaderClass} onClick={() => toggleSection("sales")}>
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>2</span>
                <span>SALES OVERVIEW &amp; REVENUE TRENDS</span>
              </h2>
              <span className="text-sm text-[#717379]">
                {openSections.sales ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>

            {openSections.sales && (
              <div className="relative flex flex-col border border-[#e6e6e9] bg-white px-[26px] pt-6 pb-5 max-[640px]:px-3 max-[640px]:pt-4 max-[640px]:pb-[14px]">
                {/* Graph Header: Metrics and Time Selector Tabs */}
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3">
                  <div>
                    <p className="m-0 mb-1 text-[10.5px] font-bold tracking-[0.16em] text-[#7b7e86] uppercase">
                      Order value ({timeRange})
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[26px] leading-none font-light tracking-[-0.01em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums max-[640px]:text-[22px] max-[480px]:text-xl">
                        <AdminPrice amount={currentDataset.revenue} />
                      </span>
                      <span className="rounded-[2px] border border-[#c2e2cb] bg-[#f1f8f3] px-[7px] py-[2px] text-[10px] font-semibold tracking-[0.1em] text-[#204b2b] uppercase">
                        {currentDataset.trend}
                      </span>
                    </div>
                  </div>

                  <div
                    className="inline-flex gap-[2px] border border-[#e6e6e9] bg-[#f4f4f6] p-[2px] max-[640px]:flex max-[640px]:w-full max-[640px]:justify-between"
                    role="tablist"
                  >
                    {["7D", "30D", "90D", "1Y"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`cursor-pointer border-0 px-3 py-[5px] font-inherit text-[10.5px] font-semibold tracking-[0.14em] uppercase transition-all duration-150 max-[640px]:flex-1 max-[640px]:px-1 max-[640px]:py-[6px] max-[640px]:text-center max-[640px]:text-[10px] ${
                          timeRange === tab
                            ? "bg-[#121214] text-white"
                            : "bg-transparent text-[#6e7178] hover:text-[#121214]"
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
                <div className="relative mt-1 h-[210px] w-full max-[640px]:h-[150px] [&_svg_text]:tabular-nums">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 640 190"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="adminSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#121214" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#121214" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Hairlines */}
                    <line x1="45" y1="25" x2="630" y2="25" stroke="#f0f0f3" strokeWidth="1" />
                    <line x1="45" y1="65" x2="630" y2="65" stroke="#f0f0f3" strokeWidth="1" />
                    <line x1="45" y1="105" x2="630" y2="105" stroke="#f0f0f3" strokeWidth="1" />
                    <line x1="45" y1="145" x2="630" y2="145" stroke="#f0f0f3" strokeWidth="1" />
                    <line x1="45" y1="180" x2="630" y2="180" stroke="#e5e5e8" strokeWidth="1" />

                    {/* Y Axis Legend */}
                    <text x="10" y="29" className="fill-[#8e9096] text-[10px] font-normal">
                      {currentDataset.axisLabels[0]}
                    </text>
                    <text x="10" y="69" className="fill-[#8e9096] text-[10px] font-normal">
                      {currentDataset.axisLabels[1]}
                    </text>
                    <text x="10" y="109" className="fill-[#8e9096] text-[10px] font-normal">
                      {currentDataset.axisLabels[2]}
                    </text>
                    <text x="10" y="149" className="fill-[#8e9096] text-[10px] font-normal">
                      {currentDataset.axisLabels[3]}
                    </text>
                    <text x="18" y="183" className="fill-[#8e9096] text-[10px] font-normal">
                      {currentDataset.axisLabels[4]}
                    </text>

                    {/* Area fill */}
                    <path d={currentDataset.fill} fill="url(#adminSalesGrad)" />

                    {/* Line Stroke */}
                    <path
                      d={currentDataset.path}
                      stroke="#121214"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Data Node Points & Sales Value Labels */}
                    {currentDataset.points.map((pt, idx) => {
                      const isPointActive = activePoint?.date === pt.date;
                      const tooltipWidth = 84;
                      const tooltipHeight = 24;
                      const isHigh = pt.y < 45;
                      const tooltipY = isHigh ? pt.y + 10 : pt.y - 34;
                      const tooltipX = Math.max(
                        8,
                        Math.min(640 - tooltipWidth - 8, pt.x - tooltipWidth / 2)
                      );

                      return (
                        <g key={idx}>
                          {/* Always-visible sales value number above point */}
                          <text
                            x={pt.x}
                            y={pt.y < 35 ? pt.y + 18 : pt.y - 10}
                            textAnchor="middle"
                            className={`pointer-events-none fill-[#121214] text-[10.5px] tracking-[0.01em] transition-opacity duration-150 ${
                              isPointActive ? "font-semibold opacity-0" : "font-medium opacity-100"
                            }`}
                          >
                            {pt.val}
                          </text>

                          {/* Generous invisible hover target */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="16"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setActivePoint(pt)}
                            onMouseLeave={() => setActivePoint(null)}
                          />

                          {/* Visible point circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isPointActive ? "5.5" : "3.5"}
                            fill="#ffffff"
                            stroke="#121214"
                            strokeWidth="2"
                            className="pointer-events-none transition-all duration-150"
                          />

                          {/* High-contrast tooltip on hover */}
                          {isPointActive && (
                            <g pointerEvents="none">
                              <rect
                                x={tooltipX}
                                y={tooltipY}
                                width={tooltipWidth}
                                height={tooltipHeight}
                                rx="3"
                                className="fill-[#121214]"
                              />
                              <text
                                x={tooltipX + tooltipWidth / 2}
                                y={tooltipY + 16}
                                textAnchor="middle"
                                className="fill-white text-[11px] font-semibold tracking-[0.02em]"
                              >
                                {pt.val}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X Axis Date Labels */}
                <div className="flex justify-between pt-2 pr-[10px] pl-[46px] text-[10.5px] font-light tracking-[0.04em] text-[#55575e] uppercase tabular-nums max-[480px]:overflow-hidden max-[480px]:pt-[6px] max-[480px]:pr-0 max-[480px]:pl-4 max-[480px]:text-[8px]">
                  {currentDataset.labels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>

                {/* Bottom Sub-metrics */}
                <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[#e6e6e9] pt-4 max-[640px]:mt-[14px] max-[640px]:grid-cols-1 max-[640px]:gap-2 max-[640px]:pt-3">
                  <div className="flex flex-col gap-[3px] max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between max-[640px]:border-b max-[640px]:border-[#f2f2f5] max-[640px]:py-[5px]">
                    <span className="text-[9.5px] font-bold tracking-[0.14em] text-[#8c8f96] uppercase">
                      Average Order Value
                    </span>
                    <span className="text-[13.5px] font-light tracking-[0.01em] text-[#121214] tabular-nums">
                      <AdminPrice amount={currentDataset.averageOrderValue} />
                    </span>
                  </div>
                  <div className="flex flex-col gap-[3px] max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between max-[640px]:border-b max-[640px]:border-[#f2f2f5] max-[640px]:py-[5px]">
                    <span className="text-[9.5px] font-bold tracking-[0.14em] text-[#8c8f96] uppercase">
                      Orders in period
                    </span>
                    <span className="text-[13.5px] font-light tracking-[0.01em] text-[#121214] tabular-nums">
                      {currentDataset.orderCount}
                    </span>
                  </div>
                  <div className="flex flex-col gap-[3px] max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between max-[640px]:py-[5px]">
                    <span className="text-[9.5px] font-bold tracking-[0.14em] text-[#8c8f96] uppercase">
                      Cancelled orders
                    </span>
                    <span className="text-[13.5px] font-light tracking-[0.01em] text-[#121214] tabular-nums">
                      {
                        orders.filter(
                          (order) => String(order.status).toLowerCase() === "cancelled"
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Recent Orders & Fulfillment */}
          <div className={sectionBlockClass}>
            <div className={sectionHeaderClass} onClick={() => toggleSection("orders")}>
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>3</span>
                <span>RECENT FULFILLMENT &amp; ORDERS</span>
              </h2>
              <span className="text-sm text-[#717379]">
                {openSections.orders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>

            {openSections.orders && (
              <div className={adminTableContainerClass}>
                <table className={adminTableClass}>
                  <thead>
                    <tr>
                      <th className={adminThClass}>Order ID</th>
                      <th className={adminThClass}>Customer</th>
                      <th className={adminThClass}>Date</th>
                      <th className={adminThClass}>Status</th>
                      <th className={adminThClass}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className={adminTdClass}>
                          No orders yet.
                        </td>
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
                          className="group/row cursor-pointer transition-colors duration-150 hover:bg-[#f2f2f5]"
                          title={`Click to open order #${order.id}`}
                        >
                          <td className={adminTdClass}>
                            <strong className={`${adminNumClass} group-hover/row:underline`}>
                              #{order.id}
                            </strong>
                          </td>
                          <td className={adminTdClass}>{order.customer}</td>
                          <td className={adminTdClass}>{order.date}</td>
                          <td className={adminTdClass}>
                            <span className={adminStatusTagClass(statusKey)}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className={adminTdClass}>
                            <strong className={adminNumClass}>
                              <AdminPrice amount={order.total} />
                            </strong>
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
          <div className={sectionBlockClass}>
            <div className={sectionHeaderClass} onClick={() => toggleSection("controls")}>
              <h2 className={sectionTitleClass}>
                <span className={sectionNumClass}>4</span>
                <span>OPERATIONAL CONTROLS</span>
              </h2>
              <span className="text-sm text-[#717379]">
                {openSections.controls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>

            {openSections.controls && (
              <div className="mt-2 flex flex-col gap-[14px]">
                {controlItems.map((item) => {
                  const isSelected = quickFilter === item.key;
                  return (
                    <div
                      key={item.key}
                      className={`flex cursor-pointer items-center justify-between rounded-[4px] border bg-white px-[14px] py-3 transition-colors duration-150 hover:border-[#121214] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-[6px] max-[640px]:px-[10px] max-[640px]:py-3 ${
                        isSelected ? "border-[#121214]" : "border-[#e6e6e9]"
                      }`}
                      onClick={() => {
                        setQuickFilter(item.key);
                        navigate(item.to);
                      }}
                    >
                      <div className="flex items-center gap-3 text-xs font-medium text-[#121214]">
                        <span
                          className={`grid h-[14px] w-[14px] place-items-center rounded-full border ${
                            isSelected
                              ? "border-[#121214] after:h-[6px] after:w-[6px] after:rounded-full after:bg-[#121214] after:content-['']"
                              : "border-[#8e9198]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[12.5px] font-light tracking-[0.02em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums max-[640px]:pl-[26px] max-[640px]:text-[11px]">
                        {item.right}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Admin Summary Panel */}
        <div className="sticky top-[136px] border border-[#e6e6e9] bg-white p-[clamp(24px,3.5vw,36px)] max-[900px]:static max-[640px]:px-[14px] max-[640px]:py-5">
          <h3 className="m-0 mb-6 border-b border-[#e6e6e9] pb-4 text-xs font-bold tracking-[0.18em] text-[#121214] uppercase">
            STORE SUMMARY
          </h3>

          {/* Product Gallery Strip in framed boxes */}
          <div className="mb-6 grid grid-cols-3 gap-3 max-[640px]:mb-[18px] max-[640px]:gap-2">
            {showcaseProducts.length === 0 && (
              <p className="col-span-full text-xs text-[#6f7177]">
                No products have been added yet.
              </p>
            )}
            {showcaseProducts.map((p) => (
              <div
                className="box-border flex aspect-[1/1.15] flex-col items-center justify-center border border-[#eeeeef] bg-[#f5f5f7] p-[10px] text-center transition-colors duration-150 hover:border-[#c9cace] max-[640px]:aspect-[1/1.1] max-[640px]:p-[6px]"
                key={p.name}
              >
                <img
                  src={publicAssetUrl(p.image)}
                  alt={p.name}
                  className="mb-[6px] max-h-[70px] max-w-[80%] object-contain max-[640px]:max-h-[52px]"
                />
                <span className="w-full overflow-hidden text-[10px] font-medium text-ellipsis whitespace-nowrap text-[#3b3d42] max-[640px]:text-[9px]">
                  {p.name}
                </span>
                <span className="mt-[2px] text-xs font-light tracking-[0.02em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums max-[640px]:text-[11px]">
                  <AdminPrice amount={p.price} />
                </span>
              </div>
            ))}
          </div>

          {/* Underline Action Search Field with Arrow */}
          <div className="mb-6 flex items-center justify-between border-b border-[#d4d5d9] py-[10px]">
            <input
              type="text"
              placeholder="Search product code or SKU..."
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate("/admin/products");
              }}
              className="w-full border-0 bg-transparent font-inherit text-xs text-[#121214] outline-none placeholder:text-[#8c8f96]"
            />
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              aria-label="Search"
              className="cursor-pointer border-0 bg-transparent px-1 text-sm text-[#121214]"
            >
              →
            </button>
          </div>

          {/* Financial Ledger */}
          <div className="mb-7 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11.5px] font-light tracking-[0.04em] text-[#6e7178] uppercase [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums">
              <span>GROSS ORDER VALUE:</span>
              <span>
                <AdminPrice amount={totalRevenue} />
              </span>
            </div>
            <div className="flex items-center justify-between text-[11.5px] font-light tracking-[0.04em] text-[#6e7178] uppercase [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums">
              <span>ESTIMATED FULFILLMENT:</span>
              <span>COMPLIMENTARY</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e6e6e9] pt-[14px] text-[15px] font-normal tracking-[0.02em] text-[#121214] uppercase [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums">
              <span>TOTAL ORDER VALUE:</span>
              <span>
                <AdminPrice amount={totalRevenue} />
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-3">
            <Link to="/admin/products/add" className={adminBtnBlackClass}>
              <span>ADD PRODUCT</span>
              <ArrowRight size={14} />
            </Link>

            <Link to="/admin/orders" className={adminBtnOutlineClass}>
              VIEW ALL ORDERS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
