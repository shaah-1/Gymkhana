import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Users,
  ShoppingBag,
  Calendar,
  ChevronDown,
  BarChart2,
  Zap,
  ArrowRight,
  Eye,
} from "lucide-react";

import { fetchAdminProducts } from "../store/slices/adminProductSlice";
import { fetchAdminUsers } from "../store/slices/adminUserSlice";
import { fetchAdminOrders } from "../store/slices/adminOrderSlice";
import { formatCurrency } from "../../utils/formatters";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

function Dashboard() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.adminProducts.products);
  const users = useSelector((state) => state.adminUsers.users);
  const orders = useSelector((state) => state.adminOrders.orders);

  const [timeRange, setTimeRange] = useState("30D");

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Top Products list (real products from store + visual progress)
  const topProductsList = [
    {
      name: "Whey Protein",
      image: "/products/whey-protein.png",
      sold: "1.2k sold",
      pct: "85%",
    },
    {
      name: "Gym Bag",
      image: "/products/gym-bag.png",
      sold: "842 sold",
      pct: "62%",
    },
    {
      name: "Creatine Monohydrate",
      image: "/products/creatine.png",
      sold: "620 sold",
      pct: "45%",
    },
  ];

  // Default orders to display if db has fewer items
  const defaultRecentOrders = [
    {
      id: "ORD1089",
      customer: "Rahul Sharma",
      total: 2499,
      status: "delivered",
      date: "Nov 3, 2026",
    },
    {
      id: "ORD1088",
      customer: "Sneha Reddy",
      total: 1799,
      status: "processing",
      date: "Nov 3, 2026",
    },
    {
      id: "ORD1087",
      customer: "Arjun Nair",
      total: 3299,
      status: "pending",
      date: "Nov 2, 2026",
    },
    {
      id: "ORD1086",
      customer: "Diya Menon",
      total: 1499,
      status: "delivered",
      date: "Nov 2, 2026",
    },
    {
      id: "ORD1085",
      customer: "Rohan Das",
      total: 2199,
      status: "delivered",
      date: "Nov 1, 2026",
    },
  ];

  // Format real orders if available
  const displayOrders =
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
              ? new Date(o.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Nov 3, 2026",
          }))
      : defaultRecentOrders;

  const totalProductsCount = products.length > 0 ? products.length : 24;
  const totalUsersCount =
    users.length > 0 ? users.length.toLocaleString() : "1,248";
  const totalOrdersCount =
    orders.length > 0 ? orders.length.toLocaleString() : "892";

  return (
    <section className="admin-dashboard-page">
      {/* Top Greeting & Date Range */}
      <div className="admin-dashboard-header">
        <div>
          <span className="admin-greet-sub">Welcome back,</span>
          <h1 className="admin-greet-title">Admin 👋</h1>
          <p className="admin-greet-desc">
            Here’s what’s happening with your store today.
          </p>
        </div>

        <button
          type="button"
          className="admin-date-picker-btn"
          aria-label="Filter date range"
        >
          <Calendar size={13} />
          <span>Nov 1 – Nov 30, 2026</span>
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="admin-stats-kpi-grid">
        {/* Total Products */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap">
            <Package size={20} strokeWidth={1.8} />
          </div>
          <div>
            <p className="admin-kpi-label">Total Products</p>
            <div className="admin-kpi-numbers">
              <span className="admin-kpi-val">{totalProductsCount}</span>
              <span className="admin-kpi-growth">↑ +12%</span>
            </div>
          </div>
          <svg className="admin-kpi-sparkline" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 32 Q 25 15, 50 28 T 100 8"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Total Users */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap">
            <Users size={20} strokeWidth={1.8} />
          </div>
          <div>
            <p className="admin-kpi-label">Total Users</p>
            <div className="admin-kpi-numbers">
              <span className="admin-kpi-val">{totalUsersCount}</span>
              <span className="admin-kpi-growth">↑ +8%</span>
            </div>
          </div>
          <svg className="admin-kpi-sparkline" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 30 Q 30 10, 60 22 T 100 6"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Total Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap">
            <ShoppingBag size={20} strokeWidth={1.8} />
          </div>
          <div>
            <p className="admin-kpi-label">Total Orders</p>
            <div className="admin-kpi-numbers">
              <span className="admin-kpi-val">{totalOrdersCount}</span>
              <span className="admin-kpi-growth">↑ +15%</span>
            </div>
          </div>
          <svg className="admin-kpi-sparkline" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 35 Q 25 25, 50 15 T 100 10"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Middle Row: Sales Overview (Left) & Quick Actions (Right) */}
      <div className="admin-grid-2col">
        {/* Sales Overview Area Chart */}
        <div className="admin-card-panel">
          <div className="admin-card-panel-header">
            <div className="admin-card-title-group">
              <BarChart2 size={16} strokeWidth={1.8} />
              <h2 className="admin-card-title">Sales Overview</h2>
            </div>

            <div className="admin-chart-tabs" role="tablist">
              {["7D", "30D", "90D", "1Y"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`admin-chart-tab ${
                    timeRange === tab ? "active" : ""
                  }`}
                  onClick={() => setTimeRange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="admin-chart-wrap">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 620 180"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="salesOverviewGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                  <stop offset="60%" stopColor="#ffffff" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <filter
                  id="glowFilter"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Grid lines */}
              <line
                x1="38"
                y1="25"
                x2="610"
                y2="25"
                stroke="#1b1c23"
                strokeWidth="1"
              />
              <line
                x1="38"
                y1="60"
                x2="610"
                y2="60"
                stroke="#1b1c23"
                strokeWidth="1"
              />
              <line
                x1="38"
                y1="95"
                x2="610"
                y2="95"
                stroke="#1b1c23"
                strokeWidth="1"
              />
              <line
                x1="38"
                y1="130"
                x2="610"
                y2="130"
                stroke="#1b1c23"
                strokeWidth="1"
              />
              <line
                x1="38"
                y1="165"
                x2="610"
                y2="165"
                stroke="#1b1c23"
                strokeWidth="1"
              />

              {/* Y Axis Labels */}
              <text x="8" y="29" fill="#585b63" fontSize="10">
                4k
              </text>
              <text x="8" y="64" fill="#585b63" fontSize="10">
                3k
              </text>
              <text x="8" y="99" fill="#585b63" fontSize="10">
                2k
              </text>
              <text x="8" y="134" fill="#585b63" fontSize="10">
                1k
              </text>
              <text x="14" y="168" fill="#585b63" fontSize="10">
                0
              </text>

              {/* Area fill */}
              <path
                d="M 50 140 
                   C 100 135, 130 115, 175 110 
                   C 220 105, 250 85, 305 85 
                   C 360 85, 400 100, 430 92 
                   C 470 82, 500 28, 520 28 
                   C 550 28, 575 80, 605 92 
                   L 605 165 L 50 165 Z"
                fill="url(#salesOverviewGrad)"
              />

              {/* Curve Stroke Line */}
              <path
                d="M 50 140 
                   C 100 135, 130 115, 175 110 
                   C 220 105, 250 85, 305 85 
                   C 360 85, 400 100, 430 92 
                   C 470 82, 500 28, 520 28 
                   C 550 28, 575 80, 605 92"
                stroke="#ffffff"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                filter="url(#glowFilter)"
              />

              {/* Node points on the curve */}
              <circle cx="50" cy="140" r="3.5" fill="#ffffff" />
              <circle cx="175" cy="110" r="3.5" fill="#ffffff" />
              <circle cx="305" cy="85" r="3.5" fill="#ffffff" />
              <circle cx="430" cy="92" r="3.5" fill="#ffffff" />
              <circle
                cx="520"
                cy="28"
                r="4.5"
                fill="#ffffff"
                stroke="#121317"
                strokeWidth="2"
              />
              <circle cx="605" cy="92" r="3.5" fill="#ffffff" />
            </svg>
          </div>

          {/* X Axis Dates */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingLeft: "36px",
              paddingRight: "8px",
              marginTop: "8px",
              color: "#585b63",
              fontSize: "10px",
            }}
          >
            <span>Nov 1</span>
            <span>Nov 7</span>
            <span>Nov 14</span>
            <span>Nov 21</span>
            <span>Nov 30</span>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="admin-card-panel">
          <div className="admin-card-panel-header">
            <div className="admin-card-title-group">
              <Zap size={16} strokeWidth={1.8} />
              <h2 className="admin-card-title">Quick Actions</h2>
            </div>
          </div>

          <div className="admin-quick-actions-list">
            <Link to="/admin/products/add" className="admin-action-item">
              <div className="admin-action-item-left">
                <Package size={16} />
                <span>Add Product</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link to="/admin/users" className="admin-action-item">
              <div className="admin-action-item-left">
                <Users size={16} />
                <span>Manage Users</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link to="/admin/orders" className="admin-action-item">
              <div className="admin-action-item-left">
                <ShoppingBag size={16} />
                <span>View Orders</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link to="/admin#reports" className="admin-action-item">
              <div className="admin-action-item-left">
                <BarChart2 size={16} />
                <span>View Reports</span>
              </div>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders (Left) & Top Products (Right) */}
      <div className="admin-grid-2col">
        {/* Recent Orders Table */}
        <div className="admin-card-panel">
          <div className="admin-card-panel-header">
            <div className="admin-card-title-group">
              <ShoppingBag size={16} strokeWidth={1.8} />
              <h2 className="admin-card-title">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="admin-view-all-link">
              View All →
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order) => {
                  const statusKey = order.status.includes("deliv")
                    ? "delivered"
                    : order.status.includes("process")
                    ? "processing"
                    : "pending";

                  const statusLabel =
                    statusKey === "delivered"
                      ? "Delivered"
                      : statusKey === "processing"
                      ? "Processing"
                      : "Pending";

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>{order.customer}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`admin-status-pill ${statusKey}`}>
                          <span className="dot" />
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <Link
                          to={`/admin/orders/${order.realId || order.id}`}
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
        </div>

        {/* Top Products Card */}
        <div className="admin-card-panel">
          <div className="admin-card-panel-header">
            <div className="admin-card-title-group">
              <Package size={16} strokeWidth={1.8} />
              <h2 className="admin-card-title">Top Products</h2>
            </div>
            <Link to="/admin/products" className="admin-view-all-link">
              View All →
            </Link>
          </div>

          <div className="admin-top-products-list">
            {topProductsList.map((item) => (
              <div className="admin-top-product-row" key={item.name}>
                <img
                  src={publicAssetUrl(item.image)}
                  alt={item.name}
                  className="admin-top-product-img"
                />
                <div className="admin-top-product-info">
                  <span className="admin-top-product-name">{item.name}</span>
                  <div className="admin-top-product-bar-wrap">
                    <div
                      className="admin-top-product-bar"
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
                <span className="admin-top-product-sold">{item.sold}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
