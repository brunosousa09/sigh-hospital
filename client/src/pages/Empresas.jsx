import React, { useState, useEffect } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx'; // Biblioteca para Excel
import { 
  Building2, Plus, Trash2, Loader2, FileText, CheckCircle2, 
  XCircle, X, AlertTriangle, Pencil, Eye, Search, FileSpreadsheet,
  MoreVertical, ShieldCheck, ShieldAlert
} from 'lucide-react';

export default function Empresas() {
  const [companies, setCompanies] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Estados de Interface
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Estados de Edição/Criação
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); 

  // Campos do Formulário
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
      showToast("Erro ao conectar com servidor", "error");
    } finally { 
      setLoading(false); 
    }
  };

  const exportToExcel = (company) => {
    const companyTrans = allTransactions.filter(t => t.empresa === company.id);
    
    const dataToExport = companyTrans.map(t => ({
      Data: new Date(t.data_entrada || t.data || t.data_saida).toLocaleDateString('pt-BR'),
      Tipo: t.tipo.toUpperCase(),
      Categoria: t.tipo_material || 'Diversos',
      'Descrição/NF': t.nf || t.descricao || '-',
      Valor: parseFloat(t.valor),
      Status: t.status || 'Concluído'
    }));

    const total = dataToExport.reduce((acc, curr) => curr.Tipo === 'ENTRADA' ? acc - curr.Valor : acc + curr.Valor, 0); // Exemplo simples de saldo
    
    const wb = XLSX.utils.book_new();
    
    const infoData = [
      ["Razão Social", company.nome],
      ["CNPJ", company.cnpj],
      ["Licitação", company.licitacao ? "Sim" : "Não"],
      ["Ramos", company.tipo?.join(", ") || "-"],
      ["Emendas", company.emendas?.join(", ") || "-"]
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet([["DADOS CADASTRAIS"], ...infoData]);
    XLSX.utils.book_append_sheet(wb, wsInfo, "Cadastro");

    if(dataToExport.length > 0) {
        const wsTrans = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, wsTrans, "Extrato Financeiro");
    } else {
        const wsTrans = XLSX.utils.aoa_to_sheet([["Nenhuma movimentação registrada"]]);
        XLSX.utils.book_append_sheet(wb, wsTrans, "Extrato Financeiro");
    }

    XLSX.writeFile(wb, `Relatorio_${company.nome.replace(/ /g, '_')}.xlsx`);
    showToast("Planilha gerada com sucesso!");
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
      if (editingId) { await api.put(`/empresas/${editingId}/`, payload); showToast("Atualizado com sucesso!", "success"); } 
      else { await api.post('/empresas/', payload); showToast("Empresa cadastrada!", "success"); }
      setShowModal(false); 
      fetchInitialData();
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.cnpj) showToast("Este CNPJ já está cadastrado.", "error");
      else showToast("Erro ao salvar dados.", "error");
    } finally { setSaving(false); }
  };

  const handleDeleteClick = (id) => {
    const temDivida = allTransactions.some(t => 
      t.empresa === id && t.tipo === 'entrada' && t.status === 'pendente'
    );

    if (temDivida) {
      showToast("Ação Bloqueada: Empresa possui pendências financeiras.", "error");
      return; 
    }

    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/empresas/${itemToDelete}/`);
      showToast("Empresa removida da base.", "success");
      fetchInitialData();
    } catch (error) {
      showToast("Erro ao excluir. Verifique vínculos históricos.", "error");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj.includes(searchTerm)
  );

  const getDetailsTransactions = () => {
    if (!selectedCompany) return [];
    return allTransactions.filter(t => t.empresa === selectedCompany.id)
      .sort((a, b) => new Date(a.data_entrada || a.data_saida || a.data) - new Date(b.data_entrada || b.data_saida || b.data));
  };
  const detailsTransactions = getDetailsTransactions();
  const totalDetails = detailsTransactions.reduce((acc, t) => t.tipo === 'entrada' ? acc + parseFloat(t.valor) : acc - parseFloat(t.valor), 0);

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-8 relative animate-fade-up custom-scrollbar">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold font-exo text-white flex items-center gap-3">
            <Building2 className="text-cyan-400 w-9 h-9" /> Gestão de Fornecedores
          </h2>
          <p className="text-slate-400 mt-1">Gerencie contratos, licitações e histórico financeiro.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-64">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
             </div>
             <input 
               type="text" 
               placeholder="Buscar empresa ou CNPJ..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-cyan-400 outline-none transition-all focus:ring-1 focus:ring-cyan-400/50 placeholder-slate-500"
             />
          </div>

          <button onClick={openCreateModal} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all active:scale-95">
            <Plus size={20} /> Nova Empresa
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Building2 size={24}/></div>
            <div><p className="text-slate-400 text-xs font-bold uppercase">Total Cadastrado</p><p className="text-2xl font-bold text-white">{companies.length}</p></div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><ShieldCheck size={24}/></div>
            <div><p className="text-slate-400 text-xs font-bold uppercase">Com Licitação</p><p className="text-2xl font-bold text-white">{companies.filter(c => c.licitacao).length}</p></div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400"><FileText size={24}/></div>
            <div><p className="text-slate-400 text-xs font-bold uppercase">Emendas Ativas</p><p className="text-2xl font-bold text-white">{companies.reduce((acc, c) => acc + (c.emendas ? c.emendas.length : 0), 0)}</p></div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
           <div className="p-12 flex flex-col items-center justify-center text-slate-500">
               <Loader2 className="animate-spin mb-4 text-cyan-400" size={40} />
               <p>Carregando base de dados...</p>
           </div>
        ) : filteredCompanies.length === 0 ? (
           <div className="p-12 text-center text-slate-500">
               <Building2 size={48} className="mx-auto mb-4 opacity-20" />
               <p>Nenhuma empresa encontrada.</p>
           </div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold tracking-wider">
                 <tr>
                   <th className="p-5 border-b border-slate-800">Empresa / CNPJ</th>
                   <th className="p-5 border-b border-slate-800">Ramo de Atividade</th>
                   <th className="p-5 border-b border-slate-800 text-center">Licitação</th>
                   <th className="p-5 border-b border-slate-800 text-right">Ações</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800 text-sm text-white">
                 {filteredCompanies.map(c => (
                   <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                     <td className="p-5">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-600 shadow-inner">
                            {c.nome.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="font-bold text-base group-hover:text-cyan-400 transition-colors">{c.nome}</p>
                            <p className="text-xs text-slate-500 font-mono tracking-wide mt-0.5">{c.cnpj}</p>
                         </div>
                       </div>
                     </td>
                     <td className="p-5">
                        <div className="flex flex-wrap gap-2">
                           {c.tipo?.slice(0, 2).map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">{t}</span>
                           ))}
                           {c.tipo?.length > 2 && <span className="text-xs text-slate-500 self-center">+{c.tipo.length - 2}</span>}
                        </div>
                     </td>
                     <td className="p-5 text-center">
                       {c.licitacao ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-bold">
                            <ShieldCheck size={14} /> SIM
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-500 text-xs font-bold">
                            <ShieldAlert size={14} /> NÃO
                         </div>
                       )}
                     </td>
                     <td className="p-5">
                       <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                         
                         <button 
                            onClick={() => exportToExcel(c)} 
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors tooltip-trigger" 
                            title="Baixar Planilha Excel"
                         >
                            <FileSpreadsheet size={18}/>
                         </button>

                         <button onClick={() => openDetailsModal(c)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Ver Extrato"><Eye size={18}/></button>
                         <button onClick={() => openEditModal(c)} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Editar"><Pencil size={18}/></button>
                         <button onClick={() => handleDeleteClick(c.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir"><Trash2 size={18}/></button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {notification.show && (
        <div className="fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border bg-slate-800 text-white border-slate-700 animate-fade-up">
          {notification.type === 'success' ? <CheckCircle2 size={24} className="text-green-400" /> : <AlertTriangle size={24} className="text-red-400" />}
          <div><h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Atenção'}</h4><p className="text-xs opacity-90">{notification.message}</p></div>
          <button onClick={() => setNotification({...notification, show: false})} className="ml-4 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {showDetails && selectedCompany && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowDetails(false)}></div>
          
          <div id="print-area" className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-fade-up relative z-10">
            <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors no-print"><X size={24} /></button>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-white/10 print:border-black pb-6 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 print:text-black font-bold uppercase tracking-wider mb-1">Extrato do Fornecedor</p>
                    <h2 className="text-3xl font-bold text-cyan-400 print:text-black">{selectedCompany.nome}</h2>
                    <p className="text-slate-400 print:text-black font-mono mt-1">{selectedCompany.cnpj}</p>
                  </div>
                  <div className="text-right">
                    <button onClick={() => exportToExcel(selectedCompany)} className="no-print text-sm flex items-center gap-2 text-green-400 hover:text-green-300 font-bold mb-2 ml-auto"><FileSpreadsheet size={16}/> Baixar Excel</button>
                    <div className="flex flex-wrap gap-2 justify-end">{selectedCompany.tipo?.map((t,i)=><span key={i} className="text-xs bg-slate-800 print:bg-transparent print:border print:border-black px-2 py-1 rounded text-white print:text-black uppercase font-bold">{t}</span>)}</div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm border-collapse">
                   <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-black uppercase text-xs border-b print:border-black">
                     <tr><th className="p-3 border-b print:border-black">Data</th><th className="p-3 border-b print:border-black">Tipo</th><th className="p-3 border-b print:border-black">Ref/NF</th><th className="p-3 text-right border-b print:border-black">Valor</th></tr>
                   </thead>
                   <tbody className="text-slate-300 print:text-black">
                     {detailsTransactions.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">Nenhuma movimentação registrada.</td></tr>
                     ) : (
                        detailsTransactions.map(t => (
                          <tr key={t.id} className="border-b border-slate-800 print:border-gray-300 break-inside-avoid hover:bg-slate-800/30 print:hover:bg-transparent">
                            <td className="p-3 whitespace-nowrap">{new Date(t.data_entrada || t.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                            <td className="p-3 font-bold">
                               <span className={t.tipo === 'entrada' ? 'text-red-400 print:text-black' : 'text-green-400 print:text-black'}>{t.tipo.toUpperCase()}</span>
                            </td>
                            <td className="p-3 text-slate-400 print:text-black">{t.nf || t.descricao}</td>
                            <td className="p-3 text-right font-mono font-medium">{formatMoney(parseFloat(t.valor))}</td>
                          </tr>
                        ))
                     )}
                   </tbody>
                 </table>
               </div>
               
               <div className="mt-8 flex justify-end">
                 <div className="bg-slate-950 print:bg-transparent p-6 rounded-xl border border-slate-800 print:border-black min-w-[250px] text-right">
                    <p className="text-sm font-bold text-slate-500 print:text-black uppercase mb-1">Saldo Atual</p>
                    <h3 className={`text-3xl font-bold font-mono ${totalDetails > 0 ? 'text-red-400' : 'text-green-400'} print:text-black`}>{formatMoney(totalDetails)}</h3>
                 </div>
               </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-between items-center no-print">
               <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-white font-medium">Fechar</button>
               <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg">
                   <Printer size={20} /> Imprimir PDF
               </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => !saving && setShowModal(false)}></div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-2xl flex flex-col max-h-[90vh] animate-fade-up relative z-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white font-exo flex items-center gap-2">
                 {editingId ? <Pencil size={20} className="text-yellow-500"/> : <Plus size={20} className="text-cyan-400"/>}
                 {editingId ? "Editar Empresa" : "Novo Cadastro"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-900/50">
              <form id="formCompany" onSubmit={handleSave} className="space-y-6">
                
                <div className="space-y-4">
                    <h4 className="text-xs text-cyan-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">Dados Principais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Razão Social <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 text-slate-500" size={18}/>
                                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 p-3 text-white focus:border-cyan-400 outline-none transition-all focus:ring-1 focus:ring-cyan-400/50" placeholder="Ex: Hospital Ltda" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">CNPJ <span className="text-red-500">*</span></label>
                            <input required value={cnpj} onChange={e => setCnpj(maskCNPJ(e.target.value))} maxLength={18} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none transition-all font-mono text-center" placeholder="00.000.000/0000-00" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs text-cyan-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">Classificação e Contrato</h4>
                   
                   <div>
                      <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Possui Licitação Ativa?</label>
                      <div className="flex gap-4">
                          <label className={`flex-1 cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${licitacao === 'true' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-slate-950 border-slate-700 text-slate-400 opacity-50 hover:opacity-100'}`}>
                             <input type="radio" name="licitacao" value="true" checked={licitacao === 'true'} onChange={e => setLicitacao(e.target.value)} className="hidden"/>
                             <ShieldCheck size={18}/> SIM, POSSUI
                          </label>
                          <label className={`flex-1 cursor-pointer p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${licitacao === 'false' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 opacity-50 hover:opacity-100'}`}>
                             <input type="radio" name="licitacao" value="false" checked={licitacao === 'false'} onChange={e => setLicitacao(e.target.value)} className="hidden"/>
                             <ShieldAlert size={18}/> NÃO POSSUI
                          </label>
                      </div>
                   </div>

                   <div>
                      <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Ramos de Atividade <span className="text-red-500">*</span></label>
                      <div className="flex gap-2 mb-3">
                        <input value={tempRamo} onChange={e => setTempRamo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag(e, 'ramo')} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-400 outline-none" placeholder="Digite e pressione Enter (ex: Medicamentos)" />
                        <button type="button" onClick={e => addTag(e, 'ramo')} className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 rounded-xl transition-colors"><Plus size={20}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[30px] p-2 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
                        {ramos.length === 0 && <span className="text-xs text-slate-600 italic p-1">Nenhum ramo adicionado.</span>}
                        {ramos.map((tag, i) => (<span key={i} className="bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs flex items-center gap-2 animate-fade-in">{tag} <button type="button" onClick={() => removeTag(i, 'ramo')} className="hover:text-white"><X size={12}/></button></span>))}
                      </div>
                   </div>

                   <div>
                      <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Emendas Parlamentares (Opcional)</label>
                      <div className="flex gap-2 mb-3">
                        <input value={tempEmenda} onChange={e => setTempEmenda(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag(e, 'emenda')} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none" placeholder="Digite e pressione Enter" />
                        <button type="button" onClick={e => addTag(e, 'emenda')} className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-yellow-500 rounded-xl transition-colors"><Plus size={20}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[30px] p-2 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
                        {emendas.map((tag, i) => (<span key={i} className="bg-yellow-900/30 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-xs flex items-center gap-2 animate-fade-in">{tag} <button type="button" onClick={() => removeTag(i, 'emenda')} className="hover:text-white"><X size={12}/></button></span>))}
                      </div>
                   </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium">Cancelar</button>
              <button type="submit" form="formCompany" disabled={saving} className="flex-1 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {saving ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? "Salvar Alterações" : "Cadastrar Empresa")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-up relative z-10">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500"/>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Excluir Empresa?</h3>
            <p className="text-slate-400 text-sm mb-6">Esta ação removerá o cadastro permanentemente. Certifique-se de que não há dados importantes vinculados.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 p-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}