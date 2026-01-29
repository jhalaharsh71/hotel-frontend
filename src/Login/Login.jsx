import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { USER_API } from "../config/api";
import "./Login.css";

// ✅ Correct API URLs
const ADMIN_LOGIN_API =
`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/login`;

const USER_LOGIN_API = `${USER_API}/login`;

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Detect current login route
  const isUserLogin = location.pathname === "/user/login";
  const isAdminLogin = location.pathname === "/admin/login";
  const isSuperadminLogin = location.pathname === "/superadmin/login";
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ============================
      // 1️⃣ TRY USER LOGIN FIRST
      // ============================
      let userLoginFailed = false;

      try {
        const res = await axios.post(USER_LOGIN_API, {
          email: form.email,
          password: form.password,
        });

        if (res.data.role === "user") {
          localStorage.setItem("user_token", res.data.token);
          localStorage.setItem("role", "user");

          // If the user was redirected to login from a protected page,
          // `location.state` will contain `{ from, searchParams }` (see HotelDetails).
          // Redirect back to that `from` path and pass the original `searchParams`
          // so the destination page can restore the user's pre-login input.
          const redirectFrom = location.state?.from;
          const redirectSearchParams = location.state?.searchParams;

          if (redirectFrom) {
            navigate(redirectFrom, { state: redirectSearchParams });
          } else {
            navigate("/");
          }

          return;
        }
      } catch (err) {
        userLoginFailed = true;
      }

      // ============================
      // 2️⃣ FALLBACK TO ADMIN LOGIN
      // ============================
      if (userLoginFailed) {
        const res = await axios.post(ADMIN_LOGIN_API, {
          email: form.email,
          password: form.password,
        });

        localStorage.clear();

        if (res.data.role === "admin") {
          localStorage.setItem("admin_token", res.data.token);
          localStorage.setItem("role", "admin");
          navigate("/admin");
          return;
        }

        if (res.data.role === "super_admin") {
          localStorage.setItem("superadmin_token", res.data.token);
          localStorage.setItem("role", "super_admin");
          navigate("/superadmin");
          return;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Hotel Management System</h2>
        <p className="login-subtitle">
          Sign in using your registered email
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-3">
          <a href="#" className="forgot-password-link">
            Forgot your password?
          </a>
        </div>

        {/* Signup CTA - Only shown on user login page */}
        {isUserLogin && (
          <div className="text-center mt-3">
            <p className="login-signup-text">
              Don't have an account?{" "}
              <a 
                href="/user/signup" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/user/signup");
                }}
                className="signup-link"
              >
                Sign up
              </a>
            </p>
          </div>
        )}

        {/* Role Navigation - Shown on all login pages */}
        <div className="text-center mt-4">
          <p className="role-nav-text" style={{ fontSize: "12px", color: "#999" }}>
            {isUserLogin && (
              <>
                Admin or Superadmin?{" "}
                <a 
                  href="/admin/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/login");
                  }}
                  className="role-nav-link"
                >
                  Admin Login
                </a>
                {" | "}
                <a 
                  href="/superadmin/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/superadmin/login");
                  }}
                  className="role-nav-link"
                >
                  Superadmin Login
                </a>
              </>
            )}
            {isAdminLogin && (
              <>
                User or Superadmin?{" "}
                <a 
                  href="/user/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/user/login");
                  }}
                  className="role-nav-link"
                >
                  User Login
                </a>
                {" | "}
                <a 
                  href="/superadmin/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/superadmin/login");
                  }}
                  className="role-nav-link"
                >
                  Superadmin Login
                </a>
              </>
            )}
            {isSuperadminLogin && (
              <>
                User or Admin?{" "}
                <a 
                  href="/user/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/user/login");
                  }}
                  className="role-nav-link"
                >
                  User Login
                </a>
                {" | "}
                <a 
                  href="/admin/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/login");
                  }}
                  className="role-nav-link"
                >
                  Admin Login
                </a>
              </>
            )}
          </p>
        </div>

        <p className="login-footer">
          © {new Date().getFullYear()} Multi-Hotel Management System
        </p>
      </div>
    </div>
  );
}

export default Login;
