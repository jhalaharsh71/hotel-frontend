  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import {
    Modal,
    Button,
    Card,
    Row,
    Col,
    Table,
    Form,
    InputGroup,
    Badge,
    Spinner,
  } from "react-bootstrap";
  import {
    Plus,
    Search,
    Calendar,
    User,
    Mail,
    Phone,
    CreditCard,
    BedDouble,
    DollarSign,
  } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import "./Bookings.css";
  import { ADMIN_API } from "../../config/api";

  const API_BASE = ADMIN_API;

  /* =====================
    DATE FORMATTER
  ===================== */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /* =====================
    GET MIN DATE FOR INPUTS
  ===================== */
  const getMinCheckInDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const getMinCheckOutDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const Bookings = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("admin_token");

    /* =====================
      STATE
    ====================== */
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [dateErrors, setDateErrors] = useState({});

    // Guests state: array of guest objects for admin booking
    const [guests, setGuests] = useState([]);

    const [formData, setFormData] = useState({
      customer_name: "",
      email: "",
      phone: "",
      no_of_people: 1,
      check_in_date: "",
      check_out_date: "",
      room_id: "",
      paid_amount: "",
      total_amount: 0,
      due_amount: 0,
      mode_of_payment: "Cash",
    });

    /* =====================
      FETCH BOOKINGS
    ====================== */
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    /* =====================
      FETCH AVAILABLE ROOMS
    ====================== */
    const fetchAvailableRooms = async () => {
      if (!formData.check_in_date || !formData.check_out_date) return;

      try {
        const res = await axios.get(`${API_BASE}/available-rooms`, {
          params: {
            check_in: formData.check_in_date,
            check_out: formData.check_out_date,
            no_of_people: formData.no_of_people || 1,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data || []);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      }
    };

    useEffect(() => {
      fetchBookings();
    }, []);

    useEffect(() => {
      fetchAvailableRooms();
    }, [formData.check_in_date, formData.check_out_date, formData.no_of_people]);

    /* =====================
      HANDLERS
    ====================== */
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));

      // ===== DATE VALIDATION =====
      if (name === 'check_in_date' || name === 'check_out_date') {
        const checkIn = name === 'check_in_date' ? value : formData.check_in_date;
        const checkOut = name === 'check_out_date' ? value : formData.check_out_date;

        // ===== CHECK-IN DATE VALIDATION =====
        if (name === 'check_in_date' && value) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);

          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);

          if (selectedDate < yesterday) {
            setDateErrors(prev => ({
              ...prev,
              checkin: 'Check-in date cannot be before yesterday.'
            }));
          } else {
            setDateErrors(prev => ({
              ...prev,
              checkin: ''
            }));
          }
        }

        // ===== CHECK-OUT DATE VALIDATION =====
        if (name === 'check_out_date' && value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            setDateErrors(prev => ({
              ...prev,
              checkout: 'Check-out date cannot be before today.'
            }));
          } else if (checkIn && selectedDate < new Date(checkIn)) {
            setDateErrors(prev => ({
              ...prev,
              checkout: 'Check-out date cannot be earlier than check-in date.'
            }));
          } else {
            setDateErrors(prev => ({
              ...prev,
              checkout: ''
            }));
          }
        }

        // ===== CHECK-IN vs CHECK-OUT VALIDATION =====
        if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
          setDateErrors(prev => ({
            ...prev,
            checkout: 'Check-out date cannot be earlier than check-in date.'
          }));
        }
      }
    };

    const handleRoomChange = (e) => {
      const roomId = e.target.value;
      const room = rooms.find((r) => r.id == roomId);

      // Calculate number of days for accurate pricing display
      const calculateDays = () => {
        if (!formData.check_in_date || !formData.check_out_date) return 1;
        const checkIn = new Date(formData.check_in_date);
        const checkOut = new Date(formData.check_out_date);
        const diffTime = checkOut - checkIn;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 1 ? 1 : diffDays;
      };

      const numberOfDays = calculateDays();
      const calculatedTotal = room ? room.price * numberOfDays : 0;

      setFormData((p) => ({
        ...p,
        room_id: roomId,
        total_amount: calculatedTotal,
        due_amount: calculatedTotal - (p.paid_amount || 0),
      }));
    };

    const handlePaidChange = (e) => {
      const paid = Number(e.target.value || 0);
      setFormData((p) => ({
        ...p,
        paid_amount: paid,
        due_amount: p.total_amount - paid,
      }));
    };

    const resetForm = () => {
      setFormData({
        customer_name: "",
        email: "",
        phone: "",
        no_of_people: 1,
        check_in_date: "",
        check_out_date: "",
        room_id: "",
        paid_amount: "",
        total_amount: 0,
        due_amount: 0,
        mode_of_payment: "Cash",
      });
      setRooms([]);
      setDateErrors({});
      // Initialize guests array with 1 guest
      setGuests([
        {
          first_name: '',
          last_name: '',
          gender: '',
          age: '',
          phone: '',
          email: '',
          is_primary: true,
        }
      ]);
      setShowModal(false);
    };

    // Keep guests array length in sync when no_of_people changes
    useEffect(() => {
      const count = Number(formData.no_of_people) || 1;
      setGuests((prev) => {
        const prevCount = prev.length;
        if (count === prevCount) return prev;

        // Expand
        if (count > prevCount) {
          const toAdd = Array.from({ length: count - prevCount }).map((_, i) => ({
            first_name: '',
            last_name: '',
            gender: '',
            age: '',
            phone: '',
            email: '',
            is_primary: prevCount + i === 0 ? true : false,
          }));
          return [...prev, ...toAdd];
        }

        // Shrink - ensure first guest remains primary
        const newArr = prev.slice(0, count);
        if (newArr[0]) newArr[0].is_primary = true;
        return newArr;
      });
    }, [formData.no_of_people]);

    const handleGuestChange = (index, field, value) => {
      setGuests((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    };

    /* =====================
      SUBMIT
    ====================== */
    const validateGuestForm = () => {
      const expected = Number(formData.no_of_people) || 1;
      if (!Array.isArray(guests) || guests.length !== expected) {
        alert('Number of guests must match number of people');
        return false;
      }

      for (let i = 0; i < guests.length; i++) {
        const g = guests[i];
        if (!g.first_name || !g.first_name.trim()) {
          alert(`Guest ${i + 1}: First name is required`);
          return false;
        }
        if (!g.last_name || !g.last_name.trim()) {
          alert(`Guest ${i + 1}: Last name is required`);
          return false;
        }
        if (!g.gender || !g.gender.trim()) {
          alert(`Guest ${i + 1}: Gender is required`);
          return false;
        }
        if (g.age === '' || g.age === null || isNaN(Number(g.age))) {
          alert(`Guest ${i + 1}: Age must be a number`);
          return false;
        }
        if (!g.phone || !g.phone.trim()) {
          alert(`Guest ${i + 1}: Phone is required`);
          return false;
        }
        if (!g.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email)) {
          alert(`Guest ${i + 1}: Valid email is required`);
          return false;
        }
      }
      return true;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Prevent submission if there are date validation errors
      if (dateErrors.checkin || dateErrors.checkout) {
        alert('Please fix the date validation errors before submitting.');
        return;
      }

      // Validate guest form
      if (!validateGuestForm()) {
        return;
      }

      setSubmitting(true);

      try {
        // Derive customer_name from primary guest, and phone/email from form data
        const primaryGuest = guests && guests.length > 0 ? guests[0] : null;
        const derivedCustomerName = primaryGuest 
          ? `${primaryGuest.first_name} ${primaryGuest.last_name}`.trim() 
          : '';
        
        // Remove total_amount and due_amount - let backend calculate these based on days
        const { total_amount, due_amount, ...bookingData } = formData;
        
        await axios.post(`${API_BASE}/bookings`, { 
          ...bookingData, 
          customer_name: derivedCustomerName,
          phone: formData.phone || primaryGuest?.phone || '',
          email: formData.email || primaryGuest?.email || '',
          guests 
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchBookings();
        resetForm();
      } catch (err) {
        alert(err.response?.data?.message || "Booking failed");
      } finally {
        setSubmitting(false);
      }
    };

    /* =====================
      FILTER
    ====================== */
    const filteredBookings = bookings.filter((b) =>
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* =====================
      RENDER
    ====================== */
    return (
      <div className="bookings-wrapper">
        <div className="bookings-container">
          {/* HEADER SECTION */}
          <div className="bookings-header mb-5">
            <div className="header-content">
              <h1 className="bookings-title">
                <span className="gradient-text">Booking Management</span>
              </h1>
              <p className="bookings-subtitle">
                View and manage all guest bookings and reservations
              </p>
            </div>
            <div className="header-action">
              <Button 
                onClick={() => setShowModal(true)}
                className="btn-create-booking"
              >
                <span className="btn-icon">📅</span> New Booking
              </Button>
            </div>
          </div>

        {/* BOOKINGS LIST */}
        <Card className="bookings-card modern-card">
          <div className="bookings-card-header">
            <div className="stat-badge">
              <span className="stat-number">{filteredBookings.length}</span>
              <span className="stat-label">Bookings</span>
            </div>
            <InputGroup className="search-group">
              <InputGroup.Text className="search-icon">
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by guest name..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </InputGroup>
          </div>

          {loading ? (
            <div className="loading-state">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Bookings Found</h3>
              <p>Start by creating your first booking</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="btn-create-booking mt-3"
              >
                Create First Booking
              </Button>
            </div>
          ) : (
            <div className="bookings-table-wrapper">
            <Table hover responsive className="bookings-table">
              <thead>
                <tr>
                  <th><span className="th-label">👤 Guest</span></th>
                  <th><span className="th-label">� People</span></th>
                  <th><span className="th-label">�🛏️ Room</span></th>
                  <th><span className="th-label">📅 Dates</span></th>
                  <th><span className="th-label">💰 Total</span></th>
                  <th><span className="th-label">✨ Status</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="booking-row"
                    onClick={() => navigate(`/admin/bookings/${b.id}`)}
                  >
                    <td className="guest-cell">
                      <div className="guest-info">
                        <div className="guest-avatar">👤</div>
                        <div>
                          <strong className="guest-name">{b.customer_name}</strong>
                          <div className="guest-phone">{b.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="people-cell">
                      <span className="people-badge">👥 {b.no_of_people}</span>
                    </td>
                    <td className="room-cell">
                      <span className="room-badge">Room {b.room?.room_number}</span>
                    </td>
                    <td className="dates-cell">
                      <div className="date-range">
                        <span>{formatDate(b.check_in_date)}</span>
                        <span className="arrow">→</span>
                        <span>{formatDate(b.check_out_date)}</span>
                      </div>
                    </td>
                    <td className="total-cell">
                      <span className="amount">₹{b.total_amount}</span>
                    </td>
                    <td className="status-cell">
                      <Badge className={`status-badge status-${b.status}`}>
                        🟢{b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
          )}
        </Card>
      </div>

        {/* ================= CREATE BOOKING MODAL ================= */}
        <Modal show={showModal} onHide={resetForm} size="xl" centered className="modern-modal" backdrop="static">
          <Modal.Header closeButton className="modern-modal-header" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            padding: '30px'
          }}>
            <Modal.Title className="modal-title-text" style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
              ✨ Create New Booking
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="modern-modal-body" style={{ padding: '40px' }}>
            <Form onSubmit={handleSubmit}>
              {/* STEP INDICATOR */}
              {/* <div className="mb-5 d-flex justify-content-between align-items-center">
                <div className="step-item active">
                  <div className="step-number">1</div>
                  <div className="step-label">Stay Details</div>
                </div>
                <div className="step-divider"></div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-label">Guest Info</div>
                </div>
                <div className="step-divider"></div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-label">Payment</div>
                </div>
              </div> */}

              {/* STAY DETAILS SECTION */}
              <div className="section-card mb-4">
                <div className="section-header">
                  <div className="section-icon">📅</div>
                  <div>
                    <h5 className="section-title">Stay Details</h5>
                    <p className="section-subtitle">Select dates, room, and number of guests</p>
                  </div>
                </div>
                <hr className="section-divider" />
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="form-label-pro">Check-In Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="check_in_date"
                      value={formData.check_in_date}
                      onChange={handleChange}
                      min={getMinCheckInDate()}
                      className={`form-control-pro ${dateErrors.checkin ? 'is-invalid' : ''}`}
                      required
                    />
                    {dateErrors.checkin && (
                      <Form.Text className="invalid-feedback d-block mt-1">
                        {dateErrors.checkin}
                      </Form.Text>
                    )}
                  </Col>
                  <Col md={6}>
                    <Form.Label className="form-label-pro">Check-Out Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="check_out_date"
                      value={formData.check_out_date}
                      onChange={handleChange}
                      min={getMinCheckOutDate()}
                      className={`form-control-pro ${dateErrors.checkout ? 'is-invalid' : ''}`}
                      required
                    />
                    {dateErrors.checkout && (
                      <Form.Text className="invalid-feedback d-block mt-1">
                        {dateErrors.checkout}
                      </Form.Text>
                    )}
                  </Col>

                  <Col md={6}>
                    <Form.Label className="form-label-pro">Number of Guests</Form.Label>
                    <Form.Control
                      type="number"
                      name="no_of_people"
                      value={formData.no_of_people}
                      onChange={handleChange}
                      className="form-control-pro"
                      min="1"
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label className="form-label-pro">Select Room</Form.Label>
                    <Form.Select
                      disabled={!formData.check_in_date || !formData.check_out_date}
                      value={formData.room_id}
                      onChange={handleRoomChange}
                      className="form-control-pro"
                      required
                    >
                      <option value="">📍 Select a room</option>
                      {rooms.length > 0 ? (
                        rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            Room {r.room_number} • {r.room_type} • ₹{r.price}/night
                          </option>
                        ))
                      ) : (
                        <>
                          {formData.check_in_date && formData.check_out_date && (
                            <option disabled>No rooms available</option>
                          )}
                        </>
                      )}
                    </Form.Select>
                  </Col>
                </Row>
              </div>

              {/* GUEST DETAILS SECTION */}
              <div className="section-card mb-4">
                <div className="section-header">
                  <div className="section-icon">👥</div>
                  <div>
                    <h5 className="section-title">Guest Information</h5>
                    <p className="section-subtitle">Enter details for all {formData.no_of_people} guest(s)</p>
                  </div>
                </div>
                <hr className="section-divider" />
                {guests.map((g, idx) => (
                  <div key={idx} className="guest-card mb-4">
                    <div className="guest-header">
                      <span className="guest-number">Guest {idx + 1}</span>
                      {g.is_primary && <span className="badge bg-primary">Primary</span>}
                    </div>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Label className="form-label-pro">First Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={g.first_name}
                          onChange={(e) => handleGuestChange(idx, 'first_name', e.target.value)}
                          placeholder="First name"
                          className="form-control-pro"
                          disabled={submitting}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="form-label-pro">Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={g.last_name}
                          onChange={(e) => handleGuestChange(idx, 'last_name', e.target.value)}
                          placeholder="Last name"
                          className="form-control-pro"
                          disabled={submitting}
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label className="form-label-pro">Gender</Form.Label>
                        <Form.Select
                          value={g.gender}
                          onChange={(e) => handleGuestChange(idx, 'gender', e.target.value)}
                          className="form-control-pro"
                          disabled={submitting}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Col>

                      <Col md={4}>
                        <Form.Label className="form-label-pro">Age</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          value={g.age}
                          onChange={(e) => handleGuestChange(idx, 'age', e.target.value)}
                          placeholder="Age"
                          className="form-control-pro"
                          disabled={submitting}
                        />
                      </Col>

                      <Col md={4}>
                        <Form.Label className="form-label-pro">Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={g.phone}
                          onChange={(e) => handleGuestChange(idx, 'phone', e.target.value)}
                          placeholder="10 digits"
                          className="form-control-pro"
                          disabled={submitting}
                        />
                      </Col>

                      <Col md={12}>
                        <Form.Label className="form-label-pro">Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={g.email}
                          onChange={(e) => handleGuestChange(idx, 'email', e.target.value)}
                          placeholder="Email address"
                          className="form-control-pro"
                          disabled={submitting}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>

              {/* PAYMENT SECTION */}
              <div className="section-card mb-4">
                <div className="section-header">
                  <div className="section-icon">💰</div>
                  <div>
                    <h5 className="section-title">Billing & Payment</h5>
                    <p className="section-subtitle">Review pricing and payment details</p>
                  </div>
                </div>
                <hr className="section-divider" />
                <Row className="g-3">
                  <Col md={6}>
                    <div className="price-box">
                      <small className="price-label">Total Amount</small>
                      <h4 className="price-amount">₹{formData.total_amount}</h4>
                    </div>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="form-label-pro">Paid Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.paid_amount}
                      onChange={handlePaidChange}
                      placeholder="0.00"
                      className="form-control-pro"
                    />
                  </Col>
                  <Col md={6}>
                    <div className="price-box due">
                      <small className="price-label">Due Amount</small>
                      <h4 className="price-amount">₹{formData.due_amount}</h4>
                    </div>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="form-label-pro">Payment Mode</Form.Label>
                    <Form.Select
                      name="mode_of_payment"
                      value={formData.mode_of_payment}
                      onChange={handleChange}
                      className="form-control-pro"
                    >
                      <option>💵 Cash</option>
                      <option>💳 Card</option>
                      <option>📱 UPI</option>
                    </Form.Select>
                  </Col>
                </Row>
              </div>

              {/* FORM ACTIONS */}
              <div className="form-actions">
                <Button
                  variant="outline-secondary"
                  onClick={resetForm}
                  className="btn-cancel-pro"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="btn-submit-pro">
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    <>✅ Create Booking</>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  };

  export default Bookings;
