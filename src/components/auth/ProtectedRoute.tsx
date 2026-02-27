import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}
