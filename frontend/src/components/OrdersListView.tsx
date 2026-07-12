import React from 'react';
import { ChevronRight, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import styles from '../pages/css/OrdersListPage.module.css';

interface OrdersListViewProps {
  isLoading: boolean;
  error: any;
  filteredOrders: any[];
}

const statusMap: Record<string, string> = {
  'PENDING': 'Pendente',
  'PREPARING': 'Preparando',
  'READY': 'Pronto',
  'DELIVERED': 'Entregue'
};

const statusColors: Record<string, { bg: string, text: string }> = {
  'PENDING': { bg: '#ff9500', text: '#fff' },
  'PREPARING': { bg: '#34c759', text: '#fff' },
  'READY': { bg: '#007aff', text: '#fff' },
  'DELIVERED': { bg: '#8e8e93', text: '#fff' }
};

export const OrdersListView: React.FC<OrdersListViewProps> = ({ isLoading, error, filteredOrders }) => {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao atualizar status do pedido');
    }
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    statusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className={styles.ordersList}>
      {isLoading && <div className={styles.emptyState}>Carregando pedidos...</div>}
      
      {error && <div className={styles.emptyState}>Erro ao carregar pedidos.</div>}

      {!isLoading && !error && filteredOrders?.length === 0 && (
        <div className={styles.emptyState}>Nenhum pedido encontrado.</div>
      )}

      <div className={styles.receiptGrid}>
        {!isLoading && filteredOrders?.map((order: any) => {
          const deliveryDateStr = order.deliveryDate ? order.deliveryDate : order.createdAt;
          const deliveryDate = new Date(deliveryDateStr);
          
          const formattedTime = deliveryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const formattedDate = deliveryDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          
          const currentStatus = order.status || 'PENDING';
          const colors = statusColors[currentStatus] || statusColors['PENDING'];
          const totalAmount = `R$ ${Number(order.totalAmount).toFixed(2).replace('.', ',')}`;
          
          const isUpdatingThisOrder = statusMutation.isPending && statusMutation.variables?.id === order.id;

          return (
            <div key={order.id} className={styles.receiptCard}>
              
              {/* Top Header */}
              <div className={styles.receiptHeader}>
                <div className={styles.receiptIdRow}>
                  <span className={styles.receiptId}>ORD. {order.id.slice(0, 3)}</span>
                  <div className={styles.statusWrapper}>
                    <div className={styles.statusIndicator} style={{ color: colors.bg }}>
                      <div className={styles.statusDot} style={{ backgroundColor: colors.bg }}></div>
                      {statusMap[currentStatus]}
                    </div>
                  </div>
                </div>
                <h3 className={styles.receiptClient}>{order.clientName || 'Cliente sem nome'}</h3>
              </div>

              {/* Items Section */}
              <div className={styles.receiptItemsSection}>
                <div className={styles.receiptItemsHeader}>
                  <span>ITENS</span>
                </div>
                
                <div className={styles.receiptItemsList}>
                  {order.items?.map((orderItem: any) => (
                    <div key={orderItem.id} className={styles.receiptItemRow}>
                      <div className={styles.receiptItemLeft}>
                        <span className={styles.receiptItemQty}>{orderItem.quantity}x</span>
                        <span className={styles.receiptItemName}>{orderItem.item?.name || 'Item'}</span>
                      </div>
                      <span className={styles.receiptItemPrice}>
                        R$ {Number(orderItem.unitPrice * orderItem.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Total */}
              <div className={styles.receiptFooter}>
                <span className={styles.receiptDue}>Para: {formattedDate}</span>
                <span className={styles.receiptTotal}>{totalAmount}</span>
              </div>

              {/* Actions and Select */}
              <div className={styles.receiptActions}>
                <select 
                  className={styles.styledSelect} 
                  aria-label="Status do pedido"
                  value={currentStatus} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={isUpdatingThisOrder}
                >
                  {Object.entries(statusMap).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <div className={styles.buttonsRow}>
                  <button className={styles.actionBtnPrimaryFlex}>
                    <Printer size={16} /> Imprimir
                  </button>
                  <Link to={`/pedido/${order.id}`} className={styles.actionBtnSecondaryFlex} style={{ textDecoration: 'none' }}>
                    Detalhes <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
