import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/api';

export default function AdminMembershipTiersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    sort_order: '',
    is_active: true,
  });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deactivation confirmation
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const fetchTiers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getMembershipTiers();
      setTiers(Array.isArray(data) ? data : data.tiers || []);
    } catch (err) {
      setError(err.message || 'Failed to load membership tiers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchTiers();
  }, [user, navigate, fetchTiers]);

  const openCreateModal = () => {
    setEditingTier(null);
    setFormData({ name: '', amount: '', description: '', sort_order: '', is_active: true });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (tier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      amount: String(tier.amount),
      description: tier.description || '',
      sort_order: String(tier.sort_order || ''),
      is_active: tier.is_active !== false,
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTier(null);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) < 0) {
      setFormError('Amount must be 0 or greater');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      sort_order: formData.sort_order ? parseInt(formData.sort_order, 10) : 0,
      is_active: formData.is_active,
    };

    try {
      setSaving(true);
      if (editingTier) {
        await adminApi.updateMembershipTier(editingTier.id, payload);
        setMessage('Tier updated successfully');
      } else {
        await adminApi.createMembershipTier(payload);
        setMessage('Tier created successfully');
      }
      closeModal();
      await fetchTiers();
    } catch (err) {
      setFormError(err.message || 'Failed to save tier');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (tier) => {
    try {
      await adminApi.deactivateMembershipTier(tier.id);
      setMessage(`"${tier.name}" has been deactivated`);
      setConfirmDeactivate(null);
      await fetchTiers();
    } catch (err) {
      setError(err.message || 'Failed to deactivate tier');
      setConfirmDeactivate(null);
    }
  };

  const handleReactivate = async (tier) => {
    try {
      await adminApi.updateMembershipTier(tier.id, { ...tier, is_active: true });
      setMessage(`"${tier.name}" has been reactivated`);
      await fetchTiers();
    } catch (err) {
      setError(err.message || 'Failed to reactivate tier');
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Membership Tiers</h1>
        <p className="page-subtitle">Manage membership tier options and pricing</p>
      </div>

      {message && <div className="message success">{message}</div>}
      {error && !loading && <div className="message error">{error}</div>}

      <div className="admin-actions-bar">
        <button className="primary-btn" onClick={openCreateModal}>+ Add Tier</button>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading tiers...</p>
        </div>
      )}

      {!loading && !error && tiers.length === 0 && (
        <div className="empty-state">
          <p>No membership tiers configured yet.</p>
        </div>
      )}

      {!loading && tiers.length > 0 && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className={tier.is_active === false ? 'inactive-row' : ''}>
                  <td>{tier.sort_order}</td>
                  <td>{tier.name}</td>
                  <td>${parseFloat(tier.amount).toFixed(2)}</td>
                  <td>{tier.description}</td>
                  <td>
                    <span className={`admin-status-badge ${tier.is_active === false ? 'inactive' : 'active'}`}>
                      {tier.is_active === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="admin-actions-cell">
                    <button className="admin-btn edit" onClick={() => openEditModal(tier)}>
                      Edit
                    </button>
                    {tier.is_active === false ? (
                      <button className="admin-btn reactivate" onClick={() => handleReactivate(tier)}>
                        Reactivate
                      </button>
                    ) : (
                      <button className="admin-btn deactivate" onClick={() => setConfirmDeactivate(tier)}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deactivation Confirmation Dialog */}
      {confirmDeactivate && (
        <div className="modal-overlay" onClick={() => setConfirmDeactivate(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Deactivate Tier</h2>
            <p>
              Are you sure you want to deactivate <strong>"{confirmDeactivate.name}"</strong>?
              It will no longer appear in the membership dropdown for users.
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setConfirmDeactivate(null)}>
                Cancel
              </button>
              <button className="danger-btn" onClick={() => handleDeactivate(confirmDeactivate)}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content tier-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTier ? 'Edit Membership Tier' : 'Create Membership Tier'}</h2>
            {formError && <div className="message error">{formError}</div>}
            <form onSubmit={handleSave} className="tier-form">
              <div className="form-group">
                <label htmlFor="tier-name">Name</label>
                <input
                  id="tier-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Individual"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="tier-amount">Amount ($)</label>
                <input
                  id="tier-amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleFormChange}
                  placeholder="150.00"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="tier-description">Description</label>
                <input
                  id="tier-description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Full membership benefits"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tier-sort-order">Sort Order</label>
                <input
                  id="tier-sort-order"
                  name="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={handleFormChange}
                  placeholder="1"
                />
              </div>
              {editingTier && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                    />
                    Active
                  </label>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
