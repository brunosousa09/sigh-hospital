import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle, 
  Info, Megaphone, X 
} from 'lucide-react';

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState('pendencia');
  const [alvo, setAlvo] = useState('todos');

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const fetchNotificacoes = async () => {
    try {
      const response = await api.get('/notificacoes/');
      setNotificacoes(response.data); 
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remover este aviso?")) return;
    try {
      await api.delete(`/notificacoes/${id}/`);
      setNotificacoes(notificacoes.filter(n => n.id !== id));
      showToast("Notificação removida", "success");
    } catch(e) { 
        showToast("Erro ao excluir", "error"); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!titulo || !mensagem) {
        showToast("Preencha título e mensagem", "error");
        return;
    }

    setSaving(true);
    try {
      const payload = { 
          titulo: titulo, 
          mensagem: mensagem, 
          tipo: tipo, 
          alvo: alvo, 
          ativo: true 
      };
      
      const res = await api.post('/notificacoes/', payload);
      
      setNotificacoes([res.data, ...notificacoes]);
      
      setShowModal(false);
      setTitulo(''); setMensagem('');
      showToast("Notificação publicada!", "success");

    } catch(error) {
      console.error("ERRO AO SALVAR:", error.response?.data); 
      
      const msgErro = error.response?.data?.detail || "Erro interno no servidor (500). Verifique o terminal do backend.";
      showToast(msgErro, "error");
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'aviso': return <AlertTriangle className="text-red-500" />;
      case 'update': return <Megaphone className="text-green-500" />;
      default: return <Info className="text-yellow-500" />;
    }
  };

  return (
    <>
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-up ${notification.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <div><h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Erro'}</h4><p className="text-xs opacity-90">{notification.message}</p></div>
        </div>
      )}

      <div className="h-full w-full overflow-y-auto p-4 sm:p-8 relative animate-fade-up">
        <header className="flex justify-between items-center mb-8">
            <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-exo text-white flex items-center gap-2">
                <Bell className="text-purple-400 w-8 h-8" /> Central de Notificações
            </h2>
            <p className="text-slate-400 text-sm">Gerencie avisos para os usuários do sistema</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20">
            <Plus size={20} /> Nova Notificação
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <p className="text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin"/> Carregando...</p> : notificacoes.map(notif => (
            <div key={notif.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative group hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                    <div className="p-3 bg-slate-800 rounded-xl">{getIcon(notif.tipo)}</div>
                    <div>
                    <h4 className="font-bold text-white">{notif.titulo}</h4>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Alvo: {notif.alvo}</span>
                    </div>
                </div>
                <button onClick={() => handleDelete(notif.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                </div>
                <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-800 mb-2">
                {notif.mensagem}
                </p>
                <div className="flex justify-between items-center mt-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${notif.ativo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {notif.ativo ? 'ATIVO' : 'INATIVO'}
                </span>
                <span className="text-[10px] text-slate-500">{new Date(notif.criado_em || Date.now()).toLocaleDateString()}</span>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Modal Fixo */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Megaphone className="text-purple-400"/> Criar Aviso</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Título</label>
                <input required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-purple-400 outline-none" placeholder="Ex: Manutenção Programada"/>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Mensagem</label>
                <textarea required rows="3" value={mensagem} onChange={e => setMensagem(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-purple-400 outline-none resize-none" placeholder="Digite o aviso..."/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-purple-400 outline-none">
                    <option value="pendencia">🟡 Alerta</option>
                    <option value="aviso">🔴 Crítico</option>
                    <option value="update">🟢 Novidade</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Público Alvo</label>
                  <select value={alvo} onChange={e => setAlvo(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-purple-400 outline-none">
                    <option value="todos">Todos</option>
                    <option value="gestor">Gestores</option>
                    <option value="view">Visitantes</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2">
                {saving ? <Loader2 className="animate-spin"/> : "Publicar Notificação"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}