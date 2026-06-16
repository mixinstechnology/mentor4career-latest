import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import { LoaderProvider } from './context/LoaderContext.tsx';
import Loader from './utils/Loader.jsx';
import useReveal from './hooks/useReveal.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import BookingModal from './components/BookingModal.jsx';

import Home from './pages/Home.jsx';
import Mentors from './pages/Mentors.jsx';
import Predictor from './pages/Predictor.jsx';
import Jobs from './pages/Jobs.jsx';
import Webinars from './pages/Webinars.jsx';
import Interview from './pages/Interview.jsx';
import Contact from './pages/Contact.jsx';
import Faq from './pages/Faq.jsx';
import Support from './pages/Support.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MentorDashboard from './pages/MentorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const DASHBOARD_PATHS = ['/dashboard', '/mentor-dashboard', '/admin-dashboard'];

function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role === 'mentor' && user.role !== 'mentor') return <Navigate to="/" replace />;
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />;
  if (role === 'student' && (user.role === 'mentor' || user.role === 'admin')) return <Navigate to="/" replace />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useReveal();
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isDashboard = DASHBOARD_PATHS.includes(pathname);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/predictor" element={<Predictor />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/webinars" element={<Webinars />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/support" element={<Support />} />
        <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />
        <Route path="/mentor-dashboard" element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!isDashboard && <Footer />}
      <AuthModal />
      <BookingModal />
    </>
  );
}

export default function App() {
  return (
    <LoaderProvider>
      <AuthProvider>
        <BookingProvider>
          <ScrollToTop />
          <AppLayout />
          <Loader />
          <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
        </BookingProvider>
      </AuthProvider>
    </LoaderProvider>
  );
}
