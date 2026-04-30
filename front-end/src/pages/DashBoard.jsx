import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth } from "../logicCode/config";
import AppLayout from "../components/AppLayout";

/*
  DashBoard.jsx

  Purpose:
  Shows the logged-in user's groups.

  Prototype Version 2 update:
  Membership status is now considered:
  - APPROVED groups display normally
  - PENDING groups show as pending
  - REJECTED groups are not shown as active groups

  If status is missing because of older backend data, the page treats it as
  APPROVED so old demo data does not break.
*/

export default function DashBoard() {
  const navigate = useNavigate();

  const [currentMember, setCurrentMember] = useState(null);
  const [memberships, setMemberships] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatus = (membership) => {
    return membership.status || "APPROVED";
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const token = await firebaseUser.getIdToken();
      localStorage.setItem("token", token);

      const memberResponse = await fetch("http://localhost:3001/member/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const memberData = await memberResponse.json();

      if (!memberResponse.ok) {
        throw new Error(memberData.error || "Could not load current member.");
      }

      setCurrentMember(memberData);
      localStorage.setItem("member_id", memberData.member_id);

      const membershipResponse = await fetch(
        `http://localhost:3001/membership/member/${memberData.member_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const membershipData = await membershipResponse.json();

      if (!membershipResponse.ok) {
        throw new Error(
          membershipData.error || "Could not load groups for this member."
        );
      }

      setMemberships(membershipData);
    } catch (err) {
      setError(err.message || "Dashboard failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const approvedMemberships = memberships.filter(
    (membership) => getStatus(membership) === "APPROVED"
  );

  const pendingMemberships = memberships.filter(
    (membership) => getStatus(membership) === "PENDING"
  );

  const rejectedMemberships = memberships.filter(
    (membership) => getStatus(membership) === "REJECTED"
  );

  const adminGroups = approvedMemberships.filter(
    (membership) => membership.role === "ADMIN"
  ).length;

  const memberGroups = approvedMemberships.filter(
    (membership) => membership.role === "MEMBER"
  ).length;

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h1 className="page-title mb-1">
            Welcome
            {currentMember?.full_name ? `, ${currentMember.full_name}` : ""}
          </h1>

          <p className="page-subtitle mb-0">
            View your groups, create a new group, or join one using an invite
            code.
          </p>
        </Col>

        <Col xs="auto" className="d-flex gap-2">
          <Button
            className="btn-ayuuto-primary"
            onClick={() => navigate("/create-group")}
          >
            Create Group
          </Button>

          <Button
            className="btn-ayuuto-secondary"
            onClick={() => navigate("/join-group")}
          >
            Join Group
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="alert-clean">
          {error}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col md={3}>
          <div className="stat-box">
            <h3>Approved Groups</h3>
            <p>{approvedMemberships.length}</p>
          </div>
        </Col>

        <Col md={3}>
          <div className="stat-box">
            <h3>Pending</h3>
            <p>{pendingMemberships.length}</p>
          </div>
        </Col>

        <Col md={3}>
          <div className="stat-box">
            <h3>Admin Groups</h3>
            <p>{adminGroups}</p>
          </div>
        </Col>

        <Col md={3}>
          <div className="stat-box">
            <h3>Member Groups</h3>
            <p>{memberGroups}</p>
          </div>
        </Col>
      </Row>

      <Card className="page-card mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="page-title h4 mb-0">My Approved Groups</h2>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={loadDashboardData}
            >
              Refresh
            </Button>
          </div>

          {approvedMemberships.length === 0 ? (
            <p className="page-subtitle mb-0">
              You do not have any approved groups yet.
            </p>
          ) : (
            approvedMemberships.map((membership) => (
              <Card className="soft-card mb-3" key={membership.membership_id}>
                <Card.Body>
                  <Row className="align-items-center g-3">
                    <Col>
                      <h3 className="page-title h5 mb-1">
                        {membership.group_name || `Group ${membership.group_id}`}
                      </h3>

                      <p className="page-subtitle mb-2">
                        Group ID: {membership.group_id}
                      </p>

                      <div className="d-flex gap-2 flex-wrap">
                        <Badge bg="success">{getStatus(membership)}</Badge>
                        <Badge bg={membership.role === "ADMIN" ? "primary" : "secondary"}>
                          {membership.role}
                        </Badge>
                      </div>
                    </Col>

                    <Col xs="auto">
                      <Button
                        className="btn-ayuuto-primary"
                        onClick={() => navigate(`/group/${membership.group_id}`)}
                      >
                        Open Group
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>

      {pendingMemberships.length > 0 && (
        <Card className="page-card mb-4">
          <Card.Body>
            <h2 className="page-title h4">Pending Requests</h2>

            <p className="page-subtitle">
              These groups are waiting for admin approval.
            </p>

            {pendingMemberships.map((membership) => (
              <Card className="soft-card mb-3" key={membership.membership_id}>
                <Card.Body>
                  <Row className="align-items-center g-3">
                    <Col>
                      <h3 className="page-title h5 mb-1">
                        {membership.group_name || `Group ${membership.group_id}`}
                      </h3>

                      <p className="page-subtitle mb-2">
                        Group ID: {membership.group_id}
                      </p>

                      <Badge bg="warning" text="dark">
                        PENDING
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Card.Body>
        </Card>
      )}

      {rejectedMemberships.length > 0 && (
        <Alert variant="secondary" className="alert-clean">
          You have {rejectedMemberships.length} rejected membership request(s).
        </Alert>
      )}
    </AppLayout>
  );
}