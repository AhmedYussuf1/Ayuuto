 import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
export default function BackBtn(){
         const navigate = useNavigate();

    return(
                    <p className="text-muted" onClick={() => navigate(-1)} > 
                 <ArrowBackIosNewIcon/ >
                 Back 
             
</p>
    );
}