import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../logicCode/config";
import "../css/approve-members.css";

export default function ApproveMembersPage() {
  const navigate = useNavigate();

  // Gets group id from the URL
  // Example: /group/3/approve-members means id = 3
  const { id } = useParams();

  // Stores all invitations from the backend
  const [invitations, setInvitations] = useState([]);

  // Shows loading text while the backend request is running
  const [loading, setLoading] = useState(true);

  // Stores error messages
  const [error, setError] = useState("");

  async function getToken() {
    // Get current Firebase user
    const firebaseUser = auth.currentUser;

    // If nobody is logged in, stop the page
    if (!firebaseUser) {
      throw new Error("User not logged in");
    }

    // Backend needs this token to verify the user
    return firebaseUser.getIdToken();
  }

  async function loadInvitations() {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      // Backend route: GET /invitation/group/:id
      // This gets all invitations for this group
      const response = await fetch(
        `http://localhost:3001/invitation/group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load invitations");
      }

      // Save backend data into state so it appears on the page
      setInvitations(data);
    } catch (error) {
      console.error("Load invitations error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Load invitations when page first opens
  useEffect(() => {
    loadInvitations();
  }, [id]);

  async function updateInvitationStatus(invitationId, status) {
    setError("");

    try {
      const token = await getToken();

      // Backend route: PUT /invitation/:id
      // This changes the invite status, like ACCEPTED or CANCELED
      const response = await fetch(
        `http://localhost:3001/invitation/${invitationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update invitation");
      }

      // Reload invitations so the page updates after approval/cancel
      await loadInvitations();
    } catch (error) {
      console.error("Update invitation error:", error);
      setError(error.message);
    }
  }

  // Only show invitations that still need review
  const pendingInvitations = invitations.filter(
    (invite) => invite.status === "PENDING"
  );

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
          <h1>Review Invitations</h1>
          <p>
            This page uses the invitation system because memberships do not have
            a pending approval status in the database.
          </p>
        </div>

        {error && <p className="alert alert-warning">{error}</p>}
        {loading && <p>Loading invitations...</p>}

        <section className="approve-members-section">
          <h2>Pending Invitations</h2>

          <div className="request-list">
            {!loading && pendingInvitations.length === 0 && (
              <p>No pending invitations.</p>
            )}

            {pendingInvitations.map((invite) => (
              <div className="request-card" key={invite.invitation_id}>
                <div className="request-info">
                  <h3>{invite.email}</h3>
                  <p>Status: {invite.status}</p>

                  {invite.created_at && (
                    <span>
                      Sent: {new Date(invite.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="request-actions">
                  <button
                    className="approve-btn"
                    onClick={() =>
                      updateInvitationStatus(invite.invitation_id, "ACCEPTED")
                    }
                  >
                    Mark Accepted
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      updateInvitationStatus(invite.invitation_id, "CANCELED")
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="approve-members-section">
          <h2>All Invitations</h2>

          <div className="request-list">
            {!loading && invitations.length === 0 && <p>No invitations yet.</p>}

            {invitations.map((invite) => (
              <div className="request-card" key={`all-${invite.invitation_id}`}>
                <div className="request-info">
                  <h3>{invite.email}</h3>
                  <p>Status: {invite.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}