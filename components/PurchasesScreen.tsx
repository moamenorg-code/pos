import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, PurchaseInvoice, PurchaseItem } from '../types';
import { PlusIcon, TrashIcon } from './icons';

// --- PurchaseFormModal Component ---
interface PurchaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoice: Omit<PurchaseInvoice, 'id'>) => void;
}

const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const { suppliers, products } = useContext(AppContext) as AppContextType;
    
    const [supplierId, setSupplierId] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [items, setItems] = useState<PurchaseItem[]>([]);
    
    const resetForm = () => {
        setSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
        setDate(new Date().toISOString().slice(0, 10));
        setItems([]);
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const totalAmount = useMemo(() => {
        return items.reduce((total, item) => total + item.cost * item.quantity, 0);
    }, [items]);

    if (!isOpen) return null;

    const handleAddItem = () => {
        if (products.length > 0) {
            const defaultProduct = products[0];
            setItems([...items, { productId: defaultProduct.id, quantity: 1, cost: 0 }]);
        }
    };

    const handleItemChange = (index: number, field: 'productId' | 'quantity' | 'cost', value: string) => {
        const newItems = [...items];
        const numericValue = parseFloat(value);
        if (field === 'productId') {
            newItems[index].productId = Number(value);
        } else if (field === 'quantity') {
            newItems[index].quantity = isNaN(numericValue) ? 0 : numericValue;
        } else if (field === 'cost') {
            newItems[index].cost = isNaN(numericValue) ? 0 : numericValue;
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (supplierId === '' || items.length === 0) {
            alert('يرجى اختيار مورد وإضافة منتج واحد على الأقل.');
            return;
        }

        const finalItems = items.filter(item => item.quantity > 0 && item.cost >= 0);
        if(finalItems.length === 0) {
             alert('يرجى تحديد كمية وتكلفة للمنتجات.');
             return;
        }
        
        onSave({ supplierId: Number(supplierId), date, items: finalItems, totalAmount });
        onClose();
    };

    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">فاتورة شراء جديدة</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="supplier" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">المورد</label>
                                <select id="supplier" value={supplierId} onChange={e => setSupplierId(Number(e.target.value))} className={inputStyles} required>
                                    <option value="" disabled>اختر موردًا</option>
                                    {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="invoiceDate" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">تاريخ الفاتورة</label>
                                <input type="date" id="invoiceDate" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text">المنتجات</h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto p-2 border rounded-md dark:border-dark-border">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 items-center gap-2">
                                        <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className={`${inputStyles} col-span-5`}>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} placeholder="الكمية" className={`${inputStyles} col-span-3`} min="0" step="any" />
                                        <input type="number" value={item.cost} onChange={e => handleItemChange(index, 'cost', e.target.value)} placeholder="التكلفة" className={`${inputStyles} col-span-3`} min="0" step="0.01" />
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 col-span-1"> <TrashIcon className="w-5 h-5" /> </button>
                                    </div>
                                ))}
                                {items.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">لم يتم إضافة منتجات</p>}
                            </div>
                            <button type="button" onClick={handleAddItem} className="mt-3 flex items-center gap-2 text-primary dark:text-cyan-400 font-semibold hover:underline">
                                <PlusIcon className="w-5 h-5" /> إضافة منتج
                            </button>
                        </div>
                        <div className="text-left text-xl font-bold mt-4 text-light-text dark:text-dark-text">
                            الإجمالي: <span className="text-primary dark:text-cyan-400">{totalAmount.toFixed(2)} جنيه</span>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border mt-auto">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ الفاتورة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main PurchasesScreen Component ---
const PurchasesScreen: React.FC = () => {
    const { purchaseInvoices, addPurchaseInvoice, getSupplierById, currentUser } = useContext(AppContext) as AppContextType;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const canManage = currentUser?.permissions.canManagePurchases;

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة المشتريات</h1>
                {canManage && (
                    <button
                        onClick={() => setIsFormModalOpen(true)}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" /> فاتورة شراء جديدة
                    </button>
                )}
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">رقم الفاتورة</th>
                            <th scope="col" className="px-6 py-3">المورد</th>
                            <th scope="col" className="px-6 py-3">التاريخ</th>
                            <th scope="col" className="px-6 py-3">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseInvoices.map((invoice) => (
                            <tr key={invoice.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    INV-{invoice.id.toString().padStart(4, '0')}
                                </th>
                                <td className="px-6 py-4">{getSupplierById(invoice.supplierId)?.name || 'غير معروف'}</td>
                                <td className="px-6 py-4">{new Date(invoice.date).toLocaleDateString('ar-EG')}</td>
                                <td className="px-6 py-4 font-bold text-primary dark:text-cyan-400">{invoice.totalAmount.toFixed(2)} جنيه</td>
                            </tr>
                        ))}
                         {purchaseInvoices.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    لا توجد فواتير مشتريات لعرضها.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PurchaseFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={addPurchaseInvoice}
            />
        </div>
    );
};

export default PurchasesScreen;