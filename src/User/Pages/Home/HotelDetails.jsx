import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
  Form,
} from 'react-bootstrap';
import {
  MapPin,
  Phone,
  Users,
  DollarSign,
  Calendar,
  ChevronLeft,
  AlertCircle,
  BookOpen,
  Star,
} from 'lucide-react';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import BookingModal from '../../Component/BookingModal';
import './hotel-details.css';
import { USER_API } from '../../../config/api';

const API_BASE = USER_API;

const HotelDetails = () => {
  const { hotelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get search parameters from navigation state
  const searchParams = location.state || {
    check_in_date: '',
    check_out_date: '',
    no_of_people: 1,
  };

  // ===== STATE MANAGEMENT =====
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic hotel content
  const [aboutHotel, setAboutHotel] = useState('');
  const [roomFeatures, setRoomFeatures] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [galleries, setGalleries] = useState([]);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Image slider state
  const [showImageSlider, setShowImageSlider] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ===== LOAD INITIAL CITIES ON MOUNT =====
  useEffect(() => {
    fetchHotelDetails();
    fetchHotelSettings();
    fetchReviews();
  }, [hotelId]);

  // ===== KEYBOARD NAVIGATION FOR IMAGE SLIDER =====
  useEffect(() => {
    if (!showImageSlider) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseSlider();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageSlider]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await axios.get(`${API_BASE}/hotels/${hotelId}/reviews`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  /**
   * Fetch hotel settings (about, features, facilities, galleries)
   */
  const fetchHotelSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hotels/${hotelId}/settings`);
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setAboutHotel(data.about_hotel || '');
        setRoomFeatures(Array.isArray(data.room_features) ? data.room_features : []);
        setFacilities(Array.isArray(data.facilities) ? data.facilities : []);
        setGalleries(Array.isArray(data.galleries) ? data.galleries : []);
      }
    } catch (err) {
      console.error('Failed to fetch hotel settings', err);
      // Set default values if API fails
      setAboutHotel('');
      setRoomFeatures([]);
      setFacilities([]);
      setGalleries([]);
    }
  };

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/hotels/${hotelId}`, {
  params: {
    check_in_date: searchParams.check_in_date,
    check_out_date: searchParams.check_out_date,
    no_of_people: searchParams.no_of_people,
  },
});


      if (response.data) {
        setHotel(response.data.hotel);
        setRooms(response.data.rooms || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load hotel details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== GROUP ROOMS BY TYPE =====
  const groupRoomsByType = () => {
    const grouped = {};
    rooms.forEach((room) => {
      if (!grouped[room.room_type]) {
        grouped[room.room_type] = [];
      }
      grouped[room.room_type].push(room);
    });
    return grouped;
  };

  // ===== GET ROOM IMAGE URL =====
  const getRoomImageUrl = (roomType) => {
    const roomImages = {
      'Standard': 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?w=500&h=300&fit=crop',
      'Deluxe': 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?w=500&h=300&fit=crop',
      'Premium': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=500&h=300&fit=crop',
      'Suite': 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?w=500&h=300&fit=crop',
      'Family': 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=500&h=300&fit=crop',
    };
    return roomImages[roomType] || 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?w=500&h=300&fit=crop';
  };

  // ===== GET HOTEL GALLERY IMAGES =====
  const getHotelGalleryImages = () => {
    // Return dynamic gallery images from database, or fallback to defaults
    if (galleries.length > 0) {
      // Only include galleries that provide a valid `image_url` (backend guarantees fully-qualified URLs)
      return galleries
        .filter((g) => g && g.image_url)
        .map((g) => ({ id: g.id, url: g.image_url, isBanner: g.is_banner_image }));
    }

    // No fallback images — per requirements do not auto-fallback to placeholders
    return [];
  };

  // ===== GET MAIN HOTEL IMAGE =====
  const getMainHotelImage = () => {
    // Return banner image from database if available
    if (galleries.length > 0) {
      const bannerImage = galleries.find((g) => g.is_banner_image && g.image_url);
      if (bannerImage) return bannerImage.image_url;
      const first = galleries.find((g) => g.image_url);
      if (first) return first.image_url;
    }

    // No main image available — return null and let caller decide rendering
    return null;
  };

  // ===== OPEN BOOKING MODAL =====
  const handleBookNow = (room) => {
    const token = localStorage.getItem('user_token');
    
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/user/login', {
        state: {
          from: location.pathname,
          searchParams,
        },
      });
      return;
    }

    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  // ===== NAVIGATE BACK =====
  const handleGoBack = () => {
    navigate(-1);
  };

  // ===== IMAGE SLIDER HANDLERS =====
  const handleGalleryImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageSlider(true);
    // Prevent body scroll when slider is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseSlider = () => {
    setShowImageSlider(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const handlePreviousImage = () => {
    const galleryImages = getHotelGalleryImages();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    const galleryImages = getHotelGalleryImages();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  // ===== CALCULATE DURATION =====
  const calculateDuration = () => {
    if (!searchParams.check_in_date || !searchParams.check_out_date) {
      return 0;
    }
    const checkIn = new Date(searchParams.check_in_date);
    const checkOut = new Date(searchParams.check_out_date);
    const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return duration > 0 ? duration : 0;
  };

  const durationDays = calculateDuration();

  // Format as "X day(s)/night(s)" for display-only purposes
  const formatDayNight = (n) => `${n} day${n === 1 ? '' : 's'}/night${n === 1 ? '' : 's'}`;

  // ===== CALCULATE AVERAGE RATING =====
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const averageRating = getAverageRating();

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Loading hotel details...</p>
        </Container>
        <Footer />
      </>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <Alert variant="danger" className="d-flex gap-2 align-items-center">
            <AlertCircle size={24} className="flex-shrink-0" />
            <div>
              <h5>Error Loading Hotel</h5>
              <p className="mb-0">{error}</p>
              <Button
                variant="outline-danger"
                size="sm"
                className="mt-3"
                onClick={handleGoBack}
              >
                <ChevronLeft size={18} className="me-2" />
                Go Back
              </Button>
            </div>
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  // ===== NOT FOUND STATE =====
  if (!hotel) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <Alert variant="warning" className="text-center">
            <h5>Hotel Not Found</h5>
            <p>The hotel you're looking for could not be found.</p>
            <Button variant="primary" onClick={handleGoBack}>
              <ChevronLeft size={18} className="me-2" />
              Go Back
            </Button>
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="hotel-details-page">
        {/* ===== MODERN HERO BANNER ===== */}
        <div className="hotel-hero-banner">
          {(() => {
            const mainImage = getMainHotelImage();
            if (mainImage) {
              return <img src={mainImage} alt={hotel?.name} />;
            }
            console.warn('No main hotel image available for hotel', hotel?.id);
            return null;
          })()}
          <div className="hotel-hero-overlay" />
          <div className="hotel-hero-content">
            <h1>{hotel?.name}</h1>
            {reviews.length > 0 && (
              <div className="hotel-rating-badge">
                <div className="star-group">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      style={{
                        fill: i < Math.round(averageRating) ? '#fbbf24' : '#d1d5db',
                        color: i < Math.round(averageRating) ? '#fbbf24' : '#d1d5db',
                      }}
                    />
                  ))}
                </div>
                <span>
                  {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
        </div>

        <Container className="hotel-content-wrapper">
          {/* ===== BACK BUTTON ===== */}
          <button
            onClick={handleGoBack}
            className="btn-back"
            title="Go back to results"
          >
            <ChevronLeft size={20} />
            Back to Results
          </button>

          {/* ===== HOTEL INFO & BOOKING SIDEBAR ===== */}
          <Row className="g-4">
            {/* ===== MAIN CONTENT COLUMN ===== */}
            <Col lg={8}>
              {/* ===== HOTEL INFORMATION CARD ===== */}
              <Card className="mb-4">
                <Card.Body>
                  {/* ===== BASIC INFO ===== */}
                  <div className="mb-4">
                    <div className="info-block">
                      <MapPin size={20} className="info-icon" />
                      <div className="info-content">
                        <small>Location</small>
                        <p>
                          {hotel.address}, {hotel.city}
                        </p>
                        <small style={{ color: 'var(--text-light)' }}>
                          {hotel.state}, {hotel.country}
                        </small>
                      </div>
                    </div>

                    <div className="info-block">
                      <Phone size={20} className="info-icon" />
                      <div className="info-content">
                        <small>Contact Number</small>
                        <p>{hotel.contact_no}</p>
                      </div>
                    </div>
                  </div>

                  <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />

                  {/* ===== ABOUT HOTEL ===== */}
                  {aboutHotel && (
                    <div className="mb-4">
                      <div className="about-hotel-section">
                        <h6>About This Hotel</h6>
                        <p>{aboutHotel}</p>
                      </div>
                    </div>
                  )}

                  {/* ===== ROOM FEATURES ===== */}
                  {roomFeatures.length > 0 && (
                    <div className="mb-4">
                      <h6 style={{ marginBottom: '16px' }}>Room Features & Amenities</h6>
                      <div className="amenities-grid">
                        {roomFeatures.map((feature) => (
                          <div key={feature.id} className="amenity-item">
                            <span className="amenity-icon">
                              {feature.feature_icon || '✓'}
                            </span>
                            <p className="amenity-name">{feature.feature_title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===== HOTEL FACILITIES ===== */}
                  {facilities.length > 0 && (
                    <div className="mb-4">
                      <h6 style={{ marginBottom: '16px' }}>Hotel Facilities & Services</h6>
                      <div className="amenities-grid">
                        {facilities.map((facility) => (
                          <div key={facility.id} className="amenity-item">
                            <span className="amenity-icon">{facility.facility_icon}</span>
                            <p className="amenity-name">{facility.facility_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* ===== HOTEL GALLERY ===== */}
              <Card className="mb-5">
                <Card.Body>
                  <h5 style={{ marginBottom: '24px' }}>Hotel Gallery</h5>
                  <div className="gallery-grid">
                    {getHotelGalleryImages().map((image, index) => (
                      <div
                        key={image.id || index}
                        className="gallery-item"
                        onClick={() => handleGalleryImageClick(index)}
                      >
                        {image.url ? (
                          <img
                            src={image.url}
                            alt={`Hotel Gallery ${index + 1}`}
                          />
                        ) : (
                          (console.warn('Gallery image missing url', image), null)
                        )}
                        <div className="gallery-overlay" />
                      </div>
                    ))}
                  </div>
                  {getHotelGalleryImages().length === 0 && (
                    <div className="empty-state">
                      <p>No gallery images available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* ===== BOOKING SUMMARY SIDEBAR ===== */}
            <Col lg={4}>
              <Card className="booking-summary-card sticky-top" style={{ top: '20px' }}>
                <Card.Body>
                  <div className="booking-summary-title">Booking Summary</div>

                  <div className="summary-item">
                    <small className="summary-label">
                      <Calendar size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                      Check-in Date
                    </small>
                    <p className="summary-value">
                      {searchParams.check_in_date
                        ? new Date(searchParams.check_in_date).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )
                        : 'Not selected'}
                    </p>
                  </div>

                  <div className="summary-item">
                    <small className="summary-label">
                      <Calendar size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                      Check-out Date
                    </small>
                    <p className="summary-value">
                      {searchParams.check_out_date
                        ? new Date(searchParams.check_out_date).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )
                        : 'Not selected'}
                    </p>
                  </div>

                  <div className="summary-item">
                    <small className="summary-label">
                      <Calendar size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                      Duration
                    </small>
                    <p className="summary-value">{formatDayNight(durationDays)}</p>
                  </div>

                  <div className="summary-item">
                    <small className="summary-label">
                      <Users size={14} className="me-1" style={{ verticalAlign: 'middle' }} />
                      Number of Guests
                    </small>
                    <p className="summary-value">
                      {searchParams.no_of_people} {searchParams.no_of_people === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ===== ROOMS SECTION ===== */}
          <div style={{ marginTop: '48px' }}>
            <h3>
              <BookOpen size={28} />
              Available Room Types
            </h3>
          </div>

          {rooms.length > 0 ? (
            <Row className="g-4" style={{ marginTop: '24px' }}>
              {Object.entries(groupRoomsByType()).map(([roomType, roomList]) => {
                const firstRoom = roomList[0];
                const availableCount = roomList.length;

                return (
                  <Col md={6} lg={4} key={roomType}>
                    <Card className="room-card">
                      {/* Room Image */}
                      <div className="room-card-image">
                        <img
                          src={getRoomImageUrl(roomType)}
                          alt={roomType}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop';
                          }}
                        />
                      </div>

                      <Card.Body className="room-card-body">
                        {/* Room Type & Availability */}
                        <div className="mb-3">
                          <h5 className="room-type-title">{roomType}</h5>
                          <span className="room-availability">
                            {availableCount} room{availableCount > 1 ? 's' : ''} available
                          </span>
                        </div>

                        {/* Room Capacity */}
                        <div className="room-capacity">
                          <Users size={18} />
                          <span>
                            Capacity: {firstRoom.min_people} - {firstRoom.max_people} guests
                          </span>
                        </div>

                        {/* Pricing Box */}
                        <div className="pricing-box">
                          <span className="price-label">Price per night</span>
                          <div className="price-display">
                            <div className="price-main">
                              <span className="price-currency">₹</span>
                              {firstRoom.price_per_day}
                            </div>
                            <span className="price-original">
                              ₹{(firstRoom.price_per_day * 1.4).toFixed(0)}
                            </span>
                            <span className="price-discount">40% OFF</span>
                          </div>

                          {durationDays > 0 && (
                            <div className="price-total">
                              <span className="price-label">Total for {formatDayNight(durationDays)}</span>
                              <div className="price-display">
                                <div className="price-total-amount">
                                  ₹{(firstRoom.price_per_day * durationDays).toFixed(2)}
                                </div>
                                <span className="price-original">
                                  ₹{(firstRoom.price_per_day * 1.4 * durationDays).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Book Now Button */}
                        <button
                          className="btn-book-now"
                          onClick={() => handleBookNow(firstRoom)}
                          disabled={
                            searchParams.no_of_people < firstRoom.min_people ||
                            searchParams.no_of_people > firstRoom.max_people
                          }
                        >
                          <BookOpen size={18} />
                          Book Now
                        </button>

                        {(searchParams.no_of_people < firstRoom.min_people ||
                          searchParams.no_of_people > firstRoom.max_people) && (
                          <small style={{ color: 'var(--danger-color)', display: 'block', marginTop: '12px', textAlign: 'center' }}>
                            Not suitable for {searchParams.no_of_people} {searchParams.no_of_people === 1 ? 'guest' : 'guests'}
                          </small>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <div className="empty-state" style={{ marginTop: '24px' }}>
              <AlertCircle size={48} className="empty-state-icon" />
              <h5>No Rooms Available</h5>
              <p>This hotel doesn't have any rooms available at the moment.</p>
            </div>
          )}

          {/* ===== REVIEWS SECTION ===== */}
          <div className="reviews-section">
            <h3>
              <Star size={28} />
              Guest Reviews ({reviews.length})
            </h3>

            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Spinner animation="border" variant="primary" size="lg" />
              </div>
            ) : reviews.length > 0 ? (
              <Row className="g-4" style={{ marginTop: '24px' }}>
                {reviews.map((review) => (
                  <Col lg={6} key={review.id}>
                    <div className="review-card">
                      {/* Rating Stars */}
                      <div className="review-rating">
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              style={{
                                fill: i < review.rating ? '#fbbf24' : '#d1d5db',
                                color: i < review.rating ? '#fbbf24' : '#d1d5db',
                              }}
                            />
                          ))}
                        </div>
                        <Badge bg="light" text="dark" style={{ fontSize: '0.8rem' }}>
                          {review.rating}/5
                        </Badge>
                      </div>

                      {/* Title */}
                      {review.title && (
                        <h6 className="review-title">{review.title}</h6>
                      )}

                      {/* Comment */}
                      <p className="review-comment">{review.comment}</p>

                      {/* Meta Info */}
                      <div className="review-meta">
                        <div>
                          <span className="review-author">{review.user_name}</span>
                          <span> • {review.room_type} Room</span>
                        </div>
                        <span>{review.created_at_formatted}</span>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="empty-state" style={{ marginTop: '24px' }}>
                <Star size={48} className="empty-state-icon" style={{ color: 'var(--text-light)', opacity: 0.5 }} />
                <h5>No Reviews Yet</h5>
                <p style={{ color: 'var(--success-color)', fontWeight: '500' }}>
                  Be the first to share your experience at this hotel!
                </p>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* ===== BOOKING MODAL ===== */}
      {selectedRoom && hotel && (
        <BookingModal
          show={showBookingModal}
          onHide={() => setShowBookingModal(false)}
          hotel={hotel}
          room={selectedRoom}
          checkInDate={searchParams.check_in_date}
          checkOutDate={searchParams.check_out_date}
          noOfPeople={searchParams.no_of_people}
          durationDays={durationDays}
        />
      )}

      {/* ===== IMAGE SLIDER MODAL ===== */}
      {showImageSlider && (
        <ImageSliderModal
          images={getHotelGalleryImages()}
          currentIndex={currentImageIndex}
          onClose={handleCloseSlider}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          hotelName={hotel?.name}
        />
      )}

      <Footer />
    </>
  );
};

/**
 * ImageSliderModal Component
 * Displays a centered modal image slider with navigation controls
 * Supports keyboard and touch/swipe gestures
 */
const ImageSliderModal = ({ images, currentIndex, onClose, onPrevious, onNext, hotelName }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <>
      {/* ===== DARK OVERLAY ===== */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClose}
      />

      {/* ===== MODERN MODAL CONTAINER ===== */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95vw',
          maxWidth: '1000px',
          height: '85vh',
          maxHeight: '800px',
          backgroundColor: 'var(--bg-white)',
          borderRadius: 'var(--radius-lg)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* ===== HEADER ===== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-light)',
          }}
        >
          <h6 style={{
            color: 'var(--text-dark)',
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '600',
          }}>
            {hotelName}
          </h6>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{
              color: 'var(--text-light)',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}>
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                transition: 'all 0.2s ease',
                borderRadius: 'var(--radius-sm)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--border-light)';
                e.target.style.color = 'var(--text-dark)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--text-light)';
              }}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ===== IMAGE CONTAINER ===== */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {currentImage && (
            <img
              src={currentImage.url}
              alt={`Hotel Gallery ${currentIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            />
          )}

          {/* ===== NAVIGATION ARROWS ===== */}
          {images.length > 1 && (
            <>
              <button
                onClick={onPrevious}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: 10001,
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
                title="Previous (← Arrow)"
              >
                ‹
              </button>

              <button
                onClick={onNext}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  zIndex: 10001,
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
                title="Next (→ Arrow)"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* ===== INDICATOR DOTS ===== */}
        {images.length > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              padding: '20px',
              backgroundColor: 'var(--bg-light)',
              borderTop: '1px solid var(--border-light)',
              flexWrap: 'wrap',
            }}
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const diff = idx - currentIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) onNext();
                  } else if (diff < 0) {
                    for (let i = 0; i < -diff; i++) onPrevious();
                  }
                }}
                style={{
                  width: idx === currentIndex ? '12px' : '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor:
                    idx === currentIndex ? 'var(--text-dark)' : 'var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  if (idx !== currentIndex) {
                    e.target.style.backgroundColor = 'var(--text-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== currentIndex) {
                    e.target.style.backgroundColor = 'var(--border-light)';
                  }
                }}
                title={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default HotelDetails;
