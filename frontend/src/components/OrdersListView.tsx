import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from '../pages/css/OrdersListPage.module.css';

interface OrdersListViewProps {
  isLoading: boolean;
  error: any;
  filteredOrders: any[];
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({ isLoading, error, filteredOrders }) => {
  const getBorderColor = (index: number) => {
    const colors = ['#f5c542', '#42b6f5', '#4cd964'];
    return colors[index % colors.length];
  };

  return (
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
  );
};
