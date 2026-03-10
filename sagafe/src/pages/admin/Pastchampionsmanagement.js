import React, { useState, useEffect, useRef } from 'react';
import { pastChampionsApi } from '../../lib/api';

const PastChampionsManagement = () => {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingChampion, setEditingChampion] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchChampions();
  }, []);

  const fetchChampions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pastChampionsApi.getAllAdmin();
      setChampions(data);
    } catch (err) {
      setError(err.message || 'Failed to load past champions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' ? parseInt(value, 10) || '' : value,
    });
  };

  const resetForm = () => {
    setFormData({ name: '', year: new Date().getFullYear() });
    setEditingChampion(null);
    setShowForm(false);
  };

  const handleEdit = (champion) => {
    setEditingChampion(champion);
    setFormData({
      name: champion.name,
      year: champion.year,
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        name: formData.name.trim(),
        year: parseInt(formData.year, 10),
      };

      if (editingChampion) {
        await pastChampionsApi.update(editingChampion.id, payload);
        setSuccess('Past champion updated successfully!');
      } else {
        await pastChampionsApi.create(payload);
        setSuccess('Past champion added successfully!');
      }

      resetForm();
      await fetchChampions();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save past champion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (championId, championName, championYear) => {
    if (!window.confirm(`Delete ${championName} (${championYear}) from past champions?`)) return;

    try {
      setError(null);
      await pastChampionsApi.delete(championId);
      setSuccess('Past champion deleted successfully!');
      await fetchChampions();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete past champion');
    }
  };

  if (loading) {
    return <div className="loading">Loading past champions...</div>;
  }

  return (
    <div className="past-champions-management">
      <div className="section-header">
        <h2 className="admin-section-title">Past Champions</h2>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Champion
        </button>
      </div>

      <div className="info-banner">
        <strong>Manage SAGA Champions History:</strong> Add or update past SAGA Tour champions.
        Each year can only have one winner. These are displayed on the SAGA Tour page.
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="form-card" ref={formRef}>
          <h3>{editingChampion ? 'Edit Past Champion' : 'Add New Past Champion'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Champion Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Raj Patel"
                />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2000"
                  max="2099"
                  placeholder="e.g., 2025"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editingChampion ? 'Update Champion' : 'Add Champion'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Champions Table */}
      {champions.length === 0 ? (
        <div className="empty-state">
          <p>No past champions recorded yet. Click "Add Champion" to add one.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Champion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {champions.map((champion) => (
                <tr key={champion.id}>
                  <td className="year-cell">{champion.year}</td>
                  <td className="name-cell">{champion.name}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(champion)}>Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(champion.id, champion.name, champion.year)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .past-champions-management {
          padding: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .admin-section-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .info-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .success-message {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        /* Form Card */
        .form-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-card h3 {
          margin: 0 0 1.25rem 0;
          font-size: 1.15rem;
          color: #1f2937;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
          font-size: 0.9rem;
        }

        .form-group input[type="text"],
        .form-group input[type="number"] {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* Buttons */
        .btn-primary {
          background: #0d9488;
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #0f766e;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 0.6rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #f3f4f6;
        }

        /* Table */
        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .data-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
        }

        .data-table tbody tr:hover {
          background: #f9fafb;
        }

        .year-cell {
          font-weight: 700;
          color: #0d9488 !important;
          font-size: 1rem;
        }

        .name-cell {
          font-weight: 600;
          color: #1f2937 !important;
        }

        .actions-cell {
          white-space: nowrap;
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-edit:hover {
          background: #dbeafe;
        }

        .btn-delete {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-delete:hover {
          background: #fee2e2;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #9ca3af;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px dashed #e5e7eb;
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PastChampionsManagement;