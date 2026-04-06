import Person2Icon from "@mui/icons-material/Person2";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import useUser from "../logicCode/useUser";
import { auth } from "../logicCode/config";
import "../css/dashboard.css";

export default function DashBoard() {
  const { isLoading, user } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // temp data (later from backend)
  const groups = [
    {
      id: 1,
      name: "Friends Savings",
      amount: "$100 / month",
      status: "Active",
      nextPayout: "April 2",
    },
    {
      id: 2,
      name: "Vacation Fund",
      amount: "$200 / month",
      status: "Pending",
      nextPayout: "April 15",
    },
  ];

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">AYUUTO</div>

        <div className="dashboard-nav-links">
          <span style={{ marginRight: "10px" }}>
            <Person2Icon /> {user?.email}
          </span>

          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div>
            <h1>Welcome back</h1>
            <p>Track your savings and group activity in one place.</p>
          </div>

          <div className="dashboard-hero-actions">
            <button
              className="primary-btn"
              onClick={() => navigate("/create-group")}
            >
              Create Group
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/join-group")}
            >
              Join Group
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Groups</h3>
            <p>{groups.length}</p>
          </div>

          <div className="stat-card">
            <h3>Next Payout</h3>
            <p>$500</p>
          </div>

          <div className="stat-card">
            <h3>Total Contributions</h3>
            <p>$1,200</p>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <section className="dashboard-section">
            <h2>Your Groups</h2>

            <div className="groups-list">
              {groups.map((group) => (
                <div className="group-card" key={group.id}>
                  <div className="group-card-top">
                    <div>
                      <h3>{group.name}</h3>
                      <p>{group.amount}</p>
                    </div>

                    <span
                      className={
                        group.status === "Active"
                          ? "status-badge active"
                          : "status-badge pending"
                      }
                    >
                      {group.status}
                    </span>
                  </div>

                  <div className="group-card-bottom">
                    <span>Next payout: {group.nextPayout}</span>

                    <button
                      className="view-btn"
                      onClick={() => navigate(`/group/${group.id}`)}
                    >
                      View Group
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2>Upcoming Activity</h2>

            <div className="activity-card">
              <p>Payment due Friday for Friends Savings.</p>
            </div>

            <div className="activity-card">
              <p>Your next payout is scheduled for April 2.</p>
            </div>

            <div className="activity-card">
              <p>Vacation Fund cycle starts again on April 15.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}