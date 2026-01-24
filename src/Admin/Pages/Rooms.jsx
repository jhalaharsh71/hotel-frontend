import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import {
  Plus,
  DoorOpen,
  Layers,
  IndianRupee,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Search,
  Hotel,
  X,
} from "lucide-react";
import "./Rooms.css";

const API_URL = "http://127.0.0.1:8000/api/admin/rooms";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    price: "",
    status: 1,
    min_people: "",
    max_people: "",
  });

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRooms(res.data);
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      (r) =>
        r.room_number.toLowerCase().includes(search.toLowerCase()) ||
        r.room_type.toLowerCase().includes(search.toLowerCase())
    );
  }, [rooms, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "status" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (editingRoom) {
        await axios.put(`${API_URL}/${editingRoom.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchRooms();
      resetForm();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room permanently?")) return;
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchRooms();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingRoom(null);
    setErrors({});
    setFormData({
      room_number: "",
      room_type: "",
      price: "",
      status: 1,
      min_people: "",
      max_people: "",
    });
  };

  return (
    <div className="rooms-page-wrapper">
      {/* Header Section */}
      <Row className="rooms-header mb-5">
        <Col lg={6}>
          <div className="header-content">
            <h1 className="rooms-title">
              <span className="gradient-text">Room Inventory</span>
            </h1>
            <p className="rooms-subtitle">Control room availability, pricing & categories</p>
          </div>
        </Col>
        <Col lg={6} className="text-lg-end text-center mt-3 mt-lg-0">
          <button className="btn-create-room" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Room
          </button>
        </Col>
      </Row>

      {/* ===== SEARCH BAR ===== */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="search-icon">
            <Search size={20} />
          </div>
          <input
            className="search-input"
            placeholder="Search by room number or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ===== ROOM CARDS ===== */}
      {filteredRooms.length > 0 ? (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <div key={room.id} className="room-glass-card">
              {/* HEADER */}
              <div className="room-card-header">
                <div className="room-card-title-section">
                  <div className="room-card-number">Room {room.room_number}</div>
                  <div className="room-card-type">{room.room_type}</div>
                </div>
                <div
                  className={`room-status-badge ${
                    room.status === 1 ? "status-available" : "status-unavailable"
                  }`}
                >
                  {room.status === 1 ? (
                    <>
                      <CheckCircle size={14} />
                      Available
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      Unavailable
                    </>
                  )}
                </div>
              </div>

              {/* PRICE SECTION */}
              <div className="room-price-section">
                <div className="price-info-row">
                  <div className="price-icon-box">
                    <IndianRupee />
                  </div>
                  <div className="price-text-section">
                    <div className="price-label">Price Per Night</div>
                    <div className="price-value">₹ {room.price}</div>
                    <div className="price-per-night">Standard Rate</div>
                  </div>
                </div>
              </div>

              {/* OCCUPANCY SECTION */}
              <div className="room-occupancy-section">
                <div className="occupancy-info-row">
                  <div className="occupancy-icon-box">
                    <Layers />
                  </div>
                  <div className="occupancy-text-section">
                    <div className="occupancy-label">Guest Capacity</div>
                    <div className="occupancy-value">{room.min_people} - {room.max_people} Guests</div>
                    <div className="occupancy-per-night">Min - Max</div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="room-actions">
                <button
                  className="btn-edit-room"
                  onClick={() => handleEdit(room)}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  className="btn-delete-room"
                  onClick={() => handleDelete(room.id)}
                  title="Delete room"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <DoorOpen size={64} />
          </div>
          <div className="empty-state-title">No rooms found</div>
          <div className="empty-state-text">
            Try adjusting your search or add a new room to get started
          </div>
        </div>
      )}

      {/* ===== MODAL FORM ===== */}
      {showModal && (
        <div className="rooms-modal-overlay">
          <div className="rooms-modal-content">
            <form onSubmit={handleSubmit}>
              {/* MODAL HEADER */}
              <div className="rooms-modal-header">
                <h2 className="rooms-modal-title">
                  {editingRoom ? "✏️ Update Room" : "➕ Create New Room"}
                </h2>
                <button
                  type="button"
                  className="rooms-modal-close"
                  onClick={resetForm}
                >
                  <X size={24} />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="rooms-modal-body">
                <div className="rooms-form-grid">
                  {/* Room Number */}
                  <div className="rooms-form-group">
                    <label className="rooms-form-label">
                      <DoorOpen size={18} />
                      Room Number
                    </label>
                    <div className="rooms-form-input-wrapper">
                      <div className="rooms-form-input-icon">
                        <DoorOpen size={16} />
                      </div>
                      <input
                        className={`rooms-form-input ${
                          errors.room_number ? "is-invalid" : ""
                        }`}
                        name="room_number"
                        placeholder="e.g., 101, A-201"
                        value={formData.room_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.room_number && (
                      <div className="rooms-form-error">
                        ⚠️ {errors.room_number[0]}
                      </div>
                    )}
                  </div>

                  {/* Room Type */}
                  <div className="rooms-form-group">
                    <label className="rooms-form-label">
                      <Layers size={18} />
                      Room Type
                    </label>
                    <div className="rooms-form-input-wrapper">
                      <div className="rooms-form-input-icon">
                        <Layers size={16} />
                      </div>
                      <input
                        className="rooms-form-input"
                        name="room_type"
                        placeholder="e.g., AC/NON-AC, Deluxe"
                        value={formData.room_type}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="rooms-form-group">
                    <label className="rooms-form-label">
                      <IndianRupee size={18} />
                      Price Per Night (₹)
                    </label>
                    <div className="rooms-form-input-wrapper">
                      <div className="rooms-form-input-icon">
                        <IndianRupee size={16} />
                      </div>
                      <input
                        type="number"
                        className="rooms-form-input"
                        name="price"
                        placeholder="e.g., 5000"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Min People */}
                  <div className="rooms-form-group">
                    <label className="rooms-form-label">
                      <Layers size={18} />
                      Min People
                    </label>
                    <div className="rooms-form-input-wrapper">
                      <div className="rooms-form-input-icon">
                        <Layers size={16} />
                      </div>
                      <input
                        type="number"
                        className={`rooms-form-input ${
                          errors.min_people ? "is-invalid" : ""
                        }`}
                        name="min_people"
                        placeholder="e.g., 1"
                        value={formData.min_people}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>
                    {errors.min_people && (
                      <div className="rooms-form-error">
                        ⚠️ {errors.min_people[0]}
                      </div>
                    )}
                  </div>

                  {/* Max People */}
                  <div className="rooms-form-group">
                    <label className="rooms-form-label">
                      <Layers size={18} />
                      Max People
                    </label>
                    <div className="rooms-form-input-wrapper">
                      <div className="rooms-form-input-icon">
                        <Layers size={16} />
                      </div>
                      <input
                        type="number"
                        className={`rooms-form-input ${
                          errors.max_people ? "is-invalid" : ""
                        }`}
                        name="max_people"
                        placeholder="e.g., 2"
                        value={formData.max_people}
                        onChange={handleChange}
                        min={formData.min_people || 1}
                        required
                      />
                    </div>
                    {errors.max_people && (
                      <div className="rooms-form-error">
                        ⚠️ {errors.max_people[0]}
                      </div>
                    )}
                  </div>

                  {/* Availability Status */}
                  <div className="rooms-form-group">
                    <label className="rooms-form-label">
                      <CheckCircle size={18} />
                      Availability Status
                    </label>
                    <div className="rooms-form-input-wrapper">
                      <div className="rooms-form-input-icon">
                        <CheckCircle size={16} />
                      </div>
                      <select
                        className="rooms-form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value={1}>✅ Available</option>
                        <option value={0}>❌ Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="rooms-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button className="btn-modal-save" disabled={loading}>
                  {loading ? "Saving..." : editingRoom ? "💾 Update Room" : "➕ Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
