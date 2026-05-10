import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => setError("Failed to load user info"));
  }, []);

  function toggleDark() {
    setDark((prev) => {
      localStorage.setItem("darkMode", String(!prev));
      return !prev;
    });
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const theme = {
    background: dark ? "#1a1a2e" : "#ffffff",
    color: dark ? "#e0e0e0" : "#111111",
    cardBackground: dark ? "#16213e" : "#f5f5f5",
    border: dark ? "#0f3460" : "#dddddd",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.color,
        fontFamily: "sans-serif",
        transition: "background 0.2s, color 0.2s",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <button
            onClick={toggleDark}
            style={{
              background: "none",
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer",
              color: theme.color,
              fontSize: 14,
            }}
          >
            {dark ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        {error && <p style={{ color: "#e05c5c" }}>{error}</p>}

        {user ? (
          <div
            style={{
              background: theme.cardBackground,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "20px 24px",
            }}
          >
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Account active:</strong> {user.is_active ? "Yes" : "No"}</p>
            <p style={{ margin: 0 }}>
              <strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        ) : (
          !error && <p>Loading...</p>
        )}

        <button
          onClick={logout}
          style={{
            marginTop: 24,
            padding: "8px 20px",
            cursor: "pointer",
            background: dark ? "#0f3460" : "#111111",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
