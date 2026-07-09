import {Routes,Route,Navigate} from "react-router"
import Login from "./pages/Login";
import Homepage from "./pages/HomePage";
import Signup from "./pages/Signup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
function App(){
  const dispatch=useDispatch();
  const {isAuthenticated}=useSelector((state)=>state.auth)
  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch])
  return(
    <>
    <Routes>
      <Route path="/" element={isAuthenticated? <Homepage></Homepage>:<Navigate to="/signup" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />: <Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated? <Navigate to="/" />:<Signup></Signup>}></Route>
      </Routes>   
    </>
  )
}
export default App;