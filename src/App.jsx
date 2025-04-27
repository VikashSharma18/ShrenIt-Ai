import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/Layout";
import Home from "./pages/Home/Home";
import Features from "./pages/Features/Features";
import Login from "./pages/Login/Login";
import { AuthProvider } from "./pages/Login/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import AptitudeSprint from "./pages/AllFeatures/AptitudeSprint/AptitudeSprint.jsx";
import CourseHive from "./pages/AllFeatures/CourseHive/CourseHive.jsx";
import RoadmapAI from "./pages/AllFeatures/RoadmapAI/RoadmapAI.jsx";
import InterviewDecoded from "./pages/AllFeatures/InterviewDecoded/InterviewDecoded.jsx";
import Admin from "./pages/Admin/Admin.jsx";
import CampusConnect from "./pages/AllFeatures/CampusConnect/CampusConnect.jsx";
import FAQ from "./pages/FAQ/FAQ.jsx";
import Aboutus from "./pages/About Us/Aboutus.jsx";
import "./App.css"; // Add global styles for smooth scrolling
import QuickNotesAi from "./pages/AllFeatures/QuickNotesAi/QuickNotesAi.jsx";
import InternshipApp from "./pages/AllFeatures/Internship/Internship.jsx";
import MockUpLabs from "./pages/AllFeatures/MockUpLabs/MockUpLabs.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Scroll-Based Sections */}
            <Route
              index
              element={
                <>
                  <section id="home">
                    <Home />
                  </section>
                  <section id="features">
                    <Features />
                  </section>
                  <section id="aboutus">
                    <Aboutus />
                  </section>
                  <section id="faq">
                    <FAQ />
                  </section>
                </>
              }
            />

            {/* Standalone Routes */}
            <Route path="/login" element={<Login id="login" />} />
            <Route path="/admin" element={<Admin id="admin" />} />
            <Route path="/faq" element={<FAQ id="faq" />} />
            <Route path="/aboutus" element={<Aboutus id="aboutus" />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/features" element={<Features id="features" />} />
              <Route path="/profile" element={<Profile id="profile" />} />

              {/* Features */}
              <Route
                path="/aptitudesprint"
                element={<AptitudeSprint id="aptitudesprint" />}
              />
              <Route
                path="/quick-notes-ai"
                element={<QuickNotesAi id="quick-notes-ai" />}
              />
              <Route
                path="/coursehive"
                element={<CourseHive id="coursehive" />}
              />
              <Route path="/roadmapai" element={<RoadmapAI id="roadmapai" />} />
              <Route
                path="/portfolio-builder"
                element={<InternshipApp id="portfolio-builder" />}
              />
              <Route
                path="/interview-decoded"
                element={<InterviewDecoded id="interview-decoded" />}
              />
              <Route
                path="/campus-connect"
                element={<CampusConnect id="campus-connect" />}
              />
              <Route
                path="/mockup-labs"
                element={<MockUpLabs id="mockup-labs" />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
