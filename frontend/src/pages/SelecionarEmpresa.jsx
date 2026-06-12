import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEmpresasPendentes,
  clearEmpresasPendentes,
  setEmpresa,
  setPerfil,
  decodeToken,
} from '../utils/auth';

export default function SelecionarEmpresa() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [selecionando, setSelecionando] = useState(null);

  useEffect(() => {
    setEmpresas(getEmpresasPendentes());
  }, []);

  function handleSelecionarEmpresa(empresa) {
    setSelecionando(empresa.id);
    setEmpresa(empresa);

    const payload = decodeToken();
    if (payload && payload.perfil) {
      setPerfil(payload.perfil);
    }

    clearEmpresasPendentes();
    navigate('/grupos', { replace: true });
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-bright)' }}>
            Selecionar Empresa
          </h1>
        </div>

        {empresas.length === 0 ? (
          <div className="alert-info" role="status">
            <span aria-hidden="true">ℹ </span>
            <span>Nenhuma empresa associada ao seu cadastro.</span>
          </div>
        ) : (
          <ul
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}
            aria-label="Lista de empresas disponíveis"
          >
            {empresas.map(empresa => (
              <li key={empresa.id}>
                <button
                  onClick={() => handleSelecionarEmpresa(empresa)}
                  disabled={selecionando !== null}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: selecionando !== null ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    minHeight: '44px',
                    opacity: selecionando !== null && selecionando !== empresa.id ? 0.5 : 1,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  aria-label={`Selecionar empresa ${empresa.descricao}`}
                >
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-bright)' }}>
                    {empresa.descricao}
                  </span>
                  {selecionando === empresa.id ? (
                    <span
                      className="spinner"
                      style={{ width: '18px', height: '18px', borderWidth: '2px', flexShrink: 0 }}
                      role="status"
                      aria-label="Selecionando..."
                    />
                  ) : (
                    <span aria-hidden="true" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
