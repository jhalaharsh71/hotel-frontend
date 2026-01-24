import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Star, Trash2, Edit } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/user';

const ReviewForm = ({ show, onHide, booking, onReviewSubmitted, token, existingReview = null }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Initialize form with existing review data if editing
  useEffect(() => {
    if (show && existingReview && existingReview.id) {
      setFormData({
        rating: existingReview.rating || 5,
        title: existingReview.title || '',
        comment: existingReview.comment || '',
      });
    } else if (show) {
      // Reset form for new review
      setFormData({
        rating: 5,
        title: '',
        comment: '',
      });
    }
  }, [show, existingReview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (existingReview && existingReview.id) {
        // Update existing review
        await axios.put(
          `${API_BASE}/reviews/${existingReview.id}`,
          {
            rating: formData.rating,
            title: formData.title,
            comment: formData.comment,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Review updated successfully!');
      } else {
        // Create new review
        await axios.post(
          `${API_BASE}/reviews`,
          {
            booking_id: booking.id,
            rating: formData.rating,
            title: formData.title,
            comment: formData.comment,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Review submitted successfully!');
      }

      setFormData({ rating: 5, title: '', comment: '' });
      setTimeout(() => {
        onHide();
        onReviewSubmitted();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 20px' }}>
        <Modal.Title style={{ fontSize: '1.1rem', fontWeight: '600' }}>
          {existingReview && existingReview.id ? '✏️ Edit Review' : '⭐ Write a Review'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#fff', padding: '20px' }}>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Room Type Info */}
          <div style={{
            background: '#f0f4f8',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #cbd5e1',
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
              Reviewing: <strong>{booking.room?.room_type} Room</strong> | Booking #{booking.id}
            </p>
          </div>

          {/* Star Rating */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>
              Rating <span style={{ color: '#ef4444' }}>*</span>
            </Form.Label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'transform 0.2s',
                    transform: (hoveredRating || formData.rating) >= star ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={26}
                    style={{
                      fill: (hoveredRating || formData.rating) >= star ? '#fbbf24' : '#d1d5db',
                      color: (hoveredRating || formData.rating) >= star ? '#fbbf24' : '#d1d5db',
                    }}
                  />
                </button>
              ))}
            </div>
            <small style={{ color: '#64748b', display: 'block', marginTop: '6px', fontSize: '0.8rem' }}>
              {formData.rating === 1 && '😞 Poor'}
              {formData.rating === 2 && '😐 Fair'}
              {formData.rating === 3 && '😊 Good'}
              {formData.rating === 4 && '😄 Very Good'}
              {formData.rating === 5 && '🤩 Excellent'}
            </small>
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Review Title (Optional)</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Amazing stay"
              style={{ borderRadius: '6px', fontSize: '0.9rem' }}
            />
          </Form.Group>

          {/* Comment */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Your Review <span style={{ color: '#ef4444' }}>*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your experience..."
              required
              style={{ borderRadius: '6px', resize: 'vertical', fontSize: '0.9rem' }}
            />
            <small style={{ color: '#64748b', display: 'block', marginTop: '4px', fontSize: '0.8rem' }}>
              {formData.comment.length} characters
            </small>
          </Form.Group>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline-secondary"
              onClick={onHide}
              style={{ flex: 1, borderRadius: '6px', fontSize: '0.9rem' }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !formData.comment.trim()}
              style={{ flex: 1, borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}
            >
              {loading ? <Spinner size="sm" className="me-2" /> : ''}
              {existingReview && existingReview.id ? 'Update' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReviewForm;
