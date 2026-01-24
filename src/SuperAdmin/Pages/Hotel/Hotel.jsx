import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Card, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import {
  Plus,
  Building2,
  MapPin,
  Phone,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { SUPER_ADMIN_API } from '../../../config/api';

const API_URL = `${SUPER_ADMIN_API}/hotel`;

const initialForm = {
  name: "",
  address: "",
  country: "",
  city: "",
  state: "",
  pincode: "",
  contact_no: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "admin",
};

function Hotel() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [hotels, setHotels] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Memoize select options to prevent performance issues
  const countryOptions = useMemo(() => 
    countries.map(c => ({ value: c.name, label: c.name })), [countries]
  );

  const stateOptions = useMemo(() => 
    states.map(s => ({ value: s.name, label: s.name })), [states]
  );

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setDataLoading(true);

      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/hotel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(res.data.hotel || []);
      setCountries(res.data.country || []);
      setStates(res.data.state || []);
      // Do NOT load all cities - they'll be loaded lazily via AsyncSelect
    } catch (err) {
      console.error("Failed to load hotels", err);
      setServerError("Failed to load hotels. Please try again.");
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("superadmin_token");
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/hotel`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData(initialForm);
      setShowModal(false);
      fetchHotels();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter hotels based on search and status
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hotel.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
                           (statusFilter === "active" && hotel.status) ||
                           (statusFilter === "inactive" && !hotel.status);
      return matchesSearch && matchesStatus;
    });
  }, [hotels, searchTerm, statusFilter]);

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

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
    setServerError("");
    setShowModal(false);
  };

  if (dataLoading) {
    return (
      <div className="hotel-management-container" style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem', borderWidth: '0.3em' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 style={{ color: '#6b7280', fontWeight: '500', marginTop: '1rem' }}>Loading hotels...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-management-container" style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '2rem' }}>
      {/* Page Header - Elegant Title Section */}
      <div className="container-xl px-3 px-lg-5 mb-5">
        <div className="row align-items-end mb-4">
          <div className="col-auto">
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={32} className="text-white" />
            </div>
          </div>
          <div className="col">
            <h1 className="mb-2 fw-bold text-dark" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
              Hotel Management
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
              Manage and oversee all hotel properties in your network
            </p>
          </div>
          <div className="col-auto d-flex gap-2">
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center px-3 py-2"
              onClick={() => fetchHotels(true)}
              disabled={refreshing}
              style={{ borderRadius: '8px', fontWeight: '500', borderColor: '#dee2e6' }}
            >
              <RefreshCw size={16} className={`me-2 ${refreshing ? 'spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="dark"
              className="d-flex align-items-center px-4 py-2"
              onClick={() => setShowModal(true)}
              style={{ borderRadius: '8px', fontWeight: '600', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
            >
              <Plus size={18} className="me-2" />
              Add New Hotel
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {serverError && (
        <div className="container-xl px-3 px-lg-5 mb-4">
          <div className="row">
            <div className="col-12">
              <Alert variant="danger" dismissible onClose={() => setServerError("")} className="border-0 mb-0" style={{
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                background: '#fff5f5',
                borderLeft: '4px solid #dc2626',
                display: 'flex',
                alignItems: 'center'
              }}>
                <AlertTriangle className="me-3 text-danger" size={20} style={{ flexShrink: 0 }} />
                <span style={{ color: '#991b1b', fontWeight: '500' }}>{serverError}</span>
              </Alert>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - Modern Cards */}
      <div className="container-xl px-3 px-lg-5 mb-5">
        <div className="row g-3">
          {/* Total Properties Card */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card" style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '280px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                borderRadius: '0 12px 0 80px',
                zIndex: 0
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(79, 70, 229, 0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 size={24} style={{ color: '#4f46e5' }} />
                  </div>
                </div>
                <h5 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {hotels.length}
                </h5>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem' }}>
                  Total Properties
                </p>
                <div className="d-flex gap-3">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669', marginBottom: '0.25rem' }}>
                      {hotels.filter(h => h.status).length}
                    </div>
                    <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>Active</small>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.25rem' }}>
                      {hotels.filter(h => !h.status).length}
                    </div>
                    <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>Inactive</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Hotels Card */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card" style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '280px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                borderRadius: '0 12px 0 80px',
                zIndex: 0
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(5, 150, 105, 0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle size={24} style={{ color: '#059669' }} />
                  </div>
                </div>
                <h5 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {hotels.filter(h => h.status).length}
                </h5>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem' }}>
                  Active Hotels
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '0.375rem 0.75rem',
                  background: 'rgba(5, 150, 105, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#059669'
                }}>
                  ✓ Operational
                </div>
              </div>
            </div>
          </div>

          {/* Inactive Hotels Card */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card" style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '280px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                borderRadius: '0 12px 0 80px',
                zIndex: 0
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(220, 38, 38, 0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <XCircle size={24} style={{ color: '#dc2626' }} />
                  </div>
                </div>
                <h5 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {hotels.filter(h => !h.status).length}
                </h5>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem' }}>
                  Inactive Hotels
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '0.375rem 0.75rem',
                  background: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#dc2626'
                }}>
                  ⚠ Maintenance
                </div>
              </div>
            </div>
          </div>

          {/* Growth Indicator */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '280px'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(79, 70, 229, 0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp size={24} style={{ color: '#4f46e5' }} />
                  </div>
                </div>
                <h5 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Performance
                </h5>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem' }}>
                  System Status
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669' }}>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotels Table - Modern Data Grid */}
      <div className="container-xl px-3 px-lg-5">
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Table Header Section */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            background: '#ffffff'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center" style={{ fontSize: '1rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>
                  <Building2 size={16} style={{ color: '#4f46e5' }} />
                </div>
                All Hotels ({filteredHotels.length})
              </h5>

              {/* Search and Filter Controls */}
              <div className="d-flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: '250px' }}>
                  <Search size={16} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: '2.5rem',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    minWidth: '140px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: 'none'
                  }}>Hotel Details</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: 'none'
                  }}>Location</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: 'none'
                  }}>Contact</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: 'none'
                  }}>Status</th>
                  <th style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: 'none',
                    textAlign: 'center'
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    className="hotel-table-row"
                    onClick={() => navigate(`/superadmin/hotel/${hotel.id}`)}
                  >
                    <td style={{ padding: '1rem 1.5rem', verticalAlign: 'middle' }}>
                      <div className="d-flex align-items-center">
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          flexShrink: 0
                        }}>
                          <Building2 size={18} style={{ color: '#4f46e5' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {hotel.name}
                          </div>
                          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Property ID: {hotel.id}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', verticalAlign: 'middle' }}>
                      <div className="d-flex align-items-center">
                        <MapPin size={16} style={{ color: '#9ca3af', marginRight: '0.5rem', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {hotel.city}
                          </div>
                          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                            {hotel.state}, {hotel.country}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', verticalAlign: 'middle' }}>
                      <div className="d-flex align-items-center">
                        <Phone size={16} style={{ color: '#9ca3af', marginRight: '0.5rem', flexShrink: 0 }} />
                        <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.95rem' }}>
                          {hotel.contact_no}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', verticalAlign: 'middle' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: hotel.status ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                        color: hotel.status ? '#059669' : '#dc2626'
                      }}>
                        {hotel.status ? (
                          <>
                            <CheckCircle size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Inactive
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-inline-flex align-items-center hotel-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/superadmin/hotel/${hotel.id}`);
                        }}
                        style={{
                          borderRadius: '8px',
                          border: '1.5px solid #4f46e5',
                          color: '#4f46e5',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          padding: '0.5rem 0.875rem',
                          gap: '0.5rem'
                        }}
                      >
                        <Eye size={14} />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredHotels.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          background: '#f3f4f6',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem'
                        }}>
                          <Building2 size={32} style={{ color: '#9ca3af' }} />
                        </div>
                        <h5 style={{ color: '#1f2937', fontWeight: '600', marginBottom: '0.5rem' }}>No hotels found</h5>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Click 'Add New Hotel' to get started and create your first property"
                          }
                        </p>
                        {(searchTerm || statusFilter !== "all") && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                            style={{ borderRadius: '8px', fontSize: '0.875rem', fontWeight: '500' }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={resetForm} size="lg" centered scrollable>
        <Modal.Header closeButton style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <Modal.Title className="d-flex align-items-center fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.75rem'
            }}>
              <Plus size={22} className="text-white" />
            </div>
            Create New Hotel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '2rem', background: '#ffffff' }}>
          {serverError && (
            <Alert variant="danger" className="border-0 mb-4" style={{
              borderRadius: '10px',
              padding: '1rem',
              background: '#fff5f5',
              borderLeft: '4px solid #dc2626'
            }}>
              <div className="d-flex align-items-start">
                <AlertTriangle style={{ color: '#dc2626', marginRight: '1rem', marginTop: '0.125rem', flexShrink: 0 }} size={18} />
                <div>
                  <strong style={{ color: '#991b1b' }}>Error:</strong>
                  <p style={{ color: '#991b1b', marginBottom: 0, marginTop: '0.25rem' }}>{serverError}</p>
                </div>
              </div>
            </Alert>
          )}

          <form>
            {/* Hotel Information Section */}
            <div className="mb-4">
              <h6 style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={14} style={{ color: '#4f46e5' }} />
                </div>
                Hotel Information
              </h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Hotel Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter hotel name"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff'
                    }}
                  />
                  {errors.name && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.name[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Contact Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_no"
                    className={`form-control ${errors.contact_no ? "is-invalid" : ""}`}
                    value={formData.contact_no}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff'
                    }}
                  />
                  {errors.contact_no && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.contact_no[0]}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Address <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    name="address"
                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff',
                      resize: 'none'
                    }}
                  />
                  {errors.address && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.address[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Country <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <Select
                    options={countryOptions}
                    value={formData.country ? { value: formData.country, label: formData.country } : null}
                    onChange={(selected) => setFormData({ ...formData, country: selected ? selected.value : '' })}
                    placeholder="Select Country"
                    isClearable
                    isLoading={dataLoading}
                    classNamePrefix="modern-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: errors.country ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        minHeight: '40px',
                        fontSize: '0.9rem',
                        backgroundColor: '#ffffff',
                        '&:hover': { borderColor: '#4f46e5' },
                        '&:focus-within': { borderColor: '#4f46e5', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)' }
                      }),
                      placeholder: (base) => ({ ...base, color: '#9ca3af' })
                    }}
                  />
                  {errors.country && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.country[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    State <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <Select
                    options={stateOptions}
                    value={formData.state ? { value: formData.state, label: formData.state } : null}
                    onChange={(selected) => setFormData({ ...formData, state: selected ? selected.value : '' })}
                    placeholder="Select State"
                    isClearable
                    isLoading={dataLoading}
                    classNamePrefix="modern-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: errors.state ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        minHeight: '40px',
                        fontSize: '0.9rem',
                        backgroundColor: '#ffffff',
                        '&:hover': { borderColor: '#4f46e5' },
                        '&:focus-within': { borderColor: '#4f46e5', boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)' }
                      }),
                      placeholder: (base) => ({ ...base, color: '#9ca3af' })
                    }}
                  />
                  {errors.state && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.state[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    City <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {/* AsyncSelect for lazy-loaded cities - only fetches when user types */}
                  <AsyncSelect
                    loadOptions={loadCities}
                    value={formData.city ? { value: formData.city, label: formData.city } : null}
                    onChange={(selected) => setFormData({ ...formData, city: selected ? selected.value : '' })}
                    placeholder="Type to search cities"
                    isClearable
                    isSearchable
                    cacheOptions={false}
                    defaultOptions={false}
                    minMenuHeight={200}
                    maxMenuHeight={300}
                    classNamePrefix="modern-select"
                    noOptionsMessage={() => 'No cities found. Type at least 2 characters.'}
                    loadingMessage={() => 'Loading cities...'}
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: errors.city ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        minHeight: '40px',
                        fontSize: '0.9rem',
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
                      }),
                      placeholder: (base) => ({ ...base, color: '#9ca3af' })
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  />
                  {errors.city && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.city[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Pincode <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode (5-8 digits)"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff'
                    }}
                  />
                  {errors.pincode && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.pincode[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#e5e7eb', margin: '2rem 0' }} />

            {/* Admin Account Section */}
            <div className="mb-0">
              <h6 style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={14} style={{ color: '#22c55e' }} />
                </div>
                Admin Account
              </h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Admin Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter admin email"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff'
                    }}
                  />
                  {errors.email && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.email[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff'
                    }}
                  />
                  {errors.password && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.password[0]}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                    Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      padding: '0.625rem 0.875rem',
                      fontSize: '0.9rem',
                      background: '#ffffff'
                    }}
                  />
                  {errors.password_confirmation && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '500' }}>
                      {errors.password_confirmation[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '1.5rem',
          gap: '0.75rem'
        }}>
          <Button
            variant="outline-secondary"
            onClick={resetForm}
            style={{
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              borderColor: '#d1d5db',
              color: '#374151'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || dataLoading}
            className="d-flex align-items-center"
            style={{
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              padding: '0.625rem 1.25rem'
            }}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} className="me-2" />
                Create Hotel
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .hotel-management-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #d1d5db;
        }

        .hotel-table-row:hover {
          background-color: #f9fafb !important;
        }

        .hotel-action-btn {
          transition: all 0.2s ease;
        }

        .hotel-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2) !important;
          background-color: #f5f3ff !important;
        }

        .form-control:focus, .form-select:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          outline: none;
        }

        .form-control::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .modern-select__control {
          border-radius: 8px !important;
          border: 1px solid #d1d5db !important;
          min-height: 40px !important;
          background-color: #ffffff !important;
        }

        .modern-select__control:hover {
          border-color: #4f46e5 !important;
        }

        .modern-select__control--is-focused {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
        }

        .modern-select__menu {
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .modern-select__option--is-selected {
          background-color: #4f46e5 !important;
          color: #ffffff !important;
        }

        .modern-select__option--is-focused {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .table {
          border-collapse: collapse;
        }

        .table tbody tr {
          transition: background-color 0.15s ease;
        }

        .invalid-feedback {
          display: block !important;
          font-size: 0.75rem;
          color: #dc2626;
          font-weight: 500;
          margin-top: 0.375rem;
        }

        .is-invalid {
          border-color: #dc2626 !important;
          background-color: #fff5f5 !important;
        }

        .btn-outline-primary {
          transition: all 0.2s ease;
        }

        .btn-outline-primary:hover {
          background-color: #f5f3ff;
          transform: translateY(-1px);
        }

        .form-control {
          transition: all 0.2s ease;
        }

        .form-select {
          transition: all 0.2s ease;
        }

        @media (max-width: 768px) {
          .container-xl {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          .d-flex {
            flex-wrap: wrap;
          }

          .table {
            font-size: 0.875rem;
          }

          .hotel-action-btn {
            padding: 0.375rem 0.625rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Hotel;