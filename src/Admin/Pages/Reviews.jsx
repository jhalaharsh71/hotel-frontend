import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
} from 'react-bootstrap';
import {
  Star,
  Trash2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { ADMIN_API } from '../../config/api';

const API_BASE = ADMIN_API;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token');

  /* ================= FETCH REVIEWS ================= */
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE REVIEW ================= */
  const handleDeleteReview = async (reviewId) => {
    setDeleting(reviewId);
    setError(null);

    try {
      await axios.delete(`${API_BASE}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Review deleted successfully!');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setDeleteConfirm(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      console.error('Error deleting review:', err);
    } finally {
      setDeleting(null);
    }
  };

  /* ================= CALCULATE AVERAGE RATING ================= */
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          style={{
            fill: i < rating ? '#fbbf24' : '#d1d5db',
            color: i < rating ? '#fbbf24' : '#d1d5db',
          }}
        />
      ))}
    </div>
  );

  /* ================= RENDER ================= */
  return (
    <Container className="py-5">
      {/* HEADER WITH AVERAGE RATING */}
      <Row className="mb-5">
        <Col>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid #fcd34d',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}>
              <div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  margin: 0,
                  marginBottom: '8px',
                }}>
                  Guest Reviews
                </h1>
                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  margin: 0,
                }}>
                  Manage and review guest feedback
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: '#f59e0b',
                    marginBottom: '8px',
                  }}>
                    {averageRating}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <small style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ALERTS */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <AlertCircle size={20} style={{ marginRight: '8px', display: 'inline' }} />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Spinner animation="border" variant="primary" size="lg" />
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading reviews...</p>
        </div>
      ) : reviews.length > 0 ? (
        <Row className="g-4">
          {reviews.map((review) => (
            <Col lg={6} key={review.id}>
              <Card style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                border: 'none',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                {/* Card Header with Status */}
                <div style={{
                  background: review.status === 'approved' ? '#f0fdf4' : '#fef3c7',
                  padding: '16px 20px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#0f172a',
                    }}>
                      {review.user_name}
                    </p>
                    <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {review.room_type} Room • {review.created_at_formatted}
                    </small>
                  </div>
                  <Badge
                    bg={review.status === 'approved' ? 'success' : 'warning'}
                    style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                  >
                    {review.status}
                  </Badge>
                </div>

                {/* Card Body */}
                <Card.Body style={{ padding: '20px' }}>
                  {/* Rating */}
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderStars(review.rating)}
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginLeft: '8px',
                    }}>
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h6 style={{
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: 0,
                      marginBottom: '8px',
                      fontSize: '1rem',
                    }}>
                      {review.title}
                    </h6>
                  )}

                  {/* Comment */}
                  <p style={{
                    color: '#64748b',
                    marginBottom: '16px',
                    lineHeight: '1.6',
                    fontSize: '0.95rem',
                  }}>
                    {review.comment}
                  </p>

                  {/* Verification Badge */}
                  {review.is_verified && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      marginBottom: '16px',
                    }}>
                      <small style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                        ✓ Verified Purchase
                      </small>
                    </div>
                  )}

                  {/* Delete Button */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setDeleteConfirm(review.id)}
                      disabled={deleting === review.id}
                      style={{ borderRadius: '6px' }}
                    >
                      {deleting === review.id ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} className="me-1" />
                          Delete Review
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card style={{
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: 'none',
          borderRadius: '12px',
          textAlign: 'center',
          padding: '48px 20px',
        }}>
          <TrendingUp size={48} style={{
            color: '#cbd5e1',
            marginBottom: '16px',
            display: 'inline-block',
          }} />
          <h5 style={{ color: '#0f172a', margin: '0 0 8px 0' }}>No Reviews Yet</h5>
          <p style={{ color: '#64748b', margin: 0 }}>
            This hotel hasn't received any reviews yet. Reviews will appear here as guests check out.
          </p>
        </Card>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fee2e2',
          }}>
            <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span style={{ color: '#991b1b', fontWeight: '500' }}>
              Are you sure you want to delete this review? This action cannot be undone.
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteReview(deleteConfirm)}
            disabled={deleting === deleteConfirm}
          >
            {deleting === deleteConfirm ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="me-2" />
                Delete Review
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Reviews;
