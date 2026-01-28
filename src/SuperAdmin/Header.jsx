import React, { useState, useRef, useEffect } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ADMIN_API, SUPER_ADMIN_API } from "../config/api";
import "./Sidebar.css";

function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleLogout = async () => {
  const role = localStorage.getItem("role");

  const token =
    role === "super_admin"
      ? localStorage.getItem("superadmin_token")
      : localStorage.getItem("admin_token");

  const logoutUrl =
    role === "super_admin"
      ? `${SUPER_ADMIN_API}/logout`
      : `${ADMIN_API}/logout`;

  try {
    await axios.post(logoutUrl, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch (err) {
    console.log("Logout error", err);
  }

  localStorage.clear();
  
  // Redirect to role-specific login page
  const loginUrl = role === "super_admin" ? "/superadmin/login" : "/admin/login";
  navigate(loginUrl);
};


  return (
    <div className="w-100 p-3" style={{ background: "#f4f6fb", position: "sticky", top: 0, zIndex: 100 }}>
      <div
        className="d-flex justify-content-end align-items-center px-4 py-2 rounded-4 shadow-sm"
        style={{ background: "#fff" }}
      >
        {/* Bell Icon */}
        {/* <div className="position-relative me-4" style={{ cursor: "pointer" }}>
          <Bell size={24} className="text-secondary" />
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "10px" }}
          >
            1
          </span>
        </div> */}

        {/* Wrap avatar + dropdown inside ONE parent with ref */}
        <div className="position-relative" ref={dropdownRef}>
          {/* Avatar Button */}
          <div
            className="d-flex align-items-center border rounded-4 px-3 py-1"
            style={{ cursor: "pointer" }}
            onClick={() => setOpen(!open)}
          >
            <div className="position-relative me-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="profile"
                className="rounded-circle"
                width="40"
                height="40"
              />
              <span
                className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
                style={{ width: "10px", height: "10px" }}
              ></span>
            </div>
            <span className="fw-semibold text-secondary">
              Hi, Administrator
            </span>
          </div>

          {open && (
            <div
              className="dropdown-menu show p-0 mt-2 border-0 shadow-sm rounded-4"
              style={{
                position: "absolute",
                top: "75px",
                right: "0px",
                width: "260px",
                background: "#fff",
              }}
            >
              <div className="d-flex align-items-center p-3 pb-2">
                <div className="position-relative me-2">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    className="rounded-circle"
                    width="45"
                    height="45"
                    alt=""
                  />
                  <span
                    className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
                    style={{ width: "10px", height: "10px" }}
                  ></span>
                </div>
                <h6 className="fw-bold mb-0">Administrator</h6>
              </div>

              <hr className="my-1" />

              <div className="d-flex flex-column py-2">
                {/* <button
                
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                onClick={() => navigate("/superadmin/profile")}
              >
                <User size={18} /> Profile
              </button> */}


                <button
                  className="dropdown-item d-flex align-items-center gap-2 py-2"
                  onClick={() => {
                    console.log("LOGOUT BUTTON CLICKED");
                    handleLogout();
                  }}
                >
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
