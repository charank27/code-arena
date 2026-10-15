import {Routes,Route,Navigate} from "react-router"
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import Signup from "./pages/Signup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin"
import AdminDelete from "./components/AdminDelete"
import AdminUpdate from "./components/AdminUpdate";
function App(){
  const dispatch=useDispatch();
  const {user,isAuthenticated,loading}=useSelector((state)=>state.auth)
  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch])
   if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  //console.log(user);
  //console.log(isAuthenticated)
  return(
    <>
    <Routes>
      <Route path="/" element={isAuthenticated? <Homepage></Homepage>:<Navigate to="/login" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />: <Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated? <Navigate to="/" />:<Signup></Signup>}></Route>
      <Route path="/admin" element={isAuthenticated && user?.role==="admin"? <Admin></Admin>:<Navigate to="/" />}></Route>
      <Route path="/admin/create" element={isAuthenticated && user?.role==="admin"? <AdminPanel></AdminPanel>:<Navigate to="/" />}></Route>
      <Route path="/admin/update" element={isAuthenticated && user?.role === "admin" ? <AdminUpdate /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === "admin" ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/problem/:problemId" element={<ProblemPage></ProblemPage>}></Route>
      </Routes>   
    </>
  )
}
export default App;