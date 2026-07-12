import React, { useState } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
import styles from './css/CreateItemModal.module.css';
import { api } from '../services/api';

interface CreateStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: () => void;
}

export const CreateStockItemModal: React.FC<CreateStockItemModalProps> = ({ isOpen, onClose, onItemCreated }) => {
  const [name, setName] = useState('');
  const [measureUnit, setMeasureUnit] = useState('');
  const [stockAmount, setStockAmount] = useState('');
  const [cost, setCost] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !measureUnit || !stockAmount || !cost) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        name,
        measureUnit,
        stockAmount: Number(stockAmount),
        cost: Number(cost)
      };

      await api.createStockItem(payload);
      
      // Reset form
      setName('');
      setMeasureUnit('');
      setStockAmount('');
      setCost('');
      
      onItemCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar o item de estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Novo Item de Estoque</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.modalBody}>
            {error && (
              <div className={styles.generalError}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome do Item</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Ex: Tomate"
                required
              />
            </div>

            <div className={styles.gridTwoColumns}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Unidade de Medida</label>
                <input 
                  type="text" 
                  value={measureUnit}
                  onChange={(e) => setMeasureUnit(e.target.value)}
                  className={styles.input}
                  placeholder="Ex: kg, un, l"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Quantidade em Estoque</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  className={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Custo Unitário (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={styles.input}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Salvando...
                </>
              ) : (
                'Salvar Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
