import { Navigate } from "react-router-dom";

const SuperAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("superadmin_token");
  const role = localStorage.getItem("role");

  if (!token || role !== "super_admin") {
    return <Navigate to="/superadmin/login" replace />;
  }

  return children;
};

export default SuperAdminProtectedRoute;
