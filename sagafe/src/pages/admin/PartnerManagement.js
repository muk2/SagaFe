import React, { useState, useEffect, useRef } from 'react';
import { adminPartnersApi, adminMediaApi } from '../../lib/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminPartnersApi.getAll();
      setPartners(data.partners || data);
    } catch (err) {
      setError(err.message || 'Failed to load partners');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await adminMediaApi.uploadImage(formDataUpload);
      setFormData(prev => ({ ...prev, logo_url: response.url }));
      setSuccess('Logo uploaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (!formData.logo_url) {
        setError('Please upload a partner logo');
        return;
      }

      const dataToSend = {
        name: formData.name,
        logo_url: formData.logo_url,
        website_url: formData.website_url || null,
        display_order: editingPartner 
        ? (parseInt(formData.display_order) || 0)
        : partners.length,
      };

      if (editingPartner) {
        await adminPartnersApi.update(editingPartner.id, dataToSend);
        setSuccess('Partner updated successfully');
      } else {
        await adminPartnersApi.create(dataToSend);
        setSuccess('Partner added successfully');
      }

      await fetchPartners();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save partner');
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      display_order: partner.display_order || 0,
    });
    setShowForm(true);

    setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ 
            behavior: 'smooth',  
            block: 'start'      
          });
        }
      }, 100);
  };

  const handleDelete = async (partnerId, partnerName) => {
    if (!window.confirm(`Are you sure you want to delete "${partnerName}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await adminPartnersApi.delete(partnerId);
      setPartners(partners.filter(p => p.id !== partnerId));
      setSuccess('Partner deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete partner');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPartner(null);
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      display_order: 0,
    });
  };

  // ✅ FIXED: Move partner up (decrease display_order)
  const moveUp = async (partner, index) => {
    if (index === 0) return; // Already at top

    try {
      const prevPartner = partners[index - 1];
      
      // Swap display orders
      await adminPartnersApi.update(partner.id, { display_order: prevPartner.display_order });
      await adminPartnersApi.update(prevPartner.id, { display_order: partner.display_order });
      
      // ✅ Refresh from server to get correct order
      await fetchPartners();
      
      setSuccess('Partner order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder partners');
      console.error(err);
    }
  };

  // ✅ FIXED: Move partner down (increase display_order)
  const moveDown = async (partner, index) => {
    if (index === partners.length - 1) return; // Already at bottom

    try {
      const nextPartner = partners[index + 1];
      
      // Swap display orders
      await adminPartnersApi.update(partner.id, { display_order: nextPartner.display_order });
      await adminPartnersApi.update(nextPartner.id, { display_order: partner.display_order });
      
      // ✅ Refresh from server to get correct order
      await fetchPartners();
      
      setSuccess('Partner order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder partners');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading partners...</div>;
  }

  return (
    <div className="partner-management">
      <div className="section-header">
        <h2 className="admin-section-title">Partner Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add New Partner
          </button>
        )}
      </div>

      <div className="info-banner">
        <strong>🤝 Partners:</strong> Add your organization partners with their logos. They will appear in a slider on the homepage below the events section.
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {showForm && (
        <div className="partner-form-card" ref={formRef}>
          <h3>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Partner Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Titleist, Callaway Golf"
                required
              />
            </div>

            <div className="form-group">
              <label>Partner Logo *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              {uploadingLogo && <p style={{ color: '#3b82f6', marginTop: '0.5rem' }}>Uploading logo...</p>}
              {formData.logo_url && (
                <div className="logo-preview">
                  <img 
                    src={getFullImageUrl(formData.logo_url)} 
                    alt="Partner logo preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x100?text=Logo';
                    }}
                  />
                </div>
              )}
              <small className="help-text">Upload a high-quality logo (max 5MB). Recommended: 400x200px transparent PNG</small>
            </div>

            <div className="form-group">
              <label>Website URL (optional)</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
              <small className="help-text">Users will be directed here when clicking the partner logo</small>
            </div>

            <div className="form-actions" style={{display:"flex", gap: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={!formData.logo_url || uploadingLogo}>
                {editingPartner ? 'Update Partner' : 'Add Partner'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {partners.length === 0 && !showForm ? (
        <div className="empty-state">
          No partners added yet. Click "Add New Partner" to get started.
        </div>
      ) : (
        <div className="partners-list">
          {partners.map((partner, index) => (
            <div key={partner.id} className="partner-item">
              <div className="partner-logo-container">
                <img
                  src={getFullImageUrl(partner.logo_url)}
                  alt={partner.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x100?text=Logo';
                  }}
                />
              </div>
              <div className="partner-info">
                <h4>{partner.name}</h4>
                {partner.website_url && (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="partner-website">
                    {partner.website_url}
                  </a>
                )}
                <span className="partner-order">Order: {partner.display_order}</span>
              </div>
              <div className="partner-controls">
                <div className="order-buttons">
                  {/* ✅ Updated to use moveUp function */}
                  <button
                    onClick={() => moveUp(partner, index)}
                    disabled={index === 0}
                    className="btn-icon"
                    title="Move up"
                  >
                    ↑
                  </button>
                  {/* ✅ Updated to use moveDown function */}
                  <button
                    onClick={() => moveDown(partner, index)}
                    disabled={index === partners.length - 1}
                    className="btn-icon"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                <div className="action-buttons">
                  <button onClick={() => handleEdit(partner)} className="btn-secondary btn-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(partner.id, partner.name)} className="btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .info-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .partner-form-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
          scroll-margin-top: 2rem;
        }

        .partner-form-card h3 {
          margin: 0 0 1.5rem 0;
        }

        .logo-preview {
          margin-top: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }

        .logo-preview img {
          max-width: 200px;
          max-height: 100px;
          object-fit: contain;
        }

        .partners-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .partner-item {
          display: grid;
          grid-template-columns: 200px 1fr auto;
          gap: 1.5rem;
          align-items: center;
          background: white;
          padding: 1.25rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: box-shadow 0.2s;
        }

        .partner-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .partner-logo-container {
          width: 200px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.75rem;
        }

        .partner-logo-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .partner-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .partner-info h4 {
          margin: 0;
          font-size: 1.1rem;
          color: #1f2937;
        }

        .partner-website {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .partner-website:hover {
          text-decoration: underline;
        }

        .partner-order {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .partner-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .order-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .btn-icon:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #0d9488;
          color: #0d9488;
        }

        .btn-icon:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .partner-item {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .partner-logo-container {
            width: 100%;
          }

          .partner-controls {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }

          .action-buttons {
            width: 100%;
          }

          .btn-sm {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerManagement;