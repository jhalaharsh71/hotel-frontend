import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Spinner, Badge, Row, Col, Modal } from 'react-bootstrap';
import { Trash2, Plus, Upload, AlertCircle } from 'lucide-react';
import { ADMIN_API } from '../../config/api';

const API_BASE = ADMIN_API;

const HotelSettings = () => {
  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // About Hotel
  const [aboutHotel, setAboutHotel] = useState('');
  const [aboutEditing, setAboutEditing] = useState(false);
  const ABOUT_HOTEL_MAX_LENGTH = 5000;

  // Room Features
  const [roomFeatures, setRoomFeatures] = useState([]);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureIcon, setNewFeatureIcon] = useState('');

  // Hotel Facilities
  const [facilities, setFacilities] = useState([]);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityIcon, setNewFacilityIcon] = useState('');

  // Gallery Images
  const [galleries, setGalleries] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch hotel settings on component mount
  useEffect(() => {
    fetchHotelSettings();
  }, []);

  /**
   * Fetch all hotel settings from API
   */
  const fetchHotelSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_BASE}/hotel/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        setAboutHotel(data.about_hotel || '');
        setRoomFeatures(data.room_features || []);
        setFacilities(data.facilities || []);
        setGalleries(data.galleries || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hotel settings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update about hotel text
   */
  const handleUpdateAbout = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.put(
        `${API_BASE}/hotel/about`,
        { about_hotel: aboutHotel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('About Hotel section updated successfully!');
        setAboutEditing(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to update about hotel section');
      console.error('Error updating about hotel:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Add room feature
   */
  const handleAddRoomFeature = async (e) => {
    e.preventDefault();
    if (!newFeatureTitle.trim()) {
      setError('Feature title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.post(
        `${API_BASE}/hotel/room-features`,
        {
          feature_title: newFeatureTitle,
          feature_icon: newFeatureIcon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRoomFeatures([...roomFeatures, response.data.data]);
        setNewFeatureTitle('');
        setNewFeatureIcon('');
        setSuccessMessage('Room feature added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to add room feature');
      console.error('Error adding room feature:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete room feature
   */
  const handleDeleteRoomFeature = async (featureId) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(
        `${API_BASE}/hotel/room-features/${featureId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRoomFeatures(roomFeatures.filter((f) => f.id !== featureId));
        setSuccessMessage('Room feature deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete room feature');
      console.error('Error deleting room feature:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Add hotel facility
   */
  const handleAddFacility = async (e) => {
    e.preventDefault();
    if (!newFacilityName.trim()) {
      setError('Facility name is required');
      return;
    }
    if (!newFacilityIcon.trim()) {
      setError('Facility icon is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.post(
        `${API_BASE}/hotel/facilities`,
        {
          facility_name: newFacilityName,
          facility_icon: newFacilityIcon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFacilities([...facilities, response.data.data]);
        setNewFacilityName('');
        setNewFacilityIcon('');
        setSuccessMessage('Facility added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to add facility');
      console.error('Error adding facility:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete hotel facility
   */
  const handleDeleteFacility = async (facilityId) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(
        `${API_BASE}/hotel/facilities/${facilityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFacilities(facilities.filter((f) => f.id !== facilityId));
        setSuccessMessage('Facility deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete facility');
      console.error('Error deleting facility:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle file selection for gallery upload
   */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  /**
   * Upload multiple gallery images
   */
  const handleUploadGalleryImages = async (e) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      setError('Please select at least one image');
      return;
    }

    try {
      setUploadingGallery(true);
      setError(null);

      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append('images[]', file);
      });

      const token = localStorage.getItem('admin_token');
      const response = await axios.post(
        `${API_BASE}/hotel/galleries`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setGalleries([...galleries, ...response.data.data]);
        setSelectedImages([]);
        document.querySelector('input[type="file"]').value = '';
        setSuccessMessage('Gallery images uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to upload gallery images');
      console.error('Error uploading gallery images:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  /**
   * Delete gallery image
   */
  const handleDeleteGalleryImage = async (imageId) => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.delete(
        `${API_BASE}/hotel/galleries/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setGalleries(galleries.filter((g) => g.id !== imageId));
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        setSuccessMessage('Gallery image deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete gallery image');
      console.error('Error deleting gallery image:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle gallery image active/inactive
   * IMPORTANT: Admin UI always shows ALL images (active and inactive).
   * Frontend must not filter or hide images based on is_active status.
   */
  const handleToggleGalleryActive = async (imageId) => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.put(
        `${API_BASE}/hotel/galleries/${imageId}/toggle-active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updated = response.data.data;
        
        // Update only if we have valid updated data with an id
        if (updated && updated.id) {
          // Merge the updated properties with existing gallery data
          // This ensures we don't lose any properties if API response is partial
          setGalleries(
            galleries.map((g) => 
              g.id === updated.id ? { ...g, ...updated } : g
            )
          );
        } else {
          // Fallback: refresh all settings if response lacks updated data
          await fetchHotelSettings();
        }
        
        setSuccessMessage('Image status updated');
        setTimeout(() => setSuccessMessage(null), 2500);
      }
    } catch (err) {
      setError('Failed to update image status');
      console.error('Error toggling gallery active:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Set a gallery image as banner (single banner enforcement on server)
   */
  const handleSetBannerImage = async (imageId) => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.put(
        `${API_BASE}/hotel/galleries/${imageId}/set-banner`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updated = response.data.data;
        if (updated) {
          if (response.data.all_galleries) {
            setGalleries(response.data.all_galleries);
          } else {
            fetchHotelSettings();
          }
        } else {
          fetchHotelSettings();
        }
        setSuccessMessage('Banner image updated');
        setTimeout(() => setSuccessMessage(null), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set banner image');
      console.error('Error setting banner image:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle active/inactive state for a room feature
   */
  const handleToggleRoomFeatureActive = async (featureId) => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.put(
        `${API_BASE}/hotel/room-features/${featureId}/toggle-active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updated = response.data.data;
        setRoomFeatures(roomFeatures.map((r) => (r.id === updated.id ? { ...r, is_active: updated.is_active } : r)));
        setSuccessMessage('Feature status updated');
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch (err) {
      setError('Failed to update feature status');
      console.error('Error toggling feature active:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle active/inactive state for a facility
   */
  const handleToggleFacilityActive = async (facilityId) => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const response = await axios.put(
        `${API_BASE}/hotel/facilities/${facilityId}/toggle-active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updated = response.data.data;
        setFacilities(facilities.map((f) => (f.id === updated.id ? { ...f, is_active: updated.is_active } : f)));
        setSuccessMessage('Facility status updated');
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch (err) {
      setError('Failed to update facility status');
      console.error('Error toggling facility active:', err);
    } finally {
      setSaving(false);
    }
  };

  // NOTE: backend now returns fully-qualified `image_url` for gallery items.
  // Frontend should use `gallery.image_url` when rendering images.

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Loading hotel settings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold mb-2">Hotel Settings & Management</h1>
        <p className="text-muted">Manage your hotel's about section, room features, facilities, and gallery images</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <AlertCircle size={20} className="me-2" style={{ display: 'inline' }} />
          {error}
        </Alert>
      )}

      {/* 1. ABOUT HOTEL SECTION */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0 fw-bold">About This Hotel</h4>
            {!aboutEditing && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setAboutEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>

          {aboutEditing ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Hotel Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={aboutHotel}
                  onChange={(e) => setAboutHotel(e.target.value.slice(0, ABOUT_HOTEL_MAX_LENGTH))}
                  placeholder="Write a compelling description about your hotel..."
                  maxLength={ABOUT_HOTEL_MAX_LENGTH}
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <Form.Text className="text-muted">
                    {aboutHotel.length === ABOUT_HOTEL_MAX_LENGTH ? (
                      <span className="text-danger fw-bold">
                        Maximum character limit reached
                      </span>
                    ) : (
                      <span>
                        {aboutHotel.length} / {ABOUT_HOTEL_MAX_LENGTH} characters
                      </span>
                    )}
                  </Form.Text>
                  <Form.Text className={aboutHotel.length > ABOUT_HOTEL_MAX_LENGTH * 0.85 ? 'text-warning fw-bold' : 'text-muted'}>
                    {ABOUT_HOTEL_MAX_LENGTH - aboutHotel.length} characters remaining
                  </Form.Text>
                </div>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleUpdateAbout}
                  disabled={saving || aboutHotel.trim() === ''}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setAboutEditing(false);
                    fetchHotelSettings(); // Reset to original value
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
              {aboutHotel || 'No description added yet. Click edit to add one.'}
            </p>
          )}
        </Card.Body>
      </Card>

      {/* 2. ROOM FEATURES SECTION */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold">Room Features</h4>

          {/* Add New Room Feature */}
          <Form onSubmit={handleAddRoomFeature} className="mb-4 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Feature Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Air-conditioned rooms"
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                    disabled={saving}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Icon (Font Awesome or text)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., ✓ or fas fa-snowflake"
                    value={newFeatureIcon}
                    onChange={(e) => setNewFeatureIcon(e.target.value)}
                    disabled={saving}
                  />
                </Form.Group>
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              size="sm"
              disabled={saving}
              className="mt-2"
            >
              <Plus size={16} className="me-2" style={{ display: 'inline' }} />
              Add Feature
            </Button>
          </Form>

          {/* List of Room Features */}
          {roomFeatures.length > 0 ? (
            <div className="list-group">
              {roomFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="list-group-item d-flex justify-content-between align-items-center py-3"
                >
                  <div>
                    <p className="mb-0 fw-semibold">
                      {feature.feature_icon && (
                        <span className="me-2">{feature.feature_icon}</span>
                      )}
                      {feature.feature_title}
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant={feature.is_active ? 'success' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleRoomFeatureActive(feature.id)}
                      disabled={saving}
                    >
                      {feature.is_active ? 'Active' : 'Inactive'}
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteRoomFeature(feature.id)}
                      disabled={saving}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">No room features added yet</p>
          )}
        </Card.Body>
      </Card>

      {/* 3. HOTEL FACILITIES SECTION */}
      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold">Hotel Facilities & Services</h4>

          {/* Add New Facility */}
          <Form onSubmit={handleAddFacility} className="mb-4 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Facility Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Multi-cuisine Restaurant"
                    value={newFacilityName}
                    onChange={(e) => setNewFacilityName(e.target.value)}
                    disabled={saving}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Icon Emoji or Symbol</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 🍽️ or 🏊 or 💪"
                    value={newFacilityIcon}
                    onChange={(e) => setNewFacilityIcon(e.target.value)}
                    disabled={saving}
                  />
                </Form.Group>
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              size="sm"
              disabled={saving}
              className="mt-2"
            >
              <Plus size={16} className="me-2" style={{ display: 'inline' }} />
              Add Facility
            </Button>
          </Form>

          {/* List of Facilities */}
          {facilities.length > 0 ? (
            <div className="row g-3">
              {facilities.map((facility) => (
                <div key={facility.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 position-relative">
                    <div className="card-body">
                      <div className="text-center mb-3" style={{ fontSize: '2.5rem' }}>
                        {facility.facility_icon}
                      </div>
                      <h6 className="text-center mb-3 fw-semibold">
                        {facility.facility_name}
                      </h6>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={() => handleDeleteFacility(facility.id)}
                        disabled={saving}
                      >
                        <Trash2 size={14} className="me-1" style={{ display: 'inline' }} />
                        Delete
                      </Button>

                        <Button
                          variant={facility.is_active ? 'success' : 'secondary'}
                          size="sm"
                          className="w-100 mt-2"
                          onClick={() => handleToggleFacilityActive(facility.id)}
                          disabled={saving}
                        >
                          {facility.is_active ? 'Active' : 'Inactive'}
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">No facilities added yet</p>
          )}
        </Card.Body>
      </Card>

      {/* 4. HOTEL GALLERY SECTION */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold">Hotel Gallery</h4>

          {/* Upload Gallery Images */}
          <Form onSubmit={handleUploadGalleryImages} className="mb-4 p-4 border-2 border-dashed rounded bg-light">
            <Form.Group className="mb-3">
              <Form.Label className="d-block mb-3" style={{ cursor: 'pointer' }}>
                <Upload size={32} className="mx-auto d-block text-primary mb-2" />
                <span className="fw-semibold d-block">Click to upload images or drag and drop</span>
                <small className="text-muted d-block">PNG, JPG, GIF up to 5MB each</small>
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingGallery}
                id="gallery-file-input"
              />
            </Form.Group>

            {selectedImages.length > 0 && (
              <div className="mb-3">
                <Badge bg="info">{selectedImages.length} image(s) selected</Badge>
                <ul className="mt-2 mb-3 ps-3 text-muted small">
                  {selectedImages.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedImages.length === 0 ? (
              <Button
                variant="primary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('gallery-file-input').click();
                }}
                disabled={uploadingGallery}
                className="me-2"
              >
                <Upload size={16} className="me-2" style={{ display: 'inline' }} />
                Select Images
              </Button>
            ) : (
              <Button
                variant="primary"
                type="submit"
                disabled={uploadingGallery}
                className="me-2"
              >
                {uploadingGallery ? 'Uploading...' : `Upload ${selectedImages.length} Image(s)`}
              </Button>
            )}

            {uploadingGallery && (
              <>
                <Spinner animation="border" size="sm" className="ms-2" />
                <span className="ms-2">Uploading...</span>
              </>
            )}
          </Form>

          {/* Gallery Images Grid */}
          {galleries.length > 0 ? (
            <div className="row g-3">
              {galleries.map((gallery) => (
                <div key={gallery.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 overflow-hidden position-relative d-flex flex-column">
                    {/* Status Badge - Top Left */}
                    <Badge 
                      bg={gallery.is_active ? 'success' : 'secondary'} 
                      className="position-absolute fw-bold" 
                      style={{ top: '8px', left: '8px', zIndex: 5 }}
                    >
                      {gallery.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>

                    {/* Banner Badge - Top Right */}
                    {gallery.is_banner_image && (
                      <Badge bg="warning" className="position-absolute fw-bold" style={{ top: '8px', right: '8px', zIndex: 5, color: '#000' }}>
                        BANNER IMAGE
                      </Badge>
                    )}

                    {gallery.image_url ? (
                      <img
                        src={gallery.image_url}
                        alt="Gallery"
                        style={{
                          width: '100%',
                          height: '250px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      // Preserve layout when image is missing; log for debugging
                      (console.warn('Missing image_url for gallery item', gallery), (
                        <div style={{ width: '100%', height: '250px', backgroundColor: '#f3f4f6' }} />
                      ))
                    )}

                    {/* Control Footer - Always Visible */}
                    <div className="bg-light p-2 border-top d-flex gap-2 flex-wrap">
                      <Button
                        variant={gallery.is_active ? 'success' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleGalleryActive(gallery.id)}
                        disabled={saving || gallery.is_banner_image}
                        title={gallery.is_banner_image ? 'Cannot deactivate banner image' : ''}
                        className="flex-grow-1"
                      >
                        {gallery.is_active ? 'Active' : 'Inactive'}
                      </Button>

                      <Button
                        variant={gallery.is_banner_image ? 'warning' : 'outline-primary'}
                        size="sm"
                        onClick={() => handleSetBannerImage(gallery.id)}
                        disabled={saving || !gallery.is_active || gallery.is_banner_image}
                        title={gallery.is_banner_image ? 'Already banner image' : !gallery.is_active ? 'Can only set active images as banner' : ''}
                        className="flex-grow-1"
                      >
                        {gallery.is_banner_image ? '✓ Banner' : 'Set Banner'}
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget(gallery.id);
                          setShowDeleteConfirm(true);
                        }}
                        disabled={saving || gallery.is_banner_image}
                        title={gallery.is_banner_image ? 'Cannot delete banner image' : ''}
                        className="flex-grow-1"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-5">No gallery images uploaded yet</p>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this gallery image? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteGalleryImage(deleteTarget)}
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete Image'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HotelSettings;
