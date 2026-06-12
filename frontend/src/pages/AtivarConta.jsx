import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ativarConta } from '../api/authApi';

// Mínimo 8 caracteres contendo letras e números
const SENHA_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function AtivarConta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') ?? '';

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmacao, setErroConfirmacao] = useState('');
  const [erroGeral, setErroGeral] = useState('');

  function validar() {
    let valido = true;
    setErroSenha('');
    setErroConfirmacao('');
    setErroGeral('');

    if (!SENHA_REGEX.test(senha)) {
      setErroSenha('A senha deve ter no mínimo 8 caracteres com letras e números.');
      valido = false;
    }

    if (senha !== confirmacao) {
      setErroConfirmacao('As senhas não coincidem.');
      valido = false;
    }

    return valido;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    try {
      await ativarConta(token, senha);
      navigate('/login', {
        replace: true,
        state: { mensagemSucesso: 'Conta ativada com sucesso! Faça login para continuar.' },
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        setErroGeral('Este link é inválido ou expirou. Solicite um novo convite ao administrador.');
      } else {
        setErroGeral(err?.response?.data?.erro ?? 'Ocorreu um erro ao ativar a conta. Tente novamente.');
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
            🔐
          </div>
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'var(--text-bright)',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          Definir Senha
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>
          Crie uma senha para ativar sua conta.
        </p>

        {erroGeral && (
          <div className="alert-error" role="alert" style={{ marginBottom: '20px' }}>
            <span aria-hidden="true">⚠ </span>
            <span>{erroGeral}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="nova-senha" className="form-label">Nova senha</label>
            <input
              id="nova-senha"
              type="password"
              className="form-input"
              placeholder="Mínimo 8 caracteres com letras e números"
              value={senha}
              onChange={e => { setSenha(e.target.value); if (erroSenha) setErroSenha(''); }}
              autoComplete="new-password"
              required
              disabled={loading}
              aria-describedby={erroSenha ? 'erro-nova-senha' : undefined}
              aria-invalid={!!erroSenha}
            />
            {erroSenha && (
              <span id="erro-nova-senha" className="form-error" role="alert">{erroSenha}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmar-senha" className="form-label">Confirmar senha</label>
            <input
              id="confirmar-senha"
              type="password"
              className="form-input"
              placeholder="Repita a senha"
              value={confirmacao}
              onChange={e => { setConfirmacao(e.target.value); if (erroConfirmacao) setErroConfirmacao(''); }}
              autoComplete="new-password"
              required
              disabled={loading}
              aria-describedby={erroConfirmacao ? 'erro-confirmar-senha' : undefined}
              aria-invalid={!!erroConfirmacao}
            />
            {erroConfirmacao && (
              <span id="erro-confirmar-senha" className="form-error" role="alert">{erroConfirmacao}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !senha || !confirmacao}
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{ width: '18px', height: '18px', borderWidth: '2px' }}
                  role="status"
                  aria-label="Ativando conta"
                />
                <span>Ativando...</span>
              </>
            ) : (
              'Ativar conta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
