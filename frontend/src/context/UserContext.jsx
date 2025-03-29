import axios from "axios";
import { createContext, useContext, useEffect, useState} from "react"
import toast, {Toaster} from "react-hot-toast"
const UserContext=createContext()
export const UserContextProvider=({children})=>{
    const [user,setUser]=useState([])
    const [isAuth,setIsAuth]=useState(false)
    const [loading ,setLoading]=useState(true)
    async function registerUser(formdata,navigate,fetchPosts) {
        setLoading(true)
        try{
const {data}=await axios.post("/api/auth/register",formdata)
toast.success(data.message)
setIsAuth(true)
setUser(data.user)
navigate("/")
setLoading(false)
fetchPosts()
        }
        catch(err){
            
            toast.error(err.response.data.message);
            setLoading(false)
        }
    }
    async function loginUser(email,password,navigate,fetchPosts) {
        setLoading(true)
        try{
const {data}=await axios.post("/api/auth/login",{email ,password,navigate})
toast.success(data.message)
setIsAuth(true)
setUser(data.user)
navigate("/")
setLoading(false)
fetchPosts()
        }
        catch(err){
            toast.error(err.response.data.message);
            setLoading(false)
        }
    }

    async function fetchUser() {
        try {
            const { data } = await axios.get("/api/user/me", {
                withCredentials: true, // Ensure cookies are sent
            });
    
            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.error("Error fetching user:", error);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }
    async function logoutUser(navigate) {
        try{
          const {data}=await axios.post("/api/auth/logout")
          if(data.message){
            toast.success(data.message)
            setUser([])
            setIsAuth(false)
            navigate("/login")
          }
        }
        catch(error){
            toast.error(error.response.data.message);
        }
    }
    async function followUser(id, fetchUser) {
        try {
          const { data } = await axios.post("/api/user/follow/" + id);
    
          toast.success(data.message);
          fetchUser();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      }
      async function updateProfilePic(id, formdata, setFile) {
        try {
          const { data } = await axios.put("/api/user/" + id, formdata);
          toast.success(data.message);
          fetchUser();
          setFile(null);
        } catch (error) {
          toast.error(error.response.data.message);
        }
      }
      async function updateProfileName(id, name, setShowInput) {
        try {
          const { data } = await axios.put("/api/user/" + id, { name });
          toast.success(data.message);
          fetchUser();
          setShowInput(false);
        } catch (error) {
          toast.error(error.response.data.message);
        }
      }
    
    useEffect(()=>{
fetchUser()
    },[])
    return ( <UserContext.Provider value={{loginUser,isAuth,user,setUser,loading,logoutUser,registerUser,followUser,updateProfilePic,updateProfileName}} >
    {children}
    <Toaster />
    </UserContext.Provider>
);
};
export const UserData=()=>useContext(UserContext)