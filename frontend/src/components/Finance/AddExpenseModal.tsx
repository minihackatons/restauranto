import React, { useState } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
import styles from '../css/CreateCategoryModal.module.css';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { CustomSelect } from '../CustomSelect';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const transactionTypeOptions = [
  { value: 'EXPENSE', label: 'Despesa (Gasto)' },
  { value: 'INCOME', label: 'Receita (Saldo Positivo)' }
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [date, setDate] = useState<Date>(new Date());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!description || !value) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.createTransaction({
        description,
        type,
        value: Number(value),
        createdAt: date.toISOString(),
      });
      
      // Reset form
      setDescription('');
      setValue('');
      setType('EXPENSE');
      setDate(new Date());
      
      onExpenseAdded();
      showToast('Entrada registrada com sucesso!', 'success');
      onClose();
    } catch (err: any) {
      const errorMsg = err.message || 'Ocorreu um erro ao criar a despesa.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Adicionar Transação</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Transação</label>
              <CustomSelect 
                value={type}
                onChange={(val) => setType(val as 'EXPENSE' | 'INCOME')}
                options={transactionTypeOptions}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Data da Transação</label>
              <div style={{ width: '100%' }}>
                <DatePicker 
                  selected={date} 
                  onChange={(d: Date | null) => setDate(d || new Date())} 
                  className={styles.input}
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Descrição</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.input}
                placeholder="Ex: Pagamento de conta de luz"
                required
              />
            </div>


            <div className={styles.formGroup}>
              <label className={styles.label}>Valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
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
                'Salvar Transação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
