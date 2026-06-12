import { useState, useEffect, useCallback } from 'react';
import { listarEspacos, criarEspaco, atualizarEspaco, excluirEspaco } from '../api/espacoApi.js';
import { listarGruposAtivos } from '../api/grupoApi.js';
import { listarTiposLocacaoAtivos, criarTipoLocacao } from '../api/tipoLocacaoApi.js';
import { DIAS_SEMANA, toBitmask, fromBitmask } from '../utils/bitmask.js';

const MODALIDADES = { 0: 'Mês', 1: 'Dia', 2: 'Hora' };

function StatusBadge({ status }) {
  return status === 1
    ? <span className="badge-green">Ativo</span>
    : <span className="badge-red">Inativo</span>;
}

const FORM_VAZIO = {
  idGrupo: '',
  idEspacoTipoLocacao: '',
  descricao: '',
  status: 1,
  valor: '',
  endereco: '',
  observacoes: '',
};

const TIPO_FORM_VAZIO = {
  descricao: '',
  modalidadeLocacao: 0,
  diasSemana: [],
  horaInicio: '',
  horaFim: '',
};

export default function Espacos() {
  const [espacos, setEspacos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');

  // Modal espaço
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');
  const [erros, setErros] = useState({});

  // Modal tipo de locação inline
  const [modalTipoAberto, setModalTipoAberto] = useState(false);
  const [tipoForm, setTipoForm] = useState(TIPO_FORM_VAZIO);
  const [salvandoTipo, setSalvandoTipo] = useState(false);
  const [erroTipoModal, setErroTipoModal] = useState('');
  const [errosTipo, setErrosTipo] = useState({});

  // Modal confirmação exclusão
  const [confirmExcluir, setConfirmExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroLista('');
    try {
      const [esp, grps, tps] = await Promise.all([
        listarEspacos(),
        listarGruposAtivos(),
        listarTiposLocacaoAtivos(),
      ]);
      setEspacos(esp);
      setGrupos(grps);
      setTipos(tps);
    } catch {
      setErroLista('Não foi possível carregar os dados.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErros({});
    setErroModal('');
    setModalAberto(true);
  }

  function abrirEditar(espaco) {
    setEditando(espaco);
    setForm({
      idGrupo: espaco.idGrupo,
      idEspacoTipoLocacao: espaco.idEspacoTipoLocacao,
      descricao: espaco.descricao,
      status: espaco.status,
      valor: espaco.valor?.toString() ?? '',
      endereco: espaco.endereco ?? '',
      observacoes: espaco.observacoes ?? '',
    });
    setErros({});
    setErroModal('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  function validar() {
    const e = {};
    if (!form.idGrupo) e.idGrupo = 'Selecione um grupo.';
    if (!form.idEspacoTipoLocacao) e.idEspacoTipoLocacao = 'Selecione um tipo de locação.';
    if (!form.descricao.trim()) e.descricao = 'Descrição é obrigatória.';
    if (!form.valor || isNaN(Number(form.valor)) || Number(form.valor) <= 0) e.valor = 'Informe um valor válido.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!validar()) return;

    const payload = {
      idGrupo: form.idGrupo,
      idEspacoTipoLocacao: form.idEspacoTipoLocacao,
      descricao: form.descricao,
      status: form.status,
      valor: Number(form.valor),
      endereco: form.endereco || null,
      observacoes: form.observacoes || null,
    };

    setSalvando(true);
    setErroModal('');
    try {
      if (editando) {
        await atualizarEspaco(editando.id, payload);
      } else {
        await criarEspaco(payload);
      }
      await carregar();
      fecharModal();
    } catch (err) {
      setErroModal(err?.response?.data?.erro ?? 'Erro ao salvar espaço.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!confirmExcluir) return;
    setExcluindo(true);
    setErroExcluir('');
    try {
      await excluirEspaco(confirmExcluir.id);
      await carregar();
      setConfirmExcluir(null);
    } catch (err) {
      setErroExcluir(err?.response?.data?.erro ?? 'Erro ao excluir espaço.');
    } finally {
      setExcluindo(false);
    }
  }

  // --- Modal tipo de locação inline ---

  function abrirModalTipo() {
    setTipoForm(TIPO_FORM_VAZIO);
    setErrosTipo({});
    setErroTipoModal('');
    setModalTipoAberto(true);
  }

  function toggleDia(bit) {
    setTipoForm(f => ({
      ...f,
      diasSemana: f.diasSemana.includes(bit)
        ? f.diasSemana.filter(b => b !== bit)
        : [...f.diasSemana, bit],
    }));
  }

  function validarTipo() {
    const e = {};
    if (!tipoForm.descricao.trim()) e.descricao = 'Descrição é obrigatória.';
    if ((tipoForm.modalidadeLocacao === 1 || tipoForm.modalidadeLocacao === 2) && tipoForm.diasSemana.length === 0) {
      e.diasSemana = 'Selecione ao menos um dia.';
    }
    if (tipoForm.modalidadeLocacao === 2) {
      if (!tipoForm.horaInicio) e.horaInicio = 'Informe o horário de início.';
      if (!tipoForm.horaFim) e.horaFim = 'Informe o horário de fim.';
    }
    setErrosTipo(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvarTipo(e) {
    e.preventDefault();
    if (!validarTipo()) return;

    const payload = {
      descricao: tipoForm.descricao,
      modalidadeLocacao: tipoForm.modalidadeLocacao,
      diasSemana: (tipoForm.modalidadeLocacao === 1 || tipoForm.modalidadeLocacao === 2)
        ? toBitmask(tipoForm.diasSemana) : null,
      horaInicio: tipoForm.modalidadeLocacao === 2 ? tipoForm.horaInicio : null,
      horaFim: tipoForm.modalidadeLocacao === 2 ? tipoForm.horaFim : null,
    };

    setSalvandoTipo(true);
    setErroTipoModal('');
    try {
      const novoTipo = await criarTipoLocacao(payload);
      const tiposAtualizados = await listarTiposLocacaoAtivos();
      setTipos(tiposAtualizados);
      setForm(f => ({ ...f, idEspacoTipoLocacao: novoTipo.id }));
      setModalTipoAberto(false);
    } catch (err) {
      setErroTipoModal(err?.response?.data?.erro ?? 'Erro ao criar tipo de locação.');
    } finally {
      setSalvandoTipo(false);
    }
  }

  const mostrarDiasTipo = tipoForm.modalidadeLocacao === 1 || tipoForm.modalidadeLocacao === 2;
  const mostrarHorariosTipo = tipoForm.modalidadeLocacao === 2;

  return (
    <div>
      <div className="page-header">
        <h1>Espaços</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Espaço</button>
      </div>

      {erroLista && <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>{erroLista}</div>}

      <div className="card">
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <span className="spinner" role="status" aria-label="Carregando" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Descrição</th>
                  <th>Tipo de Locação</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th style={{ width: '140px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {espacos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                      Nenhum espaço cadastrado.
                    </td>
                  </tr>
                ) : (
                  espacos.map(esp => (
                    <tr key={esp.id}>
                      <td>{esp.grupoDescricao}</td>
                      <td>{esp.descricao}</td>
                      <td style={{ fontSize: '0.85rem' }}>{esp.tipoLocacaoDescricao}</td>
                      <td>R$ {Number(esp.valor).toFixed(2)}</td>
                      <td><StatusBadge status={esp.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.85rem' }}
                            onClick={() => abrirEditar(esp)}
                          >Editar</button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)' }}
                            onClick={() => { setErroExcluir(''); setConfirmExcluir(esp); }}
                          >Excluir</button>
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

      {/* Modal espaço */}
      {modalAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-espaco-titulo">
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 id="modal-espaco-titulo">{editando ? 'Editar Espaço' : 'Novo Espaço'}</h2>
              <button className="modal-close" onClick={fecharModal} aria-label="Fechar">✕</button>
            </div>

            {erroModal && <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>{erroModal}</div>}

            <form onSubmit={handleSalvar} noValidate>
              {/* Grupo */}
              <div className="form-group">
                <label htmlFor="espaco-grupo" className="form-label">Grupo</label>
                <select
                  id="espaco-grupo"
                  className="form-input"
                  value={form.idGrupo}
                  onChange={e => { setForm(f => ({ ...f, idGrupo: e.target.value })); setErros(v => ({ ...v, idGrupo: '' })); }}
                  disabled={salvando}
                  aria-invalid={!!erros.idGrupo}
                >
                  <option value="">Selecione um grupo...</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.descricao}</option>)}
                </select>
                {erros.idGrupo && <span className="form-error" role="alert">{erros.idGrupo}</span>}
              </div>

              {/* Tipo de locação */}
              <div className="form-group">
                <label htmlFor="espaco-tipo" className="form-label">Tipo de Locação</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    id="espaco-tipo"
                    className="form-input"
                    value={form.idEspacoTipoLocacao}
                    onChange={e => { setForm(f => ({ ...f, idEspacoTipoLocacao: e.target.value })); setErros(v => ({ ...v, idEspacoTipoLocacao: '' })); }}
                    disabled={salvando}
                    aria-invalid={!!erros.idEspacoTipoLocacao}
                    style={{ flex: 1 }}
                  >
                    <option value="">Selecione um tipo...</option>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ whiteSpace: 'nowrap', minHeight: '44px' }}
                    onClick={abrirModalTipo}
                    disabled={salvando}
                  >
                    + Criar novo
                  </button>
                </div>
                {erros.idEspacoTipoLocacao && <span className="form-error" role="alert">{erros.idEspacoTipoLocacao}</span>}
              </div>

              {/* Descrição */}
              <div className="form-group">
                <label htmlFor="espaco-descricao" className="form-label">Descrição</label>
                <input
                  id="espaco-descricao"
                  type="text"
                  className="form-input"
                  value={form.descricao}
                  onChange={e => { setForm(f => ({ ...f, descricao: e.target.value })); setErros(v => ({ ...v, descricao: '' })); }}
                  disabled={salvando}
                  aria-invalid={!!erros.descricao}
                />
                {erros.descricao && <span className="form-error" role="alert">{erros.descricao}</span>}
              </div>

              {/* Status + Valor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="espaco-status" className="form-label">Status</label>
                  <select
                    id="espaco-status"
                    className="form-input"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: Number(e.target.value) }))}
                    disabled={salvando}
                  >
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="espaco-valor" className="form-label">Valor (R$)</label>
                  <input
                    id="espaco-valor"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={form.valor}
                    onChange={e => { setForm(f => ({ ...f, valor: e.target.value })); setErros(v => ({ ...v, valor: '' })); }}
                    disabled={salvando}
                    aria-invalid={!!erros.valor}
                  />
                  {erros.valor && <span className="form-error" role="alert">{erros.valor}</span>}
                </div>
              </div>

              {/* Endereço */}
              <div className="form-group">
                <label htmlFor="espaco-endereco" className="form-label">Endereço <span className="text-muted">(opcional)</span></label>
                <input
                  id="espaco-endereco"
                  type="text"
                  className="form-input"
                  value={form.endereco}
                  onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))}
                  disabled={salvando}
                />
              </div>

              {/* Observações */}
              <div className="form-group">
                <label htmlFor="espaco-obs" className="form-label">Observações <span className="text-muted">(opcional)</span></label>
                <textarea
                  id="espaco-obs"
                  className="form-input"
                  value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  disabled={salvando}
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={fecharModal} disabled={salvando}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" /> Salvando...</> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal criação rápida de tipo de locação */}
      {modalTipoAberto && (
        <div className="modal-overlay" style={{ zIndex: 300 }} role="dialog" aria-modal="true" aria-labelledby="modal-tipo-inline-titulo">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 id="modal-tipo-inline-titulo">Novo Tipo de Locação</h2>
              <button className="modal-close" onClick={() => setModalTipoAberto(false)} aria-label="Fechar">✕</button>
            </div>

            {erroTipoModal && <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>{erroTipoModal}</div>}

            <form onSubmit={handleSalvarTipo} noValidate>
              <div className="form-group">
                <label htmlFor="tipo-inline-descricao" className="form-label">Descrição</label>
                <input
                  id="tipo-inline-descricao"
                  type="text"
                  className="form-input"
                  value={tipoForm.descricao}
                  onChange={e => { setTipoForm(f => ({ ...f, descricao: e.target.value })); setErrosTipo(v => ({ ...v, descricao: '' })); }}
                  disabled={salvandoTipo}
                />
                {errosTipo.descricao && <span className="form-error" role="alert">{errosTipo.descricao}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="tipo-inline-modalidade" className="form-label">Modalidade</label>
                <select
                  id="tipo-inline-modalidade"
                  className="form-input"
                  value={tipoForm.modalidadeLocacao}
                  onChange={e => setTipoForm(f => ({ ...f, modalidadeLocacao: Number(e.target.value), diasSemana: [], horaInicio: '', horaFim: '' }))}
                  disabled={salvandoTipo}
                >
                  <option value={0}>Por mês</option>
                  <option value={1}>Por dia</option>
                  <option value={2}>Por hora</option>
                </select>
              </div>

              {mostrarDiasTipo && (
                <div className="form-group">
                  <span className="form-label" id="dias-inline-label">Dias da semana</span>
                  <div role="group" aria-labelledby="dias-inline-label" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {DIAS_SEMANA.map(dia => {
                      const ativo = tipoForm.diasSemana.includes(dia.bit);
                      return (
                        <button
                          key={dia.bit}
                          type="button"
                          onClick={() => toggleDia(dia.bit)}
                          disabled={salvandoTipo}
                          aria-pressed={ativo}
                          style={{ minWidth: '44px', minHeight: '44px', borderRadius: '8px', border: `1px solid ${ativo ? 'var(--primary)' : 'var(--border)'}`, background: ativo ? 'rgba(107,9,172,0.2)' : 'var(--bg-card)', color: ativo ? 'var(--text-bright)' : 'var(--text-muted)', fontWeight: ativo ? '700' : '400', cursor: 'pointer', fontSize: '0.85rem' }}
                        >{dia.label}</button>
                      );
                    })}
                  </div>
                  {errosTipo.diasSemana && <span className="form-error" role="alert">{errosTipo.diasSemana}</span>}
                </div>
              )}

              {mostrarHorariosTipo && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="tipo-inline-inicio" className="form-label">Início</label>
                    <input id="tipo-inline-inicio" type="time" className="form-input" value={tipoForm.horaInicio} onChange={e => setTipoForm(f => ({ ...f, horaInicio: e.target.value }))} disabled={salvandoTipo} />
                    {errosTipo.horaInicio && <span className="form-error" role="alert">{errosTipo.horaInicio}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="tipo-inline-fim" className="form-label">Fim</label>
                    <input id="tipo-inline-fim" type="time" className="form-input" value={tipoForm.horaFim} onChange={e => setTipoForm(f => ({ ...f, horaFim: e.target.value }))} disabled={salvandoTipo} />
                    {errosTipo.horaFim && <span className="form-error" role="alert">{errosTipo.horaFim}</span>}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalTipoAberto(false)} disabled={salvandoTipo}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvandoTipo}>
                  {salvandoTipo ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" /> Criando...</> : 'Criar e selecionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmação exclusão */}
      {confirmExcluir && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-excluir-espaco-titulo">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 id="modal-excluir-espaco-titulo">Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setConfirmExcluir(null)} aria-label="Fechar">✕</button>
            </div>
            <p style={{ color: 'var(--text)', marginBottom: '8px' }}>
              Deseja excluir o espaço <strong style={{ color: 'var(--text-bright)' }}>{confirmExcluir.descricao}</strong>?
            </p>
            {erroExcluir && <div className="alert-error" role="alert" style={{ marginTop: '12px' }}>{erroExcluir}</div>}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmExcluir(null)} disabled={excluindo}>Cancelar</button>
              <button className="btn" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={handleExcluir} disabled={excluindo}>
                {excluindo ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" /> Excluindo...</> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
