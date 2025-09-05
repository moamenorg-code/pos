import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Product } from '../types';

const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-slate-400 dark:text-white transition-colors";

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'imageUrl'> | Product) => void;
    productToEdit?: Product | null;
    defaultIsRawMaterial: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit, defaultIsRawMaterial }) => {
    const { categories, addonGroups } = useContext(AppContext) as AppContextType;
    const [formData, setFormData] = useState<Partial<Product>>({});
    
    useEffect(() => {
        if (isOpen) {
            setFormData(productToEdit || { isRawMaterial: defaultIsRawMaterial });
        }
    }, [isOpen, productToEdit, defaultIsRawMaterial]);

    if (!isOpen) return null;
    
    const isRawMaterial = productToEdit ? productToEdit.isRawMaterial : defaultIsRawMaterial;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isChecked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? isChecked : value }));
    };
    
    const handleAddonGroupChange = (id: number) => {
        const currentIds = formData.addonGroupIds || [];
        const newIds = currentIds.includes(id) ? currentIds.filter(gid => gid !== id) : [...currentIds, id];
        setFormData(prev => ({...prev, addonGroupIds: newIds}));
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSave = {
            ...formData,
            isRawMaterial, // Ensure this is set correctly
            price: Number(formData.price || 0),
            cost: Number(formData.cost || 0),
            stock: Number(formData.stock || 0),
            categoryId: Number(formData.categoryId),
            wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : undefined,
            lowStockThreshold: formData.lowStockThreshold ? Number(formData.lowStockThreshold) : undefined,
        }

        onSave(dataToSave as Product);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border"><h2 className="text-2xl font-bold text-center">{productToEdit ? 'تعديل المنتج' : 'منتج جديد'}</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block mb-2 text-sm font-medium">اسم المنتج</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyles} required /></div>
                            <div><label className="block mb-2 text-sm font-medium">وحدة القياس</label><input type="text" name="unit" value={formData.unit || ''} onChange={handleChange} className={inputStyles} required placeholder="مثال: كجم، قطعة" /></div>
                            <div><label className="block mb-2 text-sm font-medium">التكلفة</label><input type="number" name="cost" value={formData.cost ?? ''} onChange={handleChange} className={inputStyles} required min="0" step="0.01" /></div>
                            <div><label className="block mb-2 text-sm font-medium">سعر البيع (تجزئة)</label><input type="number" name="price" value={formData.price ?? ''} onChange={handleChange} className={inputStyles} required min="0" step="0.01" /></div>
                            {!isRawMaterial && (<div><label className="block mb-2 text-sm font-medium">سعر البيع (جملة)</label><input type="number" name="wholesalePrice" value={formData.wholesalePrice ?? ''} onChange={handleChange} className={inputStyles} min="0" step="0.01" /></div>)}
                            <div><label className="block mb-2 text-sm font-medium">الكمية الأولية</label><input type="number" name="stock" value={formData.stock ?? ''} onChange={handleChange} className={inputStyles} required min="0" /></div>
                            <div><label className="block mb-2 text-sm font-medium">حد التنبيه (اختياري)</label><input type="number" name="lowStockThreshold" value={formData.lowStockThreshold ?? ''} onChange={handleChange} className={inputStyles} min="0" /></div>
                            <div><label className="block mb-2 text-sm font-medium">الباركود (اختياري)</label><input type="text" name="barcode" value={formData.barcode || ''} onChange={handleChange} className={inputStyles} /></div>
                            <div><label className="block mb-2 text-sm font-medium">التصنيف</label><select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className={inputStyles} required><option value="" disabled>اختر تصنيفًا</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                        </div>
                        {!isRawMaterial && addonGroups.length > 0 && (
                            <fieldset className="border p-4 rounded-md dark:border-dark-border"><legend className="px-2 font-semibold">مجموعات الإضافات</legend><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{addonGroups.map(g => <label key={g.id} className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-alt rounded-md"><input type="checkbox" checked={(formData.addonGroupIds || []).includes(g.id)} onChange={() => handleAddonGroupChange(g.id)} className="w-4 h-4 text-primary"/> <span className="ms-2 text-sm">{g.name}</span></label>)}</div></fieldset>
                        )}
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border"><button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">إلغاء</button><button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">حفظ</button></div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;