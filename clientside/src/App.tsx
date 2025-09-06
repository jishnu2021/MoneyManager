import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/component/Navbar";
import Homepage from "./components/component/Homepage";
import Signup from "./components/authentication/Signup";
import Login from "./components/authentication/Login";
import Dashboard from "./components/component/Dashboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import About from "./components/component/About";
import Services from "./components/component/Services";
import Profile from "./components/component/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="about" element={<About/>}/>
        <Route path="services" element={<Services/>}/>
        <Route path="profile" element={<Profile/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
