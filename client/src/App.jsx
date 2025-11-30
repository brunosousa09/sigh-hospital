import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import Entrada from './pages/Entrada';
import Saida from './pages/Saida';
import Pendencias from './pages/Pendencias';
import Pagamentos from './pages/Pagamentos';
import Comparativo from './pages/Comparativo';
import Usuarios from './pages/Usuarios';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/empresas" element={<PrivateRoute><Empresas /></PrivateRoute>} />
        <Route path="/entrada" element={<PrivateRoute><Entrada /></PrivateRoute>} />
        <Route path="/saida" element={<PrivateRoute><Saida /></PrivateRoute>} />
        <Route path="/pendencias" element={<PrivateRoute><Pendencias /></PrivateRoute>} />
        <Route path="/pagamentos" element={<PrivateRoute><Pagamentos /></PrivateRoute>} />
        <Route path="/comparativo" element={<PrivateRoute><Comparativo /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
      
      </Routes>
    </Router>
  );
}

export default App;