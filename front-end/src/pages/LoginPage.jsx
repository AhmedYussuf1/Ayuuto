import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

// Firebase login function.
// Firebase handles the password/authentication part.
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../logicCode/config";

/*
  LoginPage.jsx

  Purpose:
  This page logs in an existing user.

  Important backend idea:
  Firebase knows the user by Firebase UID.
  PostgreSQL/backend knows the user by member_id.

  So after Firebase login works, we call:
  GET /member/me

  That backend route uses the Firebase token to find the matching member
  in the PostgreSQL member table.

  Flow:
  1. User types email/password.
  2. Firebase checks login.
  3. Firebase gives us a token.
  4. We send token to backend /member/me.
  5. Backend returns member_id.
  6. We save token and member_id in localStorage.
  7. User goes to dashboard.
*/

export default function LoginPage() {
  const navigate = useNavigate();

  // Stores what user types into the form.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // loading disables the button while login is processing.
  const [loading, setLoading] = useState(false);

  // error displays login/backend problems to the user.
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    // Prevents browser from refreshing the page when form submits.
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      /*
        Step 1:
        Firebase checks email and password.
        If wrong, Firebase throws an error.
      */
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      /*
        Step 2:
        Get Firebase token.
        This token proves to the backend that the user is logged in.
      */
      const token = await userCredential.user.getIdToken();

      /*
        Step 3:
        Save token so other pages can call protected backend routes.
      */
      localStorage.setItem("token", token);

      /*
        Step 4:
        Ask backend for the logged-in member.

        Backend route:
        GET /member/me

        The backend reads the Firebase UID from the token,
        then finds the matching member in the database.
      */
      const memberResponse = await fetch("http://localhost:3001/member/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const memberData = await memberResponse.json();

      if (!memberResponse.ok) {
        throw new Error(memberData.error || "Member not found in backend.");
      }

      /*
        Step 5:
        Save member_id.

        This is important because group membership, contributions,
        and payouts use member_id/membership_id from the database.
      */
      localStorage.setItem("member_id", memberData.member_id);

      // Step 6: Send user to dashboard.
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page d-flex align-items-center">
      <Container style={{ maxWidth: "520px" }}>
        <Card className="page-card p-4">
          <Card.Body>
            <h1 className="page-title text-center mb-2">Welcome Back</h1>

            <p className="page-subtitle text-center mb-4">
              Log in to view your savings groups.
            </p>

            {/* Shows error if Firebase login or backend member lookup fails */}
            {error && (
              <Alert variant="danger" className="alert-clean">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleLogin}>
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

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="btn-ayuuto-primary w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </Form>

            <p className="text-center mt-4 mb-0">
              Don&apos;t have an account? <Link to="/signup">Create one</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}