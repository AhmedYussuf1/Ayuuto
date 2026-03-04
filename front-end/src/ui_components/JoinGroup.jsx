import Card from "../UI_components/Card";
import Circle from "../UI_components/Circle";
import { GroupOutlined } from "@mui/icons-material";
export default function JoinGroupCard(){
    return (

        <Card>
  
              <div className="card-body   ">
        <Circle bgColor={'lightblue '}>

         <GroupOutlined className="material-symbols-outlined" alt="add"  
        sx={{
        width: 50, // Your desired size
        height: 50, // Same as width for a circle
        borderRadius: '50%', // Makes it a circle
        baclgroundColor: 'blue',
        color: 'blue'

         }}/> 
            </Circle>

      <h5 className="card-title">Join Group </h5>
    <p className="card-text">Enter invite code</p>
   </div>
        </Card>
    );
}