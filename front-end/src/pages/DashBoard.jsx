import { useEffect, useState } from "react";
import Person2Icon from "@mui/icons-material/Person2";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import useUser from "../logicCode/useUser";
import { auth } from "../logicCode/config";
import "../css/dashboard.css";

export default function DashBoard() {
  const { isLoading, user } = useUser();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (!user) return;

        setGroupsLoading(true);
        setError("");

        const token = await user.getIdToken();

        const response = await fetch("http://localhost:3001/group", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch groups");
        }

        setGroups(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

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
            <p>-</p>
          </div>

          <div className="stat-card">
            <h3>Total Contributions</h3>
            <p>-</p>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <section className="dashboard-section">
            <h2>All Groups</h2>

            {groupsLoading && <p>Loading groups...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!groupsLoading && !error && groups.length === 0 && (
              <p>No groups found.</p>
            )}

            <div className="groups-list">
              {groups.map((group) => (
                <div className="group-card" key={group.group_id}>
                  <div className="group-card-top">
                    <div>
                      <h3>{group.group_name}</h3>

                      <p>
                        {group.payout_cycle?.contribution_amount
                          ? `$${group.payout_cycle.contribution_amount} / ${group.payout_cycle.frequency}`
                          : "No payout cycle"}
                      </p>

                      <p>Members: {group.member_count}</p>
                    </div>

                    <span
                      className={
                        group.payout_cycle?.status === "ACTIVE"
                          ? "status-badge active"
                          : "status-badge pending"
                      }
                    >
                      {group.payout_cycle?.status || "No Status"}
                    </span>
                  </div>

                  <div className="group-card-bottom">
                    <span>
                      Start date:{" "}
                      {group.start_cycle_date
                        ? new Date(group.start_cycle_date).toLocaleDateString()
                        : "Not set"}
                    </span>

                    <button
                      className="view-btn"
                      onClick={() => navigate(`/group/${group.group_id}`)}
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
              <p>Select a group to view its activity.</p>
            </div>

            <div className="activity-card">
              <p>Create or join a group to start tracking contributions.</p>
            </div>

            <div className="activity-card">
              <p>Group payout details will appear inside each group page.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}