import React, { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import styles from './css/DashboardPage.module.css';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { FunnelChart } from '../components/dashboard/FunnelChart';
import { TopItemsDoughnut } from '../components/dashboard/TopItemsDoughnut';
import { UrgentOrdersTable } from '../components/dashboard/UrgentOrdersTable';

const DashboardPage: React.FC = () => {
  const [ordersData, setOrdersData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [orders, finance] = await Promise.all([
          api.fetchOrdersDashboard(7),
          api.fetchFinanceDashboard(7)
        ]);
        setOrdersData(orders);
        setFinanceData(finance);
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className={styles.dashboardContainer}><Sidebar /><main className={styles.mainContent}>Carregando...</main></div>;

  const totalOrders = ordersData?.totalOrders || 0;
  const revenue = financeData?.revenue || 0;
  const profit = financeData?.profit || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <PageHeader title="Visão Geral da Semana" />
        <div className={styles.content}>
          <div className={styles.cardsGrid}>
            <Card 
              title="Pedidos nesta semana" 
              value={totalOrders.toString()} 
              icon={<ShoppingBag />} 
              trend="" 
              trendUp={true} 
            />
            <Card 
              title="Faturamento" 
              value={formatCurrency(revenue)} 
              icon={<DollarSign />} 
              trend="" 
              trendUp={true} 
            />
            <Card 
              title="Lucro" 
              value={formatCurrency(profit)} 
              icon={<TrendingUp />} 
              trend="" 
              trendUp={profit >= 0} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <FunnelChart 
              views={ordersData?.funnel?.views || 0} 
              clicks={ordersData?.funnel?.clicks || 0} 
              orders={totalOrders} 
            />
            <TopItemsDoughnut data={ordersData?.topItems || []} />
          </div>

          <div style={{ marginTop: '32px' }}>
            <UrgentOrdersTable orders={ordersData?.urgentOrders || []} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
