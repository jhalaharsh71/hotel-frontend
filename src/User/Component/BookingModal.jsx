import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  InputGroup,
} from 'react-bootstrap';
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  User,
  CreditCard,
  IndianRupee,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import PaymentModal from './PaymentModal';
import './booking-modal.css';
import { USER_API } from '../../config/api';

const API_BASE = USER_API;

const BookingModal = ({
  show,
  onHide,
  hotel,
  room,
  checkInDate,
  checkOutDate,
  noOfPeople,
  durationDays,
}) => {
  // ===== STATE MANAGEMENT =====
  const [bookingForm, setBookingForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    no_of_people: noOfPeople,
    paid: 0,
    mode_of_payment: 'Cash',
  });

  // Guests state: array of guest objects rendered based on no_of_people
  const [guests, setGuests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  // Store submitted booking values for success display
  const [submittedBookingData, setSubmittedBookingData] = useState(null);

  const token = localStorage.getItem('user_token');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Calculate duration and total amount based on form values
  const calculateDuration = () => {
    if (bookingForm.check_in_date && bookingForm.check_out_date) {
      const checkIn = new Date(bookingForm.check_in_date);
      const checkOut = new Date(bookingForm.check_out_date);
      const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return duration > 0 ? duration : 0;
    }
    return 0;
  };

  const calculatedDurationDays = calculateDuration();
  const totalAmount = calculatedDurationDays > 0 ? calculatedDurationDays * room.price_per_day : 0;
  const minimumAdvancePayment = totalAmount * 0.10; // 10% of total amount

  // ===== RESET FORM ON MODAL OPEN =====
  useEffect(() => {
    if (show) {
      const initialMinimumPayment = (durationDays * room.price_per_day * 0.10);
      setBookingForm({
        customer_name: '',
        phone: '',
        email: '',
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        no_of_people: noOfPeople,
        paid: initialMinimumPayment,
        mode_of_payment: 'Cash',
      });
      setError(null);
      setSuccessMessage(null);
      setBookingSuccess(false);
      setBookingId(null);
      setSubmittedBookingData(null);
      // initialize guests array based on no_of_people
      const initialCount = noOfPeople || 1;
      const initialGuests = Array.from({ length: initialCount }).map((_, i) => ({
        first_name: '',
        last_name: '',
        gender: '',
        age: '',
        phone: '',
        email: '',
        is_primary: i === 0 ? true : false,
      }));
      setGuests(initialGuests);
    }
  }, [show, checkInDate, checkOutDate, noOfPeople, durationDays, room.price_per_day]);

  // Keep guests array length in sync when no_of_people changes in the form
  useEffect(() => {
    const count = Number(bookingForm.no_of_people) || 1;
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
  }, [bookingForm.no_of_people]);

  const handleGuestChange = (index, field, value) => {
    setGuests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      // If primary guest fields change, sync some top-level bookingForm fields
      if (index === 0) {
        setBookingForm((b) => ({
          ...b,
          customer_name: `${copy[0].first_name || ''} ${copy[0].last_name || ''}`.trim(),
          phone: copy[0].phone || b.phone,
          email: copy[0].email || b.email,
        }));
      }
      return copy;
    });
    setError(null);
  };

  // ===== FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Type conversion for specific fields
    if (name === 'paid' || name === 'no_of_people') {
      updatedValue = parseFloat(value) || 0;
    }

    setBookingForm((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
    setError(null);

    // Validate dates in real-time
    if (name === 'check_in_date' || name === 'check_out_date') {
      const checkInDate = name === 'check_in_date' ? updatedValue : bookingForm.check_in_date;
      const checkOutDate = name === 'check_out_date' ? updatedValue : bookingForm.check_out_date;

      if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (checkOut <= checkIn) {
          setDateError('Check-out date must be after check-in date');
        } else {
          setDateError(null);
        }
      } else {
        setDateError(null);
      }
    }
  };

  // ===== VALIDATION =====
  const validateForm = () => {
    if (!bookingForm.customer_name.trim()) {
      setError('Please enter customer name');
      return false;
    }
    if (!bookingForm.phone.trim()) {
      setError('Please enter phone number');
      return false;
    }
    if (!bookingForm.email.trim()) {
      setError('Please enter email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingForm.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (dateError) {
      setError(dateError);
      return false;
    }
    if (calculatedDurationDays <= 0) {
      setError('Check-out date must be after check-in date');
      return false;
    }
    if (bookingForm.no_of_people <= 0) {
      setError('Number of people must be at least 1');
      return false;
    }
    if (bookingForm.paid < 0) {
      setError('Paid amount cannot be negative');
      return false;
    }
    if (bookingForm.paid > totalAmount) {
      setError('Paid amount cannot exceed total amount');
      return false;
    }
    if (bookingForm.paid < minimumAdvancePayment) {
      setError(`Minimum advance payment of 10% (₹${minimumAdvancePayment.toFixed(2)}) is required`);
      return false;
    }

    // Validate guests array: count and per-guest required fields
    const expected = Number(bookingForm.no_of_people) || 1;
    if (!Array.isArray(guests) || guests.length !== expected) {
      setError('Number of guests must match number of people');
      return false;
    }

    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.first_name || !g.first_name.trim()) {
        setError(`Guest ${i + 1}: First name is required`);
        return false;
      }
      if (!g.last_name || !g.last_name.trim()) {
        setError(`Guest ${i + 1}: Last name is required`);
        return false;
      }
      if (!g.gender || !g.gender.trim()) {
        setError(`Guest ${i + 1}: Gender is required`);
        return false;
      }
      if (g.age === '' || g.age === null || isNaN(Number(g.age))) {
        setError(`Guest ${i + 1}: Age must be a number`);
        return false;
      }
      if (!g.phone || !g.phone.trim()) {
        setError(`Guest ${i + 1}: Phone is required`);
        return false;
      }
      if (!g.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email)) {
        setError(`Guest ${i + 1}: Valid email is required`);
        return false;
      }
    }
    return true;
  };

  // ===== CREATE BOOKING =====
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ===== PAYMENT GATEWAY CHECK =====
    // If payment mode is UPI or Card, show dummy payment modal
    if (bookingForm.mode_of_payment === 'UPI' || bookingForm.mode_of_payment === 'Card') {
      setShowPaymentModal(true);
      return; // Wait for payment to complete
    }

    // ===== DIRECT BOOKING FOR CASH =====
    proceedWithBooking('success');
  };

  // ===== HANDLE PAYMENT RESULT =====
  const handlePaymentResult = (status) => {
    setShowPaymentModal(false);

    if (status === 'success') {
      // Proceed with booking after payment success
      setTimeout(() => {
        proceedWithBooking('success');
      }, 1000);
    } else if (status === 'cancelled' || status === 'failed') {
      setError('Payment was cancelled. Please try again.');
      setPaymentStatus(null);
    }
  };

  // ===== PROCEED WITH BOOKING CREATION =====
  const proceedWithBooking = async (paymentResult) => {
    if (!token) {
      setError('You must be logged in to book a room');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      // Ensure top-level customer fields are present (derive from primary guest if needed)
      const primary = guests && guests.length ? guests[0] : null;
      const payload = {
        hotel_id: hotel.id,
        customer_name: bookingForm.customer_name || (primary ? `${primary.first_name} ${primary.last_name}`.trim() : ''),
        phone: bookingForm.phone || (primary ? primary.phone : ''),
        email: bookingForm.email || (primary ? primary.email : ''),
        check_in_date: bookingForm.check_in_date,
        check_out_date: bookingForm.check_out_date,
        room_id: room.id,
        no_of_people: bookingForm.no_of_people,
        paid: bookingForm.paid,
        mode_of_payment: bookingForm.mode_of_payment,
        online_payment_status: paymentResult, // Include online payment status
        guests: guests,
      };

      const response = await axios.post(`${API_BASE}/create-booking`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        // Store the submitted booking data for success display
        setSubmittedBookingData({
          check_in_date: bookingForm.check_in_date,
          check_out_date: bookingForm.check_out_date,
          no_of_people: bookingForm.no_of_people,
          duration_days: calculatedDurationDays,
          total_amount: totalAmount,
          paid_amount: bookingForm.paid,
        });
        
        setBookingSuccess(true);
        setBookingId(response.data.booking_id);
        setSuccessMessage('Booking created successfully!');

        // Reset form
        setBookingForm({
          customer_name: '',
          phone: '',
          email: '',
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          no_of_people: noOfPeople,
          paid: 0,
          mode_of_payment: 'Cash',
        });
        setPaymentStatus(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create booking. Please try again.'
      );
      setPaymentStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  // ===== CLOSE MODAL =====
  const handleCloseModal = () => {
    if (!submitting) {
      onHide();
    }
  };

  // ===== SUCCESS VIEW =====
  if (bookingSuccess && submittedBookingData) {
    const handleDownloadReceipt = () => {
      const receiptContent = `
        ╔════════════════════════════════════════════════════════════════╗
        ║                       BOOKING  RECEIPT                         ║
        ╚════════════════════════════════════════════════════════════════╝

        Booking ID: #${bookingId}
        Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}

        ────────────────────────────────────────────────────────────────
        HOTEL INFORMATION
        ────────────────────────────────────────────────────────────────
        Hotel Name: ${hotel.name}
        Room Type: ${room.room_type}
        Room Capacity: ${room.min_people}-${room.max_people} guests

        ────────────────────────────────────────────────────────────────
        STAY DETAILS
        ────────────────────────────────────────────────────────────────
        Check-in: ${new Date(submittedBookingData.check_in_date).toLocaleDateString('en-IN')}
        Check-out: ${new Date(submittedBookingData.check_out_date).toLocaleDateString('en-IN')}
        Duration: ${submittedBookingData.duration_days} nights

        ────────────────────────────────────────────────────────────────
        GUEST INFORMATION
        ────────────────────────────────────────────────────────────────
        Number of Guests: ${submittedBookingData.no_of_people}

        ${guests.map((g, idx) => `
        Guest ${idx + 1}${g.is_primary ? ' (Primary)' : ''}:
        Name: ${g.first_name} ${g.last_name}
        Gender: ${g.gender}
        Age: ${g.age} years
        Phone: ${g.phone}
        Email: ${g.email}
        `).join('\n')}

        ────────────────────────────────────────────────────────────────
        PRICE BREAKDOWN
        ────────────────────────────────────────────────────────────────
        Price per Night:           ₹${room.price_per_day.toFixed(2)}
        Number of Nights:          ${submittedBookingData.duration_days}
        ────────────────────────────────────────────────────────────────
        Total Amount:              ₹${submittedBookingData.total_amount.toFixed(2)}
        Amount Paid:               ₹${Number(submittedBookingData.paid_amount).toFixed(2)}
        Amount Due:                ₹${(submittedBookingData.total_amount - submittedBookingData.paid_amount).toFixed(2)}
        Payment Mode:              ${bookingForm.mode_of_payment}

        ════════════════════════════════════════════════════════════════
        Thank you for your booking!
        You will receive a confirmation email shortly.
        ════════════════════════════════════════════════════════════════
      `;

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
      element.setAttribute('download', `Booking-Receipt-${bookingId}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };

    return (
      <Modal show={show} onHide={handleCloseModal} centered size="md" className="receipt-modal" style={{ marginTop: '50px', maxHeight: '85vh', borderRadius: '8px' }}>
        <Modal.Header closeButton={!submitting} className="border-0 bg-light">
          <Modal.Title className="w-100 text-center">
            <h5 className="mb-0">📋 Booking Receipt</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '16px' }}>
          {/* Receipt Container */}
          <div className="receipt-container" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
            
            {/* Hotel Header */}
            <div style={{ borderBottom: '2px solid #667eea', paddingBottom: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '8px', textAlign: 'center' }}>
                {hotel.name}
              </h4>
              <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '0', fontSize: '13px' }}>
                Room Booking Confirmation
              </p>
            </div>

            {/* Booking ID & Status */}
            <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #667eea' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>BOOKING ID</span>
                <span style={{ fontWeight: '700', color: '#667eea', fontSize: '14px' }}>#{bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>STATUS</span>
                <span style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>✓ BOOKING CREATED</span>
              </div>
            </div>

            {/* Room & Stay Info */}
            <div style={{ marginBottom: '20px' }}>
              <h6 style={{ fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                🏨 Room Details
              </h6>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>ROOM TYPE</span>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1e293b' }}>{room.room_type}</p>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>CAPACITY</span>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1e293b' }}>{room.min_people}-{room.max_people} guests</p>
                </div>
              </div>
            </div>

            {/* Stay Dates */}
            <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h6 style={{ fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                📅 Stay Dates
              </h6>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>CHECK-IN</span>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    {new Date(submittedBookingData.check_in_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>CHECK-OUT</span>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    {new Date(submittedBookingData.check_out_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>DURATION</span>
                  <p style={{ margin: '0', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    {submittedBookingData.duration_days} nights
                  </p>
                </div>
              </div>
            </div>

            {/* Guests Information */}
            <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h6 style={{ fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                👥 Guest Details ({submittedBookingData.no_of_people})
              </h6>
              <div style={{ display: 'grid', gap: '12px' }}>
                {guests.map((g, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>
                        Guest {idx + 1} {g.is_primary && <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '3px', marginLeft: '8px', fontSize: '11px' }}>PRIMARY</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      <div style={{ marginBottom: '4px' }}><strong>Name:</strong> {g.first_name} {g.last_name}</div>
                      <div style={{ marginBottom: '4px' }}><strong>Gender:</strong> {g.gender}</div>
                      <div style={{ marginBottom: '4px' }}><strong>Age:</strong> {g.age} years</div>
                      <div style={{ marginBottom: '4px' }}><strong>Phone:</strong> {g.phone}</div>
                      <div><strong>Email:</strong> {g.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h6 style={{ fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                💰 Price Breakdown
              </h6>
              <div style={{ background: '#fafbfc', padding: '16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>Price per Night</span>
                  <span style={{ fontWeight: '600' }}>₹{room.price_per_day.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <span>× {submittedBookingData.duration_days} nights</span>
                  <span style={{ fontWeight: '600' }}>₹{(room.price_per_day * submittedBookingData.duration_days).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#667eea' }}>
                  <span>TOTAL AMOUNT</span>
                  <span>₹{submittedBookingData.total_amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#10b981' }}>
                  <span>Amount Paid</span>
                  <span style={{ fontWeight: '600' }}>₹{Number(submittedBookingData.paid_amount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>
                  <span>Amount Due</span>
                  <span>₹{(Number(submittedBookingData.total_amount) - Number(submittedBookingData.paid_amount)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h6 style={{ fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                💳 Payment Info
              </h6>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Payment Mode</span>
                <span style={{ fontWeight: '600' }}>{bookingForm.mode_of_payment}</span>
              </div>
            </div>

            {/* Footer Message */}
            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
              <p style={{ margin: '0', color: '#065f46', fontSize: '12px', fontWeight: '600' }}>
                ✓ Booking created Successfully!
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#059669', fontSize: '12px' }}>
                A confirmation email has been sent to {guests[0]?.email || 'your email'}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light" style={{position:'sticky', bottom:"0", width:"100%"}}>
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            className="fw-semibold"
          >
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDownloadReceipt}
            className="fw-semibold"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          >
            📥 Download Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // ===== RENDER BOOKING MODAL WITH PAYMENT MODAL =====
  return (
    <>
      {/* Payment Modal (shown when UPI/Card is selected) */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        paymentMode={bookingForm.mode_of_payment}
        totalAmount={totalAmount}
        onPaymentSuccess={handlePaymentResult}
      />

      {/* Booking Form Modal */}
      <Modal show={show} onHide={handleCloseModal} centered size="md" className="booking-modal" dialogClassName="modal-responsive" style={{ marginTop: '40px' }}>
        <Modal.Header closeButton={!submitting} className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold">
            <div className="d-flex align-items-center gap-2">
              <CreditCard size={24} className="text-primary" />
              Complete Your Booking
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-4" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
        {/* Hotel & Room Header Card */}
        <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="card-body text-white">
            <h5 className="card-title mb-3 fw-bold">{hotel.name}</h5>
            <Row className="g-3">
              <Col xs={6}>
                <small className="d-block opacity-80">Room Type</small>
                <p className="mb-0 fw-semibold fs-6">{room.room_type}</p>
              </Col>
              <Col xs={6}>
                <small className="d-block opacity-80">Price per Night</small>
                <p className="mb-0 fw-semibold fs-6">₹{room.price_per_day}</p>
              </Col>
            </Row>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="danger" className="mb-4 d-flex gap-2 border-0" style={{ background: '#fee', color: '#c33' }}>
            <AlertCircle size={20} className="flex-shrink-0 mt-1" />
            <div>{error}</div>
          </Alert>
        )}

        <Form onSubmit={handleSubmitBooking}>
          {/* Booking Dates & Guests Section */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Stay Details
            </h6>
            
            <Row className="g-3">
              {/* Check-in Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">
                    <Calendar size={16} className="d-inline me-1 text-primary" />
                    Check-in Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="check_in_date"
                    value={bookingForm.check_in_date}
                    onChange={handleInputChange}
                    disabled={submitting}
                    min={today}
                    className={`form-control-lg border-2 ${dateError ? 'is-invalid' : ''}`}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Check-out Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">
                    <Calendar size={16} className="d-inline me-1 text-primary" />
                    Check-out Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="check_out_date"
                    value={bookingForm.check_out_date}
                    onChange={handleInputChange}
                    disabled={submitting}
                    min={today}
                    className={`form-control-lg border-2 ${dateError ? 'is-invalid' : ''}`}
                    required
                  />
                  {dateError && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      <div className="d-flex gap-2 align-items-start mt-2">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{dateError}</span>
                      </div>
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              {/* Number of People */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">
                    <Users size={16} className="d-inline me-1 text-primary" />
                    Number of Guests
                  </Form.Label>
                  <Form.Select
                    name="no_of_people"
                    value={bookingForm.no_of_people}
                    onChange={handleInputChange}
                    disabled={submitting}
                    className="form-select-lg border-2"
                    required
                  >
                    {Array.from(
                      { length: (room.max_people || 10) - (room.min_people || 1) + 1 },
                      (_, i) => (room.min_people || 1) + i
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Duration (Read-only) */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">
                    <Clock size={16} className="d-inline me-1 text-primary" />
                    Duration
                  </Form.Label>
                  <div className="p-3 bg-light rounded border-2" style={{ borderColor: '#e9ecef' }}>
                    <p className="mb-0 fw-semibold text-dark fs-6">
                      {calculatedDurationDays} {calculatedDurationDays === 1 ? 'night' : 'nights'}
                    </p>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <hr className="my-4" />

          {/* Guest Information Section (dynamic based on no_of_people) */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <User size={18} className="text-primary" />
              Guest Information
            </h6>

            {guests.map((g, idx) => (
              <div key={idx} className="mb-3 p-3 rounded border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Guest {idx + 1} {g.is_primary && <span className="badge bg-primary ms-2">Primary</span>}</strong>
                </div>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={g.first_name}
                        onChange={(e) => handleGuestChange(idx, 'first_name', e.target.value)}
                        disabled={submitting}
                        className="form-control-lg border-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={g.last_name}
                        onChange={(e) => handleGuestChange(idx, 'last_name', e.target.value)}
                        disabled={submitting}
                        className="form-control-lg border-2"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4} className="mt-2">
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Gender</Form.Label>
                      <Form.Select
                        value={g.gender}
                        onChange={(e) => handleGuestChange(idx, 'gender', e.target.value)}
                        disabled={submitting}
                        className="form-select-lg border-2"
                        required
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4} className="mt-2">
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Age</Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={g.age}
                        onChange={(e) => handleGuestChange(idx, 'age', e.target.value)}
                        disabled={submitting}
                        className="form-control-lg border-2"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4} className="mt-2">
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        value={g.phone}
                        onChange={(e) => handleGuestChange(idx, 'phone', e.target.value)}
                        disabled={submitting}
                        className="form-control-lg border-2"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mt-2">
                    <Form.Group>
                      <Form.Label className="fw-semibold text-secondary small">Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={g.email}
                        onChange={(e) => handleGuestChange(idx, 'email', e.target.value)}
                        disabled={submitting}
                        className="form-control-lg border-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          {/* Payment Section */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Payment Information
            </h6>

            {/* Price Breakdown Card */}
            <div className="card border-0 bg-light mb-4">
              <div className="card-body">
                <Row className="mb-3 pb-3 border-bottom">
                  <Col xs={6}>
                    <small className="text-muted d-block">Rate per Night</small>
                    <p className="mb-0 fw-semibold">₹{room.price_per_day}</p>
                  </Col>
                  <Col xs={6} className="text-end">
                    <small className="text-muted d-block">× {calculatedDurationDays} {calculatedDurationDays === 1 ? 'night' : 'nights'}</small>
                    <p className="mb-0 fw-semibold">₹{(room.price_per_day * calculatedDurationDays).toFixed(2)}</p>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <small className="text-muted d-block mb-1">Total Amount</small>
                  </Col>
                  <Col xs={6} className="text-end">
                    <h5 className="mb-0 text-success fw-bold">
                      ₹{totalAmount.toFixed(2)}
                    </h5>
                  </Col>
                </Row>
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '12px', marginTop: '16px' }}>
                  <small style={{ color: '#856404', fontWeight: '600' }}>
                    ⚠️ Advance Payment Required: ₹{minimumAdvancePayment.toFixed(2)} (10% of total)
                  </small>
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                <CreditCard size={16} className="d-inline me-1 text-primary" />
                Payment Method
              </Form.Label>
              <Form.Select
                name="mode_of_payment"
                value={bookingForm.mode_of_payment}
                onChange={handleInputChange}
                disabled={submitting}
                className="form-select-lg border-2"
              >
                <option value="Card">💳 Card</option>
                <option value="UPI">📱 UPI</option>
              </Form.Select>
            </Form.Group>

            {/* Amount to Pay */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                <IndianRupee size={16} className="d-inline me-1 text-primary" />
                Amount to Pay Now (Minimum 10% Advance)
              </Form.Label>
              <InputGroup className="mb-2">
                <InputGroup.Text className="bg-light border-2" style={{ borderColor: '#dee2e6' }}>
                  <IndianRupee size={18} className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  name="paid"
                  value={bookingForm.paid}
                  onChange={handleInputChange}
                  placeholder={minimumAdvancePayment.toFixed(2)}
                  min={minimumAdvancePayment}
                  max={totalAmount}
                  step={0.01}
                  disabled={submitting}
                  className="form-control-lg border-2"
                  required
                />
              </InputGroup>
              <small className="text-muted d-block mt-2">
                <strong>Minimum Advance (10%):</strong> ₹{minimumAdvancePayment.toFixed(2)}
              </small>
              <small className="text-muted d-block">
                <strong>Remaining to Pay:</strong> ₹{Number(totalAmount - bookingForm.paid).toFixed(2)}
              </small>
            </Form.Group>
          </div>

          {/* Submit Button */}
          <div className="d-grid gap-2 mt-4">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={submitting}
              className="fw-semibold py-3"
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} className="me-2" />
                  Complete Booking
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
    </>
  );
};

export default BookingModal;
