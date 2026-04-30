import Person2Icon from "@mui/icons-material/Person2";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useUser from "../logicCode/useUser";
import { auth } from "../logicCode/config";
import "../css/dashboard.css";

export default function DashBoard() {
  const { isLoading, user } = useUser();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboardGroups = async () => {
      try {
        const token = localStorage.getItem("token");

        const memberRes = await fetch("http://localhost:3001/member/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const memberData = await memberRes.json();

        if (!memberRes.ok) {
          throw new Error(memberData.error || "Failed to get current member");
        }

        const memberId = memberData.member_id;

        const membershipRes = await fetch(
          `http://localhost:3001/membership/member/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const membershipData = await membershipRes.json();

        if (!membershipRes.ok) {
          throw new Error(
            membershipData.error || "Failed to get memberships"
          );
        }

        const formattedGroups = membershipData.map((group) => ({
          id: group.group_id,
          name: group.group_name,
          amount: "Not set yet",
          status: group.left_date ? "Inactive" : "Active",
          nextPayout: "Not available",
        }));

        setGroups(formattedGroups);
      } catch (error) {
        console.error("Dashboard error:", error);
        alert(error.message || "Something went wrong");
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardGroups();
  }, []);

  if (isLoading || dashboardLoading) return <p>Loading...</p>;

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
            <p>{groups.length > 0 ? groups[0].nextPayout : "N/A"}</p>
          </div>

          <div className="stat-card">
            <h3>Total Contributions</h3>
            <p>Not available</p>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <section className="dashboard-section">
            <h2>Your Groups</h2>

            <div className="groups-list">
              {groups.length > 0 ? (
                groups.map((group) => (
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
                ))
              ) : (
                <div className="activity-card">
                  <p>You are not in any groups yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="dashboard-section">
            <h2>Upcoming Activity</h2>

            <div className="activity-card">
              <p>Your real group activity will appear here later.</p>
            </div>

            <div className="activity-card">
              <p>Create or join a group to get started.</p>
            </div>

            <div className="activity-card">
              <p>Contribution and payout updates can be added next.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}