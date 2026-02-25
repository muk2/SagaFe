// ===================================================================
// File: pages/admin/MembershipOptionsManagement.js
// Admin Membership Options Management Component
// ===================================================================

import React, { useState, useEffect } from 'react';
import { membershipOptionsApi } from '../../lib/api';

const MembershipOptionsManagement = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipOptionsApi.getAllAdmin();
      setOptions(data);
    } catch (err) {
      setError(err.message || 'Failed to load membership options');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      const dataToSend = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || null,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingOption) {
        await membershipOptionsApi.update(editingOption.id, dataToSend);
        setSuccess('Membership option updated successfully');
      } else {
        await membershipOptionsApi.create(dataToSend);
        setSuccess('Membership option added successfully');
      }

      await fetchOptions();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save membership option');
    }
  };

  const handleEdit = (option) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      price: option.price,
      description: option.description || '',
      is_active: option.is_active,
      display_order: option.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (optionId, optionName) => {
    if (!window.confirm(`Are you sure you want to delete "${optionName}"?`)) {
      return;
    }

    try {
      setError(null);
      await membershipOptionsApi.delete(optionId);
      setSuccess('Membership option deleted successfully');
      await fetchOptions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete membership option');
    }
  };

  const moveUp = async (option, index) => {
    if (index === 0) return;

    try {
      const prevOption = options[index - 1];
      
      await membershipOptionsApi.update(option.id, { display_order: prevOption.display_order });
      await membershipOptionsApi.update(prevOption.id, { display_order: option.display_order });
      
      await fetchOptions();
      setSuccess('Order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder membership options');
    }
  };

  const moveDown = async (option, index) => {
    if (index === options.length - 1) return;

    try {
      const nextOption = options[index + 1];
      
      await membershipOptionsApi.update(option.id, { display_order: nextOption.display_order });
      await membershipOptionsApi.update(nextOption.id, { display_order: option.display_order });
      
      await fetchOptions();
      setSuccess('Order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder membership options');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOption(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      is_active: true,
      display_order: 0,
    });
  };

  if (loading) {
    return <div className="loading">Loading membership options...</div>;
  }

  return (
    <div className="membership-options-management">
      <div className="section-header">
        <h2>Membership Options Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add New Option
          </button>
        )}
      </div>

      <div className="info-banner">
        <strong>💳 Membership Options:</strong> Configure the membership types and prices that users can select when signing up. These options will appear on the signup page.
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editingOption ? 'Edit Membership Option' : 'Add New Membership Option'}</h3>
          <form onSubmit={handleSubmit} className="option-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Membership Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Single Membership, Family Membership"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="40.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                placeholder="Brief description of this membership option..."
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span>Active (visible on signup page)</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingOption ? 'Update Option' : 'Add Option'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="options-list">
        {options.length === 0 ? (
          <div className="empty-state">
            No membership options yet. Click "Add New Option" to get started.
          </div>
        ) : (
          <div className="options-grid">
            {options.map((option, index) => (
              <div key={option.id} className={`option-card ${!option.is_active ? 'inactive' : ''}`}>
                <div className="option-order-controls">
                  <button
                    onClick={() => moveUp(option, index)}
                    disabled={index === 0}
                    className="order-btn"
                    title="Move up"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <span className="order-number">#{index + 1}</span>
                  <button
                    onClick={() => moveDown(option, index)}
                    disabled={index === options.length - 1}
                    className="order-btn"
                    title="Move down"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                <div className="option-content">
                  <div className="option-info">
                    <h4>{option.name}</h4>
                    <p className="option-price">${Number(option.price).toFixed(2)}</p>
                    {option.description && <p className="option-description">{option.description}</p>}
                    {!option.is_active && <span className="inactive-badge">Inactive</span>}
                  </div>

                  <div className="option-actions">
                    <button onClick={() => handleEdit(option)} className="btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(option.id, option.name)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .membership-options-management {
          padding: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.75rem;
          color: var(--text-primary);
          margin: 0;
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

        .error-message, .success-message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease-out;
        }

        .error-message {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .success-message {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #86efac;
        }

        .form-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .form-card h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .options-grid {
          display: grid;
          gap: 1.5rem;
        }

        .option-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 1rem;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .option-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .option-card.inactive {
          opacity: 0.6;
          background: #f9fafb;
        }

        .option-order-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #f9fafb;
          gap: 0.5rem;
          min-width: 60px;
        }

        .order-btn {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--primary);
          transition: all 0.2s;
        }

        .order-btn:hover:not(:disabled) {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .order-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .order-number {
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
        }

        .option-content {
          flex: 1;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1.5rem;
          align-items: start;
        }

        .option-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .option-price {
          color: #059669;
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
        }

        .option-description {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .inactive-badge {
          display: inline-block;
          background: #fef3c7;
          color: #92400e;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 0.5rem;
        }

        .option-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit, .btn-delete {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-edit {
          color: var(--primary);
        }

        .btn-edit:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .btn-delete {
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #dc2626;
          color: white;
          border-color: #dc2626;
        }

        .empty-state, .loading {
          padding: 3rem;
          text-align: center;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 12px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .option-content {
            grid-template-columns: 1fr;
          }

          .option-card {
            flex-direction: column;
          }

          .option-order-controls {
            flex-direction: row;
          }

          .option-actions {
            width: 100%;
          }

          .btn-edit, .btn-delete {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MembershipOptionsManagement;