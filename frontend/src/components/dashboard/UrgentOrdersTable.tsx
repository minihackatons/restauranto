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

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': 'Pendente',
    'PREPARING': 'Preparando',
    'READY': 'Pronto',
    'DELIVERED': 'Entregue',
    'CANCELLED': 'Cancelado',
  };
  return map[status.toUpperCase()] || status;
};

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
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Entrega</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemsCount = order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
                return (
                  <tr 
                    key={order.id} 
                    className={styles.orderRow} 
                    onClick={() => navigate(`/pedido/${order.id}`)}
                  >
                    <td className={styles.client}>{order.clientName || 'Sem nome'}</td>
                    <td className={styles.details}>{itemsCount} iten(s)</td>
                    <td className={styles.details}>R$ {order.totalAmount}</td>
                    <td className={styles.details}>
                      {order.deliveryDate ? (
                        <>
                          {new Date(order.deliveryDate).toLocaleDateString('pt-BR')} às {new Date(order.deliveryDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>{translateStatus(order.status)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.footer}>
        <Link to="/pedidos" className={styles.link}>Ver mais pedidos &rarr;</Link>
      </div>
    </div>
  );
};
