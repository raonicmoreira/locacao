import { useState, useEffect } from 'react';
import {
  listarTiposLocacao,
  criarTipoLocacao,
  atualizarTipoLocacao,
  excluirTipoLocacao,
} from '../api/tipoLocacaoApi.js';
import { DIAS_SEMANA, toBitmask, fromBitmask, formatDias } from '../utils/bitmask.js';

const MODALIDADES = [
  { value: 0, label: 'Por mês' },
  { value: 1, label: 'Por dia' },
  { value: 2, label: 'Por hora' },
];

function StatusBadge({ status }) {
  return status === 1
    ? <span className="badge-green">Ativo</span>
    : <span className="badge-red">Inativo</span>;
}

const FORM_VAZIO = {
  descricao: '',
  modalidadeLocacao: 0,
  diasSemana: [],   // array de bits ativos
  horaInicio: '',
  horaFim: '',
  status: 1,
};

export default function TiposLocacao() {
  const [tipos, setTipos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');
  const [erros, setErros] = useState({});

  const [confirmExcluir, setConfirmExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');

  async function carregar() {
    setCarregando(true);
    setErroLista('');
    try {
      setTipos(await listarTiposLocacao());
    } catch {
      setErroLista('Não foi possível carregar os tipos de locação.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErros({});
    setErroModal('');
    setModalAberto(true);
  }

  function abrirEditar(tipo) {
    setEditando(tipo);
    setForm({
      descricao: tipo.descricao,
      modalidadeLocacao: tipo.modalidadeLocacao,
      diasSemana: fromBitmask(tipo.diasSemana),
      horaInicio: tipo.horaInicio ?? '',
      horaFim: tipo.horaFim ?? '',
      status: tipo.status,
    });
    setErros({});
    setErroModal('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  function toggleDia(bit) {
    setForm(f => ({
      ...f,
      diasSemana: f.diasSemana.includes(bit)
        ? f.diasSemana.filter(b => b !== bit)
        : [...f.diasSemana, bit],
    }));
  }

  function validar() {
    const e = {};
    if (!form.descricao.trim()) e.descricao = 'Descrição é obrigatória.';
    if (form.modalidadeLocacao === null || form.modalidadeLocacao === undefined) {
      e.modalidadeLocacao = 'Modalidade é obrigatória.';
    }
    if (form.modalidadeLocacao === 1 || form.modalidadeLocacao === 2) {
      if (form.diasSemana.length === 0) e.diasSemana = 'Selecione ao menos um dia da semana.';
    }
    if (form.modalidadeLocacao === 2) {
      if (!form.horaInicio) e.horaInicio = 'Horário de início é obrigatório.';
      if (!form.horaFim) e.horaFim = 'Horário de fim é obrigatório.';
    }
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!validar()) return;

    const payload = {
      descricao: form.descricao,
      modalidadeLocacao: form.modalidadeLocacao,
      diasSemana: (form.modalidadeLocacao === 1 || form.modalidadeLocacao === 2)
        ? toBitmask(form.diasSemana)
        : null,
      horaInicio: form.modalidadeLocacao === 2 ? form.horaInicio : null,
      horaFim: form.modalidadeLocacao === 2 ? form.horaFim : null,
      status: form.status,
    };

    setSalvando(true);
    setErroModal('');
    try {
      if (editando) {
        await atualizarTipoLocacao(editando.id, payload);
      } else {
        await criarTipoLocacao(payload);
      }
      await carregar();
      fecharModal();
    } catch (err) {
      setErroModal(err?.response?.data?.erro ?? 'Erro ao salvar tipo de locação.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!confirmExcluir) return;
    setExcluindo(true);
    setErroExcluir('');
    try {
      await excluirTipoLocacao(confirmExcluir.id);
      await carregar();
      setConfirmExcluir(null);
    } catch (err) {
      setErroExcluir(err?.response?.data?.erro ?? 'Erro ao excluir tipo de locação.');
    } finally {
      setExcluindo(false);
    }
  }

  const mostrarDias = form.modalidadeLocacao === 1 || form.modalidadeLocacao === 2;
  const mostrarHorarios = form.modalidadeLocacao === 2;

  return (
    <div>
      <div className="page-header">
        <h1>Tipos de Locação</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Tipo</button>
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
                  <th>Descrição</th>
                  <th>Modalidade</th>
                  <th>Dias</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th style={{ width: '140px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tipos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                      Nenhum tipo de locação cadastrado.
                    </td>
                  </tr>
                ) : (
                  tipos.map(t => (
                    <tr key={t.id} style={{ opacity: t.status === 0 ? 0.55 : 1 }}>
                      <td>{t.descricao}</td>
                      <td>{MODALIDADES.find(m => m.value === t.modalidadeLocacao)?.label ?? '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDias(t.diasSemana)}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {t.horaInicio && t.horaFim ? `${t.horaInicio} – ${t.horaFim}` : '—'}
                      </td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.85rem' }}
                            onClick={() => abrirEditar(t)}
                          >Editar</button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)' }}
                            onClick={() => { setErroExcluir(''); setConfirmExcluir(t); }}
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

      {/* Modal cadastro/edição */}
      {modalAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-tipo-titulo">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 id="modal-tipo-titulo">{editando ? 'Editar Tipo de Locação' : 'Novo Tipo de Locação'}</h2>
              <button className="modal-close" onClick={fecharModal} aria-label="Fechar modal">✕</button>
            </div>

            {erroModal && <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>{erroModal}</div>}

            <form onSubmit={handleSalvar} noValidate>
              {/* Descrição */}
              <div className="form-group">
                <label htmlFor="tipo-descricao" className="form-label">Descrição</label>
                <input
                  id="tipo-descricao"
                  type="text"
                  className="form-input"
                  value={form.descricao}
                  onChange={e => { setForm(f => ({ ...f, descricao: e.target.value })); setErros(v => ({ ...v, descricao: '' })); }}
                  disabled={salvando}
                  aria-invalid={!!erros.descricao}
                />
                {erros.descricao && <span className="form-error" role="alert">{erros.descricao}</span>}
              </div>

              {/* Modalidade */}
              <div className="form-group">
                <label htmlFor="tipo-modalidade" className="form-label">Modalidade</label>
                <select
                  id="tipo-modalidade"
                  className="form-input"
                  value={form.modalidadeLocacao}
                  onChange={e => setForm(f => ({ ...f, modalidadeLocacao: Number(e.target.value), diasSemana: [], horaInicio: '', horaFim: '' }))}
                  disabled={salvando}
                >
                  {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              {/* Dias da semana — DIA ou HORA */}
              {mostrarDias && (
                <div className="form-group">
                  <span className="form-label" id="dias-label">Dias da semana</span>
                  <div
                    role="group"
                    aria-labelledby="dias-label"
                    style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}
                  >
                    {DIAS_SEMANA.map(dia => {
                      const ativo = form.diasSemana.includes(dia.bit);
                      return (
                        <button
                          key={dia.bit}
                          type="button"
                          onClick={() => toggleDia(dia.bit)}
                          disabled={salvando}
                          aria-pressed={ativo}
                          style={{
                            minWidth: '44px',
                            minHeight: '44px',
                            borderRadius: '8px',
                            border: `1px solid ${ativo ? 'var(--primary)' : 'var(--border)'}`,
                            background: ativo ? 'rgba(107,9,172,0.2)' : 'var(--bg-card)',
                            color: ativo ? 'var(--text-bright)' : 'var(--text-muted)',
                            fontWeight: ativo ? '700' : '400',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.15s',
                          }}
                        >
                          {dia.label}
                        </button>
                      );
                    })}
                  </div>
                  {erros.diasSemana && <span className="form-error" role="alert">{erros.diasSemana}</span>}
                </div>
              )}

              {/* Horários — somente HORA */}
              {mostrarHorarios && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="tipo-hora-inicio" className="form-label">Início</label>
                    <input
                      id="tipo-hora-inicio"
                      type="time"
                      className="form-input"
                      value={form.horaInicio}
                      onChange={e => { setForm(f => ({ ...f, horaInicio: e.target.value })); setErros(v => ({ ...v, horaInicio: '' })); }}
                      disabled={salvando}
                      aria-invalid={!!erros.horaInicio}
                    />
                    {erros.horaInicio && <span className="form-error" role="alert">{erros.horaInicio}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="tipo-hora-fim" className="form-label">Fim</label>
                    <input
                      id="tipo-hora-fim"
                      type="time"
                      className="form-input"
                      value={form.horaFim}
                      onChange={e => { setForm(f => ({ ...f, horaFim: e.target.value })); setErros(v => ({ ...v, horaFim: '' })); }}
                      disabled={salvando}
                      aria-invalid={!!erros.horaFim}
                    />
                    {erros.horaFim && <span className="form-error" role="alert">{erros.horaFim}</span>}
                  </div>
                </div>
              )}

              {/* Status — só em edição */}
              {editando && (
                <div className="form-group">
                  <label htmlFor="tipo-status" className="form-label">Status</label>
                  <select
                    id="tipo-status"
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
                <button type="button" className="btn btn-outline" onClick={fecharModal} disabled={salvando}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? (
                    <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" /> Salvando...</>
                  ) : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmação exclusão */}
      {confirmExcluir && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-excluir-tipo-titulo">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 id="modal-excluir-tipo-titulo">Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setConfirmExcluir(null)} aria-label="Fechar">✕</button>
            </div>
            <p style={{ color: 'var(--text)', marginBottom: '8px' }}>
              Deseja excluir o tipo <strong style={{ color: 'var(--text-bright)' }}>{confirmExcluir.descricao}</strong>?
            </p>
            {erroExcluir && <div className="alert-error" role="alert" style={{ marginTop: '12px' }}>{erroExcluir}</div>}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmExcluir(null)} disabled={excluindo}>Cancelar</button>
              <button
                className="btn"
                style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
                onClick={handleExcluir}
                disabled={excluindo}
              >
                {excluindo ? <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true" /> Excluindo...</> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
