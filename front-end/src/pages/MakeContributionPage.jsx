import { useNavigate, useParams } from "react-router-dom";
import "../css/make-contribution.css";

export default function MakeContributionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

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
            />
            <button
              className="pay-btn"
              onClick={() => alert("Contribution feature will connect later")}
            >
              Pay Now
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