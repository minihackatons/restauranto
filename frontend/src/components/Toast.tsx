import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './css/Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextData {
  showToast: (text?: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastText, setToastText] = useState('Success!');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text = 'Success!', type: ToastType = 'success', duration = 3000) => {
    setToastText(text);
    setToastType(type);
    setIsOpen(true);
    
    if (timeoutId) clearTimeout(timeoutId);
    
    if (duration > 0) {
      const id = setTimeout(() => {
        setIsOpen(false);
      }, duration);
      setTimeoutId(id);
    } else {
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const hideToast = useCallback(() => {
    setIsOpen(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {isOpen && (
        <div className={styles.toastContainer}>
          <div className={styles.iconContainer}>
            {toastType === 'success' && <CheckCircle className={styles.iconSuccess} size={20} />}
            {toastType === 'error' && <AlertCircle className={styles.iconError} size={20} />}
            {toastType === 'info' && <Info className={styles.iconInfo} size={20} />}
          </div>
          <span className={styles.text}>{toastText}</span>
          <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
