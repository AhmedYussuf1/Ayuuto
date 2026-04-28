import Form from "react-bootstrap/Form";
import { useNavigate, Link } from "react-router-dom";
import BackBtn from "../ui_components/BackBtn";
import WarningIcon from "@mui/icons-material/Warning";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../logicCode/config";

export default function SignUpPage() {
  // Lets us send user to another page after signup
  const navigate = useNavigate();

  // Stores form input values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Used to make sure user typed the same password twice
  const [confirmPassword, setConfirmPassword] = useState("");

  // Stores signup/database error messages
  const [error, setError] = useState("");

  async function createAccount(e) {
    // Stops page refresh
    e.preventDefault();

    // Clear old errors
    setError("");

    // Basic frontend validation before calling Firebase/backend
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    try {
      // Step 1: Create account in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Firebase gives us the logged-in user
      const firebaseUser = userCredential.user;

      // Step 2: Get Firebase token so backend knows this user is real
      const token = await firebaseUser.getIdToken();

      // Step 3: Save user info into our own PostgreSQL database
      // Backend route: POST /member
      const response = await fetch("http://localhost:3001/member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // Backend uses this token in verifyFirebaseToken middleware
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      // If backend failed, show error
      if (!response.ok) {
        throw new Error(data.error || "Failed to save user in database");
      }

      // If everything worked, go to dashboard
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="container">
      <BackBtn />

      {/* Shows error message if signup fails */}
      {error && (
        <p className="alert alert-warning d-flex align-items-center">
          <WarningIcon
            className="bi flex-shrink-0 me-2"
            sx={{ color: "red" }}
          />
          {error}
        </p>
      )}

      <Form onSubmit={createAccount}>
        <Form.Text className="text-muted">
          Join Ayuuto and start saving together
        </Form.Text>

        <Form.Group className="mb-3" controlId="fullName">
          <Form.Label>Full Name</Form.Label>

          <Form.Control
            type="text"
            placeholder="First Last"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>

          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>

          <Form.Control
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="passwordConfirmation">
          <Form.Label>Password Confirmation</Form.Label>

          <Form.Control
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <button className="container-lg btn mb-3 btn-primary" type="submit">
          Submit
        </button>
      </Form>

      <Link to="/login" className="btn btn-outline">
        Already have an account? Login
      </Link>
    </div>
  );
}