// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // tailwind + global css

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Members from "./pages/Members";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function WithNavbar({ children }) {
  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-6">{children}</div>
    </>
  );
}

export default function App() {
  // we intentionally read token from localStorage directly so that simple page reloads work.
  // For more advanced flows, consider storing auth state in context and updating on login/logout.
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          fontSize: '14px',
          fontWeight: '500'
        }}
        toastClassName="shadow-lg rounded-lg"
        bodyClassName="text-sm"
        progressClassName="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      <Routes>
        {/* Root: redirect to dashboard if logged in */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected: pages wrapped with Navbar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WithNavbar>
                <Dashboard />
              </WithNavbar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <WithNavbar>
                <Plans />
              </WithNavbar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <WithNavbar>
                <Members />
              </WithNavbar>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<div className="p-6">404 — Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
