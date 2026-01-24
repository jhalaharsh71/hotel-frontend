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

const API_BASE = 'http://127.0.0.1:8000/api/user';

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

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // ===== LOAD INITIAL CITIES ON MOUNT =====
  useEffect(() => {
    fetchHotelDetails();
    fetchReviews();
  }, [hotelId]);

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
    return [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?w=400&h=300&fit=crop',
    ];
  };

  // ===== GET MAIN HOTEL IMAGE =====
  const getMainHotelImage = () => {
    return "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?w=1200&h=500&fit=crop";
  };

  // ===== OPEN BOOKING MODAL =====
  const handleBookNow = (room) => {
    const token = localStorage.getItem('user_token');
    
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login', {
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
        {/* ===== MAIN HOTEL IMAGE HERO ===== */}
        <div
          className="position-relative"
          style={{
            height: '400px',
            backgroundColor: '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          <img
            src={getMainHotelImage()}
            alt={hotel?.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              e.target.src = 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?w=1200&h=500&fit=crop';
            }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          />
          <Container className="h-100 d-flex align-items-end pb-4 position-absolute start-0 bottom-0" style={{ zIndex: 1 }}>
            <div style={{ marginLeft: "8%" }}>
              <h1 className="text-white fw-bold mb-2">{hotel?.name}</h1>
              {reviews.length > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex gap-1">
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
                  <span style={{ color: '#fef3c7', fontSize: '1.1rem', fontWeight: '600' }}>
                    {averageRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </Container>
        </div>

        <Container className="py-5">
          {/* ===== HEADER WITH BACK BUTTON ===== */}
          <Row className="mb-4">
            <Col>
              <Button
                variant="light"
                size="lg"
                onClick={handleGoBack}
                className="d-flex align-items-center gap-2 mb-3"
              >
                <ChevronLeft size={20} />
                Back to Results
              </Button>
            </Col>
          </Row>

          {/* ===== HOTEL INFO SECTION ===== */}
          <Row className="mb-5">
            <Col lg={8}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">

                  <div className="mb-4">
                    <div className="d-flex gap-3 flex-wrap">
                      <div className="d-flex align-items-start gap-2">
                        <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                        <div>
                          <small className="text-muted d-block">Address</small>
                          <p className="mb-0">
                            {hotel.address}, {hotel.city}
                          </p>
                          <small className="text-muted">
                            {hotel.state}, {hotel.country}
                          </small>
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2">
                        <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                        <div>
                          <small className="text-muted d-block">Contact</small>
                          <p className="mb-0">{hotel.contact_no}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">About This Hotel</h6>
                    <p className="text-muted mb-3">
                      {hotel.description ||
                        'Welcome to our premium hotel offering world-class accommodations and exceptional service. Located in a prime area, our hotel provides the perfect blend of comfort, convenience, and luxury.'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Room Features & Amenities</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <ul className="list-unstyled text-muted small">
                          <li className="mb-2">✓ Air-conditioned rooms with climate control</li>
                          <li className="mb-2">✓ Premium bedding and comfortable furniture</li>
                          <li className="mb-2">✓ Modern en-suite bathrooms with amenities</li>
                          <li className="mb-2">✓ Flat-screen TV with satellite channels</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled text-muted small">
                          <li className="mb-2">✓ High-speed WiFi in all rooms</li>
                          <li className="mb-2">✓ Work desk for business travelers</li>
                          <li className="mb-2">✓ In-room dining services available</li>
                          <li className="mb-2">✓ Daily housekeeping service</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Hotel Facilities & Services</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <ul className="list-unstyled text-muted small">
                          <li className="mb-2">🍽️ Multi-cuisine restaurant</li>
                          <li className="mb-2">☕ Coffee shop and bar</li>
                          <li className="mb-2">💪 Fitness center and gym</li>
                          <li className="mb-2">🏊 Swimming pool</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="list-unstyled text-muted small">
                          <li className="mb-2">🛎️ 24/7 front desk service</li>
                          <li className="mb-2">🚖 Airport shuttle available</li>
                          <li className="mb-2">📋 Business center</li>
                          <li className="mb-2">🅿️ Ample parking facilities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* ===== HOTEL PHOTOS SECTION ===== */}
              <Card className="shadow-sm border-0 mb-5">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">Hotel Gallery</h5>
                  <Row className="g-3">
                    {getHotelGalleryImages().map((imageUrl, index) => (
                      <Col sm={6} key={index}>
                        <div
                          className="bg-light rounded overflow-hidden"
                          style={{
                            height: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ccc',
                            fontSize: '14px',
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Hotel Gallery ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1564501049351-005e2b74b9a9?w=400&h=300&fit=crop';
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* ===== BOOKING SUMMARY SIDEBAR ===== */}
            <Col lg={4}>
              <Card className="shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">Booking Summary</h5>

                  <div className="mb-3 pb-3 border-bottom">
                    <small className="text-muted d-block">Check-in</small>
                    <p className="mb-0 fw-semibold">
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

                  <div className="mb-3 pb-3 border-bottom">
                    <small className="text-muted d-block">Check-out</small>
                    <p className="mb-0 fw-semibold">
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

                  <div className="mb-3 pb-3 border-bottom">
                    <small className="text-muted d-block">Duration</small>
                    <p className="mb-0 fw-semibold">{durationDays} nights</p>
                  </div>

                  <div className="mb-0">
                    <small className="text-muted d-block">Guests</small>
                    <p className="mb-0 fw-semibold">
                      {searchParams.no_of_people} {searchParams.no_of_people === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ===== ROOMS SECTION ===== */}
          <Row>
            <Col>
              <h3 className="mb-4 fw-bold d-flex align-items-center gap-2">
                <BookOpen size={28} className="text-primary" />
                Available Room Types
              </h3>
            </Col>
          </Row>

          {rooms.length > 0 ? (
            <Row className="g-4">
              {Object.entries(groupRoomsByType()).map(([roomType, roomList]) => {
                const firstRoom = roomList[0];
                const availableCount = roomList.length;

                return (
                  <Col md={6} lg={4} key={roomType}>
                    <Card className="h-100 shadow-sm room-card hover-shadow">
                      {/* Room Image */}
                      <div
                        className="bg-light overflow-hidden"
                        style={{
                          height: '180px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ccc',
                          fontSize: '14px',
                        }}
                      >
                        <img
                          src={getRoomImageUrl(roomType)}
                          alt={roomType}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop';
                          }}
                        />
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <div className="mb-3">
                          <Card.Title className="mb-2">
                            <h5 className="mb-0">{roomType}</h5>
                          </Card.Title>
                          <Badge bg="info">
                            {availableCount} room{availableCount > 1 ? 's' : ''} available
                          </Badge>
                        </div>

                        {/* Room Details */}
                        <div className="mb-4 flex-grow-1">
                          <div className="mb-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Users size={18} className="text-primary" />
                              <span>
                                Capacity: {firstRoom.min_people} - {firstRoom.max_people} people
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <small className="text-muted d-block">Price per night</small>
                                <div className="d-flex align-items-center gap-2">
                                  <h5 className="mb-0">₹{firstRoom.price_per_day}</h5>
                                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                                    ₹{(firstRoom.price_per_day * 1.4).toFixed(0)}
                                  </span>
                                  <Badge bg="danger" style={{ fontSize: '0.75rem' }}>40% OFF</Badge>
                                </div>
                              </div>
                            </div>
                            {durationDays > 0 && (
                              <div className="pt-2 border-top">
                                <small className="text-muted d-block">Total for {durationDays} nights</small>
                                <div className="d-flex align-items-center gap-2">
                                  <p className="mb-0 fw-bold text-success" style={{ fontSize: '1.2rem' }}>
                                    ₹{(firstRoom.price_per_day * durationDays).toFixed(2)}
                                  </p>
                                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                                    ₹{(firstRoom.price_per_day * 1.4 * durationDays).toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="lg"
                          className="w-100"
                          onClick={() => handleBookNow(firstRoom)}
                          disabled={
                            searchParams.no_of_people < firstRoom.min_people ||
                            searchParams.no_of_people > firstRoom.max_people
                          }
                        >
                          <BookOpen size={18} className="me-2" />
                          Book Now
                        </Button>

                        {(searchParams.no_of_people < firstRoom.min_people ||
                          searchParams.no_of_people > firstRoom.max_people) && (
                          <small className="text-danger d-block mt-2 text-center">
                            Not suitable for {searchParams.no_of_people} people
                          </small>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Alert variant="info" className="text-center py-5">
              <AlertCircle size={48} className="mb-3 mx-auto d-block" />
              <h5>No Rooms Available</h5>
              <p className="mb-0">
                This hotel doesn't have any rooms available at the moment.
              </p>
            </Alert>
          )}

          {/* ===== REVIEWS SECTION ===== */}
          <div style={{ marginTop: '48px', paddingTop: '48px', borderTop: '2px solid #e2e8f0' }}>
            <h3 className="mb-4 fw-bold d-flex align-items-center gap-2">
              <Star size={28} className="text-warning" />
              Guest Reviews ({reviews.length})
            </h3>

            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <Spinner animation="border" variant="primary" size="lg" />
              </div>
            ) : reviews.length > 0 ? (
              <Row className="g-4">
                {reviews.map((review) => (
                  <Col lg={6} key={review.id}>
                    <Card className="h-100 shadow-sm" style={{ borderRadius: '12px', border: 'none' }}>
                      <Card.Body>
                        {/* Rating Stars */}
                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
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
                          <Badge bg="light" text="dark" style={{ marginLeft: '8px' }}>
                            {review.rating}/5
                          </Badge>
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
                          marginBottom: '12px',
                          lineHeight: '1.6',
                          fontSize: '0.95rem',
                        }}>
                          {review.comment}
                        </p>

                        {/* Meta Info */}
                        <div style={{
                          borderTop: '1px solid #e2e8f0',
                          paddingTop: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem',
                          color: '#94a3b8',
                        }}>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{review.user_name}</strong>
                            {' '}• {review.room_type} Room
                          </div>
                          <span>{review.created_at_formatted}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info" className="text-center py-5">
                {/* <Star size={48} className="mb-3 mx-auto d-block text-muted" style={{ opacity: 0.5 }} /> */}
                <h5>No Reviews Yet.   <span style={{fontSize:'1rem', color:'#058940'}}>
                  Be the first to share your experience at this hotel!
                </span></h5>
                
              </Alert>
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

      <Footer />
    </>
  );
};

export default HotelDetails;
