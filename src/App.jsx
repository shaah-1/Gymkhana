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

import { fetchCart } from "./redux/cartSlice";
import { fetchWishlist } from "./redux/wishlistSlice";

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

import "./index.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth.userId);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const toastMessage = location.state?.message || "";

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

      <div key={location.pathname} className="page-transition">
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
