import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function SuperAdminLayout() {
  const location = useLocation();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const sidebarWidth = "280px";

  const toggleSidebar = (state) => {
    if (typeof state === "boolean") setSidebarOpen(state);
    else setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      if (!desktop) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex min-vh-100">

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        sidebarWidth={sidebarWidth}
        isDesktop={isDesktop}
      />

      {sidebarOpen && !isDesktop && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1030, background: "rgba(0,0,0,0.45)" }}
          onClick={() => toggleSidebar(false)}
        />
      )}

      {!sidebarOpen && !isDesktop && (
        <button
          className="btn btn-dark position-fixed top-0 start-0 m-3 shadow"
          style={{ zIndex: 1050 }}
          onClick={() => toggleSidebar(true)}
        >
          <i className="bi bi-list fs-4" />
        </button>
      )}

      <div
        className="flex-grow-1 bg-light"
        style={{
          marginLeft: isDesktop && sidebarOpen ? sidebarWidth : "0",
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
        }}
      >
        <Header />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
