import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
