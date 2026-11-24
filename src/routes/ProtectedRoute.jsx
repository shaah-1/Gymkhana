import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const initialized = useSelector((s) => s.auth.initialized);
  const isAuth = useSelector((s) => s.auth.isAuthenticated);
  const user = useSelector((s) => s.auth.user);

  if (!initialized) {
    return <p role="status">Checking your session…</p>;
  }

  if (!isAuth || user?.blocked) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          error: user?.blocked
            ? "Your account has been suspended by an administrator."
            : undefined,
        }}
      />
    );
  }

  return children;
}
