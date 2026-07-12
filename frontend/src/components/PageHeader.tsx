import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './css/PageHeader.module.css';

interface PageHeaderProps {
  title?: React.ReactNode;
  showDefaultIcons?: boolean;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showDefaultIcons = true, 
  rightContent,
  leftContent
}) => {
  return (
    <header className={styles.topHeader}>
      {leftContent ? leftContent : <h1>{title}</h1>}
      
      <div className={styles.headerIcons}>
        {rightContent}
        {showDefaultIcons && (
          <>
            <Bell className={styles.headerIcon} size={24} />
            <Link to="/settings" style={{ color: 'inherit', display: 'flex' }}>
              <Settings className={styles.headerIcon} size={24} />
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
