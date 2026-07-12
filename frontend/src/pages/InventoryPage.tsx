import React, { useState, useEffect } from 'react';

import { Bell, Settings, Edit2, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './css/InventoryPage.module.css';
import modalStyles from '../components/css/CreateItemModal.module.css';
import { CreateItemModal } from '../components/CreateItemModal';
import { CreateStockItemModal } from '../components/CreateStockItemModal';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const InventoryPage: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'menu' | 'estoque'>('menu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menuItems'],
    queryFn: api.fetchMenuItems
  });

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

          {activeTab === 'menu' ? (
            <div>
              {!isLoading && !error && data?.map((category: any) => (
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
                            src={`http://localhost:3000/items/${item.photoUrl.split(/[\\/]/).pop()}`} 
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
                        <Edit2 className={styles.actionIcon} />
                        <div className={`${styles.toggle} ${styles.toggleActive}`}>
                          <div className={styles.toggleKnob}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
              ))}
              
              {isLoading && <div className={styles.emptyState}><p>Carregando as opções do menu...</p></div>}
              
              {error && <div className={styles.emptyState}><p>Erro ao carregar os itens. Tente novamente.</p></div>}
              
            </div>
          ) : (
            <div>
              {!isLoadingStock && !errorStock && stockData && stockData.length > 0 ? (
                stockData.map((item: any) => (
                  <div className={styles.itemCard} key={item.id}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemPrice}>R$ {item.cost} / {item.measureUnit}</span>
                      <span className={styles.itemStock}>
                        Em estoque: {item.stockAmount} {item.measureUnit}
                      </span>
                    </div>
                    <div className={styles.itemActions}>
                      <Edit2 className={styles.actionIcon} />
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>O controle de estoque está vazio no momento.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          className={modalStyles.inventoryFab}
          onClick={() => activeTab === 'menu' ? setIsModalOpen(true) : setIsStockModalOpen(true)}
        >
          <Plus className={modalStyles.fabIcon} />
        </button>

        <CreateItemModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          stockItems={stockData || []}
          onItemCreated={() => {
            refetch();
          }} 
        />

        <CreateStockItemModal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onItemCreated={() => {
            refetchStock();
          }}
        />
      </main>
    </div>
  );
};

export default InventoryPage;