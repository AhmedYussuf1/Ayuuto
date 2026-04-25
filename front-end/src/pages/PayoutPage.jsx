import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/payout.css";

export default function PayoutPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        const token = localStorage.getItem("token");

        const groupRes = await fetch(`http://localhost:3001/group/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const groupData = await groupRes.json();

        if (!groupRes.ok) {
          throw new Error(groupData.error || "Failed to load group");
        }

        const payoutRes = await fetch(`http://localhost:3001/payout/group/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payoutData = await payoutRes.json();

        if (!payoutRes.ok) {
          throw new Error(payoutData.error || "Failed to load payouts");
        }

        setGroup(groupData);
        setPayouts(payoutData);
      } catch (error) {
        console.error("Payout page error:", error);
        alert(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutData();
  }, [id]);

  const handleMarkPaid = async (payoutId) => {
    try {
      setUpdatingId(payoutId);

      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3001/payout/${payoutId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "PAID",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payout");
      }

      setPayouts((prev) =>
        prev.map((payout) =>
          payout.payout_id === payoutId
            ? { ...payout, status: data.status }
            : payout
        )
      );

      alert("Payout marked as paid");
    } catch (error) {
      console.error("Update payout error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return <div className="payout-page">Loading payouts...</div>;
  }

  if (!group) {
    return <div className="payout-page">Group not found.</div>;
  }

  const nextPayout =
    payouts.find((payout) => payout.status === "PENDING") || null;

  const payoutHistory = payouts.filter((payout) => payout.status === "PAID");

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
          <p>View and manage payouts for {group.group_name}.</p>
        </div>

        <section className="payout-section">
          <h2>Next Payout</h2>

          {nextPayout ? (
            <div className="next-payout-card">
              <h3>{nextPayout.full_name}</h3>
              <p>Amount: ${nextPayout.amount}</p>
              <p>Date: {formatDate(nextPayout.payout_date)}</p>
              <p>Status: {nextPayout.status}</p>
              {nextPayout.note && <p>Note: {nextPayout.note}</p>}

              <button
                className="mark-paid-btn"
                onClick={() => handleMarkPaid(nextPayout.payout_id)}
                disabled={updatingId === nextPayout.payout_id}
              >
                {updatingId === nextPayout.payout_id
                  ? "Updating..."
                  : "Mark as Paid"}
              </button>
            </div>
          ) : (
            <div className="next-payout-card">
              <h3>No pending payout</h3>
              <p>There are no pending payouts for this group yet.</p>
            </div>
          )}
        </section>

        <section className="payout-section">
          <h2>Payout History</h2>

          <div className="payout-history-list">
            {payoutHistory.length > 0 ? (
              payoutHistory.map((item) => (
                <div className="payout-history-card" key={item.payout_id}>
                  <div>
                    <h3>{item.full_name}</h3>
                    <p>${item.amount}</p>
                    {item.note && <p>{item.note}</p>}
                  </div>
                  <span>{formatDate(item.payout_date)}</span>
                </div>
              ))
            ) : (
              <div className="payout-history-card">
                <div>
                  <h3>No payout history yet</h3>
                  <p>Paid payout records will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}