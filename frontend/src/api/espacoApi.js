import api from './authApi.js';

export async function listarEspacos() {
  const { data } = await api.get('/espacos');
  return data;
}

export async function criarEspaco(payload) {
  const { data } = await api.post('/espacos', payload);
  return data;
}

export async function atualizarEspaco(id, payload) {
  const { data } = await api.post(`/espacos/${id}`, payload);
  return data;
}

export async function excluirEspaco(id) {
  await api.delete(`/espacos/${id}`);
}
