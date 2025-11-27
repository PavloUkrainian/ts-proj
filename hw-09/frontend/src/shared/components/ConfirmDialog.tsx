import { useState, useCallback } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
            onClick={onCancel}
          >
            Скасувати
          </button>
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-btn-confirm"
            onClick={onConfirm}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(
    null
  );

  const showConfirm = useCallback(
    (msg: string, onConfirm: () => void) => {
      setMessage(msg);
      setOnConfirmCallback(() => onConfirm);
      setIsOpen(true);
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, [onConfirmCallback]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, []);

  return {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel,
  };
}

