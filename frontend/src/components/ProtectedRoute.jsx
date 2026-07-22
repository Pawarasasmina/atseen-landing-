import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute(){const {admin,loading}=useAuth();const location=useLocation();if(loading)return <div className="grid min-h-screen place-items-center bg-ink text-white/50">Checking access…</div>;return admin?<Outlet/>:<Navigate to="/admin/login" replace state={{from:location}}/>}
