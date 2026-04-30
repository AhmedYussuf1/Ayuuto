// this lets me move between pages
import { useNavigate, useParams } from "react-router-dom";

// this is the css for this page
import "../css/view-group.css";

// this is the view group page
export default function ViewGroupPage() {
  const navigate = useNavigate();

  // this gets the group id from the url like /group/1
  const { id } = useParams();

  // fake group data for now
  // later this will come from backend using the id
  const group = {
    id,
    name: "Friends Savings",
    contributionAmount: "$100 / month",
    cycle: "Monthly",
    status: "Active",
    nextPayout: "Bryan",
    totalSaved: "$2,000",
    inviteCode: "AYU123",
    members: [
      { name: "Ahmed", paymentStatus: "Paid", payoutPosition: "#1" },
      { name: "Bryan", paymentStatus: "Paid", payoutPosition: "#2" },
      { name: "Mai", paymentStatus: "Pending", payoutPosition: "#3" },
    ],
    activity: [
      "Bryan paid contribution on March 20",
      "Ahmed payout confirmed on March 22",
      "Next group due date is March 29",
    ],
  };

  // this copies the invite code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      alert("Invite code copied");
    } catch (error) {
      alert("Could not copy code");
    }
  };

  return (
    <div className="view-group-page">
      {/* NAVBAR */}
      <nav className="view-group-nav">
        <div className="view-group-logo">AYUUTO</div>

        <div className="view-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="view-group-container">
        {/* top section */}
        <div className="view-group-header">
          <div>
            <h1>{group.name}</h1>
            <p>
              Contribution: {group.contributionAmount} | Cycle: {group.cycle} | Status: {group.status}
            </p>
          </div>

          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {/* stat cards */}
        <div className="view-group-stats">
          <div className="group-stat-card">
            <h3>Members</h3>
            <p>{group.members.length}</p>
          </div>

          <div className="group-stat-card">
            <h3>Next Payout</h3>
            <p>{group.nextPayout}</p>
          </div>

          <div className="group-stat-card">
            <h3>Total Saved</h3>
            <p>{group.totalSaved}</p>
          </div>
        </div>

        {/* invite section */}
        <section className="invite-section">
          <div className="invite-section-text">
            <h2>Invite Members</h2>
            <p>Share this private code so invited users can join your group.</p>
          </div>

          <div className="invite-code-box">
            <span className="invite-code-label">Group Code</span>
            <div className="invite-code-row">
              <div className="invite-code-value">{group.inviteCode}</div>

              <button className="copy-btn" onClick={handleCopyCode}>
                Copy Code
              </button>
              
              <button
            className="copy-btn"
            onClick={() => navigate(`/group/${id}/invite`)}
              >
            Manage Invites
              </button>
           
            <button onClick={() => navigate(`/group/${id}/approve-members`)}>
              Approve Members
            </button>

            <button onClick={() => navigate(`/group/${id}/contribute`)}>
              Make Contribution
            </button>

            <button onClick={() => navigate(`/group/${id}/payouts`)}>
              View Payouts
            </button>

            <button onClick={() => navigate(`/group/${id}/settings`)}>
              Group Settings
            </button>
              
            </div>
          </div>
        </section>

        {/* main grid */}
        <div className="view-group-grid">
          {/* members section */}
          <section className="view-group-section">
            <h2>Members</h2>

            <div className="members-list">
              {group.members.map((member, index) => (
                <div className="member-card" key={index}>
                  <div>
                    <h3>{member.name}</h3>
                    <p>{member.paymentStatus}</p>
                  </div>

                  <span className="payout-badge">
                    Payout Position {member.payoutPosition}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* recent activity section */}
          <section className="view-group-section">
            <h2>Recent Activity</h2>

            {group.activity.map((item, index) => (
              <div className="group-activity-card" key={index}>
                <p>{item}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}