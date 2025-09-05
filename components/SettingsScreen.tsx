import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, ShopInfo, BackupData } from '../types';
import { EditIcon } from './icons';
import { db } from './db';
import ConfirmationModal from './ConfirmationModal';
import PrintersScreen from './PrintersScreen';

// --- ShopInfoFormModal Component ---
interface ShopInfoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (info: Omit<ShopInfo, 'id'>) => void;
    currentInfo: ShopInfo;
}

const ShopInfoFormModal: React.FC<ShopInfoFormModalProps> = ({ isOpen, onClose, onSave, currentInfo }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
    const [pointsPerPound, setPointsPerPound] = useState<number | ''>(1);
    const [poundPerPoint, setPoundPerPoint] = useState<number | ''>(0.05);
    const [taxEnabled, setTaxEnabled] = useState(true);
    const [taxRate, setTaxRate] = useState<number | ''>(15);

    useEffect(() => {
        if (isOpen) {
            setName(currentInfo.name);
            setAddress(currentInfo.address);
            setPhone(currentInfo.phone);
            setLogoUrl(currentInfo.logoUrl);
            setLoyaltyEnabled(currentInfo.loyaltyEnabled);
            setPointsPerPound(currentInfo.pointsPerPound);
            setPoundPerPoint(currentInfo.poundPerPoint);
            setTaxEnabled(currentInfo.taxEnabled);
            setTaxRate(currentInfo.taxRate);
        }
    }, [isOpen, currentInfo]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !address.trim() || !phone.trim() || pointsPerPound === '' || poundPerPoint === '' || taxRate === '') {
            alert('يرجى ملء جميع الحقول.');
            return;
        }
        onSave({ 
            name, 
            address, 
            phone, 
            logoUrl, 
            loyaltyEnabled, 
            pointsPerPound: Number(pointsPerPound),
            poundPerPoint: Number(poundPerPoint),
            taxEnabled,
            taxRate: Number(taxRate)
        });
        onClose();
    };
    
    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                        تعديل معلومات المحل
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <fieldset className="border p-4 rounded-md dark:border-dark-border">
                            <legend className="px-2 font-semibold">المعلومات الأساسية</legend>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="shopName" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">اسم المحل</label>
                                    <input type="text" id="shopName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required />
                                </div>
                                <div>
                                    <label htmlFor="shopAddress" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">العنوان</label>
                                    <input type="text" id="shopAddress" value={address} onChange={e => setAddress(e.target.value)} className={inputStyles} required />
                                </div>
                                 <div>
                                    <label htmlFor="shopPhone" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">رقم الهاتف</label>
                                    <input type="tel" id="shopPhone" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyles} required />
                                </div>
                                <div>
                                    <label htmlFor="shopLogo" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">رابط الشعار (URL)</label>
                                    <input type="url" id="shopLogo" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className={inputStyles} />
                                </div>
                            </div>
                        </fieldset>

                         <fieldset className="border p-4 rounded-md dark:border-dark-border">
                            <legend className="px-2 font-semibold">إعدادات الضريبة (VAT)</legend>
                            <div className="space-y-4">
                                 <div className="flex items-center">
                                    <input id="taxEnabled" type="checkbox" checked={taxEnabled} onChange={e => setTaxEnabled(e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                    <label htmlFor="taxEnabled" className="ms-2 text-sm font-medium text-light-text dark:text-dark-text">تفعيل الضريبة على الفواتير</label>
                                </div>
                                <div>
                                    <label htmlFor="taxRate" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">نسبة الضريبة (%)</label>
                                    <input type="number" id="taxRate" value={taxRate} onChange={e => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} required min="0" step="0.01" />
                                </div>
                            </div>
                        </fieldset>

                         <fieldset className="border p-4 rounded-md dark:border-dark-border">
                            <legend className="px-2 font-semibold">نظام نقاط الولاء</legend>
                            <div className="space-y-4">
                                 <div className="flex items-center">
                                    <input id="loyaltyEnabled" type="checkbox" checked={loyaltyEnabled} onChange={e => setLoyaltyEnabled(e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor="loyaltyEnabled" className="ms-2 text-sm font-medium text-light-text dark:text-dark-text">تفعيل نظام النقاط</label>
                                </div>
                                <div>
                                    <label htmlFor="pointsPerPound" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">عدد النقاط المكتسبة لكل جنيه</label>
                                    <input type="number" id="pointsPerPound" value={pointsPerPound} onChange={e => setPointsPerPound(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} required min="0" step="0.01" />
                                </div>
                                <div>
                                    <label htmlFor="poundPerPoint" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">قيمة النقطة الواحدة بالجنيه (عند الاستبدال)</label>
                                    <input type="number" id="poundPerPoint" value={poundPerPoint} onChange={e => setPoundPerPoint(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} required min="0" step="0.01" />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GeneralSettings: React.FC = () => {
    const { shopInfo, updateShopInfo } = useContext(AppContext) as AppContextType;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = async () => {
        try {
            const data = await db.exportAllData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `pos-backup-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('تم إنشاء النسخة الاحتياطية بنجاح!');
        } catch (error) {
            console.error('Failed to create backup:', error);
            alert('فشل إنشاء النسخة الاحتياطية.');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setBackupFile(file);
            setIsRestoreConfirmOpen(true);
        }
    };

    const handleRestore = async () => {
        if (!backupFile) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonString = event.target?.result as string;
                const data = JSON.parse(jsonString) as BackupData;
                
                if (!data.products || !data.sales || !data.shopInfo) {
                    throw new Error('Invalid backup file structure');
                }

                await db.importAllData(data);
                alert('تم استعادة البيانات بنجاح! سيتم إعادة تحميل التطبيق الآن.');
                window.location.reload();

            } catch (error) {
                console.error('Failed to restore data:', error);
                alert('فشل استعادة البيانات. قد يكون الملف تالفًا أو غير متوافق.');
            } finally {
                setIsRestoreConfirmOpen(false);
                setBackupFile(null);
                 if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(backupFile);
    };
    
    if (!shopInfo) {
        return null; // Or a loading spinner
    }

    return (
        <div className="space-y-8">
            {/* Shop Info Section */}
            <div className="p-6 border rounded-lg dark:border-dark-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">معلومات المحل</h2>
                    <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50">
                        <EditIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img 
                        src={shopInfo.logoUrl} 
                        alt="شعار المحل" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-dark-border"
                    />
                    <div className="text-center sm:text-right">
                        <p className="text-xl font-bold">{shopInfo.name}</p>
                        <p className="text-gray-600 dark:text-gray-300">{shopInfo.address}</p>
                        <p className="text-gray-600 dark:text-gray-300">هاتف: {shopInfo.phone}</p>
                    </div>
                </div>
            </div>

             {/* Tax Settings Section */}
            <div className="p-6 border rounded-lg dark:border-dark-border">
                <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">إعدادات الضريبة (VAT)</h2>
                 <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-alt rounded-md">
                        <span className="font-semibold">الحالة</span>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${shopInfo.taxEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {shopInfo.taxEnabled ? 'مُفعّلة' : 'مُعطّلة'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-alt rounded-md">
                        <span className="font-semibold">نسبة الضريبة</span>
                        <span className="font-bold">{shopInfo.taxRate}%</span>
                    </div>
                </div>
            </div>


            {/* Loyalty Program Section */}
             <div className="p-6 border rounded-lg dark:border-dark-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">نظام نقاط الولاء</h2>
                </div>
                <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-alt rounded-md">
                        <span className="font-semibold">الحالة</span>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${shopInfo.loyaltyEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {shopInfo.loyaltyEnabled ? 'مُفعّل' : 'مُعطّل'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-alt rounded-md">
                        <span className="font-semibold">نقاط مكتسبة لكل جنيه</span>
                        <span className="font-bold">{shopInfo.pointsPerPound}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-alt rounded-md">
                        <span className="font-semibold">قيمة النقطة (بالجنيه)</span>
                        <span className="font-bold">{shopInfo.poundPerPoint.toFixed(2)}</span>
                    </div>
                </div>
            </div>


            {/* Backup and Restore Section */}
            <div className="p-6 border rounded-lg dark:border-dark-border">
                <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">النسخ الاحتياطي والاستعادة</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleBackup}
                        className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        إنشاء نسخة احتياطية
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        استعادة نسخة احتياطية
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="application/json"
                    />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    احتفظ بنسخة من بياناتك في مكان آمن. استعادة نسخة احتياطية سيؤدي إلى الكتابة فوق جميع البيانات الحالية.
                </p>
            </div>
            
            <ShopInfoFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={updateShopInfo}
                currentInfo={shopInfo}
            />
            <ConfirmationModal
                isOpen={isRestoreConfirmOpen}
                onClose={() => {
                    setIsRestoreConfirmOpen(false)
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                onConfirm={handleRestore}
                title="تأكيد الاستعادة"
                message="تحذير: سيؤدي هذا الإجراء إلى حذف جميع البيانات الحالية بشكل نهائي واستبدالها ببيانات النسخة الاحتياطية. هل أنت متأكد من المتابعة؟"
                confirmText="نعم، قم بالاستعادة"
                confirmColor="bg-blue-600 hover:bg-blue-700"
            />
        </div>
    );
};

// --- Main SettingsScreen Component ---
const SettingsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'printers'>('general');

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">الإعدادات</h1>
                </div>
                <div className="border-b-2 dark:border-dark-border">
                    <nav className="flex gap-4">
                        <button onClick={() => setActiveTab('general')} className={`py-2 px-4 font-semibold ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                            الإعدادات العامة
                        </button>
                        <button onClick={() => setActiveTab('printers')} className={`py-2 px-4 font-semibold ${activeTab === 'printers' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                            إدارة الطابعات
                        </button>
                    </nav>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pt-6">
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'printers' && <PrintersScreen />}
            </div>
        </div>
    );
};

export default SettingsScreen;