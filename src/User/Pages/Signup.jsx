import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Signup.css";
import OtpVerification from "../Component/OtpVerification";
import { USER_API } from "../../config/api";

const API_BASE = USER_API;

function Signup() {
  const [step, setStep] = useState("signup"); // signup or otp
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_number: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!form.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile_number.replace(/\D/g, ""))) {
      newErrors.mobile_number = "Mobile number must be 10 digits";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (form.password !== form.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/send-otp`, {
        name: form.name,
        email: form.email,
        mobile_number: form.mobile_number,
        password: form.password,
      });

      if (response.status === 200) {
        setSuccessMessage("OTP sent to your email. Please verify.");
        setUserEmail(form.email);
        setTimeout(() => {
          setStep("otp");
          setSuccessMessage("");
        }, 1000);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to send OTP. Try again.";
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOtpSuccess = () => {
    setSuccessMessage("Registration successful! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  // Handle back to signup
  const handleBackToSignup = () => {
    setStep("signup");
    setErrors({});
  };

  if (step === "otp") {
    return (
      <OtpVerification
        email={userEmail}
        onSuccess={handleOtpSuccess}
        onBack={handleBackToSignup}
      />
    );
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2 className="signup-title mb-4">Create Account</h2>

        {successMessage && (
          <div className="signup-success">{successMessage}</div>
        )}
        {errors.submit && <div className="signup-error">{errors.submit}</div>}

        <form onSubmit={handleSignupSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Mobile Number Field */}
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="text"
              placeholder="Enter 10-digit mobile number"
              value={form.mobile_number}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile_number: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              maxLength="10"
              className={errors.mobile_number ? "input-error" : ""}
            />
            {errors.mobile_number && (
              <span className="error-text">{errors.mobile_number}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Enter a strong password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm({ ...form, confirm_password: e.target.value })
              }
              className={errors.confirm_password ? "input-error" : ""}
            />
            {errors.confirm_password && (
              <span className="error-text">{errors.confirm_password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button className="signup-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <a href="/login" className="login-link">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
