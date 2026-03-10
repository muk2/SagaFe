import React, { useState, useEffect } from 'react';
import { usersApi, membershipOptionsApi } from '../../lib/api';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  membership: '',
  role: 'user',
  handicap: '',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [membershipOptions, setMembershipOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMembershipOptions();
  }, []);

  const fetchMembershipOptions = async () => {
    try {
      const data = await membershipOptionsApi.getAll();
      setMembershipOptions(data);
    } catch (err) {
      console.error('Failed to load membership options:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    try {
      setError(null);
      setSuccess(null);
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await usersApi.updateRole(userId, newRole);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) return;
    try {
      setError(null);
      setSuccess(null);
      await usersApi.delete(userId);
      setUsers(users.filter(user => user.id !== userId));
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (555) 555-5555
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };
  
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone_number: formatted });
  };

  const handleOpenModal = () => {
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleHandicapChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, handicap: value }));
      return;
    }
    
    const regex = /^-?\d*\.?\d{0,1}$/;
    if (regex.test(value)) {
      const numValue = parseFloat(value);
      if (value === '-' || value === '.' || value.endsWith('.') || 
          (!isNaN(numValue) && numValue >= -10 && numValue <= 30)) {
            setFormData(prev => ({ ...prev, handicap: value }));
      }
    }
  };

  const handleHandicapBlur = (e) => {
    const value = e.target.value;
    if (value.endsWith('.')) {
      setFormData(prev => ({ ...prev, handicap: value.slice(0, -1) }));
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData(EMPTY_FORM);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setFormError('First and last name are required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required.');
      return;
    }
    if (!formData.phone_number.trim()) {
      setFormError('Phone number is required.');
      return;
    }
    if (!formData.membership) {
      setFormError('Please select a membership type.');
      return;
    }

    setCreating(true);
    try {
      const newUser = await usersApi.create({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        membership: formData.membership,
        role: formData.role,
        handicap: formData.handicap.trim() || null,
      });
      setUsers([...users, newUser]);
      handleCloseModal();
      setSuccess(`User ${formData.first_name} ${formData.last_name} created. A password setup email has been sent to ${formData.email}.`);
      setTimeout(() => setSuccess(null), 6000);
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="user-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>User Management</h2>
        <button className="btn-primary" onClick={handleOpenModal}>
          + Add User
        </button>
      </div>

      {error   && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role !== 'admin').length}</div>
          <div className="stat-label">Members</div>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Handicap</th>
            <th>Membership</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><strong>{user.first_name} {user.last_name}</strong></td>
              <td>{user.email}</td>
              <td>{user.phone_number || 'N/A'}</td>
              <td>{user.handicap || user.golf_handicap || 'N/A'}</td>
              <td>{user.membership || 'N/A'}</td>
              <td>
                <label className="role-toggle">
                  <input
                    type="checkbox"
                    checked={user.role === 'admin'}
                    onChange={() => handleRoleToggle(user.id, user.role)}
                  />
                  <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </label>
              </td>
              <td>
                <button
                  onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                  className="btn-danger btn-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && <div className="empty-state">No users found</div>}

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>

            <p className="modal-subtitle">
              The new user will receive an email to set up their password.
            </p>

            {formError && (
              <div className="form-error-banner">{formError}</div>
            )}

            <form onSubmit={handleCreateUser} className="add-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleFormChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleFormChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  placeholder="(609) 555-0123"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Membership *</label>
                  <select
                    name="membership"
                    value={formData.membership}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select membership...</option>
                    {membershipOptions.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Handicap <span className="optional">(optional)</span></label>
                <input
                  name="handicap"
                  type="text"
                  value={formData.handicap}
                  onChange={handleHandicapChange}
                  onBlur={handleHandicapBlur}
                  placeholder="e.g. 12.4"
                  inputMode="decimal"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create User & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .users-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .role-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .role-toggle input { cursor: pointer; }
        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        .role-badge.admin { background: #fef3c7; color: #92400e; }
        .role-badge.user  { background: #e0e7ff; color: #3730a3; }
        .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.85rem; }
        .btn-primary {
          background: var(--primary, #0d9488);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover:not(:disabled) { background: var(--primary-dark, #0f766e); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
          font-size: 1.1rem;
        }
        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: #64748b;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        .modal-close:hover { background: #f1f5f9; }
        .modal-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        .form-error-banner {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #991b1b;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .add-user-form .form-group {
          margin-bottom: 1rem;
        }
        .add-user-form .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
        }
        .optional {
          font-weight: 400;
          color: #9ca3af;
          font-size: 0.8rem;
        }
        .add-user-form input,
        .add-user-form select {
          width: 100%;
          padding: 0.6rem 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          color: #0f172a;
          background: white;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .add-user-form input:focus,
        .add-user-form select:focus {
          border-color: var(--primary, #0d9488);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #e5e7eb;
        }
        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr; }
          .modal-actions { flex-direction: column-reverse; }
          .modal-actions button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;