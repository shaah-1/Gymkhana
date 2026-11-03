import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminProtectedRoute() {
  const isAuthenticated = useSelector(
    (state) => state.adminAuth.isAuthenticated
  );

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

export default AdminProtectedRoute;