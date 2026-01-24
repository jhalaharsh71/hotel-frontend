import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Spinner, Alert, Button } from 'react-bootstrap';
import {
  DoorOpen,
  Zap,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Percent,
  Hotel,
  Bookmark,
} from 'lucide-react';
import './Dashboard.css';
import { ADMIN_API } from '../../config/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${ADMIN_API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modern Stat Card
  const StatCard = ({ icon: Icon, label, value, suffix = '' }) => (
    <div className="stat-box">
      <div className="stat-icon-wrapper">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h3 className="stat-number">{value}{suffix}</h3>
      </div>
    </div>
  );

  // Revenue Card
  const RevenueCard = ({ icon: Icon, label, amount }) => (
    <div className="revenue-box">
      <div className="revenue-top">
        <Icon size={20} />
        <span className="revenue-label">{label}</span>
      </div>
      <div className="revenue-amount">
        ₹{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dash-loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-error-container">
        <Alert variant="danger">
          <AlertCircle size={20} className="me-2" />
          <strong>Error</strong> {error}
        </Alert>
        <Button variant="primary" onClick={fetchDashboardData} className="mt-3">
          <RefreshCw size={16} className="me-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dash-empty-container">
        <Alert variant="warning">
          <AlertCircle size={20} className="me-2" />
          No data available
        </Alert>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <Container fluid className="dash-container">
        {/* Header Section */}
        <Row className="dash-header mb-5">
          <Col lg={6}>
            <div className="header-content">
              <h1 className="dash-title">
                <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="dash-subtitle">Hotel Management Overview</p>
            </div>
          </Col>
          <Col lg={6} className="text-lg-end text-center mt-3 mt-lg-0">
            <Button variant="outline-primary" onClick={fetchDashboardData} className="refresh-icon-btn">
              <RefreshCw size={18} /> Refresh
            </Button>
          </Col>
        </Row>

        {/* ROOMS OVERVIEW */}
        <div className="section-block">
          <h2 className="section-title">
            <Hotel size={20} /> Rooms Overview
          </h2>
          <Row className="g-4">
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={Hotel} label="Total Rooms" value={data.rooms.total} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={Users} label="Occupied" value={data.rooms.occupied} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={DoorOpen} label="Available" value={data.rooms.available} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={Percent} label="Occupancy Rate" value={data.rooms.occupancy_percentage} suffix="%" />
            </Col>
          </Row>
        </div>

        {/* REVENUE DASHBOARD */}
        <div className="section-block">
          <h2 className="section-title">
            <DollarSign size={20} /> Financial Summary
          </h2>
          <Row className="g-4">
            <Col xs={12} sm={6} lg={3}>
              <RevenueCard icon={TrendingUp} label="Total Revenue" amount={data.revenue.total} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <RevenueCard icon={CheckCircle} label="Paid Amount" amount={data.revenue.paid} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <RevenueCard icon={Clock} label="Due Amount" amount={data.revenue.due} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <RevenueCard icon={Calendar} label="Today's Revenue" amount={data.revenue.today} />
            </Col>
          </Row>
        </div>

        {/* BOOKINGS ACTIVITY */}
        <div className="section-block">
          <h2 className="section-title">
            <Calendar size={20} /> Bookings Activity
          </h2>
          <Row className="g-4">
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={Bookmark} label="Total Bookings" value={data.bookings.total} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={CheckCircle} label="Confirmed" value={data.bookings.confirmed} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={Clock} label="Pending" value={data.bookings.pending} />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <StatCard icon={XCircle} label="Cancelled" value={data.bookings.cancelled} />
            </Col>
          </Row>
        </div>

        {/* TOP SERVICES */}
        {data.top_services && data.top_services.length > 0 && (
          <div className="section-block">
            <h2 className="section-title">
              <Zap size={20} /> Top Services
            </h2>
            <div className="table-card">
              <Table className="dash-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Orders</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_services.map((service, idx) => (
                    <tr key={idx}>
                      <td>{service.name}</td>
                      <td>{service.count}</td>
                      <td className="text-end">₹{service.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* UPCOMING CHECK-INS */}
        {data.upcoming_check_ins && data.upcoming_check_ins.length > 0 && (
          <div className="section-block">
            <h2 className="section-title">
              <AlertCircle size={20} /> Upcoming Check-ins (7 Days)
            </h2>
            <div className="table-card">
              <Table className="dash-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Room</th>
                    <th>Check-in Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcoming_check_ins.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.customer_name}</strong></td>
                      <td>{booking.room_number}</td>
                      <td>{new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>
                        <span className={`badge-status badge-${booking.status}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* TODAY'S CHECKOUTS */}
        {data.today_checkouts && data.today_checkouts.length > 0 && (
          <div className="section-block">
            <h2 className="section-title">
              <DoorOpen size={20} /> Today's Checkouts
            </h2>
            <div className="table-card">
              <Table className="dash-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Room</th>
                    <th>Checkout Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.today_checkouts.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.customer_name}</strong></td>
                      <td>{booking.room_number}</td>
                      <td>{new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>
                        <span className={`badge-status badge-${booking.status}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* RECENT BOOKINGS */}
        <div className="section-block">
          <h2 className="section-title">
            <TrendingUp size={20} /> Recent Bookings
          </h2>
          <div className="table-card">
            <div className="table-responsive">
              <Table className="dash-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Email</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.customer_name}</strong></td>
                      <td>{booking.email}</td>
                      <td>{booking.room_number || 'N/A'}</td>
                      <td>{new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td>{new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td>
                        <span className={`badge-status badge-${booking.status}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-end">₹{booking.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;