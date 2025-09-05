import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Customer } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import CustomerFormModal from './CustomerFormModal';

// --- Main CustomersScreen Component ---
const CustomersScreen: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, currentUser } = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
    
    const canManage = currentUser?.permissions.canManageCustomers;

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) {
          return customers;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return customers.filter(customer => 
          customer.name.toLowerCase().includes(lowercasedTerm) ||
          customer.phone.includes(lowercasedTerm)
        );
    }, [customers, searchTerm]);

    const handleOpenFormModal = (customer: Customer | null) => {
        setCustomerToEdit(customer);
        setIsFormModalOpen(true);
    };

    const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'balance' | 'loyaltyPoints'> | Customer) => {
        if ('id' in customerData) {
            await updateCustomer(customerData);
        } else {
            await addCustomer(customerData as Omit<Customer, 'id' | 'balance' | 'loyaltyPoints'>);
        }
        setIsFormModalOpen(false);
        setCustomerToEdit(null);
    };

    const handleDeleteClick = (customerId: number) => {
        setCustomerToDelete(customerId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (customerToDelete !== null) {
            deleteCustomer(customerToDelete);
        }
        setIsConfirmModalOpen(false);
        setCustomerToDelete(null);
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
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة العملاء</h1>
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
                            <PlusIcon className="w-5 h-5" /> عميل جديد
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم العميل</th>
                            <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                            <th scope="col" className="px-6 py-3">النقاط</th>
                            <th scope="col" className="px-6 py-3">الرصيد</th>
                            {canManage && <th scope="col" className="px-6 py-3">الإجراءات</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => {
                                const balanceInfo = formatBalance(customer.balance);
                                return (
                                    <tr key={customer.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {customer.name}
                                        </th>
                                        <td className="px-6 py-4">{customer.phone}</td>
                                        <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{customer.loyaltyPoints}</td>
                                        <td className={`px-6 py-4 font-bold ${balanceInfo.color}`}>{balanceInfo.text}</td>
                                        {canManage && (
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <button onClick={() => handleOpenFormModal(customer)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(customer.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
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
                                    {searchTerm ? 'لم يتم العثور على عملاء تطابق بحثك.' : 'لا يوجد عملاء لعرضهم.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <CustomerFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setCustomerToEdit(null); }}
                onSave={handleSaveCustomer}
                customerToEdit={customerToEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع سجلاته."
            />
        </div>
    );
};

export default CustomersScreen;