import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../Styles/OtpVerification.css";

const API_BASE = "http://127.0.0.1:8000/api/user";

function OtpVerification({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const inputRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only allow single digit
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/verify-otp`, {
        email: email,
        otp: otpCode,
      });

      if (response.status === 200) {
        setSuccessMessage("OTP verified successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(errorMsg);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/resend-otp`, {
        email: email,
      });

      if (response.status === 200) {
        setSuccessMessage("OTP resent to your email!");
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(60); // 60 seconds cooldown
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to resend OTP. Try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-card">
        <h2 className="otp-title">Verify Email</h2>

        <p className="otp-description">
          We've sent a 6-digit OTP to <strong>{email}</strong>
        </p>

        {error && <div className="otp-error">{error}</div>}
        {successMessage && (
          <div className="otp-success">{successMessage}</div>
        )}

        <form onSubmit={handleVerifyOtp}>
          {/* OTP Input Fields */}
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="-"
                className="otp-input"
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button className="otp-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend OTP */}
        <p className="otp-resend">
          Didn't receive OTP?{" "}
          {resendTimer > 0 ? (
            <span className="resend-timer">Resend in {resendTimer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="resend-link"
            >
              Resend OTP
            </button>
          )}
        </p>

        {/* Back to Signup */}
        <p className="otp-back">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="back-link"
          >
            Back to Signup
          </button>
        </p>
      </div>
    </div>
  );
}

export default OtpVerification;
