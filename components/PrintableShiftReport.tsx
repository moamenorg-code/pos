import React from 'react';
import type { Shift, Expense } from '../types';

interface PrintableShiftReportProps {
    shift: Shift;
    expenses: Expense[];
}

const PrintableShiftReport: React.FC<PrintableShiftReportProps> = ({ shift, expenses }) => {
    
    return (
        <div id="print-section" className="bg-white text-black p-4 w-[80mm] text-xs">
            <div className="text-center mb-2">
                <h1 className="text-lg font-bold">تقرير الوردية (Z-Report)</h1>
            </div>

            <div className="border-t border-b border-dashed border-black my-2 py-1">
                <p><strong>الوردية رقم:</strong> {shift.id}</p>
                <p><strong>المستخدم:</strong> {shift.userName}</p>
                <p><strong>وقت البدء:</strong> {new Date(shift.startTime).toLocaleString('ar-EG')}</p>
                <p><strong>وقت الإنهاء:</strong> {shift.endTime ? new Date(shift.endTime).toLocaleString('ar-EG') : '-'}</p>
            </div>

            <h2 className="font-bold text-center my-2">ملخص المبيعات</h2>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>مبيعات نقدية</span>
                    <span>{shift.cashSales.toFixed(2)} جنيه</span>
                </div>
                 <div className="flex justify-between">
                    <span>مبيعات شبكة</span>
                    <span>{shift.cardSales.toFixed(2)} جنيه</span>
                </div>
                 <div className="flex justify-between font-bold border-t border-dashed border-black mt-1 pt-1">
                    <span>إجمالي المبيعات</span>
                    <span>{shift.totalSales.toFixed(2)} جنيه</span>
                </div>
            </div>
            
            {expenses && expenses.length > 0 && (
                 <>
                    <h2 className="font-bold text-center my-2">المصروفات</h2>
                    <div className="space-y-1">
                        {expenses.map(exp => (
                            <div key={exp.id} className="flex justify-between">
                                <span>{exp.description}</span>
                                <span>- {exp.amount.toFixed(2)} جنيه</span>
                            </div>
                        ))}
                         <div className="flex justify-between font-bold border-t border-dashed border-black mt-1 pt-1">
                            <span>إجمالي المصروفات</span>
                            <span>- {shift.totalExpenses.toFixed(2)} جنيه</span>
                        </div>
                    </div>
                </>
            )}
            
            <h2 className="font-bold text-center my-2">ملخص النقدية</h2>
            <div className="space-y-1">
                 <div className="flex justify-between">
                    <span>نقدية بداية الوردية</span>
                    <span>{shift.startingCash.toFixed(2)} جنيه</span>
                </div>
                 <div className="flex justify-between">
                    <span>+ مبيعات نقدية</span>
                    <span>{shift.cashSales.toFixed(2)} جنيه</span>
                </div>
                 {shift.totalExpenses > 0 && (
                    <div className="flex justify-between">
                        <span>- إجمالي المصروفات</span>
                        <span>{shift.totalExpenses.toFixed(2)} جنيه</span>
                    </div>
                )}
                <div className="flex justify-between font-semibold border-t border-dashed border-black mt-1 pt-1">
                    <span>النقدية المتوقعة بالدرج</span>
                    <span>{shift.expectedCash.toFixed(2)} جنيه</span>
                </div>
                 <div className="flex justify-between">
                    <span>النقدية المحسوبة فعلياً</span>
                    <span>{shift.endingCash.toFixed(2)} جنيه</span>
                </div>
                 <div className={`flex justify-between font-bold text-base border-t-2 border-black mt-1 pt-1 ${shift.difference === 0 ? '' : shift.difference > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    <span>الفرق (عجز/زيادة)</span>
                    <span>{shift.difference.toFixed(2)} جنيه</span>
                </div>
            </div>
            
            <div className="text-center mt-4">
                <p>-- نهاية التقرير --</p>
            </div>
        </div>
    );
};

export default PrintableShiftReport;