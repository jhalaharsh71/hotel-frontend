import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, sidebarWidth, isDesktop }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "bi-speedometer2", color: "#3b82f6" },
    { name: "Rooms", path: "/admin/rooms", icon: "bi-door-open", color: "#22c55e" },
    { name: "Bookings", path: "/admin/bookings", icon: "bi-calendar-check", color: "#f59e0b" },
    { name: "Services", path: "/admin/services", icon: "bi-box-seam", color: "#a855f7" },
    { name: "Current Guests", path: "/admin/guests", icon: "bi-people", color: "#14b8a6" },
    { name: "Today's Check-ins", path: "/admin/checkins", icon: "bi-box-arrow-in-right", color: "#061af4"},
    { name: "Today's Checkouts", path: "/admin/checkouts", icon: "bi-box-arrow-right", color: "#f70606" },
    { name: "Reviews", path: "/admin/reviews", icon: "bi-person-badge", color: "#f97316" },
    { name: "Reports", path: "/admin/reports", icon: "bi-graph-up-arrow", color: "#ef4444" },
    
  ];

  const normalizePath = (p) => (p?.startsWith("/") ? p : `/admin/${p}`);

  const isActive = (path) => location.pathname === normalizePath(path);

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
        background: "linear-gradient(180deg,#0f172a,#020617)",
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
          <h5 className="mb-0 fw-bold text-white">Hotel Admin</h5>
          <small className="text-secondary">Management Panel</small>
        </div>

        {!isDesktop && (
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => toggleSidebar(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="px-3 py-4">
        {menuItems.map((item, i) => {
          const active = isActive(item.path);

          return (
            <Link
              key={i}
              to={normalizePath(item.path)}
              onClick={() => !isDesktop && toggleSidebar(false)}
              className="d-flex align-items-center gap-3 px-3 py-2 mb-2 rounded text-decoration-none"
              style={{
                background: active
                  ? "linear-gradient(90deg, rgba(59,130,246,0.25), transparent)"
                  : "transparent",
                color: active ? "#fff" : "#cbd5f5",
                borderLeft: active ? `4px solid ${item.color}` : "4px solid transparent",
                transition: "all 0.25s ease",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: active
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
        © {new Date().getFullYear()} Hotel System
      </div> */}
    </aside>
  );
};

export default Sidebar;
