import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Boxes, CircleDollarSign, LogOut, Megaphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import styles from './css/Sidebar.module.css';
import logoSvg from '../assets/logo.svg';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: alertsData } = useQuery({
    queryKey: ['stockAlerts'],
    queryFn: api.fetchStockAlerts,
    refetchInterval: 60000,
  });

  const totalAlerts = alertsData?.totalAlerts || 0;

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
          <Link to="/pedidos" className={`${styles.navItem} ${isActive('/pedidos')}`}>
            <Package className={styles.navIcon} />
            <span className={styles.navLabel}>Pedidos</span>
          </Link>
          <Link to="/inventario" className={`${styles.navItem} ${isActive('/inventario')}`}>
            <div className={styles.iconBadgeWrapper}>
              <Boxes className={styles.navIcon} />
              {totalAlerts > 0 && (
                <span className={styles.alertBadge}>
                  {totalAlerts > 99 ? '99+' : totalAlerts}
                </span>
              )}
            </div>
            <span className={styles.navLabel}>Inventário</span>
          </Link>
          <Link to="/financeiro" className={`${styles.navItem} ${isActive('/financeiro')}`}>
            <CircleDollarSign className={styles.navIcon} />
            <span className={styles.navLabel}>Finanças</span>
          </Link>
        </div>

        <div className={`${styles.navSection} ${styles.advancedSection}`}>
          <span className={styles.sectionTitle}>Avançado</span>
          <Link to="/marketing" className={`${styles.navItem} ${isActive('/marketing')}`}>
            <Megaphone className={styles.navIcon} />
            <span className={styles.navLabel}>Marketing</span>
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
