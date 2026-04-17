import { useNavigate, useParams } from "react-router-dom";
import "../css/approve-members.css";

export default function ApproveMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const group = {
    id,
    name: "Friends Savings",
    pendingRequests: [
      {
        name: "Ahmed Yusuf",
        email: "ahmed@gmail.com",
        requestedAt: "April 5, 2026",
      },
      {
        name: "Mai Hassan",
        email: "mai@gmail.com",
        requestedAt: "April 6, 2026",
      },
    ],
  };

  return (
    <div className="approve-members-page">
      <nav className="approve-members-nav">
        <div className="approve-members-logo">AYUUTO</div>

        <div className="approve-members-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>Back to Group</button>
        </div>
      </nav>

      <div className="approve-members-container">
        <div className="approve-members-header">
          <h1>Approve Members</h1>
          <p>Review pending join requests for {group.name}.</p>
        </div>

        <section className="approve-members-section">
          <h2>Pending Requests</h2>

          <div className="request-list">
            {group.pendingRequests.map((member, index) => (
              <div className="request-card" key={index}>
                <div className="request-info">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                  <span>Requested: {member.requestedAt}</span>
                </div>

                <div className="request-actions">
                  <button
                    className="approve-btn"
                    onClick={() => alert(`${member.name} approved`)}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => alert(`${member.name} rejected`)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}