import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Shift, Expense } from '../types';
import { PlusIcon } from './icons';
import PaymentsScreen from './PaymentsScreen';

const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

// --- StartShiftModal ---
const StartShiftModal: React.FC<{ isOpen: boolean; onClose: () => void; onStart: (cash: number) => void; }> = ({ isOpen, onClose, onStart }) => {
    const [startingCash, setStartingCash] = useState('');
    if (!isOpen) return null;

    const handleStart = () => {
        const cash = parseFloat(startingCash);
        if (!isNaN(cash) && cash >= 0) {
            onStart(cash);
            onClose();
        } else {
            alert('الرجاء إدخال مبلغ صحيح.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-xl font-bold text-center mb-4">بدء وردية جديدة</h2>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-4">أدخل مبلغ النقدية المبدئي في الدرج:</p>
                <input type="number" value={startingCash} onChange={(e) => setStartingCash(e.target.value)} className={`${inputStyles} text-center`} placeholder="0.00" autoFocus />
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                    <button onClick={handleStart} className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">بدء الوردية</button>
                </div>
            </div>
        </div>
    );
};


// --- EndShiftModal ---
const EndShiftModal: React.FC<{ isOpen: boolean; onClose: () => void; onEnd: (cash: number) => void; }> = ({ isOpen, onClose, onEnd }) => {
    const [endingCash, setEndingCash] = useState('');
    if (!isOpen) return null;

    const handleEnd = () => {
        const cash = parseFloat(endingCash);
        if (!isNaN(cash) && cash >= 0) {
            onEnd(cash);
            onClose();
        } else {
            alert('الرجاء إدخال المبلغ النهائي الصحيح.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-xl font-bold text-center mb-4">إنهاء الوردية</h2>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-4">أدخل المبلغ الإجمالي للنقدية المحسوبة في الدرج:</p>
                <input type="number" value={endingCash} onChange={(e) => setEndingCash(e.target.value)} className={`${inputStyles} text-center`} placeholder="0.00" autoFocus />
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                    <button onClick={handleEnd} className="py-2 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">إنهاء وطباعة التقرير</button>
                </div>
            </div>
        </div>
    );
};

// --- ShiftsTabContent Component ---
const ShiftsTabContent: React.FC = () => {
    const { currentUser, activeShift, startShift, endShift, shifts, setShiftToPrint } = useContext(AppContext) as AppContextType;
    const [isStartModalOpen, setStartModalOpen] = useState(false);
    const [isEndModalOpen, setEndModalOpen] = useState(false);
    
    const canManage = currentUser?.permissions.canManageShifts;

    const sortedShifts = useMemo(() => {
        return [...shifts]
            .filter(s => s.status === 'closed')
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [shifts]);

    return (
        <div className="h-full flex flex-col">
            {/* Shift Controls */}
            <div className="mb-6 p-4 border rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-bg-alt">
                {activeShift ? (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                           <p className="font-bold text-green-600 dark:text-green-400 text-lg">وردية مفتوحة حالياً</p>
                           <p className="text-sm text-gray-600 dark:text-gray-300">
                                بواسطة {activeShift.userName} منذ {new Date(activeShift.startTime).toLocaleTimeString('ar-EG')}
                           </p>
                        </div>
                        <button onClick={() => setEndModalOpen(true)} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                            إنهاء الوردية
                        </button>
                    </div>
                ) : (
                     <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="font-bold text-gray-700 dark:text-gray-200 text-lg">لا توجد وردية مفتوحة حالياً.</p>
                        <button onClick={() => setStartModalOpen(true)} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors">
                           بدء وردية جديدة
                        </button>
                    </div>
                )}
            </div>

            {/* Shift History for Managers */}
            {canManage && (
                 <div className="overflow-x-auto flex-grow">
                     <h2 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">سجل الورديات</h2>
                    <table className="w-full text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">المستخدم</th>
                                <th scope="col" className="px-6 py-3">وقت البدء</th>
                                <th scope="col" className="px-6 py-3">وقت الإنهاء</th>
                                <th scope="col" className="px-6 py-3">إجمالي المبيعات</th>
                                <th scope="col" className="px-6 py-3">فرق النقدية</th>
                                <th scope="col" className="px-6 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedShifts.map((shift) => (
                                <tr key={shift.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{shift.userName}</td>
                                    <td className="px-6 py-4">{new Date(shift.startTime).toLocaleString('ar-EG')}</td>
                                    <td className="px-6 py-4">{shift.endTime ? new Date(shift.endTime).toLocaleString('ar-EG') : '-'}</td>
                                    <td className="px-6 py-4 font-bold text-primary dark:text-cyan-400">{shift.totalSales.toFixed(2)} جنيه</td>
                                    <td className={`px-6 py-4 font-bold ${shift.difference === 0 ? '' : shift.difference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {shift.difference.toFixed(2)} جنيه
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setShiftToPrint(shift)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                            عرض التقرير
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {sortedShifts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10">لا يوجد سجل ورديات لعرضه.</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            )}
            
            <StartShiftModal isOpen={isStartModalOpen} onClose={() => setStartModalOpen(false)} onStart={startShift} />
            <EndShiftModal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} onEnd={endShift} />
        </div>
    );
};

// --- ExpensesTabContent Component ---
const ExpensesTabContent: React.FC = () => {
    const { activeShift, expenses, addExpense } = useContext(AppContext) as AppContextType;
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');

    const shiftExpenses = useMemo(() => {
        if (!activeShift) return [];
        return expenses.filter(e => e.shiftId === activeShift.id);
    }, [expenses, activeShift]);

    if (!activeShift) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">يجب بدء وردية جديدة لتتمكن من تسجيل المصروفات.</p>
            </div>
        );
    }
    
    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || amount === '' || Number(amount) <= 0) {
            alert('يرجى إدخال وصف ومبلغ صحيح للمصروف.');
            return;
        }
        await addExpense({ description, amount: Number(amount) });
        setDescription('');
        setAmount('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Add Expense Form */}
            <div>
                <h2 className="text-xl font-bold mb-4">تسجيل مصروف جديد</h2>
                <form onSubmit={handleAddExpense} className="space-y-4 p-4 border rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-bg-alt">
                    <div>
                        <label htmlFor="expDesc" className="block mb-2 text-sm font-medium">وصف المصروف</label>
                        <input id="expDesc" type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputStyles} placeholder="مثال: فاتورة كهرباء" required />
                    </div>
                    <div>
                        <label htmlFor="expAmount" className="block mb-2 text-sm font-medium">المبلغ</label>
                        <input id="expAmount" type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} placeholder="0.00" required min="0.01" step="0.01" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" /> إضافة مصروف
                    </button>
                </form>
            </div>

            {/* Expenses List */}
            <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-4">مصروفات الوردية الحالية</h2>
                <div className="overflow-y-auto flex-grow border rounded-lg dark:border-dark-border p-2">
                     {shiftExpenses.length > 0 ? (
                        <ul className="divide-y dark:divide-dark-border">
                            {shiftExpenses.map(expense => (
                                <li key={expense.id} className="flex justify-between items-center p-3">
                                    <div>
                                        <p className="font-medium">{expense.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleTimeString('ar-EG')}</p>
                                    </div>
                                    <p className="font-bold text-red-500">{expense.amount.toFixed(2)} جنيه</p>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-8">لا توجد مصروفات مسجلة لهذه الوردية.</p>
                     )}
                </div>
            </div>
        </div>
    );
};


// --- Main ShiftsScreen Component with Tabs ---
const ShiftsScreen: React.FC = () => {
    const { currentUser } = useContext(AppContext) as AppContextType;
    const [activeTab, setActiveTab] = useState<'shifts' | 'payments' | 'expenses'>('shifts');

    const canAccessPayments = currentUser?.permissions.canAccessPayments;

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                     <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">الورديات والمدفوعات</h1>
                </div>
                <div className="border-b-2 dark:border-dark-border">
                    <nav className="flex gap-4">
                        <button onClick={() => setActiveTab('shifts')} className={`py-2 px-4 font-semibold ${activeTab === 'shifts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                            إدارة الورديات
                        </button>
                        {canAccessPayments && (
                            <button onClick={() => setActiveTab('payments')} className={`py-2 px-4 font-semibold ${activeTab === 'payments' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                                إدارة المدفوعات
                            </button>
                        )}
                        <button onClick={() => setActiveTab('expenses')} className={`py-2 px-4 font-semibold ${activeTab === 'expenses' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                            المصروفات
                        </button>
                    </nav>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pt-6">
                {activeTab === 'shifts' && <ShiftsTabContent />}
                {activeTab === 'payments' && canAccessPayments && <div className="p-0 m-0 h-full"><PaymentsScreen /></div>}
                {activeTab === 'expenses' && <ExpensesTabContent />}
            </div>
        </div>
    );
};

export default ShiftsScreen;