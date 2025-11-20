import { useState, useEffect } from 'react';
import { adminAPI, playerAPI } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Admin() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('players');

  // Mission form state
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionReward, setMissionReward] = useState('');
  const [missionType, setMissionType] = useState('puzzle');
  const [missionVisibility, setMissionVisibility] = useState('public');
  const [missionFamily, setMissionFamily] = useState('all');
  const [missionRole, setMissionRole] = useState('all');
  const [missionDay, setMissionDay] = useState('1');
  const [missions, setMissions] = useState([]);

  // Game control state
  const [gameDay, setGameDay] = useState(1);
  const [unlockHour, setUnlockHour] = useState(9);
  const [gameState, setGameState] = useState(null);

  // Black Market state
  const [blackmarketOffers, setBlackmarketOffers] = useState([]);
  const [offerItemName, setOfferItemName] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQuantity, setOfferQuantity] = useState('1');

  // Email reminder state
  const [emailLoading, setEmailLoading] = useState(false);
  const [blackmarketTime, setBlackmarketTime] = useState('');
  const [recipientType, setRecipientType] = useState('test'); // 'test' or 'all'

  useEffect(() => {
    fetchPlayers();
    fetchMissions();
    fetchGameState();
    fetchBlackmarketOffers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await adminAPI.getAllPlayers();
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMissions(data.missions || []);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  const fetchGameState = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/game-state`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGameState(data);
        setGameDay(data.current_day);
        setUnlockHour(data.mission_unlock_hour);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  const fetchBlackmarketOffers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blackmarket/admin/all-offers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBlackmarketOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching black market offers:', error);
    }
  };

  const handleClearMissions = async () => {
    if (!window.confirm('Are you sure you want to clear ALL missions? This action cannot be undone!')) {
      return;
    }

    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE_URL}/admin/clear-missions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'All missions cleared successfully!' });
        fetchMissions();
      } else {
        throw new Error('Failed to clear missions');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear missions' });
    }
  };

  const handleSetGameDay = async () => {
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE_URL}/admin/set-game-day?day=${gameDay}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: `Game day set to Day ${gameDay}!` });
        fetchGameState();
      } else {
        throw new Error('Failed to set game day');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to set game day' });
    }
  };

  const handleSetUnlockHour = async () => {
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE_URL}/admin/set-unlock-hour?hour=${unlockHour}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: `Mission unlock hour set to ${unlockHour}:00!` });
        fetchGameState();
      } else {
        throw new Error('Failed to set unlock hour');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to set unlock hour' });
    }
  };

  const handleSendDayStartEmail = async () => {
    setMessage({ type: '', text: '' });
    setEmailLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/send-day-start-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_type: recipientType
        })
      });

      if (response.ok) {
        const data = await response.json();
        let messageText = `✅ ${data.message} (Sent to ${data.sent_count} player(s))`;
        if (data.preview_url) {
          messageText = (
            <span>
              ✅ {data.message} (Sent to {data.sent_count} player(s))
              <br />
              <a href={data.preview_url} target="_blank" rel="noopener noreferrer"
                 style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                📧 Click here to view test email
              </a>
            </span>
          );
        }
        setMessage({
          type: 'success',
          text: messageText
        });
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send email');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error.message}` });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendMissionUnlockEmail = async () => {
    setMessage({ type: '', text: '' });
    setEmailLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/send-mission-unlock-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_type: recipientType
        })
      });

      if (response.ok) {
        const data = await response.json();
        let messageText = `✅ ${data.message} (Sent to ${data.sent_count} player(s))`;
        if (data.preview_url) {
          messageText = (
            <span>
              ✅ {data.message} (Sent to {data.sent_count} player(s))
              <br />
              <a href={data.preview_url} target="_blank" rel="noopener noreferrer"
                 style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                📧 Click here to view test email
              </a>
            </span>
          );
        }
        setMessage({
          type: 'success',
          text: messageText
        });
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send email');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error.message}` });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendBlackMarketEmail = async () => {
    setMessage({ type: '', text: '' });
    setEmailLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/send-blackmarket-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blackmarket_time: blackmarketTime || 'Soon',
          recipient_type: recipientType
        })
      });

      if (response.ok) {
        const data = await response.json();
        let messageText = `✅ ${data.message} (Sent to ${data.sent_count} player(s))`;
        if (data.preview_url) {
          messageText = (
            <span>
              ✅ {data.message} (Sent to {data.sent_count} player(s))
              <br />
              <a href={data.preview_url} target="_blank" rel="noopener noreferrer"
                 style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                📧 Click here to view test email
              </a>
            </span>
          );
        }
        setMessage({
          type: 'success',
          text: messageText
        });
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send email');
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${error.message}` });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayer(playerId);
    const player = players.find(p => p.player_id === playerId);
    setSelectedPlayerData(player || null);
  };

  const handleUpdateMoney = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedPlayer || !amount) {
      setMessage({ type: 'error', text: 'Please select a player and enter an amount' });
      return;
    }

    try {
      const response = await adminAPI.updateMoney(selectedPlayer, parseFloat(amount));
      setMessage({
        type: 'success',
        text: `Money updated! ${response.data.player_name}: $${response.data.old_balance} → $${response.data.new_balance} (${response.data.change >= 0 ? '+' : ''}${response.data.change})`
      });
      setSelectedPlayer('');
      setSelectedPlayerData(null);
      setAmount('');
      // Fetch updated player data
      await fetchPlayers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update money' });
    }
  };


  const handleCreateMission = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const missionData = {
        title: missionTitle,
        description: missionDesc,
        reward_md: parseFloat(missionReward),
        type: missionType,
        visibility: missionVisibility,
        assigned_family: missionFamily,
        assigned_role: missionRole,
        day: parseInt(missionDay),
        status: 'active',
        completed: false
      };

      // You'll need to add this API method
      const response = await fetch(`${API_BASE_URL}/admin/add-mission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(missionData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Mission created successfully!' });
        // Reset form
        setMissionTitle('');
        setMissionDesc('');
        setMissionReward('');
        setMissionType('puzzle');
        setMissionVisibility('public');
        setMissionFamily('all');
        setMissionRole('all');
        setMissionDay('1');
        // Refresh missions list
        fetchMissions();
      } else {
        throw new Error('Failed to create mission');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create mission' });
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const offerData = {
        item_name: offerItemName,
        description: offerDescription,
        price: parseFloat(offerPrice),
        quantity_available: parseInt(offerQuantity)
      };

      const response = await fetch(`${API_BASE_URL}/blackmarket/admin/create-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Black Market offer created successfully!' });
        setOfferItemName('');
        setOfferDescription('');
        setOfferPrice('');
        setOfferQuantity('1');
        fetchBlackmarketOffers();
      } else {
        throw new Error('Failed to create offer');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create offer' });
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/blackmarket/admin/delete-offer/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Offer deleted successfully!' });
        fetchBlackmarketOffers();
      } else {
        throw new Error('Failed to delete offer');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete offer' });
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
    <div className="min-h-screen py-4 sm:py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <h1 className="mafia-title text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-8" style={{ color: 'var(--text-primary)' }}>
          Godfather Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b-2 mb-4 sm:mb-8" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => {
              setActiveTab('players');
              fetchPlayers();
            }}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'players' ? 'border-b-4' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: 'var(--text-primary)',
              borderColor: activeTab === 'players' ? 'var(--accent-primary)' : 'transparent'
            }}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'missions' ? 'border-b-4' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: 'var(--text-primary)',
              borderColor: activeTab === 'missions' ? 'var(--accent-primary)' : 'transparent'
            }}
          >
            Missions
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'game' ? 'border-b-4' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: 'var(--text-primary)',
              borderColor: activeTab === 'game' ? 'var(--accent-primary)' : 'transparent'
            }}
          >
            Game
          </button>
          <button
            onClick={() => {
              setActiveTab('tools');
              fetchPlayers();
            }}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tools' ? 'border-b-4' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: 'var(--text-primary)',
              borderColor: activeTab === 'tools' ? 'var(--accent-primary)' : 'transparent'
            }}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('blackmarket')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'blackmarket' ? 'border-b-4' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: 'var(--text-primary)',
              borderColor: activeTab === 'blackmarket' ? 'var(--accent-primary)' : 'transparent'
            }}
          >
            Black Market
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-8 p-6 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900 bg-opacity-50 text-green-200'
                : 'bg-red-900 bg-opacity-50 text-red-200'
            }`}
          >
            <p className="text-xl">{message.text}</p>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div
            className="rounded-lg shadow-lg p-8 border-2"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}
          >
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              All Players
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Player ID
                    </th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Name
                    </th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Role
                    </th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Family
                    </th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Balance
                    </th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <PlayerRow
                      key={player.player_id || idx}
                      player={player}
                      onUpdate={fetchPlayers}
                      setMessage={setMessage}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Create New Mission
            </h2>
            <form onSubmit={handleCreateMission} className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Mission Title */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Mission Title
                  </label>
                  <input
                    type="text"
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    placeholder="e.g., Solve the Cipher"
                    required
                  />
                </div>

                {/* Mission Type */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Mission Type
                  </label>
                  <select
                    value={missionType}
                    onChange={(e) => setMissionType(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                  >
                    <option value="puzzle">Puzzle</option>
                    <option value="action">Action</option>
                    <option value="trade">Trade</option>
                    <option value="social">Social</option>
                    <option value="investigation">Investigation</option>
                  </select>
                </div>
              </div>

              {/* Mission Description */}
              <div>
                <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description
                </label>
                <textarea
                  value={missionDesc}
                  onChange={(e) => setMissionDesc(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 text-lg rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    border: '1px solid'
                  }}
                  placeholder="Describe the mission..."
                  required
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {/* Reward */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Reward ($)
                  </label>
                  <input
                    type="number"
                    value={missionReward}
                    onChange={(e) => setMissionReward(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    placeholder="10000"
                    required
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Visibility
                  </label>
                  <select
                    value={missionVisibility}
                    onChange={(e) => setMissionVisibility(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                  >
                    <option value="public">Public (All Players)</option>
                    <option value="family">Family Only</option>
                    <option value="private">Private (Specific Player)</option>
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Day
                  </label>
                  <input
                    type="number"
                    value={missionDay}
                    onChange={(e) => setMissionDay(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    min="1"
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {/* Assigned Family */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Assigned Family (Optional)
                  </label>
                  <select
                    value={missionFamily}
                    onChange={(e) => setMissionFamily(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                  >
                    <option value="all">All Families</option>
                    <option value="Tattaglia">Tattaglia</option>
                    <option value="Barzini">Barzini</option>
                    <option value="Cuneo">Cuneo</option>
                    <option value="Stracci">Stracci</option>
                  </select>
                </div>

                {/* Assigned Role */}
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Assigned Role (Optional)
                  </label>
                  <select
                    value={missionRole}
                    onChange={(e) => setMissionRole(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="Don">Don</option>
                    <option value="Caporegime">Caporegime</option>
                    <option value="Detective">Detective</option>
                    <option value="Merchant">Merchant</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Citizen">Citizen</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-4 text-xl rounded-lg font-bold"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
              >
                Create Mission
              </button>
            </form>

            {/* All Missions List */}
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                All Missions ({missions.length})
              </h2>

              {missions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: 'var(--border-color)' }}>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ID
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Title
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Type
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Reward
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Visibility
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Family
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Role
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Day
                        </th>
                        <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {missions.map((mission, idx) => (
                        <tr key={mission.mission_id || idx} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                            {mission.mission_id}
                          </td>
                          <td className="py-4 px-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                            {mission.title}
                          </td>
                          <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                            {mission.type}
                          </td>
                          <td className="py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            ${mission.reward_md || 0}
                          </td>
                          <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                            {mission.visibility}
                          </td>
                          <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                            {mission.assigned_family || 'all'}
                          </td>
                          <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                            {mission.assigned_role || 'all'}
                          </td>
                          <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                            Day {mission.day}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className="px-3 py-1 rounded text-base"
                              style={{
                                backgroundColor: mission.status === 'completed' ? 'var(--success-bg)' : 'var(--accent-primary)',
                                color: mission.status === 'completed' ? 'var(--success-text)' : 'var(--text-primary)'
                              }}
                            >
                              {mission.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                    No missions created yet. Create your first mission above!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Controls Tab */}
        {activeTab === 'game' && (
          <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Game Controls</h2>

            {/* Game State Display */}
            {gameState && (
              <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Current Game State
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Current Day:</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>Day {gameState.current_day}</p>
                  </div>
                  <div>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Mission Unlock Time:</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{gameState.mission_unlock_hour}:00 AM</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Set Game Day */}
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Set Game Day
                </h3>
                <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Change the current game day to unlock missions for that day
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={gameDay}
                    onChange={(e) => setGameDay(parseInt(e.target.value))}
                    className="px-4 py-3 rounded-lg text-xl font-bold w-24 text-center"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--accent-primary)',
                      border: '2px solid'
                    }}
                  />
                  <button
                    onClick={handleSetGameDay}
                    className="px-6 py-3 rounded-lg text-lg font-semibold transition"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Set Day {gameDay}
                  </button>
                </div>
              </div>

              {/* Set Mission Unlock Hour */}
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Set Mission Unlock Hour
                </h3>
                <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Set the time when missions unlock each day (24-hour format)
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={unlockHour}
                    onChange={(e) => setUnlockHour(parseInt(e.target.value))}
                    className="px-4 py-3 rounded-lg text-xl font-bold w-24 text-center"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--accent-primary)',
                      border: '2px solid'
                    }}
                  />
                  <button
                    onClick={handleSetUnlockHour}
                    className="px-6 py-3 rounded-lg text-lg font-semibold transition"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Set {unlockHour}:00
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-primary)' }}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                How It Works
              </h3>
              <ul className="space-y-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
                <li>• Set the mission unlock hour to control when missions become available each day</li>
                <li>• Set the game day to unlock missions for that specific day</li>
                <li>• Players will only see missions matching their role and family</li>
                <li>• Godfather/Admins always see all missions regardless of time</li>
                <li>• Use the Missions tab to create and manage missions</li>
              </ul>
            </div>

            {/* Email Reminders */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📧 Send Email Reminders
              </h3>

              {/* Recipient Type Selector */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <label className="block text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Select Recipients:
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-base font-medium"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                    border: '2px solid'
                  }}
                >
                  <option value="test">Test (varun.mahurkar@oloid.ai only)</option>
                  <option value="all">All Users (Send to everyone)</option>
                </select>

                {recipientType === 'test' && (
                  <p className="mt-3 p-3 rounded-lg text-base" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    ⚠️ Test Mode: Emails will be sent only to <strong style={{ color: 'var(--accent-primary)' }}>varun.mahurkar@oloid.ai</strong>
                  </p>
                )}

                {recipientType === 'all' && (
                  <p className="mt-3 p-3 rounded-lg text-base" style={{ backgroundColor: 'var(--bg-secondary)', color: '#ff6b6b' }}>
                    🚨 Live Mode: Emails will be sent to <strong>ALL USERS</strong> in the system!
                  </p>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Day Start Email */}
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <h4 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🌅 Day Start Reminder
                  </h4>
                  <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Send email to all players when a new day begins
                  </p>
                  <button
                    onClick={handleSendDayStartEmail}
                    disabled={emailLoading}
                    className="w-full px-6 py-3 rounded-lg text-lg font-semibold transition disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {emailLoading ? 'Sending...' : 'Send Day Start Email'}
                  </button>
                </div>

                {/* Mission Unlock Email */}
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <h4 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 Mission Unlock Reminder
                  </h4>
                  <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Remind players when missions unlock at set hour
                  </p>
                  <button
                    onClick={handleSendMissionUnlockEmail}
                    disabled={emailLoading}
                    className="w-full px-6 py-3 rounded-lg text-lg font-semibold transition disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {emailLoading ? 'Sending...' : 'Send Mission Unlock Email'}
                  </button>
                </div>

                {/* Black Market Email */}
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <h4 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🏪 Black Market Reminder
                  </h4>
                  <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Send 5-min reminder before black market opens
                  </p>
                  <input
                    type="text"
                    placeholder="e.g., 2:00 PM"
                    value={blackmarketTime}
                    onChange={(e) => setBlackmarketTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-base mb-3"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                      border: '1px solid'
                    }}
                  />
                  <button
                    onClick={handleSendBlackMarketEmail}
                    disabled={emailLoading}
                    className="w-full px-6 py-3 rounded-lg text-lg font-semibold transition disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {emailLoading ? 'Sending...' : 'Send Black Market Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tools Tab */}
        {activeTab === 'tools' && (
          <div>
            {/* Update Money & Manage Items */}
            <div className="grid gap-4 sm:gap-8 grid-cols-1 lg:grid-cols-2 mb-4 sm:mb-8">
              {/* Update Money */}
              <div
                className="rounded-lg shadow-lg p-4 sm:p-8 border-2"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}
              >
                <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--text-primary)' }}>
                  Update Player Money
                </h2>
                <form onSubmit={handleUpdateMoney} className="space-y-5">
                  <select
                    value={selectedPlayer}
                    onChange={(e) => handlePlayerSelect(e.target.value)}
                    className="w-full px-4 py-4 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    required
                  >
                    <option value="">Select player...</option>
                    {players.map((player) => (
                      <option key={player.player_id} value={player.player_id}>
                        {player.name} ({player.role || 'No Role'}) - Current Balance: ${player.balance || 0}
                      </option>
                    ))}
                  </select>

                  {selectedPlayerData && (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--accent-primary)' }}>
                      <p className="text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                        <strong>{selectedPlayerData.name}</strong>
                      </p>
                      <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                        Role: {selectedPlayerData.role || 'No Role'} | Family: {selectedPlayerData.family || 'No Family'}
                      </p>
                      <p className="text-2xl font-bold mt-2" style={{ color: 'var(--accent-primary)' }}>
                        Current Balance: ${selectedPlayerData.balance || 0}
                      </p>
                    </div>
                  )}

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount (positive to add, negative to deduct)"
                    className="w-full px-4 py-4 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    required
                  />

                  <button
                    type="submit"
                    className="w-full py-4 px-4 text-xl rounded-lg font-bold"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                  >
                    Update Money
                  </button>
                </form>
              </div>

              {/* Manage Player Items */}
              <ManagePlayerItems players={players} onUpdate={fetchPlayers} setMessage={setMessage} />
            </div>
          </div>
        )}

        {/* Black Market Tab */}
        {activeTab === 'blackmarket' && (
          <div>
            {/* Create Offer Form */}
            <div className="rounded-lg shadow-lg p-8 border-2 mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Create Black Market Offer
              </h2>
              <form onSubmit={handleCreateOffer} className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={offerItemName}
                      onChange={(e) => setOfferItemName(e.target.value)}
                      className="w-full px-4 py-3 text-lg rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid'
                      }}
                      placeholder="e.g., Golden Gun"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full px-4 py-3 text-lg rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        border: '1px solid'
                      }}
                      placeholder="5000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Description
                  </label>
                  <textarea
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    placeholder="Describe the item and its effects..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Quantity Available
                  </label>
                  <input
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    className="w-full px-4 py-3 text-lg rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      border: '1px solid'
                    }}
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-4 text-xl rounded-lg font-bold"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                >
                  Create Offer
                </button>
              </form>
            </div>

            {/* Current Offers */}
            <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Current Black Market Offers
              </h2>

              {blackmarketOffers && blackmarketOffers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {blackmarketOffers.map((offer) => (
                    <div
                      key={offer.offer_id}
                      className="rounded-lg shadow p-6 border-2"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {offer.item_name}
                      </h3>
                      <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {offer.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Price</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${offer.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Stock</p>
                          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {offer.quantity_available}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOffer(offer.offer_id)}
                        className="w-full py-2 px-4 text-base rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Offer
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xl text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  No black market offers created yet. Create one above!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ManagePlayerItems component
function ManagePlayerItems({ players, onUpdate, setMessage }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [itemsInput, setItemsInput] = useState('');

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayer(playerId);
    const player = players.find(p => p.player_id === playerId);
    setSelectedPlayerData(player || null);

    // Parse and display current items
    if (player && player.items) {
      try {
        const items = typeof player.items === 'string' ? JSON.parse(player.items) : player.items;
        setItemsInput(items.join(', '));
      } catch (e) {
        setItemsInput('');
      }
    } else {
      setItemsInput('');
    }
  };

  const handleUpdateItems = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedPlayer) {
      setMessage({ type: 'error', text: 'Please select a player' });
      return;
    }

    try {
      // Parse items from comma-separated input
      const itemsArray = itemsInput
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const response = await fetch(`${API_BASE_URL}/admin/update-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          player_id: selectedPlayer,
          items: itemsArray
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Items updated for ${data.player_name}! Total items: ${itemsArray.length}`
        });
        setSelectedPlayer('');
        setSelectedPlayerData(null);
        setItemsInput('');
        onUpdate();
      } else {
        throw new Error('Failed to update items');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update items' });
    }
  };

  return (
    <div
      className="rounded-lg shadow-lg p-8 border-2"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}
    >
      <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Manage Player Items
      </h2>
      <form onSubmit={handleUpdateItems} className="space-y-5">
        <select
          value={selectedPlayer}
          onChange={(e) => handlePlayerSelect(e.target.value)}
          className="w-full px-4 py-4 text-lg rounded-lg"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            border: '1px solid'
          }}
          required
        >
          <option value="">Select player...</option>
          {players.map((player) => (
            <option key={player.player_id} value={player.player_id}>
              {player.name} ({player.role || 'No Role'})
            </option>
          ))}
        </select>

        {selectedPlayerData && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--accent-primary)' }}>
            <p className="text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
              <strong>{selectedPlayerData.name}</strong>
            </p>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              Role: {selectedPlayerData.role || 'No Role'} | Family: {selectedPlayerData.family || 'No Family'}
            </p>
            <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>
              Current Items: {
                selectedPlayerData.items
                  ? (() => {
                      try {
                        const items = typeof selectedPlayerData.items === 'string'
                          ? JSON.parse(selectedPlayerData.items)
                          : selectedPlayerData.items;
                        return items.length > 0 ? items.join(', ') : 'None';
                      } catch (e) {
                        return 'None';
                      }
                    })()
                  : 'None'
              }
            </p>
          </div>
        )}

        <div>
          <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Items (comma-separated)
          </label>
          <textarea
            value={itemsInput}
            onChange={(e) => setItemsInput(e.target.value)}
            placeholder="e.g., Gun, Knife, Medical Kit, Secret Letter"
            rows="4"
            className="w-full px-4 py-3 text-lg rounded-lg"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: '1px solid'
            }}
          />
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Enter items separated by commas. Leave blank to clear all items.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-4 text-xl rounded-lg font-bold"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
        >
          Update Items
        </button>
      </form>
    </div>
  );
}

// PlayerRow component for inline role assignment
function PlayerRow({ player, onUpdate, setMessage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRole, setEditRole] = useState(player.assigned_role || player.role || '');
  const [editFamily, setEditFamily] = useState(player.family || '');

  const handleSaveRole = async () => {
    if (!editRole) {
      setMessage({ type: 'error', text: 'Please select a role' });
      return;
    }

    // Prevent assigning Godfather role
    if (editRole === 'Godfather' && player.role !== 'Godfather') {
      setMessage({ type: 'error', text: 'Cannot assign Godfather role to other players!' });
      return;
    }

    try {
      await adminAPI.assignRole(player.player_id, editRole, editFamily || null);
      setMessage({ type: 'success', text: `Role updated for ${player.name}` });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update role' });
    }
  };

  const isGodfather = player.role === 'Godfather' || player.assigned_role === 'Godfather';

  return (
    <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
      <td className="py-4 px-4 text-base" style={{ color: 'var(--text-secondary)' }}>
        {player.player_id ? player.player_id.substring(0, 8) + '...' : 'Not Assigned'}
      </td>
      <td className="py-4 px-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        {player.name}
      </td>
      <td className="py-4 px-4">
        {isEditing && !isGodfather ? (
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="px-3 py-2 text-base rounded"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: '1px solid'
            }}
          >
            <option value="">Select role...</option>
            <option value="Don">Don</option>
            <option value="Caporegime">Caporegime</option>
            <option value="Detective">Detective</option>
            <option value="Merchant">Merchant</option>
            <option value="Doctor">Doctor</option>
            <option value="Citizen">Citizen</option>
          </select>
        ) : (
          <span className="text-lg" style={{ color: 'var(--text-primary)' }}>
            {player.assigned_role || player.role || 'Not Assigned'}
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        {isEditing && !isGodfather ? (
          <select
            value={editFamily}
            onChange={(e) => setEditFamily(e.target.value)}
            className="px-3 py-2 text-base rounded"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              border: '1px solid'
            }}
          >
            <option value="">No Family (Optional)</option>
            <option value="Tattaglia">Tattaglia</option>
            <option value="Barzini">Barzini</option>
            <option value="Cuneo">Cuneo</option>
            <option value="Stracci">Stracci</option>
          </select>
        ) : (
          <span className="text-lg" style={{ color: 'var(--text-primary)' }}>
            {player.family || 'No Family'}
          </span>
        )}
      </td>
      <td className="py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        ${player.balance || 0}
      </td>
      <td className="py-4 px-4">
        {!isGodfather ? (
          isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-base font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditRole(player.assigned_role || player.role || '');
                  setEditFamily(player.family || '');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-base font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded text-base font-medium"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
            >
              Assign Role
            </button>
          )
        ) : (
          <span className="px-4 py-2 text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            Protected
          </span>
        )}
      </td>
    </tr>
  );
}

export default Admin;
