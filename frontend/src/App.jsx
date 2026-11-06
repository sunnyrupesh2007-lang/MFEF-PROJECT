import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import DoctorsList from './pages/DoctorsList';
import DoctorDetails from './pages/DoctorDetails';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrappers
const ProtectedPatientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedDoctorRoute = ({ children }) => {
  const { user, loading, isDoctor } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isDoctor) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedPatientRoute>
                <PatientDashboard />
              </ProtectedPatientRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedDoctorRoute>
                <DoctorDashboard />
              </ProtectedDoctorRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
