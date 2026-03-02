import { useNavigate } from "react-router-dom";

export default function LoginPage(){
     const navigate = useNavigate();

  function handleSignUp(e) {
    e.preventDefault();
    // TODO: firebase signup
    // on success:
    // navigate("/login");
  }
    return (<h1>Login Page</h1>);
}