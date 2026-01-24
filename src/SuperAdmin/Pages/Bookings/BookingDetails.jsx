import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button, Alert, Badge } from 'react-bootstrap';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  AlertTriangle,
  DollarSign,
  Users,
  Building2,
  CheckCircle
} from 'lucide-react';
import { SUPER_ADMIN_API } from '../../../config/api';

const API_URL = SUPER_ADMIN_API;

function BookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${API_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(res.data.booking);
    } catch (err) {
      console.error("Failed to load booking details", err);
      setServerError("Failed to load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "active": { bg: "info", text: "Active" },
      "check-in": { bg: "success", text: "Check-in" },
      "checkout": { bg: "warning", text: "Checkout" },
      "cancelled": { bg: "danger", text: "Cancelled" }
    };
    const config = statusConfig[status] || { bg: "secondary", text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f3ff 100%)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          animation: 'pulse 2s infinite'
        }}>
          <div className="spinner-border text-white" style={{ width: '2rem', height: '2rem', borderWidth: '3px' }} />
        </div>
        <h5 style={{ color: '#6b7280', fontWeight: '600', fontSize: '1rem' }}>Loading booking details...</h5>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f3ff 100%)', padding: '2rem' }}>
        <div className="container-xl">
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertTriangle style={{ color: '#dc2626', flexShrink: 0 }} size={24} />
            <span style={{ color: '#991b1b', fontWeight: '500' }}>Booking not found</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f3ff 100%)', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="container-xl px-3 px-lg-5">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
              <Button
                onClick={() => navigate('/superadmin/bookings')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '0.625rem 1.25rem',
                  color: '#4f46e5',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ArrowLeft size={18} />
                Back
              </Button>
              
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={28} color="white" />
                  </div>
                  Booking Details
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>
                  Complete booking information & payment details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {serverError && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertTriangle style={{ color: '#dc2626', flexShrink: 0 }} size={24} />
            <span style={{ color: '#991b1b', fontWeight: '500', flex: 1 }}>{serverError}</span>
            <button
              onClick={() => setServerError("")}
              style={{
                background: 'none',
                border: 'none',
                color: '#991b1b',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Booking Summary Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(79, 70, 229, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={20} color="#4f46e5" />
              </div>
              Booking Summary
            </h5>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #4f46e5'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Booking ID
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  #{booking.id}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #06b6d4'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Booking Status
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #10b981'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Created Date
                </label>
                <div style={{ color: '#1f2937', fontSize: '0.95rem', fontWeight: '500' }}>
                  {new Date(booking.created_at).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '10px',
                  borderTop: '2px solid #0284c7'
                }}>
                  <label style={{ color: '#0c4a6e', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    Check-in
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.85rem', fontWeight: '600' }}>
                    {new Date(booking.check_in_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '10px',
                  borderTop: '2px solid #d97706'
                }}>
                  <label style={{ color: '#78350f', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    Check-out
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.85rem', fontWeight: '600' }}>
                    {new Date(booking.check_out_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  borderRadius: '10px',
                  borderTop: '2px solid #ec4899'
                }}>
                  <label style={{ color: '#831843', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    Duration
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.85rem', fontWeight: '600' }}>
                    {Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24))} nights
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(79, 70, 229, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={20} color="#4f46e5" />
              </div>
              Guest Information
            </h5>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #4f46e5'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Customer Name
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  {booking.customer_name}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #06b6d4'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} color="#06b6d4" />
                  {booking.email || 'N/A'}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #10b981'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Phone Number
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="#10b981" />
                  {booking.phone || 'N/A'}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #f1fdf9 100%)',
                borderRadius: '10px',
                borderLeft: '3px solid #16a34a'
              }}>
                <label style={{ color: '#15803d', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Number of Guests
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  {booking.no_of_people} {booking.no_of_people === 1 ? 'guest' : 'guests'}
                </div>
              </div>
            </div>
          </div>

          {/* Room & Stay Details Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(79, 70, 229, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} color="#4f46e5" />
              </div>
              Room & Stay Details
            </h5>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #4f46e5'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Hotel Name
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="#4f46e5" />
                  {booking.hotel?.name || 'N/A'}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #06b6d4'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Room Number
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  {booking.room?.room_number || 'N/A'}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #10b981'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Room Type
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  {booking.room?.room_type || 'N/A'}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '10px',
                borderTop: '2px solid #d97706'
              }}>
                <label style={{ color: '#78350f', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Room Price (per night)
                </label>
                <div style={{ color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>
                  ₹{booking.room?.price?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} color="white" />
              </div>
              Payment Summary
            </h5>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '14px',
                padding: '1.75rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    opacity: 0.9,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Total Amount
                  </div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    lineHeight: '1'
                  }}>
                    ₹{booking.total_amount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #f1fdf9 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #86efac',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#16a34a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      marginBottom: '0.75rem'
                    }}>
                      Paid Amount
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: '#059669',
                      lineHeight: '1'
                    }}>
                      ₹{booking.paid_amount?.toLocaleString() || '0'}
                    </div>  
                  </div>
                </div>
                

                <div style={{
                  background: booking.due_amount > 0 ? 'linear-gradient(135deg, #fef2f2 0%, #fef9f8 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #f1fdf9 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: booking.due_amount > 0 ? '1.5px solid #fecaca' : '1.5px solid #86efac',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: booking.due_amount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: booking.due_amount > 0 ? '#991b1b' : '#16a34a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      marginBottom: '0.75rem'
                    }}>
                      Due Amount
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: booking.due_amount > 0 ? '#dc2626' : '#059669',
                      lineHeight: '1'
                    }}>
                      ₹{booking.due_amount?.toLocaleString() || '0'}
                    </div>
                  </div>
                  
                </div>
                
              </div>
              <p style={{ color: 'red' }}>
              {booking.status === 'cancelled' && 'This booking has been cancelled and all payments have been refunded.'}
              </p>  

              <div style={{
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
                  Mode of Payment
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  {booking.mode_of_payment || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Used Card */}
<div
  style={{
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    marginTop: '2rem',
    width: '92%',
    marginLeft: 'auto',
    marginRight: 'auto',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
    e.currentTarget.style.transform = 'translateY(-4px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  {/* Header */}
  <h5
    style={{
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        background: 'rgba(16, 185, 129, 0.12)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      🧾
    </div>
    Services Used
  </h5>

  {/* No services case */}
  {(!booking.booking_services || booking.booking_services.length === 0) ? (
    <div
      style={{
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '10px',
        color: '#6b7280',
        fontSize: '0.9rem',
        textAlign: 'center',
      }}
    >
      No additional services were used for this booking.
    </div>
  ) : (
    <>
      {/* Services List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {booking.booking_services.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '12px',
              borderLeft: '4px solid #10b981',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {/* Service Name */}
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  fontWeight: '600',
                }}
              >
                Service
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#1f2937',
                }}
              >
                {item.service?.name}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                }}
              >
                Quantity
              </div>
              <div style={{ fontWeight: '600' }}>
                {item.quantity}
              </div>
            </div>

            {/* Unit Price */}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                }}
              >
                Unit Price
              </div>
              <div style={{ fontWeight: '600' }}>
                ₹{Number(item.unit_price).toFixed(2)}
              </div>
            </div>

            {/* Total */}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontWeight: '700',
                  color: '#10b981',
                }}
              >
                ₹{Number(item.total_price).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Total */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px dashed #d1d5db',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#374151',
          }}
        >
          Total Service Charges
        </span>
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: '#10b981',
          }}
        >
          ₹
          {booking.booking_services
            .reduce((sum, item) => sum + Number(item.total_price), 0)
            .toFixed(2)}
        </span>
      </div>
    </>
  )}
</div>

    </div>
  );
}

export default BookingDetails;
