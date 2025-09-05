import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Sale } from '../types';
import { PrintIcon, TrashIcon, EyeIcon, PaymentIcon, ChartBarIcon, DocumentTextIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

// --- SaleDetailsModal Component ---
interface SaleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPrint: (sale: Sale) => void;
    onCancel: (saleId: number) => void;
    sale: Sale | null;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ isOpen, onClose, onPrint, onCancel, sale }) => {
    const { getCustomerById, shopInfo, currentUser } = useContext(AppContext) as AppContextType;
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    
    if (!isOpen || !sale || !shopInfo) return null;

    const customer = sale.customerId ? getCustomerById(sale.customerId) : null;
    const canCancel = currentUser?.permissions.canCancelSales;
    
    const getPaymentDetailsText = (details: { cash: number; card: number; credit: number; }) => {
        const parts = [];
        if (details.cash > 0) parts.push(`نقدي: ${details.cash.toFixed(2)} جنيه`);
        if (details.card > 0) parts.push(`شبكة: ${details.card.toFixed(2)} جنيه`);
        if (details.credit > 0) parts.push(`آجل: ${details.credit.toFixed(2)} جنيه`);
        return parts.length > 0 ? parts.join('، ') : 'غير محدد';
    };

    const handlePrintClick = () => {
        onPrint(sale);
    }
    
    const handleCancelClick = () => {
        setConfirmOpen(true);
    }

    const handleConfirmCancel = () => {
        onCancel(sale.id);
        setConfirmOpen(false);
        onClose();
    }

    let generalDiscountAmount = 0;
    let discountLabel = '';
    if(sale.discountType === 'percentage') {
        generalDiscountAmount = sale.subTotal * (sale.discountValue / 100);
        discountLabel = `الخصم (${sale.discountValue}%):`;
    } else if (sale.discountType === 'fixed') {
        generalDiscountAmount = sale.discountValue;
        discountLabel = `الخصم:`;
    }

    const loyaltyDiscountAmount = sale.pointsRedeemed * shopInfo.poundPerPoint;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b dark:border-dark-border">
                        <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                            تفاصيل الفاتورة رقم #{sale.id.toString().padStart(4, '0')}
                        </h2>
                         {sale.status === 'canceled' && (
                            <p className="text-center text-red-500 font-bold mt-2">-- فاتورة ملغاة --</p>
                        )}
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <div className="mb-4">
                            <p><strong>التاريخ:</strong> {new Date(sale.date).toLocaleString('ar-EG')}</p>
                            <p><strong>العميل:</strong> {customer?.name || 'عميل نقدي'}</p>
                            {customer && (
                                <>
                                    <p><strong>الهاتف:</strong> {customer.phone}</p>
                                    {customer.address && <p><strong>العنوان:</strong> {customer.address}</p>}
                                </>
                            )}
                            <p><strong>المستخدم:</strong> {sale.userName}</p>
                            <p><strong>طريقة الدفع:</strong> {getPaymentDetailsText(sale.paymentDetails)}</p>
                        </div>
                        <h3 className="font-bold mb-2">المنتجات:</h3>
                        <ul className="divide-y dark:divide-dark-border">
                            {sale.items.map(item => {
                                const addonsPrice = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
                                const itemTotalPrice = (item.price + addonsPrice) * item.quantity;
                                return (
                                <li key={item.cartItemId} className="py-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.quantity} x {(item.price + addonsPrice).toFixed(2)} جنيه
                                            </p>
                                        </div>
                                        <p className="font-bold">{itemTotalPrice.toFixed(2)} جنيه</p>
                                    </div>
                                    <div className="pr-4 text-xs">
                                    {item.selectedAddons.map(addon => (
                                        <p key={addon.id} className="text-blue-600 dark:text-blue-400">+ {addon.name} ({addon.price.toFixed(2)})</p>
                                    ))}
                                    {item.notes && <p className="text-gray-500 dark:text-gray-400 italic">ملاحظة: {item.notes}</p>}
                                    </div>
                                </li>
                                )
                            })}
                        </ul>
                        <div className="border-t dark:border-dark-border mt-4 pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>المجموع الفرعي:</span>
                                <span>{sale.subTotal.toFixed(2)} جنيه</span>
                            </div>
                            {generalDiscountAmount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>{discountLabel}</span>
                                    <span>- {generalDiscountAmount.toFixed(2)} جنيه</span>
                                </div>
                            )}
                            {loyaltyDiscountAmount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>خصم النقاط:</span>
                                    <span>- {loyaltyDiscountAmount.toFixed(2)} جنيه</span>
                                </div>
                            )}
                             {sale.deliveryFee > 0 && (
                                <div className="flex justify-between">
                                    <span>رسوم التوصيل:</span>
                                    <span>{sale.deliveryFee.toFixed(2)} جنيه</span>
                                </div>
                            )}
                            {sale.taxAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>الضريبة المضافة ({shopInfo.taxRate}%):</span>
                                    <span>{sale.taxAmount.toFixed(2)} جنيه</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xl font-bold border-t pt-2 dark:border-dark-border">
                                <span className="text-light-text dark:text-dark-text">الإجمالي:</span>
                                <span className="text-primary dark:text-cyan-400">{sale.totalAmount.toFixed(2)} جنيه</span>
                            </div>
                        </div>

                         {shopInfo.loyaltyEnabled && customer && (sale.pointsEarned > 0 || sale.pointsRedeemed > 0) && (
                            <div className="border-t dark:border-dark-border mt-4 pt-4">
                                <h3 className="font-bold mb-2">ملخص نقاط الولاء:</h3>
                                {sale.pointsEarned > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>النقاط المكتسبة:</span>
                                        <span className="text-green-600 font-semibold">+ {sale.pointsEarned}</span>
                                    </div>
                                )}
                                {sale.pointsRedeemed > 0 && (
                                     <div className="flex justify-between text-sm">
                                        <span>النقاط المستخدمة:</span>
                                        <span className="text-red-600 font-semibold">- {sale.pointsRedeemed}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm mt-1">
                                    <span>الرصيد الحالي للعميل:</span>
                                    <span className="font-bold">{customer.loyaltyPoints} نقطة</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t dark:border-dark-border flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إغلاق</button>
                        {canCancel && sale.status !== 'canceled' && (
                             <button type="button" onClick={handleCancelClick} className="py-2 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                <TrashIcon className="w-5 h-5"/>
                                إلغاء الفاتورة
                             </button>
                        )}
                        <button type="button" onClick={handlePrintClick} className="py-2 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                            <PrintIcon className="w-5 h-5"/>
                            طباعة
                        </button>
                    </div>
                </div>
            </div>
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmCancel}
                title="تأكيد الإلغاء"
                message="هل أنت متأكد من إلغاء هذه الفاتورة؟ سيتم إرجاع المخزون وتعديل رصيد العميل ونقاط الولاء."
             />
        </>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-xl shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
        </div>
    </div>
);


// --- Main SalesHistoryScreen Component ---
const SalesHistoryScreen: React.FC = () => {
    const { sales, customers, users, getCustomerById, setSaleToPrint, cancelSale } = useContext(AppContext) as AppContextType;
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [filtersVisible, setFiltersVisible] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('all');
    const [selectedUserId, setSelectedUserId] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'canceled'>('all');
    
    const inputStyles = "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg dark:border-dark-border dark:placeholder-gray-400 dark:text-white";

    const filteredSales = useMemo(() => {
        return sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if(start) start.setHours(0,0,0,0);
                if(end) end.setHours(23,59,59,999);

                if (start && saleDate < start) return false;
                if (end && saleDate > end) return false;
                if (selectedCustomerId !== 'all' && sale.customerId !== Number(selectedCustomerId)) return false;
                if (selectedUserId !== 'all' && sale.userId !== Number(selectedUserId)) return false;
                if (selectedStatus !== 'all' && sale.status !== selectedStatus) return false;
                
                if (searchTerm.trim()) {
                    const lowerSearchTerm = searchTerm.toLowerCase();
                    const customerName = sale.customerId ? getCustomerById(sale.customerId)?.name.toLowerCase() : '';
                    if (
                        !sale.id.toString().includes(lowerSearchTerm) &&
                        !customerName?.includes(lowerSearchTerm)
                    ) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, searchTerm, startDate, endDate, selectedCustomerId, selectedUserId, selectedStatus, getCustomerById]);
    
    const summary = useMemo(() => {
        const completed = filteredSales.filter(s => s.status === 'completed');
        const total = completed.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const profit = completed.reduce((sum, sale) => sum + (sale.totalAmount - (sale.totalCost || 0)), 0);
        const count = filteredSales.length;
        return { total, profit, count };
    }, [filteredSales]);

    const resetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setSelectedCustomerId('all');
        setSelectedUserId('all');
        setSelectedStatus('all');
    };


    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">سجل المبيعات</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    استعرض وابحث في جميع فواتير المبيعات السابقة.
                </p>
            </div>

            {/* Filters Section */}
            <div className="flex-shrink-0 mb-4 border rounded-lg dark:border-dark-border bg-gray-50 dark:bg-dark-bg-alt">
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border/20 transition-colors" onClick={() => setFiltersVisible(!filtersVisible)}>
                    <h2 className="font-semibold text-light-text dark:text-dark-text">خيارات البحث والتصفية</h2>
                    <svg className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
                {filtersVisible && (
                    <div className="p-4 border-t dark:border-dark-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">بحث سريع</label>
                                <input type="text" placeholder="رقم الفاتورة أو اسم العميل..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputStyles} />
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">من تاريخ</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyles} />
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">إلى تاريخ</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyles} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">العميل</label>
                                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className={inputStyles}>
                                    <option value="all">كل العملاء</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">المستخدم</label>
                                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className={inputStyles}>
                                    <option value="all">كل المستخدمين</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">الحالة</label>
                                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)} className={inputStyles}>
                                    <option value="all">كل الحالات</option>
                                    <option value="completed">مكتملة</option>
                                    <option value="canceled">ملغاة</option>
                                </select>
                            </div>
                            <button onClick={resetFilters} className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors h-10">إعادة تعيين</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div className="flex-shrink-0 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="إجمالي المبيعات (المكتملة)" value={`${summary.total.toFixed(2)} جنيه`} icon={<PaymentIcon className="w-6 h-6 text-blue-600 dark:text-blue-300"/>} color="bg-blue-100 dark:bg-blue-900/50" />
                <StatCard title="إجمالي الربح" value={`${summary.profit.toFixed(2)} جنيه`} icon={<ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-300"/>} color="bg-green-100 dark:bg-green-900/50" />
                <StatCard title="عدد الفواتير" value={summary.count.toString()} icon={<DocumentTextIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-300"/>} color="bg-yellow-100 dark:bg-yellow-900/50" />
            </div>

            <div className="overflow-auto flex-grow -mx-6 px-6">
                <table className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/60 dark:text-gray-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">رقم الفاتورة</th>
                            <th scope="col" className="px-6 py-3">التاريخ</th>
                            <th scope="col" className="px-6 py-3">العميل</th>
                            <th scope="col" className="px-6 py-3">المستخدم</th>
                            <th scope="col" className="px-6 py-3">الإجمالي</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {filteredSales.map((sale) => (
                            <tr key={sale.id} className={`hover:bg-gray-50 dark:hover:bg-dark-bg-alt ${sale.status === 'canceled' ? 'bg-red-50/50 dark:bg-red-900/10 opacity-70' : ''}`}>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    SALE-{sale.id.toString().padStart(4, '0')}
                                </th>
                                <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td className="px-6 py-4">{sale.customerId ? getCustomerById(sale.customerId)?.name : 'عميل نقدي'}</td>
                                <td className="px-6 py-4">{sale.userName}</td>
                                <td className={`px-6 py-4 font-bold ${sale.status === 'canceled' ? 'line-through text-gray-400' : 'text-primary dark:text-cyan-400'}`}>{sale.totalAmount.toFixed(2)} جنيه</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${
                                        sale.status === 'canceled'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                    }`}>
                                        <span className={`h-2 w-2 rounded-full ${sale.status === 'canceled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        {sale.status === 'canceled' ? 'ملغاة' : 'مكتملة'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => setSelectedSale(sale)}
                                        className="p-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                        aria-label="عرض التفاصيل"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-16 text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <DocumentTextIcon className="w-12 h-12 mb-2"/>
                                        <span className="font-semibold">لا توجد مبيعات</span>
                                        <span className="text-sm">جرّب تغيير فلاتر البحث أو إضافة مبيعات جديدة.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <SaleDetailsModal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                onPrint={setSaleToPrint}
                onCancel={cancelSale}
                sale={selectedSale}
            />
        </div>
    );
};

export default SalesHistoryScreen;