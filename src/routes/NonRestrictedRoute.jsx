import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NonRestrictedRoute({ excludedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = String(user?.role || "").trim().toLowerCase();
  if (excludedRoles.some((item) => role === String(item).trim().toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
