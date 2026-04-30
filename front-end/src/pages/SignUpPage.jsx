import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

// Firebase account creation function.
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../logicCode/config";

/*
  SignUpPage.jsx

  Purpose:
  This page creates a new user account.

  Important design idea:
  Firebase handles the login account and password.
  PostgreSQL/backend handles the app member profile.

  This means:
  - Firebase stores authentication info
  - Backend stores member info like full_name, email, firebase_uid

  Flow:
  1. User enters name, email, password, confirm password.
  2. Frontend checks password and confirm password match.
  3. Firebase creates the auth account.
  4. Firebase gives us a token.
  5. We call POST /member.
  6. Backend creates member row in PostgreSQL.
  7. Save member_id.
  8. Go to dashboard.
*/

export default function SignUpPage() {
  const navigate = useNavigate();

  // Form values typed by the user.
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Password values. Confirm password is only checked on frontend.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      /*
        Frontend validation:
        This prevents creating account if user mistyped password.
      */
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      /*
        Step 1:
        Create account in Firebase.
        Firebase stores the password securely.
      */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      /*
        Step 2:
        Get Firebase token so backend can verify this user.
      */
      const token = await userCredential.user.getIdToken();

      // Save token for later protected backend requests.
      localStorage.setItem("token", token);

      /*
        Step 3:
        Create the member in our backend database.

        Backend route:
        POST /member

        We send:
        - email
        - full_name

        We do NOT send the password.
        We do NOT manually send firebase_uid.
        Backend gets firebase_uid from the verified Firebase token.
      */
      const memberResponse = await fetch("http://localhost:3001/member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
        }),
      });

      const memberData = await memberResponse.json();

      if (!memberResponse.ok) {
        throw new Error(
          memberData.error ||
            "Firebase account was created, but backend member creation failed."
        );
      }

      /*
        Step 4:
        Save database member_id.

        This is needed because the backend uses member_id
        for memberships, contributions, and payouts.
      */
      localStorage.setItem("member_id", memberData.member_id);

      // Step 5: Send user to dashboard.
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page d-flex align-items-center">
      <Container style={{ maxWidth: "560px" }}>
        <Card className="page-card p-4">
          <Card.Body>
            <h1 className="page-title text-center mb-2">Create Account</h1>

            <p className="page-subtitle text-center mb-4">
              Start managing your community savings group.
            </p>

            {error && (
              <Alert variant="danger" className="alert-clean">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSignUp}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fullName}
                  placeholder="Enter full name"
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="btn-ayuuto-primary w-100"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </Form>

            <p className="text-center mt-4 mb-0">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}