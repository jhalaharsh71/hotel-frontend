import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Badge,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  User,
  Phone,
  Mail,
  Calendar,
  BedDouble,
  IndianRupee,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Wrench,
  Edit,
  ArrowRight,
  DoorOpen,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import "./BookingDetails.css";

const API = "http://127.0.0.1:8000/api/admin";

/* ================= DATE FORMAT ================= */
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const calculateDays = (checkIn, checkOut) => {
  const check_in = new Date(checkIn);
  const check_out = new Date(checkOut);
  return Math.ceil((check_out - check_in) / (1000 * 60 * 60 * 24));
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  /* ================= STATE ================= */
  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hotelServices, setHotelServices] = useState([]);

  /* MODALS */
  const [editGuest, setEditGuest] = useState(false);
  const [editStay, setEditStay] = useState(false);
  const [editBilling, setEditBilling] = useState(false);
  const [addService, setAddService] = useState(false);
  const [editService, setEditService] = useState(false);
  const [changeRoom, setChangeRoom] = useState(false);
  /* ===== TASK 2: CHECKOUT CONFIRMATION ===== */
  const [checkoutConfirmation, setCheckoutConfirmation] = useState(false);
  /* ===== CHECK-IN CONFIRMATION ===== */
  const [checkInConfirmation, setCheckInConfirmation] = useState(false);
  /* ===== CUSTOM CONFIRMATION CARDS ===== */
  const [confirmBookingModal, setConfirmBookingModal] = useState(false);
  const [cancelBookingModal, setCancelBookingModal] = useState(false);
  const [deleteBookingModal, setDeleteBookingModal] = useState(false);

  /* FORMS */
  const [guestForm, setGuestForm] = useState({});
  const [stayForm, setStayForm] = useState({});
  const [billingForm, setBillingForm] = useState({
    paid_amount: "",
    mode_of_payment: "Cash",
  });

  const [serviceForm, setServiceForm] = useState({
    hotel_service_id: null,
    quantity: 1,
    paid_amount: 0,
  });

  const [editServiceForm, setEditServiceForm] = useState({
    id: null,
    quantity: 1,
    paid_amount: 0,
  });

  const [changeRoomForm, setChangeRoomForm] = useState({
    new_room_id: null,
    change_after_days: null,
  });

  /* LOADING & ERROR STATES */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [changeRoomLoading, setChangeRoomLoading] = useState(false);

  /* ================= FETCH ================= */

  const fetchBooking = async () => {
    const res = await axios.get(`${API}/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setBooking(res.data);
    setGuestForm(res.data);
    setStayForm({
      check_in_date: res.data.check_in_date,
      check_out_date: res.data.check_out_date,
    });
  };

  const fetchServices = async () => {
    const res = await axios.get(`${API}/bookings/${id}/services`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setServices(res.data || []);
  };

  const fetchHotelServices = async () => {
    const res = await axios.get(`${API}/services`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHotelServices(res.data || []);
  };

const fetchAvailableRooms = async () => {
  try {
    // Helper to convert date to Y-m-d format
    const formatDateToISO = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0]; // Returns Y-m-d
    };

    const response = await axios.get(`${API}/available-rooms-for-change`, {
      params: {
        check_in: formatDateToISO(booking.check_in_date),
        check_out: formatDateToISO(booking.check_out_date),
        current_room_id: booking.room_id,
        no_of_people: booking.no_of_people, // 🔥 REQUIRED
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    setAvailableRooms(response.data || []);
  } catch (err) {
    console.error("Error fetching available rooms", err);
    setAvailableRooms([]);
  }
};


  useEffect(() => {
    fetchBooking();
    fetchServices();
    fetchHotelServices();
  }, []);

  if (!booking) return null;

  const isCancelled = booking.status === "cancelled";
  const isConfirmed = booking.confirm_booking;

  /* ================= BOOKING ACTIONS ================= */

  const deleteBooking = async () => {
    setDeleteBookingModal(true);
  };

  const proceedDeleteBooking = async () => {
    setDeleteBookingModal(false);
    await axios.delete(`${API}/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate("/admin/bookings");
  };

  /* ===== TASK 1: PREVENT CANCEL AFTER CHECKOUT ===== */
  const cancelBooking = async () => {
    if (booking.status === "checkout") {
      setError("Cannot cancel a checked-out booking.");
      return;
    }
    setCancelBookingModal(true);
  };

  const proceedCancelBooking = async () => {
    setCancelBookingModal(false);
    await axios.put(
      `${API}/bookings/cancel/${id}`,
      { status: "cancelled" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchBooking();
  };

  const confirmBooking = async () => {
    setConfirmBookingModal(true);
  };

  const proceedConfirmBooking = async () => {
    setConfirmBookingModal(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.patch(
        `${API}/bookings/${id}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Booking confirmed successfully! Confirmation email sent to customer.");
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchBooking();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to confirm booking";
      setError(message);
      setLoading(false);
    }
  };

  /* ===== TASK 2: CHECKOUT CONFIRMATION & EMAIL ===== */
  const proceedCheckout = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCheckoutConfirmation(false);

    try {
      const res = await axios.patch(
        `${API}/bookings/${id}/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Checkout completed successfully! Confirmation email sent to customer.");
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchBooking();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to checkout";
      setError(message);
      setLoading(false);
    }
  };

  const checkoutBooking = () => {
    // Show confirmation modal instead of directly proceeding
    setCheckoutConfirmation(true);
  };

  /* ===== CHECK-IN FUNCTIONALITY ===== */
  const proceedCheckIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCheckInConfirmation(false);

    try {
      const res = await axios.patch(
        `${API}/bookings/${id}/check-in`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Guest checked in successfully!");
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchBooking();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to check-in";
      setError(message);
      setLoading(false);
    }
  };

  const checkInBooking = () => {
    // Show confirmation modal instead of directly proceeding
    setCheckInConfirmation(true);
  };

  /* ================= UPDATE HANDLERS ================= */

  const updateGuest = async (e) => {
    e.preventDefault();

    await axios.put(
      `${API}/bookings/${id}`,
      {
        customer_name: guestForm.customer_name,
        phone: guestForm.phone,
        email: guestForm.email,
        paid_amount: booking.paid_amount,
        mode_of_payment: booking.mode_of_payment,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEditGuest(false);
    fetchBooking();
  };

  const updateStay = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate check-out date is not before check-in
      const checkInDate = new Date(booking.check_in_date);
      const newCheckoutDate = new Date(stayForm.check_out_date);
      
      if (newCheckoutDate < checkInDate) {
        setError("Check-out date cannot be before check-in date");
        setLoading(false);
        return;
      }

      // Calculate days difference (extension positive, reduction negative)
      const oldCheckout = new Date(booking.check_out_date);
      const interval = Math.ceil((newCheckoutDate - oldCheckout) / (1000 * 60 * 60 * 24));

      // Calculate amount change
      let amountChange = 0;
      let changeType = "unchanged";
      if (interval > 0) {
        changeType = "extension";
        const roomPrice = booking.room?.price || 0;
        amountChange = interval * roomPrice;
      } else if (interval < 0) {
        changeType = "reduction";
        const roomPrice = booking.room?.price || 0;
        amountChange = interval * roomPrice; // Negative value
      }

      // Prepare update payload
      const updatePayload = {
        customer_name: booking.customer_name,
        phone: booking.phone,
        email: booking.email,
        paid_amount: booking.paid_amount,
        mode_of_payment: booking.mode_of_payment,
        check_out_date: stayForm.check_out_date,
        additional_amount: amountChange,
      };

      await axios.put(
        `${API}/bookings/${id}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let successMessage = "Stay dates updated successfully!";
      if (changeType === "extension") {
        successMessage = `Stay extended by ${interval} days. Additional charge: ₹${Math.abs(amountChange).toFixed(2)}`;
      } else if (changeType === "reduction") {
        successMessage = `Stay reduced by ${Math.abs(interval)} days. Refund: ₹${Math.abs(amountChange).toFixed(2)}`;
      }
      
      setSuccess(successMessage);
      setEditStay(false);
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchBooking();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update stay";
      setError(message);
      setLoading(false);
    }
  };

  const updateBilling = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate amount
      const additionalAmount = Number(billingForm.paid_amount || 0);
      if (additionalAmount <= 0) {
        setError("Please enter a valid payment amount");
        setLoading(false);
        return;
      }

      // Use the dedicated payment endpoint
      const res = await axios.post(
        `${API}/bookings/${id}/add-payment`,
        {
          amount: additionalAmount,
          mode_of_payment: billingForm.mode_of_payment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Payment of ₹${additionalAmount.toFixed(2)} recorded successfully!`);
      setBillingForm({ paid_amount: "", mode_of_payment: "Cash" });
      setEditBilling(false);
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchBooking();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to record payment";
      setError(message);
      setLoading(false);
    }
  };

  /* ================= SERVICES ================= */

  const addServiceSubmit = async (e) => {
    e.preventDefault();

    await axios.post(
      `${API}/bookings/${id}/services`,
      {
        hotel_service_id: serviceForm.hotel_service_id.value,
        quantity: serviceForm.quantity,
        paid_amount: serviceForm.paid_amount,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAddService(false);
    setServiceForm({ hotel_service_id: null, quantity: 1, paid_amount: 0 });
    fetchBooking();
    fetchServices();
  };

  const openEditServiceModal = (service) => {
    setEditServiceForm({
      id: service.id,
      quantity: service.quantity,
      paid_amount: service.paid_amount,
    });
    setEditService(true);
  };

  const updateService = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.put(
        `${API}/bookings/${id}/services/${editServiceForm.id}`,
        {
          quantity: editServiceForm.quantity,
          paid_amount: editServiceForm.paid_amount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Service updated successfully!");
      setEditService(false);
      setEditServiceForm({ id: null, quantity: 1, paid_amount: 0 });
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchBooking();
      fetchServices();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update service";
      setError(message);
      setLoading(false);
    }
  };

  const deleteService = async (sid) => {
    if (!window.confirm("Delete service?")) return;

    await axios.delete(`${API}/bookings/${id}/services/${sid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchBooking();
    fetchServices();
  };

  /* ================= CHANGE ROOM ================= */

  const openChangeRoomModal = async () => {
    await fetchAvailableRooms();
    setChangeRoom(true);
  };

  const handleChangeRoom = async (e) => {
    e.preventDefault();
    
    if (!changeRoomForm.new_room_id) {
      setError("Please select a room");
      return;
    }

    // Calculate total stay days
    const totalDays = calculateDays(booking.check_in_date, booking.check_out_date);

    // For multi-day bookings, require change_after_days
    if (totalDays > 1) {
      if (changeRoomForm.change_after_days === null || changeRoomForm.change_after_days === "") {
        setError("Please specify after how many days the room should be changed");
        return;
      }

      const changeAfterDays = Number(changeRoomForm.change_after_days);
      if (changeAfterDays < 0) {
        setError("Change after days cannot be negative");
        return;
      }
      if (changeAfterDays >= totalDays) {
        setError(`Change after days must be less than total stay days (${totalDays})`);
        return;
      }
    }

    setChangeRoomLoading(true);
    setError(null);

    try {
      const changeAfterDays = totalDays > 1 ? Number(changeRoomForm.change_after_days) : null;

      const res = await axios.put(
        `${API}/bookings/${id}/change-room`,
        { 
          new_room_id: changeRoomForm.new_room_id,
          change_after_days: changeAfterDays,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Room changed successfully!");
      setChangeRoom(false);
      setChangeRoomForm({ new_room_id: null, change_after_days: null });
      fetchBooking();
      fetchServices();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to change room";
      setError(message);
    } finally {
      setChangeRoomLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="booking-details-wrapper">
      {/* SUCCESS/ERROR ALERTS */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* ===== TASK 4: CHECKOUT VALIDATION ALERTS ===== */}
      {/* Show validation warnings when user tries to checkout but conditions aren't met */}
      {isConfirmed && booking.status === "active" && error && error.includes("checkout") && (
        <Alert variant="warning" dismissible onClose={() => setError(null)} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Checkout Issue:</strong> {error}
            </div>
          </div>
        </Alert>
      )}

      <div className="container-lg">
        {/* PAGE HEADER */}
        <div className="booking-header">
          <Row className="align-items-start">
            <Col lg={8}>
              <div className="booking-title-section">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                  <h1>Booking #{booking.id}</h1>
                  <Badge className={`booking-status-badge ${booking.status === "active" ? "status-active" : "status-cancelled"}`}>
                    {booking.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="booking-subtitle">
                  <span>{isConfirmed ? "✓ Confirmed" : "⚠ Pending Confirmation"}</span>
                  <span>•</span>
                  <span><strong>Guest: {booking.customer_name}</strong></span>
                </p>
              </div>
            </Col>
            <Col lg={4}>
              <div className="action-button-group" style={{ justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
                {!isConfirmed && !isCancelled && (
                  <button 
                    className="btn-primary-glass" 
                    onClick={confirmBooking} 
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      color: "white",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    <CheckCircle size={16} /> Confirm
                  </button>
                )}
                {isConfirmed && booking.status === "active" && !isCancelled && (
                  <button 
                    className="btn-info-glass" 
                    onClick={checkInBooking} 
                    disabled={loading}
                    title="Guest arrives - mark as checked in"
                    style={{
                      background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      color: "white",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    📍 Check-in
                  </button>
                )}
                {isConfirmed && booking.status === "check-in" && !isCancelled && (
                  <button 
                    className="btn-success-glass" 
                    onClick={checkoutBooking} 
                    disabled={loading}
                    title="Guest leaves - mark as checked out"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      color: "white",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    <DoorOpen size={16} /> Checkout
                  </button>
                )}
                {!isCancelled && booking.status !== "checkout" && booking.status !== "check-in" && (
                  <button 
                    className="btn-warning-glass" 
                    onClick={cancelBooking} 
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      color: "white",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                )}
                <button 
                  className="btn-danger-glass" 
                  onClick={deleteBooking} 
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </Col>
          </Row>
        </div>

        {/* BOOKING TIMELINE */}
        <div className="booking-timeline">
          <div className="timeline-item">
            <div className="timeline-label">Check-in</div>
            <div className="timeline-value">{formatDate(booking.check_in_date)}</div>
            <div className="timeline-secondary">{new Date(booking.check_in_date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
          </div>
          <div className="timeline-item">
            <div className="timeline-label">Duration</div>
            <div className="timeline-value">{calculateDays(booking.check_in_date, booking.check_out_date)}</div>
            <div className="timeline-secondary">nights</div>
          </div>
          <div className="timeline-item">
            <div className="timeline-label">Check-out</div>
            <div className="timeline-value">{formatDate(booking.check_out_date)}</div>
            <div className="timeline-secondary">{new Date(booking.check_out_date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
          </div>
          <div className="timeline-item">
            <div className="timeline-label">Room</div>
            <div className="timeline-value">#{booking.room?.room_number}</div>
            <div className="timeline-secondary">{booking.room?.room_type}</div>
          </div>
        </div>

        {/* MAIN INFO CARDS */}
        <Row className="g-4 mb-4">
          {/* GUEST INFORMATION */}
          <Col lg={4}>
            <div className="glass-card h-100">
              <div className="glass-card-body">
                <div className="info-header">
                  <div>
                    <h6>Guest Information</h6>
                    <p className="info-header-subtitle">Contact details</p>
                  </div>
                  <button 
                    className="info-edit-btn" 
                    onClick={() => setEditGuest(true)} 
                    disabled={booking.status === "checkout"}
                    title={booking.status === "checkout" ? "Cannot edit checked-out booking" : "Edit guest"}
                    style={{ opacity: booking.status === "checkout" ? 0.5 : 1, cursor: booking.status === "checkout" ? "not-allowed" : "pointer" }}
                  >
                    <Edit size={18} />
                  </button>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <p className="info-value">{booking.customer_name}</p>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <p className="info-value">{booking.email || <em className="info-value-secondary">Not provided</em>}</p>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <p className="info-value">{booking.phone || <em className="info-value-secondary">Not provided</em>}</p>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Number of People</span>
                    <p className="info-value">👥 {booking.no_of_people || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* STAY INFORMATION */}
          <Col lg={4}>
            <div className="glass-card h-100">
              <div className="glass-card-body">
                <div className="info-header">
                  <div>
                    <h6>Stay Details</h6>
                    <p className="info-header-subtitle">Dates & duration</p>
                  </div>
                  <button 
                    className="info-edit-btn" 
                    onClick={() => setEditStay(true)} 
                    disabled={isCancelled || booking.status === "checkout"}
                    title={booking.status === "checkout" ? "Cannot edit checked-out booking" : "Adjust dates"}
                    style={{ opacity: (isCancelled || booking.status === "checkout") ? 0.5 : 1, cursor: (isCancelled || booking.status === "checkout") ? "not-allowed" : "pointer" }}
                  >
                    <Edit size={18} />
                  </button>
                </div>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Check-in</span>
                    <p className="info-value">{formatDate(booking.check_in_date)}</p>
                    {/* <span className="info-value-secondary">{new Date(booking.check_in_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span> */}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Check-out</span>
                    <p className="info-value">{formatDate(booking.check_out_date)}</p>
                    {/* <span className="info-value-secondary">{new Date(booking.check_out_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span> */}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Duration</span>
                    <p className="info-value">{calculateDays(booking.check_in_date, booking.check_out_date)} nights</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* ===== TASK 2: PAYMENT UI HIDING ===== */}
          {/* BILLING INFORMATION - Hide when fully paid (due_amount = 0) */}
          {Number(booking.due_amount) > 0 && (
            <Col lg={4}>
              <div className="glass-card h-100">
                <div className="glass-card-body">
                  <div className="info-header">
                    <div>
                      <h6>Billing Summary</h6>
                      <p className="info-header-subtitle">Payment status</p>
                    </div>
                    <button className="info-edit-btn" onClick={() => setEditBilling(true)} title="Record payment">
                      <Edit size={18} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <div className="billing-item">
                      <span className="billing-label">Total Amount</span>
                      <span className="billing-value">₹{Number(booking.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="billing-item">
                      <span className="billing-label">✓ Paid</span>
                      <span className="billing-value paid">₹{Number(booking.paid_amount).toFixed(2)}</span>
                    </div>
                    <div className="billing-item">
                      <span className="billing-label">⚠ Due</span>
                      <span className="billing-value due">₹{Number(booking.due_amount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="payment-progress-wrapper">
                    <div className="progress-label">
                      <span>Payment Progress</span>
                      <span>{booking.total_amount > 0 ? ((booking.paid_amount / booking.total_amount) * 100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-fill"
                        style={{ width: `${booking.total_amount > 0 ? (booking.paid_amount / booking.total_amount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          )}
          {/* Show "Fully Paid" message when all payment is collected */}
          {Number(booking.due_amount) === 0 && (
            <Col lg={4}>
              <div className="glass-card h-100" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ecfdf5" }}>
                <div style={{ textAlign: "center" }}>
                  <CheckCircle size={48} style={{ color: "#10b981", marginBottom: "12px" }} />
                  <h6 style={{ color: "#10b981", marginBottom: "6px" }}>✓ Fully Paid</h6>
                  <p style={{ color: "#6ee7b7", fontSize: "0.9rem", marginBottom: 0 }}>
                    All payments collected<br/>Total: ₹{Number(booking.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </Col>
          )}
        </Row>

        {/* ALL GUESTS DETAILS */}
        {booking.guests && booking.guests.length > 0 && (
          <div className="glass-card mb-4">
            <div className="glass-card-body">
              <h6 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px" }}>👥 All Guest Details</h6>
              <Row className="g-3">
                {booking.guests.map((guest, idx) => (
                  <Col lg={6} key={idx}>
                    <div className="guest-detail-card">
                      <div className="guest-detail-header">
                        <span className="guest-detail-badge">Guest {idx + 1}</span>
                        {guest.is_primary && <span className="guest-primary-badge">Primary</span>}
                      </div>
                      <div className="guest-detail-content">
                        <div className="guest-detail-row">
                          <span className="guest-detail-label">Name</span>
                          <span className="guest-detail-value">{guest.first_name} {guest.last_name}</span>
                        </div>
                        <div className="guest-detail-row">
                          <span className="guest-detail-label">Gender</span>
                          <span className="guest-detail-value">{guest.gender || "—"}</span>
                        </div>
                        <div className="guest-detail-row">
                          <span className="guest-detail-label">Age</span>
                          <span className="guest-detail-value">{guest.age || "—"} years</span>
                        </div>
                        <div className="guest-detail-row">
                          <span className="guest-detail-label">Phone</span>
                          <span className="guest-detail-value">{guest.phone || "—"}</span>
                        </div>
                        <div className="guest-detail-row">
                          <span className="guest-detail-label">Email</span>
                          <span className="guest-detail-value" style={{ wordBreak: "break-word" }}>{guest.email || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}

        {/* ROOM INFORMATION */}
        <div className="glass-card mb-4">
          <div className="glass-card-body">
            <Row className="align-items-center">
              <Col lg={6}>
                <h6 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px" }}>Current Room Assignment</h6>
                <div className="room-info-content">
                  <div className="room-icon-box">
                    <DoorOpen />
                  </div>
                  <div className="room-details">
                    <div style={{ marginBottom: "16px" }}>
                      <span className="info-label">Room Number</span>
                      <p className="info-value">#{booking.room?.room_number}</p>
                    </div>
                    <div>
                      <span className="info-label">Room Type</span>
                      <p className="info-value">{booking.room?.room_type}</p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={6} className="mt-3 mt-lg-0">
                <div style={{ marginBottom: "16px" }}>
                  <span className="info-label">Price per Night</span>
                  <h4 style={{ background: "linear-gradient(90deg, #2563eb, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "800", marginBottom: "20px" }}>
                    ₹{Number(booking.room?.price).toFixed(2)}
                  </h4>
                </div>
                <button 
                  className="btn-primary-glass"
                  onClick={openChangeRoomModal}
                  disabled={isCancelled || booking.status === "checkout"}
                  style={{ width: "100%", opacity: (isCancelled || booking.status === "checkout") ? 0.6 : 1, cursor: (isCancelled || booking.status === "checkout") ? "not-allowed" : "pointer" }}
                  title={booking.status === "checkout" ? "Cannot change room for checked-out booking" : ""}
                >
                  <ArrowRight size={18} />
                  Change Room
                </button>
              </Col>
            </Row>
          </div>
        </div>

        {/* SERVICES SECTION */}
        <div className="glass-card">
          <div className="glass-card-body">
            <div className="info-header">
              <div>
                <h6>Additional Services</h6>
                <p className="info-header-subtitle">Extra charges & amenities</p>
              </div>
              <button 
                className="btn-primary-glass" 
                onClick={() => setAddService(true)}
                disabled={!isConfirmed || isCancelled || booking.status === "checkout"}
                style={{ opacity: (!isConfirmed || isCancelled || booking.status === "checkout") ? 0.6 : 1, cursor: (!isConfirmed || isCancelled || booking.status === "checkout") ? "not-allowed" : "pointer" }}
                title={!isConfirmed ? "Confirm booking first to add services" : isCancelled ? "Cannot add services to cancelled bookings" : booking.status === "checkout" ? "Cannot add services to checked-out bookings" : ""}
              >
                <Plus size={16} /> Add Service
              </button>
            </div>

            {/* Show warning if cannot add services */}
            {(!isConfirmed || isCancelled || booking.status === "checkout") && (
              <Alert variant="warning" className="mb-4" style={{ background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }}>
                <strong>⚠️ Services Disabled:</strong>
                {!isConfirmed && " Please confirm the booking first before adding services."}
                {isCancelled && " This booking is cancelled - no services can be added."}
                {booking.status === "checkout" && " This booking is checked out - no services can be added."}
              </Alert>
            )}

            {services.length > 0 ? (
              <div className="services-table-wrapper">
                <Table hover className="services-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Total Price</th>
                      <th className="text-end">Added On</th>
                      {/* <th className="text-end">Paid</th> */}
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} className="service-row">
                        <td>
                          <div className="service-name-content">
                            <span className="service-icon">⭐</span>
                            {s.service?.name}
                          </div>
                        </td>
                        <td className="text-center">{s.quantity}</td>
                        <td className="text-end">₹{Number(s.total_price).toFixed(2)}</td>
                        <td className="text-end" style={{ fontSize: "0.9rem", color: "#64748b" }}>
                          {new Date(s.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })} at {new Date(s.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </td>
                        {/* <td className="text-end" style={{ color: "#10b981", fontWeight: "700" }}>₹{Number(s.paid_amount).toFixed(2)}</td> */}
                        <td className="text-center" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            className="btn-secondary-glass"
                            onClick={() => openEditServiceModal(s)}
                            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                            title="Edit service"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-danger-glass"
                            onClick={() => deleteService(s.id)}
                            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                            title="Delete service"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="empty-state-services">
                <p style={{ fontSize: "1.05rem" }}>📦 No additional services added</p>
              </div>
            )}
          </div>
        </div>

      {/* ===== CHECK-IN CONFIRMATION MODAL ===== */}
      <Modal show={checkInConfirmation} onHide={() => setCheckInConfirmation(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            🔑 Confirm Check-In
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          <div style={{ background: "#ecfdf5", padding: "20px", borderRadius: "12px", border: "1px solid #86efac", marginBottom: "20px" }}>
            <h6 style={{ fontWeight: "700", marginBottom: "12px", color: "#059669" }}>Confirm guest arrival and check-in?</h6>
            <p style={{ color: "#64748b", marginBottom: "16px" }}>
              This will mark the booking as check-in. Guest has confirmed their arrival.
            </p>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <Row className="g-3">
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Guest Name</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>{booking.customer_name}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Booking ID</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>#{booking.id}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Room Number</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>#{booking.room?.room_number}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Check-In Date</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>
                    {new Date(booking.check_in_date).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="modern-modal-footer">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={() => setCheckInConfirmation(false)} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-submit" 
            onClick={proceedCheckIn}
            disabled={loading}
          >
            {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Processing...</> : "✅ Confirm Check-In"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ===== TASK 2: CHECKOUT CONFIRMATION MODAL ===== */}
      <Modal show={checkoutConfirmation} onHide={() => setCheckoutConfirmation(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            🚪 Confirm Checkout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          <div style={{ background: "#eef2ff", padding: "20px", borderRadius: "12px", border: "1px solid #d1d5f7", marginBottom: "20px" }}>
            <h6 style={{ fontWeight: "700", marginBottom: "12px", color: "#2563eb" }}>Are you sure you want to complete checkout?</h6>
            <p style={{ color: "#64748b", marginBottom: "16px" }}>
              This will mark the booking as completed and send a confirmation email to the customer.
            </p>
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <Row className="g-3">
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Guest Name</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>{booking.customer_name}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Booking ID</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>#{booking.id}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Room Number</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>#{booking.room?.room_number}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: "#64748b", display: "block" }}>Total Amount Paid</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>₹{Number(booking.paid_amount).toFixed(2)}</p>
                </Col>
              </Row>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="modern-modal-footer">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={() => setCheckoutConfirmation(false)} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-submit" 
            onClick={proceedCheckout}
            disabled={loading}
          >
            {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Processing...</> : "✅ Confirm Checkout"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ================= MODALS ================= */}

      {/* EDIT GUEST MODAL */}
      <Modal show={editGuest} onHide={() => setEditGuest(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            👤 Edit Guest Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          <Form onSubmit={updateGuest}>
            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">📝</span> Full Name
              </Form.Label>
              <Form.Control
                value={guestForm.customer_name || ""}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, customer_name: e.target.value })
                }
                className="form-control-modern"
                required
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">✉️</span> Email Address
              </Form.Label>
              <Form.Control
                type="email"
                value={guestForm.email || ""}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, email: e.target.value })
                }
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">📱</span> Phone Number
              </Form.Label>
              <Form.Control
                value={guestForm.phone || ""}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, phone: e.target.value })
                }
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">👥</span> Number of People
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={guestForm.no_of_people || ""}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, no_of_people: e.target.value })
                }
                className="form-control-modern"
              />
            </Form.Group>

            <Modal.Footer className="modern-modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setEditGuest(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                💾 Update Information
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* EDIT STAY MODAL */}
      <Modal show={editStay} onHide={() => setEditStay(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            📅 Adjust Stay Dates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <Form onSubmit={updateStay}>
            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">Check-in Date</Form.Label>
              <Form.Control 
                type="text"
                readOnly
                value={formatDate(stayForm.check_in_date)}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">Current Check-out Date</Form.Label>
              <Form.Control 
                type="text"
                readOnly
                value={formatDate(booking.check_out_date)}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">New Check-out Date</Form.Label>
              <Form.Control
                type="date"
                value={stayForm.check_out_date}
                onChange={(e) => setStayForm({ ...stayForm, check_out_date: e.target.value })}
                min={booking.check_in_date}
                className="form-control-modern"
                required
              />
              <small style={{ color: "#64748b", display: "block", marginTop: "6px" }}>Must be on or after check-in date</small>
            </Form.Group>

            {stayForm.check_out_date && stayForm.check_out_date !== booking.check_out_date && (
              <div style={{ background: new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "#eef2ff" : "#fef3c7", border: `1px solid ${new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "#d1d5f7" : "#fcd34d"}`, padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                <h6 style={{ fontWeight: "700", marginBottom: "12px", color: new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "#2563eb" : "#92400e" }}>
                  {new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "📈 Extension Summary" : "📉 Reduction Summary"}
                </h6>
                <div style={{ marginBottom: "10px" }}>
                  <small style={{ color: "#64748b", display: "block" }}>Days {new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "Added" : "Removed"}</small>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: 0 }}>{Math.abs(calculateDays(booking.check_out_date, stayForm.check_out_date))} days</p>
                </div>
                <div>
                  <small style={{ color: "#64748b", display: "block" }}>{new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "Additional Charge" : "Refund Amount"}</small>
                  <p style={{ fontWeight: "700", color: new Date(stayForm.check_out_date) > new Date(booking.check_out_date) ? "#2563eb" : "#92400e", marginBottom: 0 }}>
                    ₹{(Math.abs(calculateDays(booking.check_out_date, stayForm.check_out_date)) * (booking.room?.price || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <Modal.Footer className="modern-modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setEditStay(false)} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Updating..." : "✅ Update Stay"}
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* EDIT BILLING MODAL */}
      <Modal show={editBilling} onHide={() => setEditBilling(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            💳 Record Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <Form onSubmit={updateBilling}>
            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">Total Amount Due</Form.Label>
              <Form.Control 
                type="text"
                readOnly
                value={`₹${Number(booking.total_amount).toFixed(2)}`}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">Already Paid</Form.Label>
              <Form.Control 
                type="text"
                readOnly
                value={`₹${Number(booking.paid_amount).toFixed(2)}`}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">Outstanding Amount</Form.Label>
              <Form.Control 
                type="text"
                readOnly
                value={`₹${Number(booking.due_amount).toFixed(2)}`}
                className="form-control-modern"
              />
            </Form.Group>

            <hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">💰</span> Payment Amount
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0.01"
                max={booking.due_amount}
                placeholder="Enter amount"
                value={billingForm.paid_amount}
                onChange={(e) =>
                  setBillingForm({ ...billingForm, paid_amount: e.target.value })
                }
                className="form-control-modern"
                required
              />
              <small style={{ color: "#64748b", display: "block", marginTop: "6px" }}>Max: ₹{Number(booking.due_amount).toFixed(2)}</small>
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">🏦</span> Payment Method
              </Form.Label>
              <Form.Select
                value={billingForm.mode_of_payment}
                onChange={(e) =>
                  setBillingForm({ ...billingForm, mode_of_payment: e.target.value })
                }
                className="form-control-modern"
              >
                <option>💵 Cash</option>
                <option>💳 Card</option>
                <option>📱 UPI</option>
              </Form.Select>
            </Form.Group>

            <Modal.Footer className="modern-modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setEditBilling(false)} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading || !billingForm.paid_amount}>
                {loading ? "Processing..." : "✅ Record Payment"}
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ADD SERVICE MODAL */}
      <Modal show={addService} onHide={() => setAddService(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            ✨ Add Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          <Form onSubmit={addServiceSubmit}>
            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">🎯</span> Select Service
              </Form.Label>
              <Select
                options={hotelServices.map((s) => ({
                  value: s.id,
                  label: `${s.name} (₹${Number(s.price).toFixed(2)})`,
                }))}
                onChange={(opt) =>
                  setServiceForm({ ...serviceForm, hotel_service_id: opt })
                }
                isClearable
                placeholder="Choose a service..."
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "12px",
                    borderColor: "#e2e8f0",
                    backgroundColor: "#f8fafc",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eef2ff" : "white",
                  }),
                }}
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">📦</span> Quantity
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={serviceForm.quantity}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, quantity: Number(e.target.value) })
                }
                className="form-control-modern"
                required
              />
            </Form.Group>

            {/* <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">💰</span> Paid Amount
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={serviceForm.paid_amount}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, paid_amount: Number(e.target.value) })
                }
                className="form-control-modern"
              />
            </Form.Group> */}

            <Modal.Footer className="modern-modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setAddService(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                ✅ Add Service
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* EDIT SERVICE MODAL */}
      <Modal show={editService} onHide={() => setEditService(false)} centered className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            ✏️ Edit Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <Form onSubmit={updateService}>
            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">🎯</span> Service Name
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={services.find(s => s.id === editServiceForm.id)?.service?.name || ""}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">💵</span> Price per Unit
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={`₹${Number(services.find(s => s.id === editServiceForm.id)?.service?.price || 0).toFixed(2)}`}
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">📦</span> Quantity
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={editServiceForm.quantity}
                onChange={(e) =>
                  setEditServiceForm({ ...editServiceForm, quantity: Number(e.target.value) })
                }
                className="form-control-modern"
                required
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">💰</span> Paid Amount
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={editServiceForm.paid_amount}
                onChange={(e) =>
                  setEditServiceForm({ ...editServiceForm, paid_amount: Number(e.target.value) })
                }
                className="form-control-modern"
              />
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">Total Price</Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={`₹${(editServiceForm.quantity * (services.find(s => s.id === editServiceForm.id)?.service?.price || 0)).toFixed(2)}`}
                className="form-control-modern"
              />
            </Form.Group>

            <Modal.Footer className="modern-modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setEditService(false)} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Updating..." : "✅ Update Service"}
              </button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* CHANGE ROOM MODAL */}
      <Modal show={changeRoom} onHide={() => setChangeRoom(false)} centered size="lg" className="modern-modal">
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            🚪 Change Room
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body">
          {changeRoomLoading && (
            <div style={{ textAlign: "center", paddingTop: "48px", paddingBottom: "48px" }}>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p style={{ color: "#64748b" }}>Processing...</p>
            </div>
          )}
          
          {!changeRoomLoading && (
            <Form onSubmit={handleChangeRoom}>
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}
              
              {/* Current Room Info */}
              <div style={{ background: "#eef2ff", padding: "16px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #d1d5f7" }}>
                <h6 style={{ fontWeight: "700", marginBottom: "16px", color: "#2563eb" }}>Current Room</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <div>
                      <small style={{ color: "#64748b", display: "block" }}>Room Number</small>
                      <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>#{booking.room?.room_number}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small style={{ color: "#64748b", display: "block" }}>Room Type</small>
                      <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>{booking.room?.room_type}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small style={{ color: "#64748b", display: "block" }}>Price per Night</small>
                      <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>₹{Number(booking.room?.price).toFixed(2)}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small style={{ color: "#64748b", display: "block" }}>Duration</small>
                      <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>{calculateDays(booking.check_in_date, booking.check_out_date)} nights</p>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Stay Dates */}
              <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #dcfce7" }}>
                <h6 style={{ fontWeight: "700", marginBottom: "16px", color: "#10b981" }}>Stay Duration</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <div>
                      <small style={{ color: "#64748b", display: "block" }}>Check-in</small>
                      <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>{formatDate(booking.check_in_date)}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <small style={{ color: "#64748b", display: "block" }}>Check-out</small>
                      <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>{formatDate(booking.check_out_date)}</p>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Change After Days (for multi-day bookings) */}
              {calculateDays(booking.check_in_date, booking.check_out_date) > 1 && (
                <Form.Group className="form-group-modern">
                  <Form.Label className="form-label-modern">Change Room After How Many Days?</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max={calculateDays(booking.check_in_date, booking.check_out_date) - 1}
                    value={changeRoomForm.change_after_days ?? ""}
                    onChange={(e) => setChangeRoomForm({ ...changeRoomForm, change_after_days: e.target.value })}
                    placeholder="Enter number of days"
                    className="form-control-modern"
                    required
                  />
                  <small style={{ color: "#64748b", display: "block", marginTop: "6px" }}>
                    <strong>0</strong> = Same-day change • <strong>1</strong> = After 1 day and so on (Max: {calculateDays(booking.check_in_date, booking.check_out_date) - 1} days)
                  </small>
                </Form.Group>
              )}

              {/* Available Rooms */}
              <Form.Group className="form-group-modern">
                <Form.Label className="form-label-modern">Select New Room</Form.Label>
                {availableRooms.length > 0 ? (
                  <Form.Select
                    value={changeRoomForm.new_room_id || ""}
                    onChange={(e) => setChangeRoomForm({ ...changeRoomForm, new_room_id: Number(e.target.value) })}
                    required
                    className="form-control-modern"
                  >
                    <option value="">-- Choose a room --</option>
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room #{r.room_number} ({r.room_type}) - ₹{Number(r.price).toFixed(2)}/night
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Alert variant="warning" style={{ marginBottom: 0, background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }}>
                    No available rooms for the selected dates
                  </Alert>
                )}
              </Form.Group>

              {/* Price Preview */}
              {changeRoomForm.new_room_id && (
                <div style={{ background: "#eef2ff", border: "1px solid #d1d5f7", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                  <h6 style={{ fontWeight: "700", marginBottom: "16px", color: "#2563eb" }}>💰 Pricing Breakdown</h6>
                  {calculateDays(booking.check_in_date, booking.check_out_date) > 1 && changeRoomForm.change_after_days ? (
                    <div>
                      <Row className="g-3 mb-2">
                        <Col md={6}>
                          <small style={{ color: "#64748b", display: "block" }}>Current Room ({changeRoomForm.change_after_days} days)</small>
                          <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>₹{(Number(changeRoomForm.change_after_days) * (booking.room?.price || 0)).toFixed(2)}</p>
                        </Col>
                        <Col md={6}>
                          <small style={{ color: "#64748b", display: "block" }}>New Room ({calculateDays(booking.check_in_date, booking.check_out_date) - Number(changeRoomForm.change_after_days)} days)</small>
                          <p style={{ fontWeight: "700", color: "#2563eb", margin: 0 }}>
                            ₹{((calculateDays(booking.check_in_date, booking.check_out_date) - Number(changeRoomForm.change_after_days)) * (availableRooms.find(r => r.id === changeRoomForm.new_room_id)?.price || 0)).toFixed(2)}
                          </p>
                        </Col>
                      </Row>
                      <hr style={{ borderColor: "#d1d5f7", margin: "12px 0" }} />
                      <Row className="g-3">
                        <Col md={6}>
                          <small style={{ color: "#64748b", display: "block" }}>Previous Total</small>
                          <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>₹{Number(booking.total_amount).toFixed(2)}</p>
                        </Col>
                        <Col md={6}>
                          <small style={{ color: "#64748b", display: "block" }}>New Total</small>
                          <p style={{ fontWeight: "700", color: "#2563eb", margin: 0 }}>
                            ₹{(
                              (Number(changeRoomForm.change_after_days) * (booking.room?.price || 0)) +
                              ((calculateDays(booking.check_in_date, booking.check_out_date) - Number(changeRoomForm.change_after_days)) * (availableRooms.find(r => r.id === changeRoomForm.new_room_id)?.price || 0))
                            ).toFixed(2)}
                          </p>
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    <div>
                      <Row className="g-3">
                        <Col md={6}>
                          <small style={{ color: "#64748b", display: "block" }}>Current Total</small>
                          <p style={{ fontWeight: "700", color: "#0f172a", margin: 0 }}>₹{Number(booking.total_amount).toFixed(2)}</p>
                        </Col>
                        <Col md={6}>
                          <small style={{ color: "#64748b", display: "block" }}>New Room Price</small>
                          <p style={{ fontWeight: "700", color: "#2563eb", margin: 0 }}>
                            ₹{Number(availableRooms.find(r => r.id === changeRoomForm.new_room_id)?.price || 0).toFixed(2)}
                          </p>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              )}

              <Modal.Footer className="modern-modal-footer">
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={() => setChangeRoom(false)} 
                  disabled={changeRoomLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={changeRoomLoading || !changeRoomForm.new_room_id || (calculateDays(booking.check_in_date, booking.check_out_date) > 1 && !changeRoomForm.change_after_days)}
                >
                  🚪 Change Room
                </button>
              </Modal.Footer>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* ===== CONFIRM BOOKING CARD MODAL ===== */}
      <Modal show={confirmBookingModal} onHide={() => setConfirmBookingModal(false)} centered className="modern-modal">
        <Modal.Body className="modern-modal-body p-0">
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
            border: '2px solid #86efac',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h4 style={{ fontWeight: '700', color: '#059669', marginBottom: '12px' }}>Confirm Booking?</h4>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
              Are you sure you want to confirm this booking?<br/>
              A confirmation email will be sent to the customer.
            </p>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <Row className="g-3">
                <Col md={6}>
                  <small style={{ color: '#64748b', display: 'block' }}>Guest Name</small>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>{booking?.customer_name}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: '#64748b', display: 'block' }}>Booking ID</small>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>#{booking?.id}</p>
                </Col>
              </Row>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmBookingModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={proceedConfirmBooking}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Processing...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ===== CANCEL BOOKING CARD MODAL ===== */}
      <Modal show={cancelBookingModal} onHide={() => setCancelBookingModal(false)} centered className="modern-modal">
        <Modal.Body className="modern-modal-body p-0">
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fef08a 100%)',
            border: '2px solid #fcd34d',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h4 style={{ fontWeight: '700', color: '#92400e', marginBottom: '12px' }}>Cancel Booking?</h4>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
              Are you sure you want to cancel this booking?<br/>
              This action cannot be undone.
            </p>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <Row className="g-3">
                <Col md={6}>
                  <small style={{ color: '#64748b', display: 'block' }}>Guest Name</small>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>{booking?.customer_name}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: '#64748b', display: 'block' }}>Booking ID</small>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>#{booking?.id}</p>
                </Col>
              </Row>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setCancelBookingModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={proceedCancelBooking}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Cancelling...' : '❌ Cancel Booking'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ===== DELETE BOOKING CARD MODAL ===== */}
      <Modal show={deleteBookingModal} onHide={() => setDeleteBookingModal(false)} centered className="modern-modal">
        <Modal.Body className="modern-modal-body p-0">
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #fca5a5',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h4 style={{ fontWeight: '700', color: '#dc2626', marginBottom: '12px' }}>Delete Booking?</h4>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
              Are you sure you want to permanently delete this booking?<br/>
              This action cannot be undone.
            </p>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <Row className="g-3">
                <Col md={6}>
                  <small style={{ color: '#64748b', display: 'block' }}>Guest Name</small>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>{booking?.customer_name}</p>
                </Col>
                <Col md={6}>
                  <small style={{ color: '#64748b', display: 'block' }}>Booking ID</small>
                  <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: 0 }}>#{booking?.id}</p>
                </Col>
              </Row>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteBookingModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={proceedDeleteBooking}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Deleting...' : '🗑️ Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      </div>
    </div>
  );
}
