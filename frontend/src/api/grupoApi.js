import api from './authApi.js';

export async function listarGrupos() {
  const { data } = await api.get('/grupos');
  return data;
}

export async function listarGruposAtivos() {
  const { data } = await api.get('/grupos/ativos');
  return data;
}

export async function criarGrupo(descricao) {
  const { data } = await api.post('/grupos', { descricao });
  return data;
}

export async function atualizarGrupo(id, descricao, status) {
  const { data } = await api.post(`/grupos/${id}`, { descricao, status });
  return data;
}

export async function excluirGrupo(id) {
  await api.delete(`/grupos/${id}`);
}
