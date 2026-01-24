import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isAdmin } from "./Auth";

export default function AdminGuard() {
  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
