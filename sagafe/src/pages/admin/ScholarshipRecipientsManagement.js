import React, { useState, useEffect, useRef } from 'react';
import { scholarshipRecipientsApi } from '../../lib/api';

const ScholarshipRecipientsManagement = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: '',
    year: new Date().getFullYear(),
    display_order: 0,
  });

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scholarshipRecipientsApi.getAllAdmin();
      setRecipients(data);
    } catch (err) {
      setError(err.message || 'Failed to load scholarship recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      const dataToSend = {
        full_name: formData.full_name,
        year: parseInt(formData.year),
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingRecipient) {
        await scholarshipRecipientsApi.update(editingRecipient.id, dataToSend);
        setSuccess('Recipient updated successfully');
      } else {
        await scholarshipRecipientsApi.create(dataToSend);
        setSuccess('Recipient added successfully');
      }

      await fetchRecipients();
      handleCancel();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save recipient');
    }
  };

  const handleEdit = (recipient) => {
    setEditingRecipient(recipient);
    setFormData({
      full_name: recipient.full_name,
      year: recipient.year,
      display_order: recipient.display_order || 0,
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

  const handleDelete = async (recipientId, recipientName) => {
    if (!window.confirm(`Are you sure you want to delete ${recipientName}?`)) {
      return;
    }

    try {
      setError(null);
      await scholarshipRecipientsApi.delete(recipientId);
      setSuccess('Recipient deleted successfully');
      await fetchRecipients();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete recipient');
    }
  };

  const moveUp = async (recipient, index) => {
    if (index === 0) return;

    try {
      const prevRecipient = recipients[index - 1];
      
      await scholarshipRecipientsApi.update(recipient.id, { display_order: prevRecipient.display_order });
      await scholarshipRecipientsApi.update(prevRecipient.id, { display_order: recipient.display_order });
      
      await fetchRecipients();
      setSuccess('Order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder recipients');
    }
  };

  const moveDown = async (recipient, index) => {
    if (index === recipients.length - 1) return;

    try {
      const nextRecipient = recipients[index + 1];
      
      await scholarshipRecipientsApi.update(recipient.id, { display_order: nextRecipient.display_order });
      await scholarshipRecipientsApi.update(nextRecipient.id, { display_order: recipient.display_order });
      
      await fetchRecipients();
      setSuccess('Order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder recipients');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecipient(null);
    setFormData({
      full_name: '',
      year: new Date().getFullYear(),
      display_order: 0,
    });
  };

  // Group recipients by year
  const recipientsByYear = recipients.reduce((acc, recipient) => {
    const year = recipient.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(recipient);
    return acc;
  }, {});

  const years = Object.keys(recipientsByYear).sort((a, b) => b - a);

  if (loading) {
    return <div className="loading">Loading scholarship recipients...</div>;
  }

  return (
    <div className="recipients-management">
      <div className="section-header">
        <h2>Scholarship Recipients Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add New Recipient
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="form-card" ref={formRef}>
          <h3>{editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}</h3>
          <form onSubmit={handleSubmit} className="recipient-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2000"
                  max="2100"
                />
              </div>
            </div>


            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="recipients-list">
        {recipients.length === 0 ? (
          <div className="empty-state">
            No scholarship recipients yet. Click "Add New Recipient" to get started.
          </div>
        ) : (
          years.map((year) => (
            <div key={year} className="year-section">
              <h3 className="year-header">{year} Recipients ({recipientsByYear[year].length})</h3>
              <div className="recipients-grid">
                {recipientsByYear[year].map((recipient, yearIndex) => {
                  const globalIndex = recipients.findIndex(r => r.id === recipient.id);
                  const isFirstInYear = yearIndex === 0;
                  const isLastInYear = yearIndex === recipientsByYear[year].length - 1;
                  const positionInYear = yearIndex + 1; // 1-based position within year
                  
                  return (
                    <div key={recipient.id} className="recipient-card">
                      <div className="recipient-order-controls">
                        <button
                          onClick={() => moveUp(recipient, globalIndex)}
                          disabled={isFirstInYear}
                          className="order-btn"
                          title="Move up"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="18 15 12 9 6 15"/>
                          </svg>
                        </button>
                        <span className="order-number">#{positionInYear}</span>
                        <button
                          onClick={() => moveDown(recipient, globalIndex)}
                          disabled={isLastInYear}
                          className="order-btn"
                          title="Move down"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                      </div>

                      <div className="recipient-content">
                        <div className="recipient-info">
                          <h4>{recipient.full_name}</h4>
                          <p className="recipient-year">Class of {recipient.year}</p>
                        </div>

                        <div className="recipient-actions">
                          <button onClick={() => handleEdit(recipient)} className="btn-edit">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(recipient.id, recipient.full_name)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .recipients-management {
          padding: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-size: 1.75rem;
          color: var(--text-primary);
          margin: 0;
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

        .recipient-form .form-row {
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

        .form-group textarea {
          resize: vertical;
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

        .year-section {
          margin-bottom: 3rem;
        }

        .year-header {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--primary);
        }

        .recipients-grid {
          display: grid;
          gap: 1.5rem;
        }

        .recipient-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 1rem;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .recipient-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .recipient-order-controls {
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

        .recipient-content {
          flex: 1;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1.5rem;
          align-items: start;
        }

        .recipient-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .recipient-year {
          color: var(--primary);
          font-weight: 600;
          margin: 0 0 0.75rem 0;
        }


        .recipient-actions {
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
            grid-template-columns: 1fr !important;
          }

          .recipient-content {
            grid-template-columns: 1fr;
          }

          .recipient-card {
            flex-direction: column;
          }

          .recipient-order-controls {
            flex-direction: row;
          }

          .recipient-actions {
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

export default ScholarshipRecipientsManagement;