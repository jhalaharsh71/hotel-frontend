import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, AlertCircle, Users, Home, Briefcase, CreditCard, IndianRupee } from 'lucide-react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedFromDate, setSelectedFromDate] = useState('');
  const [selectedToDate, setSelectedToDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (from = '', to = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      let url = 'http://127.0.0.1:8000/api/admin/reports';
      
      // Add date parameters if provided
      const params = new URLSearchParams();
      if (from) params.append('from_date', from);
      if (to) params.append('to_date', to);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (!fromDate && !toDate) {
      setError('Please select at least one date.');
      return;
    }
    
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError('From date must be before To date.');
      return;
    }
    
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
    fetchReports(fromDate, toDate);
  };

  const handleResetFilter = () => {
    setFromDate('');
    setToDate('');
    setSelectedFromDate('');
    setSelectedToDate('');
    setError(null);
    fetchReports();
  };

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('admin_token');
      let url = 'http://127.0.0.1:8000/api/admin/reports/download';
      
      // Add date parameters if provided
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const fileDate = selectedFromDate && selectedToDate 
        ? `${selectedFromDate}_to_${selectedToDate}`
        : new Date().toISOString().slice(0, 10);
      
      const url_obj = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url_obj;
      link.setAttribute('download', `hotel_report_${fileDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url_obj);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted fw-medium">Loading reports...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="d-flex align-items-start gap-3">
          <AlertCircle className="flex-shrink-0 mt-1" size={24} />
          <div className="flex-grow-1">
            <h5 className="alert-heading">Error Loading Reports</h5>
            <p className="mb-3">{error}</p>
            <Button variant="danger" onClick={fetchReports}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!reports) {
    return (
      <Container className="py-5">
        <div className="text-center text-muted">
          <p>No report data available</p>
        </div>
      </Container>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fc 0%, #f0f2f7 100%)',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container>
        {/* Header Section */}
        <Row className="reports-header mb-5">
          <Col lg={6}>
            <div
              className="header-content"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h1
                className="reports-title"
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 800,
                  marginBottom: "8px",
                }}
              >
                <span
                  className="gradient-text"
                  style={{
                    background: "linear-gradient(90deg, #2563eb, #4f46e5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Reports & Analytics
                </span>
              </h1>

              <p
                className="reports-subtitle"
                style={{
                  color: "#64748b",
                  fontSize: "1.05rem",
                  maxWidth: "520px",
                }}
              >
                Comprehensive business intelligence and performance metrics
              </p>
            </div>
          </Col>
          <Col lg={6} className="text-lg-end text-center mt-3 mt-lg-0">
            <Button
              variant="primary"
              onClick={handleDownloadReport}
              disabled={downloading}
              className="btn-download-report"
            >
              <Download size={20} />
              {downloading ? 'Downloading...' : 'Download Report'}
            </Button>
          </Col>
        </Row>

        {/* Date Range Filter Section */}
        <div style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
        }}>
          <h5 style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1a1a2e',
            marginBottom: '1rem'
          }}>
            Filter by Date Range
          </h5>
          
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  color: '#1a1a2e',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.12)'}
                />
              </div>
            </Col>
            <Col md={5}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 600,
                  color: '#1a1a2e',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.12)'}
                />
              </div>
            </Col>
            <Col md={2} className="d-flex gap-2">
              <Button
                onClick={handleApplyFilter}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Apply
              </Button>
              <Button
                onClick={handleResetFilter}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  background: '#fff',
                  color: '#6c757d',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#6c757d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                }}
              >
                Reset
              </Button>
            </Col>
          </Row>

          {/* Selected Date Range Display */}
          {(selectedFromDate || selectedToDate) && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(13, 110, 253, 0.08)',
              borderRadius: '8px',
              borderLeft: '3px solid #0d6efd'
            }}>
              <p style={{
                color: '#0d6efd',
                fontWeight: 600,
                margin: 0,
                fontSize: '0.9rem'
              }}>
                📅 Showing reports from <strong>{selectedFromDate || 'Start'}</strong> to <strong>{selectedToDate || 'Today'}</strong>
              </p>
            </div>
          )}
        </div>

        {/* ===== BOOKING SUMMARY SECTION ===== */}
        <div className="mb-5">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'rgba(13, 110, 253, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={28} style={{ color: '#0d6efd' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0
            }}>
              Booking Summary
            </h2>
          </div>

          {/* Summary Cards Grid */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={3}>
              <MetricCard
                title="Total Bookings"
                value={reports.booking_summary?.total_bookings || 0}
                icon={<Users size={24} />}
                accentColor="#0d6efd"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                title="Confirmed"
                value={reports.booking_summary?.confirmed_bookings || 0}
                icon={<Users size={24} />}
                accentColor="#198754"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                title="Cancelled"
                value={reports.booking_summary?.cancelled_bookings || 0}
                icon={<Users size={24} />}
                accentColor="#dc3545"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                title="Pending"
                value={reports.booking_summary?.pending_bookings || 0}
                icon={<Users size={24} />}
                accentColor="#ffc107"
              />
            </Col>
          </Row>

          {/* Trend Table */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(248, 249, 252, 0.5)'
            }}>
              <h5 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1a1a2e',
                margin: 0
              }}>
                Monthly Booking Trend
              </h5>
            </div>
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table style={{ marginBottom: 0, background: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(248, 249, 252, 0.8)', backdropFilter: 'blur(10px)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Month</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Year</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.booking_summary?.monthly_bookings || []).length > 0 ? (
                    reports.booking_summary.monthly_bookings.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13, 110, 253, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 500, border: 'none' }}>
                          {new Date(2024, item.month - 1).toLocaleString('default', { month: 'long' })}
                        </td>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 500, border: 'none' }}>{item.year}</td>
                        <td style={{ padding: '1rem', color: '#0d6efd', fontWeight: 700, border: 'none', textAlign: 'right' }}>{item.count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d', border: 'none' }}>
                        No booking data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        {/* ===== REVENUE REPORT SECTION ===== */}
        <div className="mb-5">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'rgba(25, 135, 84, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IndianRupee size={28} style={{ color: '#198754' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0
            }}>
              Revenue Report
            </h2>
          </div>

          {/* Revenue Cards */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={4}>
              <MetricCard
                title="Total Revenue"
                value={`₹${(reports.revenue_report?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<IndianRupee size={24} />}
                accentColor="#0d6efd"
              />
            </Col>
            <Col sm={6} lg={4}>
              <MetricCard
                title="Total Paid"
                value={`₹${(reports.revenue_report?.total_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<IndianRupee size={24} />}
                accentColor="#198754"
              />
            </Col>
            <Col sm={6} lg={4}>
              <MetricCard
                title="Total Due"
                value={`₹${(reports.revenue_report?.total_due || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<IndianRupee size={24} />}
                accentColor="#17a2b8"
              />
            </Col>
          </Row>

          {/* Monthly Revenue Table */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(248, 249, 252, 0.5)'
            }}>
              <h5 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1a1a2e',
                margin: 0
              }}>
                Monthly Revenue Trend
              </h5>
            </div>
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table style={{ marginBottom: 0, background: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(248, 249, 252, 0.8)', backdropFilter: 'blur(10px)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Month</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Year</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.revenue_report?.revenue_by_month || []).length > 0 ? (
                    reports.revenue_report.revenue_by_month.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(25, 135, 84, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 500, border: 'none' }}>
                          {new Date(2024, item.month - 1).toLocaleString('default', { month: 'long' })}
                        </td>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 500, border: 'none' }}>{item.year}</td>
                        <td style={{ padding: '1rem', color: '#198754', fontWeight: 700, border: 'none', textAlign: 'right' }}>
                          ₹{(item.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d', border: 'none' }}>
                        No revenue data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        {/* ===== ROOM REPORT SECTION ===== */}
        <div className="mb-5">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'rgba(23, 162, 184, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Home size={28} style={{ color: '#17a2b8' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0
            }}>
              Room Report
            </h2>
          </div>

          {/* Room-wise Revenue Table */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(248, 249, 252, 0.5)'
            }}>
              <h5 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1a1a2e',
                margin: 0
              }}>
                Room-wise Performance
              </h5>
            </div>
            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Table style={{ marginBottom: 0, background: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(248, 249, 252, 0.8)', backdropFilter: 'blur(10px)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Room</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Type</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Price</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Bookings</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.room_report?.room_wise_revenue || []).length > 0 ? (
                    reports.room_report.room_wise_revenue.map((room, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(23, 162, 184, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 600, border: 'none' }}>{room.room_number}</td>
                        <td style={{ padding: '1rem', color: '#6c757d', fontWeight: 500, border: 'none' }}>{room.room_type}</td>
                        <td style={{ padding: '1rem', color: '#6c757d', fontWeight: 500, border: 'none' }}>₹{(room.price || 0).toLocaleString()}</td>
                        <td style={{ padding: '1rem', border: 'none' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            background: room.status === 'available' ? 'rgba(25, 135, 84, 0.15)' : room.status === 'occupied' ? 'rgba(220, 53, 69, 0.15)' : 'rgba(255, 193, 7, 0.15)',
                            color: room.status === 'available' ? '#198754' : room.status === 'occupied' ? '#dc3545' : '#ffc107'
                          }}>
                            {room.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 600, border: 'none', textAlign: 'right' }}>{room.booking_count}</td>
                        <td style={{ padding: '1rem', color: '#17a2b8', fontWeight: 700, border: 'none', textAlign: 'right' }}>
                          ₹{(room.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d', border: 'none' }}>
                        No room data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        {/* ===== SERVICE REPORT SECTION ===== */}
        <div className="mb-5">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'rgba(25, 135, 84, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={28} style={{ color: '#198754' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0
            }}>
              Service Report
            </h2>
          </div>

          {/* Service Revenue Card */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={6}>
              <MetricCard
                title="Total Services Revenue"
                value={`₹${(reports.service_report?.total_services_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<Briefcase size={24} />}
                accentColor="#198754"
              />
            </Col>
          </Row>

          {/* Service-wise Revenue Table */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(248, 249, 252, 0.5)'
            }}>
              <h5 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1a1a2e',
                margin: 0
              }}>
                Service-wise Revenue & Usage
              </h5>
            </div>
            <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              <Table style={{ marginBottom: 0, background: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(248, 249, 252, 0.8)', backdropFilter: 'blur(10px)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Service Name</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Usage</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Avg Price</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(reports.service_report?.service_wise_revenue || []).length > 0 ? (
                    reports.service_report.service_wise_revenue.map((service, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(25, 135, 84, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 600, border: 'none' }}>{service.service_name}</td>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 500, border: 'none', textAlign: 'right' }}>{service.usage_count}</td>
                        <td style={{ padding: '1rem', color: '#6c757d', fontWeight: 500, border: 'none', textAlign: 'right' }}>
                          ₹{(service.avg_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '1rem', color: '#198754', fontWeight: 700, border: 'none', textAlign: 'right' }}>
                          ₹{(service.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d', border: 'none' }}>
                        No service data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Most Used Services */}
          {(reports.service_report?.most_used_services || []).length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'rgba(248, 249, 252, 0.5)'
              }}>
                <h5 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1a1a2e',
                  margin: 0
                }}>
                  Top 5 Most Used Services
                </h5>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div className="d-flex flex-column gap-3">
                  {reports.service_report.most_used_services.map((service, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'rgba(248, 249, 252, 0.5)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }} onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(25, 135, 84, 0.08)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(248, 249, 252, 0.5)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div className="d-flex align-items-center gap-3">
                        <span style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                          borderRadius: '8px',
                          fontWeight: 700,
                          color: '#fff',
                          fontSize: '1rem'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{
                          fontWeight: 600,
                          color: '#1a1a2e',
                          fontSize: '1rem'
                        }}>
                          {service.service_name}
                        </span>
                      </div>
                      <span style={{
                        color: '#6c757d',
                        fontWeight: 500
                      }}>
                        {service.usage_count} uses
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== PAYMENT REPORT SECTION ===== */}
        <div className="mb-5">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'rgba(255, 193, 7, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={28} style={{ color: '#ffc107' }} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0
            }}>
              Payment Report
            </h2>
          </div>

          {/* Payment Summary Cards */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={4}>
              <MetricCard
                title="Total Bookings"
                value={reports.payment_report?.payment_breakdown?.total_bookings || 0}
                icon={<CreditCard size={24} />}
                accentColor="#ffc107"
              />
            </Col>
            <Col sm={6} lg={4}>
              <MetricCard
                title="Total Pending Amount"
                value={`₹${(reports.payment_report?.pending_dues_summary?.total_pending_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<CreditCard size={24} />}
                accentColor="#dc3545"
              />
            </Col>
            <Col sm={6} lg={4}>
              <MetricCard
                title="Avg Pending Amount"
                value={`₹${(reports.payment_report?.pending_dues_summary?.avg_pending_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<CreditCard size={24} />}
                accentColor="#6c757d"
              />
            </Col>
          </Row>


          {/* Payment by Mode Table */}
          {(reports.payment_report?.payment_by_mode || []).length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'rgba(248, 249, 252, 0.5)'
              }}>
                <h5 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#1a1a2e',
                  margin: 0
                }}>
                  Payment by Mode
                </h5>
              </div>
              <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table style={{ marginBottom: 0, background: 'transparent' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'rgba(248, 249, 252, 0.8)', backdropFilter: 'blur(10px)' }}>
                    <tr>
                      <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none' }}>Payment Mode</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Count</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: '#1a1a2e', border: 'none', textAlign: 'right' }}>Total Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.payment_report.payment_by_mode.map((payment, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 600, border: 'none' }}>
                          {payment.mode_of_payment || 'Unspecified'}
                        </td>
                        <td style={{ padding: '1rem', color: '#1a1a2e', fontWeight: 500, border: 'none', textAlign: 'right' }}>{payment.count}</td>
                        <td style={{ padding: '1rem', color: '#ffc107', fontWeight: 700, border: 'none', textAlign: 'right' }}>
                          ₹{(payment.total_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '0.875rem',
          padding: '2rem 0',
          marginTop: '3rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <p style={{ margin: 0 }}>Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>
      </Container>
    </div>
  );
};

/**
 * Professional Metric Card Component
 * Displays KPI with icon, title, and value
 */
const MetricCard = ({ title, value, icon, accentColor }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
    height: '100%',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }} 
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = `0 12px 32px ${accentColor}20`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.05)';
  }}>
    <div className="d-flex align-items-start justify-content-between mb-3">
      <div style={{
        width: '3rem',
        height: '3rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${accentColor}15`,
        color: accentColor
      }}>
        {icon}
      </div>
    </div>
    <p style={{
      color: '#6c757d',
      fontWeight: 500,
      fontSize: '0.875rem',
      marginBottom: '0.75rem'
    }}>
      {title}
    </p>
    <p style={{
      fontSize: '1.5rem',
      fontWeight: 700,
      color: accentColor,
      margin: 0
    }}>
      {value}
    </p>
  </div>
);

export default Reports;