// Chaves usadas no localStorage
const TOKEN_KEY = 'locacao_token';
const EMPRESA_KEY = 'locacao_empresa';
const PERFIL_KEY = 'locacao_perfil';
const NOME_KEY = 'locacao_nome';
const EMPRESAS_PENDENTES_KEY = 'locacao_empresas_pendentes';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getEmpresa() {
  const raw = localStorage.getItem(EMPRESA_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setEmpresa(e) {
  localStorage.setItem(EMPRESA_KEY, JSON.stringify(e));
}

export function clearEmpresa() {
  localStorage.removeItem(EMPRESA_KEY);
}

export function getPerfil() {
  return localStorage.getItem(PERFIL_KEY);
}

export function setPerfil(p) {
  localStorage.setItem(PERFIL_KEY, p);
}

export function clearPerfil() {
  localStorage.removeItem(PERFIL_KEY);
}

export function getNome() {
  return localStorage.getItem(NOME_KEY);
}

export function setNome(n) {
  localStorage.setItem(NOME_KEY, n);
}

export function clearNome() {
  localStorage.removeItem(NOME_KEY);
}

/** Salva temporariamente as empresas retornadas no login */
export function setEmpresasPendentes(empresas) {
  localStorage.setItem(EMPRESAS_PENDENTES_KEY, JSON.stringify(empresas));
}

export function getEmpresasPendentes() {
  const raw = localStorage.getItem(EMPRESAS_PENDENTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function clearEmpresasPendentes() {
  localStorage.removeItem(EMPRESAS_PENDENTES_KEY);
}

/** Verifica se o token JWT armazenado é válido e não expirou */
export function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 > Date.now() : true;
  } catch {
    return false;
  }
}

/** Decodifica o payload do JWT sem validar assinatura */
export function decodeToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/** Remove todos os dados de sessão do localStorage */
export function logout() {
  clearToken();
  clearEmpresa();
  clearPerfil();
  clearNome();
  clearEmpresasPendentes();
}
