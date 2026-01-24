import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard when accessing /admin
    navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
        <h5 className="text-muted">Redirecting to Dashboard...</h5>
      </div>
    </div>
  );
}
