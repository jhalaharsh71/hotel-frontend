import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import {
  Calendar,
  Users,
  MapPin,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  Clock,
  Briefcase,
  Star,
} from 'lucide-react';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import './UserBooking.css';
import { USER_API } from '../../../config/api';

const API_BASE = USER_API;

/* ================= DATE FORMAT ================= */
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const UserBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('user_token');

  // ===== STATE MANAGEMENT =====
  const [availabilityForm, setAvailabilityForm] = useState({
    city: '',
    check_in_date: '',
    check_out_date: '',
    no_of_people: 1,
  });

  // City search states
  const [cityInput, setCityInput] = useState('');
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const debounceTimer = useRef(null);

  const [availableHotels, setAvailableHotels] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [durationDays, setDurationDays] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // User bookings state
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Hotel ratings state
  const [hotelRatings, setHotelRatings] = useState({});

  // ===== FILTER STATE =====
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    roomType: '',
    rating: 0,
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    room_id: '',
    paid: '',
    mode_of_payment: 'Cash',
  });

  const [selectedRoomPrice, setSelectedRoomPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ===== REDIRECT FROM CHECKHOTEL =====
  useEffect(() => {
    if (location.state) {
      const { city, check_in_date, check_out_date, no_of_people } = location.state;
      setAvailabilityForm({
        city: city || '',
        check_in_date: check_in_date || '',
        check_out_date: check_out_date || '',
        no_of_people: no_of_people || 1,
      });
      setCityInput(city || '');
    }
  }, [location.state]);

  // ===== LOAD INITIAL CITIES ON MOUNT =====
  useEffect(() => {
    fetchCities('');
  }, []);

  // ===== AUTO-CHECK AVAILABILITY WHEN FORM IS POPULATED =====
  useEffect(() => {
    if (location.state && availabilityForm.city && availabilityForm.check_in_date && availabilityForm.check_out_date) {
      // Use a small delay to ensure state is properly updated
      const timer = setTimeout(() => {
        handleCheckAvailability(null, true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [availabilityForm.city, availabilityForm.check_in_date, availabilityForm.check_out_date]);

  // ===== DEBOUNCED CITY SEARCH =====
  const fetchCities = useCallback(async (searchTerm) => {
    try {
      setLoadingCities(true);
      const response = await axios.get(`${API_BASE}/search-cities`, {
        params: {
          q: searchTerm,
          limit: 15,
        },
      });

      if (response.data.cities) {
        setCities(response.data.cities);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // ===== HANDLE CITY INPUT CHANGE WITH DEBOUNCING =====
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCityInput(value);
    setShowCityDropdown(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchCities(value);
    }, 300);
  };

  // ===== SELECT CITY FROM DROPDOWN =====
  const handleSelectCity = (cityName) => {
    setCityInput(cityName);
    setAvailabilityForm((prev) => ({ ...prev, city: cityName }));
    setShowCityDropdown(false);
    setError(null);
  };

  // ===== FETCH USER BOOKINGS =====
  const fetchUserBookings = async () => {
    if (!token) return;

    try {
      setLoadingBookings(true);
      const res = await axios.get(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.bookings) {
        setUserBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ===== FETCH HOTEL RATINGS =====
  const fetchHotelRating = async (hotelId) => {
    try {
      const res = await axios.get(`${API_BASE}/hotels/${hotelId}/reviews`);
      const reviews = Array.isArray(res.data) ? res.data : [];
      
      if (reviews.length > 0) {
        const avgRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
        setHotelRatings((prev) => ({
          ...prev,
          [hotelId]: {
            average: avgRating,
            count: reviews.length,
          },
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch rating for hotel ${hotelId}`, err);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [token]);

  // ===== FORM HANDLERS =====
  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityForm((prev) => ({
      ...prev,
      [name]: name === 'no_of_people' ? parseInt(value) : value,
    }));
    setError(null);
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  // ===== CALCULATE TOTAL AMOUNT =====
  useEffect(() => {
    setTotalAmount(selectedRoomPrice * durationDays);
  }, [selectedRoomPrice, durationDays]);

  // ===== ROOM SELECTION HANDLER =====
  const handleRoomSelect = (e) => {
    const selectedRoomId = e.target.value;
    
    // Find the room across all hotels to get its price
    let selectedRoom = null;
    for (const hotel of availableHotels) {
      const found = hotel.room_types.find(room => room.id === parseInt(selectedRoomId));
      if (found) {
        selectedRoom = found;
        setSelectedHotelId(hotel.hotel_id);
        break;
      }
    }

    setBookingForm((prev) => ({
      ...prev,
      room_id: selectedRoomId,
    }));

    if (selectedRoom) {
      setSelectedRoomPrice(selectedRoom.price_per_day);
    }
  };

  // ===== FILTER HANDLER =====
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (filterType === 'priceMin') {
        return { ...prev, priceRange: { ...prev.priceRange, min: parseInt(value) } };
      } else if (filterType === 'priceMax') {
        return { ...prev, priceRange: { ...prev.priceRange, max: parseInt(value) } };
      } else if (filterType === 'roomType') {
        return { ...prev, roomType: value };
      } else if (filterType === 'rating') {
        return { ...prev, rating: parseInt(value) };
      }
      return prev;
    });
  };

  // ===== APPLY FILTERS TO HOTELS =====
  const getFilteredHotels = () => {
    if (!availableHotels.length) return [];

    return availableHotels.filter((hotel) => {
      // FILTER 1: Price Filter - Show hotels with at least ONE available room in selected price range
      const priceFilter = hotel.room_types.some((room) => {
        return room.price_per_day >= filters.priceRange.min && room.price_per_day <= filters.priceRange.max;
      });
      if (!priceFilter) return false;

      // FILTER 2: Room Type Filter - Show hotels with at least ONE available room of selected type
      if (filters.roomType) {
        const roomTypeFilter = hotel.room_types.some((room) => room.room_type === filters.roomType);
        if (!roomTypeFilter) return false;
      }

      // FILTER 3: Rating Filter - Show hotels with rating >= selected rating
      // Hotels without reviews are shown in all rating filters
      if (filters.rating > 0) {
        const hotelRating = hotelRatings[hotel.hotel_id];
        if (hotelRating && parseFloat(hotelRating.average) < filters.rating) {
          return false;
        }
      }

      return true;
    });
  };

  // ===== GET UNIQUE ROOM TYPES FROM AVAILABLE HOTELS =====
  const getUniqueRoomTypes = () => {
    const roomTypes = new Set();
    availableHotels.forEach((hotel) => {
      hotel.room_types.forEach((room) => {
        roomTypes.add(room.room_type);
      });
    });
    return Array.from(roomTypes).sort();
  };

  // ===== GET MIN AND MAX PRICES =====
  const getPriceRangeFromAvailableHotels = () => {
    let min = Infinity;
    let max = 0;
    availableHotels.forEach((hotel) => {
      hotel.room_types.forEach((room) => {
        if (room.price_per_day < min) min = room.price_per_day;
        if (room.price_per_day > max) max = room.price_per_day;
      });
    });
    return { min: min === Infinity ? 0 : min, max: max === 0 ? 10000 : max };
  };

  // ===== CHECK AVAILABILITY =====
  const handleCheckAvailability = async (e, isAutomatic = false) => {
    if (e) e.preventDefault();

    if (!availabilityForm.city.trim()) {
      setError('Please select a city');
      return;
    }
    if (!availabilityForm.check_in_date) {
      setError('Please select check-in date');
      return;
    }
    if (!availabilityForm.check_out_date) {
      setError('Please select check-out date');
      return;
    }
    if (
      new Date(availabilityForm.check_out_date) <=
      new Date(availabilityForm.check_in_date)
    ) {
      setError('Check-out date must be after check-in date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE}/check-room-availability`, {
        city: availabilityForm.city,
        check_in_date: availabilityForm.check_in_date,
        check_out_date: availabilityForm.check_out_date,
        no_of_people: availabilityForm.no_of_people,
      });

      if (response.data.available_hotels) {
        setAvailableHotels(response.data.available_hotels);
        setDurationDays(response.data.duration_days);
        setAvailabilityChecked(true);
        setShowBookingForm(true);

        // Reset filters when new search is performed
        setFilters({
          priceRange: { min: 0, max: 10000 },
          roomType: '',
          rating: 0,
        });

        // Fetch ratings for all available hotels
        response.data.available_hotels.forEach((hotel) => {
          fetchHotelRating(hotel.hotel_id);
        });

        // Reset booking form and selected hotel
        setBookingForm((prev) => ({
          ...prev,
          check_in_date: availabilityForm.check_in_date,
          check_out_date: availabilityForm.check_out_date,
          no_of_people: availabilityForm.no_of_people,
          room_id: '',
        }));
        setSelectedRoomPrice(0);
        setSelectedHotelId(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to check availability. Please try again.'
      );
      setAvailableHotels([]);
      setAvailabilityChecked(false);
      setShowBookingForm(false);
    } finally {
      setLoading(false);
    }
  };

  // ===== NAVIGATE TO HOTEL DETAILS =====
  const handleHotelClick = (hotelId) => {
    navigate(`/hotel-details/${hotelId}`, {
      state: {
        check_in_date: availabilityForm.check_in_date,
        check_out_date: availabilityForm.check_out_date,
        no_of_people: availabilityForm.no_of_people,
      },
    });
  };

  // ===== GET MIN AND MAX PRICE FOR HOTEL =====
  const getPriceRange = (hotel) => {
    if (!hotel.room_types || hotel.room_types.length === 0) {
      return { min: 0, max: 0 };
    }
    const prices = hotel.room_types.map((room) => room.price_per_day);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  };

  // ===== GET HOTEL IMAGE URL =====
  const getHotelImageUrl = (hotelIndex) => {
    const hotelImages = [
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/732332/pexels-photo-732332.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/1631279/pexels-photo-1631279.jpeg?w=500&h=300&fit=crop',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?w=500&h=300&fit=crop',
    ];
    return hotelImages[hotelIndex % hotelImages.length];
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Header />

      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1b4b 25%, #2d3561 50%, #1a2847 75%, #0f1828 100%)',
          minHeight: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background gradient orbs */}
        <div
          style={{
            position: 'fixed',
            top: '-200px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'fixed',
            bottom: '-150px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <Container style={{ position: 'relative', zIndex: 1, paddingBottom: '60px' }}>


          {/* ERROR & SUCCESS MESSAGES */}
          {error && (
            <Row className="mb-4">
              <Col lg={8} className="mx-auto">
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                  style={{
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    color: '#7f1d1d',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.15)',
                  }}
                >
                  <AlertCircle size={24} style={{ flexShrink: 0, color: '#dc2626' }} />
                  <div style={{ fontWeight: '500', fontSize: '1rem' }}>{error}</div>
                </Alert>
              </Col>
            </Row>
          )}

          {successMessage && (
            <Row className="mb-4">
              <Col lg={8} className="mx-auto">
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => setSuccessMessage(null)}
                  style={{
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                    color: '#065f46',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
                  }}
                >
                  <CheckCircle size={24} style={{ flexShrink: 0, color: '#059669' }} />
                  <div style={{ fontWeight: '500', fontSize: '1rem' }}>{successMessage}</div>
                </Alert>
              </Col>
            </Row>
          )}

          {/* CHECK AVAILABILITY FORM - HORIZONTAL STRIP */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '14px',
              padding: '20px 30px',
              marginBottom: '50px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
              position: 'relative',
              zIndex: 10000,
            }}
          >
            <Form onSubmit={handleCheckAvailability} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {/* City Selection */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <Form.Group style={{ marginBottom: '0' }}>
                  <Form.Label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>
                    City
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search cities..."
                      value={cityInput}
                      onChange={handleCityInputChange}
                      onFocus={() => setShowCityDropdown(true)}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(226, 232, 240, 0.3)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                      }}
                      autoComplete="off"
                    />

                    {/* City Dropdown */}
                    {showCityDropdown && (
                      <div
                        className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm"
                        style={{ zIndex: 9999 }}
                      >
                        {loadingCities ? (
                          <div className="p-3 text-center">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading cities...
                          </div>
                        ) : cities.length > 0 ? (
                          <ListGroup className="border-0">
                            {cities.map((city) => (
                              <ListGroup.Item
                                key={city.id}
                                action
                                onClick={() => handleSelectCity(city.name)}
                                className="border-0 border-bottom cursor-pointer"
                                style={{ cursor: 'pointer' }}
                              >
                                <small>{city.name}</small>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        ) : (
                          <div className="p-3 text-center text-muted">
                            <small>No cities found</small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </div>

              {/* Check-in Date */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <Form.Group style={{ marginBottom: '0' }}>
                  <Form.Label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>
                    Check-in Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="check_in_date"
                    value={availabilityForm.check_in_date}
                    onChange={handleAvailabilityChange}
                    min={today}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid rgba(226, 232, 240, 0.3)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                    }}
                    required
                  />
                </Form.Group>
              </div>

              {/* Check-out Date */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <Form.Group style={{ marginBottom: '0' }}>
                  <Form.Label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>
                    Check-out Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="check_out_date"
                    value={availabilityForm.check_out_date}
                    onChange={handleAvailabilityChange}
                    min={availabilityForm.check_in_date || today}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid rgba(226, 232, 240, 0.3)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                    }}
                    required
                  />
                </Form.Group>
              </div>

              {/* Number of People */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <Form.Group style={{ marginBottom: '0' }}>
                  <Form.Label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>
                    Number of People
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="no_of_people"
                    value={availabilityForm.no_of_people}
                    onChange={handleAvailabilityChange}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid rgba(226, 232, 240, 0.3)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                    }}
                    required
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 People</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4 People</option>
                    <option value={5}>5 People</option>
                    <option value={6}>6 People</option>
                  </Form.Control>
                </Form.Group>
              </div>

              {/* Check Availability Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 30px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                  minWidth: '150px',
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search size={18} className="me-2" style={{ display: 'inline' }} />
                    SEARCH
                  </>
                )}
              </Button>
            </Form>
          </div>

          {/* HERO SECTION - ONLY SHOW IF NO SEARCH YET */}
          {!availabilityChecked && (
            <Row className="mb-5">
              <Col lg={12}>
                <div 
                  style={{ 
                    textAlign: 'center', 
                    color: 'white', 
                    marginBottom: '60px',
                    padding: '40px 20px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      marginBottom: '25px',
                      boxShadow: '0 15px 40px rgba(59, 130, 246, 0.4)',
                    }}
                  >
                    <Briefcase size={40} />
                  </div>
                  <h1
                    style={{
                      fontSize: '3.5rem',
                      fontWeight: '900',
                      margin: '0 0 15px 0',
                      letterSpacing: '-2px',
                      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Find Your Perfect Stay
                  </h1>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      color: '#e2e8f0',
                      margin: '0 0 5px 0',
                      fontWeight: '500',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Discover luxury accommodations at the best prices
                  </p>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: '#94a3b8',
                      margin: 0,
                      fontWeight: '400',
                    }}
                  >
                    Easy booking, amazing experiences
                  </p>
                </div>
              </Col>
            </Row>
          )}

          {/* AVAILABLE HOTELS SECTION */}
          {showBookingForm && availableHotels.length > 0 && (
            <Row className="mb-5">
              {/* ===== VERTICAL FILTERS SIDEBAR ===== */}
              <Col lg={2}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '14px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: '20px',
                  }}
                >
                  <h5 className="text-white mb-4 d-flex align-items-center gap-2">
                    <span>🔍</span> Filters
                  </h5>

                  {/* PRICE RANGE SLIDER */}
                  <div className="mb-4">
                    <Form.Label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>
                      Price Range
                    </Form.Label>
                    <div style={{ padding: '10px 0' }}>
                      {/* Min Slider */}
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          value={filters.priceRange.min}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value);
                            if (newMin <= filters.priceRange.max) {
                              handleFilterChange('priceMin', e.target.value);
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + ((filters.priceRange.min / 10000) * 100) + '%, rgba(226, 232, 240, 0.3) ' + ((filters.priceRange.min / 10000) * 100) + '%, rgba(226, 232, 240, 0.3) 100%)',
                            outline: 'none',
                            WebkitAppearance: 'none',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        <style>{`
                          input[type='range']::-webkit-slider-thumb {
                            appearance: none;
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                            cursor: pointer;
                            border: 3px solid rgba(255, 255, 255, 0.9);
                            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                          }
                          input[type='range']::-moz-range-thumb {
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                            cursor: pointer;
                            border: 3px solid rgba(255, 255, 255, 0.9);
                            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                          }
                        `}</style>
                      </div>

                      {/* Max Slider */}
                      <div style={{ marginBottom: '16px' }}>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          value={filters.priceRange.max}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value);
                            if (newMax >= filters.priceRange.min) {
                              handleFilterChange('priceMax', e.target.value);
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'linear-gradient(to right, rgba(226, 232, 240, 0.3) 0%, rgba(226, 232, 240, 0.3) ' + ((filters.priceRange.max / 10000) * 100) + '%, #3b82f6 ' + ((filters.priceRange.max / 10000) * 100) + '%, #3b82f6 100%)',
                            outline: 'none',
                            WebkitAppearance: 'none',
                            appearance: 'none',
                            cursor: 'pointer',
                          }}
                        />
                      </div>

                      {/* Price Display */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          textAlign: 'center',
                          color: '#e2e8f0',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}>
                          ₹{filters.priceRange.min}
                        </div>
                        <div style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          textAlign: 'center',
                          color: '#e2e8f0',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}>
                          ₹{filters.priceRange.max}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROOM TYPE FILTER */}
                  <div className="mb-4">
                    <Form.Label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Room Type
                    </Form.Label>
                    <Form.Select
                      value={filters.roomType}
                      onChange={(e) => handleFilterChange('roomType', e.target.value)}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(226, 232, 240, 0.3)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '10px 12px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="">All Types</option>
                      {getUniqueRoomTypes().map((roomType) => (
                        <option key={roomType} value={roomType}>
                          {roomType}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  {/* RATING FILTER */}
                  <div className="mb-4">
                    <Form.Label style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Min. Rating
                    </Form.Label>
                    <Form.Select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(226, 232, 240, 0.3)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '10px 12px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value={0}>All Ratings</option>
                      <option value={1}>⭐ 1+</option>
                      <option value={2}>⭐⭐ 2+</option>
                      <option value={3}>⭐⭐⭐ 3+</option>
                      <option value={4}>⭐⭐⭐⭐ 4+</option>
                      <option value={5}>⭐⭐⭐⭐⭐ 5</option>
                    </Form.Select>
                  </div>

                  {/* RESET FILTERS BUTTON */}
                  <Button
                    onClick={() => setFilters({ priceRange: { min: 0, max: 10000 }, roomType: '', rating: 0 })}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid rgba(226, 232, 240, 0.5)',
                      color: '#e2e8f0',
                      background: 'rgba(59, 130, 246, 0.2)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      padding: '10px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.4)';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                      e.target.style.color = '#e2e8f0';
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </Col>

              {/* HOTELS SECTION */}
              <Col lg={10}>
                <h3 className="mb-4 d-flex align-items-center gap-2 text-white">
                  <MapPin size={28} className="text-primary" />
                  Available Hotels in {availabilityForm.city}
                </h3>

                {/* FILTERED HOTELS GRID */}
                {getFilteredHotels().length > 0 ? (
                  <Row className="g-4">
                    {getFilteredHotels().map((hotel, hotelIndex) => {
                      const { min, max } = getPriceRange(hotel);

                    return (
                      <Col md={6} lg={4} key={hotelIndex}>
                        <Card
                          className="shadow-lg border-0 h-100"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'hidden',
                            borderRadius: '16px',
                            background: '#ffffff',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                            e.currentTarget.style.boxShadow =
                              '0 30px 60px rgba(59, 130, 246, 0.35)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow =
                              '0 10px 30px rgba(0, 0, 0, 0.15)';
                          }}
                          onClick={() => handleHotelClick(hotel.hotel_id)}
                        >
                          {/* HOTEL IMAGE */}
                          <div
                            style={{
                              height: '220px',
                              overflow: 'hidden',
                              backgroundColor: '#e2e8f0',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={getHotelImageUrl(hotelIndex)}
                              alt={hotel.hotel_name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.12)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                              }}
                              onError={(e) => {
                                e.target.src =
                                  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=500&h=300&fit=crop';
                              }}
                            />
                            {/* DISCOUNT BADGE - LEFT */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                padding: '8px 14px',
                                borderRadius: '0 0 12px 0',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                              }}
                            >
                              Up to 40% off
                            </div>
                            {/* PRICE BADGE - RIGHT */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                padding: '8px 14px',
                                borderRadius: '0 0 0 12px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                              }}
                            >
                              ₹{min} - ₹{max}
                            </div>
                          </div>

                          <Card.Body className="p-5 d-flex flex-column">
                            {/* HOTEL NAME & RATING */}
                            <h5
                              className="mb-2"
                              style={{
                                color: '#0f172a',
                                fontWeight: '800',
                                minHeight: '2.5rem',
                                fontSize: '1.2rem',
                              }}
                            >
                              {hotel.hotel_name}
                            </h5>

                            {/* HOTEL RATING */}
                            {hotelRatings[hotel.hotel_id] ? (
                              <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="d-flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      style={{
                                        fill: i < Math.round(hotelRatings[hotel.hotel_id].average) ? '#fbbf24' : '#d1d5db',
                                        color: i < Math.round(hotelRatings[hotel.hotel_id].average) ? '#fbbf24' : '#d1d5db',
                                      }}
                                    />
                                  ))}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
                                  {hotelRatings[hotel.hotel_id].average} ({hotelRatings[hotel.hotel_id].count} review{hotelRatings[hotel.hotel_id].count !== 1 ? 's' : ''})
                                </span>
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', fontStyle: 'italic' }}>
                                No reviews yet
                              </p>
                            )}

                            {/* HOTEL ADDRESS */}
                            <p
                              className="mb-3 d-flex align-items-start gap-2"
                              style={{ fontSize: '0.9rem', color: '#64748b' }}
                            >
                              <MapPin
                                size={16}
                                className="flex-shrink-0 mt-1"
                                style={{ color: '#3b82f6' }}
                              />
                              <span>{hotel.hotel_address}</span>
                            </p>

                            {/* AVAILABLE ROOMS BADGE */}
                            <div
                              style={{
                                display: 'inline-block',
                                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                color: '#166534',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                marginBottom: '16px',
                                border: '1px solid #86efac',
                              }}
                            >
                              ✓ {hotel.total_rooms_in_hotel} rooms available
                            </div>

                            <div style={{ flex: 1 }} />

                            {/* CLICK TO VIEW BUTTON */}
                            <Button
                              variant="primary"
                              className="w-100 fw-bold"
                              style={{
                                background:
                                  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '12px 0',
                                transition: 'all 0.3s ease',
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background =
                                  'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                                e.target.style.boxShadow =
                                  '0 10px 25px rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background =
                                  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              <span className="d-flex align-items-center justify-content-center gap-2">
                                View Details
                                <ChevronRight size={18} />
                              </span>
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                  </Row>
                ) : (
                  <div
                    style={{
                      borderRadius: '16px',
                      border: '2px solid #e0e7ff',
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      color: '#0c4a6e',
                      padding: '50px 30px',
                      textAlign: 'center',
                      boxShadow: '0 10px 30px rgba(6, 182, 212, 0.1)',
                    }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        border: '3px solid #a5f3fc',
                      }}
                    >
                      <AlertCircle size={40} style={{ color: '#0369a1' }} />
                    </div>
                    <h5 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#0c4a6e' }}>
                      No Hotels Match Your Filters
                    </h5>
                    <p style={{ marginBottom: '20px', fontSize: '1rem', color: '#0e7490' }}>
                      Try adjusting your price range, room type, or rating to see more options.
                    </p>
                    <Button
                      onClick={() => setFilters({ priceRange: { min: 0, max: 10000 }, roomType: '', rating: 0 })}
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 25px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          )}

          {/* NO ROOMS AVAILABLE MESSAGE */}
          {availabilityChecked && availableHotels.length === 0 && (
            <Row className="mb-5">
              <Col lg={8} className="mx-auto">
                <div
                  style={{
                    borderRadius: '16px',
                    border: '2px solid #e0e7ff',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    color: '#0c4a6e',
                    padding: '50px 30px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: '3px solid #a5f3fc',
                    }}
                  >
                    <AlertCircle size={40} style={{ color: '#0369a1' }} />
                  </div>
                  <h5 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#0c4a6e' }}>No Rooms Available</h5>
                  <p style={{ marginBottom: '20px', fontSize: '1rem', color: '#0e7490' }}>
                    We couldn't find any rooms in <strong>{availabilityForm.city}</strong> for your selected dates and preferences.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#164e63', fontWeight: '500' }}>
                    Try adjusting your dates, location, or number of guests
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default UserBooking;
