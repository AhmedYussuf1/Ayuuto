import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";

/*
  ContributionsPage.jsx

  Purpose:
  This page shows all contributions for one group.

  Backend route used:
  GET /contribution/group/:group_id

  Why this page is important:
  Before this page, users could make a contribution, but they could not view
  group contributions. This connects the frontend to the backend's view
  contribution feature.

  Important backend detail:
  Contributions connect through membership_id.
  The backend joins membership/member/group data so we can display who paid.
*/

export default function ContributionsPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // group_id from URL

  const [contributions, setContributions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadContributions();
  }, [id]);

  const loadContributions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        Backend route:
        GET /contribution/group/:group_id

        This should return all contributions connected to this group.
      */
      const response = await fetch(
        `http://localhost:3001/contribution/group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load contributions.");
      }

      setContributions(data);
    } catch (err) {
      setError(err.message || "Could not load contributions.");
    } finally {
      setLoading(false);
    }
  };

  /*
    Calculate simple totals for the stat cards.
  */
  const totalContributions = contributions.length;

  const totalAmount = contributions.reduce((sum, contribution) => {
    const amount = Number(contribution.amount || 0);
    return sum + amount;
  }, 0);

  const paidCount = contributions.filter(
    (contribution) => contribution.status === "PAID"
  ).length;

  if (loading) {
    return (
      <AppLayout showBack backTo={`/group/${id}`}>
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading contributions...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack backTo={`/group/${id}`}>
      <Row className="align-items-center mb-4 g-3">
        <Col>
          <h1 className="page-title mb-1">Contributions</h1>
          <p className="page-subtitle mb-0">
            View all contributions recorded for this group.
          </p>
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
            <h3>Total Records</h3>
            <p>{totalContributions}</p>
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
            <h3>Paid Records</h3>
            <p>{paidCount}</p>
          </div>
        </Col>
      </Row>

      <Card className="page-card">
        <Card.Body>
          <h2 className="page-title h4">Contribution Records</h2>

          {contributions.length === 0 ? (
            <p className="page-subtitle mb-0">
              No contributions have been recorded yet.
            </p>
          ) : (
            <ListGroup variant="flush">
              {contributions.map((contribution) => (
                <ListGroup.Item
                  key={contribution.contribution_id}
                  className="d-flex justify-content-between align-items-start"
                >
                  <div>
                    <strong>
                      {contribution.full_name || "Unknown Member"}
                    </strong>

                    <div className="page-subtitle small">
                      Contribution ID: {contribution.contribution_id}
                    </div>

                    <div className="small">
                      Note: {contribution.note || "No note"}
                    </div>
                  </div>

                  <div className="text-end">
                    <strong>${contribution.amount}</strong>

                    <div className="mt-1">
                      <Badge
                        bg={
                          contribution.status === "PAID"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {contribution.status}
                      </Badge>
                    </div>

                    <div className="page-subtitle small mt-1">
                      {contribution.contribution_date
                        ? new Date(
                            contribution.contribution_date
                          ).toLocaleDateString()
                        : "No date"}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </AppLayout>
  );
}