import Card from "../ui_components/Card";
import logo from "../assets/ Warm_browns_logo.png";
import Logo from "../ui_components/Logo"
import "../css/App.css";
import { useNavigate } from "react-router-dom";
import { handleSignUp } from "../logicCode/Utility";

export default function LandingPag() {
  const navigate = useNavigate();

    return(

        <div className="container-fluid">

      <Card  >
          <Logo logoSoruce={logo} className="img-fluid   " style={{

            maxHeight: "50px", width: "auto", border: "234px  solid black "

          }} />
        <p className="display-7">Build wealth together through community savings</p>
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