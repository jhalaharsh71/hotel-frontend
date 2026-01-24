import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
} from "react-bootstrap";
import {
  User,
  Mail,
  Search,
  Users as UsersIcon,
} from "lucide-react";
import "./Users.css";
import { ADMIN_API } from "../../config/api";

const API_BASE = ADMIN_API;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  /* =======================
     FETCH USERS
  ======================= */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     FILTER USERS
  ======================= */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  /* =======================
     HELPERS
  ======================= */
  const getStatusColor = (status) =>
    status === 1 || status === true ? "success" : "secondary";

  const getStatusText = (status) =>
    status === 1 || status === true ? "Active" : "Inactive";

  /* =======================
     LOADING STATE
  ======================= */
  if (loading) {
    return (
      <div className="users-page-loading">
        <div className="users-spinner">
          <div className="users-spinner-circle"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="users-page-wrapper">
      {/* Header Section */}
      <Row className="users-header mb-5">
        <Col lg={6}>
          <div className="header-content">
            <h1 className="users-title">
              <span className="gradient-text">Manage Users</span>
            </h1>
            <p className="users-subtitle">View and manage all hotel staff and administrators</p>
          </div>
        </Col>

          <Col lg={6} className="text-lg-end">
            <div className="stat-badge">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </Col>
      </Row>

      {/* ===== SEARCH BAR ===== */}
      <div className="users-search-container">
        <div className="users-search-input-wrapper">
          <div className="users-search-icon">
            <Search size={20} />
          </div>
          <input
            className="users-search-input"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ===== USER CARDS ===== */}
      {filteredUsers.length > 0 ? (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-glass-card">
              {/* CARD HEADER */}
              <div className="user-card-header">
                <div className="user-card-avatar">
                  <User size={24} />
                </div>
                <div className="user-card-title-section">
                  <div className="user-card-name">{user.name}</div>
                  <div className="user-card-role">
                    {user.role === "admin" ? "👑 Admin" : "👨‍💼 User"}
                  </div>
                </div>
                <div
                  className={`user-status-badge ${
                    user.status === 1 ? "status-active" : "status-inactive"
                  }`}
                >
                  {user.status === 1 || user.status === true ? (
                    <>
                      <span className="status-dot active"></span>
                      Active
                    </>
                  ) : (
                    <>
                      <span className="status-dot inactive"></span>
                      Inactive
                    </>
                  )}
                </div>
              </div>

              {/* EMAIL SECTION */}
              <div className="user-email-section">
                <div className="user-email-row">
                  <div className="user-email-icon-box">
                    <Mail size={18} />
                  </div>
                  <div className="user-email-text-section">
                    <div className="user-email-label">Email Address</div>
                    <div className="user-email-value">{user.email}</div>
                  </div>
                </div>
              </div>

              {/* ROLE & STATUS INFO */}
              <div className="user-info-section">
                <div className="user-info-item">
                  <div className="user-info-label">Role</div>
                  <div className="user-info-value">
                    {user.role === "admin" ? "Administrator" : "User"}
                  </div>
                </div>
                <div className="user-info-item">
                  <div className="user-info-label">Status</div>
                  <div
                    className="user-info-value"
                    style={{
                      color:
                        user.status === 1 || user.status === true
                          ? "#0cfb44"
                          : "#f50707",
                    }}
                  >
                    {getStatusText(user.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="users-empty-state-container">
          <div className="users-empty-state-icon">
            <UsersIcon size={64} />
          </div>
          <div className="users-empty-state-title">
            {search ? "No users found" : "No Users Yet"}
          </div>
          <div className="users-empty-state-text">
            {search
              ? "Try adjusting your search to find users"
              : "There are no users assigned to your hotel yet"}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
