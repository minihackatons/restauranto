import React from 'react';
import styles from '../../pages/css/FinancePage.module.css';

export interface Transaction {
  id: number;
  description: string;
  createdAt: string;
  value: number;
  order?: {id: string, clientName: string};
  category: string;
  type: 'INCOME' | 'EXPENSE';
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
}

export const RecentTransactionsList = ({ transactions, formatCurrency }: RecentTransactionsListProps) => {

  const formatDate = (dateString: string) => {
    let dateFromStr = new Date(dateString);

    let localTimeStr = dateFromStr.toLocaleTimeString('pt-BR');
    let localDateStr = dateFromStr.toLocaleDateString('pt-BR');

    return localDateStr + " " + localTimeStr;
  }

  return (
    <div className={styles.transactionsSection}>
      <div className={styles.sectionTitle}>Movimentações Recentes do Caixa</div>
      <div className={styles.transactionList}>
        {(!transactions || transactions.length === 0) ? (
          <div style={{ color: '#8e8e93', padding: '16px 0' }}>
            Nenhuma movimentação encontrada.
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className={styles.transactionItem}>
              <div className={styles.transactionLeft}>
                {(tx.description != null && tx.category == 'OTHER') &&
                  <span className={styles.transactionName}>{tx.description}</span>
                }
                {
                  (tx.description == null && tx.category == 'ORDER') &&
                  <div>
                    <span className={styles.transactionName}>Pedido | {tx.order?.clientName} </span><br></br>
                    <span className={styles.transactionDate}>#{tx.order?.id}</span>
                  </div>
                  
                }
                {
                  (tx.category == 'STOCK') &&
                  <span className={styles.transactionName}>Estoque | {tx.description}</span>
                }
                
                <span className={styles.transactionDate}>{formatDate(tx.createdAt)}</span>
              </div>
              <div className={`${styles.transactionAmount} ${tx.type === 'INCOME' ? styles.amountIn : styles.amountOut}`}>
                {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.value)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
