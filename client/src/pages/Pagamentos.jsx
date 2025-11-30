import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { FileText, Loader2, Wallet, Search } from 'lucide-react';

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const fetchPagamentos = async () => {
    try {
      const response = await api.get('/transacoes/');
      const filtered = response.data.filter(t => t.tipo === 'saida');
      filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
      setPagamentos(filtered);
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

  const filteredList = pagamentos.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const nomeEmpresa = item.nome_empresa ? item.nome_empresa.toLowerCase() : '';
    const numeroNF = item.nf ? item.nf.toLowerCase() : '';
    return nomeEmpresa.includes(searchLower) || numeroNF.includes(searchLower);
  });

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 w-full overflow-y-auto p-4 sm:p-8 relative">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-up">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
              <FileText className="text-green-400 w-8 h-8" /> Histórico de Pagamentos
            </h2>
            <p className="text-slate-400 text-sm">Registro de baixas realizadas</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por Empresa ou NF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-green-400 outline-none transition-colors"
            />
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl animate-fade-up overflow-hidden" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" /> Carregando histórico...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {searchTerm ? `Nenhum pagamento encontrado para "${searchTerm}"` : "Nenhum pagamento registrado ainda."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold whitespace-nowrap">
                  <tr>
                    <th className="p-4">Data Baixa</th>
                    <th className="p-4">Favorecido (Empresa)</th>
                    <th className="p-4">NF Original</th>
                    <th className="p-4">Detalhes</th>
                    <th className="p-4">Origem Recurso</th>
                    <th className="p-4 text-right">Valor Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-slate-400 font-mono">
                        {formatDate(item.data)}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {item.nome_empresa || "Empresa ID " + item.empresa}
                      </td>
                      <td className="p-4 text-slate-300">{item.nf}</td>
                      <td className="p-4 text-slate-400 max-w-[200px] truncate" title={item.descricao}>
                        {item.descricao}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs">
                          <Wallet size={12} className={item.emenda_origem && item.emenda_origem !== "Recurso Próprio" ? "text-yellow-500" : "text-slate-500"} />
                          <span className={item.emenda_origem && item.emenda_origem !== "Recurso Próprio" ? "text-yellow-100" : "text-slate-500"}>
                            {item.emenda_origem || "Não informado"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-green-400 text-base">
                        {formatMoney(parseFloat(item.valor))}
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