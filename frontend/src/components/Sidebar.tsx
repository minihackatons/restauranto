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
    return location.pathname === path ? styles.active : '';
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
          <Link to="/inventory" className={`${styles.navItem} ${isActive('/inventory')}`}>
            <Boxes className={styles.navIcon} />
            <span className={styles.navLabel}>Estoque</span>
          </Link>
          <Link to="/financeiro" className={`${styles.navItem} ${isActive('/financeiro')}`}>
            <CircleDollarSign className={styles.navIcon} />
            <span className={styles.navLabel}>Finanças</span>
          </Link>
        </div>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <Link to="/orders" className={styles.primaryBtn} style={{ textDecoration: 'none' }}>
          <Plus className={styles.btnIcon} size={20} />
          <span className={styles.btnText}>Registrar Pedido</span>
        </Link>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut className={styles.navIcon} size={20} />
          <span className={styles.navLabel}>Sair</span>
        </button>
      </div>
    </aside>
  );
};
