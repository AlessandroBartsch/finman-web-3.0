import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  House, 
  People, 
  FileText, 
  BarChart, 
  Folder2Open,
  List,
  Building
} from 'react-bootstrap-icons';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: House },
    { name: 'Clientes', href: '/users', icon: People },
    { name: 'Empréstimos', href: '/loans', icon: FileText },
    { name: 'Parcelas', href: '/installments', icon: BarChart },
    { name: 'Documentos', href: '/documents', icon: Folder2Open },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <div 
        className={`bg-dark text-white d-flex flex-column ${sidebarOpen ? 'd-block' : 'd-none'} d-lg-block`} 
        style={{ width: '250px', height: '100vh' }}
      >
        <div className="d-flex align-items-center p-3 border-bottom border-secondary">
          <Building className="fs-4 me-2" />
          <span className="fs-4">FinMan 3.0</span>
        </div>
        
        <nav className="nav flex-column p-3 flex-grow-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link text-white mb-1 rounded ${isActive(item.href) ? 'bg-primary' : 'hover-bg-secondary'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="me-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-top border-secondary">
          <small className="text-muted d-block text-center">Sistema de Gerenciamento Financeiro</small>
          <small className="text-muted d-block text-center">{new Date().toLocaleDateString('pt-BR')}</small>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Top navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
          <div className="container-fluid">
            <button
              className="navbar-toggler d-lg-none"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List />
            </button>
            <span className="navbar-brand mb-0 h1">FinMan</span>
            <div className="navbar-nav ms-auto">
              <span className="navbar-text">
                Bem-vindo ao FinMan
              </span>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{zIndex: 1040}}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
