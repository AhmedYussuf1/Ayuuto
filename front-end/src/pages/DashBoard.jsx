import Person2Icon from "@mui/icons-material/Person2";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../logicCode/useUser";
import { auth } from "../logicCode/config";
import "../css/dashboard.css";

export default function DashBoard() {
  const { isLoading, user } = useUser();
  const navigate = useNavigate();

  // this stores the member record from our PostgreSQL database
  const [member, setMember] = useState(null);

  // this stores the real groups from the backend
  const [groups, setGroups] = useState([]);

  // this helps show a loading message while backend data is being pulled
  const [pageLoading, setPageLoading] = useState(true);

  // this stores backend errors so i can see what went wrong
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // this gets the firebase token for the logged in user
  // the backend needs this token because most routes are protected
  async function getToken() {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error("User not logged in");
    }

    return firebaseUser.getIdToken();
  }

  // this is a small helper function for backend GET requests
  // i made it here so i do not repeat the same token code many times
  async function backendGet(endpoint) {
    const token = await getToken();

    const response = await fetch(`http://localhost:3001${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Backend request failed");
    }

    return data;
  }

  // this runs when the dashboard opens
  // first it gets the logged in member, then it gets their groups
  useEffect(() => {
    async function loadDashboard() {
      if (isLoading) return;

      try {
        setPageLoading(true);
        setError("");

        // backend route: GET /member/me
        const memberData = await backendGet("/member/me");
        setMember(memberData);

        // backend route: GET /membership/member/:id
        // this returns the groups that this member belongs to
        const groupData = await backendGet(
          `/membership/member/${memberData.member_id}`
        );

        setGroups(groupData);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setPageLoading(false);
      }
    }

    loadDashboard();
  }, [isLoading]);

  if (isLoading || pageLoading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">AYUUTO</div>

        <div className="dashboard-nav-links">
          <span style={{ marginRight: "10px" }}>
            <Person2Icon /> {member?.full_name || user?.email}
          </span>

          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        {error && <p className="alert alert-warning">{error}</p>}

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
            <h3>Current User</h3>
            <p>{member?.full_name || "N/A"}</p>
          </div>

          <div className="stat-card">
            <h3>Member ID</h3>
            <p>{member?.member_id || "N/A"}</p>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <section className="dashboard-section">
            <h2>Your Groups</h2>

            <div className="groups-list">
              {groups.length === 0 && (
                <div className="group-card">
                  <div className="group-card-top">
                    <div>
                      <h3>No groups yet</h3>
                      <p>Create a group or join one to get started.</p>
                    </div>

                    <span className="status-badge pending">Empty</span>
                  </div>

                  <div className="group-card-bottom">
                    <span>Your real backend data will show here.</span>

                    <button
                      className="view-btn"
                      onClick={() => navigate("/create-group")}
                    >
                      Create First Group
                    </button>
                  </div>
                </div>
              )}

              {groups.map((group) => (
                <div className="group-card" key={group.membership_id}>
                  <div className="group-card-top">
                    <div>
                      <h3>{group.group_name}</h3>

                      <p>
                        Started:{" "}
                        {group.start_cycle_date
                          ? new Date(group.start_cycle_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <span
                      className={
                        group.left_date
                          ? "status-badge pending"
                          : "status-badge active"
                      }
                    >
                      {group.left_date ? "Inactive" : group.role}
                    </span>
                  </div>

                  <div className="group-card-bottom">
                    <span>
                      Joined:{" "}
                      {group.joined_date
                        ? new Date(group.joined_date).toLocaleDateString()
                        : "N/A"}
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

            {groups.length === 0 ? (
              <>
                <div className="activity-card">
                  <p>Create your first savings group to begin tracking activity.</p>
                </div>

                <div className="activity-card">
                  <p>After groups are created, contribution and payout updates will appear here.</p>
                </div>
              </>
            ) : (
              <>
                <div className="activity-card">
                  <p>You are currently connected to {groups.length} group(s).</p>
                </div>

                <div className="activity-card">
                  <p>Select a group to view members, contributions, invites, and payouts.</p>
                </div>

                <div className="activity-card">
                  <p>Dashboard data is now coming from the backend instead of fake data.</p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}