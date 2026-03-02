import { useNavigate } from "react-router-dom";
  import Form from 'react-bootstrap/Form';
import BackBtn from "./ui_components/BackBtn";
import { Link } from "react-router-dom";


export default function LoginPage(){

  function handleSignUp(e) {
    e.preventDefault();
    // TODO: firebase signup
    // on success:
    // navigate("/login");
  }
    return (
        <div className='container'>
           
<BackBtn  />

   
            <Form>
                 <Form.Text className="text-muted">
 Join Ayuuto and start sabing together        </Form.Text>
     
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" />
       
      </Form.Group>


      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Create Password" />
      </Form.Group>
       
          <button  onClick={handleSignUp} className=" container-lg btn mb-3 btn-primary " type="submit">
        Submit
      </button>
        
     
    </Form>
 
     <Link to="/Signup" className='btn btn-outline'>
        Don’t have an account? Sign up

        </Link>        </div>

    );
 
}