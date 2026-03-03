// ... (Firebase auth import)

function getFriendlyMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email": return "Invalid email format.";
    case "auth/wrong-password": return "Incorrect password.";
     default: return "An unexpected error occurred.";
  }


 } 
 export default getFriendlyMessage;  
