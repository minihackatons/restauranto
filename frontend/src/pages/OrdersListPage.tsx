import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { OrdersListView } from '../components/OrdersListView';
import { OrdersCalendarView } from '../components/OrdersCalendarView';
import { api } from '../services/api';
import styles from './css/OrdersListPage.module.css';

const OrdersListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lista' | 'calendario'>('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDelivered, setShowDelivered] = useState(false);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: api.fetchOrders
  });

  const filteredOrders = orders?.filter((order: any) => {
    if (!showDelivered && order.status === 'DELIVERED') return false;
    
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesClient = order.clientName?.toLowerCase().includes(search);
      const matchesId = order.id.toLowerCase().includes(search);
      return matchesClient || matchesId;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h1>Pedidos</h1>
          <div className={styles.headerIcons}>
            <Bell className={styles.headerIcon} />
            <Link to="/settings" style={{ color: 'inherit', display: 'flex' }}>
              <Settings className={styles.headerIcon} />
            </Link>
          </div>
        </header>
        
        <div className={styles.contentWide}>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${activeTab === 'lista' ? styles.activeSegment : ''}`}
              onClick={() => setActiveTab('lista')}
            >
              Lista de Pedidos
            </button>
            <button 
              className={`${styles.segmentBtn} ${activeTab === 'calendario' ? styles.activeSegment : ''}`}
              onClick={() => setActiveTab('calendario')}
            >
              Calendário de Pedidos
            </button>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} color="#8e8e93" />
              <input 
                type="text" 
                placeholder="Pesquisar por pedido ou cliente" 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={styles.filterBtn}>
              <SlidersHorizontal size={16} />
              Filtros
            </button>
          </div>

          <div className={styles.checkboxRow}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={showDelivered}
              onChange={(e) => setShowDelivered(e.target.checked)}
              id="showDelivered"
            />
            <label htmlFor="showDelivered" style={{cursor: 'pointer'}}>Mostrar pedidos já entregues</label>
          </div>

          {activeTab === 'lista' ? (
            <OrdersListView 
              isLoading={isLoading} 
              error={error} 
              filteredOrders={filteredOrders || []} 
            />
          ) : (
            <OrdersCalendarView orders={orders || []} />
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersListPage;
