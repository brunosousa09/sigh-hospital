import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Upload, Building2, DollarSign, CheckCircle2, AlertTriangle, X, Loader2, ArrowRight, Wallet } from 'lucide-react';

export default function Saida() {
  const [companies, setCompanies] = useState([]);
  const [pendingNotes, setPendingNotes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [companyEmendas, setCompanyEmendas] = useState([]); 

  const [companyId, setCompanyId] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [valor, setValor] = useState('');
  
  
  const [setor, setSetor] = useState('Hospital'); 
  const [motivo, setMotivo] = useState('');
  const [emendaSelecionada, setEmendaSelecionada] = useState('');

  useEffect(() => {
    api.get('/empresas/').then(res => setCompanies(res.data));
  }, []);

  useEffect(() => {
    setPendingNotes([]); setSelectedNoteId(''); setValor(''); setEmendaSelecionada(''); setCompanyEmendas([]);
    
    if (companyId) {
      api.get('/transacoes/').then(res => {
        const pendentes = res.data.filter(t => t.empresa === parseInt(companyId) && t.tipo === 'entrada' && t.status === 'pendente');
        setPendingNotes(pendentes);
      });

      const selectedComp = companies.find(c => c.id === parseInt(companyId));
      if (selectedComp && selectedComp.emendas) {
        setCompanyEmendas(selectedComp.emendas);
      }
    }
  }, [companyId, companies]);

  const handleNoteSelect = (e) => {
    const noteId = e.target.value;
    setSelectedNoteId(noteId);
    if (noteId) {
      const note = pendingNotes.find(n => n.id === parseInt(noteId));
      if (note) setValor(parseFloat(note.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else {
      setValor('');
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const parseCurrency = (str) => { if (!str) return 0; return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !selectedNoteId || !motivo) { showToast("Preencha todos os campos.", "error"); return; }

    setLoading(true);
    try {
      const valorFloat = parseCurrency(valor);
      const noteOriginal = pendingNotes.find(n => n.id === parseInt(selectedNoteId));

      const payloadSaida = {
        empresa: companyId,
        tipo: 'saida',
        status: 'pago',
        nf: noteOriginal.nf,
        descricao: `[${setor}] ${motivo}`, 
        valor: valorFloat,
        emenda_origem: emendaSelecionada || "Recurso Próprio"
      };
      await api.post('/transacoes/', payloadSaida);

      const payloadUpdate = { ...noteOriginal, empresa: noteOriginal.empresa, status: 'pago' };
      await api.put(`/transacoes/${selectedNoteId}/`, payloadUpdate);

      showToast("Baixa realizada e nota quitada!", "success");
      setCompanyId(''); setMotivo(''); setValor('');
    } catch (error) {
      console.error(error);
      showToast("Erro ao processar baixa.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden relative">
      <Sidebar />

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-up ${notification.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <div><h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Erro'}</h4><p className="text-xs opacity-90">{notification.message}</p></div>
          <button onClick={() => setNotification({...notification, show: false})} className="ml-4 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      <main className="flex-1 w-full overflow-y-auto p-4 sm:p-8 relative">
        <header className="mb-8 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2"><Upload className="text-red-400 w-8 h-8" /> Realizar Baixa (Pagamento)</h2>
          <p className="text-slate-400 text-sm">Selecione uma nota pendente para quitar</p>
        </header>

        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="w-full">
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><Building2 size={14} /> Selecionar Fornecedor</label>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-red-400 outline-none cursor-pointer appearance-none">
                <option value="">Selecione...</option>
                {companies.map(c => (<option key={c.id} value={c.id}>{c.nome}</option>))}
              </select>
            </div>

            <div className="w-full pt-2">
              <label className="text-xs text-yellow-500 font-bold uppercase mb-1 flex items-center gap-2"><Wallet size={14} /> Origem do Recurso (Emenda Parlamentar)</label>
              <select value={emendaSelecionada} onChange={(e) => setEmendaSelecionada(e.target.value)} disabled={!companyId} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-yellow-500 outline-none cursor-pointer appearance-none disabled:opacity-50">
                <option value="">Recurso Próprio / Ordinário</option>
                {companyEmendas.map((emenda, index) => (<option key={index} value={emenda}>{emenda}</option>))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Selecione a emenda vinculada a esta empresa, se houver.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><ArrowRight size={14} className="text-yellow-500" /> Nota Fiscal Pendente</label>
                <select value={selectedNoteId} onChange={handleNoteSelect} disabled={!companyId || pendingNotes.length === 0} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-red-400 outline-none cursor-pointer appearance-none disabled:opacity-50">
                  <option value="">{!companyId ? "Aguardando Empresa..." : pendingNotes.length === 0 ? "Nenhuma pendência" : "Selecione a Nota..."}</option>
                  {pendingNotes.map(n => (<option key={n.id} value={n.id}>NF: {n.nf} - {parseFloat(n.valor).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><DollarSign size={14} /> Valor a Pagar</label>
                <input type="text" value={valor} readOnly className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-400 outline-none font-mono text-lg cursor-not-allowed" placeholder="Automático..." />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Setor de Destino</label>
                <select 
                  value={setor} 
                  onChange={e => setSetor(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-red-400 outline-none appearance-none cursor-pointer"
                >
                  <option>Hospital</option>
                  <option>Atenção Primária</option>
                  <option>Farmácia</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Motivo / Observação</label>
                <input value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-red-400 outline-none transition-colors" placeholder="Ex: Pagamento referente mês 10..." />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button type="submit" disabled={loading || !selectedNoteId} className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:shadow-lg hover:shadow-red-500/20 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.99] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="animate-spin" /> : "Confirmar Baixa e Quitar Nota"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}