import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { USER_API } from "../config/api";
import "./Login.css";

const ADMIN_LOGIN_API = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/login`;
const USER_LOGIN_API = `${USER_API}/login`;

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // First try user login
      let userLoginFailed = false;
      try {
        const res = await axios.post(USER_LOGIN_API, {
          email: form.email,
          password: form.password,
        });

        // localStorage.clear();

        if (res.data.role === "user") {
          localStorage.setItem("user_token", res.data.token);
          localStorage.setItem("role", "user");
          navigate("/");
          return;
        }
      } catch (userError) {
        // User login failed - mark for fallback to admin
        // Accept 401 (invalid credentials), 403 (unauthorized/wrong role)
        userLoginFailed = true;
      }

      // If user login failed, try admin/super_admin login
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
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title mb-4">Hotel Management</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          © {new Date().getFullYear()} Multi Hotel System
        </p>
      </div>
    </div>
  );
}

export default Login;
