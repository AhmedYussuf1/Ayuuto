// this lets me move between pages
import { useNavigate } from "react-router-dom";

// this lets me store what user types
import { useState } from "react";

// this is the css for this page
import "../css/join-group.css";

// this is the join group page
export default function JoinGroupPage() {
  const navigate = useNavigate();

  // this stores the invite code user types
  const [inviteCode, setInviteCode] = useState("");

  // this runs when user clicks join group
  const handleJoinGroup = (e) => {
    e.preventDefault();

    // if input is empty dont continue
    if (!inviteCode.trim()) {
      alert("Please enter an invitation code");
      return;
    }

    // for now just show code in console
    console.log("Invite Code:", inviteCode);

    // later this is where backend/api will check if code is valid
    alert(`Joining group with code: ${inviteCode}`);

    // later you can send them to dashboard or group page
    navigate("/dashboard");
  };

  return (
    <div className="join-group-page">
      {/* NAVBAR */}
      <nav className="join-group-nav">
        <div className="join-group-logo">AYUUTO</div>

        <div className="join-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="join-group-container">
        <div className="join-group-header">
          <h1>Join a Group</h1>
          <p>Enter your invitation code to join a private savings group.</p>
        </div>

        {/* FORM CARD */}
        <form className="join-group-form" onSubmit={handleJoinGroup}>
          <label>Invitation Code</label>
          <input
            type="text"
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />

          <p className="join-group-note">
            Ask your group admin for the invitation code.
          </p>

          <div className="join-group-buttons">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>

            <button type="submit" className="join-btn">
              Join Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}