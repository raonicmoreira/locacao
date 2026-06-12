import { NavLink } from 'react-router-dom';
import { getPerfil } from '../utils/auth';

const NAV_ITEMS = [
  { label: 'Usuários', icon: '👥', path: '/usuarios', perfis: ['PROPRIETARIO'] },
  { label: 'Grupos', icon: '📁', path: '/grupos', perfis: ['PROPRIETARIO'] },
  { label: 'Tipos de Locação', icon: '📋', path: '/tipos-locacao', perfis: ['PROPRIETARIO'] },
  { label: 'Espaços', icon: '🏢', path: '/espacos', perfis: ['PROPRIETARIO'] },
];

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const perfil = getPerfil();
  const itensVisiveis = NAV_ITEMS.filter(item => item.perfis.includes(perfil));

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay${isOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <nav
        className={`sidebar${isCollapsed ? ' sidebar-collapsed' : ''}${isOpen ? ' sidebar-open' : ''}`}
        aria-label="Menu principal"
        role="navigation"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0 }}>🏢</span>
            {!isCollapsed && (
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'var(--text-bright)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Locações
              </span>
            )}
          </div>
        </div>

        {/* Navegação */}
        <div className="sidebar-nav">
          {itensVisiveis.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Botão de colapso (desktop) */}
        <div className="sidebar-footer">
          <button
            className="collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            <span className="nav-icon" aria-hidden="true">
              {isCollapsed ? '→' : '←'}
            </span>
            <span className="nav-label">Recolher</span>
          </button>
        </div>
      </nav>
    </>
  );
}
