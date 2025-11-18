import { useState, useEffect } from 'react';
import { familyAPI } from '../services/api';

function Family() {
  const [myFamily, setMyFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [allFamilies, setAllFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const [familyRes, familiesRes] = await Promise.all([
        familyAPI.getMyFamily().catch(() => ({ data: { family: null, members: [] } })),
        familyAPI.getAllFamilies(),
      ]);

      setMyFamily(familyRes.data.family);
      setMembers(familyRes.data.members || []);
      setAllFamilies(familiesRes.data.families || familiesRes.data || []);
    } catch (error) {
      console.error('Error fetching family data:', error);
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
        <h1 className="mafia-title text-5xl font-bold mb-10" style={{ color: 'var(--text-primary)' }}>Family</h1>

        {/* My Family Section */}
        {myFamily && (
          <div className="rounded-lg shadow-lg p-8 border-2 mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
            <h2 className="mafia-title text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {myFamily.family_name} Family
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Don</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{myFamily.don}</p>
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
            <h3 className="text-2xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Family Members</h3>
            <div className="grid gap-4">
              {members.map((member) => (
                <div key={member.player_id} className="p-6 rounded-lg flex justify-between items-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div>
                    <p className="font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{member.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>${member.money || member.balance || 0}</p>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Score: {member.individual_score || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Families Leaderboard */}
        <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--text-primary)' }}>
          <h2 className="mafia-title text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>All Families</h2>
          <div className="grid gap-5">
            {allFamilies.map((family, index) => (
              <div key={index} className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{family.family_name}</h3>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Don: {family.don}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>${family.total_money || 0}</p>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Members: {family.members || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Family;
