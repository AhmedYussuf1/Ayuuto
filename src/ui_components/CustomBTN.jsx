 
 function CustomBTN({value, onClick, customStyle}) {
  return(
    <button className={customStyle} onClick={onClick}>
      {value}
    </button>
   );
 }
  export default CustomBTN;
