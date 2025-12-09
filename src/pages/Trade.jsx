import { useState, useEffect } from 'react';
import { tradeAPI, adminAPI } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Trade() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState(null);
  const [nextOpening, setNextOpening] = useState('');

  useEffect(() => {
    fetchMarketStatus();
    fetchOffers();
    // Update status every 30 seconds
    const interval = setInterval(fetchMarketStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blackmarket/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await response.json();
      setMarketStatus(data);
      setIsMarketOpen(data.is_open);
      setNextOpening(data.next_opening);
    } catch (error) {
      console.error('Error fetching market status:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blackmarket/offers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to load black market offers');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (offerId) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/blackmarket/purchase/${offerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Purchase failed');
      }

      const data = await response.json();
      setSuccess(data.message || 'Purchase successful!');
      fetchOffers(); // Refresh offers
    } catch (err) {
      setError(err.message || 'Purchase failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mafia-title text-5xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>Black Market</h1>

        {/* Market Status Banner */}
        {isMarketOpen && (
          <div className="rounded-lg shadow-lg p-8 mb-8 border-4 animate-pulse" style={{
            backgroundColor: '#1a4d2e',
            borderColor: '#27ae60',
            boxShadow: '0 0 30px rgba(39, 174, 96, 0.5)'
          }}>
            <div className="text-center">
              <h2 className="text-6xl font-bold mb-4 tracking-wider" style={{ color: '#27ae60', textShadow: '0 0 20px rgba(39, 174, 96, 0.8)' }}>
                🟢 BLACK MARKET OPENS 🟢
              </h2>
              <p className="text-3xl font-semibold mb-2" style={{ color: '#fff' }}>
                The Black Market is NOW OPEN!
              </p>
              <p className="text-xl" style={{ color: '#a8d5ba' }}>
                Rare items available for 1 hour only. Act fast before they're gone!
              </p>
              {marketStatus?.manual_override && (
                <p className="text-base mt-3 px-4 py-2 rounded inline-block" style={{
                  backgroundColor: '#e67e22',
                  color: '#fff'
                }}>
                  ⚠️ Manually Opened by Godfather
                </p>
              )}
            </div>
          </div>
        )}

        {!isMarketOpen && (
          <div className="rounded-lg shadow-lg p-6 mb-8 border-2" style={{
            backgroundColor: '#4d1a1a',
            borderColor: '#c0392b'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#c0392b' }}>
                  🔴 Market is CLOSED
                </h2>
                <p className="text-lg" style={{ color: '#e74c3c' }}>
                  Next Opening: {nextOpening}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-md p-5 mb-8" style={{ backgroundColor: 'var(--error-bg)' }}>
            <p className="text-lg" style={{ color: 'var(--error-text)' }}>{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md p-5 mb-8" style={{ backgroundColor: 'var(--success-bg)' }}>
            <p className="text-lg" style={{ color: 'var(--success-text)' }}>{success}</p>
          </div>
        )}

        {/* Black Market Offers */}
        {!isMarketOpen ? (
          <div className="rounded-lg shadow-lg p-16 text-center border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <div className="mb-8">
              <svg className="w-32 h-32 mx-auto opacity-50" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Black Market Closed
            </h2>
            <p className="text-2xl mb-3" style={{ color: 'var(--text-secondary)' }}>
              The Black Market opens at {marketStatus?.scheduled_hour}:00 IST every day
            </p>
            <p className="text-xl mb-2" style={{ color: 'var(--accent-primary)' }}>
              Next Opening: {nextOpening}
            </p>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              Come back later to see exclusive deals on rare items
            </p>
          </div>
        ) : offers && offers.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                className="rounded-lg shadow-lg p-8 border-2 transition"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: offer.available ? 'var(--accent-primary)' : 'var(--border-color)',
                  opacity: offer.available ? 1 : 0.6
                }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {offer.item_name}
                  </h3>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {offer.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Price</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>${offer.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Stock</p>
                    <p className="text-2xl font-bold" style={{ color: offer.available ? 'var(--success-text)' : 'var(--error-text)' }}>
                      {offer.quantity_available}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(offer.offer_id)}
                  disabled={!offer.available || submitting}
                  className="w-full py-3 px-4 text-lg rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: offer.available ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {submitting ? 'Processing...' : offer.available ? 'Purchase' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg shadow-lg p-12 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-2xl" style={{ color: 'var(--text-secondary)' }}>
              No offers available at the moment. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trade;
