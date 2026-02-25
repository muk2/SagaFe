import React, { useState, useEffect, useRef } from 'react';
import { faqApi } from '../../lib/api';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true,
  });

  const formRef = useRef(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await faqApi.getAllAdmin();
      setFaqs(data);
    } catch (err) {
      setError(err.message || 'Failed to load FAQs');
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

      if (editingFaq) {
        await faqApi.update(editingFaq.id, formData);
        setSuccess('FAQ updated successfully');
      } else {
        await faqApi.create(formData);
        setSuccess('FAQ created successfully');
      }

      await fetchFaqs();

      setShowForm(false);
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        display_order: 0,
        is_active: true,
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active,
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

  const handleDelete = async (faqId, question) => {
    if (!window.confirm(`Are you sure you want to delete the FAQ: "${question}"?`)) {
      return;
    }

    try {
      setError(null);
      await faqApi.delete(faqId);
      setSuccess('FAQ deleted successfully');
      await fetchFaqs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete FAQ');
    }
  };

  // ✅ Move FAQ up (decrease display_order)
  const moveUp = async (faq, index) => {
    if (index === 0) return; // Already at top

    try {
      const prevFaq = faqs[index - 1];
      
      // Swap display orders
      await faqApi.update(faq.id, { display_order: prevFaq.display_order });
      await faqApi.update(prevFaq.id, { display_order: faq.display_order });
      
      await fetchFaqs();
      setSuccess('FAQ order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder FAQ');
    }
  };

  // ✅ Move FAQ down (increase display_order)
  const moveDown = async (faq, index) => {
    if (index === faqs.length - 1) return; // Already at bottom

    try {
      const nextFaq = faqs[index + 1];
      
      // Swap display orders
      await faqApi.update(faq.id, { display_order: nextFaq.display_order });
      await faqApi.update(nextFaq.id, { display_order: faq.display_order });
      
      await fetchFaqs();
      setSuccess('FAQ order updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to reorder FAQ');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      display_order: 0,
      is_active: true,
    });
  };

  if (loading) {
    return <div className="loading">Loading FAQs...</div>;
  }

  return (
    <div className="faq-management">
      <div className="section-header">
        <h2>FAQ Management</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add New FAQ
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="faq-form-card" ref={formRef}>
          <h3>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
          <form onSubmit={handleSubmit} className="faq-form">
            <div className="form-group">
              <label htmlFor="question">Question *</label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                placeholder="e.g., How do I become a SAGA member?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="answer">Answer *</label>
              <textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Provide a clear and concise answer..."
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
                <span>&nbsp;&nbsp;Active (visible on contact page)</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="faqs-list">
        <h3>All FAQs ({faqs.length})</h3>
        <p className="help-text">Use the arrows to reorder FAQs. Items at the top appear first on the contact page.</p>
        
        {faqs.length === 0 ? (
          <div className="empty-state">
            No FAQs yet. Create your first FAQ to get started.
          </div>
        ) : (
          <div className="faqs-grid">
            {faqs.map((faq, index) => (
              <div key={faq.id} className={`faq-card ${!faq.is_active ? 'inactive' : ''}`}>
                {/* ✅ Order controls on the left */}
                <div className="faq-order-controls">
                  <button
                    onClick={() => moveUp(faq, index)}
                    disabled={index === 0}
                    className="order-btn"
                    title="Move up"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <span className="order-number">#{faq.display_order}</span>
                  <button
                    onClick={() => moveDown(faq, index)}
                    disabled={index === faqs.length - 1}
                    className="order-btn"
                    title="Move down"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* FAQ content */}
                <div className="faq-card-content">
                  <div className="faq-header">
                    {!faq.is_active && <span className="inactive-badge">Inactive</span>}
                  </div>
                  <div className="faq-content">
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                  </div>
                  <div className="faq-actions">
                    <button onClick={() => handleEdit(faq)} className="btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id, faq.question)}
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
        .faq-management {
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

        .help-text {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
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

        .faq-form-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          scroll-margin-top: 2rem;
        }

        .faq-form-card h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
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
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
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

        .faqs-list h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .faqs-grid {
          display: grid;
          gap: 1.5rem;
        }

        /* ✅ FAQ card with order controls */
        .faq-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 2px solid transparent;
          transition: all 0.2s;
          display: flex;
          gap: 1rem;
        }

        .faq-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .faq-card.inactive {
          opacity: 0.6;
          background: #f9fafb;
        }

        /* ✅ Order controls column */
        .faq-order-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px 0 0 12px;
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
          transform: scale(1.1);
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

        /* FAQ content area */
        .faq-card-content {
          flex: 1;
          padding: 1.5rem 1.5rem 1.5rem 0;
        }

        .faq-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .inactive-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .faq-content h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .faq-content p {
          margin: 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .faq-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
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
          .form-actions {
            flex-direction: column;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
          }

          .faq-card {
            flex-direction: column;
          }

          .faq-order-controls {
            flex-direction: row;
            border-radius: 12px 12px 0 0;
            padding: 0.75rem;
          }

          .faq-card-content {
            padding: 0 1.5rem 1.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQManagement;