import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ChevronRight, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
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

  const getBorderColor = (index: number) => {
    const colors = ['#f5c542', '#42b6f5', '#4cd964'];
    return colors[index % colors.length];
  };

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
        
        <div className={styles.content}>
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

          <div className={styles.ordersList}>
            {isLoading && <div className={styles.emptyState}>Carregando pedidos...</div>}
            
            {error && <div className={styles.emptyState}>Erro ao carregar pedidos.</div>}

            {!isLoading && !error && filteredOrders?.length === 0 && (
              <div className={styles.emptyState}>Nenhum pedido encontrado.</div>
            )}

            {!isLoading && filteredOrders?.map((order: any, index: number) => {
              const deliveryDateStr = order.deliveryDate ? order.deliveryDate : order.createdAt;
              const deliveryDate = new Date(deliveryDateStr);
              
              // Native JS Date formatting
              const formattedTime = deliveryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const formattedDate = deliveryDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              
              return (
                <div key={order.id} className={styles.orderCard} style={{ borderTopColor: getBorderColor(index) }}>
                  <div className={styles.orderHeader}>
                    <div className={styles.clientInfo}>
                      <span className={styles.clientName}>{order.clientName || 'Cliente sem nome'}</span>
                      {order.channel === 'ifood' && <span className={styles.urgentBadge} style={{backgroundColor: '#ea1d2c'}}>iFood</span>}
                      {/* Example of urgent badge condition, could be based on time */}
                      {index === 0 && <span className={styles.urgentBadge}>! Urgente</span>}
                    </div>
                    <div className={styles.timeInfo}>
                      <span className={styles.timeText}>{formattedTime}</span>
                      <span className={styles.dateText}>{formattedDate}</span>
                    </div>
                  </div>

                  <div className={styles.itemsList}>
                    {order.items?.map((orderItem: any) => (
                      <div key={orderItem.id} className={styles.orderItemLine}>
                        <span className={styles.itemQty}>{orderItem.quantity}x</span>
                        <span>{orderItem.item?.name || 'Item'}</span>
                      </div>
                    ))}
                  </div>

                  {order.deliveryAddress && (
                    <div className={styles.observationBox}>
                      Endereço: {order.deliveryAddress}
                    </div>
                  )}

                  <div className={styles.orderFooter}>
                    <span className={styles.totalAmount}>R$ {Number(order.totalAmount).toFixed(2).replace('.', ',')}</span>
                    <button className={styles.detailsBtn}>
                      Mais Detalhes <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersListPage;
