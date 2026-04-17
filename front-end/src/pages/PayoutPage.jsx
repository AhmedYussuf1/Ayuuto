import { useNavigate, useParams } from "react-router-dom";
import "../css/payout.css";

export default function PayoutPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const group = {
    id,
    name: "Friends Savings",
    nextPayout: {
      recipient: "Bryan Ogega",
      amount: "$500",
      date: "May 1, 2026",
      status: "Scheduled",
    },
    payoutHistory: [
      { recipient: "Ahmed Yusuf", amount: "$500", date: "April 1, 2026" },
      { recipient: "Mai Hassan", amount: "$500", date: "March 1, 2026" },
    ],
  };

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
          <p>View and manage payouts for {group.name}.</p>
        </div>

        <section className="payout-section">
          <h2>Next Payout</h2>

          <div className="next-payout-card">
            <h3>{group.nextPayout.recipient}</h3>
            <p>Amount: {group.nextPayout.amount}</p>
            <p>Date: {group.nextPayout.date}</p>
            <p>Status: {group.nextPayout.status}</p>

            <button
              className="mark-paid-btn"
              onClick={() => alert("Mark payout feature will connect later")}
            >
              Mark as Paid
            </button>
          </div>
        </section>

        <section className="payout-section">
          <h2>Payout History</h2>

          <div className="payout-history-list">
            {group.payoutHistory.map((item, index) => (
              <div className="payout-history-card" key={index}>
                <div>
                  <h3>{item.recipient}</h3>
                  <p>{item.amount}</p>
                </div>
                <span>{item.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}