import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Badge,
  Form,
  Modal,
  Table,
} from 'react-bootstrap';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  IndianRupee,
  XCircle,
  ArrowLeft,
  Edit,
  AlertCircle,
  CheckCircle,
  Package,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import ReviewForm from '../../Component/ReviewForm';
import './UserBookingDetails.css';
import { USER_API } from '../../../config/api';

const API_BASE = USER_API;

/* ================= DATE FORMAT ================= */
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const calculateDays = (checkIn, checkOut) => {
  const check_in = new Date(checkIn);
  const check_out = new Date(checkOut);
  return Math.ceil((check_out - check_in) / (1000 * 60 * 60 * 24));
};

export default function UserBookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('user_token');

  /* ================= STATE ================= */
  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* MODALS */
  const [editGuest, setEditGuest] = useState(false);
  const [cancelConfirmation, setCancelConfirmation] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  /* REVIEW STATE */
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* FORMS */
  const [guestForm, setGuestForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
  });

  /* ================= FETCH BOOKING ================= */
  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(res.data);
      setGuestForm({
        customer_name: res.data.customer_name,
        phone: res.data.phone,
        email: res.data.email,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SERVICES ================= */
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/bookings/${bookingId}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch services', err);
      setServices([]);
    }
  };

  /* ================= FETCH GUESTS ================= */
  const fetchGuests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/bookings/${bookingId}/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch guests', err);
      setGuests([]);
    }
  };

  /* ================= FETCH REVIEW ================= */
  const fetchReview = async () => {
    try {
      setReviewLoading(true);
      const res = await axios.get(`${API_BASE}/reviews/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Explicitly handle null response
      if (res.data && Object.keys(res.data).length > 0 && res.data.id) {
        setReview(res.data);
      } else {
        setReview(null);
      }
    } catch (err) {
      console.error('Failed to fetch review', err);
      setReview(null);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/user/login');
      return;
    }
    fetchBooking();
    fetchServices();
    fetchGuests();
    fetchReview();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
            <h2>Booking Not Found</h2>
            <p>The booking you're looking for doesn't exist.</p>
            <Button variant="primary" onClick={() => navigate('/user/bookings')}>
              Back to Bookings
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ================= HANDLERS ================= */

  const canEditDetails = booking.status === 'pending' || booking.status === 'active';
  const canCancel = booking.status === 'pending' || booking.status === 'active';

  const handleGuestFormChange = (e) => {
    const { name, value } = e.target;
    setGuestForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateGuest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.put(
        `${API_BASE}/bookings/${bookingId}`,
        {
          customer_name: guestForm.customer_name,
          phone: guestForm.phone,
          email: guestForm.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Guest details updated successfully!');
      setEditGuest(false);
      fetchBooking();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update guest details');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async () => {
    setSubmitting(true);
    setError(null);
    setCancelConfirmation(false);

    try {
      await axios.put(
        `${API_BASE}/bookings/${bookingId}/cancel`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Booking cancelled successfully!');
      setTimeout(() => {
        // navigate('/user/your-bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setSubmitting(false);
    }
  };

  /* ================= REVIEW HANDLERS ================= */
  const deleteReview = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(
          `${API_BASE}/reviews/${review.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Review deleted successfully!');
        setReview(null);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const handleReviewSubmitted = () => {
    fetchReview();
  };

  /* ================= RENDER ================= */

  return (
    <>
      <Header />

      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '40px', paddingBottom: '60px', marginTop:'72px' }}>
        {/* ALERTS */}
        {error && (
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <Alert variant="danger" dismissible onClose={() => setError(null)} style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle size={20} style={{ marginRight: '8px', display: 'inline' }} />
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div style={{ padding: '0 20px', marginBottom: '20px' }}>
            <Alert variant="success" dismissible onClose={() => setSuccess(null)} style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)' }}>
              <CheckCircle size={20} style={{ marginRight: '8px', display: 'inline' }} />
              {success}
            </Alert>
          </div>
        )}

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          {/* HEADER SECTION */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '40px',
            border: '1px solid #bae6fd',
          }}>
            <Button
              variant="light"
              onClick={() => navigate('/your-bookings')}
              style={{
                marginBottom: '20px',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.95rem',
                fontWeight: '500',
              }}
            >
              <ArrowLeft size={18} className="me-2" />
              Back to Bookings
            </Button>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <h1 style={{
                  fontSize: '2.8rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: 0,
                  marginBottom: '12px',
                  letterSpacing: '-1px',
                }}>
                  Booking #{booking.id}
                </h1>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500',
                }}>
                  {booking.confirm_booking ? '✓ Confirmed Reservation' : '⚠ Pending Confirmation'}
                </p>
              </div>
              <Badge style={{
                background: booking.status === 'cancelled' ? '#dc2626' :
                  booking.status === 'checkout' ? '#64748b' :
                    booking.status === 'check-in' ? '#06b6d4' :
                      booking.status === 'active' ? '#10b981' : '#f59e0b',
                color: 'white',
                padding: '12px 24px',
                fontSize: '0.9rem',
                borderRadius: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {booking.status}
              </Badge>
            </div>
          </div>

          {/* BOOKING TIMELINE */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #bae6fd',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-in</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                {formatDate(booking.check_in_date)}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #86efac',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                {calculateDays(booking.check_in_date, booking.check_out_date)} nights
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #fb923c',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-out</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                {formatDate(booking.check_out_date)}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #67e8f9',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.85rem', color: '#0891b2', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                #{booking.room?.room_number}
              </div>
            </div>
          </div>

          {/* PRIMARY GUEST & STAY DETAILS */}
          <Row className="g-4 mb-5">
            {/* PRIMARY GUEST */}
            <Col lg={6}>
              <Card style={{
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  height: '4px',
                }}></div>
                <Card.Body style={{ padding: '28px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                  }}>
                    <div>
                      <h5 style={{
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '4px',
                      }}>
                        <User size={24} style={{ color: '#3b82f6' }} />
                        Primary Guest
                      </h5>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        margin: 0,
                      }}>
                        Main booking contact
                      </p>
                    </div>
                    {canEditDetails && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setEditGuest(true)}
                        style={{
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontWeight: '600',
                        }}
                      >
                        <Edit size={16} className="me-1" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Full Name
                      </small>
                      <p style={{
                        fontSize: '1.1rem',
                        color: '#0f172a',
                        fontWeight: '700',
                        margin: 0,
                      }}>
                        {booking.customer_name}
                      </p>
                    </div>

                    <div>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        <Phone size={14} />
                        Phone Number
                      </small>
                      <p style={{
                        fontSize: '1rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        margin: 0,
                      }}>
                        {booking.phone || <em style={{ color: '#94a3b8' }}>Not provided</em>}
                      </p>
                    </div>

                    <div>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        <Mail size={14} />
                        Email Address
                      </small>
                      <p style={{
                        fontSize: '1rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        margin: 0,
                        wordBreak: 'break-all',
                      }}>
                        {booking.email || <em style={{ color: '#94a3b8' }}>Not provided</em>}
                      </p>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Number of Guests
                      </small>
                      <p style={{
                        fontSize: '1rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        margin: 0,
                      }}>
                        👥 {booking.no_of_people} {booking.no_of_people === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* STAY & ROOM DETAILS */}
            <Col lg={6}>
              <Card style={{
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  height: '4px',
                }}></div>
                <Card.Body style={{ padding: '28px' }}>
                  <h5 style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    margin: 0,
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <Home size={24} style={{ color: '#10b981' }} />
                    Room Details
                  </h5>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0',
                    }}>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#15803d',
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Room Type & Number
                      </small>
                      <p style={{
                        fontSize: '1.1rem',
                        color: '#0f172a',
                        fontWeight: '700',
                        margin: 0,
                      }}>
                        {booking.room?.room_type}
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}> • Room #{booking.room?.room_number}</span>
                      </p>
                    </div>

                    <div>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Check-in Time
                      </small>
                      <p style={{
                        fontSize: '1rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        margin: 0,
                      }}>
                        {formatDate(booking.check_in_date)}
                      </p>
                    </div>

                    <div>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Check-out Time
                      </small>
                      <p style={{
                        fontSize: '1rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        margin: 0,
                      }}>
                        {formatDate(booking.check_out_date)}
                      </p>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <small style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontWeight: '700',
                        display: 'block',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        Total Duration
                      </small>
                      <p style={{
                        fontSize: '1rem',
                        color: '#0f172a',
                        fontWeight: '600',
                        margin: 0,
                      }}>
                        {calculateDays(booking.check_in_date, booking.check_out_date)} nights
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* PAYMENT INFORMATION */}
          <Card style={{
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '40px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              height: '4px',
            }}></div>
            <Card.Body style={{ padding: '28px' }}>
              <h5 style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                color: '#0f172a',
                margin: 0,
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <IndianRupee size={24} style={{ color: '#f59e0b' }} />
                Billing Summary
              </h5>

              <Row className="g-4">
                <Col md={4}>
                  <div>
                    <small style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Total Amount
                    </small>
                    <p style={{
                      fontSize: '1.8rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      margin: 0,
                    }}>
                      ₹{Number(booking.total_amount).toFixed(2)}
                    </p>
                  </div>
                </Col>

                <Col md={4}>
                  <div>
                    <small style={{
                      fontSize: '0.8rem',
                      color: '#10b981',
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      ✓ Paid Amount
                    </small>
                    <p style={{
                      fontSize: '1.8rem',
                      fontWeight: '800',
                      color: '#10b981',
                      margin: 0,
                    }}>
                      ₹{Number(booking.paid_amount).toFixed(2)}
                    </p>
                  </div>
                </Col>

                <Col md={4}>
                  <div>
                    <small style={{
                      fontSize: '0.8rem',
                      color: Number(booking.due_amount) > 0 ? '#ef4444' : '#10b981',
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {Number(booking.due_amount) > 0 ? '⚠ Due Amount' : '✓ Amount Due'}
                    </small>
                    <p style={{
                      fontSize: '1.8rem',
                      fontWeight: '800',
                      color: Number(booking.due_amount) > 0 ? '#ef4444' : '#10b981',
                      margin: 0,
                    }}>
                      ₹{Number(booking.due_amount).toFixed(2)}
                    </p>
                  </div>
                </Col>
              </Row>

              {Number(booking.due_amount) === 0 && (
                <div style={{
                  marginTop: '20px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #dcfce7 100%)',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <CheckCircle size={20} style={{
                    color: '#10b981',
                    marginRight: '8px',
                    display: 'inline',
                  }} />
                  <span style={{ color: '#10b981', fontWeight: '700' }}>Fully Paid - No Outstanding Balance</span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* GUESTS SECTION */}
          {guests.length > 0 && (
            <Card style={{
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '40px',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                height: '4px',
              }}></div>
              <Card.Body style={{ padding: '28px' }}>
                <h5 style={{
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: 0,
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Users size={24} style={{ color: '#8b5cf6' }} />
                   Guests ({guests.length})
                </h5>

                <Row className="g-3">
                  {guests.map((guest) => (
                    <Col md={6} lg={4} key={guest.id}>
                      <div style={{
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        border: '1px solid #ddd6fe',
                        borderRadius: '14px',
                        padding: '18px',
                        height: '100%',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          marginBottom: '14px',
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                          }}>
                            {(guest.first_name?.charAt(0) || guest.last_name?.charAt(0) || 'G').toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h6 style={{
                              margin: 0,
                              fontWeight: '800',
                              color: '#0f172a',
                              fontSize: '1rem',
                              marginBottom: '4px',
                            }}>
                              {`${guest.first_name || ''} ${guest.last_name || ''}`.trim()}
                            </h6>
                            <small style={{
                              color: '#64748b',
                              fontWeight: '600',
                            }}>
                              {guest.relationship || 'Guest'}
                            </small>
                          </div>
                        </div>

                        <div style={{
                          borderTop: '1px solid #ddd6fe',
                          paddingTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}>
                          {guest.age && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '0.9rem',
                            }}>
                              <span style={{
                                background: '#ede9fe',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                color: '#8b5cf6',
                                fontSize: '0.85rem',
                              }}>
                                {guest.age}
                              </span>
                              <span style={{ color: '#0f172a', fontWeight: '600' }}>years old</span>
                            </div>
                          )}
                          {guest.gender && (
                            <div style={{
                              fontSize: '0.9rem',
                              color: '#64748b',
                            }}>
                              <span style={{ fontWeight: '600', color: '#0f172a' }}>Gender:</span> {guest.gender}
                            </div>
                          )}
                          {guest.phone && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.9rem',
                            }}>
                              <Phone size={16} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                              <span style={{ color: '#0f172a', fontWeight: '600' }}>{guest.phone}</span>
                            </div>
                          )}
                          {guest.email && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.9rem',
                            }}>
                              <Mail size={16} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                              <span style={{ color: '#0f172a', fontWeight: '600', wordBreak: 'break-all' }}>{guest.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* SERVICES SECTION */}
          <Card style={{
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '40px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              height: '4px',
            }}></div>
            <Card.Body style={{ padding: '28px' }}>
              <h5 style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                color: '#0f172a',
                margin: 0,
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Package size={24} style={{ color: '#ec4899' }} />
                Additional Services
              </h5>

              {services.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <Table hover style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{
                        borderBottom: '2px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                      }}>
                        <th style={{
                          padding: '14px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          Service Name
                        </th>
                        <th style={{
                          padding: '14px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          textAlign: 'center',
                        }}>
                          Quantity
                        </th>
                        <th style={{
                          padding: '14px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          textAlign: 'right',
                        }}>
                          Total Price
                        </th>
                        <th style={{
                          padding: '14px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          textAlign: 'right',
                        }}>
                          Added On
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr
                          key={service.id}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '14px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}>
                              <span style={{ fontSize: '1.1rem' }}>✨</span>
                              <span style={{
                                color: '#0f172a',
                                fontWeight: '700',
                              }}>
                                {service.service?.name || 'Service'}
                              </span>
                            </div>
                          </td>
                          <td style={{
                            padding: '14px',
                            textAlign: 'center',
                            color: '#0f172a',
                            fontWeight: '700',
                          }}>
                            {service.quantity}
                          </td>
                          <td style={{
                            padding: '14px',
                            textAlign: 'right',
                            color: '#ec4899',
                            fontWeight: '800',
                            fontSize: '1.05rem',
                          }}>
                            ₹{Number(service.total_price).toFixed(2)}
                          </td>
                          <td style={{
                            padding: '14px',
                            textAlign: 'right',
                            color: '#64748b',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                          }}>
                            {new Date(service.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })} at {new Date(service.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                }}>
                  <Package size={40} style={{
                    color: '#cbd5e1',
                    marginBottom: '12px',
                    display: 'inline-block',
                  }} />
                  <p style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    margin: 0,
                    fontWeight: '600',
                  }}>
                    No additional services added
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>


          {/* REVIEW SECTION */}
          {booking && booking.confirm_booking && booking.status === 'checkout' && (
            <Card style={{
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '40px',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                height: '4px',
              }}></div>
              <Card.Body style={{ padding: '28px' }}>
                <h5 style={{
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: 0,
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <Star size={24} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  Guest Review & Ratings
                </h5>

                {reviewLoading ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <Spinner animation="border" size="sm" variant="primary" />
                    <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.9rem' }}>Loading review...</p>
                  </div>
                ) : review && review.id ? (
                  // EXISTING REVIEW
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #fcd34d',
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            style={{
                              fill: i < review.rating ? '#fbbf24' : '#d1d5db',
                              color: i < review.rating ? '#fbbf24' : '#d1d5db',
                            }}
                          />
                        ))}
                        <Badge bg="light" text="dark" style={{
                          marginLeft: '12px',
                          fontWeight: '800',
                          padding: '6px 14px',
                          fontSize: '0.95rem',
                        }}>
                          {review.rating}/5 Stars
                        </Badge>
                      </div>

                      {review.title && (
                        <h6 style={{
                          margin: 0,
                          fontWeight: '800',
                          color: '#0f172a',
                          marginBottom: '10px',
                          fontSize: '1.1rem',
                        }}>
                          {review.title}
                        </h6>
                      )}

                      <p style={{
                        margin: 0,
                        color: '#0f172a',
                        lineHeight: '1.7',
                        marginBottom: '14px',
                        fontSize: '0.95rem',
                      }}>
                        {review.comment}
                      </p>

                      <small style={{
                        color: '#92400e',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}>
                        {review.room_type && <><strong>{review.room_type}</strong> Room • </>}
                        Reviewed on {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </small>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid #fcd34d',
                    }}>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => setShowReviewForm(true)}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                          color: '#92400e',
                          borderColor: '#f59e0b',
                        }}
                      >
                        <Edit size={16} className="me-1" />
                        Edit Review
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={deleteReview}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                        }}
                      >
                        <Trash2 size={16} className="me-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  // NO REVIEW YET - PROMPT TO WRITE
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    padding: '40px 24px',
                    borderRadius: '12px',
                    border: '2px dashed #fbbf24',
                    textAlign: 'center',
                  }}>
                    <Star size={48} style={{
                      color: '#f59e0b',
                      marginBottom: '16px',
                      display: 'block',
                      fill: '#f59e0b',
                    }} />
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#78350f',
                      margin: 0,
                      marginBottom: '8px',
                      fontWeight: '800',
                    }}>
                      Share Your Experience
                    </p>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#b45309',
                      margin: 0,
                      marginBottom: '24px',
                    }}>
                      Help other travelers with your honest feedback about your stay
                    </p>
                    <Button
                      variant="warning"
                      size="lg"
                      onClick={() => setShowReviewForm(true)}
                      style={{
                        borderRadius: '10px',
                        fontWeight: '700',
                        backgroundColor: '#f59e0b',
                        borderColor: '#f59e0b',
                        color: '#fff',
                        padding: '12px 36px',
                        fontSize: '1rem',
                      }}
                    >
                      <Star size={20} className="me-2" style={{ fill: '#fff' }} />
                      Write a Review
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {canCancel && (
            <Row className="mb-4">
              <Col>
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={() => setCancelConfirmation(true)}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    padding: '14px 24px',
                    fontWeight: '700',
                    fontSize: '1rem',
                  }}
                >
                  <XCircle size={18} className="me-2" />
                  Cancel Booking
                </Button>
              </Col>
            </Row>
          )}
        </div>
      </div>

      {/* EDIT GUEST MODAL */}
      <Modal show={editGuest} onHide={() => setEditGuest(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Guest Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={updateGuest}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="customer_name"
                value={guestForm.customer_name}
                onChange={handleGuestFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={guestForm.phone}
                onChange={handleGuestFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={guestForm.email}
                onChange={handleGuestFormChange}
              />
            </Form.Group>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline-secondary" onClick={() => setEditGuest(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting} style={{ flex: 1 }}>
                {submitting ? <Spinner size="sm" className="me-2" /> : ''}
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* CANCEL CONFIRMATION MODAL */}
      <Modal show={cancelConfirmation} onHide={() => setCancelConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '12px',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fee2e2',
          }}>
            <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span style={{ color: '#991b1b', fontWeight: '500' }}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setCancelConfirmation(false)}>
            No, Keep Booking
          </Button>
          <Button
            variant="danger"
            onClick={cancelBooking}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="me-2" /> : ''}
            Yes, Cancel Booking
          </Button>
        </Modal.Footer>
      </Modal>

      {/* REVIEW FORM MODAL */}
      <ReviewForm
        show={showReviewForm}
        onHide={() => setShowReviewForm(false)}
        booking={booking}
        onReviewSubmitted={handleReviewSubmitted}
        token={token}
        existingReview={review}
      />

      <Footer />
    </>
  );
}
