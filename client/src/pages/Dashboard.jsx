import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  BarChart, Wallet, AlertCircle, CheckCircle2, 
  RefreshCw, TrendingUp, TrendingDown, Code, Briefcase, Eye 
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  const userRole = localStorage.getItem('user_role'); 
  const userName = localStorage.getItem('user_name') || 'Usuário';

  const [kpiData, setKpiData] = useState({
    totalIn: 0, totalOut: 0, balance: 0, pendingCount: 0, paidCount: 0
  });

  const getProfileConfig = () => {
    switch(userRole) {
      case 'dev': return { label: 'Desenvolvedor', color: 'text-purple-400', bg: 'from-purple-600 to-indigo-500', shadow: 'shadow-purple-500/20', icon: <Code size={20} className="text-white" /> };
      case 'view': return { label: 'Visitante', color: 'text-slate-400', bg: 'from-slate-600 to-slate-500', shadow: 'shadow-slate-500/20', icon: <Eye size={20} className="text-white" /> };
      case 'gestor': default: return { label: 'Gestor Hospitalar', color: 'text-cyan-400', bg: 'from-blue-600 to-cyan-400', shadow: 'shadow-cyan-500/20', icon: <Briefcase size={20} className="text-white" /> };
    }
  };
  const profile = getProfileConfig();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transacoes/');
      const data = response.data || []; // Garante que é array
      calculateKPIs(data);
    } catch (error) { 
        console.error("Erro ao buscar dados", error); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const calculateKPIs = (data) => {
    // Proteção: Garante que valor seja tratado como número, mesmo se vier null ou string
    const safeValue = (v) => parseFloat(v || 0);

    const tIn = data
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, curr) => acc + safeValue(curr.valor), 0);
    
    const tOut = data
        .filter(t => t.tipo === 'saida')
        .reduce((acc, curr) => acc + safeValue(curr.valor), 0);
    
    const pendente = data.filter(t => t.tipo === 'entrada' && t.status === 'pendente').length;
    const pagos = data.filter(t => t.tipo === 'saida').length;
    
    // Cálculo seguro do saldo
    const saldoDevedorReal = data
      .filter(t => t.tipo === 'entrada' && t.status === 'pendente')
      .reduce((acc, curr) => acc + safeValue(curr.valor), 0);

    setKpiData({ 
        totalIn: tIn, 
        totalOut: tOut, 
        balance: saldoDevedorReal, 
        pendingCount: pendente, 
        paidCount: pagos 
    });
  };

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const chartData = {
    labels: ['Total Histórico (Entradas)', 'Total Pago (Saídas)'],
    datasets: [{
        label: 'Valores (R$)',
        data: [kpiData.totalIn, kpiData.totalOut],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderRadius: 6,
        barThickness: 'flex', maxBarThickness: 50,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: { y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-8 scroll-smooth animate-fade-up">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
            <BarChart className="text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" /> Dashboard
          </h2>
          <p className="text-slate-400 text-sm">Visão geral financeira</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button onClick={fetchData} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-cyan-400 transition-all active:scale-95" title="Atualizar Dados">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white capitalize">{userName.split('.')[0]}</p>
              <p className={`text-[10px] uppercase tracking-wider font-bold ${profile.color}`}>
                {profile.label} • Online
              </p>
            </div>
            <div className={`w-10 h-10 bg-gradient-to-tr ${profile.bg} rounded-xl flex items-center justify-center shadow-lg ${profile.shadow}`}>
              {profile.icon}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        
        <div className={`p-5 sm:p-6 rounded-2xl border bg-slate-900 shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden group ${kpiData.balance > 0 ? 'border-red-500/30 shadow-red-900/10' : 'border-green-500/30 shadow-green-900/10'}`}>
          <div className={`absolute right-0 top-0 w-32 h-32 blur-[60px] rounded-full opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity ${kpiData.balance > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Saldo Devedor (Atual)</p>
                  <h3 className={`text-2xl sm:text-3xl font-bold font-exo ${kpiData.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatMoney(kpiData.balance)}
                  </h3>
              </div>
              <div className={`p-3 rounded-xl ${kpiData.balance > 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}><Wallet className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
                {kpiData.balance > 0 
                    ? <><TrendingUp size={14} className="text-red-400" /> Dívida Ativa Acumulada</> 
                    : <><TrendingDown size={14} className="text-green-400" /> Contas em dia</>
                }
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all hover:-translate-y-1">
          <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-500 blur-[60px] rounded-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div><p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Pendências</p><h3 className="text-2xl sm:text-3xl font-bold text-white font-exo">{kpiData.pendingCount}</h3></div>
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400"><AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            </div>
            <p className="text-xs text-slate-500">Notas aguardando baixa</p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 blur-[60px] rounded-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div><p className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Contas Pagas</p><h3 className="text-2xl sm:text-3xl font-bold text-white font-exo">{kpiData.paidCount}</h3></div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400"><CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /></div>
            </div>
            <p className="text-xs text-slate-500">Total de baixas realizadas</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Movimentação Financeira</h3>
        <div className="h-[250px] sm:h-[350px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}