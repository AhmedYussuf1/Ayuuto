import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  ViewGroupPage.jsx

  Purpose:
  This page shows one group.

  Backend route used:
  GET /group/:id

  This page also checks the logged-in user's membership role so the UI can show:
  - normal member actions
  - admin-only actions

  Member actions:
  - Make Contribution
  - View Contributions
  - View Payouts

  Admin actions:
  - Invite Members
  - Group Settings
  - Manage Members

  Important:
  This is frontend role-based hiding. The backend should still enforce
  admin permissions in a stronger production version.
*/

export default function ViewGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [groupData, setGroupData] = useState(null);
  const [currentMembership, setCurrentMembership] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const memberId = localStorage.getItem("member_id");

      if (!token || !memberId) {
        navigate("/login");
        return;
      }

      /*
        First backend call:
        GET /group/:id

        This returns group details, payout cycle, and members.
      */
      const groupResponse = await fetch(`http://localhost:3001/group/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const groupResult = await groupResponse.json();

      if (!groupResponse.ok) {
        throw new Error(groupResult.error || "Failed to load group.");
      }

      setGroupData(groupResult);

      /*
        Second backend call:
        GET /membership/member/:member_id

        This returns all memberships for the logged-in user.
        We find the one for this group so we know if they are ADMIN or MEMBER.
      */
      const membershipResponse = await fetch(
        `http://localhost:3001/membership/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const membershipResult = await membershipResponse.json();

      if (!membershipResponse.ok) {
        throw new Error("Could not load your membership role.");
      }

      const match = membershipResult.find(
        (membership) => String(membership.group_id) === String(id)
      );

      setCurrentMembership(match || null);
    } catch (err) {
      setError(err.message || "Group failed to load.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showBack backTo="/dashboard">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading group...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showBack backTo="/dashboard">
        <Alert variant="danger" className="alert-clean">
          {error}
        </Alert>
      </AppLayout>
    );
  }

  if (!groupData) {
    return (
      <AppLayout showBack backTo="/dashboard">
        <Alert variant="warning" className="alert-clean">
          No group found.
        </Alert>
      </AppLayout>
    );
  }

  const { group, payout_cycle, members } = groupData;

  /*
    If role is ADMIN, show admin-only buttons.
  */
  const isAdmin = currentMembership?.role === "ADMIN";

  return (
    <AppLayout showBack backTo="/dashboard">
      <Row className="align-items-start mb-4 g-3">
        <Col>
          <h1 className="page-title mb-1">{group.group_name}</h1>

          <p className="page-subtitle mb-1">
            Group ID: <strong>{group.group_id}</strong>
          </p>

          {isAdmin && (
            <p className="page-subtitle mb-2">
              Invite Code: <strong>{group.invite_code || "Not available"}</strong>
            </p>
          )}
          {group.notes && <p className="mb-0">{group.notes}</p>}
        </Col>

        <Col xs="auto">
          <Badge bg={isAdmin ? "success" : "secondary"} className="fs-6">
            Your Role: {currentMembership?.role || "Unknown"}
          </Badge>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="stat-box">
            <h3>Members</h3>
            <p>{members?.length || 0}</p>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-box">
            <h3>Frequency</h3>
            <p>{payout_cycle?.frequency || "N/A"}</p>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-box">
            <h3>Contribution</h3>
            <p>${payout_cycle?.contribution_amount || 0}</p>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <Button
            className="btn-ayuuto-primary w-100"
            onClick={() => navigate(`/group/${id}/contribution`)}
          >
            Make Contribution
          </Button>
        </Col>

        <Col md={6} lg={3}>
          <Button
            className="btn-ayuuto-secondary w-100"
            onClick={() => navigate(`/group/${id}/contributions`)}
          >
            View Contributions
          </Button>
        </Col>

        <Col md={6} lg={3}>
          <Button
            className="btn-ayuuto-secondary w-100"
            onClick={() => navigate(`/group/${id}/payouts`)}
          >
            View Payouts
          </Button>
        </Col>

        {isAdmin && (
          <>
            <Col md={6} lg={3}>
              <Button
                className="btn-ayuuto-accent w-100"
                onClick={() => navigate(`/group/${id}/invite`)}
              >
                Invite Members
              </Button>
            </Col>

            <Col md={6} lg={3}>
              <Button
                variant="dark"
                className="w-100"
                onClick={() => navigate(`/group/${id}/settings`)}
              >
                Group Settings
              </Button>
            </Col>

            <Col md={6} lg={3}>
              <Button
                variant="dark"
                className="w-100"
                onClick={() => navigate(`/group/${id}/manage-members`)}
              >
                Manage Members
              </Button>
            </Col>
          </>
        )}
      </Row>

      {!isAdmin && (
        <Alert variant="info" className="alert-clean">
          Member view: admin-only actions like inviting members, changing group
          settings, and managing members are hidden.
        </Alert>
      )}

      <Card className="page-card">
        <Card.Body>
          <h2 className="page-title h4">Members</h2>

          <ListGroup variant="flush">
        {members
          ?.filter((member) => (member.status || "APPROVED") === "APPROVED")
          .map((member) => (
            <ListGroup.Item
              key={member.membership_id}
              className="d-flex justify-content-between align-items-center"
            >
                      <div>
                  <strong>{member.full_name || "Unnamed Member"}</strong>
                  <div className="page-subtitle small">{member.email}</div>
                </div>

                <Badge bg={member.role === "ADMIN" ? "success" : "secondary"}>
                  {member.role}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </AppLayout>
  );
}