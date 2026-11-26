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
  const authInitialized = useSelector((state) => state.auth.initialized);

  if (isAdminAuthenticated) {
    return <Outlet />;
  }
  if (!authInitialized) {
    return (
      <p className="px-6 py-12 text-center text-[13px] tracking-[0.06em] text-[#71737d]" role="status">
        Checking your session…
      </p>
    );
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
