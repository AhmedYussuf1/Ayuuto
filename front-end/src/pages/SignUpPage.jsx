 import Form from 'react-bootstrap/Form';
 import { handleSignUp } from '../logicCode/Utility';
 import { useNavigate } from "react-router-dom";
import BackBtn from '../ui_components/BackBtn';
import { Link } from "react-router-dom";
import WarningIcon from '@mui/icons-material/Warning';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function SignUpPage(){
   const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    // TODO: firebase login
    // on success:
    // navigate("/dashboard");
  }

  async function createAccount(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("don not match");

      setError("Password and confirmPassword do not match ");
      return;
    }
    try {
      await createUserWithEmailAndPassword(getAuth(), email, password);
      navigate("/DashBoard");
    } catch (error) {
      setError(error.message);
    }
  }

    return(
    <div className='container'>
        <BackBtn />
        {error && <p className=" alert alert-warning d-flex align-items-center">  <WarningIcon className='bi flex-shrink-0 me-2' sx={{ color: "red" }} />
          {error}   </p>}
            <Form>
                 <Form.Text className="text-muted">
 Join Ayuuto and start sabing together        </Form.Text>

          <Form.Group className="mb-3" controlId="fullName">
        <Form.Label>Full Name</Form.Label>
        <Form.Control type="text" placeholder="First Last" />
       
      </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>

            <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />


      </Form.Group>


      <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label  >Password</Form.Label>
            <Form.Control type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="passwordConfirmation">
        <Form.Label>Password Confirmaiton </Form.Label>
            <Form.Control type="password" placeholder="re enter passweord" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        
      </Form.Group>
          <button onClick={createAccount} className=" container-lg btn mb-3 btn-primary " type="submit">
            Submit      </button>
        
     
    </Form>
        <Link to="/login" className='btn btn-outline'>
          Already have an account? Login

        </Link>


        </div>

    );
}
