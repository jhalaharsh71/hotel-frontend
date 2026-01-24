import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-4 ">
      <Container>
        <Row className="gy-4">
          <Col md={4} sm={12}>
            <h5>Hotel Management</h5>
            <p className="small">
              A modern hotel booking and management platform designed
              to simplify reservations and hotel operations.
            </p>
          </Col>

          <Col md={4} sm={6}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="#about" className="text-light text-decoration-none">About</a></li>
              <li><a href="#services" className="text-light text-decoration-none">Services</a></li>
              <li><a href="/booking" className="text-light text-decoration-none">Booking</a></li>
            </ul>
          </Col>

          <Col md={4} sm={6}>
            <h5>Contact</h5>
            <p className="mb-1">📍 Dewas, India</p>
            <p className="mb-1">📞 +91 98765 43210</p>
            <p className="mb-1">✉️ support@hotelmanagement.com</p>
          </Col>
        </Row>

        <Row className="border-top border-secondary mt-4 pt-3">
          <Col className="text-center small">
            © {new Date().getFullYear()} Hotel Management. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
