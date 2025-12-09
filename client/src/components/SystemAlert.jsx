import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { X, AlertTriangle, Info, Megaphone, BellRing, Check } from 'lucide-react';

export default function SystemAlert() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false); 

  const userRole = localStorage.getItem('user_role'); 

  useEffect(() => {
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    try {
      const response = await api.get('/notificacoes/');
      const allNotifs = response.data;

      const relevant = allNotifs.filter(n => {
        if (!n.ativo) return false;

        const isTarget = n.alvo === 'todos' || n.alvo === userRole;
        if (!isTarget) return false;

        const hasRead = localStorage.getItem(`read_notif_${n.id}`);
        return !hasRead;
      });

      if (relevant.length > 0) {
        setActiveAlert(relevant[0]);
        setTimeout(() => setIsVisible(true), 100);
      }
    } catch (error) {
      console.error("Erro ao buscar alertas", error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    setTimeout(() => {
        if (activeAlert) {
            localStorage.setItem(`read_notif_${activeAlert.id}`, 'true');
            setActiveAlert(null);
        }
    }, 300);
  };

  if (!activeAlert) return null;

  
  const getConfig = () => {
    switch (activeAlert.tipo) {
      case 'aviso': 
        return {
          gradient: 'from-red-600 to-rose-600',
          shadow: 'shadow-red-500/20',
          border: 'border-red-500/50',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-200',
          btnData: 'hover:bg-red-600 border-red-500/30 text-red-100',
          icon: <AlertTriangle size={32} />
        };
      case 'update':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          shadow: 'shadow-emerald-500/20',
          border: 'border-emerald-500/50',
          iconBg: 'bg-emerald-500/20',
          iconColor: 'text-emerald-200',
          btnData: 'hover:bg-emerald-600 border-emerald-500/30 text-emerald-100',
          icon: <Megaphone size={32} />
        };
      default: 
        return {
          gradient: 'from-amber-500 to-orange-600',
          shadow: 'shadow-amber-500/20',
          border: 'border-amber-500/50',
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-100',
          btnData: 'hover:bg-amber-600 border-amber-500/30 text-amber-100',
          icon: <BellRing size={32} />
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      <div 
        className={`
            w-full max-w-md bg-slate-900 border border-slate-700 
            rounded-3xl shadow-2xl relative overflow-hidden 
            transform transition-all duration-300 ease-out
            ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
            ${config.shadow}
        `}
      >
        
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${config.gradient}`}></div>
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-full blur-[60px] opacity-20 pointer-events-none`}></div>

        <div className="p-8 relative z-10 text-center">
           
           <div className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center ${config.iconBg} ${config.iconColor} ${config.border} border-2 shadow-lg animate-pulse-slow`}>
             {config.icon}
           </div>

           <h3 className="text-2xl font-bold text-white font-exo mb-3 tracking-wide">
             {activeAlert.titulo}
           </h3>

           <div className="max-h-40 overflow-y-auto custom-scrollbar mb-8">
             <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {activeAlert.mensagem}
             </p>
           </div>

           <button 
             onClick={handleDismiss}
             className={`
                w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider
                bg-slate-800 border transition-all duration-200
                flex items-center justify-center gap-2 group
                ${config.btnData}
             `}
           >
             <Check size={18} className="group-hover:scale-125 transition-transform" /> 
             {activeAlert.tipo === 'aviso' ? 'Entendido, resolver agora' : 'Marcar como Lido'}
           </button>

        </div>

        <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
            <X size={20} />
        </button>

      </div>
    </div>
  );
}