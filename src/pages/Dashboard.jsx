import { useState, useEffect } from 'react';
import { playerAPI, missionAPI, adminAPI, familyAPI } from '../services/api';
import confetti from 'canvas-confetti';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [player, setPlayer] = useState(null);
  const [missions, setMissions] = useState([]);
  const [news, setNews] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missionsData, setMissionsData] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showDeadModal, setShowDeadModal] = useState(false);
  const [markingDead, setMarkingDead] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [playerRes, missionsRes, newsRes] = await Promise.all([
        playerAPI.getMyProfile(),
        missionAPI.getTodayMissions(),
        playerAPI.getNews().catch(() => ({ data: { news: [] } })),
      ]);

      setPlayer(playerRes.data);
      setMissionsData(missionsRes.data);
      setMissions(missionsRes.data.missions || []);
      setNews(newsRes.data.news || []);

      // Fetch family members if player has a family
      if (playerRes.data.family) {
        try {
          const familyRes = await familyAPI.getFamilyMembers(playerRes.data.family);
          setFamilyMembers(familyRes.data || []);
        } catch (error) {
          console.log('Could not fetch family members:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDead = async () => {
    setMarkingDead(true);
    try {
      const response = await fetch(`${API_BASE_URL}/player/me/mark-dead`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Reload player data to reflect dead status
        const playerRes = await playerAPI.getMyProfile();
        setPlayer(playerRes.data);
        setShowDeadModal(false);
      }
    } catch (error) {
      console.error('Error marking player as dead:', error);
    } finally {
      setMarkingDead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Check if player is dead
  const isDead = player?.alive === false || player?.alive === 'FALSE';

  return (
    <div className="min-h-screen py-4 sm:py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Are you dead button - Outside player card */}
        {!isDead && (
          <div className="flex justify-end mb-4 sm:mb-6">
            <button
              onClick={() => setShowDeadModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-lg font-medium transition hover:opacity-80"
              style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderColor: 'var(--error-text)', border: '2px solid' }}
            >
              Are you dead?
            </button>
          </div>
        )}

        {/* Player Info Card */}
        <div className="rounded-lg shadow-lg p-4 sm:p-8 border-2 mb-4 sm:mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
          <h1 className="mafia-title text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--text-primary)' }}>
            Welcome, {player?.name}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="p-3 sm:p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm sm:text-lg mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Money</p>
              <p className="text-xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>${player?.balance || 0}</p>
            </div>
            <div className="p-3 sm:p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm sm:text-lg mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Role</p>
              <p className="text-base sm:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{player?.role}</p>
            </div>
            <div className="p-3 sm:p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm sm:text-lg mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Family</p>
              <p className="text-base sm:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{player?.family || 'No Family'}</p>
            </div>
            <div className="p-3 sm:p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm sm:text-lg mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Score</p>
              <p className="text-xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{player?.total_score || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-3 sm:mt-6">
            <div className="p-3 sm:p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs sm:text-base mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Missions</p>
              <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{player?.missions_completed || 0}</p>
            </div>
            <div className="p-3 sm:p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs sm:text-base mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Heals</p>
              <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{player?.heals_performed || 0}</p>
            </div>
            <div className="p-3 sm:p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs sm:text-base mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Kills</p>
              <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{player?.kills_made || 0}</p>
            </div>
            <div className="p-3 sm:p-5 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs sm:text-base mb-1 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Trades</p>
              <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{player?.trades_completed || 0}</p>
            </div>
          </div>
        </div>

        {/* Dead Player Message */}
        {isDead && (
          <div className="rounded-lg shadow-lg p-12 border-2 mb-8 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--error-text)' }}>
            <div className="mb-6">
              <svg className="w-32 h-32 mx-auto" style={{ color: 'var(--error-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mafia-title text-4xl font-bold mb-4" style={{ color: 'var(--error-text)' }}>
              You Have Been Eliminated
            </h2>
            <p className="text-2xl mb-3" style={{ color: 'var(--text-secondary)' }}>
              Your journey in the game has ended.
            </p>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              You can view your final stats above, but cannot participate in missions or activities.
            </p>
          </div>
        )}

        {/* Family Members Section - Hidden for dead players */}
        {!isDead && player?.family && familyMembers.length > 0 && (
          <div className="rounded-lg shadow-lg p-8 border-2 mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <h2 className="mafia-title text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {player.family} Family ({familyMembers.length} members)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                    {member.name === player.name ? `${member.name} (You)` : member.name}
                  </p>
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>{member.role}</p>
                  <p className="text-base mt-1" style={{ color: member.alive ? 'var(--success-text)' : 'var(--error-text)' }}>
                    {member.alive ? '✓ Alive' : '✗ Eliminated'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Section - Hidden for dead players */}
        {!isDead && news && news.length > 0 && (
          <div className="rounded-lg shadow-lg p-8 border-2 mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <h2 className="mafia-title text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>News & Announcements</h2>
            <div className="space-y-4">
              {news.slice(0, 3).map((item, index) => (
                <div key={index} className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <h3 className="font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-lg mt-1" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                  <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Missions Preview - Hidden for dead players */}
        {!isDead && (
        <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="mafia-title text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Today's Missions</h2>
              <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                {player?.role && `Filtered for ${player.role}`} {player?.family && `• ${player.family} Family`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{missions.length}</p>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Available</p>
            </div>
          </div>

          {/* Check if missions are locked */}
          {missionsData && !missionsData.unlocked ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto opacity-50" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Missions Locked
              </h3>
              <p className="text-xl mb-2" style={{ color: 'var(--text-secondary)' }}>
                {missionsData.message}
              </p>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Unlock Time: {missionsData.unlock_time}
              </p>
            </div>
          ) : missions && missions.length > 0 ? (
            <div className="space-y-4">
              {missions.slice(0, 3).map((mission, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg flex justify-between items-center cursor-pointer hover:opacity-80 transition"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>{mission.title}</h3>
                      <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}>
                        {mission.visibility}
                      </span>
                    </div>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{mission.description}</p>
                  </div>
                  <div className="text-right ml-6">
                    <p className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>${mission.reward_md}</p>
                    <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>{mission.type}</p>
                  </div>
                </div>
              ))}
              {missions.length > 3 && (
                <div className="text-center pt-4">
                  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    +{missions.length - 3} more missions available in Missions page
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xl text-center py-8" style={{ color: 'var(--text-secondary)' }}>No missions available today for your role.</p>
          )}
        </div>
        )}

        {/* Mission Details Modal */}
        {selectedMission && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMission(null)}
          >
            <div
              className="rounded-lg shadow-2xl border-2 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 p-6 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-bold pr-4" style={{ color: 'var(--text-primary)' }}>
                    {selectedMission.title}
                  </h2>
                  <button
                    onClick={() => setSelectedMission(null)}
                    className="text-2xl font-bold px-3 py-1 rounded hover:bg-opacity-80 transition"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    ×
                  </button>
                </div>
                <span
                  className="inline-block mt-3 px-3 py-1 rounded text-base"
                  style={{
                    backgroundColor: selectedMission.status === 'completed' ? 'var(--success-bg)' : 'var(--error-bg)',
                    color: selectedMission.status === 'completed' ? 'var(--success-text)' : 'var(--error-text)'
                  }}
                >
                  {selectedMission.status === 'completed' ? 'Completed' : 'Active'}
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Description</h3>
                  <p className="text-xl" style={{ color: 'var(--text-primary)' }}>{selectedMission.description}</p>
                </div>

                {/* Mission Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Reward</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${selectedMission.reward_md || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Type</p>
                    <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedMission.type}</p>
                  </div>
                  {selectedMission.day && (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Day</p>
                      <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Day {selectedMission.day}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Visibility</p>
                    <p className="text-xl font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{selectedMission.visibility}</p>
                  </div>
                </div>

                {/* Assignment Details */}
                {(selectedMission.assigned_family || selectedMission.assigned_role) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Assignment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMission.assigned_family && selectedMission.assigned_family !== 'all' && (
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Family</p>
                          <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedMission.assigned_family}</p>
                        </div>
                      )}
                      {selectedMission.assigned_role && selectedMission.assigned_role !== 'all' && (
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Role</p>
                          <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedMission.assigned_role}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reward Item */}
                {selectedMission.reward_item && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Reward Item</p>
                    <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedMission.reward_item}</p>
                  </div>
                )}

                {/* Mission ID */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mission ID: {selectedMission.mission_id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Are You Dead Modal */}
        {showDeadModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeadModal(false)}
          >
            <div
              className="rounded-lg shadow-2xl border-2 max-w-md w-full"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--error-text)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--error-text)' }}>
                  Are You Dead?
                </h2>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Have you been eliminated from the game? This action cannot be undone.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeadModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg text-lg font-medium transition hover:opacity-80"
                    style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '2px solid var(--success-text)' }}
                    disabled={markingDead}
                  >
                    No
                  </button>
                  <button
                    onClick={handleMarkDead}
                    className="flex-1 py-3 px-4 rounded-lg text-lg font-medium transition hover:opacity-80"
                    style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '2px solid var(--error-text)' }}
                    disabled={markingDead}
                  >
                    {markingDead ? 'Processing...' : 'Yes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
