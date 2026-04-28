// this lets me move between pages
import { useNavigate } from "react-router-dom";

// this lets me store form values
import { useState } from "react";

// firebase config so i can get the logged in user's token
import { auth } from "../logicCode/config";

// css for this page
import "../css/create-group.css";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  // this stores what the user types in the form
  const [formData, setFormData] = useState({
    groupName: "",
    contributionAmount: "",
    startDate: "",
    frequency: "",
    notes: "",
  });

  // this stores backend or validation errors
  const [error, setError] = useState("");

  // this changes the button text while the backend is working
  const [loading, setLoading] = useState(false);

  // this runs every time the user types in an input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // this gets the Firebase token for the logged in user
  // the backend needs this token so it knows the request is coming from a real logged in user
  async function getToken() {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error("You must be logged in to create a group.");
    }

    return firebaseUser.getIdToken();
  }

  // this runs when the user submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (!formData.groupName.trim()) {
        throw new Error("Group name is required.");
      }

      if (!formData.contributionAmount) {
        throw new Error("Contribution amount is required.");
      }

      if (!formData.startDate) {
        throw new Error("Start date is required.");
      }

      if (!formData.frequency) {
        throw new Error("Frequency is required.");
      }

      const token = await getToken();

      // backend route: POST /group
      // this sends the form data to the backend so the group is saved in the database
      const response = await fetch("http://localhost:3001/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // this is required because the route is protected by Firebase token middleware
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_name: formData.groupName,
          contribution_amount: Number(formData.contributionAmount),
          start_cycle_date: formData.startDate,
          frequency: formData.frequency,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create group.");
      }

      // after the backend creates the group, go to the new group page
      // if the backend response has the group id, use it
      if (data.group?.group_id) {
        navigate(`/group/${data.group.group_id}`);
      } else if (data.group_id) {
        navigate(`/group/${data.group_id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Create group error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

        {/* ERROR MESSAGE */}
        {error && <p className="alert alert-warning">{error}</p>}

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

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}