import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Sale } from '../types';

interface PrintableInvoiceProps {
    sale: Sale;
}

const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ sale }) => {
    const { shopInfo, getCustomerById } = useContext(AppContext) as AppContextType;
    const customer = sale.customerId ? getCustomerById(sale.customerId) : null;
    
    if(!shopInfo) return null;

    let generalDiscountAmount = 0;
    let discountLabel = '';
    if(sale.discountType === 'percentage') {
        generalDiscountAmount = sale.subTotal * (sale.discountValue / 100);
        discountLabel = `الخصم (${sale.discountValue}%)`;
    } else if (sale.discountType === 'fixed') {
        generalDiscountAmount = sale.discountValue;
        discountLabel = 'الخصم';
    }

    const loyaltyDiscountAmount = sale.pointsRedeemed * shopInfo.poundPerPoint;

    return (
        <div id="print-section" className="bg-white text-black p-4 w-[80mm] text-xs">
            <div className="text-center">
                {shopInfo.logoUrl && <img src={shopInfo.logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-2" />}
                <h1 className="text-lg font-bold">{shopInfo.name}</h1>
                <p>{shopInfo.address}</p>
                <p>هاتف: {shopInfo.phone}</p>
            </div>

            <div className="border-t border-b border-dashed border-black my-2 py-1">
                <p><strong>فاتورة رقم:</strong> {sale.id.toString().padStart(4, '0')}</p>
                <p><strong>التاريخ:</strong> {new Date(sale.date).toLocaleString('ar-EG')}</p>
                {customer && (
                    <>
                        <p><strong>العميل:</strong> {customer.name}</p>
                        <p><strong>الهاتف:</strong> {customer.phone}</p>
                        {customer.address && <p><strong>العنوان:</strong> {customer.address}</p>}
                    </>
                )}
                <p><strong>الكاشير:</strong> {sale.userName}</p>
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-right pb-1">الصنف</th>
                        <th className="text-center pb-1">الكمية</th>
                        <th className="text-center pb-1">السعر</th>
                        <th className="text-left pb-1">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map(item => {
                        const addonsPrice = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
                        const itemTotal = (item.price + addonsPrice) * item.quantity;
                        return (
                            <React.Fragment key={item.cartItemId}>
                                <tr className="align-top">
                                    <td className="py-1">{item.name}</td>
                                    <td className="text-center py-1">{item.quantity}</td>
                                    <td className="text-center py-1">{(item.price + addonsPrice).toFixed(2)}</td>
                                    <td className="text-left py-1">{itemTotal.toFixed(2)}</td>
                                </tr>
                                {item.selectedAddons.map(addon => (
                                    <tr key={addon.id}>
                                        <td colSpan={4} className="pb-1 pr-4 text-gray-600">
                                            + {addon.name} ({addon.price.toFixed(2)})
                                        </td>
                                    </tr>
                                ))}
                                {item.notes && (
                                     <tr>
                                        <td colSpan={4} className="pb-1 pr-4 text-gray-500 text-xs italic">
                                            ملاحظة: {item.notes}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )
                    })}
                </tbody>
            </table>
            
            <div className="border-t border-dashed border-black mt-2 pt-2 space-y-1">
                <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{sale.subTotal.toFixed(2)} جنيه</span>
                </div>
                {generalDiscountAmount > 0 && (
                     <div className="flex justify-between">
                        <span>{discountLabel}</span>
                        <span>- {generalDiscountAmount.toFixed(2)} جنيه</span>
                    </div>
                )}
                {sale.pointsRedeemed > 0 && (
                     <div className="flex justify-between">
                        <span>خصم النقاط ({sale.pointsRedeemed} نقطة)</span>
                        <span>- {loyaltyDiscountAmount.toFixed(2)} جنيه</span>
                    </div>
                )}
                {sale.deliveryFee > 0 && (
                     <div className="flex justify-between">
                        <span>رسوم التوصيل</span>
                        <span>{sale.deliveryFee.toFixed(2)} جنيه</span>
                    </div>
                )}
                {sale.taxAmount > 0 && (
                     <div className="flex justify-between">
                        <span>الضريبة المضافة ({shopInfo.taxRate}%)</span>
                        <span>{sale.taxAmount.toFixed(2)} جنيه</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-dashed border-black mt-1 pt-1">
                    <span>الإجمالي</span>
                    <span>{sale.totalAmount.toFixed(2)} جنيه</span>
                </div>
            </div>
            
            <div className="border-t border-dashed border-black mt-2 pt-2">
                 <h3 className="font-bold text-center mb-1">تفاصيل الدفع</h3>
                 {sale.paymentDetails.cash > 0 && (
                    <div className="flex justify-between">
                        <span>نقدي</span>
                        <span>{sale.paymentDetails.cash.toFixed(2)} جنيه</span>
                    </div>
                 )}
                 {sale.paymentDetails.card > 0 && (
                    <div className="flex justify-between">
                        <span>شبكة</span>
                        <span>{sale.paymentDetails.card.toFixed(2)} جنيه</span>
                    </div>
                 )}
                 {sale.paymentDetails.credit > 0 && (
                    <div className="flex justify-between">
                        <span>آجل</span>
                        <span>{sale.paymentDetails.credit.toFixed(2)} جنيه</span>
                    </div>
                 )}
            </div>

            {shopInfo.loyaltyEnabled && customer && (
                 <div className="border-t border-dashed border-black mt-2 pt-2">
                    <h3 className="font-bold text-center mb-1">ملخص نقاط الولاء</h3>
                    <div className="flex justify-between">
                        <span>النقاط المكتسبة</span>
                        <span>+ {sale.pointsEarned}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>الرصيد الجديد</span>
                        <span>{customer.loyaltyPoints} نقطة</span>
                    </div>
                 </div>
            )}

            <div className="text-center mt-4">
                <p>شكراً لزيارتكم!</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;