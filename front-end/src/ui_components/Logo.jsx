const Logo = ({logoSoruce})=>{
    return (<div className="ing-fluid" >
        <img className="img-fluid  " style={{

            maxHeight: "1000px", width: "auto",

        }}
            src={logoSoruce} alt="logo " /> </div>

)
}
export default Logo;