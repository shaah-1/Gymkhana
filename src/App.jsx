
import { useCallback, useEffect, useState } from "react";
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

  return (
    <>
      <RefreshToHome />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route path="*" element={<Home />} />
      </Routes>

      <Toast
        message={toastMessage}
        onClose={closeToast}
      />
    </>
  );
}

export default App;
