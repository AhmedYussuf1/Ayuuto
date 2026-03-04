import Person2Icon from '@mui/icons-material/Person2';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import useUser from './logicCode/useUser';

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
                        <p>signed as {user.emal}</p>

                    }
                    <p className="fs-3 col-sm " onClick={() => { signOut(getAuth()); navigate("/") }}> Sign out</p>

                </div>



            </div>}

        </div>
    );
    

}