import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/Layout";
import Home from "./pages/Home/Home";
import Features from "./pages/Features/Features";
import Login from "./pages/Login/Login";
import { AuthProvider } from "./pages/Login/AuthContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"

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
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;