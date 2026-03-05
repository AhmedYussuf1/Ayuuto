import Form from "react-bootstrap/Form";
import BackBtn from "../ui_components/BackBtn";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getFriendlyMessage from "../logicCode/userFriendlyError";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      navigate("/DashBoard", { replace: true });
    } catch (err) {
      console.log("Firebase login error:", err.code, err.message);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError(getFriendlyMessage(err.code) ?? "Login failed. Please try again.");
      }
    }
  }

  return (
    // Full-page background wrapper (we'll style this later in CSS)
    <div className="min-vh-100 d-flex flex-column" style={{ background: "#f7e0da" }}>
      {/* Top back button row */}
      <div className="p-3">
        <BackBtn />
      </div>

      {/* Center the card */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center px-3 pb-5">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "28px",
            padding: "28px",
          }}
        >
          <h1 className="text-center fw-bold mb-4" style={{ fontSize: "2rem" }}>
            Log in
          </h1>

          {/* Error message */}
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          {/* Form */}
          <Form onSubmit={login}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                className="py-3 px-3"
                style={{ borderRadius: "16px" }}
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formBasicPassword">
              <Form.Control
                className="py-3 px-3"
                style={{ borderRadius: "16px" }}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {/* Forgot row (Canva has a little link-ish row) */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <input type="checkbox" />
              <span className="small text-muted">Remember me</span>
              <span className="ms-auto small">
                <a href="#" className="text-decoration-none">
                  Forgot password?
                </a>
              </span>
            </div>

            {/* Big Canva button */}
            <button
              className="btn w-100 py-3 fw-semibold"
              type="submit"
              style={{
                borderRadius: "18px",
                background: "#0f8a96",
                border: "none",
                color: "white",
                fontSize: "1.1rem",
              }}
            >
              Log in
            </button>

            {/* Bottom signup link */}
            <div className="text-center mt-3">
              <Link to="/Signup" className="text-decoration-none">
                Don’t have an account? <span className="fw-semibold">Sign up</span>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}