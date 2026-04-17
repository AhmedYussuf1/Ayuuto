import { useNavigate, useParams } from "react-router-dom";
import "../css/invite-members.css";

export default function InviteMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // fake group data for now
  const group = {
    id,
    name: "Friends Savings",
    inviteCode: "AYU123",
    pendingInvites: [
      { email: "ahmed@gmail.com", status: "Pending" },
      { email: "mai@gmail.com", status: "Pending" },
    ],
  };

  return (
    <div className="invite-members-page">
      <nav className="invite-members-nav">
        <div className="invite-members-logo">AYUUTO</div>

        <div className="invite-members-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>Back to Group</button>
        </div>
      </nav>

      <div className="invite-members-container">
        <div className="invite-members-header">
          <div>
            <h1>Invite Members</h1>
            <p>Add people to {group.name} using email or the group code.</p>
          </div>
        </div>

        <section className="invite-members-section">
          <h2>Share Group Code</h2>
          <p>Send this code to people so they can join your group.</p>

          <div className="invite-code-box">
            <div className="invite-code-value">{group.inviteCode}</div>
            <button
              className="copy-btn"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(group.inviteCode);
                  alert("Invite code copied!");
                } catch (error) {
                  alert("Could not copy code");
                }
              }}
            >
              Copy Code
            </button>
          </div>
        </section>

        <section className="invite-members-section">
          <h2>Invite by Email</h2>
          <p>Type an email address and send an invitation.</p>

          <div className="invite-form">
            <input
              type="email"
              placeholder="Enter member email"
              className="invite-input"
            />
            <button
              className="send-invite-btn"
              onClick={() => alert("Invite feature will connect to backend later")}
            >
              Send Invite
            </button>
          </div>
        </section>

        <section className="invite-members-section">
          <h2>Pending Invites</h2>

          <div className="pending-invites-list">
            {group.pendingInvites.map((invite, index) => (
              <div className="pending-invite-card" key={index}>
                <div>
                  <h3>{invite.email}</h3>
                  <p>{invite.status}</p>
                </div>

                <button
                  className="remove-invite-btn"
                  onClick={() => alert("Remove invite feature will connect later")}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}