import { useState, useEffect } from 'react';
import api from '../services/api';

function FamilyNew() {
  const [myFamily, setMyFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [allFamilies, setAllFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setError(null);
      console.log('Fetching family data...');

      // Fetch my family
      let myFamilyData = null;
      let myFamilyMembers = [];
      try {
        const myFamilyResponse = await api.get('/families/my/family');
        console.log('My family response:', myFamilyResponse.data);
        myFamilyData = myFamilyResponse.data.family;
        myFamilyMembers = myFamilyResponse.data.members || [];
      } catch (err) {
        console.log('No family assigned or error:', err.response?.data?.detail);
        // It's okay if user doesn't have a family
      }

      // Fetch all families
      const allFamiliesResponse = await api.get('/families/');
      console.log('All families response:', allFamiliesResponse.data);
      const familiesList = allFamiliesResponse.data.families || allFamiliesResponse.data || [];

      setMyFamily(myFamilyData);
      setMembers(myFamilyMembers);
      setAllFamilies(familiesList);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError('Failed to load families: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-xl" style={{ color: 'var(--text-primary)' }}>Loading Families...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-2xl w-full rounded-lg shadow-lg p-8 border-2 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-3xl font-bold mb-4 text-red-500">Error Loading Families</h2>
          <p className="text-xl mb-6" style={{ color: 'var(--text-primary)' }}>{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchFamilyData();
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
        <h1 className="mafia-title text-5xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>
          Families
        </h1>

        {/* My Family Section */}
        {myFamily && (
          <div className="rounded-lg shadow-lg p-8 border-2 mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="mafia-title text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {myFamily.family_name} Family
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Don</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{myFamily.don || 'Not Assigned'}</p>
              </div>
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Total Money</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${myFamily.total_money || 0}</p>
              </div>
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Members</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{myFamily.members || 0}</p>
              </div>
            </div>

            {/* Family Members */}
            {members.length > 0 && (
              <>
                <h3 className="text-2xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Family Members</h3>
                <div className="grid gap-4">
                  {members.map((member, idx) => (
                    <div
                      key={member.player_id || idx}
                      className="p-6 rounded-lg flex justify-between items-center"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <div>
                        <p className="font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>{member.name || 'Unknown'}</p>
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{member.role || 'No Role'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>${member.balance || 0}</p>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Score: {member.individual_score || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* All Families Leaderboard */}
        <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--text-primary)' }}>
          <h2 className="mafia-title text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            All Families ({allFamilies.length})
          </h2>
          {allFamilies.length > 0 ? (
            <div className="grid gap-5">
              {allFamilies.map((family, index) => (
                <div key={index} className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{family.family_name}</h3>
                      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Don: {family.don || 'Not Assigned'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>${family.total_money || 0}</p>
                      <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Members: {family.members || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-xl" style={{ color: 'var(--text-secondary)' }}>No families found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FamilyNew;
