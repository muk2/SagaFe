import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { membershipsApi } from '../lib/api';

function generateIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function MembershipPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data state
  const [tiers, setTiers] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Form state
  const [selectedTierId, setSelectedTierId] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'confirmation'
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoadingData(true);
        const [tiersData, statusData] = await Promise.all([
          membershipsApi.getTiers(),
          membershipsApi.getStatus(),
        ]);
        setTiers(tiersData.tiers || tiersData || []);
        setMembershipStatus(statusData);

        // Pre-select first tier
        const activeTiers = (tiersData.tiers || tiersData || []);
        if (activeTiers.length > 0) {
          setSelectedTierId(String(activeTiers[0].id));
        }
      } catch (err) {
        setDataError(err.message || 'Failed to load membership data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const selectedTier = tiers.find((t) => String(t.id) === selectedTierId);

  const handlePaymentToken = useCallback(
    async (token) => {
      setLoading(true);
      setPaymentError('');

      try {
        const response = await membershipsApi.pay({
          tier_id: parseInt(selectedTierId, 10),
          payment_token: token,
          idempotency_key: generateIdempotencyKey(),
        });

        setConfirmationData(response);
        setStep('confirmation');
      } catch (err) {
        setPaymentError(err.message || 'Payment failed. Please try a different card.');
      } finally {
        setLoading(false);
      }
    },
    [selectedTierId]
  );

  const handlePaymentError = useCallback((msg) => {
    setPaymentError(msg);
  }, []);

  if (loadingData) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Loading membership information...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>SAGA Membership</h1>
        </div>
        <div className="empty-state">
          <p>{dataError}</p>
        </div>
      </div>
    );
  }

  // Active membership view
  if (membershipStatus?.has_active_membership) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>SAGA Membership</h1>
        </div>
        <div className="membership-card">
          <div className="membership-active">
            <div className="membership-active-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Your membership is active</h2>
            <div className="membership-details">
              <div className="info-row">
                <span className="info-label">Tier:</span>
                <span>{membershipStatus.tier_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Season:</span>
                <span>{membershipStatus.season || new Date().getFullYear()}</span>
              </div>
              {membershipStatus.paid_date && (
                <div className="info-row">
                  <span className="info-label">Paid:</span>
                  <span>
                    {new Date(membershipStatus.paid_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
            <p className="membership-thanks">Thank you for being a member!</p>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation view
  if (step === 'confirmation') {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>SAGA Membership</h1>
        </div>
        <div className="membership-card">
          <div className="registration-confirmation">
            <div className="confirmation-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="48" height="48">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Membership Activated!</h2>
            <div className="confirmation-details">
              <div className="info-row">
                <span className="info-label">Tier:</span>
                <span>{selectedTier?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Season:</span>
                <span>{new Date().getFullYear()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Amount:</span>
                <span className="price-highlight">${selectedTier?.amount}</span>
              </div>
              {confirmationData?.confirmation_id && (
                <div className="info-row">
                  <span className="info-label">Confirmation:</span>
                  <span>{confirmationData.confirmation_id}</span>
                </div>
              )}
            </div>
            <p className="confirmation-message">
              A receipt has been sent to your email.
            </p>
            <button
              className="primary-btn"
              onClick={() => navigate('/dashboard')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment form view
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>SAGA Membership</h1>
        <p className="page-subtitle">Season {new Date().getFullYear()}</p>
      </div>

      <div className="membership-card">
        <div className="membership-form-section">
          <div className="form-group">
            <label htmlFor="membership-tier">Select your membership tier</label>
            <select
              id="membership-tier"
              value={selectedTierId}
              onChange={(e) => setSelectedTierId(e.target.value)}
            >
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} — ${tier.amount}
                </option>
              ))}
            </select>
          </div>

          {selectedTier && (
            <div className="membership-tier-info">
              {selectedTier.description && (
                <p className="tier-description">{selectedTier.description}</p>
              )}
              <div className="tier-amount">
                Amount: <strong>${selectedTier.amount}</strong>
              </div>
            </div>
          )}

          {selectedTier && (
            <PaymentForm
              amount={String(selectedTier.amount)}
              onTokenReceived={handlePaymentToken}
              onError={handlePaymentError}
              loading={loading}
              submitLabel="Pay Membership"
              error={paymentError}
            />
          )}

          {tiers.length === 0 && (
            <div className="empty-state">
              <p>No membership tiers available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
