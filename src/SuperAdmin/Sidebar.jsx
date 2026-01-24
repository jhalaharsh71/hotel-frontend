import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, sidebarWidth, isDesktop }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      name: "Dashboard",
      path: "/superadmin",
      icon: "bi-speedometer2",
      color: "#ef4444",
    },
    {
      name: "Hotels",
      path: "/superadmin/hotel",
      icon: "bi-building",
      color: "#22c55e",
    },
    {
      name: "Bookings",
      path: "/superadmin/bookings",
      icon: "bi-calendar-check",
      color: "#f7eb14",
    },
  ];

  const normalizePath = (p) => (p?.startsWith("/") ? p : `/superadmin/${p}`);

  const transform = isDesktop
    ? "translateX(0)"
    : isOpen
    ? "translateX(0)"
    : "translateX(-100%)";

  return (
    <aside
      style={{
        width: sidebarWidth,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "linear-gradient(180deg, #020617, #0f172a)",
        color: "#e5e7eb",
        transform,
        transition: "all 0.3s ease",
        zIndex: 1040,
        overflowY: "auto",
        boxShadow: "4px 0 30px rgba(0,0,0,0.35)",
        visibility: !isDesktop && !isOpen ? "hidden" : "visible",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-secondary">
        <div>
          <h5 className="mb-0 fw-bold text-white">Super Admin</h5>
          <small className="text-secondary">System Control</small>
        </div>

        {!isDesktop && (
          <button
            className="btn btn-sm btn-outline-light sidebar-button"
            onClick={() => toggleSidebar(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="px-3 py-4">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={i}
              to={normalizePath(item.path)}
              onClick={() => !isDesktop && toggleSidebar(false)}
              className="d-flex align-items-center gap-3 px-3 py-2 mb-2 rounded text-decoration-none"
              style={{
                background: isActive
                  ? "linear-gradient(90deg, rgba(239,68,68,0.25), transparent)"
                  : "transparent",
                color: isActive ? "#fff" : "#cbd5f5",
                borderLeft: isActive
                  ? `4px solid ${item.color}`
                  : "4px solid transparent",
                transition: "all 0.25s ease",
              }}
            >
              {/* Icon Box */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: isActive
                    ? item.color
                    : "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className={`${item.icon}`} style={{ color: "#fff" }} />
              </div>

              {/* Text */}
              <span className="fw-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {/* <div className="mt-auto px-4 py-3 border-top border-secondary text-secondary small">
        © {new Date().getFullYear()} Super Admin Panel
      </div> */}
    </aside>
  );
};

export default Sidebar;
