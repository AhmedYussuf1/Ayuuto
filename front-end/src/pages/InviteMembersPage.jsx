import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import "../css/invite-members.css";

export default function InviteMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [email, setEmail] = useState("");

  const copyGroupId = async () => {
    await navigator.clipboard.writeText(id);
    alert("Group ID copied");
  };

  return (
    <div className="invite-members-page">
      {/* NAV */}
      <nav className="invite-members-nav">
        <div className="invite-members-logo">AYUUTO</div>

        <div className="invite-members-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>
            Back to Group
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div className="invite-members-container">
        <div className="invite-header">
          <h1>Invite Members</h1>
          <p>Share your group or invite by email.</p>
        </div>

        {/* SHARE GROUP */}
        <div className="invite-card">
          <h2>Share Group ID</h2>
          <p>Users can join using this ID on the Join Group page.</p>

          <div className="invite-row">
            <div className="invite-id-box">#{id}</div>

            <button className="primary-btn" onClick={copyGroupId}>
              Copy ID
            </button>
          </div>
        </div>

        {/* EMAIL */}
        <div className="invite-card">
          <h2>Invite by Email</h2>

          <div className="invite-row">
            <input
              type="email"
              placeholder="Enter member email"
              className="invite-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="primary-btn">Send Invite</button>
          </div>
        </div>

        {/* INVITES LIST */}
        <div className="invite-card">
          <h2>Invitations</h2>

          <div className="empty-state">
            <p>No invitations yet</p>
            <span>Invitations will appear here.</span>
          </div>
        </div>
      </div>
    </div>
  );
}