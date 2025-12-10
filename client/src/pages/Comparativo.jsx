import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Scale, Building2, TrendingDown, TrendingUp, Wallet, Printer, Calendar, Loader2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Comparativo() {
  const [companies, setCompanies] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, balance: 0 });
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resComp, resTrans] = await Promise.all([
        api.get('/empresas/'),
        api.get('/transacoes/')
      ]);
      setCompanies(resComp.data);
      setAllTransactions(resTrans.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [selectedCompanyId, filterDate, filterType, allTransactions, loading]);

  const applyFilters = () => {
    let result = [...allTransactions];

    if (selectedCompanyId !== 'all') {
      result = result.filter(t => t.empresa === parseInt(selectedCompanyId));
    }
    if (filterDate) {
      result = result.filter(t => t.data.startsWith(filterDate));
    }
    if (filterType !== 'all') {
      result = result.filter(t => t.tipo === filterType);
    }

    result.sort((a, b) => {
        const dateA = new Date(a.data_entrada || a.data_saida || a.data);
        const dateB = new Date(b.data_entrada || b.data_saida || b.data);
        return dateA - dateB; 
    });

    setFilteredTransactions(result);
    calculateStats(result);
  };

  const calculateStats = (data) => {
    let tIn = 0;
    let tOut = 0;
    data.forEach(t => {
      if (t.tipo === 'entrada') tIn += parseFloat(t.valor);
      else tOut += parseFloat(t.valor);
    });
    setStats({ totalIn: tIn, totalOut: tOut, balance: tIn - tOut });
  };

  const formatMoney = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getClassificacao = (t) => {
    if (t.tipo === 'entrada') {
      if (!t.tipo_material) return 'Geral';
      return t.tipo_material.charAt(0).toUpperCase() + t.tipo_material.slice(1);
    } else {
      const match = t.descricao ? t.descricao.match(/^\[(.*?)\]/) : null;
      return match ? match[1] : 'Saída Diversa';
    }
  };

  const chartData = {
    labels: ['Total Comprado (Dívida)', 'Total Pago'],
    datasets: [{
      data: [stats.totalIn, stats.totalOut],
      backgroundColor: ['#ef4444', '#22c55e'],
      borderColor: ['#7f1d1d', '#14532d'],
      borderWidth: 1,
    }],
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-8 relative animate-fade-up">
        
        <header className="mb-8 no-print">
          <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
            <Scale className="text-cyan-400 w-8 h-8" /> Análise Financeira
          </h2>
          <p className="text-slate-400 text-sm">Relatórios gerenciais e comparativos</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg mb-8 no-print">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-2"><Building2 size={14} /> Fornecedor</label>
              <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none cursor-pointer disabled:opacity-50">
                <option value="all">🏢 Análise Geral (Todos os Fornecedores)</option>
                {companies.map(c => (<option key={c.id} value={c.id}>{c.nome}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-2"><Calendar size={14} /> Período</label>
              <input type="month" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none disabled:opacity-50"/>
            </div>
            <div>
              <button onClick={() => window.print()} disabled={loading} className="w-full bg-white text-slate-900 font-bold p-3 rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                <Printer size={18} /> Imprimir
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
              <Loader2 size={64} className="text-cyan-400 animate-spin relative z-10" />
            </div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse">Processando dados financeiros...</p>
          </div>
        ) : (
          <div id="report-section" className="printable-content">
            
            <div className="hidden print:block text-center mb-8 border-b border-black pb-4">
              <h1 className="text-2xl font-bold uppercase">Hospital José Leite da Silva</h1>
              <p className="text-sm">Relatório Financeiro Analítico</p>
              <p className="text-xs mt-2 text-gray-500">
                <strong>Filtro:</strong> {selectedCompanyId === 'all' ? 'Todos os Fornecedores' : companies.find(c => c.id == selectedCompanyId)?.nome} | 
                {filterDate ? ` Período: ${filterDate}` : ' Todo o Período'} |
                Ordenação: Data Antiga → Recente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
              <div className="p-6 bg-slate-900 print:bg-white border border-red-500/20 print:border-black rounded-2xl shadow-lg flex items-center justify-between">
                <div><p className="text-slate-400 print:text-black text-sm mb-1 font-bold">Total Compras (Dívida)</p><h3 className="text-2xl font-bold text-red-400 print:text-black font-mono">{formatMoney(stats.totalIn)}</h3></div>
                <div className="p-3 bg-red-500/10 rounded-full text-red-400 print:hidden"><TrendingDown size={24} /></div>
              </div>
              <div className="p-6 bg-slate-900 print:bg-white border border-green-500/20 print:border-black rounded-2xl shadow-lg flex items-center justify-between">
                <div><p className="text-slate-400 print:text-black text-sm mb-1 font-bold">Total Pagos (Baixas)</p><h3 className="text-2xl font-bold text-green-400 print:text-black font-mono">{formatMoney(stats.totalOut)}</h3></div>
                <div className="p-3 bg-green-500/10 rounded-full text-green-400 print:hidden"><TrendingUp size={24} /></div>
              </div>
              <div className="p-6 bg-slate-900 print:bg-white border border-slate-700 print:border-black rounded-2xl shadow-lg flex items-center justify-between">
                <div><p className="text-slate-400 print:text-black text-sm mb-1 font-bold">Saldo Devedor Atual</p><h3 className={`text-2xl font-bold font-mono ${stats.balance > 0 ? 'text-red-500 print:text-black' : 'text-green-500 print:text-black'}`}>{formatMoney(stats.balance)}</h3></div>
                <div className="p-3 bg-slate-800 rounded-full text-slate-300 print:hidden"><Wallet size={24} /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
              
              <div className="lg:col-span-2 bg-slate-900 print:bg-white border border-slate-800 print:border-none rounded-2xl overflow-hidden shadow-xl print:shadow-none">
                <div className="p-4 border-b border-slate-800 print:border-black bg-slate-900/50 print:bg-white">
                  <h3 className="font-bold text-white print:text-black">Detalhamento das Movimentações</h3>
                </div>

                <div className="max-h-[500px] print:max-h-none overflow-y-auto print:overflow-visible custom-scrollbar">
                  <table className="w-full text-left text-sm print:text-xs border-collapse">
                    <thead className="bg-slate-950 print:bg-white text-slate-400 print:text-black uppercase text-xs sticky top-0 print:static border-b print:border-black">
                      <tr>
                        <th className="p-4 print:p-2 border-b print:border-black">Data</th>
                        <th className="p-4 print:p-2 border-b print:border-black">Empresa</th>
                        <th className="p-4 print:p-2 border-b print:border-black">Tipo</th>
                        <th className="p-4 print:p-2 border-b print:border-black">Classificação / Setor</th>
                        <th className="p-4 print:p-2 border-b print:border-black">NF</th>
                        <th className="p-4 text-right print:p-2 border-b print:border-black">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-300 print:text-black">
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/50 print:hover:bg-transparent break-inside-avoid">
                          <td className="p-4 print:p-2 text-slate-400 print:text-black whitespace-nowrap">
                            {formatDate(t.data_entrada || t.data)}
                          </td>
                          <td className="p-4 print:p-2 font-bold truncate max-w-[120px] print:max-w-none print:whitespace-normal">
                            {t.nome_empresa}
                          </td>
                          <td className="p-4 print:p-2 font-bold">
                            <span className={`print-font-bold ${t.tipo === 'entrada' ? 'text-red-400 print:text-black' : 'text-green-400 print:text-black'}`}>
                              {t.tipo === 'entrada' ? 'COMPRA' : 'PAGO'}
                            </span>
                          </td>
                          
                          <td className="p-4 print:p-2 font-medium text-cyan-300 print:text-black">
                            {getClassificacao(t)}
                          </td>

                          <td className="p-4 print:p-2 text-slate-300 print:text-black">{t.nf || '-'}</td>
                          <td className="p-4 text-right font-mono font-medium print:p-2">
                            {formatMoney(parseFloat(t.valor))}
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr><td colSpan="6" className="p-8 text-center italic text-slate-500 print:text-black">Nenhum dado para este filtro.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center print:hidden">
                <h3 className="font-bold text-white mb-6">Proporção Visual</h3>
                <div className="w-full max-w-[250px]">
                  <Doughnut data={chartData} options={{plugins:{legend:{position:'bottom', labels:{color:'#94a3b8'}}}}} />
                </div>
              </div>

            </div>
          </div>
        )}
    </div>
  );
}