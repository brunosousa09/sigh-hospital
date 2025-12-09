import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserPlus, Shield, Key, Loader2, CheckCircle2, AlertTriangle, Trash2, Pencil, X, Lock } from 'lucide-react';

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null); 

  const [name, setName] = useState('');
  const [roleSuffix, setRoleSuffix] = useState('');
  const [password, setPassword] = useState('');

  const currentUserRole = localStorage.getItem('user_role');

  const roleOptions = currentUserRole === 'dev' 
    ? [ { label: 'Desenvolvedor (.dev)', value: '.dev' }, { label: 'Gestor (.gestor)', value: '.gestor' }, { label: 'Visitante (.view)', value: '.view' } ]
    : [ { label: 'Visitante (.view)', value: '.view' } ];

  useEffect(() => {
    if (roleOptions.length > 0) setRoleSuffix(roleOptions[0].value);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (error) { console.error("Erro ao buscar usuários"); } 
    finally { setLoading(false); }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setPassword('');
    if (roleOptions.length > 0) setRoleSuffix(roleOptions[0].value);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    const targetRole = user.username.split('.').pop();
    if (currentUserRole === 'gestor' && targetRole === 'dev') {
        showToast("Você não tem permissão para editar um desenvolvedor.", "error");
        return;
    }

    setEditingId(user.id);
    const parts = user.username.split('.');
    const suffix = '.' + parts.pop(); 
    const pureName = parts.join('.'); 

    setName(pureName);
    setRoleSuffix(suffix);
    setPassword(''); 
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || (!editingId && !password) || !roleSuffix) { 
      showToast("Preencha os campos obrigatórios.", "error"); 
      return; 
    }
    
    const finalUsername = `${name.toLowerCase().trim()}${roleSuffix}`;
    setSaving(true);

    try {
      if (editingId) {
        const payload = { username: finalUsername };
        if (password) payload.password = password; 
        await api.put(`/users/${editingId}/`, payload);
        showToast(`Usuário atualizado com sucesso!`, "success");
      } else {
        await api.post('/users/', { username: finalUsername, password: password });
        showToast(`Usuário criado com sucesso!`, "success");
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      if (error.response?.data?.username) showToast("Este usuário já existe.", "error");
      else if (error.response?.data?.detail) showToast(error.response.data.detail, "error");
      else showToast("Erro ao salvar usuário.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id, targetUsername) => {
    const targetRole = targetUsername.split('.').pop();
    if (currentUserRole === 'gestor' && targetRole === 'dev') {
        showToast("Você não tem permissão para excluir um desenvolvedor.", "error");
        return;
    }

    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
        await api.delete(`/users/${itemToDelete}/`);
        fetchUsers();
        showToast("Usuário removido permanentemente.", "success");
    } catch(error) { 
        showToast("Erro ao remover usuário.", "error"); 
    } finally {
        setShowDeleteModal(false);
        setItemToDelete(null);
    }
  }

  return (
    <>
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-up ${notification.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <div><h4 className="font-bold text-sm">{notification.type === 'success' ? 'Sucesso' : 'Atenção'}</h4><p className="text-xs opacity-90">{notification.message}</p></div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-up relative z-10">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Excluir Usuário?</h3>
            <p className="text-slate-400 text-sm mb-6">O acesso será revogado imediatamente. Essa ação é irreversível.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/25 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => !saving && setShowModal(false)}></div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-up relative z-10">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            
            <h3 className="text-xl font-bold text-white font-exo mb-6">
                {editingId ? "Editar Acesso" : "Novo Usuário"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4" autoComplete="off">
              <input type="text" style={{display:'none'}} />
              <input type="password" style={{display:'none'}} />

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Nome do Usuário</label>
                <div className="flex items-center">
                    <input 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-l-xl p-3 text-white focus:border-cyan-400 outline-none transition-colors text-right pr-1" 
                      placeholder="nome"
                      autoComplete="off" 
                      name="new-username-field"
                    />
                    <div className="bg-slate-800 border border-l-0 border-slate-700 p-3 rounded-r-xl text-slate-400 font-mono text-sm">
                        {roleSuffix}
                    </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><Shield size={14}/> Permissão</label>
                <select value={roleSuffix} onChange={e => setRoleSuffix(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none cursor-pointer">
                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-2"><Key size={14}/> 
                    {editingId ? "Nova Senha (Opcional)" : "Senha de Acesso"}
                </label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400 outline-none transition-colors" 
                    placeholder={editingId ? "Manter atual" : "••••••••"} 
                    required={!editingId} 
                    autoComplete="new-password"
                    name="new-password-field"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? "Salvar Alterações" : "Criar Acesso")}
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
              <Users className="text-cyan-400 w-8 h-8" /> Gestão de Acesso
            </h2>
            <p className="text-slate-400 text-sm">Controle de usuários e permissões</p>
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95">
            <UserPlus size={20} /> Novo Usuário
          </button>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold whitespace-nowrap">
                  <tr>
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Nível de Acesso</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {users.map((u) => {
                    const role = u.username.split('.').pop();
                    let roleColor = 'text-slate-400';
                    let roleLabel = 'Desconhecido';
                    
                    if (role === 'dev') { roleColor = 'text-purple-400'; roleLabel = 'Desenvolvedor'; }
                    if (role === 'gestor') { roleColor = 'text-cyan-400'; roleLabel = 'Gestor Hospitalar'; }
                    if (role === 'view') { roleColor = 'text-slate-400'; roleLabel = 'Visitante'; }

                    const isProtected = currentUserRole === 'gestor' && role === 'dev';

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-bold text-white">{u.username}</td>
                        <td className="p-4">
                          <span className={`bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs uppercase font-bold ${roleColor}`}>
                            {roleLabel}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => !isProtected && openEditModal(u)} 
                                    disabled={isProtected}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isProtected 
                                        ? 'opacity-30 cursor-not-allowed text-slate-600' 
                                        : 'hover:bg-yellow-500/10 text-slate-500 hover:text-yellow-400' 
                                    }`} 
                                    title={isProtected ? "Gestor não pode editar Desenvolvedor" : "Editar"}
                                >
                                    {isProtected ? <Lock size={18}/> : <Pencil size={18} />}
                                </button>
                                
                                <button 
                                    onClick={() => !isProtected && handleDeleteClick(u.id, u.username)} 
                                    disabled={isProtected}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isProtected 
                                        ? 'opacity-30 cursor-not-allowed text-slate-600' 
                                        : 'hover:bg-red-500/10 text-slate-500 hover:text-red-400'
                                    }`} 
                                    title={isProtected ? "Gestor não pode excluir Desenvolvedor" : "Excluir"}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}