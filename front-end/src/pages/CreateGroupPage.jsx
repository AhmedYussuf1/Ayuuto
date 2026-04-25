import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/create-group.css";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    groupName: "",
    contributionAmount: "",
    startDate: "",
    frequency: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (!formData.startDate) {
      alert("Please select a start date");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_name: formData.groupName,
          start_cycle_date: formData.startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      alert("Group created successfully");

      if (data.group_id) {
        navigate(`/group/${data.group_id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Create group error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <nav className="create-group-nav">
        <div className="create-group-logo">AYUUTO</div>

        <div className="create-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </nav>

      <div className="create-group-container">
        <div className="create-group-header">
          <h1>Create a New Group</h1>
          <p>Set up a savings group</p>
        </div>

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
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}