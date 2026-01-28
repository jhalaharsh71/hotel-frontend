import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
} from 'react-bootstrap';
import {
  Calendar,
  Users,
  MapPin,
  Search,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import './home.css';
import { USER_API } from '../../../config/api';

const API_BASE = USER_API;

const CheckHotel = () => {
  const navigate = useNavigate();

  // ===== STATE MANAGEMENT =====
  const [searchForm, setSearchForm] = useState({
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

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searched, setSearched] = useState(false);

  // ===== LOAD INITIAL CITIES ON MOUNT =====
  useEffect(() => {
    fetchCities('');
  }, []);

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

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search (300ms)
    debounceTimer.current = setTimeout(() => {
      fetchCities(value);
    }, 300);
  };

  // ===== SELECT CITY FROM DROPDOWN =====
  const handleSelectCity = (cityName) => {
    setCityInput(cityName);
    setSearchForm((prev) => ({ ...prev, city: cityName }));
    setShowCityDropdown(false);
    setError(null);
  };

  // ===== FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: name === 'no_of_people' ? parseInt(value) : value,
    }));
    setError(null);
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    if (!searchForm.city.trim()) {
      setError('Please select a city');
      return false;
    }
    if (!searchForm.check_in_date) {
      setError('Please select check-in date');
      return false;
    }
    if (!searchForm.check_out_date) {
      setError('Please select check-out date');
      return false;
    }
    if (new Date(searchForm.check_out_date) <= new Date(searchForm.check_in_date)) {
      setError('Check-out date must be after check-in date');
      return false;
    }
    if (searchForm.no_of_people < 1) {
      setError('Number of people must be at least 1');
      return false;
    }
    return true;
  };

  // ===== SEARCH HOTELS =====
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Navigate to UserBooking page with search details
    navigate('/booking', {
      state: {
        city: searchForm.city,
        check_in_date: searchForm.check_in_date,
        check_out_date: searchForm.check_out_date,
        no_of_people: searchForm.no_of_people,
      },
    });
  };

  // ===== NAVIGATE TO HOTEL DETAILS =====
  const handleSelectHotel = (hotelId) => {
    navigate(`/hotel-details/${hotelId}`, {
      state: {
        check_in_date: searchForm.check_in_date,
        check_out_date: searchForm.check_out_date,
        no_of_people: searchForm.no_of_people,
      },
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="check-hotel-overlay">
      <Container className="py-4">
        {/* ===== SEARCH FORM SECTION ===== */}
        <Row>
          <Col lg={12} className="mx-auto">
            <Card className="shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="mb-3 mb-md-4">
                  <h2 className="mb-2 d-flex align-items-center gap-2">
                    <Search size={28} className="text-primary" />
                    Find Your Perfect Hotel
                  </h2>
                  <p className="text-muted small">
                    Search and book hotels in your preferred city
                  </p>
                </div>

                <Form onSubmit={handleSearch}>
                  <Row className="search-form-row">
                    {/* City Selection - Now with dynamic search */}
                    <Col className="search-col">
                      <Form.Group>
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 search-label">
                          <MapPin size={16} className="text-primary" />
                          City
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type="text"
                            placeholder="Search cities..."
                            value={cityInput}
                            onChange={handleCityInputChange}
                            onFocus={() => setShowCityDropdown(true)}
                            className="search-input"
                            autoComplete="off"
                          />
                          
                          {/* City Dropdown */}
                          {showCityDropdown && (
                            <div className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm" style={{ zIndex: 1000 }}>
                              {loadingCities ? (
                                <div className="p-2 text-center">
                                  <Spinner animation="border" size="sm" className="me-2" />
                                  <small>Loading cities...</small>
                                </div>
                              ) : cities.length > 0 ? (
                                <ListGroup className="border-0">
                                  {cities.map((city) => (
                                    <ListGroup.Item
                                      key={city.id}
                                      action
                                      onClick={() => handleSelectCity(city.name)}
                                      className="border-0 border-bottom cursor-pointer small py-2"
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <small>{city.name}</small>
                                    </ListGroup.Item>
                                  ))}
                                </ListGroup>
                              ) : (
                                <div className="p-2 text-center text-muted">
                                  <small>No cities found</small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Check-in Date */}
                    <Col className="search-col">
                      <Form.Group>
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 search-label">
                          <Calendar size={16} className="text-primary" />
                          Check-in
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="check_in_date"
                          value={searchForm.check_in_date}
                          onChange={handleInputChange}
                          min={today}
                          className="search-input"
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Check-out Date */}
                    <Col className="search-col">
                      <Form.Group>
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 search-label">
                          <Calendar size={16} className="text-primary" />
                          Check-out
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="check_out_date"
                          value={searchForm.check_out_date}
                          onChange={handleInputChange}
                          min={searchForm.check_in_date || today}
                          className="search-input"
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Number of People */}
                    <Col className="search-col">
                      <Form.Group>
                        <Form.Label className="fw-bold d-flex align-items-center gap-2 search-label">
                          <Users size={16} className="text-primary" />
                          People
                        </Form.Label>
                        <Form.Control
                          as="select"
                          name="no_of_people"
                          value={searchForm.no_of_people}
                          onChange={handleInputChange}
                          className="search-input"
                          required
                        >
                          <option value={1}>1 </option>
                          <option value={2}>2 </option>
                          <option value={3}>3 </option>
                          <option value={4}>4 </option>
                          <option value={5}>5 </option>
                          <option value={6}>6 </option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Error Message */}
                  {error && (
                    <Row className="mb-1 mt-2">
                      <Col>
                        <Alert variant="danger" className="mb-0 py-1 d-flex gap-2 search-alert">
                          <AlertCircle size={14} className="flex-shrink-0 mt-1" />
                          <div style={{ fontSize: '0.75rem' }}>{error}</div>
                        </Alert>
                      </Col>
                    </Row>
                  )}

                  {/* Search Button */}
                  <Row className="mt-1">
                    <Col className="d-grid">
                      <Button
                        variant="primary"
                        className="btn-search fw-bold search-btn"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search size={16} className="me-1" />
                            Search
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CheckHotel;
