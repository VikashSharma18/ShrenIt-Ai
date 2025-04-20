import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/Layout";
import Home from "./pages/Home/Home";
import Features from "./pages/Features/Features";
import Login from "./pages/Login/Login";
import { AuthProvider } from "./pages/Login/AuthContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import Profile from "./pages/Profile/Profile.jsx";
import AptitudeSprint from "./pages/AllFeatures/AptitudeSprint/AptitudeSprint.jsx";
import CourseHive from "./pages/AllFeatures/CourseHive/CourseHive.jsx";
import RoadmapAI from "./pages/AllFeatures/RoadmapAI/RoadmapAI.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/features" element={<Features />} />
              <Route path="/profile" element={<Profile />} />

              {/* Features */}
              <Route path="/aptitudesprint" element={<AptitudeSprint />} />
              <Route path="/coursehive" element={<CourseHive />} />
              <Route path="/roadmapai" element={<RoadmapAI />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;