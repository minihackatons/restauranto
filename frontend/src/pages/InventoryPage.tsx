import React, { useState, useEffect } from 'react';

import { Edit2, ChevronDown, Plus } from 'lucide-react';
import styles from './css/InventoryPage.module.css';
import modalStyles from '../components/css/CreateItemModal.module.css';
import { CreateItemModal } from '../components/CreateItemModal';
import { CreateStockItemModal } from '../components/CreateStockItemModal';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'menu' | 'estoque'>('menu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'expiring'>('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menuItems'],
    queryFn: api.fetchMenuItems
  });

  const { data: alertsData } = useQuery({
    queryKey: ['stockAlerts'],
    queryFn: api.fetchStockAlerts
  });

  const { showToast, hideToast } = useToast();
  const [changedVisibilityIds, setChangedVisibilityIds] = useState<string[]>([]);

  const saveVisibilityMutation = useMutation({
    mutationFn: (ids: string[]) => api.changeItemsVisibility(ids),
    onSuccess: () => {
      setChangedVisibilityIds([]);
      refetch();
      showToast('Mudanças salvas com sucesso!', 'success', 3000);
    },
    onError: (err) => {
      console.error('[InventoryPage] Erro ao salvar visibilidade:', err);
      showToast('Erro ao salvar as mudanças', 'error', 3000);
    }
  });

  const handleToggleVisibility = (itemId: string) => {
    const isRemoving = changedVisibilityIds.includes(itemId);
    const newIds = isRemoving
      ? changedVisibilityIds.filter(id => id !== itemId)
      : [...changedVisibilityIds, itemId];

    setChangedVisibilityIds(newIds);

    if (newIds.length > 0) {
      showToast('Você tem mudanças não salvas', 'info', 0);
    } else {
      hideToast();
    }
  };

  const isItemVisible = (item: any) => {
    const isPublic = item.visibility === 'public';
    const isChanged = changedVisibilityIds.includes(item.id);
    return isChanged ? !isPublic : isPublic;
  };

  const { data: stockData, isLoading: isLoadingStock, error: errorStock, refetch: refetchStock } = useQuery({
    queryKey: ['stockItems'],
    queryFn: api.fetchStockItems
  });

  useEffect(() => {
    if (error) {
      console.error('[InventoryPage] Falha na comunicação com a API:', error);
    }
  }, [error]);

  useEffect(() => {
    if (errorStock) {
      console.error('[InventoryPage] Falha na comunicação com a API (Estoque):', errorStock);
    }
  }, [errorStock]);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <PageHeader title="Estoque" />

        <div className={styles.content}>
          <div className={styles.segmentedControl}>
            <button
              className={`${styles.segmentBtn} ${activeTab === 'menu' ? styles.activeSegment : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              Itens do Menu
            </button>
            <button
              className={`${styles.segmentBtn} ${activeTab === 'estoque' ? styles.activeSegment : ''}`}
              onClick={() => setActiveTab('estoque')}
            >
              Estoque
            </button>
          </div>

          {activeTab === 'menu' && changedVisibilityIds.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '1rem' }}>
              <button
                className={styles.primaryBtn}
                onClick={() => saveVisibilityMutation.mutate(changedVisibilityIds)}
                disabled={saveVisibilityMutation.isPending}
              >
                {saveVisibilityMutation.isPending ? 'Salvando...' : 'Salvar Mudanças'}
              </button>
            </div>
          )}

          {activeTab === 'menu' ? (
            <div>
              {!isLoading && !error && (!data || data.length === 0 ? (
                <div className={styles.emptyState}><p>Não há itens no cardápio</p></div>
              ) : (
                data.map((category: any) => (
                  <div className={styles.categoryGroup} key={category.categoryName}>
                  <div className={styles.categoryHeader}>
                    <h3>{category.categoryName}</h3>
                    <ChevronDown className={styles.chevronIcon} />
                  </div>

                  {category.items.map((item: any) => (
                    <div className={styles.itemCard} key={item.id}>
                      <div>
                        {item.photoUrl ? (
                          <img
                            src={`${item.photoUrl}`}
                            alt={item.name}
                            className={styles.itemImagePlaceholder}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className={styles.itemImagePlaceholder} />
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemPrice}>Venda: R$ {item.price}</span>
                        <div className={styles.itemFinancials}>
                          {item.currentCost !== null && item.currentCost !== undefined ? (
                            <>
                              <span className={styles.itemCost}>Custo: R$ {Number(item.currentCost).toFixed(2)}</span>
                              <span className={`${styles.itemProfit} ${Number(item.currentProfit) >= 0 ? styles.profitPositive : styles.profitNegative}`}>
                                Lucro: R$ {Number(item.currentProfit).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className={styles.itemCost}>Custo e Lucro: Não calculados (Sem ingredientes)</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.itemActions}>
                        <Edit2 className={styles.actionIcon} onClick={() => { setEditingItem(item); setIsModalOpen(true); }} style={{ cursor: 'pointer' }} />
                        <div 
                          className={`${styles.toggle} ${isItemVisible(item) ? styles.toggleActive : ''}`}
                          onClick={() => handleToggleVisibility(item.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.toggleKnob}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ))
              ))}

              {isLoading && <div className={styles.emptyState}><p>Carregando as opções do menu...</p></div>}

              {error && <div className={styles.emptyState}><p>Erro ao carregar os itens. Tente novamente.</p></div>}

            </div>
          ) : (
            <>
              <div className={styles.filtersContainer}>
                <div 
                  className={`${styles.filterChip} ${stockFilter === 'all' ? styles.activeFilterChip : ''}`}
                  onClick={() => setStockFilter('all')}
                >
                  Todos
                </div>
                <div 
                  className={`${styles.filterChip} ${stockFilter === 'low' ? styles.activeFilterChip : ''}`}
                  onClick={() => setStockFilter('low')}
                >
                  Estoque Baixo
                </div>
                <div 
                  className={`${styles.filterChip} ${stockFilter === 'expiring' ? styles.activeFilterChip : ''}`}
                  onClick={() => setStockFilter('expiring')}
                >
                  Vencendo
                </div>
              </div>

              <div className={alertsData && alertsData.totalAlerts > 0 ? styles.stockLayout : styles.stockLayoutNoAlerts}>
                <div className={styles.stockMainArea}>
                  {!isLoadingStock && !errorStock && stockData && stockData.length > 0 ? (
                stockData.filter((item: any) => {
                  if (stockFilter === 'all') return true;
                  const percentage = item.maxStock > 0 ? (item.stockAmount / item.maxStock) * 100 : 100;
                  const isLow = percentage <= (item.alertThreshold ?? 20);
                  
                  let isExpiring = false;
                  if (item.expirationDate) {
                    const expiry = new Date(item.expirationDate);
                    const now = new Date();
                    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
                    isExpiring = diffDays <= (item.alertDaysBefore ?? 7);
                  }
                  
                  if (stockFilter === 'low') return isLow;
                  if (stockFilter === 'expiring') return isExpiring;
                  return true;
                }).map((item: any) => {
                  const percentage = item.maxStock > 0 ? Math.min(Math.max((item.stockAmount / item.maxStock) * 100, 0), 100) : 100;
                  const isLow = percentage <= (item.alertThreshold ?? 20);
                  let isExpiring = false;
                  if (item.expirationDate) {
                    const expiry = new Date(item.expirationDate);
                    const now = new Date();
                    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
                    isExpiring = diffDays <= (item.alertDaysBefore ?? 7);
                  }

                  return (
                    <div className={styles.itemCard} key={item.id}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemPrice}>R$ {Number(item.maxStock > 0 ? item.cost / item.maxStock : item.cost).toFixed(2)} / {item.measureUnit}</span>
                        <span className={styles.itemStock}>
                          Em estoque: {item.stockAmount} {item.measureUnit}
                        </span>
                        
                        {item.maxStock > 0 && (
                          <div className={styles.itemProgressTrack}>
                            <div 
                              className={styles.itemProgressBar} 
                              style={{ 
                                width: `${percentage}%`,
                                background: '#6366f1'
                              }} 
                            />
                          </div>
                        )}

                        {item.expirationDate && (
                          <span className={styles.itemStock} style={{ color: isExpiring ? '#ef4444' : '#eab308' }}>
                            Validade: {item.expirationDate.substring(0, 10).split('-').reverse().join('/')}
                          </span>
                        )}
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                          {isLow && (
                            <span className={`${styles.statusBadge} ${styles.badgeWarning}`}>• Estoque Baixo</span>
                          )}
                          {isExpiring && (
                            <span className={`${styles.statusBadge} ${styles.badgeDanger}`}>• Vence em Breve</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.itemActions}>
                        <Edit2 className={styles.actionIcon} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <p>O controle de estoque está vazio no momento.</p>
                </div>
              )}
              </div>

              {alertsData && alertsData.totalAlerts > 0 && (
                <aside className={styles.stockSideAlerts}>
                  {alertsData.lowStock.length > 0 && (
                    <div className={styles.sideAlertSection}>
                      <span className={styles.sideAlertTitle} style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>Estoque Baixo</span>
                      {alertsData.lowStock.map((item: any) => (
                        <div key={item.id} className={styles.sideAlertItem}>
                          <span>{item.name}</span>
                          <strong>{item.stockAmount} {item.measureUnit}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {alertsData.expiringSoon.length > 0 && (
                    <div className={styles.sideAlertSection}>
                      <span className={styles.sideAlertTitle} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Vencendo</span>
                      {alertsData.expiringSoon.map((item: any) => {
                        const isExpired = item.daysUntilExpiry < 0;
                        const isToday = item.daysUntilExpiry === 0;
                        let text = `${item.daysUntilExpiry}d`;
                        if (isExpired) text = 'Vencido';
                        if (isToday) text = 'Hoje';
                        
                        return (
                          <div key={item.id} className={styles.sideAlertItem}>
                            <span>{item.name}</span>
                            <strong style={{ color: isExpired ? '#ef4444' : '#fff' }}>{text}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </aside>
              )}
            </div>
            </>
          )}
        </div>

        <button
          className={modalStyles.inventoryFab}
          onClick={() => {
            setEditingItem(null);
            activeTab === 'menu' ? setIsModalOpen(true) : setIsStockModalOpen(true);
          }}
        >
          <Plus className={modalStyles.fabIcon} />
        </button>

        <CreateItemModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }} 
          stockItems={stockData || []}
          editItem={editingItem}
          onItemCreated={() => {
            refetch();
          }}
        />

        <CreateStockItemModal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onItemCreated={() => {
            refetchStock();
            queryClient.invalidateQueries({ queryKey: ['stockAlerts'] });
          }}
        />
      </main>
    </div>
  );
};

export default InventoryPage;