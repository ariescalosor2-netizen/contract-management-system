import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  const currentRole = String(user?.role || "").trim().toLowerCase();
  const allowed = roles.some((role) => currentRole === String(role).trim().toLowerCase());

  return allowed ? <Outlet /> : <Navigate to="/" replace />;
}
