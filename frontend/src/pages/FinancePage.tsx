import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { FinanceChart } from '../components/Finance/FinanceChart';
import { PeriodSummaryCard } from '../components/Finance/PeriodSummaryCard';
import { RecentTransactionsList, type Transaction } from '../components/Finance/RecentTransactionsList';
import { AddExpenseModal } from '../components/Finance/AddExpenseModal';
import { Plus } from 'lucide-react';
import styles from './css/FinancePage.module.css';
import modalStyles from '../components/css/CreateItemModal.module.css';

const formatCurrency = (val: number) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`;

const FinancePage: React.FC = () => {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const { data: financeOverview, isLoading, error, refetch } = useQuery({
    queryKey: ['financeOverview', range],
    queryFn: api.fetchFinanceOverview,
  });

  if (isLoading || error) {
    console.error(error);
  }

  let currentTransactions: Transaction[] = [];
  
  if (!isLoading){
    console.log(currentTransactions)
    currentTransactions = financeOverview.map((t: any)=> ({
      id: t.id,
      type: t.type,
      category: t.category,
      description: t.description,
      value: Number(t.value),
      createdAt: t.createdAt,
      order: {id: t.order?.id, clientName: t.order?.clientName}
    }))

    
  }
  console.log(currentTransactions)
  

  const { totalIn, totalOut, profit } = useMemo(() => {
    return currentTransactions.reduce(
      (acc, t) => {
        acc.totalIn += t.type == 'INCOME' ? t.value : 0;
        acc.totalOut +=  t.type == 'EXPENSE' ? t.value : 0;
        acc.profit =  t.type == 'EXPENSE' ? acc.profit - t.value : acc.profit + t.value;
        return acc;
      },
      { totalIn: 0, totalOut: 0, profit: 0 }
    );
  }, [currentTransactions]);

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.mainContent}>
        <PageHeader title="Financeiro" />
        
        <div className={styles.content}>
          <div className={styles.rangeSelectorContainer}>
            <span className={styles.pageTitle}>Visão Geral</span>
            <div className={styles.segmentedControl}>
              <button 
                className={`${styles.segmentBtn} ${range === 'week' ? styles.activeSegment : ''}`}
                onClick={() => setRange('week')}
              >
                Última Semana
              </button>
              <button 
                className={`${styles.segmentBtn} ${range === 'month' ? styles.activeSegment : ''}`}
                onClick={() => setRange('month')}
              >
                Último Mês
              </button>
            </div>
          </div>

          <div className={styles.dashboardTop}>
            <FinanceChart data={currentTransactions} range={range} formatCurrency={formatCurrency} />
            <PeriodSummaryCard totalIn={totalIn} totalOut={totalOut} profit={profit} formatCurrency={formatCurrency} />
          </div>

          <RecentTransactionsList transactions={currentTransactions.toReversed()} formatCurrency={formatCurrency} />
        </div>

        <button 
          className={modalStyles.inventoryFab}
          onClick={() => setIsAddExpenseModalOpen(true)}
        >
          <Plus className={modalStyles.fabIcon} />
        </button>
      </main>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onExpenseAdded={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default FinancePage;
