import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/api';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('guest-rate');

  // Guest rate state
  const [currentRate, setCurrentRate] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [rateLoading, setRateLoading] = useState(true);
  const [rateError, setRateError] = useState(null);
  const [rateMessage, setRateMessage] = useState(null);
  const [rateSaving, setRateSaving] = useState(false);

  // Refund state
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState(null);
  const [refundMessage, setRefundMessage] = useState(null);
  const [confirmRefund, setConfirmRefund] = useState(false);

  // Mark registration paid state
  const [regId, setRegId] = useState('');
  const [regAmount, setRegAmount] = useState('');
  const [regNote, setRegNote] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regMessage, setRegMessage] = useState(null);

  // Mark membership paid state
  const [memUserId, setMemUserId] = useState('');
  const [memTierId, setMemTierId] = useState('');
  const [memNote, setMemNote] = useState('');
  const [memLoading, setMemLoading] = useState(false);
  const [memError, setMemError] = useState(null);
  const [memMessage, setMemMessage] = useState(null);
  const [tiers, setTiers] = useState([]);

  const fetchGuestRate = useCallback(async () => {
    try {
      setRateLoading(true);
      setRateError(null);
      const data = await adminApi.getGuestRate();
      setCurrentRate(data.rate != null ? data.rate : data.guest_event_rate);
    } catch (err) {
      setRateError(err.message || 'Failed to load guest rate');
    } finally {
      setRateLoading(false);
    }
  }, []);

  const fetchTiers = useCallback(async () => {
    try {
      const data = await adminApi.getMembershipTiers();
      const tierList = Array.isArray(data) ? data : data.tiers || [];
      setTiers(tierList.filter((t) => t.is_active !== false));
    } catch (err) {
      // Non-critical — tiers dropdown just won't populate
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchGuestRate();
    fetchTiers();
  }, [user, navigate, fetchGuestRate, fetchTiers]);

  // Auto-clear messages
  useEffect(() => {
    const msgs = [rateMessage, refundMessage, regMessage, memMessage];
    const timers = [];
    if (rateMessage) timers.push(setTimeout(() => setRateMessage(null), 4000));
    if (refundMessage) timers.push(setTimeout(() => setRefundMessage(null), 4000));
    if (regMessage) timers.push(setTimeout(() => setRegMessage(null), 4000));
    if (memMessage) timers.push(setTimeout(() => setMemMessage(null), 4000));
    return () => timers.forEach(clearTimeout);
  }, [rateMessage, refundMessage, regMessage, memMessage]);

  // Guest Rate handlers
  const handleUpdateRate = async (e) => {
    e.preventDefault();
    if (!newRate || parseFloat(newRate) < 0) {
      setRateError('Rate must be a positive number');
      return;
    }
    try {
      setRateSaving(true);
      setRateError(null);
      await adminApi.updateGuestRate(parseFloat(newRate));
      setCurrentRate(parseFloat(newRate));
      setNewRate('');
      setRateMessage('Guest rate updated successfully');
    } catch (err) {
      setRateError(err.message || 'Failed to update guest rate');
    } finally {
      setRateSaving(false);
    }
  };

  // Refund handler
  const handleRefund = async () => {
    if (!refundPaymentId) {
      setRefundError('Payment ID is required');
      return;
    }
    try {
      setRefundLoading(true);
      setRefundError(null);
      await adminApi.refundPayment(refundPaymentId);
      setRefundMessage(`Payment #${refundPaymentId} refunded successfully`);
      setRefundPaymentId('');
      setConfirmRefund(false);
    } catch (err) {
      setRefundError(err.message || 'Failed to process refund');
      setConfirmRefund(false);
    } finally {
      setRefundLoading(false);
    }
  };

  // Mark registration paid handler
  const handleMarkRegPaid = async (e) => {
    e.preventDefault();
    if (!regId) {
      setRegError('Registration ID is required');
      return;
    }
    try {
      setRegLoading(true);
      setRegError(null);
      await adminApi.markRegistrationPaid(regId, {
        amount: regAmount ? parseFloat(regAmount) : undefined,
        note: regNote || undefined,
      });
      setRegMessage(`Registration #${regId} marked as paid`);
      setRegId('');
      setRegAmount('');
      setRegNote('');
    } catch (err) {
      setRegError(err.message || 'Failed to mark registration as paid');
    } finally {
      setRegLoading(false);
    }
  };

  // Mark membership paid handler
  const handleMarkMemPaid = async (e) => {
    e.preventDefault();
    if (!memUserId) {
      setMemError('User ID is required');
      return;
    }
    if (!memTierId) {
      setMemError('Membership tier is required');
      return;
    }
    try {
      setMemLoading(true);
      setMemError(null);
      await adminApi.markMembershipPaid(memUserId, {
        tier_id: parseInt(memTierId, 10),
        note: memNote || undefined,
      });
      setMemMessage(`Membership for user #${memUserId} marked as paid`);
      setMemUserId('');
      setMemTierId('');
      setMemNote('');
    } catch (err) {
      setMemError(err.message || 'Failed to mark membership as paid');
    } finally {
      setMemLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment Management</h1>
        <p className="page-subtitle">Guest rates, refunds, and manual payments</p>
      </div>

      <div className="admin-section-tabs">
        <button
          className={`admin-tab-btn ${activeSection === 'guest-rate' ? 'active' : ''}`}
          onClick={() => setActiveSection('guest-rate')}
        >
          Guest Rate
        </button>
        <button
          className={`admin-tab-btn ${activeSection === 'refund' ? 'active' : ''}`}
          onClick={() => setActiveSection('refund')}
        >
          Refunds
        </button>
        <button
          className={`admin-tab-btn ${activeSection === 'mark-reg-paid' ? 'active' : ''}`}
          onClick={() => setActiveSection('mark-reg-paid')}
        >
          Mark Registration Paid
        </button>
        <button
          className={`admin-tab-btn ${activeSection === 'mark-mem-paid' ? 'active' : ''}`}
          onClick={() => setActiveSection('mark-mem-paid')}
        >
          Mark Membership Paid
        </button>
      </div>

      {/* Guest Rate Section */}
      {activeSection === 'guest-rate' && (
        <div className="admin-section-content">
          <div className="admin-card">
            <h2>Guest Event Rate</h2>
            {rateMessage && <div className="message success">{rateMessage}</div>}
            {rateError && <div className="message error">{rateError}</div>}
            {rateLoading ? (
              <p>Loading rate...</p>
            ) : (
              <>
                <p className="current-rate-display">
                  Current Rate: <strong>${currentRate != null ? parseFloat(currentRate).toFixed(2) : '—'}</strong>
                </p>
                <form onSubmit={handleUpdateRate} className="admin-inline-form">
                  <div className="form-group">
                    <label htmlFor="new-rate">New Rate ($)</label>
                    <input
                      id="new-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      placeholder="85.00"
                      required
                    />
                  </div>
                  <button type="submit" className="primary-btn" disabled={rateSaving}>
                    {rateSaving ? 'Saving...' : 'Update Rate'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Refund Section */}
      {activeSection === 'refund' && (
        <div className="admin-section-content">
          <div className="admin-card">
            <h2>Process Refund</h2>
            {refundMessage && <div className="message success">{refundMessage}</div>}
            {refundError && <div className="message error">{refundError}</div>}
            <div className="admin-inline-form">
              <div className="form-group">
                <label htmlFor="refund-payment-id">Payment ID</label>
                <input
                  id="refund-payment-id"
                  type="text"
                  value={refundPaymentId}
                  onChange={(e) => setRefundPaymentId(e.target.value)}
                  placeholder="Enter payment ID"
                />
              </div>
              {!confirmRefund ? (
                <button
                  className="danger-btn"
                  onClick={() => {
                    if (!refundPaymentId) {
                      setRefundError('Payment ID is required');
                      return;
                    }
                    setRefundError(null);
                    setConfirmRefund(true);
                  }}
                  disabled={refundLoading}
                >
                  Refund
                </button>
              ) : (
                <div className="confirm-inline">
                  <span>Confirm refund for payment #{refundPaymentId}?</span>
                  <button className="danger-btn" onClick={handleRefund} disabled={refundLoading}>
                    {refundLoading ? 'Processing...' : 'Yes, Refund'}
                  </button>
                  <button className="secondary-btn" onClick={() => setConfirmRefund(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mark Registration Paid Section */}
      {activeSection === 'mark-reg-paid' && (
        <div className="admin-section-content">
          <div className="admin-card">
            <h2>Mark Registration as Paid</h2>
            {regMessage && <div className="message success">{regMessage}</div>}
            {regError && <div className="message error">{regError}</div>}
            <form onSubmit={handleMarkRegPaid} className="admin-form">
              <div className="form-group">
                <label htmlFor="reg-id">Registration ID</label>
                <input
                  id="reg-id"
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder="Enter registration ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-amount">Amount ($)</label>
                <input
                  id="reg-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={regAmount}
                  onChange={(e) => setRegAmount(e.target.value)}
                  placeholder="75.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-note">Note (optional)</label>
                <input
                  id="reg-note"
                  type="text"
                  value={regNote}
                  onChange={(e) => setRegNote(e.target.value)}
                  placeholder="e.g. Cash payment"
                />
              </div>
              <button type="submit" className="primary-btn" disabled={regLoading}>
                {regLoading ? 'Saving...' : 'Mark as Paid'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mark Membership Paid Section */}
      {activeSection === 'mark-mem-paid' && (
        <div className="admin-section-content">
          <div className="admin-card">
            <h2>Mark Membership as Paid</h2>
            {memMessage && <div className="message success">{memMessage}</div>}
            {memError && <div className="message error">{memError}</div>}
            <form onSubmit={handleMarkMemPaid} className="admin-form">
              <div className="form-group">
                <label htmlFor="mem-user-id">User ID</label>
                <input
                  id="mem-user-id"
                  type="text"
                  value={memUserId}
                  onChange={(e) => setMemUserId(e.target.value)}
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="mem-tier">Membership Tier</label>
                <select
                  id="mem-tier"
                  value={memTierId}
                  onChange={(e) => setMemTierId(e.target.value)}
                  required
                >
                  <option value="">Select a tier</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — ${parseFloat(tier.amount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="mem-note">Note (optional)</label>
                <input
                  id="mem-note"
                  type="text"
                  value={memNote}
                  onChange={(e) => setMemNote(e.target.value)}
                  placeholder="e.g. Complimentary membership"
                />
              </div>
              <button type="submit" className="primary-btn" disabled={memLoading}>
                {memLoading ? 'Saving...' : 'Save Membership Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Refund Confirmation Dialog */}
      {confirmRefund && (
        <div className="sr-only" aria-live="assertive">
          Confirm refund for payment {refundPaymentId}
        </div>
      )}
    </div>
  );
}
