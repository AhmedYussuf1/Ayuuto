// this lets me move between pages like /login or /dashboard
import { useNavigate } from "react-router-dom";

// this is my css file for styling the dashboard
import "../css/dashboard.css";
// this is the dashboard page
export default function DashBoard() {

  // this is what lets buttons take me to other pages
  const navigate = useNavigate();

  // fake data for now (later will come from backend/api)
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

  return (
    // this is the whole page container (controls background + spacing)
    <div className="dashboard-page">

      {/* NAVBAR (top bar) */}
      <nav className="dashboard-nav">

        {/* app name top left */}
        <div className="dashboard-logo">AYUUTO</div>

        {/* buttons on the right */}
        <div className="dashboard-nav-links">

          {/* this just reloads dashboard */}
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          {/* this takes me back to login page */}
          <button onClick={() => navigate("/login")}>
            Logout
          </button>

        </div>
      </nav>

      {/* main content area */}
      <div className="dashboard-container">

        {/* top section with welcome text + buttons */}
        <div className="dashboard-hero">

          {/* welcome message */}
          <div>
            <h1>Welcome back, Bryan</h1>
            <p>Track your savings and group activity in one place.</p>
          </div>

          {/* buttons on right side */}
          <div className="dashboard-hero-actions">

            {/* green button (main action) */}
            {/* takes me to create group page */}
            <button
              className="primary-btn"
              onClick={() => navigate("/create-group")}
            >
              Create Group
            </button>

            {/* teal button (secondary action) */}
            {/* takes me to join group page */}
            <button
              className="secondary-btn"
              onClick={() => navigate("/join-group")}
            >
              Join Group
            </button>

          </div>
        </div>

        {/* stats section (the 3 boxes) */}
        <div className="dashboard-stats">

          {/* total groups box */}
          <div className="stat-card">
            <h3>Total Groups</h3>
            <p>2</p>
          </div>

          {/* next payout box */}
          <div className="stat-card">
            <h3>Next Payout</h3>
            <p>$500</p>
          </div>

          {/* total contributions box */}
          <div className="stat-card">
            <h3>Total Contributions</h3>
            <p>$1,200</p>
          </div>

        </div>

        {/* main grid (left = groups, right = activity) */}
        <div className="dashboard-main-grid">

          {/* LEFT SIDE - groups */}
          <section className="dashboard-section">
            <h2>Your Groups</h2>

            {/* loop through groups array and show each one */}
            <div className="groups-list">
              {groups.map((group) => (
                <div className="group-card" key={group.id}>

                  {/* top part of card */}
                  <div className="group-card-top">
                    <div>
                      <h3>{group.name}</h3>
                      <p>{group.amount}</p>
                    </div>

                    {/* status badge (green or coral depending on status) */}
                    <span
                      className={
                        group.status === "Active"
                          ? "status-badge active" // green
                          : "status-badge pending" // coral
                      }
                    >
                      {group.status}
                    </span>
                  </div>

                  {/* bottom part of card */}
                  <div className="group-card-bottom">

                    {/* next payout text */}
                    <span>Next payout: {group.nextPayout}</span>

                    {/* button to view group details */}
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

          {/* RIGHT SIDE - activity */}
          <section className="dashboard-section">
            <h2>Upcoming Activity</h2>

            {/* simple info cards */}
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