import React, { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType } from '../types';
import { PlusIcon } from './icons';
import PaymentFormModal from './PaymentFormModal';

const PaymentsScreen: React.FC = () => {
    const { payments, addPayment, getCustomerById, getSupplierById, currentUser } = useContext(AppContext) as AppContextType;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formType, setFormType] = useState<'customer' | 'supplier'>('customer');
    
    const canManage = currentUser?.permissions.canManagePayments;

    const handleOpenModal = (type: 'customer' | 'supplier') => {
        setFormType(type);
        setIsFormModalOpen(true);
    };
    
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة المدفوعات</h1>
                {canManage && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleOpenModal('customer')}
                            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> دفعة من عميل
                        </button>
                        <button
                            onClick={() => handleOpenModal('supplier')}
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> دفعة لمورد
                        </button>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">النوع</th>
                            <th scope="col" className="px-6 py-3">الاسم</th>
                            <th scope="col" className="px-6 py-3">التاريخ</th>
                            <th scope="col" className="px-6 py-3">المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPayments.map((payment) => {
                             const entity = payment.type === 'customer' ? getCustomerById(payment.entityId) : getSupplierById(payment.entityId);
                             return (
                                <tr key={payment.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            payment.type === 'customer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {payment.type === 'customer' ? 'مقبوضات' : 'مدفوعات'}
                                        </span>
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {entity?.name || 'محذوف'}
                                    </th>
                                    <td className="px-6 py-4">{new Date(payment.date).toLocaleDateString('ar-SA')}</td>
                                    <td className="px-6 py-4 font-bold text-primary dark:text-cyan-400">{payment.amount.toFixed(2)} جنيه</td>
                                </tr>
                             )
                        })}
                         {payments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    لا توجد مدفوعات مسجلة.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PaymentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={addPayment}
                type={formType}
            />
        </div>
    );
};

export default PaymentsScreen;