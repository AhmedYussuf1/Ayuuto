import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  CreateGroupPage.jsx

  Purpose:
  This page lets a logged-in user create a new savings group.

  Backend route used:
  POST /group

  Important backend behavior:
  The backend does more than create a group.

  It should:
  1. Create the group row
  2. Create the payout cycle row
  3. Make the creator an ADMIN through the membership table

  That means the frontend does NOT need to call POST /membership
  after creating a group. The backend handles creator membership.
*/

export default function CreateGroupPage() {
  const navigate = useNavigate();

  /*
    These state variables store form values.
    I named them close to the backend fields so the code is easier to explain.
  */
  const [groupName, setGroupName] = useState("");
  const [startCycleDate, setStartCycleDate] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [contributionAmount, setContributionAmount] = useState("");
  const [notes, setNotes] = useState("");

  /*
    loading prevents double clicking the submit button.
    error shows backend problems on the page.
  */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      /*
        Protected backend route:
        The backend needs the Firebase token to know who is creating the group.
      */
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        Backend route:
        POST /group

        Body fields:
        - group_name
        - start_cycle_date
        - notes
        - frequency
        - contribution_amount
      */
      const response = await fetch("http://localhost:3001/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_name: groupName,
          start_cycle_date: startCycleDate,
          notes,
          frequency,
          contribution_amount: contributionAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create group.");
      }

      /*
        After the backend creates the group,
        it returns the new group_id.

        Then we send the user directly to:
        /group/:id
      */
      navigate(`/group/${data.group.group_id}`);
    } catch (err) {
      setError(err.message || "Could not create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBack backTo="/dashboard">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="page-card">
            <Card.Body className="p-4">
              <h1 className="page-title">Create a Group</h1>

              <p className="page-subtitle">
                Set up a savings group with a start date, contribution amount,
                and payout frequency.
              </p>

              {error && (
                <Alert variant="danger" className="alert-clean">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Group Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={groupName}
                    placeholder="Example: Family Savings Group"
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Cycle Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startCycleDate}
                        onChange={(e) => setStartCycleDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frequency</Form.Label>
                      <Form.Select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Contribution Amount</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={contributionAmount}
                    placeholder="Example: 50"
                    onChange={(e) => setContributionAmount(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={notes}
                    placeholder="Optional notes about this group"
                    onChange={(e) => setNotes(e.target.value)}
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
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Group"}
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