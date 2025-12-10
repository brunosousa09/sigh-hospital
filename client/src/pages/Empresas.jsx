import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Building2, Plus, Trash2, Loader2, FileText, CheckCircle2, 
  XCircle, X, AlertCircle, Pencil, Eye, Printer, Briefcase, AlertTriangle 
} from 'lucide-react';

export default function Empresas() {
  const [companies, setCompanies] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false); 
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); 

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [licitacao, setLicitacao] = useState('false');
  const [emendas, setEmendas] = useState([]);
  const [tempEmenda, setTempEmenda] = useState('');
  const [ramos, setRamos] = useState([]);
  const [tempRamo, setTempRamo] = useState('');

  const maskCNPJ = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substr(0, 18);
  const formatMoney = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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

  const addTag = (e, type) => {
    e.preventDefault();
    if (type === 'emenda' && tempEmenda.trim()) { setEmendas([...emendas, tempEmenda.trim()]); setTempEmenda(''); }
    if (type === 'ramo' && tempRamo.trim()) { setRamos([...ramos, tempRamo.trim()]); setTempRamo(''); }
  };

  const removeTag = (index, type) => {
    if (type === 'emenda') setEmendas(emendas.filter((_, i) => i !== index));
    if (type === 'ramo') setRamos(ramos.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setNome(''); setCnpj(''); setLicitacao('false'); setEmendas([]); setRamos([]);
    setShowModal(true);
  };

  const openEditModal = (company) => {
    setEditingId(company.id);
    setNome(company.nome);
    setCnpj(company.cnpj);
    setLicitacao(company.licitacao ? 'true' : 'false');
    setEmendas(company.emendas || []);
    setRamos(company.tipo || []); 
    setShowModal(true);
  };

  const openDetailsModal = (company) => {
    setSelectedCompany(company);
    setShowDetails(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nome.trim()) { showToast("Razão Social é obrigatória.", "error"); return; }
    if (cnpj.length < 18) { showToast("CNPJ incompleto.", "error"); return; }
    if (ramos.length === 0) { showToast("Adicione um Ramo.", "error"); return; }

    setSaving(true);
    const payload = { nome, cnpj, tipo: ramos, licitacao: licitacao === 'true', emendas };

    try {
      if (editingId) { await api.put(`/empresas/${editingId}/`, payload); showToast("Atualizado!", "success"); } 
      else { await api.post('/empresas/', payload); showToast("Cadastrado!", "success"); }
      setShowModal(false); 
      fetchInitialData();
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.cnpj) showToast("CNPJ já existe.", "error");
      else showToast("Erro ao salvar.", "error");
    } finally { setSaving(false); }
  };

  const handleDeleteClick = (id) => {
    const temDivida = allTransactions.some(t => 
      t.empresa === id && t.tipo === 'entrada' && t.status === 'pendente'
    );

    if (temDivida) {
      showToast("BLOQUEADO: Empresa possui dívidas ativas.", "error");
      return; 
    }

    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/empresas/${itemToDelete}/`);
      showToast("Empresa excluída.", "success");
      fetchInitialData();
    } catch (error) {
      showToast("Erro ao excluir. Possui histórico vinculado.", "error");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const getDetailsTransactions = () => {
    if (!selectedCompany) return [];
    // Ordenação: Antiga -> Recente
    return allTransactions.filter(t => t.empresa === selectedCompany.id)
      .sort((a, b) => new Date(a.data_entrada || a.data_saida || a.data) - new Date(b.data_entrada || b.data_saida || b.data));
  };
  const detailsTransactions = getDetailsTransactions();
  const totalDetails = detailsTransactions.reduce((acc, t) => t.tipo === 'entrada' ? acc + parseFloat(t.valor) : acc - parseFloat(t.valor), 0);

  return (
    <>
      {notification.show && (
        <div className="fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border bg-slate-800 text-white border-slate-700 animate-fade-up no-print">
          {notification.type === 'success' ? <CheckCircle2 size={24} className="text-green-400" /> : <AlertTriangle size={24} className="text-red-400" />}
          <div><h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Atenção'}</h4><p className="text-xs opacity-90">{notification.message}</p></div>
          <button onClick={() => setNotification({...notification, show: false})} className="ml-4 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-up relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Excluir Empresa?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 p-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="absolute inset-0" onClick={() => !saving && setShowModal(false)}></div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-2xl flex flex-col max-h-[90vh] animate-fade-up relative z-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white font-exo">{editingId ? "Editar Empresa" : "Novo Cadastro"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="formCompany" onSubmit={handleSave} className="space-y-6">
                <div className="w-full">
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Razão Social <span className="text-red-500">*</span></label>
                  <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">CNPJ <span className="text-red-500">*</span></label>
                    <input required value={cnpj} onChange={e => setCnpj(maskCNPJ(e.target.value))} maxLength={18} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none transition-colors font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Possui Licitação?</label>
                    <select value={licitacao} onChange={e => setLicitacao(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none cursor-pointer appearance-none">
                      <option value="false">Não</option><option value="true">Sim</option>
                    </select>
                  </div>
                </div>
                <div className="w-full">
                  <label className="text-xs text-blue-400 font-bold uppercase flex items-center gap-2 mb-2"><Briefcase size={14} /> Ramos de Atividade</label>
                  <div className="flex gap-2">
                    <input value={tempRamo} onChange={e => setTempRamo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag(e, 'ramo')} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="Digite e dê Enter" />
                    <button type="button" onClick={e => addTag(e, 'ramo')} className="px-4 bg-slate-800 hover:bg-slate-700 text-blue-500 rounded-xl"><Plus size={20}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 min-h-[24px]">
                    {ramos.map((tag, i) => (<span key={i} className="bg-blue-900/40 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs flex items-center gap-2">{tag} <button type="button" onClick={() => removeTag(i, 'ramo')} className="hover:text-white"><X size={12}/></button></span>))}
                  </div>
                </div>
                <div className="w-full pt-4 border-t border-slate-800">
                  <label className="text-xs text-yellow-500 font-bold uppercase flex items-center gap-2 mb-2"><FileText size={14} /> Emendas Parlamentares</label>
                  <div className="flex gap-2">
                    <input value={tempEmenda} onChange={e => setTempEmenda(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag(e, 'emenda')} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none" placeholder="Digite e dê Enter" />
                    <button type="button" onClick={e => addTag(e, 'emenda')} className="px-4 bg-slate-800 hover:bg-slate-700 text-yellow-500 rounded-xl"><Plus size={20}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 min-h-[24px]">
                    {emendas.map((tag, i) => (<span key={i} className="bg-yellow-900/40 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-xs flex items-center gap-2">{tag} <button type="button" onClick={() => removeTag(i, 'emenda')} className="hover:text-white"><X size={12}/></button></span>))}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancelar</button>
              <button type="submit" form="formCompany" disabled={saving} className="flex-1 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex justify-center items-center gap-2">{saving ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? "Salvar Alterações" : "Confirmar Cadastro")}</button>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedCompany && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in printing-modal-container">
          <div className="absolute inset-0 no-print" onClick={() => setShowDetails(false)}></div>
          
          <div id="modal-extract" className="printable-content bg-slate-900 print:bg-white text-white print:text-black border border-slate-700 print:border-none rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] print:max-h-none print:overflow-visible animate-fade-up relative z-10 print-area">
            
            <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 p-2 bg-slate-800 print:hidden rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors no-print"><X size={24} /></button>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
              
              <div className="text-center mb-8 border-b border-slate-800 print:border-slate-300 pb-6">
                <h2 className="text-2xl font-bold text-cyan-400 print:text-black font-exo mb-1">Hospital José Leite da Silva</h2>
                <p className="text-slate-400 print:text-gray-600 text-sm">Relatório Analítico de Fornecedor</p>
                <p className="text-slate-500 print:text-gray-500 text-xs mt-2">
                    Gerado em: {new Date().toLocaleDateString()} | Ordenação: Data Antiga → Recente
                </p>
              </div>

              <div className="bg-slate-950 print:bg-white p-6 rounded-xl border border-slate-800 print:border-none mb-8 print:p-0 print:mb-4">
                <h3 className="text-xl font-bold text-white print:text-black">{selectedCompany.nome}</h3>
                <div className="flex gap-6 mt-2 text-sm text-slate-400 print:text-black">
                    <p><strong>CNPJ:</strong> {selectedCompany.cnpj}</p>
                    <p><strong>Licitação:</strong> {selectedCompany.licitacao ? 'Sim' : 'Não'}</p>
                </div>
                <div className="mt-4">
                    <p className="text-xs font-bold text-slate-500 print:text-black uppercase mb-1">Ramos de Atividade:</p>
                    <div className="flex flex-wrap gap-1 print:block">
                        {selectedCompany.tipo?.map((t, i) => (
                            <span key={i} className="text-xs bg-slate-800 print:bg-white border border-slate-700 print:border-slate-300 px-2 py-0.5 rounded text-slate-300 print:text-black print:p-0 print:mr-2 print:text-sm">{t}</span>
                        ))}
                    </div>
                </div>
              </div>

              <table className="w-full text-left text-sm print:text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-white text-slate-400 print:text-black uppercase text-xs font-bold border-b border-slate-700 print:border-black">
                    <tr>
                        <th className="p-3 pl-0 print:p-2 border-b print:border-black">Data</th>
                        <th className="p-3 print:p-2 border-b print:border-black">Tipo</th>
                        <th className="p-3 print:p-2 border-b print:border-black">NF</th>
                        <th className="p-3 print:p-2 border-b print:border-black">Descrição</th>
                        <th className="p-3 pr-0 text-right print:p-2 border-b print:border-black">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300 text-slate-300 print:text-black">
                  {detailsTransactions.length > 0 ? detailsTransactions.map((t) => (
                    <tr key={t.id} className="break-inside-avoid">
                        <td className="p-3 pl-0 text-slate-500 print:text-black whitespace-nowrap">
                            {new Date(t.data_entrada || t.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                        </td>
                        <td className="p-3 font-bold print:p-1">
                            <span className={`print-font-bold ${t.tipo === 'entrada' ? 'text-green-500 print:text-black' : 'text-red-500 print:text-black'}`}>
                                {t.tipo.toUpperCase()}
                            </span>
                        </td>
                        <td className="p-3 print:p-1">{t.nf || '-'}</td>
                        <td className="p-3 print:p-1">{t.descricao}</td>
                        <td className="p-3 text-right font-mono font-medium print:p-1">
                            {t.tipo === 'saida' ? '-' : '+'} {formatMoney(parseFloat(t.valor))}
                        </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="p-6 text-center text-slate-500 print:text-black italic">Nenhuma movimentação registrada.</td></tr>
                  )}
                </tbody>
              </table>

              <div className="mt-8 flex justify-end border-t border-slate-800 print:border-black pt-4 break-inside-avoid">
                <div className="text-right">
                    <p className="text-slate-500 print:text-black text-sm mb-1 font-bold">Saldo Atual (A Pagar)</p>
                    <h3 className={`text-3xl font-bold font-exo ${calculateTotalDetails(detailsTransactions) > 0 ? 'text-red-400 print:text-black' : 'text-green-400 print:text-black'}`}>
                        {formatMoney(calculateTotalDetails(detailsTransactions))}
                    </h3>
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-end flex-shrink-0 no-print">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    <Printer size={20} /> Imprimir Relatório
                </button>
            </div>

          </div>
        </div>
      )}

      <div className={`h-full w-full overflow-y-auto p-4 sm:p-8 relative animate-fade-up ${showDetails ? 'no-print' : ''}`}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
              <Building2 className="text-cyan-400 w-8 h-8" /> Gestão de Empresas
            </h2>
            <p className="text-slate-400 text-sm">Base de fornecedores e contratos</p>
          </div>
          <button onClick={openCreateModal} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 hover:shadow-lg hover:shadow-cyan-500/20">
            <Plus size={20} /> Nova Empresa
          </button>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden no-print">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> Carregando...</div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum registro encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold whitespace-nowrap">
                  <tr>
                    <th className="p-4">Empresa</th>
                    <th className="p-4">Ramos de Atividade</th>
                    <th className="p-4 text-center">Licitação</th>
                    <th className="p-4">Emendas</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white">{c.nome}</p>
                        <p className="text-slate-500 font-mono text-xs">{c.cnpj}</p>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(c.tipo) && c.tipo.length > 0 ? c.tipo.map((tag, i) => (<span key={i} className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 truncate">{tag}</span>)) : <span className="text-slate-600 italic">--</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {c.licitacao ? (<span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs font-bold border border-green-500/20"><CheckCircle2 size={12} /> SIM</span>) : (<span className="inline-flex items-center gap-1 bg-slate-700/30 text-slate-400 px-2 py-1 rounded-full text-xs border border-slate-600/20"><XCircle size={12} /> NÃO</span>)}
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(c.emendas) && c.emendas.length > 0 ? c.emendas.map((eme, i) => (<span key={i} className="text-[10px] bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 truncate">{eme}</span>)) : <span className="text-slate-600 italic">--</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openDetailsModal(c)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Eye size={18} /></button>
                          <button onClick={() => openEditModal(c)} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900 rounded-lg transition-colors"><Pencil size={18} /></button>
                          <button onClick={() => handleDeleteClick(c.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}