import React, { useState, useEffect } from 'react';
import { User, Lock, Hospital, Radio, Loader2, CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [booting, setBooting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bootText, setBootText] = useState("Inicializando...");
  const [bootStep, setBootStep] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    setUser('');
    setPass('');
    localStorage.removeItem('token');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/token/', { username: user, password: pass });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setLoading(false);
      startBootSequence();
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 401) {
        setErrorMsg("Usuário não existe ou senha inválida. Fale com o Administrador do sistema.");
      } else {
        setErrorMsg("Erro de conexão com o servidor.");
      }
    }
  };

  const startBootSequence = () => {
    setBooting(true);
    let width = 0;
    const msgs = ["Carregando módulos...", "Validando segurança...", "Sincronizando dados...", "Acesso autorizado!"];
    
    const interval = setInterval(() => {
      width += 2;
      setProgress(width);
      if(width < 30) setBootText(msgs[0]);
      else if(width < 60) setBootText(msgs[1]);
      else if(width < 90) setBootText(msgs[2]);
      else setBootText(msgs[3]);

      if (width >= 100) {
        clearInterval(interval);
        setBootStep(2);
        setTimeout(() => { navigate('/dashboard'); }, 1000);
      }
    }, 30);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-4 sm:px-0">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float pointer-events-none" style={{ animationDelay: '-5s' }}></div>

      <div className="glass-card w-full max-w-[400px] p-8 sm:p-10 rounded-3xl relative z-10 animate-fade-up border border-white/10 shadow-2xl backdrop-blur-md bg-white/5">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 mb-6 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Hospital className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-exo tracking-wide">SIGH 9.0</h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Acesso Administrativo</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-fade-up backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div className="relative group">
            <input type="text" id="user" value={user} onChange={(e) => setUser(e.target.value)} className="peer w-full bg-slate-950/30 border border-slate-700/50 rounded-xl px-4 pt-6 pb-2 pl-12 text-white outline-none focus:border-cyan-400 focus:bg-slate-900/50 transition-all placeholder-transparent" placeholder=" " autoComplete="off" required />
            <label htmlFor="user" className="absolute left-4 text-slate-500 transition-all pointer-events-none flex items-center gap-2 text-xs top-2 text-cyan-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-cyan-400">
              <User className="w-4 h-4" /> <span>Usuário</span>
            </label>
          </div>

          <div className="relative group">
            <input type={showPassword ? "text" : "password"} id="pass" value={pass} onChange={(e) => setPass(e.target.value)} className="peer w-full bg-slate-950/30 border border-slate-700/50 rounded-xl px-4 pt-6 pb-2 pl-12 pr-12 text-white outline-none focus:border-cyan-400 focus:bg-slate-900/50 transition-all placeholder-transparent" placeholder=" " autoComplete="new-password" required />
            <label htmlFor="pass" className="absolute left-4 text-slate-500 transition-all pointer-events-none flex items-center gap-2 text-xs top-2 text-cyan-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-cyan-400">
              <Lock className="w-4 h-4" /> <span>Senha</span>
            </label>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer z-20">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Validando...</> : "Acessar Sistema"}
          </button>
        </form>
        <div className="mt-8 text-center"><p className="text-xs text-slate-600">Hospital José Leite da Silva &copy; 2025</p></div>
      </div>

      {booting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            {bootStep === 1 ? (
              <div className="flex flex-col items-center animate-fade-up">
                <div className="relative mb-6"><div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div><Radio className="w-16 h-16 text-cyan-400 animate-pulse relative z-10" /></div>
                <h2 className="text-xl font-bold text-white mb-2 font-exo">Inicializando</h2><p className="text-slate-400 text-sm mb-6 h-5">{bootText}</p>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-100 ease-out" style={{ width: `${progress}%` }}></div></div>
                <div className="mt-2 text-right w-full text-xs text-cyan-500 font-mono">{Math.round(progress)}%</div>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-fade-up">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-10 h-10 text-green-400" /></div>
                <h2 className="text-2xl font-bold text-white mb-1">Bem-vindo!</h2><p className="text-slate-400 text-sm">Ambiente seguro carregado.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}