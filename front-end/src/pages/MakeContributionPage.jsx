// this lets me move between pages and read group id from the url
import { useNavigate, useParams } from "react-router-dom";

// this lets me load backend data and store form values
import { useEffect, useState } from "react";

// firebase config so i can get the logged in user token
import { auth } from "../logicCode/config";

// css for this page
import "../css/make-contribution.css";

export default function MakeContributionPage() {
  const navigate = useNavigate();

  // this gets group id from the url
  // example: /group/3/contribute means id is 3
  const { id } = useParams();

  // this stores the group info from backend
  const [group, setGroup] = useState(null);

  // this stores logged in member
  const [member, setMember] = useState(null);

  // this stores this user's membership in the group
  const [myMembership, setMyMembership] = useState(null);

  // this stores previous contributions
  const [contributions, setContributions] = useState([]);

  // this stores input values
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

  async function loadContributionPage() {
    try {
      setLoading(true);
      setError("");

      // get group details
      const groupData = await backendRequest(`/group/${id}`);
      setGroup(groupData);

      // get current logged in member
      const memberData = await backendRequest("/member/me");
      setMember(memberData);

      // get all members in this group
      const memberships = await backendRequest(`/membership/group/${id}`);

      // find the logged in user's membership row
      const foundMembership = memberships.find(
        (item) => Number(item.member_id) === Number(memberData.member_id)
      );

      setMyMembership(foundMembership || null);

      // get all contributions for this group
      const contributionData = await backendRequest(`/contribution/group/${id}`);
      setContributions(contributionData);
    } catch (error) {
      console.error("Contribution page error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContributionPage();
  }, [id]);

  async function submitContribution() {
    try {
      setSaving(true);
      setError("");

      if (!myMembership) {
        throw new Error("You are not a member of this group");
      }

      if (!amount || Number(amount) < 0) {
        throw new Error("Enter a valid amount");
      }

      // backend route: POST /contribution
      await backendRequest("/contribution", {
        method: "POST",
        body: JSON.stringify({
          membership_id: myMembership.membership_id,
          amount: Number(amount),
          status: "PAID",
          note: note,
        }),
      });

      setAmount("");
      setNote("");

      await loadContributionPage();
    } catch (error) {
      console.error("Submit contribution error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading contribution page...</p>;
  }

  const groupInfo = group?.group || group;
  const payoutCycle = group?.payout_cycle;

  const myContributions = contributions.filter(
    (item) => Number(item.member_id) === Number(member?.member_id)
  );

  return (
    <div className="contribution-page">
      <nav className="contribution-nav">
        <div className="contribution-logo">AYUUTO</div>

        <div className="contribution-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>Back to Group</button>
        </div>
      </nav>

      <div className="contribution-container">
        <div className="contribution-header">
          <h1>Make Contribution</h1>
          <p>Submit your contribution for {groupInfo?.group_name}.</p>
        </div>

        {error && <p className="alert alert-warning">{error}</p>}

        <section className="contribution-section">
          <h2>Current Payment</h2>

          <div className="contribution-summary">
            <div className="summary-card">
              <h3>Amount Due</h3>
              <p>${payoutCycle?.contribution_amount || 0}</p>
            </div>

            <div className="summary-card">
              <h3>Frequency</h3>
              <p>{payoutCycle?.frequency || "N/A"}</p>
            </div>
          </div>

          <div className="payment-box">
            <input
              type="number"
              placeholder="Enter contribution amount"
              className="contribution-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              type="text"
              placeholder="Optional note"
              className="contribution-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              className="pay-btn"
              onClick={submitContribution}
              disabled={saving}
            >
              {saving ? "Saving..." : "Pay Now"}
            </button>
          </div>
        </section>

        <section className="contribution-section">
          <h2>Your Contribution History</h2>

          <div className="history-list">
            {myContributions.length === 0 && <p>No contributions yet.</p>}

            {myContributions.map((item) => (
              <div className="history-card" key={item.contribution_id}>
                <div>
                  <h3>
                    {new Date(item.contribution_date).toLocaleDateString()}
                  </h3>
                  <p>${item.amount}</p>
                  {item.note && <p>{item.note}</p>}
                </div>

                <span className="paid-status">{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}