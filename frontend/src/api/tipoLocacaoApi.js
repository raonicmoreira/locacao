import api from './authApi.js';

export async function listarTiposLocacao() {
  const { data } = await api.get('/tipos-locacao');
  return data;
}

export async function listarTiposLocacaoAtivos() {
  const { data } = await api.get('/tipos-locacao/ativos');
  return data;
}

export async function criarTipoLocacao(payload) {
  const { data } = await api.post('/tipos-locacao', payload);
  return data;
}

export async function atualizarTipoLocacao(id, payload) {
  const { data } = await api.post(`/tipos-locacao/${id}`, payload);
  return data;
}

export async function excluirTipoLocacao(id) {
  await api.delete(`/tipos-locacao/${id}`);
}
