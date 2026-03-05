import Card from "../ui_components/Card";
import "../css/App.css";
import { useNavigate } from "react-router-dom";

import logo from "../assets/ayuuto_logo.png";
import heroImg from "../assets/community.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "#f7f4ef" }}>
      <div className="container-fluid px-4">

        <div className="d-flex justify-content-center">

          {/* Main card */}
          <div
            className="card shadow-lg border-0 w-100"
            style={{
              maxWidth: "1200px",
              borderRadius: "20px",
              overflow: "hidden"
            }}
          >

            <div className="row g-0" style={{ minHeight: "550px" }}>

              {/* LEFT SIDE */}
              <div className="col-md-6 p-5 d-flex flex-column justify-content-center text-center bg-white">

                <img
                  src={logo}
                  alt="Ayuuto logo"
                  style={{
                    maxHeight: "110px",
                    width: "110px",
                    objectFit: "contain",
                    margin: "0 auto 25px"
                  }}
                />

                <h1 className="fw-bold mb-3">
                  Save together. <br /> Grow together.
                </h1>

                <p className="text-muted mb-4">
                  Secure community savings circles for real goals.
                </p>

                {/* Buttons */}
                <div className="d-grid gap-3">

                  <button
                    className="btn btn-primary btn-lg rounded-pill"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </button>

                  <button
                    className="btn btn-outline-primary btn-lg rounded-pill"
                    onClick={() => navigate("/signup")}
                  >
                    Create account
                  </button>

                </div>
              </div>

              {/* RIGHT SIDE IMAGE */}
              <div className="col-md-6 d-none d-md-block">

                <img
                  src={heroImg}
                  alt="Community savings"
                  className="h-100 w-100"
                  style={{ objectFit: "cover" }}
                />

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}