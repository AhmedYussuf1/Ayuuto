import Card from "../UI_components/Card";
import Circle from "../UI_components/Circle";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

export default function CreateGroupCard(){
    return (

        <Card>
  
              <div className="card-body   ">
        <Circle bgColor={'lightblue '}>

         <AddCircleOutlineOutlinedIcon className="material-symbols-outlined" alt="add"  
        sx={{
        width: 50, // Your desired size
        height: 50, // Same as width for a circle
        borderRadius: '50%', // Makes it a circle
        baclgroundColor: 'blue',
        color: 'blue'

         }}/> 
            </Circle>

      <h5 className="card-title">Create Group</h5>
    <p className="card-text">Start a new circle</p>
   </div>
        </Card>
    );
}