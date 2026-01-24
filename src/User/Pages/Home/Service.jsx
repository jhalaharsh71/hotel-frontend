import React from "react";
import "./home.css";

function Service() {
  return (
    <div className="services-section" id="services">
      <div className="container">
        <h2 className="text-center mb-4 text-white">Our Services</h2>

        <div className="row text-center">
          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Luxury Rooms</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">24/7 Support</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Free WiFi</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Restaurant</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Room Service</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Swimming Pool</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Airport Pickup</div>
          </div>

          <div className="col-md-3 col-sm-6 mb-3">
            <div className="service-card">Laundry Service</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Service;
