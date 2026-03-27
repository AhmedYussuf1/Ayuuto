import Card from "../ui_components/Card";
import logo from "../assets/ Warm_browns_logo.png";
import Logo from "../ui_components/Logo"
import "../css/App.css";
import { useNavigate } from "react-router-dom";
 
export default function LandingPag() {
  const navigate = useNavigate();

    return(

      <div className="container-fluid  mb-5 justify-content-center">

        <Card className="card m-0   bg-danger shadow-lg" >
          <Logo logoSoruce={logo} className="img-fluid   " style={{

            maxHeight: "50px", width: "auto", border: "234px  solid black "

          }} />
          <p className="display-6 align-center lead  mt-2 ps-3  card shadow-md " style={{ letterSpacing: " .2rem", border: "none", margin: " 4px, 3px auto" }}>Build wealth together through community savings</p>
          <button className="btn btn-outline-primary btn-lg mb-3 b" onClick={() => navigate("/login")} >
   LogIn
    </button>

          <button className="btn btn-outline-primary btn-lg" onClick={() => navigate("/signup")} >
            Create account
    </button>
        </Card>
      </div>
    );
}