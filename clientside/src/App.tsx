import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/component/Navbar"
import Homepage from "./components/component/Homepage"
import Signup from "./components/authentication/Signup"
import Login from "./components/authentication/Login"

const App = () => {
return (
  
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="signup" element={<Signup/>}/>
          <Route path="login" element={<Login/>}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
