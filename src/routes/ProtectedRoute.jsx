import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  // Authentication state is still being restored.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated → login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Authenticated → render protected child route.
  return <Outlet />;
}