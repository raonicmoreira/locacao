export default function NavbarMobile({ onOpenSidebar, isOpen }) {
  return (
    <header className="navbar-mobile">
      <div className="navbar-logo" aria-label="Locações de Espaço">
        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-bright)' }}>
          🏢 Locações
        </span>
      </div>

      <button
        className="hamburger-btn"
        onClick={onOpenSidebar}
        aria-label="Abrir menu"
        aria-expanded={isOpen}
        aria-controls="sidebar-nav"
      >
        ☰
      </button>
    </header>
  );
}
