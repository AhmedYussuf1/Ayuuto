import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import BackBtn from "../ui_components/BackBtn";
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import getFriendlyMessage from '../logicCode/userFriendlyError';

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";


export default function LoginPage(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate("");


  function handleSignUp(e) {
    e.preventDefault();
    // TODO: firebase signup
    // on success:
    // navigate("/login");
  }
  async function login(e) {
    e.preventDefault();


     setError("");

     try {
    await signInWithEmailAndPassword(getAuth(), email, password);
    navigate("/DashBoard", { replace: true });
  } catch (err) {
    console.log("Firebase login error:", err.code, err.message);

    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
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
      <div className='container-fluid'>
           
<BackBtn  />

   
        <Form className='card m-3 p-2 '>
          <div className="fs-1  col-auto    align-center text-center">
            Login to Ayuuto        </div>
          {error && <Form.Text className="text-muted">
            {error}      </Form.Text>}
     
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
            <Form.Control type="email" value={email} placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} />
       
      </Form.Group>


      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Form.Group>
       
          <button className=" container-lg btn mb-3 btn-primary " type="submit" onClick={login}>
            Login 
      </button>

          <Link to="/Signup" className='btn btn-outline'>
        Don’t have an account? Sign up

          </Link>
        </Form>

      </div>

    );
 
}