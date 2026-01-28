import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const token = localStorage.getItem("admin_token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
