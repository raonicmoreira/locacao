import { Navigate } from 'react-router-dom';
import { isTokenValid, getEmpresa, getPerfil } from '../utils/auth';

/**
 * Guarda de rota que verifica:
 * 1. Existência e validade do JWT no localStorage
 * 2. Existência de empresa selecionada na sessão
 * 3. Perfil do usuário, quando `allowedProfiles` for informado
 */
export default function ProtectedRoute({ children, allowedProfiles }) {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }

  if (!getEmpresa()) {
    return <Navigate to="/selecionar-empresa" replace />;
  }

  if (allowedProfiles && !allowedProfiles.includes(getPerfil())) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
