   import { Box } from '@mui/material';
 
export default function Circle({children, bgColor}) {
  return ( 
 <Box className="mx-auto p-2 mb-2"   sx={{
        width: 70,  
        height:70,  
        borderRadius: '50%', // Makes it a circle
         display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        
        
border : 'none'
         }} style={{backgroundColor : bgColor}}>

               {children}
 </Box>
 
 
  );
}
