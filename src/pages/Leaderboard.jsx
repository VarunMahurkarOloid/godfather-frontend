import { useState, useEffect } from 'react';
import { playerAPI } from '../services/api';

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await playerAPI.getLeaderboard(20);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
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
        <h1 className="mafia-title text-5xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>

        <div className="rounded-lg shadow-lg border-2 overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
              <thead style={{ backgroundColor: 'var(--bg-primary)' }}>
                <tr>
                  <th className="px-8 py-5 text-left text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Rank
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Name
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Family
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Score
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Money
                  </th>
                  <th className="px-8 py-5 text-left text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                {players.map((player, index) => (
                  <tr
                    key={player.player_id}
                    className="transition"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-2xl font-bold" style={{
                        color: index === 0 ? '#FFD700' :
                               index === 1 ? '#C0C0C0' :
                               index === 2 ? '#CD7F32' :
                               'var(--text-primary)'
                      }}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
                      <div className="text-base" style={{ color: 'var(--text-secondary)' }}>{player.role}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-lg" style={{ color: 'var(--text-primary)' }}>
                      {player.family}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {player.individual_score || 0}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-lg" style={{ color: 'var(--text-primary)' }}>
                      ${player.balance || player.money || 0}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span
                        className="px-4 py-2 inline-flex text-base leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor: player.alive ? 'var(--success-bg)' : 'var(--error-bg)',
                          color: player.alive ? 'var(--success-text)' : 'var(--error-text)'
                        }}
                      >
                        {player.alive ? 'Alive' : 'Eliminated'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
