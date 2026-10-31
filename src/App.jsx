import ForgotPassword from "./pages/ForgotPassword";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Toast from "./components/Toast";
import Contact from "./pages/Contact";

import "./index.css";

function RefreshToHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePageShow = (event) => {
      if (
        event.persisted &&
        window.location.pathname !== "/"
      ) {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [navigate]);

  return null;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const previousScrollLocation = useRef(null);

  const [toastMessage, setToastMessage] = useState("");

  const closeToast = useCallback(() => {
    setToastMessage("");
  }, []);

  useEffect(() => {
    const message = location.state?.message;

    if (!message) return;

    setToastMessage(message);

    // Clear the navigation state to prevent the popup
    // from appearing again when the page is revisited.
    navigate(
      location.pathname + location.search + location.hash,
      {
        replace: true,
        state: null,
      }
    );
  }, [location, navigate]);

  useEffect(() => {
    const currentSearch = new URLSearchParams(location.search).get("search")?.trim() || "";
    const previous = previousScrollLocation.current;
    const shouldScroll =
      !previous ||
      previous.pathname !== location.pathname ||
      previous.hash !== location.hash ||
      Boolean(previous.search) !== Boolean(currentSearch);

    previousScrollLocation.current = {
      pathname: location.pathname,
      hash: location.hash,
      search: currentSearch,
    };

    if (!shouldScroll) return undefined;

    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <RefreshToHome />

      <Navbar />

      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<Home />} />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/wishlist" element={<Wishlist />} />

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
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      <Toast
        message={toastMessage}
        onClose={closeToast}
      />
    </>
  );
}

export default App;
