import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  GroupSettingsPage.jsx

  Purpose:
  Admins can update group details and payout cycle settings.

  Backend routes used:
  GET /group/:group_id
  PUT /group/:group_id
  GET /membership/member/:member_id

  Important prototype decision:
  This page is hidden from members in ViewGroupPage.
  This page also checks role before showing the form.

  Backend should eventually enforce admin-only permissions too.
*/

export default function GroupSettingsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentMembership, setCurrentMembership] = useState(null);

  const [groupName, setGroupName] = useState("");
  const [startCycleDate, setStartCycleDate] = useState("");
  const [notes, setNotes] = useState("");

  const [frequency, setFrequency] = useState("Weekly");
  const [contributionAmount, setContributionAmount] = useState("");
  const [payoutCycleStatus, setPayoutCycleStatus] = useState("ACTIVE");

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGroupSettings();
  }, [id]);

  const loadGroupSettings = async () => {
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
        1. Load group details.
        Backend returns group, payout_cycle, and members.
      */
      const groupResponse = await fetch(`http://localhost:3001/group/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const groupData = await groupResponse.json();

      if (!groupResponse.ok) {
        throw new Error(groupData.error || "Could not load group settings.");
      }

      setGroupName(groupData.group?.group_name || "");
      setStartCycleDate(
        groupData.group?.start_cycle_date
          ? String(groupData.group.start_cycle_date).split("T")[0]
          : ""
      );
      setNotes(groupData.group?.notes || "");

      setFrequency(groupData.payout_cycle?.frequency || "Weekly");
      setContributionAmount(groupData.payout_cycle?.contribution_amount || "");
      setPayoutCycleStatus(groupData.payout_cycle?.status || "ACTIVE");

      /*
        2. Check the logged-in user's role.
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
        throw new Error("Could not check current user role.");
      }

      const match = membershipData.find(
        (membership) => String(membership.group_id) === String(id)
      );

      setCurrentMembership(match || null);
    } catch (err) {
      setError(err.message || "Could not load settings.");
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSave = async (e) => {
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
        PUT /group/:group_id

        This updates:
        - group table fields
        - payout cycle fields
      */
      const response = await fetch(`http://localhost:3001/group/${id}`, {
        method: "PUT",
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
          payout_cycle_status: payoutCycleStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update group settings.");
      }

      navigate(`/group/${id}`);
    } catch (err) {
      setError(err.message || "Could not update group settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <AppLayout showBack backTo={`/group/${id}`}>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading settings...</p>
        </div>
      </AppLayout>
    );
  }

  const isAdmin = currentMembership?.role === "ADMIN";

  return (
    <AppLayout showBack backTo={`/group/${id}`}>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="page-title mb-1">Group Settings</h1>
          <p className="page-subtitle mb-0">
            Update group details and payout cycle settings.
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

      {!isAdmin ? (
        <Alert variant="warning" className="alert-clean">
          You are not an admin for this group, so group settings are hidden.
        </Alert>
      ) : (
        <Card className="page-card">
          <Card.Body className="p-4">
            <Form onSubmit={handleSave}>
              <Form.Group className="mb-3">
                <Form.Label>Group Name</Form.Label>
                <Form.Control
                  type="text"
                  value={groupName}
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

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contribution Amount</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payout Cycle Status</Form.Label>
                    <Form.Select
                      value={payoutCycleStatus}
                      onChange={(e) => setPayoutCycleStatus(e.target.value)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={notes}
                  placeholder="Optional group notes"
                  onChange={(e) => setNotes(e.target.value)}
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
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </AppLayout>
  );
}