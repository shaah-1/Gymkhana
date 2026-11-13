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
    navigate("/login", { replace: true, state: { message: "See you soon." } });
  };

  return (
    <div className="admin-layout" style={{ display: "block" }}>
      {/* Top Clean White Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand-row">
            <span className="admin-brand-sub">
              Store Operations
            </span>

            <NavLink to="/admin" className="admin-brand-title">
              Gymkhana
            </NavLink>

            <div className="admin-topbar-actions">
              <button
                type="button"
                onClick={handleLogout}
                className="admin-topbar-link"
              >
                Logout
              </button>
            </div>
          </div>

          <nav className="admin-nav-links" aria-label="Admin Navigation">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? "admin-nav-item active" : "admin-nav-item"
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                isActive ? "admin-nav-item active" : "admin-nav-item"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? "admin-nav-item active" : "admin-nav-item"
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                isActive ? "admin-nav-item active" : "admin-nav-item"
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                isActive ? "admin-nav-item active" : "admin-nav-item"
              }
            >
              Profile
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
