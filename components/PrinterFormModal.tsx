import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Printer, PrinterType } from '../types';
import { WifiIcon, BluetoothIcon, UsbIcon } from './icons';

interface PrinterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    printerToEdit?: Printer | null;
}

const PrinterFormModal: React.FC<PrinterFormModalProps> = ({ isOpen, onClose, printerToEdit }) => {
    const { addPrinter, updatePrinter } = useContext(AppContext) as AppContextType;
    const [name, setName] = useState('');
    const [type, setType] = useState<PrinterType>('network');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (printerToEdit) {
                setName(printerToEdit.name);
                setType(printerToEdit.type);
                setAddress(printerToEdit.address);
            } else {
                setName('');
                setType('network');
                setAddress('');
            }
        }
    }, [isOpen, printerToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !address.trim()) {
            alert('يرجى ملء جميع الحقول المطلوبة.');
            return;
        }

        const printerData = { name, type, address };

        if (printerToEdit) {
            updatePrinter({ ...printerToEdit, ...printerData });
        } else {
            addPrinter(printerData);
        }
        onClose();
    };
    
    const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-slate-400 dark:text-white transition-colors";

    const renderFormFields = () => {
        switch(type) {
            case 'network':
                return (
                    <div>
                        <label htmlFor="printerAddress" className="block mb-2 text-sm font-medium">عنوان IP للطابعة (IP:Port)</label>
                        <input type="text" id="printerAddress" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} placeholder="192.168.1.100:9100" required />
                    </div>
                );
            case 'bluetooth':
                return (
                     <div>
                        <label htmlFor="printerAddress" className="block mb-2 text-sm font-medium">عنوان MAC للطابعة</label>
                        <div className="flex gap-2">
                             <input type="text" id="printerAddress" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} placeholder="00:11:22:33:FF:EE" required />
                             <button type="button" onClick={() => alert('محاكاة البحث... الرجاء إدخال العنوان يدوياً.')} className="bg-blue-500 text-white px-4 rounded-lg text-sm hover:bg-blue-600">بحث</button>
                        </div>
                    </div>
                );
            case 'usb':
                 return (
                     <div>
                        <label htmlFor="printerAddress" className="block mb-2 text-sm font-medium">معرّف الجهاز</label>
                         <div className="flex gap-2">
                            <input type="text" id="printerAddress" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} placeholder="VendorID:ProductID" required />
                            <button type="button" onClick={() => alert('محاكاة البحث... الرجاء إدخال العنوان يدوياً.')} className="bg-blue-500 text-white px-4 rounded-lg text-sm hover:bg-blue-600">بحث</button>
                         </div>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                        {printerToEdit ? 'تعديل بيانات الطابعة' : 'إضافة طابعة جديدة'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="printerName" className="block mb-2 text-sm font-medium">اسم الطابعة</label>
                            <input type="text" id="printerName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} placeholder="مثال: طابعة المطبخ" required autoFocus />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">نوع الاتصال</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => setType('network')} className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors ${type === 'network' ? 'border-primary bg-primary/10' : 'dark:border-dark-border'}`}>
                                    <WifiIcon className="w-6 h-6 mb-1"/> <span>شبكة</span>
                                </button>
                                <button type="button" onClick={() => setType('bluetooth')} className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors ${type === 'bluetooth' ? 'border-primary bg-primary/10' : 'dark:border-dark-border'}`}>
                                    <BluetoothIcon className="w-6 h-6 mb-1"/> <span>بلوتوث</span>
                                </button>
                                <button type="button" onClick={() => setType('usb')} className={`flex flex-col items-center p-3 border-2 rounded-lg transition-colors ${type === 'usb' ? 'border-primary bg-primary/10' : 'dark:border-dark-border'}`}>
                                    <UsbIcon className="w-6 h-6 mb-1"/> <span>USB</span>
                                </button>
                            </div>
                        </div>
                        {renderFormFields()}
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrinterFormModal;