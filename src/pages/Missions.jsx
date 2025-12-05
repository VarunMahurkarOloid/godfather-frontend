import { useState, useEffect } from 'react';
import { missionAPI } from '../services/api';

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      // Fetch ALL missions from spreadsheet (no day filtering)
      const response = await missionAPI.getAllMissions(null, true);
      setMissions(response.data.missions || []);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortedMissions = () => {
    if (!missions || missions.length === 0) return [];

    const sortedMissions = [...missions];

    switch (sortBy) {
      case 'high-to-low':
        return sortedMissions.sort((a, b) => (b.reward_md || 0) - (a.reward_md || 0));
      case 'low-to-high':
        return sortedMissions.sort((a, b) => (a.reward_md || 0) - (b.reward_md || 0));
      case 'type':
        return sortedMissions.sort((a, b) => {
          const typeA = (a.type || '').toLowerCase();
          const typeB = (b.type || '').toLowerCase();
          return typeA.localeCompare(typeB);
        });
      case 'default':
      default:
        return sortedMissions;
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
        {/* Header with Title and Sort Dropdown */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="mafia-title text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>Missions</h1>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 text-lg font-medium cursor-pointer focus:outline-none focus:ring-2 transition"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="default">Default</option>
              <option value="high-to-low">Reward: High to Low</option>
              <option value="low-to-high">Reward: Low to High</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        {missions && missions.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {getSortedMissions().map((mission, index) => (
              <div
                key={index}
                className="rounded-lg shadow-lg p-8 border-2 transition cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--accent-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onClick={() => setSelectedMission(mission)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold pr-2" style={{ color: 'var(--text-primary)' }}>{mission.title}</h2>
                  <span
                    className="px-3 py-1 rounded text-base whitespace-nowrap"
                    style={{
                      backgroundColor: mission.status === 'completed' ? 'var(--success-bg)' : 'var(--error-bg)',
                      color: mission.status === 'completed' ? 'var(--success-text)' : 'var(--error-text)'
                    }}
                  >
                    {mission.status === 'completed' ? 'Completed' : 'Active'}
                  </span>
                </div>

                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>{mission.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Reward</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${mission.reward_md || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>Type</p>
                    <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{mission.type}</p>
                  </div>
                </div>

                {mission.day && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Day {mission.day}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg shadow-lg p-12 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-2xl" style={{ color: 'var(--text-secondary)' }}>No missions available at the moment.</p>
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
      </div>
    </div>
  );
}

export default Missions;
