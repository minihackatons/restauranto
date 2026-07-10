import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ShoppingCart, Plus, Minus, Search, Bell, Settings, PackageOpen, Store, MessageCircle, UtensilsCrossed, CreditCard, QrCode, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import styles from './css/CreateOrderPage.module.css';

interface Item {
  id: string;
  name: string;
  price: number;
  photoUrl?: string;
}

interface CartItem extends Item {
  quantity: number;
}

const CreateOrderPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout form states
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [channel, setChannel] = useState('loja');
  const [paymentMethod, setPaymentMethod] = useState('cartao');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [discount, setDiscount] = useState<number>(0);

  // Fetch Menu
  const { data: groupedMenu, isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: api.fetchMenuItems
  });

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: () => {
      alert('Pedido concluído com sucesso!');
      setCart([]);
    },
    onError: (error: any) => {
      alert(`Erro: ${error.message}`);
    }
  });

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
  };

  const getQuantity = (itemId: string) => {
    return cart.find(c => c.id === itemId)?.quantity || 0;
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = () => {
    if (cart.length === 0) return;
    const itemsPayload = cart.map(c => ({ itemId: c.id, quantity: c.quantity }));
    createOrderMutation.mutate({
      items: itemsPayload,
      clientName,
      clientContact,
      deliveryAddress,
      paymentMethod,
      channel,
      deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      discount: discount || 0
    });
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        
        {/* HEADER */}
        <header className={styles.topHeader}>
          <h1 className={styles.pageTitle}>Registrar Pedido</h1>
          <div className={styles.headerIcons}>
            <Bell className={styles.headerIcon} size={24} />
            <Link to="/settings" style={{ color: 'inherit', display: 'flex' }}>
              <Settings className={styles.headerIcon} size={24} />
            </Link>
          </div>
        </header>

        {/* POS LAYOUT (MENU + CART) */}
        <div className={styles.posLayout}>
          
          {/* MENU SECTION */}
          <div className={styles.menuSection}>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <Search size={18} color="#8e8e93" />
                <input 
                  type="text" 
                  placeholder="Pesquisar item" 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.menuContent}>
              {isLoading ? (
                <p style={{textAlign: 'center', color: '#8e8e93', marginTop: 40}}>Carregando cardápio...</p>
              ) : (
                groupedMenu?.map((group) => {
                  const filteredItems = group.items.filter((item: Item) => 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={group.categoryName} className={styles.categoryGroup}>
                      <div className={styles.categoryTitle}>{group.categoryName}</div>
                      <div className={styles.itemsGrid}>
                        {filteredItems.map((item: Item) => {
                          const qty = getQuantity(item.id);
                          return (
                            <div key={item.id} className={styles.itemCard}>
                              {item.photoUrl ? (
                                <img 
                                  src={`http://localhost:3000/items/${item.photoUrl.split(/[\\/]/).pop()}`} 
                                  alt={item.name} 
                                  className={styles.itemImage}
                                />
                              ) : (
                                <div className={styles.itemImage} />
                              )}
                              
                              <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemPrice}>R${Number(item.price).toFixed(2).replace('.', ',')}</span>
                              </div>
                              <div className={styles.itemControls}>
                                {qty > 0 && (
                                  <>
                                    <button className={`${styles.controlBtn} ${styles.btnMinus}`} onClick={() => removeFromCart(item.id)}>-</button>
                                    <span className={styles.qtyDisplay}>{qty}</span>
                                  </>
                                )}
                                <button className={`${styles.controlBtn} ${styles.btnPlus}`} onClick={() => addToCart(item)}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CART SECTION */}
          <div className={styles.cartSection}>
            <div className={styles.cartHeader}>
              <ShoppingCart size={22} />
              Carrinho
            </div>
            
            <div className={styles.cartItems}>
              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <PackageOpen size={48} strokeWidth={1.5} />
                  <span>O carrinho está vazio.</span>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className={styles.cartItem}>
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>{item.name}</span>
                        <span className={styles.cartItemPrice}>R$ {Number(item.price).toFixed(2).replace('.', ',')} un</span>
                      </div>
                      <div className={styles.cartItemActions}>
                        <button className={`${styles.controlBtn} ${styles.btnMinus}`} onClick={() => removeFromCart(item.id)} style={{width: 28, height: 28, fontSize: 16}}>
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyDisplay} style={{fontSize: 14}}>{item.quantity}</span>
                        <button className={`${styles.controlBtn} ${styles.btnPlus}`} onClick={() => addToCart(item)} style={{width: 28, height: 28, fontSize: 16}}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Checkout Details Form directly inside cart */}
                  <div className={styles.checkoutForm}>
                    <div className={styles.inputRow}>
                      <div className={styles.formGroup} style={{flex: 1}}>
                        <span className={styles.formLabel}>Cliente</span>
                        <input type="text" className={styles.inputField} placeholder="Nome" value={clientName} onChange={e => setClientName(e.target.value)} />
                      </div>
                      <div className={styles.formGroup} style={{flex: 1}}>
                        <span className={styles.formLabel}>Contato</span>
                        <input type="text" className={styles.inputField} placeholder="Telefone" value={clientContact} onChange={e => setClientContact(e.target.value)} />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <span className={styles.formLabel}>Endereço (opcional)</span>
                      <input type="text" className={styles.inputField} placeholder="Rua, Número, Bairro" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                      <span className={styles.formLabel}>Data de Entrega</span>
                      <input type="datetime-local" className={styles.inputField} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                      <span className={styles.formLabel}>Canal</span>
                      <div className={styles.toggleGrid}>
                        <div className={`${styles.toggleBtn} ${channel === 'loja' ? styles.active : ''}`} onClick={() => setChannel('loja')}>
                          <Store size={20} />
                          Loja
                        </div>
                        <div className={`${styles.toggleBtn} ${channel === 'whatsapp' ? styles.active : ''}`} onClick={() => setChannel('whatsapp')}>
                          <MessageCircle size={20} />
                          Zap
                        </div>
                        <div className={`${styles.toggleBtn} ${channel === 'ifood' ? styles.active : ''}`} onClick={() => setChannel('ifood')}>
                          <UtensilsCrossed size={20} />
                          iFood
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <span className={styles.formLabel}>Pagamento</span>
                      <div className={styles.toggleGrid}>
                        <div className={`${styles.toggleBtn} ${paymentMethod === 'cartao' ? styles.active : ''}`} onClick={() => setPaymentMethod('cartao')}>
                          <CreditCard size={20} />
                          Cartão
                        </div>
                        <div className={`${styles.toggleBtn} ${paymentMethod === 'pix' ? styles.active : ''}`} onClick={() => setPaymentMethod('pix')}>
                          <QrCode size={20} />
                          Pix
                        </div>
                        <div className={`${styles.toggleBtn} ${paymentMethod === 'dinheiro' ? styles.active : ''}`} onClick={() => setPaymentMethod('dinheiro')}>
                          <Banknote size={20} />
                          Nota
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.cartFooter}>
              <div className={styles.formGroup} style={{marginBottom: 16}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span className={styles.formLabel}>Desconto (R$)</span>
                  <input type="number" min="0" className={styles.inputField} style={{width: 100, textAlign: 'right', padding: '8px 12px'}} value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} />
                </div>
              </div>
              <div className={styles.cartTotal}>
                <span>Total</span>
                <span>R$ {Math.max(0, totalAmount - (discount || 0)).toFixed(2).replace('.', ',')}</span>
              </div>
              <button 
                className={styles.submitBtn} 
                disabled={cart.length === 0 || createOrderMutation.isPending}
                onClick={handleSubmit}
              >
                {createOrderMutation.isPending ? 'Enviando...' : 'Finalizar Pedido'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CreateOrderPage;
