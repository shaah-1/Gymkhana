import { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import ProtectedRoute from "./routes/ProtectedRoute";

import {
  Home,
  ProductDetails,
  Cart,
  Wishlist,
  Checkout,
  Orders,
  Profile,
  Login,
  Register,
  ForgotPassword,
  Contact,
} from "./pages";

import "./index.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const navMessage = location.state?.message;
  const [toastMessage, setToastMessage] = useState("");
  const [lastNavMessage, setLastNavMessage] = useState(null);

  if (navMessage && navMessage !== lastNavMessage) {
    setLastNavMessage(navMessage);
    setToastMessage(navMessage);
  }

  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted && window.location.pathname !== "/") navigate("/", { replace: true });
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [navigate]);

  useEffect(() => {
    if (!location.state?.message) return;
    navigate(location.pathname + location.search + location.hash, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    const search = new URLSearchParams(location.search).get("search")?.trim() || "";
    const prev = scrollRef.current;
    const shouldScroll = !prev || prev.pathname !== location.pathname || prev.hash !== location.hash || Boolean(prev.search) !== Boolean(search);

    scrollRef.current = { pathname: location.pathname, hash: location.hash, search };
    if (!shouldScroll) return;

    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, location.hash]);

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
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
