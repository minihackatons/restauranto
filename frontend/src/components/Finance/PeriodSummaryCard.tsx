import React from 'react';
import styles from '../../pages/css/FinancePage.module.css';

interface PeriodSummaryCardProps {
  totalIn: number;
  totalOut: number;
  profit: number;
  formatCurrency: (val: number) => string;
}

export const PeriodSummaryCard = ({ totalIn, totalOut, profit, formatCurrency }: PeriodSummaryCardProps) => {
  return (
    <div className={styles.profitCard}>
      <div className={styles.profitTitle}>Resumo do Período</div>
      <div>
        <div className={styles.profitStat}>
          <div className={styles.statLabel}>Tudo que entrou (Receitas)</div>
          <div className={`${styles.statValue} ${styles.green}`}>
            {formatCurrency(totalIn)}
          </div>
        </div>
        <div className={styles.profitStat}>
          <div className={styles.statLabel}>Tudo que saiu (Despesas)</div>
          <div className={`${styles.statValue} ${styles.red}`}>
            {formatCurrency(totalOut)}
          </div>
        </div>
        <div className={styles.profitTotal}>
          <div className={styles.statLabel}>O que sobrou (Saldo Final)</div>
          <div className={`${styles.statValue} ${profit >= 0 ? styles.green : styles.red}`}>
            {formatCurrency(profit)}
          </div>
        </div>
      </div>
    </div>
  );
};
