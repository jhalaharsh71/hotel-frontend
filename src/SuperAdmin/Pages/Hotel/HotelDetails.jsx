import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Save,
  X,
  UserPlus,
  MoreVertical,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import { SUPER_ADMIN_API, USER_API } from '../../../config/api';

const API_URL = `${SUPER_ADMIN_API}/hotel`;

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [revenue, setRevenue] = useState({
    total: 0,
    paid: 0,
    due: 0,
    todayRevenue: 0
  });
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    phone_code: '',
    phone_number: '',
    contact_no: ''
  });
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin'
  });
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHotel();
  }, []);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotel(res.data.hotel);
      setUsers(res.data.users || []);
      setCountries(res.data.countries || []);
      setStates(res.data.states || []);
      // Do NOT load all cities - they'll be loaded lazily via AsyncSelect
      
      // Calculate booking and revenue statistics
      const allBookings = res.data.bookings || [];
      setBookings(allBookings);
      
      // Calculate revenue (excluding cancelled bookings)
      const activeBookings = allBookings.filter(b => b.status !== 'cancelled');
      const totalRevenue = activeBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
      const totalPaid = activeBookings.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);
      const totalDue = activeBookings.reduce((sum, b) => sum + parseFloat(b.due_amount || 0), 0);
      
      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRevenue = activeBookings
        .filter(b => new Date(b.created_at).setHours(0, 0, 0, 0) === today.getTime())
        .reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);
      
      setRevenue({
        total: totalRevenue,
        paid: totalPaid,
        due: totalDue,
        todayRevenue: todayRevenue
      });
      
      // Initialize edit form with current hotel data
      if (res.data.hotel) {
        setEditForm({
          name: res.data.hotel.name || '',
          address: res.data.hotel.address || '',
          country: res.data.hotel.country || '',
          state: res.data.hotel.state || '',
          city: res.data.hotel.city || '',
          pincode: res.data.hotel.pincode || '',
          contact_no: res.data.hotel.contact_no || '',
          phone_code: '',
          phone_number: res.data.hotel.contact_no || ''
        });
      }
      
      // Fetch hotel reviews and calculate average rating
      try {
        const reviewsRes = await axios.get(
          `${USER_API}/reviews?hotel_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const hotelReviews = reviewsRes.data || [];
        setReviews(hotelReviews);
        
        if (hotelReviews.length > 0) {
          const avg = (hotelReviews.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0) / hotelReviews.length).toFixed(1);
          setAverageRating(parseFloat(avg));
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    } catch (error) {
      console.error("Failed to fetch hotel:", error);
      setError("Failed to load hotel details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load cities based on search input (lazy loading with AsyncSelect)
  const loadCities = useCallback(async (searchValue) => {
    if (!searchValue || searchValue.trim().length < 2) {
      return [];
    }

    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/hotel/cities/search`, {
        params: { search: searchValue, limit: 15 },
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.cities || [];
    } catch (err) {
      console.error("Failed to load cities", err);
      return [];
    }
  }, []);

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
        <h5 style={{ color: '#6b7280', fontWeight: '600', fontSize: '1rem' }}>Loading hotel details...</h5>
      </div>
    );
  }

  if (error) {
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
            <XCircle style={{ color: '#dc2626', flexShrink: 0 }} size={24} />
            <span style={{ color: '#991b1b', fontWeight: '500' }}>{error}. Or may you have logged logout</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f3ff 100%)', padding: '2rem' }}>
        <div className="container-xl">
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <XCircle style={{ color: '#d97706', flexShrink: 0 }} size={24} />
            <span style={{ color: '#92400e', fontWeight: '500' }}>Hotel not found</span>
          </div>
        </div>
      </div>
    );
  }

  const toggleHotelStatus = async () => {
    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.put(
        `${API_URL}/${id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setHotel((prev) => ({
        ...prev,
        status: res.data.status,
      }));
    } catch (error) {
      console.error("Failed to update status", error);
      setError("Failed to update hotel status");
    }
  };

  const handleEditHotel = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem("superadmin_token");
      
      // Combine phone code and number for contact_no
      const submitData = {
        ...editForm,
        contact_no: editForm.phone_code && editForm.phone_number 
          ? `${editForm.phone_code}${editForm.phone_number}` 
          : editForm.phone_number || editForm.contact_no
      };
      
      // Remove phone_code and phone_number from submitData
      delete submitData.phone_code;
      delete submitData.phone_number;

      await axios.put(`${API_URL}/${id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEditModal(false);
      fetchHotel(); // Refresh data
    } catch (error) {
      console.error("Failed to update hotel:", error);
      setError("Failed to update hotel details");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async () => {
    setDeleting(true);
    
    try {
      const token = localStorage.getItem("superadmin_token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowDeleteModal(false);
      navigate('/superadmin/hotel'); 
    } catch (error) {
      console.error("Failed to delete hotel:", error);
      setError("Failed to delete hotel");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem("superadmin_token");
      await axios.post(`${API_URL}/${id}/users`, userForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowUserModal(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin'
      });
      fetchHotel(); // Refresh data
    } catch (error) {
      console.error("Failed to add user:", error);
      setError("Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: hotel.name || '',
      address: hotel.address || '',
      country: hotel.country || '',
      state: hotel.state || '',
      city: hotel.city || '',
      contact_no: hotel.contact_no || '',
      phone_code: '',
      phone_number: hotel.contact_no || ''
    });
    setShowEditModal(true);
  };


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
                onClick={() => navigate('/superadmin/hotel')}
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
                    <Building2 size={28} color="white" />
                  </div>
                  <div>
                    {hotel.name}
                    {averageRating > -1 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              style={{
                                fill: i < Math.round(averageRating) ? '#f59e0b' : '#d1d5db',
                                color: i < Math.round(averageRating) ? '#f59e0b' : '#d1d5db'
                              }}
                            />
                          ))}
                        </div>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>
                  Complete hotel management & user administration
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                onClick={toggleHotelStatus}
                style={{
                  background: hotel.status ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)' : 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  border: `1.5px solid ${hotel.status ? '#10b981' : '#ef4444'}`,
                  borderRadius: '10px',
                  padding: '0.625rem 1.25rem',
                  color: hotel.status ? '#059669' : '#dc2626',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {hotel.status ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {hotel.status ? 'Active' : 'Inactive'}
              </Button>
              
              <Button
                onClick={openEditModal}
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
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Edit3 size={18} />
                Edit Hotel
              </Button>
              
              <Button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.625rem 1.25rem',
                  color: 'white',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Trash2 size={18} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {error && (
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
            <XCircle style={{ color: '#dc2626', flexShrink: 0 }} size={24} />
            <span style={{ color: '#991b1b', fontWeight: '500', flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
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

        {/* Hotel Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Hotel Details Card */}
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
              Hotel Information
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
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
                  {hotel.name}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #06b6d4'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Contact Number
                </label>
                <div style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="#06b6d4" />
                  {hotel.contact_no}
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '10px',
                borderLeft: '3px solid #10b981'
              }}>
                <label style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  Address
                </label>
                <div style={{ color: '#1f2937', fontSize: '0.95rem', fontWeight: '500' }}>
                  {hotel.address}
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
                    City
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} color="#0284c7" />
                    {hotel.city}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '10px',
                  borderTop: '2px solid #d97706'
                }}>
                  <label style={{ color: '#78350f', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    State
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.95rem', fontWeight: '600' }}>
                    {hotel.state}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  borderRadius: '10px',
                  borderTop: '2px solid #ec4899'
                }}>
                  <label style={{ color: '#831843', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    Country
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.95rem', fontWeight: '600' }}>
                    {hotel.country}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  borderRadius: '10px',
                  borderTop: '2px solid #3b82f6'
                }}>
                  <label style={{ color: '#1e40af', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    Pincode
                  </label>
                  <div style={{ color: '#1f2937', fontSize: '0.95rem', fontWeight: '600' }}>
                    {hotel.pincode || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
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
              marginBottom: '2rem',
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
                <Users size={20} color="white" />
              </div>
              Users Statistics
            </h5>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Total Users - Main Stat */}
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
                    Total Users
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    lineHeight: '1'
                  }}>
                    {users.length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    opacity: 0.85,
                    fontWeight: '500'
                  }}>
                    Assigned to this hotel
                  </div>
                </div>
              </div>

              {/* Active and Inactive Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Active Users */}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={14} color="#22c55e" />
                      </div>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#16a34a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        Active
                      </span>
                    </div>
                    <div style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: '#059669',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      {users.filter(u => u.status).length}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Users online
                    </div>
                  </div>
                </div>

                {/* Inactive Users */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fef9f8 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #fecaca',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <XCircle size={14} color="#ef4444" />
                      </div>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#b91c1c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        Inactive
                      </span>
                    </div>
                    <div style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: '#dc2626',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      {users.filter(u => !u.status).length}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Users offline
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280'
                  }}>
                    Activity Status
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {users.length > 0 ? Math.round((users.filter(u => u.status).length / users.length) * 100) : 0}%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                    width: users.length > 0 ? `${(users.filter(u => u.status).length / users.length) * 100}%` : 0,
                    transition: 'width 0.3s ease',
                    borderRadius: '10px'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Statistics Card */}
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
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </div>
              Bookings Statistics
            </h5>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Total Bookings */}
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
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
                    Total Bookings
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    lineHeight: '1'
                  }}>
                    {bookings.length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    opacity: 0.85,
                    fontWeight: '500'
                  }}>
                    All bookings for this hotel
                  </div>
                </div>
              </div>

              {/* Booking Status Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {/* Confirmed */}
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #93c5fd',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#1e40af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        Confirmed
                      </span>
                    </div>
                    <div style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: '#3b82f6',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      {bookings.filter(b => b.confirm_booking === true).length}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Confirmed bookings
                    </div>
                  </div>
                </div>

                {/* Pending */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #fcd34d',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(217, 119, 6, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#92400e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        Pending
                      </span>
                    </div>
                    <div style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: '#d97706',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      {bookings.filter(b => b.confirm_booking === false).length}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Pending confirmation
                    </div>
                  </div>
                </div>

                {/* Inactive */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fef9f8 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #fecaca',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#b91c1c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}>
                        Inactive
                      </span>
                    </div>
                    <div style={{
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      color: '#dc2626',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      {bookings.filter(b => b.status === 'inactive' || b.status === 'cancelled').length}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Cancelled/Inactive
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Statistics Card */}
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
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              Revenue Statistics
            </h5>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Total Revenue */}
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                    Total Revenue
                  </div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    lineHeight: '1'
                  }}>
                    ₹{revenue.total.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    opacity: 0.85,
                    fontWeight: '500'
                  }}>
                    From all bookings
                  </div>
                </div>
              </div>

              {/* Revenue Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {/* Paid Amount */}
                <div style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #6ee7b7',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#065f46',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      marginBottom: '0.75rem'
                    }}>
                      Paid Amount
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: '#10b981',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      ₹{revenue.paid.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Amount received
                    </div>
                  </div>
                </div>

                {/* Due Amount */}
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #fca5a5',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#7f1d1d',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      marginBottom: '0.75rem'
                    }}>
                      Due Amount
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: '#ef4444',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      ₹{revenue.due.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Amount pending
                    </div>
                  </div>
                </div>

                {/* Average per Booking */}
                <div style={{
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1.5px solid #fbcfe8',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(236, 72, 153, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#831843',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      marginBottom: '0.75rem'
                    }}>
                      Today's Revenue
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      color: '#ec4899',
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      ₹{revenue.todayRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Revenue collected today
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status Bar */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280'
                  }}>
                    Payment Status
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {revenue.total > 0 ? Math.round((revenue.paid / revenue.total) * 100) : 0}% Paid
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    width: revenue.total > 0 ? `${(revenue.paid / revenue.total) * 100}%` : 0,
                    transition: 'width 0.3s ease',
                    borderRadius: '10px'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }}
        >
          {/* Header */}
          <div style={{
            padding: '2rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: '#f9fafb'
          }}>
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0,
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
                <Users size={20} color="#4f46e5" />
              </div>
              Hotel Users ({users.length})
            </h5>
            <Button
              onClick={() => setShowUserModal(true)}
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
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <UserPlus size={18} />
              Add User
            </Button>
          </div>

          {/* Users Grid */}
          <div style={{ padding: '2rem' }}>
            {users.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = '#c7d2fe';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '60px',
                      height: '60px',
                      background: `linear-gradient(135deg, ${user.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(34, 197, 94, 0.1)'} 0%, rgba(0, 0, 0, 0) 100%)`,
                      borderRadius: '0 12px 0 40px'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h6 style={{
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: '0.5rem',
                            fontSize: '1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {user.name}
                          </h6>
                          <small style={{
                            color: '#6b7280',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Mail size={12} />
                            {user.email}
                          </small>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'capitalize',
                          background: user.role === 'admin' ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                          color: user.role === 'admin' ? '#4f46e5' : '#059669',
                          border: `1px solid ${user.role === 'admin' ? '#c7d2fe' : '#a7f3d0'}`
                        }}>
                          {user.role}
                        </span>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          width: '100%',
                          justifyContent: 'center',
                          background: user.status ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                          color: user.status ? '#059669' : '#dc2626',
                          border: `1px solid ${user.status ? '#a7f3d0' : '#fecaca'}`
                        }}>
                          {user.status ? (
                            <>
                              <CheckCircle size={12} />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>

                      <div className="dropdown" style={{ marginTop: '1rem' }}>
                        <button
                          style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          data-bs-toggle="dropdown"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                          }}
                        >
                          <MoreVertical size={16} color="#6b7280" />
                        </button>
                        <ul className="dropdown-menu" style={{ fontSize: '0.9rem' }}>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center"
                              onClick={() => {
                                setEditingUser(user);
                                setUserForm({
                                  name: user.name,
                                  email: user.email,
                                  password: '',
                                  password_confirmation: '',
                                  role: user.role
                                });
                                setShowUserModal(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                width: '100%',
                                color: '#4f46e5',
                                fontWeight: '500'
                              }}
                            >
                              <Edit3 size={14} />
                              Edit User
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#f3f4f6',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Users size={40} color="#9ca3af" />
                </div>
                <h5 style={{ color: '#1f2937', fontWeight: '600', marginBottom: '0.5rem' }}>
                  No Users Found
                </h5>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  This hotel doesn't have any assigned users yet.
                </p>
                <Button
                  onClick={() => setShowUserModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.625rem 1.25rem',
                    color: 'white',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <UserPlus size={18} />
                  Add First User
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Hotel Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border: 'none',
            padding: '1.5rem',
            borderRadius: '16px 16px 0 0'
          }}
        >
          <Modal.Title style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Edit3 size={24} />
            Edit Hotel Details
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditHotel}>
          <Modal.Body style={{ padding: '2rem', background: '#ffffff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Hotel Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#4f46e5'
                  }} />
                  <Form.Control
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter hotel name"
                    required
                    style={{
                      paddingLeft: '2.75rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Phone Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#10b981'
                  }} />
                  <Form.Control
                    type="text"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                    placeholder="Enter phone number"
                    style={{
                      paddingLeft: '2.75rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    color: '#06b6d4'
                  }} />
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="Enter full address"
                    required
                    style={{
                      paddingLeft: '2.75rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Country <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Form.Select
                  value={editForm.country}
                  onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                  required
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.9rem',
                    minHeight: '40px'
                  }}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  State <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Form.Select
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                  required
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.9rem',
                    minHeight: '40px'
                  }}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  City <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {/* AsyncSelect for lazy-loaded cities - only fetches when user types */}
                <AsyncSelect
                  loadOptions={loadCities}
                  value={editForm.city ? { value: editForm.city, label: editForm.city } : null}
                  onChange={(selected) => setEditForm({...editForm, city: selected ? selected.value : ''})}
                  placeholder="Type to search cities"
                  isClearable
                  isSearchable
                  cacheOptions={false}
                  defaultOptions={false}
                  minMenuHeight={200}
                  maxMenuHeight={300}
                  noOptionsMessage={() => 'No cities found. Type at least 2 characters.'}
                  loadingMessage={() => 'Loading cities...'}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.125rem 0.25rem',
                      fontSize: '0.9rem',
                      minHeight: '40px',
                      backgroundColor: '#ffffff',
                      '&:hover': { borderColor: '#4f46e5' },
                      '&:focus-within': { borderColor: '#4f46e5', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)' }
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999
                    })
                  }}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Pincode <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Form.Control
                  type="text"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({...editForm, pincode: e.target.value})}
                  placeholder="Enter pincode (5-8 digits)"
                  required
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0 0 16px 16px',
            padding: '1.5rem',
            gap: '0.75rem'
          }}>
            <Button
              onClick={() => setShowEditModal(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                fontWeight: '600',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <X size={16} style={{ marginRight: '0.5rem' }} />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <div className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Hotel Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            padding: '1.5rem',
            borderRadius: '16px 16px 0 0'
          }}
        >
          <Modal.Title style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Trash2 size={24} />
            Delete Hotel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '2rem', textAlign: 'center', background: '#ffffff' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Trash2 size={40} color="#dc2626" />
          </div>
          <h4 style={{ color: '#dc2626', fontWeight: '700', marginBottom: '1rem' }}>
            Are you sure?
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: 0 }}>
            This action cannot be undone. This will permanently delete the hotel <strong>"{hotel?.name}"</strong> and all associated data including users and bookings.
          </p>
        </Modal.Body>
        <Modal.Footer style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0 0 16px 16px',
          padding: '1.5rem',
          gap: '0.75rem'
        }}>
          <Button
            onClick={() => setShowDeleteModal(false)}
            style={{
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              fontWeight: '600',
              padding: '0.625rem 1.25rem',
              cursor: 'pointer'
            }}
          >
            <X size={16} style={{ marginRight: '0.5rem' }} />
            Cancel
          </Button>
          <Button
            onClick={handleDeleteHotel}
            disabled={deleting}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              padding: '0.625rem 1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: deleting ? 0.7 : 1
            }}
          >
            {deleting ? (
              <>
                <div className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Hotel
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal show={showUserModal} onHide={() => {
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'admin'
        });
      }} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border: 'none',
            padding: '1.5rem',
            borderRadius: '16px 16px 0 0'
          }}
        >
          <Modal.Title style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <UserPlus size={24} />
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body style={{ padding: '2rem', background: '#ffffff' }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#4f46e5'
                  }} />
                  <Form.Control
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                    style={{
                      paddingLeft: '2.75rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#06b6d4'
                  }} />
                  <Form.Control
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                    style={{
                      paddingLeft: '2.75rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#1f2937',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      marginBottom: '0.75rem'
                    }}>
                      Password <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <CheckCircle size={16} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#ef4444'
                      }} />
                      <Form.Control
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        placeholder="Enter password"
                        required={!editingUser}
                        style={{
                          paddingLeft: '2.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#1f2937',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      marginBottom: '0.75rem'
                    }}>
                      Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <CheckCircle size={16} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#10b981'
                      }} />
                      <Form.Control
                        type="password"
                        value={userForm.password_confirmation}
                        onChange={(e) => setUserForm({...userForm, password_confirmation: e.target.value})}
                        placeholder="Confirm password"
                        required={!editingUser}
                        style={{
                          paddingLeft: '2.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          padding: '0.625rem 0.875rem 0.625rem 2.75rem',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{
                  display: 'block',
                  color: '#1f2937',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem'
                }}>
                  Role <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Form.Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.9rem',
                    minHeight: '40px'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </Form.Select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0 0 16px 16px',
            padding: '1.5rem',
            gap: '0.75rem'
          }}>
            <Button
              onClick={() => {
                setShowUserModal(false);
                setEditingUser(null);
                setUserForm({
                  name: '',
                  email: '',
                  password: '',
                  password_confirmation: '',
                  role: 'admin'
                });
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                fontWeight: '600',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer'
              }}
            >
              <X size={16} style={{ marginRight: '0.5rem' }} />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <div className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {editingUser ? 'Update User' : 'Add User'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
          outline: none;
        }

        .dropdown-item {
          padding: 0.75rem 1rem;
          color: #4f46e5;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: #f3f4f6;
          color: #4f46e5;
        }

        .form-control::placeholder {
          color: #9ca3af;
        }

        .spinner-border-sm {
          border-width: 0.2em;
        }
      `}</style>
    </div>
  );
}

export default HotelDetails;
