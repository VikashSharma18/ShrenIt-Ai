import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/Layout";
import Home from "./pages/Home/Home";
import Features from "./pages/Features/Features";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/features" element={<Features />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;