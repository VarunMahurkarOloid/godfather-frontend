import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',  // Required for ngrok-free plan
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('player');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password, role = null) =>
    api.post('/auth/login', { email, password, role }),

  verifyToken: (token) =>
    api.get('/auth/verify', { params: { token } }),
};

// Player APIs
export const playerAPI = {
  getPlayer: (playerId) =>
    api.get(`/player/${playerId}`),

  getMyProfile: () =>
    api.get('/player/me/profile'),

  getAllPlayers: () =>
    api.get('/player/'),

  getLeaderboard: (limit = 10) =>
    api.get('/player/leaderboard/top', { params: { limit } }),

  getNews: () =>
    api.get('/player/news/all'),
};

// Mission APIs
export const missionAPI = {
  getTodayMissions: () =>
    api.get('/missions/today'),

  getAllMissions: (day = null, allDays = false) =>
    api.get('/missions/all', { params: { day, all_days: allDays } }),

  getMission: (missionId) =>
    api.get(`/missions/${missionId}`),

  completeMission: (missionId, playerId = null) =>
    api.post('/missions/complete', { mission_id: missionId, player_id: playerId }),

  puzzleSolved: (playerId = null, puzzleId = null) =>
    api.post('/missions/puzzle-solved', { player_id: playerId, puzzle_id: puzzleId }),
};

// Trade APIs
export const tradeAPI = {
  transferMoney: (toPlayerId, amount, message = null) =>
    api.post('/trades/transfer-money', { to_player_id: toPlayerId, amount, message }),

  getTradeHistory: () =>
    api.get('/trades/history'),

  getAllTrades: () =>
    api.get('/trades/all'),
};

// Family APIs
export const familyAPI = {
  getAllFamilies: () =>
    api.get('/families/'),

  getFamily: (familyName) =>
    api.get(`/families/${familyName}`),

  getFamilyMembers: (familyName) =>
    api.get(`/families/${familyName}/members`),

  getFamilyLeaderboard: (limit = 10) =>
    api.get('/families/leaderboard/top', { params: { limit } }),

  getMyFamily: () =>
    api.get('/families/my/family'),
};

// Admin APIs
export const adminAPI = {
  getAllPlayers: () =>
    api.get('/admin/players'),

  updateMoney: (playerId, amount, reason = null) =>
    api.post('/admin/update-money', { player_id: playerId, amount, reason }),

  updatePlayerStats: (playerId, stats) =>
    api.post('/admin/update-stats', { player_id: playerId, ...stats }),

  publishNews: (title, message) =>
    api.post('/admin/publish-news', { title, message }),

  getAllNews: () =>
    api.get('/admin/news'),

  getDashboard: () =>
    api.get('/admin/dashboard'),

  eliminatePlayer: (playerId, reason = null) =>
    api.post('/admin/eliminate-player', { player_id: playerId, reason }),

  revivePlayer: (playerId) =>
    api.post('/admin/revive-player', { player_id: playerId }),

  assignRole: (playerId, role, family, balance = 0) =>
    api.post('/admin/assign-role', { player_id: playerId, role, family, balance }),

  getGameState: () =>
    api.get('/admin/game-state'),

  setGameDay: (day) =>
    api.post('/admin/set-game-day', null, { params: { day } }),

  setBlackMarketHour: (hour) =>
    api.post('/admin/set-blackmarket-hour', null, { params: { hour } }),
};

export default api;
