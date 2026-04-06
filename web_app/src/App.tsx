import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MedicalCursor from './components/MedicalCursor';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TestsPage from './pages/TestsPage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

import BackgroundMedia from './components/BackgroundMedia';
import BrainModel from './components/BrainModel';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <BackgroundMedia />
      <div className="global-3d-overlay">
        <BrainModel />
      </div>
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-icon">🧠</div>
      <p className="loading-text">Loading...</p>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MedicalCursor />
        <Routes>
          <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><AppShell><Dashboard /></AppShell></PrivateRoute>} />
          <Route path="/tests" element={<PrivateRoute><AppShell><TestsPage /></AppShell></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><AppShell><ReportPage /></AppShell></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><AppShell><HistoryPage /></AppShell></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><AppShell><ProfilePage /></AppShell></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
