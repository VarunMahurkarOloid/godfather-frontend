import { useState, useEffect } from 'react';
import api from '../services/api';

function AdminNew() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('players');

  // Player management state
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [amount, setAmount] = useState('');

  // Mission state
  const [missions, setMissions] = useState([]);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionReward, setMissionReward] = useState('');
  const [missionType, setMissionType] = useState('puzzle');
  const [missionDay, setMissionDay] = useState('1');

  // Game state
  const [gameDay, setGameDay] = useState(1);
  const [unlockHour, setUnlockHour] = useState(9);

  useEffect(() => {
    fetchPlayers();
    fetchMissions();
    fetchGameState();
  }, []);

  const fetchPlayers = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/players');
      console.log('Players fetched:', response.data);
      setPlayers(response.data || []);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players: ' + (err.response?.data?.detail || err.message));
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const response = await api.get('/missions/all');
      console.log('Missions fetched:', response.data);
      setMissions(response.data?.missions || []);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setMissions([]);
    }
  };

  const fetchGameState = async () => {
    try {
      const response = await api.get('/admin/game-state');
      console.log('Game state fetched:', response.data);
      setGameDay(response.data?.current_day || 1);
      setUnlockHour(response.data?.mission_unlock_hour || 9);
    } catch (err) {
      console.error('Error fetching game state:', err);
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
      const response = await api.post('/admin/update-money', {
        player_id: selectedPlayer,
        amount: parseFloat(amount)
      });

      setMessage({
        type: 'success',
        text: `Money updated! ${response.data.player_name}: $${response.data.old_balance} → $${response.data.new_balance}`
      });
      setSelectedPlayer('');
      setSelectedPlayerData(null);
      setAmount('');
      await fetchPlayers();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update money'
      });
    }
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await api.post('/admin/add-mission', {
        title: missionTitle,
        description: missionDesc,
        reward_md: parseFloat(missionReward),
        type: missionType,
        day: parseInt(missionDay),
        visibility: 'public',
        assigned_family: 'all',
        assigned_role: 'all',
        status: 'active'
      });

      setMessage({ type: 'success', text: 'Mission created successfully!' });
      setMissionTitle('');
      setMissionDesc('');
      setMissionReward('');
      setMissionType('puzzle');
      setMissionDay('1');
      await fetchMissions();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to create mission'
      });
    }
  };

  const handleSetGameDay = async () => {
    setMessage({ type: '', text: '' });
    try {
      await api.post(`/admin/set-game-day?day=${gameDay}`);
      setMessage({ type: 'success', text: `Game day set to Day ${gameDay}!` });
      await fetchGameState();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to set game day' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-xl" style={{ color: 'var(--text-primary)' }}>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-2xl w-full rounded-lg shadow-lg p-8 border-2 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-3xl font-bold mb-4 text-red-500">Error Loading Admin Panel</h2>
          <p className="text-xl mb-6" style={{ color: 'var(--text-primary)' }}>{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchPlayers();
              }}
              className="w-full py-3 px-6 rounded-lg text-lg font-semibold"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
            >
              Retry
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full py-3 px-6 rounded-lg text-lg font-semibold bg-gray-600 text-white"
            >
              Logout and Try Again
            </button>
          </div>
          <div className="mt-6 p-4 rounded bg-gray-800">
            <p className="text-sm text-gray-300 mb-2">Debug Information:</p>
            <p className="text-xs text-gray-400">API URL: {api.defaults.baseURL}</p>
            <p className="text-xs text-gray-400">Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="mafia-title text-5xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          Godfather Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b-2 mb-8" style={{ borderColor: 'var(--border-color)' }}>
          {['players', 'missions', 'game', 'tools'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xl font-semibold transition-all ${
                activeTab === tab ? 'border-b-4' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                color: 'var(--text-primary)',
                borderColor: activeTab === tab ? 'var(--accent-primary)' : 'transparent'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-8 p-6 rounded-lg ${
              message.type === 'success' ? 'bg-green-900 bg-opacity-50 text-green-200' : 'bg-red-900 bg-opacity-50 text-red-200'
            }`}
          >
            <p className="text-xl">{message.text}</p>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              All Players ({players.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Name</th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Email</th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Role</th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Family</th>
                    <th className="text-left py-4 px-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <tr key={player.player_id || idx} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-4 px-4 text-lg" style={{ color: 'var(--text-primary)' }}>{player.name || 'Unknown'}</td>
                      <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>{player.email || 'N/A'}</td>
                      <td className="py-4 px-4" style={{ color: 'var(--text-primary)' }}>{player.role || player.assigned_role || 'No Role'}</td>
                      <td className="py-4 px-4" style={{ color: 'var(--text-primary)' }}>{player.family || 'No Family'}</td>
                      <td className="py-4 px-4 text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>${player.balance || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create New Mission</h2>
            <form onSubmit={handleCreateMission} className="space-y-5">
              <input
                type="text"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                placeholder="Mission Title"
                className="w-full px-4 py-3 text-lg rounded-lg"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                required
              />
              <textarea
                value={missionDesc}
                onChange={(e) => setMissionDesc(e.target.value)}
                placeholder="Mission Description"
                rows="4"
                className="w-full px-4 py-3 text-lg rounded-lg"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  value={missionReward}
                  onChange={(e) => setMissionReward(e.target.value)}
                  placeholder="Reward ($)"
                  className="px-4 py-3 text-lg rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  required
                />
                <select
                  value={missionType}
                  onChange={(e) => setMissionType(e.target.value)}
                  className="px-4 py-3 text-lg rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="puzzle">Puzzle</option>
                  <option value="action">Action</option>
                  <option value="trade">Trade</option>
                </select>
                <input
                  type="number"
                  value={missionDay}
                  onChange={(e) => setMissionDay(e.target.value)}
                  placeholder="Day"
                  min="1"
                  className="px-4 py-3 text-lg rounded-lg"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 px-4 text-xl rounded-lg font-bold"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
              >
                Create Mission
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>All Missions ({missions.length})</h3>
              {missions.length > 0 ? (
                <div className="space-y-3">
                  {missions.map((mission, idx) => (
                    <div key={mission.mission_id || idx} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{mission.title}</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>{mission.description}</p>
                      <p className="mt-2" style={{ color: 'var(--accent-primary)' }}>
                        Reward: ${mission.reward_md} | Day: {mission.day} | Type: {mission.type}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No missions created yet</p>
              )}
            </div>
          </div>
        )}

        {/* Game Tab */}
        {activeTab === 'game' && (
          <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Game Controls</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Current Day: {gameDay}</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={gameDay}
                    onChange={(e) => setGameDay(parseInt(e.target.value))}
                    min="1"
                    className="px-4 py-3 rounded-lg w-24 text-center text-xl font-bold"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--accent-primary)' }}
                  />
                  <button
                    onClick={handleSetGameDay}
                    className="px-6 py-3 rounded-lg text-lg font-semibold"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                  >
                    Set Day {gameDay}
                  </button>
                </div>
              </div>
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Unlock Hour: {unlockHour}:00</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Missions unlock at {unlockHour}:00 each day</p>
              </div>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Update Player Money</h2>
            <form onSubmit={handleUpdateMoney} className="space-y-5">
              <select
                value={selectedPlayer}
                onChange={(e) => handlePlayerSelect(e.target.value)}
                className="w-full px-4 py-4 text-lg rounded-lg"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                required
              >
                <option value="">Select player...</option>
                {players.map((player) => (
                  <option key={player.player_id} value={player.player_id}>
                    {player.name} - Current: ${player.balance || 0}
                  </option>
                ))}
              </select>

              {selectedPlayerData && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', borderLeft: '4px solid var(--accent-primary)' }}>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedPlayerData.name}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>
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
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
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
        )}
      </div>
    </div>
  );
}

export default AdminNew;
