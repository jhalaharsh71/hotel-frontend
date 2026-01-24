import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Badge } from 'react-bootstrap';
import Select from 'react-select';
import {
  Calendar,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/api/superadmin";

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState("");
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setBookings(res.data.bookings || []);
      setHotels(res.data.hotels || []);
    } catch (err) {
      console.error("Failed to load bookings", err);
      setServerError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Prepare hotel options for select
  const hotelOptions = useMemo(() =>
    hotels.map(hotel => ({ value: hotel.id, label: hotel.name })),
    [hotels]
  );

  // Filter bookings based on search, hotel, and status
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        (booking.customer_name && booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (booking.phone && booking.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesHotel = !selectedHotel || booking.hotel_id === selectedHotel.value;
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && booking.status === "active") ||
        (statusFilter === "check-in" && booking.status === "check-in") ||
        (statusFilter === "checkout" && booking.status === "checkout") ||
        (statusFilter === "cancelled" && booking.status === "cancelled");

      return matchesSearch && matchesHotel && matchesStatus;
    });
  }, [bookings, searchTerm, selectedHotel, statusFilter]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      "active": { bg: "info", text: "Active" },
      "check-in": { bg: "success", text: "Checked In" },
      "completed": { bg: "secondary", text: "Completed" },
      "cancelled": { bg: "danger", text: "Cancelled" }
    };
    const config = statusConfig[status] || { bg: "secondary", text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Clock size={16} className="me-1" />;
      case "check-in":
        return <CheckCircle size={16} className="me-1" />;
      case "completed":
        return <CheckCircle size={16} className="me-1" />;
      case "cancelled":
        return <XCircle size={16} className="me-1" />;
      default:
        return null;
    }
  };

  const handleBookingClick = (bookingId) => {
    navigate(`/superadmin/bookings/${bookingId}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedHotel(null);
    setStatusFilter("all");
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
        <h5 style={{ color: '#6b7280', fontWeight: '600', fontSize: '1rem' }}>Loading bookings...</h5>
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
              {/* <Button
                onClick={() => navigate('/superadmin')}
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
              </Button> */}
              
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
                  Bookings Management
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>
                  View and manage all hotel bookings
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '10px',
                padding: '0.625rem 1.25rem',
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                opacity: refreshing ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
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

        {/* Filters Card */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          background: '#ffffff', 
          borderRadius: '16px', 
          border: '1px solid #e5e7eb', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}>
          <h6 style={{ 
            fontSize: '1rem', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            margin: 0
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Filter size={18} color="white" />
            </div>
            <span style={{ marginBottom: '0' }}>Search & Filter Bookings</span>
          </h6>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.2fr', gap: '1rem', marginTop: '1.5rem' }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                color: '#9ca3af',
                pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Hotel Filter */}
            <div>
              <Select
                options={hotelOptions}
                value={selectedHotel}
                onChange={setSelectedHotel}
                isClearable
                placeholder="Filter by Hotel..."
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
                    borderRadius: '8px',
                    minHeight: '42px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    backgroundColor: '#ffffff',
                    boxShadow: state.isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : '#ffffff',
                    color: state.isSelected ? '#ffffff' : '#1f2937'
                  })
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '42px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="check-in">Check-in</option>
                <option value="checkout">Checkout</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Reset Button */}
            <div>
              <Button
                onClick={resetFilters}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                  border: '1.5px solid #a78bfa',
                  borderRadius: '8px',
                  color: '#4f46e5',
                  fontWeight: '600',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Filter size={16} />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Bookings Count */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.03) 100%)',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '2rem',
          border: '1px solid rgba(79, 70, 229, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>Showing</span>
          <span style={{ color: '#4f46e5', fontWeight: '700', fontSize: '1.1rem' }}>{filteredBookings.length}</span>
          <span>of</span>
          <span style={{ color: '#4f46e5', fontWeight: '700', fontSize: '1.1rem' }}>{bookings.length}</span>
          <span>bookings</span>
        </div>

        {/* Bookings Table Card */}
        {filteredBookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <Calendar size={56} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
            <h5 style={{ color: '#6b7280', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.1rem' }}>No bookings found</h5>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <th style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#4f46e5',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>Customer Name</th>
                    <th style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#4f46e5',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>Email</th>
                    <th style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#4f46e5',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>Check In</th>
                    <th style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#4f46e5',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>Check Out</th>
                    <th style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#4f46e5',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>Status</th>
                    <th style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      fontWeight: '700',
                      color: '#4f46e5',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px'
                    }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f4ff';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td style={{
                        padding: '1.25rem 1rem',
                        color: '#1f2937',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {booking.customer_name}
                      </td>
                      <td style={{
                        padding: '1.25rem 1rem',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {booking.email || 'N/A'}
                      </td>
                      <td style={{
                        padding: '1.25rem 1rem',
                        color: '#1f2937',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {new Date(booking.check_in_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{
                        padding: '1.25rem 1rem',
                        color: '#1f2937',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {new Date(booking.check_out_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{
                        padding: '1.25rem 1rem',
                        textAlign: 'left'
                      }}>
                        <Badge bg={
                          booking.status === 'active' ? 'info' :
                          booking.status === 'check-in' ? 'success' :
                          booking.status === 'checkout' ? 'warning' :
                          booking.status === 'cancelled' ? 'danger' : 'secondary'
                        } style={{ fontSize: '0.8rem', fontWeight: '600', padding: '0.5rem 0.75rem' }}>
                          {booking.status === 'checkout' ? 'Checkout' :
                           booking.status === 'check-in' ? 'Check-in' :
                           booking.status === 'active' ? 'Active' :
                           booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                        </Badge>
                      </td>
                      <td style={{
                        padding: '1.25rem 1rem',
                        textAlign: 'center'
                      }}>
                        <Button
                          onClick={() => navigate(`/superadmin/bookings/${booking.id}`)}
                          style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            padding: '0.5rem 1.25rem',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <Eye size={14} />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
