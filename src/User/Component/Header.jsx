import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { User as UserIcon } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import "./header.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const userToken = localStorage.getItem("user_token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!userToken && role === "user");
    const storedName = localStorage.getItem("user_name") || "User";
    setUserName(storedName);
  }, []);

  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <Navbar className="user-header-navbar" expand="lg" sticky="top" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <Container>
        <Navbar.Brand href="/" className="user-header-brand-logo">
          🏨 Hotel Management
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="user-header-toggle" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto user-header-nav-links">
            <Nav.Link href="/" className="user-header-nav-link">Home</Nav.Link>
            <Nav.Link href="#about" className="user-header-nav-link">About</Nav.Link>
            <Nav.Link href="#services" className="user-header-nav-link">Services</Nav.Link>
            <Nav.Link href="#contact" className="user-header-nav-link">Contact</Nav.Link>
            <Nav.Link href="/booking" className="user-header-nav-link user-header-booking-link">Booking</Nav.Link>


            {/* User Dropdown if logged in */}
            {isLoggedIn && (
              <Dropdown align="end" className="user-header-profile-dropdown">
                <Dropdown.Toggle
                  variant="link"
                  id="dropdown-user"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#334155',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: 'none',
                  }}
                  className="user-header-profile-toggle"
                >
                  <UserIcon size={22} style={{ marginRight: 2, color: '#6366f1' }} />
                  <span style={{ fontSize: '1rem', color: '#ffffff' }}>Harsh</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                  <Dropdown.Item href="/your-bookings">My Bookings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} style={{ color: '#dc2626', fontWeight: 600 }}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}


            {/* Show Sign Up and Login buttons only if user is NOT logged in */}
            {!isLoggedIn && (
              <div className="user-header-auth-buttons">
                <Button href="/signup" className="user-header-btn-signup">Sign Up</Button>
                <Button href="/login" className="user-header-btn-login">Login</Button>
              </div>
            )}

            {/* Logout now in dropdown */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
