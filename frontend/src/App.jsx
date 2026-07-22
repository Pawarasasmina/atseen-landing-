import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<ProtectedRoute />}><Route element={<AdminLayout />}>
      <Route path="/admin" element={<Navigate to="/admin/leads" replace />} />
      <Route path="/admin/leads" element={<Leads />} />
      <Route path="/admin/leads/:id" element={<LeadDetails />} />
    </Route></Route>
    <Route path="*" element={<LandingPage />} />
  </Routes><Toaster position="bottom-right" toastOptions={{ style: { background: '#181D25', color: '#fff', border: '1px solid rgba(255,255,255,.08)' } }} /></AuthProvider></BrowserRouter>;
}
