import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../logicCode/config";
import "../css/view-group.css";

export default function ViewGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // this gets the logged in Firebase user's token
  // the backend needs this so it knows the request is allowed
  async function getToken() {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in");
    }

    return user.getIdToken();
  }

  // this helper keeps the backend fetch code shorter
  async function backendGet(endpoint) {
    const token = await getToken();

    const response = await fetch(`http://localhost:3001${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Backend request failed");
    }

    return data;
  }

  // this loads the group, members, contributions, and payouts from backend
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const groupData = await backendGet(`/group/${id}`);
      const realGroup = groupData.group || groupData;

      setGroup({
        ...realGroup,
        payout_cycle: groupData.payout_cycle,
      });

      const memberData = await backendGet(`/membership/group/${id}`);
      setMembers(memberData || []);

      const contributionData = await backendGet(`/contribution/group/${id}`);
      setContributions(contributionData || []);

      const payoutData = await backendGet(`/payout/group/${id}`);
      setPayouts(payoutData || []);
    } catch (err) {
      console.error("View group error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  // this copies the group id so another user can use it on the Join Group page
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(id));
      alert("Group ID copied");
    } catch {
      alert("Could not copy Group ID");
    }
  };

  // this adds up all contribution amounts for the group
  const totalSaved = contributions.reduce((sum, contribution) => {
    return sum + Number(contribution.amount || 0);
  }, 0);

  // this tries to show the next unpaid payout if one exists
  const nextPayout =
    payouts.find((payout) => payout.status !== "PAID") || payouts[0] || null;

  if (loading) {
    return (
      <div className="view-group-page">
        <p>Loading group...</p>
      </div>
    );
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
        {error && <p className="alert alert-warning">{error}</p>}

        <div className="view-group-header">
          <div>
            <h1>{group?.group_name || "Group"}</h1>

            <p>
              Contribution: ${group?.payout_cycle?.contribution_amount || 0} |
              Cycle: {group?.payout_cycle?.frequency || "N/A"} | Status:{" "}
              {group?.payout_cycle?.status || "ACTIVE"}
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
            <p>
              {nextPayout
                ? nextPayout.full_name || nextPayout.email || "Scheduled"
                : "Not set"}
            </p>
          </div>

          <div className="group-stat-card">
            <h3>Total Saved</h3>
            <p>${totalSaved}</p>
          </div>
        </div>

        <section className="invite-section">
          <div className="invite-section-text">
            <h2>Invite Members</h2>
            <p>
              Share this group ID so another user can join this savings group.
            </p>
          </div>

          <div className="invite-code-box">
            <span className="invite-code-label">Group ID</span>

            <div className="invite-code-row">
              <div className="invite-code-value">{id}</div>

              <button className="copy-btn" onClick={handleCopy}>
                Copy ID
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
              {members.length === 0 && (
                <div className="member-card">
                  <div>
                    <h3>No members yet</h3>
                    <p>Members will show here after they join the group.</p>
                  </div>
                </div>
              )}

              {members.map((member) => (
                <div className="member-card" key={member.membership_id}>
                  <div>
                    <h3>{member.full_name || member.email || "Member"}</h3>
                    <p>{member.role || "MEMBER"}</p>
                  </div>

                  <span className="payout-badge">
                    Payout Position {member.payout_position || "Not set"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="view-group-section">
            <h2>Recent Activity</h2>

            <div className="members-list">
              {contributions.length === 0 && payouts.length === 0 && (
                <div className="group-activity-card">
                  <p>No activity yet.</p>
                </div>
              )}

              {contributions.slice(0, 3).map((contribution) => (
                <div
                  className="group-activity-card"
                  key={`contribution-${contribution.contribution_id}`}
                >
                  <p>
                    {contribution.full_name || contribution.email || "A member"}{" "}
                    paid ${contribution.amount}.
                  </p>
                </div>
              ))}

              {payouts.slice(0, 3).map((payout) => (
                <div
                  className="group-activity-card"
                  key={`payout-${payout.payout_id}`}
                >
                  <p>
                    Payout for {payout.full_name || payout.email || "member"} is{" "}
                    {payout.status || "saved"}.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}