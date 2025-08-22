import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import FirstAuthorPage from './pages/FirstAuthorPage';
import CollaboratorPage from './pages/CollaboratorPage';
import PaperEditorPage from './pages/PaperEditorPage';
import MyPapersPage from './pages/MyPapersPage';
import './App.css';
import EditPaperPage from './pages/EditPaperPage';
import LikedPapersPage from './pages/LikedPapersPage';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-slate-600 mt-4 text-center">Loading....</p>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/liked-papers" element={<LikedPapersPage />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/first-author" element={
            <ProtectedRoute>
              <FirstAuthorPage />
            </ProtectedRoute>
          } />
          <Route path="/collaborator" element={
            <ProtectedRoute>
              <CollaboratorPage />
            </ProtectedRoute>
          } />
          <Route path="/my-papers" element={
            <ProtectedRoute>
              <MyPapersPage />
            </ProtectedRoute>
          } /> 
          <Route path="/paper/:id" element={
            <ProtectedRoute>
              <PaperEditorPage />
            </ProtectedRoute>
          } />
          <Route path="/edit-paper/:id" element={
            <ProtectedRoute>
              <EditPaperPage />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;