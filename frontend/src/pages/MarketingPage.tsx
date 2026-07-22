import React, { useState, useEffect } from 'react';
import { Globe, MessageCircle, BookOpen, Save, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import { FunnelChart } from '../components/dashboard/FunnelChart';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import styles from './css/MarketingPage.module.css';

const MarketingPage: React.FC = () => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    site: '',
    whatsapp: '',
    menu: ''
  });
  const [accessData, setAccessData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, accessStats, orders] = await Promise.all([
          api.fetchLinktree(),
          api.fetchAccessStatistics(),
          api.fetchOrdersDashboard(7)
        ]);
        setFormData({
          site: data.site || '',
          whatsapp: data.whatsapp || '',
          menu: data.menu || ''
        });
        setAccessData(accessStats);
        setOrdersData(orders);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateLinktree(formData);
      showToast('Central de Links atualizada com sucesso!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar a Central de Links', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        <PageHeader title="Marketing" />
        <div className={styles.contentWide}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <FunnelChart 
              views={accessData?.views ?? ordersData?.funnel?.views ?? 0} 
              clicks={accessData?.clicks ?? ordersData?.funnel?.clicks ?? 0} 
              orders={ordersData?.totalOrders ?? 0} 
            />
            {accessData?.clickTypes && (
              <div style={{ background: 'rgba(28, 28, 30, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Distribuição de Cliques</h3>
                <div style={{ width: '100%', flex: 1, minHeight: '140px', marginTop: '4px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        { name: 'WhatsApp', value: accessData.clickTypes.whatsapp || 0 },
                        { name: 'Cardápio', value: accessData.clickTypes.menu || 0 },
                        { name: 'Site', value: accessData.clickTypes.site || 0 }
                      ]} 
                      layout="vertical" 
                      margin={{ top: 0, right: 30, left: -10, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#a1a1aa" axisLine={false} tickLine={false} width={80} tick={{ fill: '#fff', fontSize: 13 }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                        contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} minPointSize={4} label={{ position: 'right', fill: '#fff', fontSize: 13 }}>
                        {[0, 1, 2].map((index) => (
                          <Cell key={`cell-${index}`} fill="#6366f1" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>
          ) : (
          <section className={styles.markdownSection}>
            <div className={styles.markdownHeader}>
              <h2 className={styles.markdownTitle}>
                Central de Links
              </h2>
              <p className={styles.markdownSubtitle}>
                Compartilhe um único link com seus clientes para acessar WhatsApp, cardápio, redes sociais e outras páginas. Quando você adicionar
                suas redes abaixo, criaremos uma página que agrupa todos para você compartilhar. Cada clique nessa página será monitorado, para 
                permitir que você veja a conversão dos seus clientes nas diversas etapas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formGroup}>
              
              <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>Site / Instagram</label>
                <div className={styles.inputFieldContainer}>
                  <Globe className={styles.inputIcon} size={20} />
                  <input
                    type="url"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                    placeholder="https://instagram.com/seurestaurante"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>WhatsApp para Pedidos</label>
                <div className={styles.inputFieldContainer}>
                  <MessageCircle className={styles.inputIcon} size={20} />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>Link do Cardápio Digital</label>
                <div className={styles.inputFieldContainer}>
                  <BookOpen className={styles.inputIcon} size={20} />
                  <input
                    type="url"
                    name="menu"
                    value={formData.menu}
                    onChange={handleChange}
                    placeholder="https://cardapio.digital/..."
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.actionFooter}>
                <button type="submit" className={styles.primaryBtn} disabled={isSaving}>
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Salvando...' : 'Salvar Links'}
                </button>
              </div>

            </form>
          </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default MarketingPage;
