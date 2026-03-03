import { useEffect, useState } from "react";

 import { getAuth, onAuthStateChanged } from "firebase/auth";
 const useUser = (u)=>{
    const [isLoading, setIsLoading] = useState(true);
    const [ user, setUser] = useState(null)
     useEffect(()=>{
       const unsubscribe =  onAuthStateChanged(getAuth(), function(user){
            setUser(user);
            setIsLoading(false);

        });
        return unsubscribe;
    }, []);

return {isLoading, user}
 }
 export default useUser;