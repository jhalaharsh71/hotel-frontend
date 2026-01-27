import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { USER_API } from "../config/api";
import "./Login.css";

// ✅ Correct API URLs
const ADMIN_LOGIN_API =
  `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/login`;

const USER_LOGIN_API = `${USER_API}/login`;

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
          navigate("/");
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

        <p className="login-footer">
          © {new Date().getFullYear()} Multi-Hotel Management System
        </p>
      </div>
    </div>
  );
}

export default Login;
