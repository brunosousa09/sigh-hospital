import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Clock, AlertCircle, Loader2, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pendencias() {
  const [pendencias, setPendencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendencias();
  }, []);

  const fetchPendencias = async () => {
    try {
      const response = await api.get('/transacoes/');
      const filtered = response.data.filter(t => t.tipo === 'entrada' && t.status === 'pendente');
      setPendencias(filtered);
    } catch (error) {
      console.error("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredList = pendencias.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const nomeEmpresa = item.nome_empresa ? item.nome_empresa.toLowerCase() : '';
    const numeroNF = item.nf ? item.nf.toLowerCase() : '';
    
    return nomeEmpresa.includes(searchLower) || numeroNF.includes(searchLower);
  });

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 w-full overflow-y-auto p-4 sm:p-8 relative">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4 animate-fade-up">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
              <Clock className="text-yellow-500 w-8 h-8" /> Pendências Financeiras
            </h2>
            <p className="text-slate-400 text-sm">Notas fiscais aguardando pagamento</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por Empresa ou NF..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            <button 
              onClick={() => navigate('/saida')}
              className="flex items-center justify-center gap-2 bg-slate-800 text-yellow-500 border border-yellow-500/20 px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 hover:text-slate-900 transition-all active:scale-95 whitespace-nowrap"
            >
              Ir para Pagamentos <ArrowRight size={18} />
            </button>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl animate-fade-up overflow-hidden" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" /> Atualizando...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
              {searchTerm ? (
                <p>Nenhum resultado para "{searchTerm}"</p>
              ) : (
                <>
                  <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
                  <p>Tudo em dia! Nenhuma pendência encontrada.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold whitespace-nowrap">
                  <tr>
                    <th className="p-4">Data Entrada</th>
                    <th className="p-4">Fornecedor</th>
                    <th className="p-4">Nota Fiscal</th>
                    <th className="p-4">Classificação</th>
                    <th className="p-4 text-right">Valor em Aberto</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-slate-400 font-mono">
                        {formatDate(item.data)}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {item.nome_empresa || "Carregando..."}
                      </td>
                      <td className="p-4 text-slate-300">{item.nf}</td>
                      <td className="p-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700 capitalize">
                          {item.tipo_material || 'Geral'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-yellow-500 text-base">
                        {formatMoney(parseFloat(item.valor))}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                          <AlertCircle size={12} /> PENDENTE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}