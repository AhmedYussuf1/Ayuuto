import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// These are image files from your assets folder.
// The logo is used for branding, and the community image makes the landing page look more professional.
import communityImg from "../assets/community.png";
import logo from "../assets/ayuuto_logo.png";

/*
  LandingPage.jsx

  Purpose:
  This is the first page users see before logging in.

  Backend connection:
  This page does NOT call the backend.
  It only gives the user two choices:
  1. Log in
  2. Create account

  Design choice:
  I used React Bootstrap here so the page looks cleaner with less custom CSS.
*/

export default function LandingPage() {
  // useNavigate lets us move to another route/page when a button is clicked.
  const navigate = useNavigate();

  return (
    <div className="app-page">
      <Container className="py-5">
        <Row className="align-items-center g-5 min-vh-100">
          {/* Left side: text and buttons */}
          <Col lg={6}>
            <img
              src={logo}
              alt="Ayuuto logo"
              style={{ width: "110px", borderRadius: "24px" }}
              className="mb-4"
            />

            <h1 className="page-title display-4">
              Build savings groups with trust and clarity.
            </h1>

            <p className="page-subtitle fs-5 mt-3">
              Ayuuto helps community savings groups track members,
              contributions, payouts, and invitations in one simple place.
            </p>

            {/* These buttons send the user to the auth pages */}
            <div className="d-flex gap-3 mt-4">
              <Button
                className="btn-ayuuto-primary px-4"
                size="lg"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>

              <Button
                className="btn-ayuuto-secondary px-4"
                size="lg"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
            </div>
          </Col>

          {/* Right side: illustration */}
          <Col lg={6}>
            <Card className="page-card p-3">
              <Card.Img
                src={communityImg}
                alt="Community savings illustration"
                className="hero-image"
              />
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}