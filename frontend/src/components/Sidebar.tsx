import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Boxes, CircleDollarSign, LogOut } from 'lucide-react';
import styles from './css/Sidebar.module.css';
import logoSvg from '../assets/logo.svg';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return styles.active;
    if (path === '/inventory' && location.pathname === '/inventory') return styles.active;
    if (path === '/orders' && location.pathname === '/orders') return styles.active;
    return '';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.workspaceInfo}>
          <img src={logoSvg} alt="Restauranto Logo" className={styles.workspaceIcon} />
          <span className={styles.workspaceName}>Restauranto</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <span className={styles.sectionTitle}>Principal</span>
          <Link to="/dashboard" className={`${styles.navItem} ${isActive('/dashboard')}`}>
            <Home className={styles.navIcon} />
            <span className={styles.navLabel}>Geral</span>
          </Link>
          <Link to="/orders-list" className={`${styles.navItem} ${isActive('/orders-list')}`}>
            <Package className={styles.navIcon} />
            <span className={styles.navLabel}>Pedidos</span>
          </Link>
          
          <Link to="/orders" className={styles.fabBtn}>
            <div className={styles.fabIconWrapper}>
              <Plus className={styles.fabIcon} />
            </div>
            <span className={styles.navLabel + ' ' + styles.mobileHidden}>Adicionar</span>
          </Link>
          
         <div className={styles.navGroup}>
          <Link to="/inventory" className={`${styles.navItem} ${isActive('/inventory')}`}>
            <Boxes className={styles.navIcon} />
            <span className={styles.navLabel}>Inventário</span>
          </Link>
          <Link to="/financeiro" className={`${styles.navItem} ${isActive('/financeiro')}`}>
            <CircleDollarSign className={styles.navIcon} />
            <span className={styles.navLabel}>Financeiro</span>
          </Link>
        </div>
        </div>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut className={styles.navIcon} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
