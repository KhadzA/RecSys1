import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import LandingPage from "./App";
import Login from "./auth/Login";
import Applicant from "./pages/applicant/applyForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/admin/dashboard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/pages/applicant/applyForm" element={<Applicant />} />

        <Route
          path="/pages/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
