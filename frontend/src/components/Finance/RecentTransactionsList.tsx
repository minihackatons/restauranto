import styles from '../../pages/css/FinancePage.module.css';
import { ShoppingBag, Archive, ReceiptText } from 'lucide-react';

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
    let day = dateFromStr.getDate().toString().padStart(2, '0');
    let month = (dateFromStr.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
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
          transactions.map(tx => {
            let Icon = ReceiptText;
            let title = tx.description;
            let subtitle = null;
            let isExpense = tx.type === 'EXPENSE';

            if (tx.category === 'ORDER') {
              Icon = ShoppingBag;
              title = `Pedido | ${tx.order?.clientName || 'Sem nome'}`;
              if (tx.order?.id) {
                subtitle = `#${tx.order.id.substring(0, 8)}`;
              }
            } else if (tx.category === 'STOCK') {
              Icon = Archive;
              title = `Estoque | ${tx.description}`;
            } else {
              title = `Outros | ${tx.description}`;
            }

            return (
              <div key={tx.id} className={styles.transactionItem}>
                <div className={styles.transactionLeft}>
                  <div className={styles.iconWrapper}>
                    <Icon size={24} color="#fff" />
                  </div>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionName}>{title}</span>
                    {subtitle && <span className={styles.transactionDate}>{subtitle}</span>}
                  </div>
                </div>
                <div className={styles.transactionRight}>
                  <div className={`${styles.transactionAmount} ${isExpense ? styles.amountOut : styles.amountIn}`}>
                    {isExpense ? '-' : ''} {formatCurrency(tx.value)}
                  </div>
                  <span className={styles.transactionDate}>{formatDate(tx.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
