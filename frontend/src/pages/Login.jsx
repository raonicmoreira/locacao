import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import {
  setToken,
  setNome,
  setEmpresa,
  setPerfil,
  setEmpresasPendentes,
  decodeToken,
} from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const data = await login(email, senha);

      setToken(data.token);
      setNome(data.nome);

      // Extrai o perfil do payload JWT
      const payload = decodeToken();
      if (payload && payload.perfil) {
        setPerfil(payload.perfil);
      }

      const empresas = data.empresas ?? [];

      if (empresas.length === 1) {
        setEmpresa(empresas[0]);
        navigate('/grupos', { replace: true });
      } else {
        setEmpresasPendentes(empresas);
        navigate('/selecionar-empresa', { replace: true });
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setErro('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else if (status >= 500 || !err.response) {
        setErro('Serviço de autenticação temporariamente indisponível. Tente novamente em instantes.');
      } else {
        setErro(err?.response?.data?.erro ?? 'Ocorreu um erro ao tentar fazer login.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
          aria-hidden="true"
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6B09AC, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🏢
          </div>
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'var(--text-bright)',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Entrar
        </h1>

        {erro && (
          <div className="alert-error" role="alert" style={{ marginBottom: '20px' }}>
            <span aria-hidden="true">⚠ </span>
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha" className="form-label">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !email || !senha}
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{ width: '18px', height: '18px', borderWidth: '2px' }}
                  role="status"
                  aria-label="Carregando"
                />
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
