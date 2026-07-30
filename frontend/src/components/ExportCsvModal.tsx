import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import styles from './css/ExportCsvModal.module.css';
import { api } from '../services/api';
import { useToast } from './Toast';

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCsvModal: React.FC<ExportCsvModalProps> = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const resetAndClose = () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
    onClose();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const filters: { startDate?: string; endDate?: string; status?: string } = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (status) filters.status = status;

      const blob = await api.exportOrdersCsv(filters);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pedidos-${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Exportação concluída com sucesso', 'success');
      resetAndClose();
    } catch (error: any) {
      showToast(error.message || 'Erro ao exportar pedidos', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={resetAndClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Exportar Pedidos (CSV)</h2>
          <button className={styles.closeButton} onClick={resetAndClose} disabled={isExporting}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.formGroup}>
          <label>Data Início (opcional)</label>
          <input 
            type="date" 
            className={styles.input} 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isExporting}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Data Fim (opcional)</label>
          <input 
            type="date" 
            className={styles.input} 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isExporting}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Status (opcional)</label>
          <select 
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isExporting}
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Pronto</option>
            <option value="DELIVERED">Entregue</option>
          </select>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={resetAndClose} disabled={isExporting}>
            Cancelar
          </button>
          <button className={styles.exportBtn} onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 size={18} className={styles.spin} />
            ) : (
              <Download size={18} />
            )}
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};
