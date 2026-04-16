import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { membershipOptionsApi, api } from '../lib/api';
import PayPalPayment from '../components/PayPalPayment';

export default function RenewMembershipPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [membership, setMembership] = useState('');
  const [membershipOptions, setMembershipOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    membershipOptionsApi.getAll()
      .then(options => {
        setMembershipOptions(options);
        // Auto-select: user's current tier if it exists, otherwise first option
        if (options.length > 0) {
          const current = options.find(o => o.name === user?.membership);
          setMembership(current ? current.name : options[0].name);
        }
      })
      .catch(err => console.error('Failed to load membership options:', err));
  }, [user?.membership]);

  const selectedOption = membershipOptions.find(o => o.name === membership);
  const membershipPrice = selectedOption ? (parseFloat(selectedOption.price) || 0) : 0;

  const handlePayPalApprove = useCallback(async ({ orderID }) => {
    setError('');
    setPaymentError('');
    setLoading(true);

    try {
      const response = await api.post('/api/users/renew-membership', {
        membership,
        paypal_order_id: orderID,
      });

      updateUser({
        ...user,
        membership: response.membership,
        membership_expired: false,
      });

      alert('Membership renewed successfully!');
      navigate('/dashboard');
    } catch (err) {
      const message = err?.message || 'Renewal failed. Please try again.';
      if (message.toLowerCase().includes('declined')) {
        setPaymentError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [membership, user, updateUser, navigate]);

  const handleFreeRenewal = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/users/renew-membership', {
        membership,
      });

      updateUser({
        ...user,
        membership: response.membership,
        membership_expired: false,
      });

      alert('Membership renewed successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Renewal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [membership, user, updateUser, navigate]);

  const handlePaymentError = useCallback((errorMsg) => {
    setPaymentError(errorMsg);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="renew-membership-page">
      <div className="renew-membership-card">
        <div className="renew-header">
          <h1>Renew Your Membership</h1>
          <p>Your membership has expired. Please renew to continue accessing your account.</p>
        </div>

        {error && (
          <div className="renew-error">{error}</div>
        )}

        <div className="renew-greeting">
          Welcome back, <strong>{user?.first_name} {user?.last_name}</strong>
        </div>

        <div className="renew-notice">
          Until you renew, you will be charged the guest rate for event registrations.
        </div>

        <div className="membership-selection">
          <label className="renew-label">Select Membership Tier</label>
          <div className="membership-options">
            {membershipOptions.map((option) => (
              <div
                key={option.id}
                className={`membership-option ${membership === option.name ? 'selected' : ''}`}
                onClick={() => setMembership(option.name)}
              >
                <input
                  type="radio"
                  name="membership"
                  value={option.name}
                  checked={membership === option.name}
                  onChange={() => setMembership(option.name)}
                />
                <div className="option-content">
                  <div className="option-text">
                    <span className="option-label">{option.name}</span>
                    {option.description && <span className="option-subtitle">{option.description}</span>}
                  </div>
                  <span className="option-price">${Number(option.price).toFixed(2)}</span>
                  <div className="radio-indicator"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {membership && membershipPrice > 0 && (
          <PayPalPayment
            amount={membershipPrice}
            description="SAGA Golf Membership Renewal"
            onApprove={handlePayPalApprove}
            onError={handlePaymentError}
            loading={loading}
            submitLabel={`Renew & Pay — $${membershipPrice.toFixed(2)}`}
            error={paymentError}
          />
        )}

        {membership && membershipPrice === 0 && (
          <button
            type="button"
            onClick={handleFreeRenewal}
            disabled={loading}
            className="renew-free-btn"
          >
            {loading ? 'Renewing...' : 'Renew Membership — Free'}
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="renew-logout-btn"
        >
          Log Out
        </button>
      </div>

      <style>{`
        .membership-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .membership-option {
          position: relative;
          display: flex;
          align-items: center;
          padding: 1.25rem;
          background: white;
          border: 2px solid var(--border, #e5e7eb);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .membership-option:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);
        }

        .membership-option.selected {
          border-color: var(--primary);
          background: rgba(13, 148, 136, 0.05);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
        }

        .membership-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .option-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .option-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .option-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .option-subtitle {
          font-weight: 400;
          color: var(--text-secondary);
          font-size: 0.771rem;
        }

        .option-price {
          font-weight: 700;
          color: var(--primary);
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .radio-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border, #e5e7eb);
          position: relative;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .membership-option:hover .radio-indicator {
          border-color: var(--primary);
        }

        .membership-option.selected .radio-indicator {
          border-color: var(--primary);
          background: var(--primary);
        }

        .membership-option.selected .radio-indicator::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }

        .renew-notice {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          color: #92400e;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .membership-option {
            padding: 1rem;
          }

          .option-content {
            align-items: flex-start;
          }

          .option-price {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
