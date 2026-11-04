import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  UserRound,
} from "lucide-react";
import { adminLogout } from "../store/slices/adminAuthSlice";
import { logout } from "../../redux/authSlice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

function AdminSidebar({ isOpen = false, onClose = () => {} }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(adminLogout());
    dispatch(logout());
    navigate("/login", { replace: true, state: { message: "Logged out successfully." } });
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
      {/* Brand */}
      <div className="admin-sidebar-brand">GYMKHANA</div>

      {/* Main Nav Items */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <NavLink
          to="/admin/profile"
          onClick={onClose}
          className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}
        >
          <UserRound size={17} strokeWidth={1.8} />
          <span>Profile</span>
        </NavLink>

        <div className="admin-sidebar-divider" />

        <NavLink
          to="/admin#settings"
          onClick={onClose}
          className="admin-nav-link"
        >
          <Settings size={17} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Bottom Promo Card */}
      <div className="admin-sidebar-promo-card">
        <div className="admin-promo-thumb">
          <img
            src={publicAssetUrl("/images/admin-dumbbell.jpg")}
            alt="Gymkhana training"
            loading="lazy"
          />
        </div>
        <div>
          <p className="admin-promo-title">Stronger Together</p>
          <p className="admin-promo-sub">GYMKHANA Admin Panel</p>
          <div className="admin-promo-bar" />
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
