import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  InviteMembersPage.jsx

  Purpose:
  Admins can create and manage invitation records for a group.

  Backend routes used:
  GET /invitation/group/:group_id
    - view invitations

  POST /invitation
    - create invitation

  PUT /invitation/:invitation_id
    - update invitation status

  Important prototype note:
  Invitations are tracked here, but joining still uses group_id.
  That means this is an invitation tracking feature, not invite-based joining.
*/

export default function InviteMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // group_id from URL

  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvitePageData();
  }, [id]);

  const loadInvitePageData = async () => {
    try {
      setLoadingPage(true);
      setError("");

      const token = localStorage.getItem("token");
      const memberId = localStorage.getItem("member_id");

      if (!token || !memberId) {
        navigate("/login");
        return;
      }

      /*
        1. Check current user's role.
        Invite form should only show for admins.
      */
      const membershipResponse = await fetch(
        `http://localhost:3001/membership/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const membershipData = await membershipResponse.json();

      if (!membershipResponse.ok) {
        throw new Error("Could not check your group role.");
      }

      const match = membershipData.find(
        (membership) => String(membership.group_id) === String(id)
      );

      setCurrentMembership(match || null);

      /*
        2. Load invitation records for this group.
      */
      const invitationResponse = await fetch(
        `http://localhost:3001/invitation/group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const invitationData = await invitationResponse.json();

      if (!invitationResponse.ok) {
        throw new Error(invitationData.error || "Could not load invitations.");
      }

      setInvitations(invitationData);
    } catch (err) {
      setError(err.message || "Could not load invitation page.");
    } finally {
      setLoadingPage(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        Backend route:
        POST /invitation

        Body:
        - group_id
        - email

        Backend defaults status to PENDING.
      */
      const response = await fetch("http://localhost:3001/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: id,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create invitation.");
      }

      setEmail("");
      await loadInvitePageData();
    } catch (err) {
      setError(err.message || "Could not create invitation.");
    } finally {
      setSaving(false);
    }
  };

  const updateInvitationStatus = async (invitationId, newStatus) => {
    try {
      setUpdatingId(invitationId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        Backend route:
        PUT /invitation/:invitation_id

        We only update the status because that is the main action needed
        for this prototype.
      */
      const response = await fetch(
        `http://localhost:3001/invitation/${invitationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update invitation.");
      }

      await loadInvitePageData();
    } catch (err) {
      setError(err.message || "Could not update invitation.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loadingPage) {
    return (
      <AppLayout showBack backTo={`/group/${id}`}>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading invitations...</p>
        </div>
      </AppLayout>
    );
  }

  const isAdmin = currentMembership?.role === "ADMIN";

  return (
    <AppLayout showBack backTo={`/group/${id}`}>
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h1 className="page-title mb-1">Invite Members</h1>
          <p className="page-subtitle mb-0">
            Create and manage invitation records for this group.
          </p>
        </Col>

        <Col xs="auto">
          <Badge bg={isAdmin ? "success" : "secondary"} className="fs-6">
            {isAdmin ? "Admin View" : "Member View"}
          </Badge>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="alert-clean">
          {error}
        </Alert>
      )}

      <Alert variant="info" className="alert-clean">
        Prototype note: invitations are tracked here. Members still join using
        the group ID as the join code.
      </Alert>

      {!isAdmin && (
        <Alert variant="warning" className="alert-clean">
          You are not an admin for this group, so invitation actions are hidden.
        </Alert>
      )}

      {isAdmin && (
        <Card className="page-card mb-4">
          <Card.Body className="p-4">
            <h2 className="page-title h4">Create Invitation</h2>

            <Form onSubmit={handleInvite}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  placeholder="example@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="btn-ayuuto-primary"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Invite"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="page-card">
        <Card.Body>
          <h2 className="page-title h4">Current Invitations</h2>

          {invitations.length === 0 ? (
            <p className="page-subtitle mb-0">No invitations yet.</p>
          ) : (
            <ListGroup variant="flush">
              {invitations.map((invite) => (
                <ListGroup.Item key={invite.invitation_id}>
                  <Row className="align-items-center g-3">
                    <Col md={5}>
                      <strong>{invite.email}</strong>
                      <div className="page-subtitle small">
                        Invitation ID: {invite.invitation_id}
                      </div>
                      <div className="page-subtitle small">
                        Sent:{" "}
                        {invite.invited_at
                          ? new Date(invite.invited_at).toLocaleString()
                          : "No date"}
                      </div>
                    </Col>

                    <Col md={3}>
                      <Badge
                        bg={
                          invite.status === "PENDING"
                            ? "warning"
                            : invite.status === "ACCEPTED"
                            ? "success"
                            : invite.status === "CANCELED"
                            ? "danger"
                            : "secondary"
                        }
                        text={invite.status === "PENDING" ? "dark" : undefined}
                      >
                        {invite.status}
                      </Badge>
                    </Col>

                    <Col md={4}>
                      {isAdmin && (
                        <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={updatingId === invite.invitation_id}
                            onClick={() =>
                              updateInvitationStatus(
                                invite.invitation_id,
                                "ACCEPTED"
                              )
                            }
                          >
                            Mark Accepted
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={updatingId === invite.invitation_id}
                            onClick={() =>
                              updateInvitationStatus(
                                invite.invitation_id,
                                "EXPIRED"
                              )
                            }
                          >
                            Expire
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={updatingId === invite.invitation_id}
                            onClick={() =>
                              updateInvitationStatus(
                                invite.invitation_id,
                                "CANCELED"
                              )
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </AppLayout>
  );
}