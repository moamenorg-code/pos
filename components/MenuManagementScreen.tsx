import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Product, Category, Recipe, Addon, AddonGroup } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CloneIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import ProductFormModal from './ProductFormModal';
import RecipesScreen from './RecipesScreen';
import CategoriesScreen from './CategoriesScreen';

const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-slate-400 dark:text-white transition-colors";

// --- AddonFormModal (New) ---
interface AddonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addon: Omit<Addon, 'id'> | Addon) => void;
    addonToEdit?: Addon | null;
}
const AddonFormModal: React.FC<AddonFormModalProps> = ({ isOpen, onClose, onSave, addonToEdit }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number|''>('');

    React.useEffect(() => {
        if (isOpen) { 
            setName(addonToEdit?.name || ''); 
            setPrice(addonToEdit?.price ?? ''); 
        }
    }, [isOpen, addonToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || price === '') return alert('يرجى ملء جميع الحقول.');
        onSave(addonToEdit ? { ...addonToEdit, name, price: Number(price) } : { name, price: Number(price) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border"><h2 className="text-2xl font-bold text-center">{addonToEdit ? 'تعديل الإضافة' : 'إضافة جديدة'}</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div><label htmlFor="addonName" className="block mb-2 text-sm font-medium">اسم الإضافة</label><input type="text" id="addonName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required autoFocus /></div>
                        <div><label htmlFor="addonPrice" className="block mb-2 text-sm font-medium">السعر</label><input type="number" id="addonPrice" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} required min="0" step="0.01" /></div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border"><button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">إلغاء</button><button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">حفظ</button></div>
                </form>
            </div>
        </div>
    );
};

// --- AddonGroupFormModal (New) ---
interface AddonGroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (group: Omit<AddonGroup, 'id'> | AddonGroup) => void;
    groupToEdit?: AddonGroup | null;
}
const AddonGroupFormModal: React.FC<AddonGroupFormModalProps> = ({ isOpen, onClose, onSave, groupToEdit }) => {
    const { addons } = useContext(AppContext) as AppContextType;
    const [name, setName] = useState('');
    const [selectionType, setSelectionType] = useState<'single' | 'multiple'>('multiple');
    const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            setName(groupToEdit?.name || '');
            setSelectionType(groupToEdit?.selectionType || 'multiple');
            setSelectedAddonIds(groupToEdit?.addonIds || []);
        }
    }, [isOpen, groupToEdit]);

    if (!isOpen) return null;

    const handleToggleAddon = (id: number) => setSelectedAddonIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('يرجى إدخال اسم المجموعة.');
        const data = { name, selectionType, addonIds: selectedAddonIds };
        onSave(groupToEdit ? { ...data, id: groupToEdit.id } : data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border"><h2 className="text-2xl font-bold text-center">{groupToEdit ? 'تعديل مجموعة إضافات' : 'مجموعة إضافات جديدة'}</h2></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div><label htmlFor="groupName" className="block mb-2 text-sm font-medium">اسم المجموعة</label><input type="text" id="groupName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required autoFocus /></div>
                        <div>
                            <p className="block mb-2 text-sm font-medium">نوع الاختيار</p>
                            <div className="flex gap-4"><label className="flex items-center"><input type="radio" value="multiple" checked={selectionType==='multiple'} onChange={() => setSelectionType('multiple')} className="w-4 h-4 text-primary"/> <span className="ms-2">متعدد</span></label><label className="flex items-center"><input type="radio" value="single" checked={selectionType==='single'} onChange={() => setSelectionType('single')} className="w-4 h-4 text-primary"/> <span className="ms-2">واحد فقط</span></label></div>
                        </div>
                        <div>
                            <p className="block mb-2 text-sm font-medium">اختر الإضافات</p>
                            <div className="p-2 border rounded-md max-h-48 overflow-y-auto grid grid-cols-2 gap-2 dark:border-dark-border">{addons.map(a => <label key={a.id} className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-alt rounded-md"><input type="checkbox" checked={selectedAddonIds.includes(a.id)} onChange={() => handleToggleAddon(a.id)} className="w-4 h-4 text-primary"/> <span className="ms-2">{a.name}</span></label>)}</div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border"><button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">إلغاء</button><button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">حفظ</button></div>
                </form>
            </div>
        </div>
    );
};

// --- Tab Content Components ---
const ProductsTab = () => {
    const { products, categories, addProduct, updateProduct, deleteProduct, currentUser } = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setFormOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const canManage = currentUser?.permissions.canManageMenu;
    const filteredProducts = useMemo(() => products.filter(p => !p.isRawMaterial && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.includes(searchTerm)))), [products, searchTerm]);
    const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';
    const handleSave = (data: any) => { 'id' in data ? updateProduct(data) : addProduct(data); setFormOpen(false); };
    const handleDelete = () => { if(productToDelete) deleteProduct(productToDelete); setConfirmOpen(false); };
    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <input type="text" placeholder="ابحث بالاسم أو الباركود..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputStyles} sm:w-72`} />
                {canManage && <button onClick={() => {setProductToEdit(null); setFormOpen(true);}} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark flex items-center gap-2 transition-colors"><PlusIcon className="w-5 h-5" /> منتج جديد</button>}
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-sm text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400"><tr><th className="px-6 py-3">المنتج</th><th className="px-6 py-3">التصنيف</th><th className="px-6 py-3">التكلفة</th><th className="px-6 py-3">السعر</th><th className="px-6 py-3">الكمية</th>{canManage && <th className="px-6 py-3">الإجراءات</th>}</tr></thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredProducts.map(p => {
                            const isLow = typeof p.lowStockThreshold === 'number' && p.stock <= p.lowStockThreshold;
                            return (<tr key={p.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${isLow ? 'bg-red-50 dark:bg-red-900/20' : ''}`}><th className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.name}</th><td className="px-6 py-4">{getCategoryName(p.categoryId)}</td><td className="px-6 py-4">{p.cost.toFixed(2)}</td><td className="px-6 py-4 font-semibold">{p.price.toFixed(2)}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${isLow ? 'bg-red-200 text-red-900' : ''}`}>{p.stock} {p.unit}</span></td>{canManage && <td className="px-6 py-4 flex items-center gap-3"><button onClick={() => {setProductToEdit(p); setFormOpen(true);}} className="text-blue-500"><EditIcon className="w-5 h-5"/></button><button onClick={() => {setProductToDelete(p.id); setConfirmOpen(true);}} className="text-red-500"><TrashIcon className="w-5 h-5"/></button></td>}</tr>)
                        })}
                    </tbody>
                </table>
            </div>
            <ProductFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSave={handleSave} productToEdit={productToEdit} defaultIsRawMaterial={false} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذا المنتج؟" />
        </div>
    );
}

const AddonsTab = () => {
    const { addons, addonGroups, addAddon, updateAddon, deleteAddon, addAddonGroup, updateAddonGroup, deleteAddonGroup, getAddonById, currentUser } = useContext(AppContext) as AppContextType;
    const [addonForm, setAddonForm] = useState<{isOpen: boolean, data: Addon | null}>({isOpen: false, data: null});
    const [groupForm, setGroupForm] = useState<{isOpen: boolean, data: AddonGroup | null}>({isOpen: false, data: null});
    const [confirm, setConfirm] = useState<{isOpen: boolean, type: 'addon'|'group', id: number|string|null}>({isOpen: false, type: 'addon', id: null});
    const canManage = currentUser?.permissions.canManageMenu;
    const handleSaveAddon = (data: any) => { 'id' in data ? updateAddon(data) : addAddon(data); setAddonForm({isOpen: false, data: null}); };
    const handleSaveGroup = (data: any) => { 'id' in data ? updateAddonGroup(data) : addAddonGroup(data); setGroupForm({isOpen: false, data: null}); };
    const handleDelete = () => { 
        if(confirm.id) {
            if (confirm.type === 'addon') deleteAddon(confirm.id as number);
            else deleteAddonGroup(confirm.id as number);
        }
        setConfirm({isOpen: false, type: 'addon', id: null}); 
    };

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex-1 flex flex-col"><div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold">الإضافات الفردية</h2>{canManage && <button onClick={() => setAddonForm({isOpen: true, data: null})} className="bg-primary text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1 transition-colors hover:bg-primary-dark"><PlusIcon className="w-4 h-4"/> إضافة</button>}</div><div className="overflow-auto border rounded-lg dark:border-dark-border flex-1"><table className="w-full text-right text-sm"><thead><tr className="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400"><th className="px-4 py-2">الاسم</th><th className="px-4 py-2">السعر</th>{canManage && <th className="px-4 py-2"></th>}</tr></thead><tbody className="divide-y dark:divide-dark-border text-slate-600 dark:text-slate-300">{addons.map(a => <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50"><td className="px-4 py-2 font-medium">{a.name}</td><td className="px-4 py-2">{a.price.toFixed(2)}</td>{canManage && <td className="text-left px-4 py-2"><button onClick={() => setAddonForm({isOpen: true, data: a})} className="p-1 text-blue-500"><EditIcon className="w-4 h-4"/></button><button onClick={() => setConfirm({isOpen: true, type: 'addon', id: a.id})} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button></td>}</tr>)}</tbody></table></div></div>
            <div className="flex-1 flex flex-col"><div className="flex justify-between items-center mb-2"><h2 className="text-xl font-bold">مجموعات الإضافات</h2>{canManage && <button onClick={() => setGroupForm({isOpen: true, data: null})} className="bg-primary text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1 transition-colors hover:bg-primary-dark"><PlusIcon className="w-4 h-4"/> إضافة</button>}</div><div className="overflow-auto border rounded-lg dark:border-dark-border flex-1"><table className="w-full text-right text-sm"><thead><tr className="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400"><th className="px-4 py-2">الاسم</th><th className="px-4 py-2">النوع</th><th className="px-4 py-2">الإضافات</th>{canManage && <th className="px-4 py-2"></th>}</tr></thead><tbody className="divide-y dark:divide-dark-border text-slate-600 dark:text-slate-300">{addonGroups.map(g => <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50"><td className="px-4 py-2 font-medium">{g.name}</td><td className="px-4 py-2">{g.selectionType === 'single' ? 'واحد' : 'متعدد'}</td><td className="px-4 py-2 text-xs">{g.addonIds.map(id => getAddonById(id)?.name).join(', ')}</td>{canManage && <td className="text-left px-4 py-2"><button onClick={() => setGroupForm({isOpen: true, data: g})} className="p-1 text-blue-500"><EditIcon className="w-4 h-4"/></button><button onClick={() => setConfirm({isOpen: true, type: 'group', id: g.id})} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button></td>}</tr>)}</tbody></table></div></div>
            <AddonFormModal isOpen={addonForm.isOpen} onClose={() => setAddonForm({isOpen: false, data: null})} onSave={handleSaveAddon} addonToEdit={addonForm.data} />
            <AddonGroupFormModal isOpen={groupForm.isOpen} onClose={() => setGroupForm({isOpen: false, data: null})} onSave={handleSaveGroup} groupToEdit={groupForm.data} />
            <ConfirmationModal isOpen={confirm.isOpen} onClose={() => setConfirm({isOpen: false, type: 'addon', id: null})} onConfirm={handleDelete} title="تأكيد الحذف" message="هل أنت متأكد من الحذف؟" />
        </div>
    );
};

// --- Main MenuManagementScreen Component ---
const MenuManagementScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'recipes' | 'addons'>('products');
    const { currentUser } = useContext(AppContext) as AppContextType;

    if (!currentUser?.permissions.canAccessMenu) {
        return <div className="p-6">ليس لديك الصلاحية للوصول لهذه الشاشة.</div>;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products': return <ProductsTab />;
            case 'categories': return <div className="p-0 m-0 h-full"><CategoriesScreen /></div>;
            case 'recipes': return <div className="p-0 m-0 h-full"><RecipesScreen /></div>;
            case 'addons': return <AddonsTab />;
            default: return null;
        }
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border h-full overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                     <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة القائمة</h1>
                </div>
                <div className="border-b-2 dark:border-dark-border">
                    <nav className="flex gap-4">
                        <button onClick={() => setActiveTab('products')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-light-text dark:hover:text-dark-text'}`}>المنتجات</button>
                        <button onClick={() => setActiveTab('categories')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-light-text dark:hover:text-dark-text'}`}>التصنيفات</button>
                        <button onClick={() => setActiveTab('recipes')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'recipes' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-light-text dark:hover:text-dark-text'}`}>الوصفات</button>
                        <button onClick={() => setActiveTab('addons')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'addons' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-light-text dark:hover:text-dark-text'}`}>الإضافات</button>
                    </nav>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto pt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default MenuManagementScreen;