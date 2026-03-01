import Card from "../ui_components/Card";
import logo from "../assets/ayuuto_logo.png"
import Logo from "../ui_components/Logo"
 import { useState } from "react";
import { handleSignUp } from "../logicCode/Utility";
export default function LandingPag(){
    const [signUp , setSignUp] = useState(false);
    
    return(
        <div className="container-fluid">
      <Card  >
        <Logo logoSoruce={logo}/>
        <p className="display-7">Build wealth together through community savings</p>
  <button className="btn btn-outline-primary btn-lg mb-3 b"  onClick={handleSignUp} >
   LogIn
    </button>
     <button className="btn btn-outline-primary btn-lg"  onClick={handleSignUp} >
     SignUp
    </button>
        </Card>
      </div>
    );
}