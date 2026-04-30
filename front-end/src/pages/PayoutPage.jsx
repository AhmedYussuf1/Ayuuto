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
  PayoutPage.jsx

  Purpose:
  This page lets users view payout records for a group.

  Backend routes used:
  GET /payout/group/:group_id
    - shows payouts for this group

  GET /membership/group/:group_id
    - gets memberships so admin can choose who receives payout

  GET /membership/member/:member_id
    - checks if current user is ADMIN or MEMBER

  POST /payout
    - admin creates a payout

  PUT /payout/:payout_id
    - admin updates payout status or note

  Important:
  A payout connects to membership_id, not just member_id.
  That is why we load memberships before creating a payout.
*/

export default function PayoutPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // group_id from URL

  const [payouts, setPayouts] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);

  // Create payout form
  const [membershipId, setMembershipId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [note, setNote] = useState("");

  // Update payout form state
  const [editingPayoutId, setEditingPayoutId] = useState(null);
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editNote, setEditNote] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayoutPageData();
  }, [id]);

  const loadPayoutPageData = async () => {
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
        1. Load payouts for this group.
      */
      const payoutResponse = await fetch(
        `http://localhost:3001/payout/group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payoutData = await payoutResponse.json();

      if (!payoutResponse.ok) {
        throw new Error(payoutData.error || "Could not load payouts.");
      }

      setPayouts(payoutData);

      /*
        2. Load memberships for this group.
        This lets admin choose the payout recipient.
      */
      const membershipResponse = await fetch(
        `http://localhost:3001/membership/group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const membershipData = await membershipResponse.json();

      if (!membershipResponse.ok) {
        throw new Error(membershipData.error || "Could not load members.");
      }

      setMemberships(membershipData);

      /*
        3. Check current user's role.
        This controls whether admin-only payout actions are shown.
      */
      const myMembershipResponse = await fetch(
        `http://localhost:3001/membership/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const myMembershipData = await myMembershipResponse.json();

      if (!myMembershipResponse.ok) {
        throw new Error("Could not check your group role.");
      }

      const match = myMembershipData.find(
        (membership) => String(membership.group_id) === String(id)
      );

      setCurrentMembership(match || null);
    } catch (err) {
      setError(err.message || "Could not load payout page.");
    } finally {
      setLoadingPage(false);
    }
  };

  const handleCreatePayout = async (e) => {
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
        POST /payout

        Backend expects:
        - membership_id
        - amount
        - status
        - note
      */
      const response = await fetch("http://localhost:3001/payout", {
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
        throw new Error(data.error || "Could not create payout.");
      }

      setMembershipId("");
      setAmount("");
      setStatus("PENDING");
      setNote("");

      await loadPayoutPageData();
    } catch (err) {
      setError(err.message || "Could not create payout.");
    } finally {
      setSaving(false);
    }
  };

  const startEditPayout = (payout) => {
    setEditingPayoutId(payout.payout_id);
    setEditStatus(payout.status || "PENDING");
    setEditNote(payout.note || "");
  };

  const cancelEditPayout = () => {
    setEditingPayoutId(null);
    setEditStatus("PENDING");
    setEditNote("");
  };

  const handleUpdatePayout = async (payoutId) => {
    try {
      setUpdatingId(payoutId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        Backend route:
        PUT /payout/:payout_id

        We are only updating status and note because those are the safest
        fields to edit during the prototype demo.
      */
      const response = await fetch(`http://localhost:3001/payout/${payoutId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editStatus,
          note: editNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update payout.");
      }

      cancelEditPayout();
      await loadPayoutPageData();
    } catch (err) {
      setError(err.message || "Could not update payout.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loadingPage) {
    return (
      <AppLayout showBack backTo={`/group/${id}`}>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading payouts...</p>
        </div>
      </AppLayout>
    );
  }

  const isAdmin = currentMembership?.role === "ADMIN";

  const totalAmount = payouts.reduce((sum, payout) => {
    return sum + Number(payout.amount || 0);
  }, 0);

  return (
    <AppLayout showBack backTo={`/group/${id}`}>
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h1 className="page-title mb-1">Payouts</h1>
          <p className="page-subtitle mb-0">
            View payout records for this group.
            {isAdmin && " Admins can create and update payout records."}
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

      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="stat-box">
            <h3>Total Payouts</h3>
            <p>{payouts.length}</p>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-box">
            <h3>Total Amount</h3>
            <p>${totalAmount.toFixed(2)}</p>
          </div>
        </Col>

        <Col md={4}>
          <div className="stat-box">
            <h3>Members</h3>
            <p>{memberships.length}</p>
          </div>
        </Col>
      </Row>

      {isAdmin ? (
        <Card className="page-card mb-4">
          <Card.Body className="p-4">
            <h2 className="page-title h4">Create Payout</h2>

            <p className="page-subtitle">
              Choose a member membership record and create a payout.
            </p>

            <Form onSubmit={handleCreatePayout}>
              <Form.Group className="mb-3">
                <Form.Label>Recipient</Form.Label>
                <Form.Select
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  required
                >
                  <option value="">Select member</option>

                  {memberships.map((member) => (
                    <option
                      key={member.membership_id}
                      value={member.membership_id}
                    >
                      {member.full_name} ({member.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      placeholder="Example: 100"
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="MISSED">Missed</option>
                      <option value="CANCELED">Canceled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={note}
                  placeholder="Optional payout note"
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>

              <Button
                type="submit"
                className="btn-ayuuto-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create Payout"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info" className="alert-clean">
          Member view: you can view payouts, but only admins can create or
          update payout records.
        </Alert>
      )}

      <Card className="page-card">
        <Card.Body>
          <h2 className="page-title h4">Existing Payouts</h2>

          {payouts.length === 0 ? (
            <p className="page-subtitle mb-0">No payouts have been recorded.</p>
          ) : (
            <ListGroup variant="flush">
              {payouts.map((payout) => (
                <ListGroup.Item key={payout.payout_id}>
                  <Row className="align-items-start g-3">
                    <Col md={5}>
                      <strong>{payout.full_name || "Unknown Member"}</strong>
                      <div className="page-subtitle small">
                        Payout ID: {payout.payout_id}
                      </div>
                      <div className="page-subtitle small">
                        Date:{" "}
                        {payout.payout_date
                          ? new Date(payout.payout_date).toLocaleDateString()
                          : "No date"}
                      </div>
                    </Col>

                    <Col md={3}>
                      <strong>${payout.amount}</strong>
                      <div className="mt-1">
                        <Badge
                          bg={
                            payout.status === "PAID"
                              ? "success"
                              : payout.status === "CANCELED"
                              ? "danger"
                              : "secondary"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </div>
                    </Col>

                    <Col md={4}>
                      {editingPayoutId === payout.payout_id ? (
                        <>
                          <Form.Select
                            className="mb-2"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="MISSED">Missed</option>
                            <option value="CANCELED">Canceled</option>
                          </Form.Select>

                          <Form.Control
                            className="mb-2"
                            as="textarea"
                            rows={2}
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Update note"
                          />

                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              className="btn-ayuuto-primary"
                              disabled={updatingId === payout.payout_id}
                              onClick={() => handleUpdatePayout(payout.payout_id)}
                            >
                              {updatingId === payout.payout_id
                                ? "Saving..."
                                : "Save"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={cancelEditPayout}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="small mb-2">
                            Note: {payout.note || "No note"}
                          </div>

                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => startEditPayout(payout)}
                            >
                              Update Status
                            </Button>
                          )}
                        </>
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