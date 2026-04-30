import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import useUser from "../logicCode/useUser";
import { auth } from "../logicCode/config";
import "../css/create-group.css";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();

  const [formData, setFormData] = useState({
    groupName: "",
    contributionAmount: "",
    startDate: "",
    frequency: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!user) {
        throw new Error("You must be logged in to create a group");
      }

      const payload = {
        group_name: formData.groupName.trim(),
        contribution_amount: Number(formData.contributionAmount),
        start_cycle_date: formData.startDate,
        frequency: formData.frequency,
        notes: formData.notes,
      };

      const token = await user.getIdToken();

      const response = await fetch("http://localhost:3001/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      alert("Group created successfully");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="create-group-page">
      <nav className="create-group-nav">
        <div className="create-group-logo">AYUUTO</div>

        <div className="create-group-nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="create-group-container">
        <div className="create-group-header">
          <h1>Create a New Group</h1>
          <p>Set up a savings group</p>
        </div>

        <form className="create-group-form" onSubmit={handleSubmit}>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <label>Group Name</label>
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            required
          />

          <label>Contribution Amount</label>
          <input
            type="number"
            name="contributionAmount"
            value={formData.contributionAmount}
            onChange={handleChange}
            min="0"
            required
          />

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <label>Frequency</label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
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

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}