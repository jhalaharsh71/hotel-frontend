import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Table,
  Badge,
} from "react-bootstrap";
import { AlertCircle, User, Home, Calendar, IndianRupee, Eye, CheckCircle, XCircle, Phone } from "lucide-react";
import "./Guests.css";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /* =======================
     FETCH GUESTS
  ======================= */
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("admin_token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/admin/guests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setGuests(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load guests. Please try again.");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     HELPERS
  ======================= */
  const handleGuestClick = (guestId) => {
    navigate(`/admin/bookings/${guestId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatMoney = (value) => {
    return Number(value || 0).toFixed(2);
  };

  /* =======================
     LOADING
  ======================= */
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading guests...</p>
        </div>
      </Container>
    );
  }

  /* =======================
     ERROR
  ======================= */
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="d-flex gap-3">
          <AlertCircle />
          <div>
            <h5>Error Loading Guests</h5>
            <p>{error}</p>
            <Button variant="danger" onClick={fetchGuests}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="guests-wrapper">
      <Container fluid>
        {/* HEADER */}
        <Row className="mb-5 align-items-center">
          <Col lg={6}>
            <h1 className="guests-title">
              <span className="gradient-text">Current Guests</span>
            </h1>
            <p className="services-subtitle">
              Active guests staying in your hotel
            </p>
          </Col>

          <Col lg={6} className="text-lg-end">
            <div className="stat-badge">
              <span className="stat-number">{guests.length}</span>
              <span className="stat-label">Guests</span>
            </div>
          </Col>
        </Row>

        {/* TABLE */}
        <Card className="guests-card">
          <Card.Body>
            {guests.length === 0 ? (
              <div className="empty-state">
                <h4>No Active Guests</h4>
                <p className="text-muted">
                  There are currently no checked-in guests.
                </p>
              </div>
            ) : (
              <Table responsive hover className="guests-table">
                <thead>
                  <tr>
                    <th><User size={16} className="me-2" style={{ marginBottom: "2px" }} />Guest Info</th>
                    <th><Home size={16} className="me-2" style={{ marginBottom: "2px" }} />Room</th>
                    <th><Calendar size={16} className="me-2" style={{ marginBottom: "2px" }} />Stay Duration</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="click-row"
                      onClick={() => handleGuestClick(guest.id)}
                    >
                      {/* Guest Info */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.9rem"
                          }}>
                            {guest.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="guest-name" style={{ marginBottom: "4px" }}>
                              {guest.customer_name}
                            </div>
                            {guest.phone && (
                              <small style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Phone size={12} /> {guest.phone}
                              </small>
                            )}
                            {guest.email && (
                              <small style={{ color: "#64748b", display: "block", marginTop: "2px" }}>
                                {guest.email}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Room */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                            color: "white",
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "0.85rem"
                          }}>
                            {guest.room_number}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "0.95rem" }}>
                              Room #{guest.room_number}
                            </div>
                            <small style={{ color: "#64748b" }}>
                              {guest.room_type}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Stay Duration */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Calendar size={18} style={{ color: "#6366f1", flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "#0f172a" }}>
                              {(() => {
                                const checkIn = new Date(guest.check_in_date);
                                const checkOut = new Date(guest.check_out_date);
                                const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                                return `${nights} night${nights !== 1 ? 's' : ''}`;
                              })()}
                            </div>
                            <small style={{ color: "#64748b" }}>
                              {new Date(guest.check_in_date).toLocaleDateString()} - {new Date(guest.check_out_date).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {guest.status === "active" ? (
                            <>
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#16a34a",
                                animation: "pulse 2s infinite"
                              }} />
                              <Badge bg="success">Active</Badge>
                            </>
                          ) : guest.status === "check-in" ? (
                            <>
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#7574e0"
                              }} />
                              <Badge bg="success">{guest.status}</Badge>
                            </>
                          ) : guest.status === "check-out" ? (
                            <>
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#2654dc"
                              }} />
                              <Badge bg="primary">{guest.status}</Badge>
                            </>
                          ) : (
                            <>
                              <div style={{   
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#dc2626"
                              }} />
                              <Badge bg="danger">{guest.status}</Badge>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="text-center">
                        <Button
                          size="sm"
                          className="btn-view-unique"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGuestClick(guest.id);
                          }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                          <Eye size={16} />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Guests;
