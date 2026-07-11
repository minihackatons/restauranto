import React from 'react';
import styles from './css/FunnelChart.module.css';

interface FunnelProps {
  views: number;
  clicks: number;
  orders: number;
}

export const FunnelChart: React.FC<FunnelProps> = ({ views, clicks, orders }) => {
  // Calculate widths relative to views (100%)
  const max = Math.max(views, 1);
  const clicksWidth = Math.max((clicks / max) * 100, 10);
  const ordersWidth = Math.max((orders / max) * 100, 10);

  return (
    <div className={styles.funnelContainer}>
      <h3 className={styles.title}>Funil de Vendas</h3>
      
      <div className={styles.funnelStage}>
        <div className={styles.barWrapper}>
          <div className={styles.bar} style={{ width: '100%', backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
            <span className={styles.label}>Acessos</span>
            <span className={styles.value}>{views}</span>
          </div>
        </div>
      </div>

      <div className={styles.funnelStage}>
        <div className={styles.barWrapper}>
          <div className={styles.bar} style={{ width: `${clicksWidth}%`, backgroundColor: 'rgba(99, 102, 241, 0.5)' }}>
            <span className={styles.label}>Cliques</span>
            <span className={styles.value}>{clicks}</span>
          </div>
        </div>
      </div>

      <div className={styles.funnelStage}>
        <div className={styles.barWrapper}>
          <div className={styles.bar} style={{ width: `${ordersWidth}%`, backgroundColor: '#6366f1' }}>
            <span className={styles.label}>Pedidos</span>
            <span className={styles.value}>{orders}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
