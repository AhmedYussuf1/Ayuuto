import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  ApproveMembersPage.jsx

  Purpose:
  Lets an admin approve or reject pending membership requests.

  Backend routes:
  GET /membership/group/:group_id
  PUT /membership/:membership_id

  Prototype Version 2:
  This page now uses the real membership status workflow:
  PENDING -> APPROVED
  PENDING -> REJECTED
*/

export default function ApproveMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [memberships, setMemberships] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMembers();
  }, [id]);

  const loadMembers = async () => {
    try {
      setLoadingPage(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/membership/group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load members.");
      }

      setMemberships(data);
    } catch (err) {
      setError(err.message || "Could not load members.");
    } finally {
      setLoadingPage(false);
    }
  };

  const updateMembershipStatus = async (membershipId, newStatus) => {
    try {
      setLoadingId(membershipId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/membership/${membershipId}`,
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
        throw new Error(data.error || `Could not mark as ${newStatus}.`);
      }

      await loadMembers();
    } catch (err) {
      setError(err.message || "Could not update membership.");
    } finally {
      setLoadingId(null);
    }
  };

  const approveMember = (membershipId) => {
    updateMembershipStatus(membershipId, "APPROVED");
  };

  const rejectMember = (membershipId) => {
    updateMembershipStatus(membershipId, "REJECTED");
  };

  const getStatus = (membership) => {
    return membership.status || "APPROVED";
  };

  const pendingMembers = memberships.filter(
    (membership) => getStatus(membership) === "PENDING"
  );

  const approvedMembers = memberships.filter(
    (membership) => getStatus(membership) === "APPROVED"
  );

  const rejectedMembers = memberships.filter(
    (membership) => getStatus(membership) === "REJECTED"
  );

  if (loadingPage) {
    return (
      <AppLayout showBack backTo={`/group/${id}`}>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading memberships...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack backTo={`/group/${id}`}>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="page-title mb-1">Approve Members</h1>
          <p className="page-subtitle mb-0">
            Review pending membership requests and approve or reject them.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="outline-secondary"
            onClick={loadMembers}
            disabled={loadingPage}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="alert-clean">
          {error}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="stat-box">
            <h3>Pending</h3>
            <p>{pendingMembers.length}</p>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-box">
            <h3>Approved</h3>
            <p>{approvedMembers.length}</p>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-box">
            <h3>Rejected</h3>
            <p>{rejectedMembers.length}</p>
          </div>
        </Col>
      </Row>

      <Card className="page-card mb-4">
        <Card.Body>
          <h2 className="page-title h4">Pending Requests</h2>

          {pendingMembers.length === 0 ? (
            <p className="page-subtitle mb-0">
              No pending membership requests.
            </p>
          ) : (
            pendingMembers.map((member) => (
              <div
                className="soft-card p-3 mb-3"
                key={member.membership_id}
              >
                <Row className="align-items-center g-3">
                  <Col md={7}>
                    <strong>{member.full_name || "Unknown Member"}</strong>

                    <div className="page-subtitle small">
                      {member.email || "No email"}
                    </div>

                    <div className="page-subtitle small">
                      Membership ID: {member.membership_id}
                    </div>

                    <Badge bg="warning" text="dark" className="mt-2">
                      {getStatus(member)}
                    </Badge>
                  </Col>

                  <Col md={5}>
                    <div className="d-flex gap-2 justify-content-md-end">
                      <Button
                        className="btn-ayuuto-primary"
                        disabled={loadingId === member.membership_id}
                        onClick={() => approveMember(member.membership_id)}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="outline-danger"
                        disabled={loadingId === member.membership_id}
                        onClick={() => rejectMember(member.membership_id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      <Card className="page-card">
        <Card.Body>
          <h2 className="page-title h4">All Memberships</h2>

          {memberships.length === 0 ? (
            <p className="page-subtitle mb-0">No memberships found.</p>
          ) : (
            memberships.map((member) => (
              <div
                className="soft-card p-3 mb-3"
                key={`all-${member.membership_id}`}
              >
                <Row className="align-items-center g-3">
                  <Col md={8}>
                    <strong>{member.full_name || "Unknown Member"}</strong>

                    <div className="page-subtitle small">
                      {member.email || "No email"}
                    </div>

                    <div className="page-subtitle small">
                      Role: {member.role || "MEMBER"}
                    </div>
                  </Col>

                  <Col md={4} className="text-md-end">
                    <Badge
                      bg={
                        getStatus(member) === "APPROVED"
                          ? "success"
                          : getStatus(member) === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      text={getStatus(member) === "PENDING" ? "dark" : undefined}
                    >
                      {getStatus(member)}
                    </Badge>
                  </Col>
                </Row>
              </div>
            ))
          )}
        </Card.Body>
      </Card>
    </AppLayout>
  );
}