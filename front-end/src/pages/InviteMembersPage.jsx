import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/invite-members.css";

export default function InviteMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInviteData = async () => {
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

        const inviteRes = await fetch(
          `http://localhost:3001/invitation/group/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const inviteData = await inviteRes.json();

        if (!inviteRes.ok) {
          throw new Error(inviteData.error || "Failed to load invitations");
        }

        setGroup(groupData);
        setInvitations(inviteData);
      } catch (error) {
        console.error("Invite page error:", error);
        alert(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [id]);

  const handleSendInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: Number(id),
          email: inviteEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      setInvitations((prev) => [data, ...prev]);
      setInviteEmail("");
      alert("Invitation sent successfully");
    } catch (error) {
      console.error("Create invitation error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return <div className="invite-members-page">Loading invites...</div>;
  }

  if (!group) {
    return <div className="invite-members-page">Group not found.</div>;
  }

  return (
    <div className="invite-members-page">
      <nav className="invite-members-nav">
        <div className="invite-members-logo">AYUUTO</div>

        <div className="invite-members-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>
            Back to Group
          </button>
        </div>
      </nav>

      <div className="invite-members-container">
        <div className="invite-members-header">
          <h1>Manage Invites</h1>
          <p>Send and track invitations for {group.group_name}.</p>
        </div>

        <section className="invite-members-section">
          <h2>Send New Invitation</h2>

          <form className="invite-members-form" onSubmit={handleSendInvite}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter member email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <div className="invite-members-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate(`/group/${id}`)}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="send-btn"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </form>
        </section>

        <section className="invite-members-section">
          <h2>Current Invitations</h2>

          <div className="invite-list">
            {invitations.length > 0 ? (
              invitations.map((invite) => (
                <div className="invite-card" key={invite.invitation_id}>
                  <div>
                    <h3>{invite.email}</h3>
                    <p>Status: {invite.status}</p>
                  </div>

                  <div className="invite-meta">
                    <span>Sent: {formatDate(invite.invited_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="invite-card">
                <div>
                  <h3>No invitations yet</h3>
                  <p>Send your first invitation above.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}