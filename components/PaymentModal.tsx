import React, { useState } from 'react';
import type { CartItem, Sale } from '../types';
import { PrintIcon, KitchenIcon } from './icons';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentDetails: { cash: number; card: number; credit: number }) => void;
  onPrint: () => void;
  onPrintKitchenOrder: () => void;
  cart: CartItem[];
  total: number;
  customerId: number | null;
  lastSale: Sale | null;
  title?: string;
  showSuccessOnConfirm?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    onPrint, 
    onPrintKitchenOrder, 
    cart, 
    total, 
    customerId, 
    lastSale,
    title = 'إتمام الدفع',
    showSuccessOnConfirm = true,
}) => {
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const parsedCash = parseFloat(cashAmount) || 0;
  const parsedCard = parseFloat(cardAmount) || 0;
  const paidAmount = parsedCash + parsedCard;
  const remainingAmount = total - paidAmount;
  const changeAmount = paidAmount - total;

  const canConfirm = remainingAmount <= 0.001; // Use epsilon for float comparison

  const handleConfirm = () => {
    let finalCash = parsedCash;
    
    // Adjust for change if overpaid
    if (changeAmount > 0) {
      finalCash = parsedCash - changeAmount;
    }
    
    onConfirm({ cash: finalCash, card: parsedCard, credit: 0 });
    if (showSuccessOnConfirm) {
        setShowSuccess(true);
    } else {
        handleClose();
    }
  };

  const handleCreditPayment = () => {
    onConfirm({ cash: parsedCash, card: parsedCard, credit: remainingAmount });
     if (showSuccessOnConfirm) {
        setShowSuccess(true);
    } else {
        handleClose();
    }
  };
  
  const handleClose = () => {
      setShowSuccess(false);
      setCashAmount('');
      setCardAmount('');
      onClose();
  }
  
  const hasRecipeItems = lastSale?.items.some(item => item.type === 'recipe');
  const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-lg rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white transition-colors";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 transform transition-all duration-300 scale-95 animate-scale-in">
        {showSuccess ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 text-green-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mt-4 text-light-text dark:text-dark-text">تمت العملية بنجاح</h2>
            {changeAmount > 0.001 && (
                <p className="text-xl mt-2 text-yellow-600 dark:text-yellow-400">
                    الباقي: {changeAmount.toFixed(2)} جنيه
                </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                 <button
                    onClick={onPrint}
                    disabled={!lastSale}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
                  >
                    <PrintIcon className="w-5 h-5" />
                    طباعة الفاتورة
                  </button>
                  {hasRecipeItems && (
                     <button
                        onClick={onPrintKitchenOrder}
                        disabled={!lastSale}
                        className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
                      >
                        <KitchenIcon className="w-5 h-5" />
                        طلب المطبخ
                      </button>
                  )}
            </div>
             <div className="mt-4">
                 <button
                    onClick={handleClose}
                    className="w-full py-3 px-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
                  >
                    فاتورة جديدة
                  </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold mb-4 text-center text-light-text dark:text-dark-text">{title}</h2>
            
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className="bg-slate-100 dark:bg-dark-bg-alt p-4 rounded-lg">
                     <p className="text-sm text-slate-600 dark:text-slate-300">المبلغ المطلوب</p>
                      <p className="text-3xl font-extrabold text-primary">
                        {total.toFixed(2)}
                      </p>
                </div>
                <div className={`p-4 rounded-lg ${remainingAmount > 0 ? 'bg-red-100 dark:bg-red-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
                     <p className="text-sm">{remainingAmount > 0 ? 'المتبقي' : 'الباقي (Change)'}</p>
                      <p className={`text-3xl font-extrabold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(remainingAmount).toFixed(2)}
                      </p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">المبلغ النقدي</label>
                    <div className="flex gap-2">
                        <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className={inputStyles} placeholder="0.00" />
                        <button onClick={() => setCashAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : '0')} className="px-4 py-2 bg-slate-200 dark:bg-dark-border rounded-lg text-sm font-semibold">المتبقي</button>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">المبلغ بالشبكة</label>
                    <div className="flex gap-2">
                        <input type="number" value={cardAmount} onChange={e => setCardAmount(e.target.value)} className={inputStyles} placeholder="0.00" />
                        <button onClick={() => setCardAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : '0')} className="px-4 py-2 bg-slate-200 dark:bg-dark-border rounded-lg text-sm font-semibold">المتبقي</button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                تأكيد الدفع
              </button>
              <button
                onClick={handleCreditPayment}
                disabled={customerId === null || remainingAmount <= 0}
                className="w-full py-3 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                title={customerId === null ? 'يجب اختيار عميل' : ''}
              >
                دفع المتبقي كـدين
              </button>
               <button
                onClick={handleClose}
                className="w-full py-2 px-4 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary-dark transition-colors"
              >
                إلغاء
              </button>
            </div>
          </>
        )}
      </div>
       <style>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PaymentModal;