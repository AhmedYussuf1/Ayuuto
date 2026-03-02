let CustomInPut = ({typeOfInput , styleOfInput,  placeHolder})=>{
    return(
       <input type={typeOfInput} className={styleOfInput} placeholder={placeHolder}/>
    );

}
 export default CustomInPut; 