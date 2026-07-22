import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) { const [admin,setAdmin]=useState(null); const [loading,setLoading]=useState(true); const refresh=useCallback(async()=>{try{const {data}=await api.get('/admin/auth/me');setAdmin(data.admin)}catch{setAdmin(null)}finally{setLoading(false)}},[]); useEffect(()=>{refresh()},[refresh]); const login=async(credentials)=>{const {data}=await api.post('/admin/auth/login',credentials);setAdmin(data.admin)}; const logout=async()=>{try{await api.post('/admin/auth/logout')}finally{setAdmin(null)}}; return <AuthContext.Provider value={{admin,loading,login,logout}}>{children}</AuthContext.Provider> }
export const useAuth=()=>useContext(AuthContext);
