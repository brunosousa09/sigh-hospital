import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

const AutoLogout = ({ timeout = 30 }) => { 
  const navigate = useNavigate();

  useEffect(() => {
    const tempoLimite = timeout * 60 * 1000; 
    let temporizador;

    const fazerLogout = () => {
      localStorage.removeItem('token'); 
      localStorage.removeItem('user_data');
      
    
      localStorage.removeItem('activeTab'); 

      alert("Sessão expirada por inatividade. Faça login novamente.");
      navigate('/login'); 
    };

    const resetarTemporizador = () => {
      if (temporizador) clearTimeout(temporizador);
      temporizador = setTimeout(fazerLogout, tempoLimite);
    };

    const eventos = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    eventos.forEach(evento => document.addEventListener(evento, resetarTemporizador));

    resetarTemporizador(); 


    return () => {
      if (temporizador) clearTimeout(temporizador);
      eventos.forEach(evento => document.removeEventListener(evento, resetarTemporizador));
    };
  }, [navigate, timeout]);

  return null; 
};

export default AutoLogout;