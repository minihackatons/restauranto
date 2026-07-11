import React, { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, TrendingUp, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './css/DashboardPage.module.css';
import { Sidebar } from '../components/Sidebar';
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

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h1>Visão Geral da Semana</h1>
          <div className={styles.headerIcons}>
            <Bell className={styles.headerIcon} />
            <Link to="/settings" style={{ color: 'inherit', display: 'flex' }}>
              <Settings className={styles.headerIcon} />
            </Link>
          </div>
        </header>
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
              value={`R$ ${revenue.toFixed(2).replace('.', ',')}`} 
              icon={<DollarSign />} 
              trend="" 
              trendUp={true} 
            />
            <Card 
              title="Lucro" 
              value={`R$ ${profit.toFixed(2).replace('.', ',')}`} 
              icon={<TrendingUp />} 
              trend="" 
              trendUp={profit >= 0} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <FunnelChart 
              views={ordersData?.funnel?.views || 1250} 
              clicks={ordersData?.funnel?.clicks || 430} 
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
