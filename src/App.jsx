import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";


import UserLayout from "./User/UserLayout";
import AdminLayout from "./Admin/AdminLayout";
import SuperAdminLayout from "./SuperAdmin/SuperAdminLayout";
import Book from "./SuperAdmin/Pages/Bookings/Bookings";
import BookDetails from "./SuperAdmin/Pages/Bookings/BookingDetails";

import AdminGuard from "./Auth/AdminGuard";
import SuperAdminGuard from "./Auth/SuperAdminGuard";
import UserGuard from "./Auth/UserGuard";

import Login from "./Login/Login";
import Signup from "./User/Pages/Signup";
import Home from "./User/Pages/Home/Home";
import HotelDetails from "./User/Pages/Home/HotelDetails";
import Profile from "./User/Pages/Profile/Profile";

import Admin from "./Admin/Admin";
import Dashboard from "./Admin/Pages/Dashboard";
import Rooms from "./Admin/Pages/Rooms";
import Bookings from "./Admin/Pages/Bookings";
import Services from "./Admin/Pages/Services";
import Guests from "./Admin/Pages/Guests";
import Reports from "./Admin/Pages/Reports";
import Reviews from "./Admin/Pages/Reviews";

import SuperAdmin from "./SuperAdmin/SuperAdmin";
import Hotel from "./SuperAdmin/Pages/Hotel/Hotel";
import HotelDetailsSuperAdmin from "./SuperAdmin/Pages/Hotel/HotelDetails";
import Subscription from "./SuperAdmin/Pages/Subscription/Subscription";
import BookingDetails from "./Admin/Pages/BookingDetails";
import UserBooking from "./User/Pages/Booking/UserBooking";
import YourBookings from "./User/Pages/Booking/YourBookings";
import UserBookingDetails from "./User/Pages/Booking/UserBookingDetails";
import SuperadminProfile from "./SuperAdmin/Pages/Profile/SuperadminProfile";
import TodaysCheckin from "./Admin/Pages/TodaysCheckin";
import TodaysCheckout from "./Admin/Pages/TodaysCheckout";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<UserBooking />} />
        <Route path="/user/bookings" element={<UserBooking />} />
        <Route path="/user-booking" element={<UserBooking />} />
        <Route path="/your-bookings" element={<YourBookings />} />
        <Route path="/user-booking-details/:bookingId" element={<UserBookingDetails />} />
        <Route path="/hotel-details/:hotelId" element={<HotelDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Login Routes - All roles */}
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/user/login" element={<Login />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/superadmin/login" element={<Login />} />
      
      <Route path="/user/signup" element={<Signup />} />

      {/* USER */}
      <Route element={<UserGuard />}>
        <Route element={<UserLayout />}>
          <Route path="/user" element={<Home />} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/rooms" element={<Rooms />} />
          <Route path="/admin/bookings" element={<Bookings />} />
          <Route path="/admin/bookings/:id" element={<BookingDetails />} />
          <Route path="/admin/services" element={<Services />} />
          <Route path="/admin/guests" element={<Guests />} />
          <Route path="/admin/checkins" element={<TodaysCheckin />} />
          <Route path="/admin/checkouts" element={<TodaysCheckout />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/reviews" element={<Reviews />} />
        </Route>
      </Route>

      {/* SUPER ADMIN */}
      <Route element={<SuperAdminGuard />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin" element={<SuperAdmin />} />
          <Route path="/superadmin/hotel" element={<Hotel />} />
          <Route path="/superadmin/hotel/:id" element={<HotelDetailsSuperAdmin />} />
          <Route path="/superadmin/subscription" element={<Subscription />} />
          <Route path="/superadmin/bookings" element={<Book />} />
          <Route path="/superadmin/bookings/:id" element={<BookDetails />} />
          <Route path="/superadmin/profile" element={<SuperadminProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
