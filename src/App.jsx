import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import Toast from "./components/Toast";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute";

import { authInitialized, loginSuccess, logout } from "./redux/authSlice";
import { fetchCart } from "./redux/cartSlice";
import { fetchWishlist } from "./redux/wishlistSlice";
import { adminLogin, adminLogout } from "./admin/store/slices/adminAuthSlice";
import {
  getCurrentProfile,
  getUserById,
  signOutUser,
} from "./services/authService";
import { isSupabaseConfigured, supabase } from "./services/supabase";

import Home from "./pages/shop/Home";
import Shop from "./pages/shop/Shop";
import ProductDetails from "./pages/shop/ProductDetails";
import Cart from "./pages/shop/Cart";
import Wishlist from "./pages/shop/Wishlist";
import Checkout from "./pages/shop/Checkout";
import Profile from "./pages/account/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Contact from "./pages/contact/Contact";
import About from "./pages/about/About";

import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AddProduct from "./admin/pages/AddProduct";
import EditProduct from "./admin/pages/EditProduct";
import AdminUsers from "./admin/pages/Users";
import AdminOrders from "./admin/pages/Orders";
import OrderDetails from "./admin/pages/OrderDetails";
import AdminProfile from "./admin/pages/AdminProfile";
import Categories from "./admin/pages/Categories.jsx"

import "./index.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth.userId);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/update-password",
  ].includes(location.pathname);

  const toastMessage = location.state?.message || "";

  useEffect(() => {
    let active = true;
    let sessionVersion = 0;

    const clearSession = () => {
      sessionVersion += 1;
      dispatch(logout());
      dispatch(adminLogout());
      dispatch(authInitialized());
    };

    const restoreSession = async (session) => {
      const version = ++sessionVersion;
      if (!session) {
        clearSession();
        return;
      }

      try {
        const profile = await getCurrentProfile(session.user.id);
        if (!active || version !== sessionVersion) return;
        if (profile.blocked) {
          await signOutUser();
          clearSession();
          navigate("/login", {
            replace: true,
            state: {
              error: "Your account has been suspended by an administrator.",
              message: "Your account has been suspended by an administrator.",
            },
          });
          return;
        }

        dispatch(logout());
        dispatch(adminLogout());
        if (profile.role === "admin") {
          const admin = { ...profile, email: session.user.email };
          dispatch(loginSuccess(admin));
          dispatch(adminLogin(admin));
        } else {
          dispatch(loginSuccess({ ...profile, email: session.user.email }));
        }
        dispatch(authInitialized());
      } catch (error) {
        console.error("Could not restore the signed-in profile:", error);
        if (active && version === sessionVersion) clearSession();
      }
    };

    if (!isSupabaseConfigured || !supabase) {
      clearSession();
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearSession();
        return;
      }
      if (event !== "INITIAL_SESSION") {
        queueMicrotask(() => {
          if (active) void restoreSession(session);
        });
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (active) return restoreSession(data.session);
        return undefined;
      })
      .catch((error) => {
        console.error("Could not check the Supabase session:", error);
        if (active) clearSession();
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dispatch, navigate]);

  // Remove storefront navbar top-padding from body when in admin panel
  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.add("admin-body");
    } else {
      document.body.classList.remove("admin-body");
    }
    return () => {
      document.body.classList.remove("admin-body");
    };
  }, [isAdminRoute]);

  const handleToastClose = () => {
    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: null,
    });
  };

  // Load the signed-in customer's cart and wishlist.
  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
      dispatch(fetchWishlist(userId));
    }
  }, [dispatch, userId]);

  // Real-time access & block monitor:
  // Automatically detects if an admin blocks this account from another browser/window
  // and exits the user immediately to the login page.
  useEffect(() => {
    if (!userId || isAdminRoute) return;

    let isMounted = true;

    const verifyCustomerAccess = async () => {
      try {
        const freshUser = await getUserById(userId);
        if (!isMounted) return;
        if (freshUser?.blocked) {
          try {
            await signOutUser();
          } catch (signOutError) {
            console.error("Could not sign out a blocked account:", signOutError);
          }
          dispatch(logout());
          dispatch(adminLogout());
          navigate("/login", {
            replace: true,
            state: {
              error: "Your account has been deactivated by an administrator.",
              message: "Your account has been deactivated by an administrator.",
            },
          });
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.code === "PGRST116") {
          try {
            await signOutUser();
          } catch (signOutError) {
            console.error("Could not sign out a missing account:", signOutError);
          }
          dispatch(logout());
          dispatch(adminLogout());
          navigate("/login", {
            replace: true,
            state: {
              error: "Account session expired. Please sign in again.",
              message: "Account session expired. Please sign in again.",
            },
          });
        } else {
          console.error("Could not verify account access:", err);
        }
      }
    };

    // Run verification immediately
    verifyCustomerAccess();

    // Poll every 1.5s for instant multi-browser cross-sync
    const pollInterval = setInterval(verifyCustomerAccess, 1500);

    // Also check immediately when window gains focus or tab becomes visible
    const handleFocusSync = () => verifyCustomerAccess();
    window.addEventListener("focus", handleFocusSync);
    document.addEventListener("visibilitychange", handleFocusSync);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocusSync);
      document.removeEventListener("visibilitychange", handleFocusSync);
    };
  }, [userId, isAdminRoute, dispatch, navigate, location.pathname]);

  // Scroll on customer-page navigation, but not inside the admin panel.
  useEffect(() => {
    if (isAdminRoute) return;

    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.hash, isAdminRoute]);

  return (
    <>
      {!isAdminRoute && !isAuthPage && <Navbar />}

      <div
        key={location.pathname}
        className={isAdminRoute ? "admin-page-wrapper" : "page-transition"}
      >
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products" element={<Navigate to="/shop" replace />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/Categories" element={<Categories/>}/>

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Profile defaultTab="orders" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile defaultTab="details" />
              </ProtectedRoute>
            }
          />

          {/* Admin routes: admin login is now merged with user login */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />

              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />

              <Route path="users" element={<AdminUsers />} />

              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Route>

          {/* Unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toast key={toastMessage} message={toastMessage} onClose={handleToastClose} />
    </>
  );
}
