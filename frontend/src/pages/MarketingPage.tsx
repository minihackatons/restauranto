import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Globe, MessageCircle, BookOpen, Save, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLinktree = async () => {
      try {
        const data = await api.fetchLinktree();
        setFormData({
          site: data.site || '',
          whatsapp: data.whatsapp || '',
          menu: data.menu || ''
        });
      } catch (err) {
        console.error("Failed to load linktree", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLinktree();
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
          
          <div className={styles.funnelWrapper}>
            <FunnelChart views={312} clicks={89} orders={42} />
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
