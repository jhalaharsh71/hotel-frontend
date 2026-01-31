import React, { useState } from 'react';
import {
  Modal,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from 'react-bootstrap';
import {
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import './payment-modal.css';

const PaymentModal = ({
  show,
  onHide,
  paymentMode,
  totalAmount,
  onPaymentSuccess,
}) => {
  const [paymentForm, setPaymentForm] = useState({
    upiId: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validatePaymentForm = () => {
    if (paymentMode === 'UPI') {
      if (!paymentForm.upiId.trim()) {
        setError('Please enter UPI ID');
        return false;
      }
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(paymentForm.upiId)) {
        setError('Please enter a valid UPI ID (e.g., username@upi)');
        return false;
      }
    } else if (paymentMode === 'Card') {
      if (!paymentForm.cardNumber.trim()) {
        setError('Please enter card number');
        return false;
      }
      if (!/^\d{16}$/.test(paymentForm.cardNumber.replace(/\s/g, ''))) {
        setError('Card number must be 16 digits');
        return false;
      }
      if (!paymentForm.cardHolder.trim()) {
        setError('Please enter card holder name');
        return false;
      }
      if (!paymentForm.expiryDate.trim()) {
        setError('Please enter expiry date');
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
        setError('Expiry date must be in MM/YY format');
        return false;
      }
      if (!paymentForm.cvv.trim()) {
        setError('Please enter CVV');
        return false;
      }
      if (!/^\d{3}$/.test(paymentForm.cvv)) {
        setError('CVV must be 3 digits');
        return false;
      }
    }
    return true;
  };

  const simulatePayment = async () => {
    if (!validatePaymentForm()) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Simulate payment processing delay
    setTimeout(() => {
      // 90% success rate for demo (random success/failure)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        setPaymentStatus('success');
        // Call success callback after a short delay
        setTimeout(() => {
          setProcessing(false);
          onPaymentSuccess('success');
        }, 1500);
      } else {
        setPaymentStatus('failed');
        setError('Payment failed. Please try again.');
        setProcessing(false);
      }
    }, 2000);
  };

  const handleCancel = () => {
    setPaymentForm({
      upiId: '',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    });
    setError(null);
    setPaymentStatus(null);
    onPaymentSuccess('cancelled');
  };

  // ===== SUCCESS STATE =====
  if (paymentStatus === 'success') {
    return (
      <Modal show={show} onHide={() => {}} centered size="sm" backdrop="static" keyboard={false} style={{marginTop:'40px'}}>
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            <CheckCircle size={64} className="text-success mx-auto d-block mb-3" />
            <h4>Payment Successful!</h4>
            <p className="text-muted mb-0">
              Amount: <strong>₹{totalAmount.toFixed(2)}</strong>
            </p>
          </div>
          <p className="text-muted small">
            Your payment has been processed. Your booking is being created...
          </p>
        </Modal.Body>
      </Modal>
    );
  }

  // ===== PAYMENT FORM =====
  return (
    <Modal show={show} onHide={handleCancel} centered size="lg" className="payment-modal" backdrop="static" keyboard={false} style={{marginTop:'40px'}}>
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <div className="d-flex align-items-center gap-2">
            {paymentMode === 'UPI' ? (
              <Smartphone size={24} className="text-primary" />
            ) : (
              <CreditCard size={24} className="text-primary" />
            )}
            Complete Payment
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-4">
        {/* Amount Display */}
        <div className="card border-0 bg-light mb-4">
          <div className="card-body">
            <p className="text-muted mb-1">Amount to Pay</p>
            <h3 className="text-success fw-bold mb-0">
              ₹{totalAmount.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="danger" className="mb-4 d-flex gap-2 border-0">
            <AlertCircle size={20} className="flex-shrink-0 mt-1" />
            <div>{error}</div>
          </Alert>
        )}

        {/* Payment Mode Info */}
        <div className="card border-2 border-primary mb-4">
          <div className="card-body">
            <p className="text-muted small mb-1">Payment Method</p>
            <h6 className="fw-bold mb-0">
              {paymentMode === 'UPI' ? '📱 UPI Payment' : '💳 Card Payment'}
            </h6>
          </div>
        </div>

        {/* UPI Payment Form */}
        {paymentMode === 'UPI' && (
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-secondary small">
                <Smartphone size={16} className="d-inline me-1 text-primary" />
                UPI ID
              </Form.Label>
              <Form.Control
                type="text"
                name="upiId"
                value={paymentForm.upiId}
                onChange={handleInputChange}
                placeholder="username@upi"
                disabled={processing}
                className="form-control-lg border-2"
                required
              />
              <small className="text-muted d-block mt-2">
                e.g., john@okhdfcbank or mobile@phonepe
              </small>
            </Form.Group>
          </Form>
        )}

        {/* Card Payment Form */}
        {paymentMode === 'Card' && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                <CreditCard size={16} className="d-inline me-1 text-primary" />
                Card Number
              </Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={paymentForm.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                disabled={processing}
                className="form-control-lg border-2"
                maxLength="19"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">
                Card Holder Name
              </Form.Label>
              <Form.Control
                type="text"
                name="cardHolder"
                value={paymentForm.cardHolder}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={processing}
                className="form-control-lg border-2"
                required
              />
            </Form.Group>

            <Row className="g-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">
                    Expiry Date
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="expiryDate"
                    value={paymentForm.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    disabled={processing}
                    className="form-control-lg border-2"
                    maxLength="5"
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary small">
                    CVV
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="cvv"
                    value={paymentForm.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    disabled={processing}
                    className="form-control-lg border-2"
                    maxLength="3"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}

        {/* Test Card Info */}
        <div className="alert alert-info mt-4 mb-0 border-0">
          <small>
            <strong>💡 Demo Mode:</strong> This is a dummy payment gateway. You can enter any valid format.
            Payment will succeed 90% of the time for testing purposes.
          </small>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button
          variant="light"
          onClick={handleCancel}
          disabled={processing}
          className="fw-semibold"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={simulatePayment}
          disabled={processing}
          className="fw-semibold"
        >
          {processing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={18} className="me-2 d-inline" />
              Pay Now
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
