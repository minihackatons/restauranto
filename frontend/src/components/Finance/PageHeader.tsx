import { Bell, Search, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../../pages/css/FinancePage.module.css';

export const PageHeader = () => {
  return (
    <header className={styles.topHeader}>
      <h1>Financeiro</h1>
      <div className={styles.headerIcons}>
        <Bell className={styles.headerIcon} />
        <Link to="/settings" style={{ color: 'inherit', display: 'flex' }}>
          <Settings className={styles.headerIcon} />
        </Link>
      </div>
    </header>
  );
};
