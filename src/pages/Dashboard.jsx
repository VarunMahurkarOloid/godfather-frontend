import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playerAPI, familyAPI } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Dashboard() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [news, setNews] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeadModal, setShowDeadModal] = useState(false);
  const [markingDead, setMarkingDead] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [playerRes, newsRes] = await Promise.all([
        playerAPI.getMyProfile(),
        playerAPI.getNews().catch(() => ({ data: { news: [] } })),
      ]);

      // Process player data to handle Google Sheets format
      const playerData = playerRes.data;

      // Handle role field - use assigned_role if role is #N/A or empty
      if (!playerData.role || playerData.role === "#N/A" || playerData.role === "") {
        playerData.role = playerData.assigned_role || "Unassigned";
      }

      // Ensure numeric fields have default values
      playerData.balance = playerData.balance || 0;
      playerData.total_score = playerData.total_score || 0;
      playerData.missions_completed = playerData.missions_completed || 0;
      playerData.heals_performed = playerData.heals_performed || 0;
      playerData.kills_made = playerData.kills_made || 0;
      playerData.trades_completed = playerData.trades_completed || 0;

      // Handle alive field - convert string "TRUE"/"FALSE" to boolean
      if (typeof playerData.alive === "string") {
        playerData.alive = playerData.alive.toUpperCase() === "TRUE";
      }

      setPlayer(playerData);
      setNews(newsRes.data.news || []);

      // Fetch family members if player has a family
      if (playerData.family) {
        try {
          const familyRes = await familyAPI.getFamilyMembers(
            playerData.family
          );
          setFamilyMembers(familyRes.data || []);
        } catch (error) {
          console.log("Could not fetch family members:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDead = async () => {
    setMarkingDead(true);
    try {
      const response = await fetch(`${API_BASE_URL}/player/me/mark-dead`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Reload player data to reflect dead status
        const playerRes = await playerAPI.getMyProfile();
        setPlayer(playerRes.data);
        setShowDeadModal(false);
      }
    } catch (error) {
      console.error("Error marking player as dead:", error);
    } finally {
      setMarkingDead(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Check if player is dead
  const isDead = player?.alive === false || player?.alive === "FALSE";

  return (
    <div
      className="min-h-screen py-4 sm:py-8"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Are you dead button - Outside player card */}
        {!isDead && (
          <div className="flex justify-end mb-4 sm:mb-6">
            <button
              onClick={() => setShowDeadModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-lg font-medium transition hover:opacity-80"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error-text)",
                borderColor: "var(--error-text)",
                border: "2px solid",
              }}
            >
              Are you dead?
            </button>
          </div>
        )}

        {/* Player Info Card */}
        <div
          className="rounded-lg shadow-lg p-4 sm:p-8 border-2 mb-4 sm:mb-8"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--accent-primary)",
          }}
        >
          <h1
            className="mafia-title text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome, {player?.name}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div
              className="p-3 sm:p-6 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-sm sm:text-lg mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Money
              </p>
              <p
                className="text-xl sm:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                ${player?.balance || 0}
              </p>
            </div>
            <div
              className="p-3 sm:p-6 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-sm sm:text-lg mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Role
              </p>
              <p
                className="text-base sm:text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {player?.role}
              </p>
            </div>
            <div
              className="p-3 sm:p-6 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-sm sm:text-lg mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Family
              </p>
              <p
                className="text-base sm:text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {player?.family || "No Family"}
              </p>
            </div>
            <div
              className="p-3 sm:p-6 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-sm sm:text-lg mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Score
              </p>
              <p
                className="text-xl sm:text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {player?.total_score || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-3 sm:mt-6">
            <div
              className="p-3 sm:p-5 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-xs sm:text-base mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Missions
              </p>
              <p
                className="text-lg sm:text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {player?.missions_completed || 0}
              </p>
            </div>
            <div
              className="p-3 sm:p-5 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-xs sm:text-base mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Heals
              </p>
              <p
                className="text-lg sm:text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {player?.heals_performed || 0}
              </p>
            </div>
            <div
              className="p-3 sm:p-5 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-xs sm:text-base mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Kills
              </p>
              <p
                className="text-lg sm:text-2xl font-bold"
                style={{ color: "var(--accent-primary)" }}
              >
                {player?.kills_made || 0}
              </p>
            </div>
            <div
              className="p-3 sm:p-5 rounded-lg"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <p
                className="text-xs sm:text-base mb-1 sm:mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Trades
              </p>
              <p
                className="text-lg sm:text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {player?.trades_completed || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Dead Player Message */}
        {isDead && (
          <div
            className="rounded-lg shadow-lg p-12 border-2 mb-8 text-center"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--error-text)",
            }}
          >
            <div className="mb-6">
              <svg
                className="w-32 h-32 mx-auto"
                style={{ color: "var(--error-text)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2
              className="mafia-title text-4xl font-bold mb-4"
              style={{ color: "var(--error-text)" }}
            >
              You Have Been Eliminated
            </h2>
            <p
              className="text-2xl mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Your journey in the game has ended.
            </p>
            <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
              You can view your final stats above, but cannot participate in
              missions or activities.
            </p>
          </div>
        )}

        {/* Family Members Section - Hidden for dead players */}
        {!isDead && player?.family && familyMembers.length > 0 && (
          <div
            className="rounded-lg shadow-lg p-8 border-2 mb-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mafia-title text-3xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              {player.family} Family ({familyMembers.length} members)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {familyMembers.map((member, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <p
                    className="font-semibold text-lg mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {member.name === player.name
                      ? `${member.name} (You)`
                      : member.name}
                  </p>
                  <p
                    className="text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {member.role}
                  </p>
                  <p
                    className="text-base mt-1"
                    style={{
                      color: member.alive
                        ? "var(--success-text)"
                        : "var(--error-text)",
                    }}
                  >
                    {member.alive ? "✓ Alive" : "✗ Eliminated"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Section - Hidden for dead players */}
        {!isDead && news && news.length > 0 && (
          <div
            className="rounded-lg shadow-lg p-8 border-2 mb-8"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="mafia-title text-3xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              News & Announcements
            </h2>
            <div className="space-y-4">
              {news.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <h3
                    className="font-semibold text-xl mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-lg mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.message}
                  </p>
                  <p
                    className="text-base mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions - Hidden for dead players */}
        {!isDead && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => navigate("/missions")}
              className="p-8 rounded-lg border-2 transition hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--accent-primary)",
              }}
            >
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    style={{ color: "var(--accent-primary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Missions
                </h3>
                <p
                  className="text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  View and complete missions
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/trade")}
              className="p-8 rounded-lg border-2 transition hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--accent-primary)",
              }}
            >
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    style={{ color: "var(--accent-primary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Black Market
                </h3>
                <p
                  className="text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Trade items and resources
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Tradeable Items Section - Hidden for dead players */}
        {!isDead && (
          <div
            className="rounded-lg shadow-lg p-8 border-2"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--accent-primary)",
            }}
          >
            <h2
              className="mafia-title text-3xl font-bold mb-8 text-center"
              style={{ color: "var(--text-primary)" }}
            >
              Tradeable Items in the Game
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gun Card */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🔫 Gun Card
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Allows only 1 kill.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Say: "Bang! You're dead."
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; If the target has a Gun or Protection Gun → both guns
                  cancel, no one dies.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; After use → gun is gone, you have to buy another, but
                  your role has been exposed.
                </p>
              </div>

              {/* Protection Gun Card */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🛡️ Protection Gun Card
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Used only by Citizens for protection.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; If attacked by a gun → Both guns cancel → Both survive
                  but guns are gone, you have to buy another from merchants, but
                  your role has been exposed.
                </p>
              </div>

              {/* Drugs Card */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  💊 Drugs Card
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; A fully tradeable card.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Can be bought or sold at any price.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Caporegimes must sell all drugs for their Don.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Detectives can arrest if a trade looks suspicious or
                  illegal.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Citizens with the most Drugs Card by the end of
                  Workaction will get a high score win.
                </p>
              </div>

              {/* Merchant Pass */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🛒 Merchant Pass
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Required to buy anything from the Merchant
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Without it, no trade will happen.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Give the pass to complete your purchase.
                </p>
              </div>

              {/* Arrest Card */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🚔 Arrest Card (Detectives Only)
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Allows arrest of any player.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Arrest fails if:
                </p>
                <p
                  className="text-base mb-2 ml-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  • Target bribes you
                </p>
                <p
                  className="text-base mb-2 ml-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  • You get shot first
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Can be used for real or fake charges.
                </p>
              </div>

              {/* Bribe Card */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  💵 Bribe Card
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Use this when you are arrested or someone tries to
                  kill you (Detectives or Caporegimes).
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Give a Bribe Card + 20,000 MD / 40,000 MD or more to
                  avoid arrest or death.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; They must accept it unless they choose violence.
                </p>
              </div>

              {/* Doctor Appointment Pass */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🩺 Doctor Appointment Pass
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; It's required to get medical help from the Doctor.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Lets you get healed from a gunshot or poison.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; No Doctor Appointment Card = The doctor can ignore you
                  & you die in a few hours.
                </p>
              </div>

              {/* Medical Care Card */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🧰 Medical Care Card (Doctor Only)
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Used to save gunshot victims only.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Doctor gives it only if: Victim has a Doctor
                  Appointment Card.
                </p>
              </div>

              {/* Vault Key */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🔑 Vault Key
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Opens the Family Vault (after getting all 3 code
                  numbers).
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Others: Can trade or sell for MD.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Anyone with all 3 numbers + this key → Go to Godfather
                  to open the vault.
                </p>
              </div>

              {/* Gold Bar */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  🏅 Gold Bar
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Emergency assets for Families.
                </p>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Can be sold to the Godfather for 20,000 MD each.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Good for survival when running low on funds.
                </p>
              </div>

              {/* Black Market Token */}
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  ⚫ Black Market Token
                </h3>
                <p
                  className="text-base mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Needed to buy rare or illegal items from the Black
                  Market.
                </p>
                <p
                  className="text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &#8594; Give the token to the Godfather before trading.
                </p>
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
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--error-text)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--border-color)" }}
              >
                <h2
                  className="text-3xl font-bold"
                  style={{ color: "var(--error-text)" }}
                >
                  Are You Dead?
                </h2>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p
                  className="text-xl mb-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Have you been eliminated from the game? This action cannot be
                  undone.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeadModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg text-lg font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: "var(--success-bg)",
                      color: "var(--success-text)",
                      border: "2px solid var(--success-text)",
                    }}
                    disabled={markingDead}
                  >
                    No
                  </button>
                  <button
                    onClick={handleMarkDead}
                    className="flex-1 py-3 px-4 rounded-lg text-lg font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: "var(--error-bg)",
                      color: "var(--error-text)",
                      border: "2px solid var(--error-text)",
                    }}
                    disabled={markingDead}
                  >
                    {markingDead ? "Processing..." : "Yes"}
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
