import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import NavbarMobile from './NavbarMobile.jsx';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <NavbarMobile
        onOpenSidebar={() => setSidebarOpen(true)}
        isOpen={sidebarOpen}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      <main
        className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
        id="main-content"
      >
        {children}
      </main>
    </>
  );
}
