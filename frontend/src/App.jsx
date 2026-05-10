import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/globals.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/MyTripsPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import CitySearchPage from './pages/CitySearchPage';
import ActivitySearchPage from './pages/ActivitySearchPage';
import BudgetPage from './pages/BudgetPage';
import PackingChecklistPage from './pages/PackingChecklistPage';
import TripNotesPage from './pages/TripNotesPage';
import ProfilePage from './pages/ProfilePage';
import PublicTripPage from './pages/PublicTripPage';
import CommunityPage from './pages/CommunityPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/layout/Layout';

const LoadingScreen = () => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', flexDirection: 'column', gap: 16 }}>
    <div style={{ width: 56, height: 56, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Loading Traveloop...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/trip/share/:id" element={<PublicTripPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="my-trips" element={<MyTripsPage />} />
        <Route path="trips/create" element={<CreateTripPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="trips/:id/itinerary" element={<ItineraryBuilderPage />} />
        <Route path="trips/:id/view" element={<ItineraryViewPage />} />
        <Route path="trips/:id/budget" element={<BudgetPage />} />
        <Route path="trips/:id/packing" element={<PackingChecklistPage />} />
        <Route path="trips/:id/notes" element={<TripNotesPage />} />
        <Route path="cities" element={<CitySearchPage />} />
        <Route path="activities" element={<ActivitySearchPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:id" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: 'var(--ink)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.9rem', borderRadius: '10px', border: '1px solid rgba(201,168,76,0.2)' }, success: { iconTheme: { primary: 'var(--gold)', secondary: 'var(--ink)' } } }} />
      </Router>
    </AuthProvider>
  );
}

export default App;