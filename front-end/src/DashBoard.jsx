import Person2Icon from '@mui/icons-material/Person2';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import useUser from './logicCode/useUser';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DashBoard(){
    const { isLoading, user } = useUser();

    const navigate = useNavigate("");
    return (
        <div className="container-fluid">

            {isLoading ? <p>Loading....</p> : <div className="container bg-danger ">
                <div className="row" >
                    <span className='col-sm' >


                        <Person2Icon /></span>
                    {user &&
                        <p>signed as {user.email}</p>

                    }
                    <button className="fs-3 col-sm " onClick={() => { signOut(getAuth()); navigate("/") }}> Sign out</button>

                </div>



            </div>}
            <div className='container-fluid  row bg-warning '>
                <div className='card m-2 col-4  bg-primary'>
                    testing
                    {/* display group detail */} </div>



                <div className='card  col-4 bg-success'> test2
                    {/* display payou informaitn */}
                </div>

            </div>
        </div>
    );
    

}