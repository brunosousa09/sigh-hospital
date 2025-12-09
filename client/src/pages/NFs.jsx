import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, Search, Filter, Calendar, DollarSign, 
  Building2, Edit2, CheckCircle2, AlertCircle, X, 
  Loader2, Save, ArrowUpDown 
} from 'lucide-react';

export default function NFs() {
  const [transactions, setTransactions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false); 

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('data'); 
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transResponse, compResponse] = await Promise.all([
        api.get('/transacoes/'),
        api.get('/empresas/')
      ]);

      // Filtra apenas entradas para evitar duplicidade com as saídas
      const onlyInvoices = transResponse.data.filter(t => t.tipo === 'entrada');
      
      setTransactions(onlyInvoices);
      setCompanies(compResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyDetails = (companyId) => {
    const comp = companies.find(c => c.id === companyId);
    return comp ? { cnpj: comp.cnpj, nome: comp.nome } : { cnpj: '---', nome: 'Desconhecida' };
  };

  const filteredTransactions = transactions
    .filter(t => {
      const comp = getCompanyDetails(t.empresa);
      const searchLower = searchTerm.toLowerCase();
      
      const nf = t.nf ? t.nf.toLowerCase() : '';
      const nome = comp.nome ? comp.nome.toLowerCase() : '';
      const status = t.status ? t.status.toLowerCase() : '';

      return (
        nf.includes(searchLower) ||
        nome.includes(searchLower) ||
        status.includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'valor') return parseFloat(b.valor) - parseFloat(a.valor); 
      
      if (sortBy === 'empresa') {
         const nameA = getCompanyDetails(a.empresa).nome || '';
         const nameB = getCompanyDetails(b.empresa).nome || '';
         return nameA.localeCompare(nameB);
      }

      // --- NOVA LÓGICA DE ORDENAÇÃO POR DATA ---
      if (sortBy === 'data_antiga') {
          // Mais antigas primeiro (Crescente)
          return new Date(a.data_entrada) - new Date(b.data_entrada);
      }

      // Padrão: Mais recentes primeiro (Decrescente)
      return new Date(b.data_entrada) - new Date(a.data_entrada);
    });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nf: item.nf,
      valor: item.valor,
      data_entrada: item.data_entrada,
      data_saida: item.data_saida || '',
      descricao: item.descricao || '',
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (formData.data_saida && formData.data_saida < formData.data_entrada) {
        showToast("Erro: Data de saída anterior à entrada", "error");
        return;
    }

    setIsSaving(true); 

    try {
      const payload = {
        ...editingItem, 
        ...formData,    
        data_saida: formData.data_saida ? formData.data_saida : null 
      };

      await api.put(`/transacoes/${editingItem.id}/`, payload);

      setTransactions(prevTransactions => 
        prevTransactions.map(item => 
          item.id === editingItem.id ? { ...item, ...payload } : item
        )
      );

      showToast("Nota Fiscal atualizada com sucesso!", "success");
      setModalOpen(false);
      
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
          const msg = Object.values(error.response.data).flat()[0] || "Erro ao atualizar.";
          showToast(msg, "error");
      } else {
          showToast("Erro ao atualizar nota.", "error");
      }
    } finally {
      setIsSaving(false); 
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  return (
    <>
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-up ${notification.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/90 border-red-500 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <div>
              <h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Erro'}</h4>
              <p className="text-xs opacity-90 font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => !isSaving && setModalOpen(false)}></div>
          
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 animate-fade-up max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-20">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit2 size={20} className="text-cyan-400"/> Editar Nota Fiscal
                </h3>
                <p className="text-xs text-slate-400 mt-1">{getCompanyDetails(editingItem.empresa).nome}</p>
              </div>
              <button onClick={() => !isSaving && setModalOpen(false)} className="text-slate-400 hover:text-white disabled:opacity-50" disabled={isSaving}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Número NF</label>
                     <input 
                       type="text" 
                       disabled={isSaving}
                       value={formData.nf} 
                       onChange={e => setFormData({...formData, nf: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none disabled:opacity-50"
                     />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Valor (R$)</label>
                     <input 
                       type="number" step="0.01"
                       disabled={isSaving}
                       value={formData.valor} 
                       onChange={e => setFormData({...formData, valor: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none disabled:opacity-50"
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                   <div>
                     <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Data Entrada</label>
                     <input 
                       type="date" 
                       disabled={isSaving}
                       value={formData.data_entrada} 
                       onChange={e => setFormData({...formData, data_entrada: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-cyan-400 outline-none disabled:opacity-50"
                     />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Data Baixa</label>
                     <input 
                       type="date" 
                       disabled={formData.status === 'pendente' || isSaving}
                       value={formData.data_saida} 
                       onChange={e => setFormData({...formData, data_saida: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-green-400 outline-none disabled:opacity-50"
                     />
                   </div>
                </div>

                <div>
                   <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Descrição / Observação</label>
                   <textarea 
                     rows="3"
                     disabled={isSaving}
                     value={formData.descricao} 
                     onChange={e => setFormData({...formData, descricao: e.target.value})}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-400 outline-none resize-none disabled:opacity-50"
                   />
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/50 rounded-b-2xl sticky bottom-0 z-20">
                <button type="button" onClick={() => setModalOpen(false)} disabled={isSaving} className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center">
                  {isSaving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="h-full w-full overflow-y-auto p-4 sm:p-8 relative animate-fade-up">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
              <FileText className="text-cyan-400 w-8 h-8" /> Gestão de NFs
            </h2>
            <p className="text-slate-400 text-sm">Histórico completo de notas fiscais</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por NF ou Empresa..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-400 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><ArrowUpDown size={16}/></div>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)} 
                className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-400 outline-none appearance-none cursor-pointer"
              >
                <option value="data">Data (Recentes)</option>
                {/* --- NOVA OPÇÃO AQUI --- */}
                <option value="data_antiga">Data (Antigas)</option>
                <option value="empresa">Empresa (A-Z)</option>
                <option value="valor">Valor (Maior)</option>
              </select>
            </div>
          </div>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center items-center text-slate-500 gap-2"><Loader2 className="animate-spin"/> Carregando dados...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold whitespace-nowrap">
                  <tr>
                    <th className="p-4">Data Entrada</th>
                    <th className="p-4">Empresa / CNPJ</th>
                    <th className="p-4">Nº NF</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredTransactions.map((t) => {
                    const comp = getCompanyDetails(t.empresa);
                    const isPaid = t.status === 'pago';
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-500"/>
                            {new Date(t.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </div>
                          {t.data_saida && (
                             <div className="text-[10px] text-green-500/70 mt-1 ml-6">
                               Baixa: {new Date(t.data_saida).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                             </div>
                          )}
                        </td>
                        
                        <td className="p-4">
                          <div className="font-bold text-white">{comp.nome}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{comp.cnpj}</div>
                        </td>
                        
                        <td className="p-4 font-mono text-cyan-400">{t.nf || 'S/N'}</td>
                        
                        <td className="p-4 font-bold text-slate-200">
                          {parseFloat(t.valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </td>
                        
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${
                            isPaid 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleEdit(t)}
                            className="p-2 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg transition-colors text-slate-400"
                            title="Editar Nota"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredTransactions.length === 0 && (
                 <div className="p-8 text-center text-slate-500 text-sm">
                    Nenhuma nota encontrada com os filtros atuais.
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}