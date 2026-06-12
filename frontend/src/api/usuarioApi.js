import api from './authApi.js';

export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data;
}

export async function verificarEmail(email) {
  const { data } = await api.post('/usuarios/verificar-email', { email });
  return data; // { existe, id, nome, email }
}

export async function criarUsuario(nome, email, idPerfil) {
  const { data } = await api.post('/usuarios', { nome, email, idPerfil });
  return data;
}

export async function atualizarPerfil(idUsuario, idPerfil) {
  await api.post(`/usuarios/${idUsuario}/perfil`, { idPerfil });
}
