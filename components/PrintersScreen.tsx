import React, { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import { AppContextType, Printer } from '../types';
import { PlusIcon, EditIcon, TrashIcon, WifiIcon, BluetoothIcon, UsbIcon, PrintIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import PrinterFormModal from './PrinterFormModal';

const PrintersScreen: React.FC = () => {
    const { printers, deletePrinter, setDefaultPrinter, currentUser } = useContext(AppContext) as AppContextType;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [printerToEdit, setPrinterToEdit] = useState<Printer | null>(null);
    const [printerToDelete, setPrinterToDelete] = useState<string | null>(null);

    const handleOpenFormModal = (printer: Printer | null) => {
        setPrinterToEdit(printer);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (printerId: string) => {
        setPrinterToDelete(printerId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (printerToDelete) {
            deletePrinter(printerToDelete);
        }
        setIsConfirmModalOpen(false);
        setPrinterToDelete(null);
    };

    const getPrinterIcon = (type: Printer['type']) => {
        switch (type) {
            case 'network': return <WifiIcon className="w-6 h-6 text-blue-500" />;
            case 'bluetooth': return <BluetoothIcon className="w-6 h-6 text-indigo-500" />;
            case 'usb': return <UsbIcon className="w-6 h-6 text-gray-500" />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">إدارة الطابعات</h2>
                <button
                    onClick={() => handleOpenFormModal(null)}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> طابعة جديدة
                </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4">
                {printers.length > 0 ? (
                    printers.map(printer => (
                        <div key={printer.id} className="bg-light-bg dark:bg-dark-bg-alt p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {getPrinterIcon(printer.type)}
                                <div>
                                    <p className="font-bold text-light-text dark:text-dark-text">{printer.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{printer.address}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-green-600 dark:text-green-400">متصل</span>
                                         {printer.isDefaultReceipt && <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">طابعة الفواتير</span>}
                                         {printer.isDefaultKitchen && <span className="text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-0.5 rounded-full">طابعة المطبخ</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <button onClick={() => setDefaultPrinter(printer.id, 'receipt')} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">تعيين للفواتير</button>
                                <button onClick={() => setDefaultPrinter(printer.id, 'kitchen')} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">تعيين للمطبخ</button>
                                <button onClick={() => alert(`جاري إرسال صفحة اختبار إلى ${printer.name}`)} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">اختبار</button>
                                <button onClick={() => handleOpenFormModal(printer)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDeleteClick(printer.id)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <PrintIcon className="w-16 h-16 mx-auto text-gray-400" />
                        <p className="mt-4 font-semibold">لم يتم إضافة أي طابعات بعد.</p>
                        <p className="text-sm">انقر على "طابعة جديدة" للبدء.</p>
                    </div>
                )}
            </div>

            <PrinterFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setPrinterToEdit(null); }}
                printerToEdit={printerToEdit}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه الطابعة؟"
            />
        </div>
    );
};

export default PrintersScreen;