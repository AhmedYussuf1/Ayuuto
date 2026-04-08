import { useNavigate, useParams } from "react-router-dom";
import "../css/group-settings.css";

export default function GroupSettingsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="group-settings-page">
      <nav className="group-settings-nav">
        <div className="group-settings-logo">AYUUTO</div>

        <div className="group-settings-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate(`/group/${id}`)}>Back to Group</button>
        </div>
      </nav>

      <div className="group-settings-container">
        <div className="group-settings-header">
          <h1>Group Settings</h1>
          <p>Update your group cycle dates and contribution rules.</p>
        </div>

        <section className="group-settings-section">
          <h2>Cycle Dates</h2>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Start Date</label>
              <input type="date" />
            </div>

            <div className="settings-field">
              <label>End Date</label>
              <input type="date" />
            </div>
          </div>
        </section>

        <section className="group-settings-section">
          <h2>Contribution Rules</h2>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Contribution Amount</label>
              <input type="number" placeholder="Enter amount" />
            </div>

            <div className="settings-field">
              <label>Contribution Frequency</label>
              <select>
                <option>Weekly</option>
                <option>Bi-Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>

          <div className="settings-field full-width">
            <label>Additional Rules</label>
            <textarea
              rows="4"
              placeholder="Add any group rules or notes here"
            ></textarea>
          </div>

          <button
            className="save-settings-btn"
            onClick={() => alert("Settings feature will connect later")}
          >
            Save Changes
          </button>
        </section>
      </div>
    </div>
  );
}