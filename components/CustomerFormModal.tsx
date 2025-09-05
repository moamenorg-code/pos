import React, { useState, useEffect } from 'react';
import type { Customer } from '../types';

export interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Omit<Customer, 'id' | 'balance' | 'loyaltyPoints'> | Customer) => Promise<void>;
    customerToEdit?: Customer | null;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSave, customerToEdit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const resetForm = () => {
        setName('');
        setPhone('');
        setAddress('');
    };

    useEffect(() => {
        if (isOpen) {
            if (customerToEdit) {
                setName(customerToEdit.name);
                setPhone(customerToEdit.phone);
                setAddress(customerToEdit.address);
            } else {
                resetForm();
            }
        }
    }, [isOpen, customerToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            alert('يرجى ملء اسم العميل ورقم الهاتف على الأقل.');
            return;
        }

        const customerData = { name, phone, address };

        if (customerToEdit) {
            await onSave({ ...customerData, id: customerToEdit.id, balance: customerToEdit.balance, loyaltyPoints: customerToEdit.loyaltyPoints });
        } else {
            await onSave(customerData);
        }
        onClose();
    };
    
    const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-slate-400 dark:text-white transition-colors";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                        {customerToEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="customerName" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">اسم العميل</label>
                            <input type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required autoFocus/>
                        </div>
                        <div>
                            <label htmlFor="customerPhone" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">رقم الهاتف</label>
                            <input type="tel" id="customerPhone" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyles} required />
                        </div>
                        <div>
                            <label htmlFor="customerAddress" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">العنوان (اختياري)</label>
                            <input type="text" id="customerAddress" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerFormModal;