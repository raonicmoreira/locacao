import { useState, useEffect } from 'react';
import { listarUsuarios, verificarEmail, criarUsuario, atualizarPerfil } from '../api/usuarioApi.js';

const PERFIS = [
  { label: 'Proprietário', value: 'PROPRIETARIO' },
  { label: 'Locatário', value: 'LOCATARIO' },
];

function StatusBadge({ status }) {
  return status === 1
    ? <span className="badge-green">Ativo</span>
    : <span className="badge-red">Inativo</span>;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [idPerfil, setIdPerfil] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null); // null | { id, nome, email }
  const [usuarioNovo, setUsuarioNovo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Erros de campo
  const [erroEmail, setErroEmail] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [erroPerfil, setErroPerfil] = useState('');

  async function carregarUsuarios() {
    setCarregando(true);
    setErroLista('');
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch {
      setErroLista('Não foi possível carregar os usuários.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarUsuarios(); }, []);

  function abrirModal() {
    setEmail('');
    setNome('');
    setIdPerfil('');
    setUsuarioEncontrado(null);
    setUsuarioNovo(false);
    setErroModal('');
    setSucesso('');
    setErroEmail('');
    setErroNome('');
    setErroPerfil('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  async function handleEmailBlur() {
    if (!email) return;
    setVerificando(true);
    setErroModal('');
    setUsuarioEncontrado(null);
    setUsuarioNovo(false);
    setNome('');
    try {
      const resultado = await verificarEmail(email);
      if (resultado.existe) {
        setUsuarioEncontrado({ id: resultado.id, nome: resultado.nome, email: resultado.email });
        setNome(resultado.nome);
        setUsuarioNovo(false);
      } else {
        setUsuarioNovo(true);
      }
    } catch {
      setErroModal('Erro ao verificar e-mail.');
    } finally {
      setVerificando(false);
    }
  }

  function validar() {
    let valido = true;
    setErroEmail('');
    setErroNome('');
    setErroPerfil('');

    if (!email) {
      setErroEmail('E-mail é obrigatório.');
      valido = false;
    }
    if (usuarioNovo && !nome) {
      setErroNome('Nome é obrigatório para novo usuário.');
      valido = false;
    }
    if (!idPerfil) {
      setErroPerfil('Selecione um perfil.');
      valido = false;
    }
    return valido;
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErroModal('');
    setSucesso('');
    try {
      await criarUsuario(nome, email, idPerfil);
      setSucesso(
        usuarioNovo
          ? 'Usuário cadastrado. Ele receberá um e-mail para definir sua senha.'
          : 'Perfil atualizado com sucesso.'
      );
      await carregarUsuarios();
      setTimeout(() => fecharModal(), 2000);
    } catch (err) {
      setErroModal(err?.response?.data?.erro ?? 'Erro ao salvar usuário.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Usuários</h1>
        <button className="btn btn-primary" onClick={abrirModal}>
          + Novo Usuário
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
            <span className="spinner" role="status" aria-label="Carregando usuários" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  usuarios.map(u => (
                    <tr key={u.id}>
                      <td>{u.nome}</td>
                      <td>{u.email}</td>
                      <td><StatusBadge status={u.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de cadastro */}
      {modalAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-titulo">Novo Usuário</h2>
              <button className="modal-close" onClick={fecharModal} aria-label="Fechar modal">✕</button>
            </div>

            {erroModal && (
              <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>
                {erroModal}
              </div>
            )}
            {sucesso && (
              <div className="alert-success" role="status" style={{ marginBottom: '16px' }}>
                {sucesso}
              </div>
            )}

            <form onSubmit={handleSalvar} noValidate>
              <div className="form-group">
                <label htmlFor="usuario-email" className="form-label">E-mail</label>
                <input
                  id="usuario-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErroEmail(''); }}
                  onBlur={handleEmailBlur}
                  disabled={salvando}
                  aria-invalid={!!erroEmail}
                  aria-describedby={erroEmail ? 'erro-email' : undefined}
                />
                {verificando && <span className="form-hint">Verificando...</span>}
                {erroEmail && <span id="erro-email" className="form-error" role="alert">{erroEmail}</span>}
              </div>

              {/* Nome — exibir sempre que soubermos o estado */}
              {(usuarioEncontrado || usuarioNovo) && (
                <div className="form-group">
                  <label htmlFor="usuario-nome" className="form-label">Nome</label>
                  <input
                    id="usuario-nome"
                    type="text"
                    className="form-input"
                    value={nome}
                    onChange={e => { setNome(e.target.value); setErroNome(''); }}
                    readOnly={!!usuarioEncontrado}
                    disabled={salvando || !!usuarioEncontrado}
                    aria-invalid={!!erroNome}
                    aria-describedby={erroNome ? 'erro-nome' : undefined}
                  />
                  {erroNome && <span id="erro-nome" className="form-error" role="alert">{erroNome}</span>}
                </div>
              )}

              {/* Perfil — exibir quando soubermos o estado do usuário */}
              {(usuarioEncontrado || usuarioNovo) && (
                <div className="form-group">
                  <label htmlFor="usuario-perfil" className="form-label">Perfil</label>
                  <select
                    id="usuario-perfil"
                    className="form-input"
                    value={idPerfil}
                    onChange={e => { setIdPerfil(e.target.value); setErroPerfil(''); }}
                    disabled={salvando}
                    aria-invalid={!!erroPerfil}
                    aria-describedby={erroPerfil ? 'erro-perfil' : undefined}
                  >
                    <option value="">Selecione um perfil...</option>
                    {PERFIS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  {erroPerfil && <span id="erro-perfil" className="form-error" role="alert">{erroPerfil}</span>}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={fecharModal} disabled={salvando}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={salvando || verificando || (!usuarioEncontrado && !usuarioNovo)}
                >
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
    </div>
  );
}
