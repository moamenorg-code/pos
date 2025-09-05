import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Payment } from '../types';

interface PaymentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payment: Omit<Payment, 'id'>) => void;
    type: 'customer' | 'supplier';
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, onSave, type }) => {
    const { customers, suppliers } = useContext(AppContext) as AppContextType;
    
    const [entityId, setEntityId] = useState<number | ''>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const entities = type === 'customer' ? customers : suppliers;
    
    const resetForm = () => {
        setEntityId(entities.length > 0 ? entities[0].id : '');
        setAmount('');
        setDate(new Date().toISOString().slice(0, 10));
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, type, entities]); // Correct dependency array

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (entityId === '' || amount === '' || Number(amount) <= 0) {
            alert('يرجى اختيار العميل/المورد وإدخال مبلغ صحيح.');
            return;
        }
        
        onSave({
            type,
            entityId: Number(entityId),
            amount: Number(amount),
            date,
        });
        onClose();
    };

    const title = type === 'customer' ? 'تسجيل دفعة من عميل' : 'تسجيل دفعة لمورد';
    const entityLabel = type === 'customer' ? 'العميل' : 'المورد';
    const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-slate-400 dark:text-white transition-colors";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">{title}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="entity" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">{entityLabel}</label>
                            <select id="entity" value={entityId} onChange={e => setEntityId(Number(e.target.value))} className={inputStyles} required>
                                <option value="" disabled>اختر...</option>
                                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">المبلغ</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} required min="0.01" step="0.01" />
                        </div>
                        <div>
                            <label htmlFor="paymentDate" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">التاريخ</label>
                            <input type="date" id="paymentDate" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} required />
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ الدفعة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentFormModal;