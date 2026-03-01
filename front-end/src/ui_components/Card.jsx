import Circle from "./Circle";


 const Card = ({widthOfCard, children, customStyle})=> {
    return(

<div className={`card p-2 align-center ${customStyle}` } style={{width : widthOfCard}}>    
 
  {children}
</div>
    );

}
export default Card;