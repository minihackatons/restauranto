import React from 'react';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import styles from './css/StockAlerts.module.css';

export interface LowStockItemAlert {
  id: number;
  name: string;
  stockAmount: number;
  maxStock: number;
  measureUnit: string;
  percentage: number;
}

export interface ExpiringStockItemAlert {
  id: number;
  name: string;
  expirationDate: string;
  daysUntilExpiry: number;
}

export interface StockAlertsData {
  lowStock: LowStockItemAlert[];
  expiringSoon: ExpiringStockItemAlert[];
  totalAlerts: number;
}

interface StockAlertsProps {
  alerts: StockAlertsData | null;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ alerts }) => {
  if (!alerts || alerts.totalAlerts === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanDate = dateStr.substring(0, 10);
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className={styles.alertsContainer}>
      <div className={styles.alertsHeader}>
        <div className={styles.titleGroup}>
          <AlertTriangle className={styles.headerIcon} />
          <span className={styles.title}>Alertas de Estoque</span>
        </div>
        <span className={styles.totalBadge}>
          {alerts.totalAlerts} {alerts.totalAlerts === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>

      <div className={styles.sectionsGrid}>
        {alerts.lowStock.length > 0 && (
          <div className={styles.alertSection}>
            <span className={`${styles.sectionTitle} ${styles.sectionTitleLowStock}`}>
              <TrendingDown size={14} /> Estoque Baixo ({alerts.lowStock.length})
            </span>
            <div className={styles.cardsList}>
              {alerts.lowStock.map(item => (
                <div key={`low-${item.id}`} className={`${styles.alertCard} ${styles.lowStockCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={`${styles.itemBadge} ${styles.badgeWarning}`}>
                      {item.percentage}% restante
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.stockDetailText}>
                      Resta: <strong>{item.stockAmount} {item.measureUnit}</strong> (Máx: {item.maxStock} {item.measureUnit})
                    </span>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${Math.min(Math.max(item.percentage, 5), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {alerts.expiringSoon.length > 0 && (
          <div className={styles.alertSection}>
            <span className={`${styles.sectionTitle} ${styles.sectionTitleExpiring}`}>
              <Clock size={14} /> Vencimento Próximo ({alerts.expiringSoon.length})
            </span>
            <div className={styles.cardsList}>
              {alerts.expiringSoon.map(item => {
                const isExpired = item.daysUntilExpiry < 0;
                const isToday = item.daysUntilExpiry === 0;

                return (
                  <div
                    key={`exp-${item.id}`}
                    className={`${styles.alertCard} ${styles.expiringCard} ${
                      isExpired ? styles.expiredCard : ''
                    }`}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span
                        className={`${styles.itemBadge} ${
                          isExpired
                            ? styles.badgeExpired
                            : styles.badgeDanger
                        }`}
                      >
                        {isExpired
                          ? 'VENCIDO'
                          : isToday
                          ? 'Vence Hoje!'
                          : `Vence em ${item.daysUntilExpiry} ${
                              item.daysUntilExpiry === 1 ? 'dia' : 'dias'
                            }`}
                      </span>
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.expiryDateText}>
                        Data de validade: <strong>{formatDate(item.expirationDate)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
