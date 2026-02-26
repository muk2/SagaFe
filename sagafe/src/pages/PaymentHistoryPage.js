import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '../lib/api';

const PAGE_SIZE = 20;

function getStatusBadgeClass(status) {
  if (!status) return 'pending';
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'paid') return 'paid';
  if (s === 'declined' || s === 'failed') return 'failed';
  if (s === 'refunded') return 'refunded';
  return 'pending';
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [paymentType, setPaymentType] = useState('');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentsApi.getHistory({
        payment_type: paymentType || undefined,
        status: status || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load payment history');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [paymentType, status, offset]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPayments();
  }, [user, navigate, fetchPayments]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [paymentType, status]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment History</h1>
        <p className="page-subtitle">View all your past payments</p>
      </div>

      {/* Filters */}
      <div className="payment-history-filters">
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          aria-label="Filter by payment type"
        >
          <option value="">All Types</option>
          <option value="event_registration">Event Registration</option>
          <option value="membership">Membership</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="empty-state">
          <p>Loading payments...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="message error">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && payments.length === 0 && (
        <div className="empty-state">
          <p>No payments found</p>
        </div>
      )}

      {/* Payment table */}
      {!loading && !error && payments.length > 0 && (
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Card</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    {new Date(payment.created_at || payment.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{payment.description || payment.payment_type}</td>
                  <td className="payment-amount">${parseFloat(payment.amount).toFixed(2)}</td>
                  <td>
                    <span className={`payment-status-badge ${getStatusBadgeClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="payment-card-info">
                    {payment.card_last_four ? `****${payment.card_last_four}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="payment-pagination">
              <span>
                Showing {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
              </span>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                >
                  Prev
                </button>
                <button
                  className="pagination-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
