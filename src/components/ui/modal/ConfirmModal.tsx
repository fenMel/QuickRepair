import React from 'react';
import { Modal } from './index';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 rounded-2xl dark:bg-boxdark">
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          type === 'danger' ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 
          type === 'warning' ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30' :
          'bg-blue-100 text-blue-500 dark:bg-blue-900/30'
        }`}>
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="mb-2 text-xl font-bold text-black dark:text-white">
          {title}
        </h3>
        
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          {message}
        </p>
        
        <div className="flex w-full gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-center font-medium text-white hover:bg-opacity-90 ${
              type === 'danger' ? 'bg-red-500' : 
              type === 'warning' ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
