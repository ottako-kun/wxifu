import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>({ title: '', message: '' });
  // We use a ref to store the resolve function of the Promise so we can call it later
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: ConfirmationOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef.current(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef.current(false);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
};