import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/shop/Home";
import ProductDetails from "./pages/shop/ProductDetails";
import Cart from "./pages/shop/Cart";
import Wishlist from "./pages/shop/Wishlist";
import Checkout from "./pages/shop/Checkout";
import Profile from "./pages/account/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Contact from "./pages/contact/Contact";

import "./index.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const toastMessage = location.state?.message || "";
  const handleToastClose = () => {
    navigate(location.pathname + location.search + location.hash, { replace: true, state: null });
  };

  // Handle smooth scroll to anchor or page top on navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.hash]);

  return (
    <>
      <Navbar />
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Navigate to="/profile#orders" replace /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <Toast message={toastMessage} onClose={handleToastClose} />
    </>
  );
}
