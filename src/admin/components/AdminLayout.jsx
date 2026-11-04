import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../store/slices/adminAuthSlice";
import { logout } from "../../redux/authSlice";
import "../admin.css";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(adminLogout());
    dispatch(logout());
    navigate("/login", { replace: true, state: { message: "Logged out successfully." } });
  };

  return (
    <div className="admin-layout" style={{ display: "block" }}>
      {/* Top Clean White Navigation Bar */}
      <header className="eden-topbar">
        <div className="eden-topbar-inner">
          <div className="eden-brand-row">
            <span
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.22em",
                color: "#71737d",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Store Operations
            </span>

            <NavLink to="/admin" className="eden-brand-title">
              Gymkhana
            </NavLink>

            <div className="eden-topbar-actions">
              <button
                type="button"
                onClick={handleLogout}
                className="eden-topbar-link"
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="eden-nav-links" aria-label="Admin Navigation">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? "eden-nav-item active" : "eden-nav-item"
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                isActive ? "eden-nav-item active" : "eden-nav-item"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? "eden-nav-item active" : "eden-nav-item"
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                isActive ? "eden-nav-item active" : "eden-nav-item"
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => isActive ? "eden-nav-item active" : "eden-nav-item"}
            >
              Profile
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="eden-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
