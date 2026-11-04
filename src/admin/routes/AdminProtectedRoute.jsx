import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminProtectedRoute() {
  const location = useLocation();
  const isAdminAuthenticated = useSelector(
    (state) => state.adminAuth.isAuthenticated
  );
  const isCustomerAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  if (isAdminAuthenticated) {
    return <Outlet />;
  }

  // If already signed in as a regular customer without admin access
  if (isCustomerAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{ message: "Access restricted to administrators." }}
        replace
      />
    );
  }

  // Not signed in: redirect to login with return path
  return <Navigate to="/login" state={{ from: location }} replace />;
}

export default AdminProtectedRoute;
