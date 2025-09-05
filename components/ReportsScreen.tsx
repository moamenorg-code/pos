import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Sale } from '../types';
import { PrintIcon, ExportIcon } from './icons';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-xl shadow-md text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
    </div>
);

type ActiveTab = 'financial' | 'top_selling' | 'balances';

const ReportsScreen: React.FC = () => {
    const { sales, users, getCustomerById, customers, suppliers } = useContext(AppContext) as AppContextType;
    const [activeTab, setActiveTab] = useState<ActiveTab>('financial');
    const [filterType, setFilterType] = useState('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('all');

    const completedSales = useMemo(() => sales.filter(s => s.status === 'completed'), [sales]);

    const filteredSales = useMemo(() => {
        let startDate: Date;
        let endDate: Date = new Date();
        const now = new Date();

        switch (filterType) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'custom':
                startDate = customStartDate ? new Date(customStartDate) : new Date(0);
                startDate.setHours(0,0,0,0);
                endDate = customEndDate ? new Date(customEndDate) : new Date();
                endDate.setHours(23, 59, 59, 999); // Include the whole end day
                break;
            default:
                 startDate = new Date(now.setHours(0, 0, 0, 0));
        }

        return completedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            const userMatch = selectedUserId === 'all' || sale.userId === Number(selectedUserId);
            return saleDate >= startDate && saleDate <= endDate && userMatch;
        });

    }, [completedSales, filterType, customStartDate, customEndDate, selectedUserId]);

    const reportData = useMemo(() => {
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalCost = filteredSales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0);
        const totalTax = filteredSales.reduce((sum, sale) => sum + (sale.taxAmount || 0), 0);
        const grossProfit = totalRevenue - totalCost; // Profit before tax
        const invoiceCount = filteredSales.length;

        return { totalRevenue, totalCost, grossProfit, invoiceCount, totalTax };
    }, [filteredSales]);

    const topItems = useMemo(() => {
        const itemCounts: { [key: string]: { name: string; count: number } } = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const key = `${item.type}-${item.id}`;
                if(!itemCounts[key]) {
                    itemCounts[key] = { name: item.name, count: 0 };
                }
                itemCounts[key].count += item.quantity;
            });
        });
        const sortedItems = Object.values(itemCounts).sort((a,b) => b.count - a.count);
        return sortedItems.slice(0, 10);
    }, [filteredSales]);
    
    const customersWithBalance = useMemo(() => customers.filter(c => c.balance !== 0), [customers]);
    const suppliersWithBalance = useMemo(() => suppliers.filter(s => s.balance !== 0), [suppliers]);
    
    const handleCustomDateChange = () => {
        if (customStartDate && customEndDate) {
            setFilterType('custom');
        }
    }

    const downloadCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + data.map(e => headers.map(header => `"${e[header]}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        switch (activeTab) {
            case 'financial': {
                const data = filteredSales.map(s => ({
                    'رقم الفاتورة': s.id,
                    'التاريخ': new Date(s.date).toLocaleString('ar-EG'),
                    'المستخدم': s.userName,
                    'العميل': s.customerId ? (getCustomerById(s.customerId)?.name || '') : 'عميل نقدي',
                    'المجموع الفرعي': s.subTotal,
                    'الخصم': (s.subTotal - (s.totalAmount - s.taxAmount)),
                    'الضريبة': s.taxAmount,
                    'الإجمالي': s.totalAmount,
                    'التكلفة': s.totalCost
                }));
                downloadCSV(data, 'financial-summary');
                break;
            }
            case 'top_selling': {
                const data = topItems.map(item => ({ 'الصنف': item.name, 'الكمية المباعة': item.count }));
                downloadCSV(data, 'top-selling-items');
                break;
            }
            case 'balances': {
                const data = [
                    ...customersWithBalance.map(c => ({ 'النوع': 'عميل', 'الاسم': c.name, 'الرصيد': c.balance.toFixed(2) })),
                    ...suppliersWithBalance.map(s => ({ 'النوع': 'مورد', 'الاسم': s.name, 'الرصيد': s.balance.toFixed(2) }))
                ];
                downloadCSV(data, 'account-balances');
                break;
            }
        }
    };

    const handlePrint = () => {
        const printSection = document.getElementById('reports-content-area');
        if (printSection) {
            const printable = document.createElement('div');
            printable.id = 'print-reports-section';
            printable.innerHTML = printSection.innerHTML;
            document.body.appendChild(printable);
            window.print();
            document.body.removeChild(printable);
        }
    };

    const renderFinancialSummary = () => (
            <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard title="إجمالي الإيرادات" value={`${reportData.totalRevenue.toFixed(2)} جنيه`} />
                    <StatCard title="إجمالي التكلفة" value={`${reportData.totalCost.toFixed(2)} جنيه`} />
                    <StatCard title="إجمالي الربح" value={`${reportData.grossProfit.toFixed(2)} جنيه`} />
                    <StatCard title="إجمالي الضريبة" value={`${reportData.totalTax.toFixed(2)} جنيه`} />
                    <StatCard title="عدد الفواتير" value={reportData.invoiceCount.toString()} />
                </div>
                <div className="overflow-x-auto flex-grow">
                    <h2 className="text-xl font-bold mb-4">تفاصيل المبيعات</h2>
                    <table className="w-full text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">الفاتورة</th>
                                <th scope="col" className="px-6 py-3">التاريخ</th>
                                <th scope="col" className="px-6 py-3">المستخدم</th>
                                <th scope="col" className="px-6 py-3">العميل</th>
                                <th scope="col" className="px-6 py-3">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">SALE-{sale.id.toString().padStart(4, '0')}</th>
                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-6 py-4">{sale.userName}</td>
                                    <td className="px-6 py-4">{sale.customerId ? getCustomerById(sale.customerId)?.name : 'عميل نقدي'}</td>
                                    <td className="px-6 py-4 font-bold text-primary dark:text-cyan-400">{sale.totalAmount.toFixed(2)} جنيه</td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10">لا توجد مبيعات تطابق الفلاتر المحددة.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    
    const renderTopSelling = () => (
             <div className="overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">المنتجات والوصفات الأكثر مبيعاً</h2>
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">#</th>
                            <th scope="col" className="px-6 py-3">الاسم</th>
                            <th scope="col" className="px-6 py-3">الكمية المباعة</th>
                        </tr>
                    </thead>
                    <tbody>
                         {topItems.map((item, index) => (
                            <tr key={item.name} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border">
                                <td className="px-6 py-4">{index + 1}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                                <td className="px-6 py-4 font-bold">{item.count}</td>
                            </tr>
                        ))}
                         {topItems.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-10">لا توجد بيانات لعرضها.</td></tr>
                         )}
                    </tbody>
                </table>
            </div>
        );
    
     const renderBalances = () => (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                     <h2 className="text-xl font-bold mb-4">أرصدة العملاء</h2>
                     <table className="w-full text-right text-gray-500 dark:text-gray-400">
                         <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                             <tr>
                                 <th className="px-6 py-3">العميل</th>
                                 <th className="px-6 py-3">الرصيد</th>
                             </tr>
                         </thead>
                         <tbody>
                            {customersWithBalance.map(c => (
                               <tr key={c.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border">
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                  <td className={`px-6 py-4 font-bold ${c.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>{Math.abs(c.balance).toFixed(2)} جنيه {c.balance < 0 ? '(مدين)' : '(دائن)'}</td>
                               </tr>
                            ))}
                            {customersWithBalance.length === 0 && <tr><td colSpan={2} className="text-center py-10">لا توجد أرصدة مستحقة.</td></tr>}
                         </tbody>
                     </table>
                </div>
                 <div>
                     <h2 className="text-xl font-bold mb-4">أرصدة الموردين</h2>
                     <table className="w-full text-right text-gray-500 dark:text-gray-400">
                         <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                             <tr>
                                 <th className="px-6 py-3">المورد</th>
                                 <th className="px-6 py-3">الرصيد</th>
                             </tr>
                         </thead>
                         <tbody>
                            {suppliersWithBalance.map(s => (
                               <tr key={s.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border">
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                  <td className={`px-6 py-4 font-bold ${s.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>{Math.abs(s.balance).toFixed(2)} جنيه {s.balance < 0 ? '(مدين)' : '(دائن)'}</td>
                               </tr>
                            ))}
                            {suppliersWithBalance.length === 0 && <tr><td colSpan={2} className="text-center py-10">لا توجد أرصدة مستحقة.</td></tr>}
                         </tbody>
                     </table>
                </div>
            </div>
        )

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">التقارير المتقدمة</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <PrintIcon className="w-5 h-5"/> طباعة / PDF
                    </button>
                    <button onClick={handleExport} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                        <ExportIcon className="w-5 h-5"/> تصدير CSV
                    </button>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-bg-alt rounded-lg">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setFilterType('today')} className={`px-3 py-1 text-sm rounded-md ${filterType === 'today' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-border'}`}>اليوم</button>
                    <button onClick={() => setFilterType('week')} className={`px-3 py-1 text-sm rounded-md ${filterType === 'week' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-border'}`}>هذا الأسبوع</button>
                    <button onClick={() => setFilterType('month')} className={`px-3 py-1 text-sm rounded-md ${filterType === 'month' ? 'bg-primary text-white' : 'bg-white dark:bg-dark-border'}`}>هذا الشهر</button>
                </div>
                 <div className="flex items-center gap-2">
                     <input type="date" value={customStartDate} onChange={e => {setCustomStartDate(e.target.value); handleCustomDateChange(); }} className="p-1 text-sm rounded-md bg-white dark:bg-dark-border" />
                     <span>إلى</span>
                     <input type="date" value={customEndDate} onChange={e => {setCustomEndDate(e.target.value); handleCustomDateChange(); }} className="p-1 text-sm rounded-md bg-white dark:bg-dark-border" />
                </div>
                 <div className="flex items-center gap-2">
                     <label htmlFor="userFilter" className="text-sm">المستخدم:</label>
                     <select id="userFilter" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="p-1 text-sm rounded-md bg-white dark:bg-dark-border">
                         <option value="all">كل المستخدمين</option>
                         {users.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
                     </select>
                </div>
            </div>

            <div className="border-b-2 dark:border-dark-border mb-4">
                <nav className="flex gap-4">
                    <button onClick={() => setActiveTab('financial')} className={`py-2 px-4 font-semibold ${activeTab === 'financial' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>الملخص المالي</button>
                    <button onClick={() => setActiveTab('top_selling')} className={`py-2 px-4 font-semibold ${activeTab === 'top_selling' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>الأكثر مبيعاً</button>
                    <button onClick={() => setActiveTab('balances')} className={`py-2 px-4 font-semibold ${activeTab === 'balances' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>أرصدة الحسابات</button>
                </nav>
            </div>

            <div id="reports-content-area" className="flex-grow overflow-y-auto">
                {activeTab === 'financial' && renderFinancialSummary()}
                {activeTab === 'top_selling' && renderTopSelling()}
                {activeTab === 'balances' && renderBalances()}
            </div>
        </div>
    );
};

export default ReportsScreen;