// this lets me move between pages
import { useNavigate } from "react-router-dom";

// this lets me store form values
import { useState } from "react";

// IMPORTANT → go up one folder then into css
import "../css/create-group.css";

// this is the create group page
export default function CreateGroupPage() {
  const navigate = useNavigate();

  // this stores form data
  const [formData, setFormData] = useState({
    groupName: "",
    contributionAmount: "",
    startDate: "",
    frequency: "",
    notes: "",
  });

  // runs when user types
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // runs when form is submitted
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("FORM DATA:", formData);

    alert("Group created");

    navigate("/dashboard");
  };

  return (
    <div className="create-group-page">

      {/* NAVBAR */}
      <nav className="create-group-nav">
        <div className="create-group-logo">AYUUTO</div>

        <div className="create-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="create-group-container">

        {/* HEADER */}
        <div className="create-group-header">
          <h1>Create a New Group</h1>
          <p>Set up a savings group</p>
        </div>

        {/* FORM */}
        <form className="create-group-form" onSubmit={handleSubmit}>

          <label>Group Name</label>
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
          />

          <label>Contribution Amount</label>
          <input
            type="number"
            name="contributionAmount"
            value={formData.contributionAmount}
            onChange={handleChange}
          />

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

          <label>Frequency</label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>

          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn">
              Create Group
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}