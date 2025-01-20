import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "./Ranking.css";
import TopBar from "./teacherTopbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const Ranking = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).access_token
    : null;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch rankings
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError(null);

        const payload = { httpMethod: "POST" };
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/ranking`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const parsedBody = JSON.parse(response.data.body);
        if (Array.isArray(parsedBody.ranking)) {
          const sortedData = parsedBody.ranking.sort(
            (a, b) => b.total_points - a.total_points
          );
          setRankings(sortedData);
        } else {
          console.error("Unexpected data structure:", parsedBody);
          setError("Invalid response format from API.");
        }
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(err.message || "An error occurred while fetching rankings.");
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [token]);

  // Split top 3 and others
  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  return (
    <div className="ranking-page">
      <TopBar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="ranking-container">
        <h1 className="ranking-title">Leaderboard</h1>

        {/* Loading or Error State */}
        {loading ? (
          <p className="loading-message">Loading leaderboard...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <>
            {/* Top 3 Section */}
            <div className="top-3-container">
              {top3.map((user, index) => (
                <div
                  className={`top-card top-${index + 1}`}
                  key={user.user_id || index}
                >
                  <div className="top-rank">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="top-info">
                    <h2 className="top-name">{user?.user_name || "N/A"}</h2>
                    <p className="top-points">{user?.total_points || 0} points</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Rankings */}
            {others.length > 0 && (
              <div className="ranking-table">
                <div className="ranking-header">
                  <span className="header-rank">Rank</span>
                  <span className="header-name">Name</span>
                  <span className="header-points">Points</span>
                </div>
                {others.map((ranking, index) => (
                  <div className="ranking-row" key={ranking.user_id}>
                    <span className="rank">{index + 4}</span>
                    <span className="name">{ranking.user_name}</span>
                    <span className="points">{ranking.total_points} points</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Ranking;
