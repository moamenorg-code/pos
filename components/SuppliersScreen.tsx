import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Supplier } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

// --- SupplierFormModal Component ---
interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id' | 'balance'> | Supplier) => void;
    supplierToEdit?: Supplier | null;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSave, supplierToEdit }) => {
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
            if (supplierToEdit) {
                setName(supplierToEdit.name);
                setPhone(supplierToEdit.phone);
                setAddress(supplierToEdit.address);
            } else {
                resetForm();
            }
        }
    }, [isOpen, supplierToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            alert('يرجى ملء اسم المورد ورقم الهاتف على الأقل.');
            return;
        }

        const supplierData = { name, phone, address };

        if (supplierToEdit) {
            onSave({ ...supplierData, id: supplierToEdit.id, balance: supplierToEdit.balance });
        } else {
            onSave(supplierData);
        }
        onClose();
    };
    
    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                        {supplierToEdit ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="supplierName" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">اسم المورد</label>
                            <input type="text" id="supplierName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required />
                        </div>
                        <div>
                            <label htmlFor="supplierPhone" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">رقم الهاتف</label>
                            <input type="tel" id="supplierPhone" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyles} required />
                        </div>
                        <div>
                            <label htmlFor="supplierAddress" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">العنوان (اختياري)</label>
                            <input type="text" id="supplierAddress" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} />
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main SuppliersScreen Component ---
const SuppliersScreen: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, currentUser } = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);

    const canManage = currentUser?.permissions.canManageSuppliers;

     const filteredSuppliers = useMemo(() => {
        if (!searchTerm.trim()) {
          return suppliers;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return suppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(lowercasedTerm) ||
          supplier.phone.includes(lowercasedTerm)
        );
    }, [suppliers, searchTerm]);

    const handleOpenFormModal = (supplier: Supplier | null) => {
        setSupplierToEdit(supplier);
        setIsFormModalOpen(true);
    };

    const handleSaveSupplier = (supplierData: Omit<Supplier, 'id' | 'balance'> | Supplier) => {
        if ('id' in supplierData) {
            updateSupplier(supplierData);
        } else {
            addSupplier(supplierData);
        }
        setIsFormModalOpen(false);
        setSupplierToEdit(null);
    };

    const handleDeleteClick = (supplierId: number) => {
        setSupplierToDelete(supplierId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (supplierToDelete !== null) {
            deleteSupplier(supplierToDelete);
        }
        setIsConfirmModalOpen(false);
        setSupplierToDelete(null);
    };

    const formatBalance = (balance: number) => {
        const value = Math.abs(balance).toFixed(2);
        if (balance < 0) {
            return { text: `${value} جنيه (مدين)`, color: 'text-red-500' };
        } else if (balance > 0) {
            return { text: `${value} جنيه (دائن)`, color: 'text-green-500' };
        }
        return { text: `0.00 جنيه`, color: 'text-gray-500 dark:text-gray-400' };
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة الموردين</h1>
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white"
                    />
                    {canManage && (
                        <button
                            onClick={() => handleOpenFormModal(null)}
                            className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap">
                            <PlusIcon className="w-5 h-5" /> مورد جديد
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم المورد</th>
                            <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                            <th scope="col" className="px-6 py-3">العنوان</th>
                            <th scope="col" className="px-6 py-3">الرصيد</th>
                            {canManage && <th scope="col" className="px-6 py-3">الإجراءات</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map((supplier) => {
                                const balanceInfo = formatBalance(supplier.balance);
                                return (
                                    <tr key={supplier.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {supplier.name}
                                        </th>
                                        <td className="px-6 py-4">{supplier.phone}</td>
                                        <td className="px-6 py-4">{supplier.address || '-'}</td>
                                        <td className={`px-6 py-4 font-bold ${balanceInfo.color}`}>{balanceInfo.text}</td>
                                        {canManage && (
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <button onClick={() => handleOpenFormModal(supplier)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(supplier.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={canManage ? 5 : 4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'لم يتم العثور على موردين تطابق بحثك.' : 'لا يوجد موردين لعرضهم.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <SupplierFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setSupplierToEdit(null); }}
                onSave={handleSaveSupplier}
                supplierToEdit={supplierToEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا المورد؟ سيتم حذف جميع سجلاته."
            />
        </div>
    );
};

export default SuppliersScreen;