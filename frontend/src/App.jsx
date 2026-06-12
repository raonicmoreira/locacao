import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas públicas
import Login from './pages/Login.jsx';
import AtivarConta from './pages/AtivarConta.jsx';
import SelecionarEmpresa from './pages/SelecionarEmpresa.jsx';

// Páginas protegidas
import Usuarios from './pages/Usuarios.jsx';
import Grupos from './pages/Grupos.jsx';
import TiposLocacao from './pages/TiposLocacao.jsx';
import Espacos from './pages/Espacos.jsx';

// Componentes
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';

// Placeholders para páginas ainda não implementadas
function PlaceholderPage({ titulo }) {
  return (
    <div>
      <div className="page-header">
        <h1>{titulo}</h1>
      </div>
      <p className="text-muted">Em desenvolvimento.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/ativar" element={<AtivarConta />} />
        <Route path="/selecionar-empresa" element={<SelecionarEmpresa />} />

        {/* Rotas protegidas — apenas PROPRIETARIO */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedProfiles={['PROPRIETARIO']}>
              <AppLayout><Usuarios /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grupos"
          element={
            <ProtectedRoute allowedProfiles={['PROPRIETARIO']}>
              <AppLayout><Grupos /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tipos-locacao"
          element={
            <ProtectedRoute allowedProfiles={['PROPRIETARIO']}>
              <AppLayout><TiposLocacao /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/espacos"
          element={
            <ProtectedRoute allowedProfiles={['PROPRIETARIO']}>
              <AppLayout><Espacos /></AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento padrão */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
