import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Interceptor: adiciona token JWT em todas as requisições autenticadas
api.interceptors.request.use(config => {
  const token = localStorage.getItem('locacao_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Autentica o usuário.
 * @returns {{ token: string, nome: string, email: string, empresas: Array }}
 */
export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data;
}

/**
 * Ativa a conta de um novo usuário com o token recebido por e-mail.
 */
export async function ativarConta(token, senha) {
  await api.post('/auth/ativar', { token, senha });
}

export default api;
