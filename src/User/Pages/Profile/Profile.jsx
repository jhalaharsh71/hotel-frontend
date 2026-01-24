import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Spinner,
  Modal,
  Badge,
} from 'react-bootstrap';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import { User, Mail, Calendar, KeyRound, BookOpen, CheckCircle2, Hotel, Users } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/user';

const AVATAR_COLORS = [
  '#6C63FF', '#FF6584', '#43E6FC', '#FFD166', '#06D6A0', '#FFB5E8', '#B5FFFC', '#B5FFD6', '#B5B5FF', '#FFB5B5',
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('user_token');
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('user_token');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New password and confirm password do not match.');
      setPasswordLoading(false);
      return;
    }
    try {
      await axios.post(`${API_BASE}/change-password`, passwordForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- UI ---
  return (
    <>
      <Header />
      <div className="profile-container" style={{
        background: 'linear-gradient(90deg, #6C63FF 0%, #43E6FC 100%)',
        padding: '48px 0 32px 0',
        color: '#fff',
      }}>
        <Container>
          <h1 className="profile-title" style={{ textAlign: 'center', marginBottom: '32px', fontWeight: 700, fontSize: '2.5rem' }}>User Profile</h1>
          <Row className="justify-content-center">
            <Col xs={12} md={4} className="mb-4 mb-md-0">
              {/* Avatar Card */}
              <Card className="shadow border-0 text-center" style={{ borderRadius: 18, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <Card.Body>
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: user ? getAvatarColor(user.name) : '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 44,
                      fontWeight: 700,
                      color: '#fff',
                      margin: '0 auto 12px auto',
                      boxShadow: '0 4px 24px rgba(108,99,255,0.18)',
                      border: '4px solid #fff',
                    }}
                  >
                    {user ? user.name?.[0]?.toUpperCase() : <User size={48} />}
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#222', marginBottom: 4 }}>{user ? user.name : 'Profile'}</h3>
                  <div style={{ fontSize: 15, color: '#555', marginBottom: 8 }}>
                    {user && (
                      <>
                        <Mail size={15} style={{ marginRight: 6, marginBottom: 2 }} /> {user.email}
                        {user.email_verified_at && (
                          <Badge bg="success" className="ms-2"><CheckCircle2 size={13} className="me-1" /> Verified</Badge>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#888', marginBottom: 0 }}>
                    {user && (
                      <>
                        <Calendar size={14} className="me-1" /> Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                        <Badge bg="primary" className="ms-2" style={{ textTransform: 'capitalize', fontSize: 12 }}>{user.role}</Badge>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={8}>
              <Row className="g-4">
                <Col xs={12}>
                  {/* Account Details Card */}
                  <Card className="shadow border-0" style={{ borderRadius: 18 }}>
                    <Card.Body>
                      <h2 className="mb-3" style={{ fontWeight: 600, fontSize: '1.5rem' }}>Profile Info</h2>
                      {loading ? (
                        <Spinner animation="border" />
                      ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                      ) : user ? (
                        <>
                          <div className="mb-2"><Mail size={16} className="me-2" /> <strong>Email:</strong> {user.email}</div>
                          <div className="mb-2"><Calendar size={16} className="me-2" /> <strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : ''}</div>
                          <div className="mb-2"><User size={16} className="me-2" /> <strong>Role:</strong> {user.role}</div>
                          {user.email_verified_at && (
                            <div className="mb-2"><CheckCircle2 size={16} className="me-2 text-success" /> <strong>Email Verified:</strong> {new Date(user.email_verified_at).toLocaleString()}</div>
                          )}
                        </>
                      ) : null}
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12}>
                  {/* Booking Stats Card */}
                  <Card className="shadow border-0" style={{ borderRadius: 18 }}>
                    <Card.Body>
                      <h2 className="mb-3" style={{ fontWeight: 600, fontSize: '1.5rem' }}>Booking Stats</h2>
                      {user && (
                        <Row>
                          <Col xs={6} md={4} className="mb-3">
                            <div style={{ color: '#555', fontSize: 14 }}><BookOpen size={15} className="me-1" />Bookings</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#6C63FF' }}>{user.booking_count}</div>
                          </Col>
                          <Col xs={6} md={4} className="mb-3">
                            <div style={{ color: '#555', fontSize: 14 }}><Calendar size={15} className="me-1" />Nights</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#43E6FC' }}>{user.total_nights}</div>
                          </Col>
                          <Col xs={6} md={4} className="mb-3">
                            <div style={{ color: '#555', fontSize: 14 }}><Users size={15} className="me-1" />Guests</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#FFD166' }}>{user.total_guests}</div>
                          </Col>
                          <hr style={{width:"90%"}} />
                          <Col xs={12} md={6} className="mb-3">
                            <div style={{ color: '#555', fontSize: 14 }}><Hotel size={15} className="me-1" />Most Visited Hotel</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#222' }}>{user.most_frequent_hotel || 'N/A'}</div>
                          </Col>
                          <Col xs={12} md={6} className="mb-3">
                            <div style={{ fontSize: 15, color: '#888' }}>Last Booking: {user.last_booking_date ? new Date(user.last_booking_date).toLocaleString() : 'N/A'}</div>
                          </Col>
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={12}>
                  {/* Security Card */}
                  <Card className="shadow border-0" style={{ borderRadius: 18 }}>
                    <Card.Body>
                      <h2 className="mb-3" style={{ fontWeight: 600, fontSize: '1.5rem' }}>Security</h2>
                      {user && (
                        <div className="security-section" style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                            <Calendar size={14} className="me-1" /> Last Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                          </div>
                        <Button
                          variant="gradient"
                          style={{
                            background: 'linear-gradient(90deg, #6C63FF 0%, #43E6FC 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(108,99,255,0.10)',
                            minWidth: 180,
                            fontSize: 16,
                            padding: '10px 0',
                            letterSpacing: 0.5,
                          }}
                          onClick={() => setShowPasswordModal(true)}
                        >
                          <KeyRound size={17} className="me-2" /> Change Password
                        </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        {/* Password Change Modal */}
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
          <Modal.Header closeButton style={{ background: '#6C63FF', color: '#fff' }}>
            <Modal.Title><KeyRound size={20} className="me-2" />Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#f8f9fa' }}>
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handlePasswordSubmit}>
              {/* Accessibility: hidden email field for password form */}
              {user && (
                <Form.Control
                  type="email"
                  name="email"
                  value={user.email}
                  readOnly
                  tabIndex={-1}
                  autoComplete="username"
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                  aria-hidden="true"
                />
              )}
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="current-password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                />
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                disabled={passwordLoading}
                style={{ width: '100%', fontWeight: 600 }}
              >
                {passwordLoading ? <Spinner size="sm" className="me-2" /> : ''}
                Change Password
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
      <Footer />
      <style>{`
        .profile-container {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .profile-title {
          font-size: 24px;
          margin-bottom: 20px;
        }
        .profile-info, .security-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
        }
        h2 {
          font-size: 20px;
          margin-bottom: 10px;
        }
        button {
          background-color: #6C63FF;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Profile;
