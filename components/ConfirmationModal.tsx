import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'تأكيد الحذف', 
    confirmColor = 'bg-red-600 hover:bg-red-700' 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{title}</h2>
                <p className="my-4 text-slate-600 dark:text-slate-300">{message}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">
                        إلغاء
                    </button>
                    <button onClick={onConfirm} className={`py-2 px-6 text-white rounded-lg font-semibold transition-colors ${confirmColor}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;