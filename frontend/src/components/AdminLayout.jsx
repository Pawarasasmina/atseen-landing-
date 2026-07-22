import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, PanelLeftClose, Users, X } from 'lucide-react';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate('/admin/login'); };
  const links = [['/admin/leads', Users, 'Creator leads']];

  const side = <><div className="flex h-20 items-center justify-between px-5"><Brand /><button className="hidden p-2 lg:block" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar"><PanelLeftClose size={18} /></button><button className="p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close sidebar"><X /></button></div><nav className="space-y-2 p-3">{links.map(([to, Icon, label]) => <NavLink onClick={() => setOpen(false)} key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive ? 'bg-ice/10 text-ice' : 'text-white/50 hover:bg-white/[.04] hover:text-white'}`}><Icon size={18} />{!collapsed && label}</NavLink>)}<a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 hover:bg-white/[.04] hover:text-white"><ExternalLink size={18} />{!collapsed && 'View website'}</a></nav><div className="absolute bottom-0 left-0 right-0 border-t border-white/[.06] p-3"><button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 hover:bg-danger/10 hover:text-danger"><LogOut size={18} />{!collapsed && 'Logout'}</button></div></>;

  return <div className="min-h-screen bg-ink text-white"><aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/[.06] bg-night transition-all lg:block ${collapsed ? 'w-20' : 'w-64'}`}>{side}</aside>{open && <div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={() => setOpen(false)}><aside className="relative h-full w-72 border-r border-white/10 bg-night" onClick={(event) => event.stopPropagation()}>{side}</aside></div>}<div className={`transition-all ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}><header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[.06] bg-ink/85 px-5 backdrop-blur-xl"><button className="p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar"><Menu /></button><div className="ml-auto text-right"><p className="text-sm">{admin?.name}</p><p className="text-xs text-white/35">{admin?.role?.replace('_', ' ')}</p></div></header><main className="mx-auto max-w-[1500px] p-5 md:p-8"><Outlet /></main></div></div>;
}
