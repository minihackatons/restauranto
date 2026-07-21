import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import { OrdersListView } from '../components/OrdersListView';
import { OrdersCalendarView } from '../components/OrdersCalendarView';
import { api } from '../services/api';
import styles from './css/OrdersListPage.module.css';

const OrdersListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lista' | 'calendario'>('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDelivered, setShowDelivered] = useState(false);
  const [page, setPage] = useState(1);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['orders', page, showDelivered],
    queryFn: () => api.fetchOrders(page, showDelivered)
  });

  const orders = response?.data || (Array.isArray(response) ? response : []);
  const totalPages = response?.totalPages || 1;

  const filteredOrders = orders?.filter((order: any) => {
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
        <PageHeader title="Pedidos" />
        
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
            <>
              <OrdersListView 
                isLoading={isLoading} 
                error={error} 
                filteredOrders={filteredOrders || []} 
              />
              {!isLoading && totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    className={styles.paginationBtn}
                  >
                    Anterior
                  </button>
                  <span className={styles.paginationInfo}>
                    Página {page} de {totalPages}
                  </span>
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    className={styles.paginationBtn}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          ) : (
            <OrdersCalendarView orders={orders || []} />
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersListPage;
