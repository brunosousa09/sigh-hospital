import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, Download, Upload, 
  Clock, FileText, Scale, LogOut, Menu, ChevronLeft, AlertTriangle, Users 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(() => {
    const savedState = localStorage.getItem('sidebar_expanded');
    return savedState !== 'false'; 
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    const newState = !expanded;
    setExpanded(newState);
    localStorage.setItem('sidebar_expanded', newState);
  };

  const role = localStorage.getItem('user_role');
  const allMenuItems = [
    { icon: LayoutDashboard, text: "Dashboard", path: "/dashboard", roles: ['dev', 'gestor', 'view'] },
    { icon: Building2, text: "Empresas", path: "/empresas", roles: ['dev', 'gestor'] },
    { icon: Download, text: "Entrada (NF)", path: "/entrada", roles: ['dev', 'gestor'] },
    { icon: Clock, text: "Pendências", path: "/pendencias", roles: ['dev', 'gestor', 'view'] },
    { icon: Upload, text: "Saída (Baixa)", path: "/saida", roles: ['dev', 'gestor'] },
    { icon: FileText, text: "Pagamentos", path: "/pagamentos", roles: ['dev', 'gestor', 'view'] },
    { icon: Users, text: "Usuários", path: "/usuarios", roles: ['dev', 'gestor'] },
    { icon: Scale, text: "Comparativo", path: "/comparativo", roles: ['dev', 'gestor', 'view'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');
  };

  return (
    <>
      <aside 
        className={`h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col z-20 flex-shrink-0 
        ${expanded ? "w-64" : "w-20"}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-20">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
            <div className="min-w-[40px] h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">S</div>
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-white font-exo">SIGH 9.0</h1>
              <p className="text-[10px] text-slate-400">Sist. Integrado de Gestão</p>
            </div>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors mx-auto"
          >
            {expanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center p-3 rounded-xl transition-all duration-200
                    ${active 
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-400/10 text-cyan-400 border border-cyan-500/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                    ${!expanded && "justify-center"}
                  `}
                >
                  <item.icon size={22} className={`min-w-[22px] transition-colors ${active ? "text-cyan-400" : "group-hover:text-white"}`} />
                  
                  <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                    {item.text}
                  </span>
                </button>

                {!expanded && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-md invisible opacity-0 -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 whitespace-nowrap border border-slate-700 shadow-xl">
                    {item.text}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setShowLogoutModal(true)} 
            className={`w-full flex items-center p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group ${!expanded && "justify-center"}`}>
            <LogOut size={22} />
            <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              Sair
            </span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-up">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <LogOut className="text-red-500 w-8 h-8 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Encerrar Sessão?</h3>
            <p className="text-slate-400 text-sm mb-6">Você será redirecionado para a tela de login.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancelar</button>
              <button onClick={handleLogout} className="flex-1 p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/25 transition-all">Sair Agora</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}