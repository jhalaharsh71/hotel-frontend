import { Navigate, Outlet } from "react-router-dom";

const UserGuard = () => {
  const token = localStorage.getItem("user_token");
  const role = localStorage.getItem("role");

  if (!token || role !== "user") {
    return <Navigate to="/user/login" replace />;
  }

  return <Outlet />;
};

export default UserGuard;
