import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/view-group.css";

export default function ViewGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const token = localStorage.getItem("token");

        const groupRes = await fetch(`http://localhost:3001/group/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const groupData = await groupRes.json();

        if (!groupRes.ok) {
          throw new Error(groupData.error || "Failed to load group");
        }

        const membershipRes = await fetch(
          `http://localhost:3001/membership/group/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const membershipData = await membershipRes.json();

        if (!membershipRes.ok) {
          throw new Error(membershipData.error || "Failed to load members");
        }

        setGroup(groupData);
        setMembers(membershipData);
      } catch (error) {
        console.error("View group error:", error);
        alert(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(`GROUP-${id}`);
      alert("Group code copied");
    } catch (error) {
      alert("Could not copy code");
    }
  };

  if (loading) {
    return <div className="view-group-page">Loading group...</div>;
  }

  if (!group) {
    return <div className="view-group-page">Group not found.</div>;
  }

  return (
    <div className="view-group-page">
      <nav className="view-group-nav">
        <div className="view-group-logo">AYUUTO</div>

        <div className="view-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      <div className="view-group-container">
        <div className="view-group-header">
          <div>
            <h1>{group.group_name}</h1>
            <p>
              Start Date: {group.start_cycle_date} | Status: Active
            </p>
          </div>

          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="view-group-stats">
          <div className="group-stat-card">
            <h3>Members</h3>
            <p>{members.length}</p>
          </div>

          <div className="group-stat-card">
            <h3>Next Payout</h3>
            <p>{members.length > 0 ? members[0].full_name : "N/A"}</p>
          </div>

          <div className="group-stat-card">
            <h3>Total Saved</h3>
            <p>--</p>
          </div>
        </div>

        <section className="invite-section">
          <div className="invite-section-text">
            <h2>Invite Members</h2>
            <p>Share this private code so invited users can join your group.</p>
          </div>

          <div className="invite-code-box">
            <span className="invite-code-label">Group Code</span>
            <div className="invite-code-row">
              <div className="invite-code-value">{`GROUP-${id}`}</div>

              <button className="copy-btn" onClick={handleCopyCode}>
                Copy Code
              </button>

              <button
                className="copy-btn"
                onClick={() => navigate(`/group/${id}/invite`)}
              >
                Manage Invites
              </button>

              <button
                className="copy-btn"
                onClick={() => navigate(`/group/${id}/approve-members`)}
              >
                Approve Members
              </button>

              <button
                className="copy-btn"
                onClick={() => navigate(`/group/${id}/contribute`)}
              >
                Make Contribution
              </button>

              <button
                className="copy-btn"
                onClick={() => navigate(`/group/${id}/payouts`)}
              >
                View Payouts
              </button>

              <button
                className="copy-btn"
                onClick={() => navigate(`/group/${id}/settings`)}
              >
                Group Settings
              </button>
            </div>
          </div>
        </section>

        <div className="view-group-grid">
          <section className="view-group-section">
            <h2>Members</h2>

            <div className="members-list">
              {members.map((member) => (
                <div className="member-card" key={member.membership_id}>
                  <div>
                    <h3>{member.full_name}</h3>
                    <p>{member.role}</p>
                  </div>

                  <span className="payout-badge">
                    Payout Position {member.payout_position ?? "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="view-group-section">
            <h2>Recent Activity</h2>

            <div className="group-activity-card">
              <p>Group loaded successfully.</p>
            </div>
            <div className="group-activity-card">
              <p>{members.length} member(s) currently in this group.</p>
            </div>
            <div className="group-activity-card">
              <p>Start cycle date: {group.start_cycle_date}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}