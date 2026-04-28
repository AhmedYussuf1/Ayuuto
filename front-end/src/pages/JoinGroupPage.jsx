// this lets me move between pages
import { useNavigate } from "react-router-dom";

// this lets me store what the user types
import { useState } from "react";

// firebase config so i can get the logged in user
import { auth } from "../logicCode/config";

// css for this page
import "../css/join-group.css";

export default function JoinGroupPage() {
  const navigate = useNavigate();

  // this stores the group id the user types
  const [groupId, setGroupId] = useState("");

  // this stores error messages
  const [error, setError] = useState("");

  // this stops the user from clicking join many times
  const [loading, setLoading] = useState(false);

  // this gets the Firebase token
  // the backend needs this token for protected routes
  async function getToken() {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error("You must be logged in");
    }

    return firebaseUser.getIdToken();
  }

  // small helper so i do not repeat the same fetch setup
  async function backendRequest(endpoint, options = {}) {
    const token = await getToken();

    const response = await fetch(`http://localhost:3001${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Backend request failed");
    }

    return data;
  }

  // this runs when user clicks join group
  async function handleJoinGroup(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      if (!groupId.trim()) {
        setError("Please enter a group ID");
        return;
      }

      // first get the current logged in member from the database
      // backend route: GET /member/me
      const member = await backendRequest("/member/me");

      // then create membership for this user and this group
      // backend route: POST /membership
      await backendRequest("/membership", {
        method: "POST",
        body: JSON.stringify({
          member_id: member.member_id,
          group_id: groupId.trim(),
          role: "MEMBER",
        }),
      });

      // after joining, go to the group page
      navigate(`/group/${groupId.trim()}`);
    } catch (error) {
      console.error("Join group error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="join-group-page">
      <nav className="join-group-nav">
        <div className="join-group-logo">AYUUTO</div>

        <div className="join-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      <div className="join-group-container">
        <div className="join-group-header">
          <h1>Join a Group</h1>
          <p>
            Enter the group ID. The current backend supports joining by group ID.
          </p>
        </div>

        {error && <p className="alert alert-warning">{error}</p>}

        <form className="join-group-form" onSubmit={handleJoinGroup}>
          <label>Group ID</label>

          <input
            type="text"
            placeholder="Enter group id"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />

          <p className="join-group-note">
            Ask the group admin for the group ID from their group page.
          </p>

          <div className="join-group-buttons">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>

            <button type="submit" className="join-btn" disabled={loading}>
              {loading ? "Joining..." : "Join Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}