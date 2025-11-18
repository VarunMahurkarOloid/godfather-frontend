import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_email');
    const savedPassword = localStorage.getItem('saved_password');
    const savedRole = localStorage.getItem('saved_role');

    if (savedEmail && savedPassword && savedRole) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setSelectedRole(savedRole);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate role selection
    if (!selectedRole) {
      setError('Please select your role to continue');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(email, password, selectedRole);
      const { access_token, player, is_first_login, assigned_role } = response.data;

      if (is_first_login) {
        // First time login - verify role matches
        if (selectedRole !== assigned_role) {
          setError(`You are assigned the role: ${assigned_role}. Please select the correct role.`);
          setLoading(false);
          return;
        }
      }

      // Successful login
      localStorage.setItem('token', access_token);
      localStorage.setItem('player', JSON.stringify(player));

      // Store credentials for auto-login (Note: This is for convenience in internal game environment)
      localStorage.setItem('saved_email', email);
      localStorage.setItem('saved_password', password);
      localStorage.setItem('saved_role', selectedRole);

      onLogin(player, player.role === 'Godfather');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials and role selection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-lg w-full space-y-6 sm:space-y-8 p-6 sm:p-12 rounded-xl shadow-2xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
        <div>
          <h2 className="mafia-title text-center text-3xl sm:text-5xl font-extrabold mb-2 sm:mb-3" style={{ color: 'var(--text-primary)' }}>
            The Godfather
          </h2>
          <p className="mt-2 text-center text-base sm:text-lg opacity-80" style={{ color: 'var(--text-primary)' }}>
            Office Mafia Game
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="your.email@oloid.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Select Your Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-lg relative block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border focus:outline-none focus:ring-2 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Choose your role...</option>
                <option value="Godfather">Godfather</option>
                <option value="Don">Don</option>
                <option value="Caporegime">Caporegime</option>
                <option value="Detective">Detective</option>
                <option value="Merchant">Merchant</option>
                <option value="Doctor">Doctor</option>
                <option value="Citizen">Citizen</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-md p-4 border" style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--accent-primary)' }}>
              <p className="text-base" style={{ color: 'var(--error-text)' }}>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-3 px-4 border border-transparent text-base sm:text-lg font-bold rounded-lg disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-primary)'
              }}
            >
              {loading ? 'Logging in...' : 'Enter the Family'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm opacity-60" style={{ color: 'var(--text-primary)' }}>
            Select your assigned role to access the game
          </p>
          <p className="text-xs opacity-40 mt-2" style={{ color: 'var(--text-primary)' }}>
            Your credentials will be saved for automatic login
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
