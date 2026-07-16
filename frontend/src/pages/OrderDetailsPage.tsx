import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import styles from './css/OrderDetailsPage.module.css';

const statusMap: Record<string, string> = {
  PENDING: 'Pendente',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue'
};

const statusColors: Record<string, { bg: string, text: string }> = {
  PENDING: { bg: '#ff9500', text: '#fff' },
  PREPARING: { bg: '#0a84ff', text: '#fff' },
  READY: { bg: '#30d158', text: '#fff' },
  DELIVERED: { bg: '#8e8e93', text: '#fff' }
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      api.fetchOrderById(id)
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await api.updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.mainContent}>
        <PageHeader 
          showDefaultIcons={false}
          leftContent={
            <Link to="/pedidos" className={styles.backBtn}>
              <ArrowLeft size={20} /> Voltar para Pedidos
            </Link>
          }
          rightContent={
            <button className={styles.actionBtn}>
              <Printer size={18} /> Imprimir Recibo
            </button>
          }
        />

        <div className={styles.content}>
          {loading && <div className={styles.message}>Carregando...</div>}
          {error && <div className={styles.message}>Erro: {error}</div>}

          {!loading && !error && order && (
            <div className={styles.orderDetailsCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h1 className={styles.title}>Pedido #{order.id.slice(0, 8)}</h1>
                  <p className={styles.clientName}>{order.clientName || 'Cliente sem nome'}</p>
                </div>
                <select 
                  className={styles.statusSelect} 
                  aria-label="Status do pedido"
                  style={{ 
                    backgroundColor: statusColors[order.status || 'PENDING']?.bg,
                    color: statusColors[order.status || 'PENDING']?.text 
                  }}
                  value={order.status || 'PENDING'}
                  onChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  {Object.entries(statusMap).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Informações de Entrega</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <Clock size={16} />
                    <span>Data/Hora: {new Date(order.deliveryDate || order.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Itens do Pedido ({order.items?.length})</h3>
                <div className={styles.itemsList}>
                  {order.items?.map((orderItem: any) => (
                    <div key={orderItem.id} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        <span className={styles.itemQty}>{orderItem.quantity}x</span>
                        <div className={styles.itemDetails}>
                          <span className={styles.itemName}>{orderItem.item?.name || 'Item desconhecido'}</span>
                          {orderItem.notes && <span className={styles.itemNotes}>Obs: {orderItem.notes}</span>}
                        </div>
                      </div>
                      <span className={styles.itemPrice}>
                        R$ {Number(orderItem.unitPrice * orderItem.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.totalSection}>
                <span>Total do Pedido</span>
                <span className={styles.totalValue}>
                  R$ {Number(order.totalAmount).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetailsPage;
