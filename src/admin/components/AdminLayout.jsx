import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../store/slices/adminAuthSlice";
import { logout } from "../../redux/authSlice";
import { signOutUser } from "../../services/authService";

const navItems = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/profile", label: "Profile" },
];

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Could not sign out:", error);
      return;
    }
    dispatch(adminLogout());
    dispatch(logout());
    navigate("/login", { replace: true, state: { message: "See you soon." } });
  };

  return (
    <div
      data-admin-layout="true"
      className="block min-h-screen bg-[#fbfbfb] pt-[116px] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[#121214] antialiased max-[768px]:pt-[96px] max-[480px]:pt-[90px]"
    >
      {/* Top Clean White Navigation Bar */}
      <header className="fixed inset-x-0 top-0 z-[900] box-border h-[116px] w-full border-b border-[#e6e6e9] bg-white px-[clamp(24px,5vw,64px)] text-[#121214] shadow-[0_2px_6px_rgba(0,0,0,0.04)] max-[768px]:h-auto max-[768px]:min-h-[96px] max-[768px]:px-4 max-[768px]:pt-3 max-[768px]:pb-2 max-[480px]:min-h-[90px] max-[480px]:px-[14px] max-[480px]:pt-[10px] max-[480px]:pb-[6px] max-[380px]:min-h-[84px] max-[380px]:px-[10px] max-[380px]:pt-2 max-[380px]:pb-[5px]">
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-center justify-center gap-[14px] max-[768px]:h-auto max-[768px]:items-stretch max-[768px]:justify-start max-[768px]:gap-2 max-[480px]:gap-[6px]">
          <div className="static flex w-full items-center justify-center max-[768px]:relative max-[768px]:min-h-7 max-[768px]:justify-between">
            <span className="absolute top-1/2 left-0 z-[2] m-0 -translate-y-1/2 p-0 text-[11.5px] leading-none font-semibold tracking-[0.22em] whitespace-nowrap text-[#71737d] uppercase max-[768px]:hidden">
              Store Operations
            </span>

            <NavLink
              to="/admin"
              className="m-0 inline-block p-0 text-center font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-base leading-none font-light tracking-[0.32em] whitespace-nowrap text-[#121214] uppercase no-underline max-[768px]:static max-[768px]:text-left max-[768px]:text-[14.5px] max-[768px]:font-medium max-[768px]:tracking-[0.22em] max-[480px]:text-[13.5px] max-[480px]:tracking-[0.2em] max-[380px]:text-xs max-[380px]:tracking-[0.16em]"
            >
              Gymkhana
            </NavLink>

            <div className="absolute top-1/2 right-0 z-[2] m-0 flex -translate-y-1/2 items-center gap-5 p-0 leading-none max-[768px]:static max-[768px]:translate-y-0">
              <button
                type="button"
                onClick={handleLogout}
                className="m-0 inline-flex cursor-pointer items-center gap-[6px] border-0 bg-transparent p-0 font-inherit text-xs leading-none font-semibold tracking-[0.16em] text-[#71737d] uppercase no-underline transition-colors duration-150 hover:text-[#121214] max-[768px]:rounded-[2px] max-[768px]:bg-[#f4f4f6] max-[768px]:px-[10px] max-[768px]:py-[5px] max-[768px]:text-[10.5px] max-[768px]:tracking-[0.12em] max-[768px]:text-[#4b4d53] max-[768px]:hover:bg-[#121214] max-[768px]:hover:text-white max-[380px]:px-[6px] max-[380px]:py-[3px] max-[380px]:text-[9px]"
              >
                Logout
              </button>
            </div>
          </div>

          <nav
            className="flex items-center justify-center gap-[clamp(20px,3.2vw,42px)] pt-1 max-[900px]:gap-2 max-[768px]:-mx-4 max-[768px]:w-auto max-[768px]:justify-start max-[768px]:gap-[6px] max-[768px]:overflow-x-auto max-[768px]:px-4 max-[768px]:pt-[2px] max-[768px]:pb-[6px] max-[768px]:[scrollbar-width:none] max-[768px]:[&::-webkit-scrollbar]:hidden max-[480px]:-mx-[14px] max-[480px]:gap-[5px] max-[480px]:px-[14px] max-[480px]:pt-[2px] max-[480px]:pb-[6px]"
            aria-label="Admin Navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative px-[2px] py-1 pb-[6px] text-[12.5px] tracking-[0.2em] whitespace-nowrap uppercase no-underline transition-colors duration-150 max-[768px]:shrink-0 max-[768px]:rounded-full max-[768px]:px-3 max-[768px]:py-[5px] max-[768px]:text-[11px] max-[768px]:tracking-[0.1em] max-[480px]:px-[10px] max-[480px]:py-[5px] max-[480px]:text-[10.5px] max-[380px]:px-[7px] max-[380px]:py-[3px] max-[380px]:text-[9px] ${
                    isActive
                      ? "font-bold text-[#121214] after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:bg-[#121214] after:content-[''] max-[768px]:bg-[#121214] max-[768px]:font-semibold max-[768px]:text-white max-[768px]:after:hidden"
                      : "font-semibold text-[#71737d] hover:text-[#121214] max-[768px]:bg-[#f4f4f6] max-[768px]:text-[#6a6c72] max-[768px]:hover:bg-[#eaeaed] max-[768px]:hover:text-[#121214]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,40px)] pt-[clamp(28px,4vw,48px)] pb-20 max-[768px]:px-4 max-[768px]:pt-6 max-[768px]:pb-16 max-[640px]:px-[14px] max-[640px]:pt-5 max-[640px]:pb-[60px] max-[480px]:px-3 max-[480px]:pt-4 max-[480px]:pb-14">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
