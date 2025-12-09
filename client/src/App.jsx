import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import NFs from './pages/NFs';
import Entrada from './pages/Entrada';
import Saida from './pages/Saida';
import Usuarios from './pages/Usuarios';
import Empresas from './pages/Empresas';
import Pendencias from './pages/Pendencias';
import Pagamentos from './pages/Pagamentos';
import Comparativo from './pages/Comparativo';
import Notificacoes from './pages/Notificacoes'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nfs" element={<NFs />} />
          <Route path="/entrada" element={<Entrada />} />
          <Route path="/saida" element={<Saida />} />
          <Route path="/pendencias" element={<Pendencias />} />
          <Route path="/pagamentos" element={<Pagamentos />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/comparativo" element={<Comparativo />} />
          <Route path="/notificacoes" element={<Notificacoes />} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;