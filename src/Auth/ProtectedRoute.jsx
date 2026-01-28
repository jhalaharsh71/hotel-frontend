import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./Auth";

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
