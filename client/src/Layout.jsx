import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AutoLogout from './components/AutoLogout';
import SystemAlert from './components/SystemAlert'; 

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <AutoLogout />
      
      <SystemAlert /> 

      <Sidebar />

      <div className="flex-1 w-full h-full overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}