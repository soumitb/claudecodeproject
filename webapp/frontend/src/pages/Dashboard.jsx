import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => setError("Failed to load user info"));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 600, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>Dashboard</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Account active:</strong> {user.is_active ? "Yes" : "No"}
          </p>
          <p>
            <strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        !error && <p>Loading...</p>
      )}
      <button onClick={logout} style={{ marginTop: 20, padding: "8px 16px" }}>
        Logout
      </button>
    </div>
  );
}
