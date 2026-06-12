import { useState, useEffect } from 'react';
import { listarGrupos, criarGrupo, atualizarGrupo, excluirGrupo } from '../api/grupoApi.js';

function StatusBadge({ status }) {
  return status === 1
    ? <span className="badge-green">Ativo</span>
    : <span className="badge-red">Inativo</span>;
}

const FORM_VAZIO = { descricao: '', status: 1 };

export default function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');

  // Modal de cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null); // null = novo, objeto = edição
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroDescricao, setErroDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');

  // Modal de confirmação de exclusão
  const [confirmExcluir, setConfirmExcluir] = useState(null); // null ou grupo
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');

  async function carregarGrupos() {
    setCarregando(true);
    setErroLista('');
    try {
      const data = await listarGrupos();
      setGrupos(data);
    } catch {
      setErroLista('Não foi possível carregar os grupos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarGrupos(); }, []);

  function abrirModalNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErroDescricao('');
    setErroModal('');
    setModalAberto(true);
  }

  function abrirModalEditar(grupo) {
    setEditando(grupo);
    setForm({ descricao: grupo.descricao, status: grupo.status });
    setErroDescricao('');
    setErroModal('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  function validar() {
    setErroDescricao('');
    if (!form.descricao.trim()) {
      setErroDescricao('Descrição é obrigatória.');
      return false;
    }
    return true;
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErroModal('');
    try {
      if (editando) {
        await atualizarGrupo(editando.id, form.descricao, form.status);
      } else {
        await criarGrupo(form.descricao);
      }
      await carregarGrupos();
      fecharModal();
    } catch (err) {
      setErroModal(err?.response?.data?.erro ?? 'Erro ao salvar grupo.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!confirmExcluir) return;
    setExcluindo(true);
    setErroExcluir('');
    try {
      await excluirGrupo(confirmExcluir.id);
      await carregarGrupos();
      setConfirmExcluir(null);
    } catch (err) {
      setErroExcluir(err?.response?.data?.erro ?? 'Erro ao excluir grupo.');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Grupos</h1>
        <button className="btn btn-primary" onClick={abrirModalNovo}>
          + Novo Grupo
        </button>
      </div>

      {erroLista && (
        <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>
          {erroLista}
        </div>
      )}

      <div className="card">
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <span className="spinner" role="status" aria-label="Carregando grupos" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th style={{ width: '140px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {grupos.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                      Nenhum grupo cadastrado.
                    </td>
                  </tr>
                ) : (
                  grupos.map(g => (
                    <tr key={g.id} style={{ opacity: g.status === 0 ? 0.55 : 1 }}>
                      <td>
                        {g.descricao}
                        {g.status === 0 && (
                          <span style={{ marginLeft: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            (inativo)
                          </span>
                        )}
                      </td>
                      <td><StatusBadge status={g.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.85rem' }}
                            onClick={() => abrirModalEditar(g)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn"
                            style={{
                              padding: '6px 12px',
                              minHeight: '36px',
                              fontSize: '0.85rem',
                              background: 'rgba(239,68,68,0.1)',
                              color: 'var(--danger)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: 'var(--radius)',
                            }}
                            onClick={() => { setErroExcluir(''); setConfirmExcluir(g); }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal cadastro/edição */}
      {modalAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-grupo-titulo">
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-grupo-titulo">{editando ? 'Editar Grupo' : 'Novo Grupo'}</h2>
              <button className="modal-close" onClick={fecharModal} aria-label="Fechar modal">✕</button>
            </div>

            {erroModal && (
              <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>
                {erroModal}
              </div>
            )}

            <form onSubmit={handleSalvar} noValidate>
              <div className="form-group">
                <label htmlFor="grupo-descricao" className="form-label">Descrição</label>
                <input
                  id="grupo-descricao"
                  type="text"
                  className="form-input"
                  value={form.descricao}
                  onChange={e => { setForm(f => ({ ...f, descricao: e.target.value })); setErroDescricao(''); }}
                  disabled={salvando}
                  aria-invalid={!!erroDescricao}
                  aria-describedby={erroDescricao ? 'erro-grupo-descricao' : undefined}
                />
                {erroDescricao && (
                  <span id="erro-grupo-descricao" className="form-error" role="alert">{erroDescricao}</span>
                )}
              </div>

              {editando && (
                <div className="form-group">
                  <label htmlFor="grupo-status" className="form-label">Status</label>
                  <select
                    id="grupo-status"
                    className="form-input"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: Number(e.target.value) }))}
                    disabled={salvando}
                  >
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={fecharModal} disabled={salvando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" />
                      Salvando...
                    </>
                  ) : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmação exclusão */}
      {confirmExcluir && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-excluir-titulo">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 id="modal-excluir-titulo">Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setConfirmExcluir(null)} aria-label="Fechar">✕</button>
            </div>

            <p style={{ color: 'var(--text)', marginBottom: '8px' }}>
              Deseja excluir o grupo <strong style={{ color: 'var(--text-bright)' }}>{confirmExcluir.descricao}</strong>?
            </p>
            <p className="form-hint">Esta ação não pode ser desfeita.</p>

            {erroExcluir && (
              <div className="alert-error" role="alert" style={{ marginTop: '12px' }}>
                {erroExcluir}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setConfirmExcluir(null)}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                className="btn"
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                }}
                onClick={handleExcluir}
                disabled={excluindo}
              >
                {excluindo ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" />
                    Excluindo...
                  </>
                ) : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
