import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './css/UrgentOrdersTable.module.css';

interface Order {
  id: string;
  clientName: string;
  totalAmount: string;
  status: string;
  deliveryDate?: string;
  items: { quantity: number; item: { name: string } }[];
}

interface UrgentOrdersProps {
  orders: Order[];
}

export const UrgentOrdersTable: React.FC<UrgentOrdersProps> = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Pedidos Mais Urgentes</h3>
      </div>
      
      {orders.length === 0 ? (
        <p className={styles.empty}>Nenhum pedido urgente no momento.</p>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            const itemsCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
            return (
              <div 
                key={order.id} 
                className={styles.orderRow} 
                onClick={() => navigate(`/pedido/${order.id}`)}
              >
                <div className={styles.orderInfo}>
                  <span className={styles.client}>{order.clientName || 'Sem nome'}</span>
                  <span className={styles.details}>
                    {itemsCount} iten(s) • R$ {order.totalAmount}
                    {order.deliveryDate && ` • Entrega: ${new Date(order.deliveryDate).toLocaleDateString('pt-BR')} às ${new Date(order.deliveryDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`}
                  </span>
                </div>
                <div className={styles.orderStatus}>
                  <span className={styles.statusBadge}>{order.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className={styles.footer}>
        <Link to="/orders" className={styles.link}>Ver mais pedidos &rarr;</Link>
      </div>
    </div>
  );
};
