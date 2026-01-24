import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  ArrowRight,
  RefreshCw,
  TrendingDown,
  Award,
  Phone,
  MapPin,
  Crown
} from 'lucide-react';
import { Card, Row, Col, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = "http://127.0.0.1:8000/api/superadmin/dashboard";

export default function SuperAdmin() {
  const [stats, setStats] = useState({
    hotel: 0,
    activeHotel: 0,
    inactiveHotel: 0,
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    hotelStats: [],
    topHotel: null,
    monthlyRevenue: [],
    bookingStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const token = localStorage.getItem("superadmin_token");

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setStats(res.data);
    } catch (err) {
      console.error("Dashboard error:", err.response || err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-success' : 'text-danger';
  };

  const COLORS = ['#667eea', '#764ba2', '#ff6b6b', '#ffd93d', '#6bcf7f'];

  const pieData = stats.bookingStatus?.map(item => ({
    name: item.status || 'Unknown',
    value: item.count || 0
  })) || [];

  if (loading) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="text-muted">Loading dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f5ff', minHeight: '100vh', paddingBottom: '3rem' }}>
      <div className="container-fluid px-4 py-4">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-2 fw-bold text-dark d-flex align-items-center" style={{ fontSize: '2.5rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginRight: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BarChart3 size={36} color="white" />
                  </div>
                  Super Admin Dashboard
                </h1>
                <p className="text-muted mb-0 fs-6">Monitor and manage your complete hotel network</p>
              </div>
              <Button
                variant="outline-primary"
                className="d-flex align-items-center"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                style={{
                  borderRadius: '8px',
                  padding: '10px 20px',
                  borderWidth: '2px'
                }}
              >
                <RefreshCw size={16} className={`me-2 ${refreshing ? 'spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="d-flex align-items-center" style={{ borderRadius: '10px' }}>
                <XCircle className="me-2" size={20} />
                {error}
              </Alert>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="row g-4 mb-5">
          {/* Total Hotels */}
          <div className="col-xl-3 col-lg-6 col-md-6">
            <Link to="/superadmin/hotel" style={{ textDecoration: 'none' }}>
              <Card className="h-100 border-0 shadow-sm hover-lift metric-card" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '16px'
              }}>
                <Card.Body className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="mb-1 opacity-75 fs-7">TOTAL HOTELS</p>
                    <h2 className="mb-2 fw-bold">{stats.hotel}</h2>
                    <small className="opacity-75">Registered in system</small>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px',
                    borderRadius: '10px'
                  }}>
                    <Building2 size={28} />
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </div>

          {/* Active Hotels */}
          <div className="col-xl-3 col-lg-6 col-md-6">
            <Card className="h-100 border-0 shadow-sm hover-lift metric-card" style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: '16px'
            }}>
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 fs-7">ACTIVE HOTELS</p>
                  <h2 className="mb-2 fw-bold">{stats.activeHotel}</h2>
                  <small className="opacity-75">Currently operational</small>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px',
                  borderRadius: '10px'
                }}>
                  <CheckCircle size={28} />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Total Bookings */}
          <div className="col-xl-3 col-lg-6 col-md-6">
            <Card className="h-100 border-0 shadow-sm hover-lift metric-card" style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '16px'
            }}>
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 fs-7">TOTAL BOOKINGS</p>
                  <h2 className="mb-2 fw-bold">{stats.totalBookings}</h2>
                  <small className="opacity-75">Across all hotels</small>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px',
                  borderRadius: '10px'
                }}>
                  <Calendar size={28} />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Total Revenue */}
          <div className="col-xl-3 col-lg-6 col-md-6">
            <Card className="h-100 border-0 shadow-sm hover-lift metric-card" style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: 'white',
              borderRadius: '16px'
            }}>
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 fs-7">TOTAL REVENUE</p>
                  <h2 className="mb-2 fw-bold">{formatCurrency(stats.totalRevenue)}</h2>
                  <small className="opacity-75">All-time revenue</small>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px',
                  borderRadius: '10px'
                }}>
                  <DollarSign size={28} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="row g-4 mb-5">
          {/* Completed Bookings */}
          <div className="col-xl-3 col-lg-6">
            <Card className="h-100 border-0 shadow-sm" style={{
              borderRadius: '16px',
              borderLeft: '5px solid #4ade80'
            }}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <p className="text-muted mb-1">Completed Bookings</p>
                    <h3 className="fw-bold text-dark mb-0">{stats.completedBookings}</h3>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '12px',
                    borderRadius: '10px'
                  }}>
                    <CheckCircle size={24} className="text-success" />
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings * 100) + '%' : '0%' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Pending Bookings */}
          <div className="col-xl-3 col-lg-6">
            <Card className="h-100 border-0 shadow-sm" style={{
              borderRadius: '16px',
              borderLeft: '5px solid #f59e0b'
            }}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <p className="text-muted mb-1">Pending Bookings</p>
                    <h3 className="fw-bold text-dark mb-0">{stats.pendingBookings}</h3>
                  </div>
                  <div style={{
                    background: '#fffbeb',
                    padding: '12px',
                    borderRadius: '10px'
                  }}>
                    <Activity size={24} className="text-warning" />
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings * 100) + '%' : '0%' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Inactive Hotels */}
          <div className="col-xl-3 col-lg-6">
            <Card className="h-100 border-0 shadow-sm" style={{
              borderRadius: '16px',
              borderLeft: '5px solid #ef4444'
            }}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <p className="text-muted mb-1">Inactive Hotels</p>
                    <h3 className="fw-bold text-dark mb-0">{stats.inactiveHotel}</h3>
                  </div>
                  <div style={{
                    background: '#fef2f2',
                    padding: '12px',
                    borderRadius: '10px'
                  }}>
                    <XCircle size={24} className="text-danger" />
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{ width: stats.hotel > 0 ? (stats.inactiveHotel / stats.hotel * 100) + '%' : '0%' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Avg Revenue per Booking */}
          <div className="col-xl-3 col-lg-6">
            <Card className="h-100 border-0 shadow-sm" style={{
              borderRadius: '16px',
              borderLeft: '5px solid #8b5cf6'
            }}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <p className="text-muted mb-1">Avg Revenue/Booking</p>
                    <h3 className="fw-bold text-dark mb-0">{formatCurrency(stats.totalBookings > 0 ? stats.totalRevenue / stats.totalBookings : 0)}</h3>
                  </div>
                  <div style={{
                    background: '#faf5ff',
                    padding: '12px',
                    borderRadius: '10px'
                  }}>
                    <TrendingUp size={24} className="text-purple" />
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar" style={{ width: '100%', background: '#8b5cf6' }} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-4 mb-5">
          {/* Monthly Revenue Chart */}
          <div className="col-xl-8">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-4" style={{ borderRadius: '16px 16px 0 0' }}>
                <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center">
                  <TrendingUp className="me-2" size={22} style={{ color: '#667eea' }} />
                  Monthly Revenue Trend
                </h5>
              </Card.Header>
              <Card.Body>
                {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={{ fill: '#667eea', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">No data available</div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Booking Status Distribution */}
          <div className="col-xl-4">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-4" style={{ borderRadius: '16px 16px 0 0' }}>
                <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center">
                  <Activity className="me-2" size={22} style={{ color: '#f5576c' }} />
                  Booking Status
                </h5>
              </Card.Header>
              <Card.Body>
                {pieData && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">No data available</div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Top Performing Hotel */}
        {stats.topHotel && (
          <div className="row mb-5">
            <div className="col-12">
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      padding: '12px',
                      borderRadius: '10px',
                      marginRight: '16px'
                    }}>
                      <Crown size={28} color="white" />
                    </div>
                    <h4 className="mb-0 fw-bold text-dark">Top Performing Hotel</h4>
                  </div>
                  <div className="row g-4">
                    <div className="col-md-8">
                      <h3 className="fw-bold text-dark mb-3">{stats.topHotel.name}</h3>
                      <div className="row g-3">
                        <div className="col-6 col-md-3">
                          <div className="text-center p-3" style={{ backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                            <p className="text-muted mb-2">Status</p>
                            <h5 className={`mb-0 fw-bold ${getStatusColor(stats.topHotel.status)}`}>
                              {stats.topHotel.status.toUpperCase()}
                            </h5>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="text-center p-3" style={{ backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                            <p className="text-muted mb-2">Total Bookings</p>
                            <h5 className="mb-0 fw-bold text-primary">{stats.topHotel.bookings}</h5>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="text-center p-3" style={{ backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                            <p className="text-muted mb-2">Staff</p>
                            <h5 className="mb-0 fw-bold text-info">{stats.topHotel.users}</h5>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="text-center p-3" style={{ backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                            <p className="text-muted mb-2">Avg/Booking</p>
                            <h5 className="mb-0 fw-bold text-success">{formatCurrency(stats.topHotel.avgRevenuePerBooking)}</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        padding: '24px',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <DollarSign size={32} className="mx-auto mb-3" />
                        <p className="mb-1 opacity-75">Total Revenue</p>
                        <h2 className="fw-bold mb-0">{formatCurrency(stats.topHotel.revenue)}</h2>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* All Hotels Statistics Table */}
        <div className="row mb-5">
          <div className="col-12">
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-4" style={{ borderRadius: '16px 16px 0 0' }}>
                <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center">
                  <BarChart3 className="me-2" size={22} style={{ color: '#667eea' }} />
                  All Hotels Performance
                </h5>
              </Card.Header>
              <Card.Body>
                {stats.hotelStats && stats.hotelStats.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <Table hover className="mb-0">
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th className="py-3 fw-bold text-dark">Hotel Name</th>
                          <th className="py-3 fw-bold text-dark">Status</th>
                          <th className="py-3 fw-bold text-dark">Staff</th>
                          <th className="py-3 fw-bold text-dark">Total Bookings</th>
                          <th className="py-3 fw-bold text-dark">Revenue</th>
                          <th className="py-3 fw-bold text-dark">Avg Per Booking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.hotelStats.map((hotel, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <div style={{
                                  background: '#667eea',
                                  color: 'white',
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '12px',
                                  fontSize: '14px',
                                  fontWeight: 'bold'
                                }}>
                                  {hotel.name.charAt(0)}
                                </div>
                                <span className="fw-semibold text-dark">{hotel.name}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`badge ${hotel.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                {hotel.status}
                              </span>
                            </td>
                            <td className="py-3 fw-semibold text-dark">{hotel.users}</td>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <Calendar size={16} className="me-2 text-primary" />
                                <span className="fw-semibold text-dark">{hotel.bookings}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="fw-bold text-success">{formatCurrency(hotel.revenue)}</span>
                            </td>
                            <td className="py-3">
                              <span className="fw-semibold text-info">{formatCurrency(hotel.avgRevenuePerBooking)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">No hotels data available</div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-5">
          <div className="col-12">
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-4" style={{ borderRadius: '16px 16px 0 0' }}>
                <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center">
                  <Activity className="me-2" size={22} style={{ color: '#22c55e' }} />
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6} lg={3}>
                    <Link to="/superadmin/hotel" style={{ textDecoration: 'none' }}>
                      <Card className="h-100 border-0 shadow-sm hover-lift text-center" style={{ cursor: 'pointer', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                        <Card.Body className="py-4">
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                          }}>
                            <Building2 size={28} color="white" />
                          </div>
                          <h6 className="fw-semibold text-dark mb-2">Manage Hotels</h6>
                          <small className="text-muted">Add, edit, or remove hotels</small>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>

                  <Col md={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm text-center hover-lift" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', cursor: 'pointer' }}>
                      <Card.Body className="py-4">
                        <div style={{
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <Users size={28} color="white" />
                        </div>
                        <h6 className="fw-semibold text-dark mb-2">User Management</h6>
                        <small className="text-muted">Manage hotel staff</small>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm text-center hover-lift" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', cursor: 'pointer' }}>
                      <Card.Body className="py-4">
                        <div style={{
                          background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <DollarSign size={28} color="white" />
                        </div>
                        <h6 className="fw-semibold text-dark mb-2">Revenue Reports</h6>
                        <small className="text-muted">Financial analytics</small>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm text-center hover-lift" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', cursor: 'pointer' }}>
                      <Card.Body className="py-4">
                        <div style={{
                          background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                          width: '60px',
                          height: '60px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <BarChart3 size={28} color="white" />
                        </div>
                        <h6 className="fw-semibold text-dark mb-2">Analytics</h6>
                        <small className="text-muted">Performance insights</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
        }
        .metric-card {
          transition: all 0.3s ease;
        }
        .metric-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.2) !important;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .card {
          border-radius: 16px;
        }
        .card-body {
          border-radius: 16px;
        }
        .table thead th {
          background-color: #f9fafb;
          border: none;
        }
        .table tbody tr:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}
