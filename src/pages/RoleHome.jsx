import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleHome() {
  const { user } = useAuth();
  const role = String(user?.role || "").trim().toLowerCase();

  if (role === "super admin") return <Navigate to="/super-admin" replace />;
  if (role === "viewer") return <Navigate to="/viewer" replace />;

  return <Navigate to="/dashboard" replace />;
}
