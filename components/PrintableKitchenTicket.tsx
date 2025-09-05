import React, { useContext } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Sale } from '../types';

interface PrintableKitchenTicketProps {
    sale: Sale;
}

const PrintableKitchenTicket: React.FC<PrintableKitchenTicketProps> = ({ sale }) => {
    const { getCustomerById } = useContext(AppContext) as AppContextType;
    const customer = sale.customerId ? getCustomerById(sale.customerId) : null;
    
    const recipeItems = sale.items.filter(item => item.type === 'recipe');

    if (recipeItems.length === 0) return null;

    return (
        <div id="print-section" className="bg-white text-black p-4 w-[80mm] text-xs" style={{ fontFamily: 'monospace' }}>
            <div className="text-center mb-2">
                <h1 className="text-xl font-bold">طلب للمطبخ</h1>
            </div>

            <div className="border-t border-b border-dashed border-black my-2 py-1 text-sm">
                <p><strong>طلب رقم:</strong> #{sale.id.toString().padStart(4, '0')}</p>
                <p><strong>الوقت:</strong> {new Date(sale.date).toLocaleTimeString('ar-EG')}</p>
                {customer && <p><strong>العميل:</strong> {customer.name}</p>}
            </div>

            <table className="w-full text-base">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-right pb-1 font-bold">الصنف</th>
                        <th className="text-left pb-1 font-bold">الكمية</th>
                    </tr>
                </thead>
                <tbody>
                    {recipeItems.map(item => (
                        <tr key={`${item.id}-${item.type}`} className="align-top">
                            <td className="py-2 font-semibold text-lg">{item.name}</td>
                            <td className="text-left py-2 font-extrabold text-lg">x{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PrintableKitchenTicket;