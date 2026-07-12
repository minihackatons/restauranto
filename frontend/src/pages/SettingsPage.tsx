import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PageHeader } from '../components/PageHeader';
import styles from './css/SettingsPage.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    address: '',
    phone: ''
  });

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['myRestaurant'],
    queryFn: api.fetchMyRestaurant
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        document: restaurant.document || '',
        address: restaurant.address || '',
        phone: restaurant.phone || ''
      });
    }
  }, [restaurant]);

  const mutation = useMutation({
    mutationFn: (newData: any) => api.updateMyRestaurant(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRestaurant'] });
      setSuccessMsg('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <PageHeader title="Configurações" />
        
        <div className={styles.content}>
          {isLoading && <div className={styles.loadingState}>Carregando informações...</div>}
          {error && <div className={styles.errorState}>Erro ao carregar dados do restaurante.</div>}
          
          {!isLoading && !error && restaurant && (
            <div className={styles.settingsCard}>
              <h2>Informações Básicas</h2>
              
              {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome do Restaurante</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input} 
                    placeholder="Ex: Pizzaria do Mario"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Documento (CNPJ/CPF)</label>
                  <input 
                    type="text" 
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    className={styles.input} 
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Endereço</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={styles.input} 
                    placeholder="Rua Exemplo, 123"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Telefone</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.input} 
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <><Loader2 className="animate-spin" size={18} /> Salvando...</>
                  ) : 'Salvar Alterações'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
