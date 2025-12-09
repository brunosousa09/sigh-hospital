import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, Building2, FileText, DollarSign, CheckCircle2, AlertTriangle, X, Loader2, Package, MapPin, Calendar } from 'lucide-react';

export default function Entrada() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const hoje = new Date().toISOString().split('T')[0];
  
  const [companyId, setCompanyId] = useState('');
  const [nf, setNf] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [dataEntrada, setDataEntrada] = useState(hoje);

  const [tipoMaterial, setTipoMaterial] = useState('medicamentos');
  const [destino, setDestino] = useState('hospital');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/empresas/');
      setCompanies(response.data);
    } catch (error) { console.error("Erro ao carregar empresas"); }
  };

  const handleMoneyChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = (Number(value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setValor(value);
  };

  const parseCurrency = (str) => {
    return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  };

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (dataEntrada > hoje) {
        showToast("A data de entrada não pode ser futura.", "error");
        return;
    }

    if (!companyId || !valor || !nf || !dataEntrada) { 
      showToast("Preencha os campos obrigatórios (*).", "error"); 
      return; 
    }

    setLoading(true);
    try {
      const payload = {
        empresa: companyId,
        tipo: 'entrada',
        status: 'pendente',
        nf,
        descricao: descricao || "Sem descrição", 
        valor: parseCurrency(valor),
        tipo_material: tipoMaterial,
        destino_entrada: destino,
        data_entrada: dataEntrada 
      };

      await api.post('/transacoes/', payload);
      showToast("Entrada registrada com sucesso!", "success");
      
      setCompanyId(''); setNf(''); setValor(''); setDescricao(''); 
      setTipoMaterial('medicamentos'); setDestino('hospital');
      setDataEntrada(hoje); 
    } catch (error) {
      showToast("Erro ao registrar entrada.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-up ${notification.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <div><h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Erro'}</h4><p className="text-xs opacity-90">{notification.message}</p></div>
          <button onClick={() => setNotification({...notification, show: false})} className="ml-4 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      <div className="h-full w-full overflow-y-auto p-4 sm:p-8 relative animate-fade-up">
        <header className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
            <Download className="text-green-400 w-8 h-8" /> Registrar Entrada
          </h2>
          <p className="text-slate-400 text-sm">Classificação e destino do material recebido</p>
        </header>

        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="w-full">
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><Building2 size={14} /> Fornecedor <span className="text-red-500">*</span></label>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none cursor-pointer appearance-none">
                <option value="">Selecione a Empresa...</option>
                {companies.map(c => (<option key={c.id} value={c.id}>{c.nome} - {c.cnpj}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><FileText size={14} /> Número da NF <span className="text-red-500">*</span></label>
                <input type="text" value={nf} onChange={(e) => setNf(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none placeholder-slate-600" placeholder="Ex: 000.123" />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><Calendar size={14} /> Data Entrada <span className="text-red-500">*</span></label>
                <input 
                    type="date" 
                    max={hoje} 
                    value={dataEntrada} 
                    onChange={(e) => setDataEntrada(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><DollarSign size={14} /> Valor Total <span className="text-red-500">*</span></label>
                <input type="text" value={valor} onChange={handleMoneyChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none font-mono text-lg" placeholder="R$ 0,00" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-green-400 text-sm font-bold uppercase mb-4 flex items-center gap-2"><Package size={16}/> Classificação do Material</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2">Tipo do Item</label>
                  <select value={tipoMaterial} onChange={(e) => setTipoMaterial(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none cursor-pointer appearance-none">
                    <option value="laboratorio">Laboratório</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="insumo">Insumo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><MapPin size={14} /> Destino Inicial</label>
                  <select value={destino} onChange={(e) => setDestino(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none cursor-pointer appearance-none">
                    <option value="hospital">Hospital</option>
                    <option value="atencao_primaria">Atenção Primária</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Descrição Detalhada / Lote (Opcional)</label>
              <textarea rows="3" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-green-400 outline-none resize-none" placeholder="Digite se houver observações..."></textarea>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg hover:shadow-green-500/20 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.99] flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : "Confirmar Entrada"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}