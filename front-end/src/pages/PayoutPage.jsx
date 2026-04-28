// this lets me move between pages and get group id from url
import { useNavigate, useParams } from "react-router-dom";

// this lets me load backend data
import { useEffect, useState } from "react";

// firebase config so i can get token
import { auth } from "../logicCode/config";

// css for this page
import "../css/payout.css";

export default function PayoutPage() {
  const navigate = useNavigate();

  // example: /group/3/payouts means id is 3
  const { id } = useParams();

  // this stores payouts from backend
  const [payouts, setPayouts] = useState([]);

  // this stores group members so we can choose who gets paid
  const [members, setMembers] = useState([]);

  // form values for creating payout
  const [membershipId, setMembershipId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function getToken() {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error("You must be logged in");
    }

    return firebaseUser.getIdToken();
  }

  async function backendRequest(endpoint, options = {}) {
    const token = await getToken();

    const response = await fetch(`http://localhost:3001${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Backend request failed");
    }

    return data;
  }

  async function loadPayouts() {
    try {
      setLoading(true);
      setError("");

      // backend route: GET /payout/group/:id
      const payoutData = await backendRequest(`/payout/group/${id}`);
      setPayouts(payoutData);

      // backend route: GET /membership/group/:id
      const memberData = await backendRequest(`/membership/group/${id}`);
      setMembers(memberData);
    } catch (error) {
      console.error("Payout page error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayouts();
  }, [id]);

  async function createPayout() {
    try {
      setSaving(true);
      setError("");

      if (!membershipId) {
        throw new Error("Choose a member first");
      }

      if (!amount || Number(amount) < 0) {
        throw new Error("Enter a valid amount");
      }

      // backend route: POST /payout
      await backendRequest("/payout", {
        method: "POST",
        body: JSON.stringify({
          membership_id: membershipId,
          amount: Number(amount),
          status: "PENDING",
          note: note,
        }),
      });

      setMembershipId("");
      setAmount("");
      setNote("");

      await loadPayouts();
    } catch (error) {
      console.error("Create payout error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function markPayoutPaid(payoutId) {
    try {
      setError("");

      // backend route: PUT /payout/:id
      await backendRequest(`/payout/${payoutId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "PAID",
        }),
      });

      await loadPayouts();
    } catch (error) {
      console.error("Update payout error:", error);
      setError(error.message);
    }
  }

  if (loading) {
    return <p>Loading payouts...</p>;
  }

  return (
    <div className="payout-page">
      <nav className="payout-nav">
        <div className="payout-logo">AYUUTO</div>

        <div className="payout-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>Back to Group</button>
        </div>
      </nav>

      <div className="payout-container">
        <div className="payout-header">
          <h1>Payouts</h1>
          <p>View and manage payouts for this group.</p>
        </div>

        {error && <p className="alert alert-warning">{error}</p>}

        <section className="payout-section">
          <h2>Create Payout</h2>

          <div className="next-payout-card">
            <select
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
            >
              <option value="">Choose member</option>

              {members.map((member) => (
                <option
                  key={member.membership_id}
                  value={member.membership_id}
                >
                  {member.full_name || member.email}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              type="text"
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              className="mark-paid-btn"
              onClick={createPayout}
              disabled={saving}
            >
              {saving ? "Saving..." : "Create Payout"}
            </button>
          </div>
        </section>

        <section className="payout-section">
          <h2>Payout History</h2>

          <div className="payout-history-list">
            {payouts.length === 0 && <p>No payouts yet.</p>}

            {payouts.map((item) => (
              <div className="payout-history-card" key={item.payout_id}>
                <div>
                  <h3>{item.full_name || item.email}</h3>
                  <p>${item.amount}</p>
                  <p>Status: {item.status}</p>
                  {item.note && <p>{item.note}</p>}
                </div>

                <span>
                  {new Date(item.payout_date).toLocaleDateString()}
                </span>

                {item.status !== "PAID" && (
                  <button
                    className="mark-paid-btn"
                    onClick={() => markPayoutPaid(item.payout_id)}
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}