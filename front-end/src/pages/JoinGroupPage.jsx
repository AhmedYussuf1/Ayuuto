import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  JoinGroupPage.jsx

  Purpose:
  Lets a logged-in member join a group using an invite code.

  Backend flow:
  1. GET /group/code/:invite_code
     - checks the invite code and returns the group
  2. POST /membership
     - creates the membership request using member_id and group_id

  This matches Prototype Version 2 better because users are no longer
  typing the internal group_id directly unless the invite code maps to it.
*/

export default function JoinGroupPage() {
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [foundGroup, setFoundGroup] = useState(null);

  const [checking, setChecking] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const checkInviteCode = async (e) => {
    e.preventDefault();

    try {
      setChecking(true);
      setError("");
      setSuccessMessage("");
      setFoundGroup(null);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/group/code/${inviteCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid invite code.");
      }

      setFoundGroup(data.group);
    } catch (err) {
      setError(err.message || "Could not find group.");
    } finally {
      setChecking(false);
    }
  };

  const joinGroup = async () => {
    try {
      setJoining(true);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");
      const memberId = localStorage.getItem("member_id");

      if (!token || !memberId) {
        navigate("/login");
        return;
      }

      if (!foundGroup?.group_id) {
        throw new Error("Please verify an invite code first.");
      }

      const response = await fetch("http://localhost:3001/membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          member_id: memberId,
          group_id: foundGroup.group_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not request to join group.");
      }

      setSuccessMessage(
        data.status === "PENDING"
          ? "Join request sent. Waiting for admin approval."
          : "You joined the group successfully."
      );

      setTimeout(() => {
        navigate(`/group/${foundGroup.group_id}`);
      }, 900);
    } catch (err) {
      setError(err.message || "Could not join group.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppLayout showBack backTo="/dashboard">
      <Row className="justify-content-center">
        <Col lg={7}>
          <Card className="page-card">
            <Card.Body className="p-4">
              <h1 className="page-title">Join a Group</h1>

              <p className="page-subtitle">
                Enter the invite code shared by the group admin. The system will
                verify the code before creating your membership request.
              </p>

              {error && (
                <Alert variant="danger" className="alert-clean">
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="alert-clean">
                  {successMessage}
                </Alert>
              )}

              <Form onSubmit={checkInviteCode}>
                <Form.Group className="mb-4">
                  <Form.Label>Invite Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={inviteCode}
                    placeholder="Example: ABCD1234"
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="btn-ayuuto-primary"
                    disabled={checking}
                  >
                    {checking ? "Checking..." : "Check Code"}
                  </Button>
                </div>
              </Form>

              {checking && (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Checking invite code...</p>
                </div>
              )}

              {foundGroup && (
                <Card className="soft-card mt-4">
                  <Card.Body>
                    <h2 className="page-title h4">Confirm Group</h2>

                    <p className="mb-1">
                      <strong>Group:</strong> {foundGroup.group_name}
                    </p>

                    <p className="mb-1">
                      <strong>Group ID:</strong> {foundGroup.group_id}
                    </p>

                    {foundGroup.notes && (
                      <p className="mb-3">
                        <strong>Notes:</strong> {foundGroup.notes}
                      </p>
                    )}

                    <Button
                      className="btn-ayuuto-primary"
                      onClick={joinGroup}
                      disabled={joining}
                    >
                      {joining ? "Joining..." : "Request to Join"}
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}