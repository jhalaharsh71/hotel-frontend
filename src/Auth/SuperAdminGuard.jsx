import { Navigate, Outlet } from "react-router-dom";

const SuperAdminGuard = () => {
  const token = localStorage.getItem("superadmin_token");
  const role = localStorage.getItem("role");

  if (!token || role !== "super_admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default SuperAdminGuard;
