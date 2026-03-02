 import Form from 'react-bootstrap/Form';
 import { handleSignUp } from '../logicCode/Utility';
 import { useNavigate } from "react-router-dom";

export default function SignUpPage(){
   const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    // TODO: firebase login
    // on success:
    // navigate("/dashboard");
  }

    return(
    <div className='container'>
            <button onClick={() => navigate(-1)}>Back</button>

   
            <Form>
                 <Form.Text className="text-muted">
 Join Ayuuto and start sabing together        </Form.Text>
  <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Full Name</Form.Label>
        <Form.Control type="text" placeholder="First Last" />
       
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" />
       
      </Form.Group>


      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Create Password" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="passwordConfirmation">
        <Form.Label>Password Confirmaiton </Form.Label>
        <Form.Control type="password" placeholder="re enter passweord" />
        
      </Form.Group>
          <button  onClick={handleSignUp} className=" container-lg btn mb-3 btn-primary " type="submit">
        Submit
      </button>
        
     
    </Form>
         <button onClick={() => navigate("/login")}>
        Already have an account? Login
      </button>
        </div>

    );
}
