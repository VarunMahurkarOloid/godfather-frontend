import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Trade from './pages/Trade';
import Leaderboard from './pages/Leaderboard';
import Family from './pages/Family';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptAutoLogin();
  }, []);

  const attemptAutoLogin = async () => {
    // First check if there's an existing valid token
    const token = localStorage.getItem('token');
    const player = localStorage.getItem('player');

    if (token && player) {
      const playerData = JSON.parse(player);
      setIsAuthenticated(true);
      setIsAdmin(
        playerData.role === 'admin' ||
        playerData.role === 'Godfather' ||
        playerData.player_id === 0 ||
        playerData.player_id === 'admin-uuid'
      );
      setLoading(false);
      return;
    }

    // If no token, try auto-login with saved credentials
    const savedEmail = localStorage.getItem('saved_email');
    const savedPassword = localStorage.getItem('saved_password');
    const savedRole = localStorage.getItem('saved_role');

    if (savedEmail && savedPassword && savedRole) {
      try {
        console.log('Attempting auto-login...');
        const response = await authAPI.login(savedEmail, savedPassword, savedRole);
        const { access_token, player: playerData } = response.data;

        // Store token and player data
        localStorage.setItem('token', access_token);
        localStorage.setItem('player', JSON.stringify(playerData));

        setIsAuthenticated(true);
        setIsAdmin(
          playerData.role === 'admin' ||
          playerData.role === 'Godfather' ||
          playerData.player_id === 0 ||
          playerData.player_id === 'admin-uuid'
        );
        console.log('Auto-login successful!');
      } catch (error) {
        console.error('Auto-login failed:', error);
        // Clear invalid saved credentials
        localStorage.removeItem('saved_email');
        localStorage.removeItem('saved_password');
        localStorage.removeItem('saved_role');
      }
    }

    setLoading(false);
  };

  const handleLogin = (playerData, isAdminUser = false) => {
    setIsAuthenticated(true);
    setIsAdmin(isAdminUser);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('player');

    // Clear saved credentials to prevent auto-login
    localStorage.removeItem('saved_email');
    localStorage.removeItem('saved_password');
    localStorage.removeItem('saved_role');

    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mafia-black flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-mafia-black">
        {isAuthenticated && <Navbar onLogout={handleLogout} isAdmin={isAdmin} />}

        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/missions"
            element={
              isAuthenticated ? (
                <Missions />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/trade"
            element={
              isAuthenticated ? (
                <Trade />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/leaderboard"
            element={
              isAuthenticated ? (
                <Leaderboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/family"
            element={
              isAuthenticated ? (
                <Family />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              isAuthenticated && isAdmin ? (
                <Admin />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
