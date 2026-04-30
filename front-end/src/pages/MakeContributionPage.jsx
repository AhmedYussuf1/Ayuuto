import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/make-contribution.css";

export default function MakeContributionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [membershipId, setMembershipId] = useState(null);

  // 🔥 GET MEMBERSHIP FOR THIS USER + GROUP
  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ get current logged-in member
        const memberRes = await fetch(
          "http://localhost:3001/member/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const memberData = await memberRes.json();
        console.log("memberData:", memberData);

        if (!memberRes.ok) {
          throw new Error(memberData.error || "Failed to get member");
        }

        const memberId = memberData.member_id;

        // 2️⃣ get memberships for that member
        const membershipRes = await fetch(
          `http://localhost:3001/membership/member/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const memberships = await membershipRes.json();

        console.table(memberships);
        console.log("route group id:", Number(id));

        if (!membershipRes.ok) {
          throw new Error("Failed to get memberships");
        }

        // ✅ FIXED MATCH (NUMBER COMPARISON)
        const match = memberships.find(
          (m) => Number(m.group_id) === Number(id)
        );

        console.log("match found:", match);

        if (!match) {
          throw new Error("Membership not found for this group");
        }

        setMembershipId(match.membership_id);
      } catch (err) {
        console.error("Membership fetch error:", err);
        alert(err.message);
      }
    };

    fetchMembership();
  }, [id]);

  const group = {
    id,
    name: "Friends Savings",
    contributionAmount: 100,
    dueDate: "April 15, 2026",
    contributionHistory: [
      { date: "March 15, 2026", amount: "$100", status: "Paid" },
      { date: "February 15, 2026", amount: "$100", status: "Paid" },
      { date: "January 15, 2026", amount: "$100", status: "Paid" },
    ],
  };

  // 💰 MAKE CONTRIBUTION
  const handlePayNow = async () => {
    if (!amount) {
      alert("Please enter a contribution amount");
      return;
    }

    if (!membershipId) {
      alert("Membership not loaded yet");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/contribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          membership_id: membershipId,
          amount: Number(amount),
          contribution_date: new Date().toISOString().split("T")[0],
          status: "RECEIVED",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to make contribution");
      }

      alert("Contribution submitted successfully");
      setAmount("");
    } catch (error) {
      console.error("Contribution error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contribution-page">
      <nav className="contribution-nav">
        <div className="contribution-logo">AYUUTO</div>

        <div className="contribution-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>
            Back to Group
          </button>
        </div>
      </nav>

      <div className="contribution-container">
        <div className="contribution-header">
          <h1>Make Contribution</h1>
          <p>Submit your contribution for {group.name}.</p>
        </div>

        <section className="contribution-section">
          <h2>Current Payment</h2>

          <div className="contribution-summary">
            <div className="summary-card">
              <h3>Amount Due</h3>
              <p>${group.contributionAmount}</p>
            </div>

            <div className="summary-card">
              <h3>Due Date</h3>
              <p>{group.dueDate}</p>
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

            <button
              className="pay-btn"
              onClick={handlePayNow}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </section>

        <section className="contribution-section">
          <h2>Contribution History</h2>

          <div className="history-list">
            {group.contributionHistory.map((item, index) => (
              <div className="history-card" key={index}>
                <div>
                  <h3>{item.date}</h3>
                  <p>{item.amount}</p>
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