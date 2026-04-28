import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getFriendlyMessage from "../logicCode/userFriendlyError";
import "../css/LoginPage.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Logo from "../ui_components/Logo";
import logo from "../assets/ Warm_browns_logo.png";

export default function LoginPage() {
  // Stores what the user types in the email box
  const [email, setEmail] = useState("");

  // Stores what the user types in the password box
  const [password, setPassword] = useState("");

  // Stores any login error message we want to show on the page
  const [error, setError] = useState("");

  // Lets us move the user to another page after login
  const navigate = useNavigate();

  async function login(e) {
    // Stops the page from refreshing when the form submits
    e.preventDefault();

    // Clear old error before trying again
    setError("");

    try {
      // Firebase checks if the email/password is correct
      await signInWithEmailAndPassword(getAuth(), email, password);

      // If login works, send user to dashboard
      // IMPORTANT: route is lowercase /dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log("Firebase login error:", err.code, err.message);

      // These make Firebase errors easier for a regular user to understand
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError(getFriendlyMessage(err.code) ?? "Login failed. Please try again.");
      }
    }
  }

  return (
    <div className="container">
      <div className="row m-2">
        <p className="col">Ayuuto: Grow and Prosper Together.</p>
      </div>

      <div className="row">
        <div className="col col-sm-12 col-md-5 col-lg-5 mb-3 col-xs-10">
          <Logo logoSoruce={logo} className="img-fluid" />
        </div>

        <div className="container-fluid form-container col col-sm col-md-5 col-xs-12">
          <Form className="card p-2 shadow-xl p-3 mb-5 rounded" onSubmit={login}>
            <div className="fs-1 col-auto align-center text-center">
              Login to Ayuuto
            </div>

            {/* Shows login error if there is one */}
            {error && <Form.Text className="text-muted">{error}</Form.Text>}

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>

              <Form.Control
                className="input"
                type="email"
                value={email}
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>

              <Form.Control
                className="input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {/* Submit button runs login because the form has onSubmit={login} */}
            <button className="container-lg btn mb-3" type="submit">
              Login
            </button>

            <Link to="/signup" className="btn btn-outline">
              Don’t have an account? Sign up
            </Link>
          </Form>
        </div>
      </div>
    </div>
  );
}