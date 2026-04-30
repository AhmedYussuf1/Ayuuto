import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  MakeContributionPage.jsx

  Purpose:
  This page lets a member record a contribution for a group.

  Backend route used:
  POST /contribution

  Important backend detail:
  Contributions are connected to membership_id.

  That means we cannot just send:
  - member_id
  - group_id

  We must first find the logged-in user's membership for this group,
  then send that membership_id to the backend.
*/

export default function MakeContributionPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // group_id from URL

  const [membershipId, setMembershipId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("PAID");
  const [note, setNote] = useState("");

  const [loadingMembership, setLoadingMembership] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
    When the page opens, find the current user's membership_id
    for this specific group.
  */
  useEffect(() => {
    findMembershipForCurrentUser();
  }, [id]);

  const findMembershipForCurrentUser = async () => {
    try {
      setLoadingMembership(true);
      setError("");

      const token = localStorage.getItem("token");
      const memberId = localStorage.getItem("member_id");

      if (!token || !memberId) {
        navigate("/login");
        return;
      }

      /*
        Backend route:
        GET /membership/member/:member_id

        This gives all memberships for the logged-in user.
        We then find the membership that belongs to this group.
      */
      const response = await fetch(
        `http://localhost:3001/membership/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load membership.");
      }

      const matchingMembership = data.find(
        (membership) => String(membership.group_id) === String(id)
      );

      if (!matchingMembership) {
        throw new Error("You are not a member of this group.");
      }

      setMembershipId(matchingMembership.membership_id);
    } catch (err) {
      setError(err.message || "Could not find your membership.");
    } finally {
      setLoadingMembership(false);
    }
  };

  const handleSubmit = async (e) => {
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
        POST /contribution

        Body:
        - membership_id
        - amount
        - status
        - note
      */
      const response = await fetch("http://localhost:3001/contribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          membership_id: membershipId,
          amount,
          status,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save contribution.");
      }

      /*
        After saving, go back to the group details page.
      */
      navigate(`/group/${id}`);
    } catch (err) {
      setError(err.message || "Could not save contribution.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingMembership) {
    return (
      <AppLayout showBack backTo={`/group/${id}`}>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Finding your membership...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack backTo={`/group/${id}`}>
      <Row className="justify-content-center">
        <Col lg={7}>
          <Card className="page-card">
            <Card.Body className="p-4">
              <h1 className="page-title">Make Contribution</h1>

              <p className="page-subtitle">
                Record a contribution for this group. The backend connects this
                contribution to your membership record.
              </p>

              {error && (
                <Alert variant="danger" className="alert-clean">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Membership ID</Form.Label>
                  <Form.Control type="text" value={membershipId} readOnly />
                  <Form.Text>
                    This is read-only because the app finds your membership
                    automatically.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    placeholder="Example: 50"
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={note}
                    placeholder="Optional note"
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate(`/group/${id}`)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="btn-ayuuto-primary"
                    disabled={saving || !membershipId}
                  >
                    {saving ? "Saving..." : "Save Contribution"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}