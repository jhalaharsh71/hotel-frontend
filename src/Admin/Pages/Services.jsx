import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import "./Services.css";

const API_BASE = "http://127.0.0.1:8000/api/admin";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: 1,
  });

  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("admin_token");

  /* =====================
     FETCH SERVICES
  ====================== */
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /* =====================
     SUBMIT
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = {
        ...formData,
        status: Number(formData.status),
      };

      if (editingService) {
        await axios.put(
          `${API_BASE}/services/${editingService.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE}/services`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchServices();
      closeModal();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  /* =====================
     EDIT / DELETE
  ====================== */
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      status: service.status ? 1 : 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    await axios.delete(`${API_BASE}/services/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchServices();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: "", price: "", status: 1 });
    setErrors({});
  };

  /* =====================
     LOADING
  ====================== */
  if (loading) {
    return (
      <div className="services-loading-wrapper">
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-wrapper">
      <Container fluid className="services-container">
        {/* Header Section */}
        <Row className="services-header mb-5">
          <Col lg={6}>
            <div className="header-content">
              <h1 className="services-title">
                <span className="gradient-text">Manage Services</span>
              </h1>
              <p className="services-subtitle">
                Curate and manage the additional amenities offered to your guests
              </p>
            </div>
          </Col>
          <Col lg={6} className="text-lg-end text-center mt-3 mt-lg-0">
            <Button 
              onClick={() => setShowModal(true)}
              className="btn-add-service"
            >
              <span className="btn-icon">✨</span> Add New Service
            </Button>
          </Col>
        </Row>

        {/* Services Grid/Table Section */}
        <Card className="services-card modern-card">
          <Card.Body className="services-card-body">
            <div className="services-header-info mb-4">
              <div className="stat-badge">
                <span className="stat-number">{services.length}</span>
                <span className="stat-label">Services</span>
              </div>
            </div>

            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No Services Yet</h3>
                <p>Start by adding your first service to get guests excited!</p>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="btn-add-service mt-3"
                >
                  Create First Service
                </Button>
              </div>
            ) : (
              <div className="services-table-wrapper">
                <Table responsive hover className="services-table">
                  <thead>
                    <tr>
                      <th><span className="th-label">Service Name</span></th>
                      <th><span className="th-label">Price</span></th>
                      <th><span className="th-label">Status</span></th>
                      <th className="text-center"><span className="th-label">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="service-row">
                        <td className="service-name-cell">
                          <div className="service-name-content">
                            <span className="service-icon">⭐</span>
                            <span className="service-name">{service.name}</span>
                          </div>
                        </td>
                        <td className="service-price-cell">
                          <span className="price-tag">₹{Number(service.price).toFixed(2)}</span>
                        </td>
                        <td className="service-status-cell">
                          <Badge className={`status-badge status-${service.status ? 'active' : 'inactive'}`}>
                            {service.status ? '🟢 Active' : '⚫ Inactive'}
                          </Badge>
                        </td>
                        <td className="text-center service-actions-cell">
                          <div className="action-buttons">
                            <Button
                              size="sm"
                              className="btn-edit"
                              onClick={() => handleEdit(service)}
                              title="Edit Service"
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              size="sm"
                              className="btn-delete"
                              onClick={() => handleDelete(service.id)}
                              title="Delete Service"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modern Modal */}
      <Modal 
        show={showModal} 
        onHide={closeModal} 
        centered 
        className="modern-modal"
        backdrop="static"
      >
        <Modal.Header closeButton className="modern-modal-header">
          <Modal.Title className="modal-title-text">
            {editingService ? "🔄 Edit Service" : "✨ Create New Service"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="modern-modal-body">
            <Form.Group className="form-group-modern mb-4">
              <Form.Label className="form-label-modern">
                <span className="label-icon">📝</span> Service Name
              </Form.Label>
              <Form.Control
                placeholder="e.g., WiFi, Parking, Breakfast..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isInvalid={!!errors.name}
                className="form-control-modern"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.[0]}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="form-group-modern mb-4">
              <Form.Label className="form-label-modern">
                <span className="label-icon">💰</span> Price (₹)
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter price in rupees"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                isInvalid={!!errors.price}
                className="form-control-modern"
                step="0.01"
              />
              <Form.Control.Feedback type="invalid">
                {errors.price?.[0]}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="form-group-modern">
              <Form.Label className="form-label-modern">
                <span className="label-icon">🎯</span> Status
              </Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="form-control-modern"
              >
                <option value={1}>🟢 Active</option>
                <option value={0}>⚫ Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="modern-modal-footer">
            <Button variant="outline-secondary" onClick={closeModal} className="btn-cancel">
              Cancel
            </Button>
            <Button type="submit" className="btn-submit">
              {editingService ? "💾 Update Service" : "✅ Create Service"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Services;
