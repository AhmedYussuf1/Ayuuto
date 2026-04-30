import { Container, Navbar, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/*
  AppLayout keeps the same navbar on all inside pages.
  It uses our Ayuuto navy color through the brand-navbar class.
*/

export default function AppLayout({ children, showBack = false, backTo }) {
  const navigate = useNavigate();

  const goDashboard = () => {
    navigate("/dashboard");
  };

  const goBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("member_id");
    navigate("/login");
  };

  return (
    <div className="app-page">
      <Navbar className="brand-navbar px-3" variant="dark">
        <Container fluid>
          <Navbar.Brand
            className="brand-logo"
            style={{ cursor: "pointer" }}
            onClick={goDashboard}
          >
            AYUUTO
          </Navbar.Brand>

          <div className="ms-auto d-flex gap-2">
            <Button variant="outline-light" onClick={goDashboard}>
              Dashboard
            </Button>

            {showBack && (
              <Button variant="outline-light" onClick={goBack}>
                Back
              </Button>
            )}

            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      <main className="page-shell">{children}</main>
    </div>
  );
}