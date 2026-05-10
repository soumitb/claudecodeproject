import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const navigate = useNavigate();

  function toggleDark() {
    setDark((prev) => {
      localStorage.setItem("darkMode", String(!prev));
      return !prev;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      const { data } = await client.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail ?? "Login failed");
    }
  }

  const theme = {
    background: dark ? "#1a1a2e" : "#ffffff",
    color: dark ? "#e0e0e0" : "#111111",
    inputBackground: dark ? "#0f3460" : "#ffffff",
    inputBorder: dark ? "#16213e" : "#cccccc",
    border: dark ? "#0f3460" : "#dddddd",
  };

  const inputStyle = {
    width: "100%",
    padding: 8,
    marginBottom: 12,
    background: theme.inputBackground,
    color: theme.color,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 4,
    boxSizing: "border-box",
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
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "80px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Login</h2>
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
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <br />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          {error && <p style={{ color: "#e05c5c" }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              cursor: "pointer",
              background: dark ? "#0f3460" : "#111111",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
            }}
          >
            Login
          </button>
        </form>
        <p>
          No account? <Link to="/register" style={{ color: dark ? "#7eb8f7" : "#0066cc" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
