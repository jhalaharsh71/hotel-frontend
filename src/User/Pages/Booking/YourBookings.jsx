import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Clock,
} from 'lucide-react';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import './YourBookings.css';
import { USER_API } from '../../../config/api';

const API_BASE = USER_API;

const YourBookings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('user_token');

  // ===== STATE MANAGEMENT =====
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== FETCH BOOKINGS ON MOUNT =====
  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    if (!token) {
      setError('Please login to view your bookings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your bookings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== NAVIGATE TO BOOKING DETAILS =====
  const handleViewDetails = (bookingId) => {
    navigate(`/user-booking-details/${bookingId}`);
  };

  // ===== FORMAT DATE =====
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // ===== CALCULATE DURATION =====
  const calculateDuration = (checkInDate, checkOutDate) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return duration > 0 ? duration : 0;
  };

  // ===== GET STATUS BADGE COLOR =====
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // ===== GET STATUS ICON =====
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'confirmed':
      case 'active':
        return '✓';
      case 'completed':
        return '✔️';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center" style={{marginTop:'72px'}}>
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Loading your bookings...</p>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1b4b 25%, #2d3561 50%, #1a2847 75%, #0f1828 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '60px',
          marginTop:'72px'
        }}
      >
        {/* Animated background gradient orbs */}
        <div
          style={{
            position: 'fixed',
            top: '-200px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'fixed',
            bottom: '-150px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <Container style={{ position: 'relative', zIndex: 1, paddingTop: '40px' }}>
          {/* PAGE HEADER */}
          <Row className="mb-5">
            <Col>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={28} color="white" />
                </div>
                <div>
                  <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>
                    Your Bookings
                  </h1>
                  <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '1rem' }}>
                    Manage and view all your hotel bookings
                  </p>
                </div>
              </div>
            </Col>
          </Row>

          {/* ERROR MESSAGE */}
          {error && (
            <Row className="mb-4">
              <Col lg={10} className="mx-auto">
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                  style={{
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: '#7f1d1d',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.15)',
                  }}
                >
                  <AlertCircle size={24} style={{ flexShrink: 0, color: '#dc2626' }} />
                  <div style={{ fontWeight: '500', fontSize: '1rem' }}>{error}</div>
                </Alert>
              </Col>
            </Row>
          )}

          {/* BOOKINGS GRID */}
          {bookings.length > 0 ? (
            <Row className="g-4">
              {bookings.map((booking) => {
                const duration = calculateDuration(booking.check_in_date, booking.check_out_date);
                const totalAmount = Number(booking.total_amount) || 0;
                const paidAmount = Number(booking.paid_amount) || 0;
                const dueAmount = totalAmount - paidAmount;

                return (
                  <Col md={6} lg={4} key={booking.id}>
                    <Card
                      className="h-100 booking-card shadow-sm border-0"
                      onClick={() => handleViewDetails(booking.id)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: '#ffffff',
                        borderRadius: '16px',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 50px rgba(59, 130, 246, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      {/* CARD HEADER WITH STATUS */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          padding: '16px',
                          color: 'white',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <h6 style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9, marginBottom: '4px' }}>
                              BOOKING ID
                            </h6>
                            <p style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                              #{booking.id}
                            </p>
                          </div>
                          <Badge
                            bg={getStatusBadgeColor(booking.status)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {getStatusIcon(booking.status)} {booking.status}
                          </Badge>
                        </div>
                      </div>

                      <Card.Body style={{ padding: '20px', paddingBottom: '16px' }}>
                        {/* HOTEL NAME */}
                        <h5
                          style={{
                            color: '#0f172a',
                            fontWeight: '800',
                            marginBottom: '16px',
                            fontSize: '16px',
                          }}
                        >
                          {booking.hotel?.name || 'Hotel Name'}
                        </h5>

                        {/* KEY DETAILS */}
                        <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                          {/* Check-in & Check-out */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: '#475569',
                              fontSize: '13px',
                            }}
                          >
                            <Calendar size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                            <span>
                              <strong>{formatDate(booking.check_in_date)}</strong> to{' '}
                              <strong>{formatDate(booking.check_out_date)}</strong>
                            </span>
                          </div>

                          {/* Duration */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: '#475569',
                              fontSize: '13px',
                            }}
                          >
                            <Clock size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                            <span>
                              <strong>{duration}</strong> {duration === 1 ? 'night' : 'nights'}
                            </span>
                          </div>

                          {/* Number of Guests */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: '#475569',
                              fontSize: '13px',
                            }}
                          >
                            <Users size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                            <span>
                              <strong>{booking.no_of_people}</strong> {booking.no_of_people === 1 ? 'guest' : 'guests'}
                            </span>
                          </div>

                          {/* Room Type */}
                          {booking.room && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#475569',
                                fontSize: '13px',
                              }}
                            >
                              <MapPin size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                              <span>
                                <strong>{booking.room.room_type}</strong> Room
                              </span>
                            </div>
                          )}
                        </div>

                        <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

                        {/* PRICE SUMMARY */}
                        <div style={{ marginBottom: '16px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px',
                            }}
                          >
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                              Total Amount
                            </span>
                            <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '800' }}>
                              ₹{totalAmount.toFixed(2)}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px',
                            }}
                          >
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                              Paid
                            </span>
                            <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '700' }}>
                              ₹{paidAmount.toFixed(2)}
                            </span>
                          </div>

                          {dueAmount > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px',
                                background: '#fef3c7',
                                borderRadius: '6px',
                              }}
                            >
                              <span style={{ color: '#92400e', fontSize: '12px', fontWeight: '600' }}>
                                Amount Due
                              </span>
                              <span style={{ color: '#d97706', fontSize: '14px', fontWeight: '700' }}>
                                ₹{dueAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Card.Body>

                      {/* CARD FOOTER */}
                      <Card.Footer className="bg-light border-0" style={{ padding: '12px 20px' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-100 fw-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 0',
                            fontSize: '14px',
                          }}
                          onClick={() => handleViewDetails(booking.id)}
                        >
                          View Details <ChevronRight size={16} className="ms-1" />
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            /* NO BOOKINGS MESSAGE */
            <Row className="mb-5">
              <Col lg={8} className="mx-auto">
                <div
                  style={{
                    borderRadius: '16px',
                    border: '2px dashed rgba(226, 232, 240, 0.5)',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    color: '#e2e8f0',
                    padding: '60px 30px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <BookOpen size={40} />
                  </div>
                  <h5 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#e2e8f0' }}>
                    No Bookings Yet
                  </h5>
                  <p style={{ marginBottom: '20px', fontSize: '1rem', color: '#cbd5e1' }}>
                    You haven't made any hotel bookings yet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/user-booking')}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 30px',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    Start Booking Now
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default YourBookings;
