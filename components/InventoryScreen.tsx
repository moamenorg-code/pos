import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Product } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CurrencyDollarIcon, CubeIcon, ExclamationIcon, SwitchVerticalIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import ProductFormModal from './ProductFormModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
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

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product: Product | null;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const [newStock, setNewStock] = useState<number | ''>('');

    useEffect(() => {
        if (isOpen && product) {
            setNewStock(product.stock);
        } else {
            setNewStock('');
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleSave = () => {
        if (newStock === '' || isNaN(Number(newStock)) || Number(newStock) < 0) {
            alert('يرجى إدخال كمية صحيحة.');
            return;
        }
        onSave({ ...product, stock: Number(newStock) });
        onClose();
    };

    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-xl font-bold text-center mb-2">تعديل كمية المخزون</h2>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-4 font-semibold">{product.name}</p>
                <div>
                    <label className="block mb-2 text-sm font-medium">الكمية الجديدة ({product.unit})</label>
                    <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`${inputStyles} text-center`}
                        placeholder="0"
                        autoFocus
                    />
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                    <button onClick={handleSave} className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">حفظ</button>
                </div>
            </div>
        </div>
    );
};


const InventoryScreen: React.FC = () => {
    const { products, categories, addProduct, updateProduct, deleteProduct, currentUser } = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

    const canManage = currentUser?.permissions.canManageInventory;
    const rawMaterials = useMemo(() => products.filter(p => p.isRawMaterial), [products]);

    const filteredMaterials = useMemo(() => {
        if (!searchTerm.trim()) return rawMaterials;
        const lowercasedTerm = searchTerm.toLowerCase();
        return rawMaterials.filter(p => p.name.toLowerCase().includes(lowercasedTerm));
    }, [rawMaterials, searchTerm]);

    const stats = useMemo(() => {
        const totalValue = rawMaterials.reduce((sum, p) => sum + p.cost * p.stock, 0);
        const lowStockCount = rawMaterials.filter(p => typeof p.lowStockThreshold === 'number' && p.stock <= p.lowStockThreshold).length;
        return {
            totalValue,
            itemCount: rawMaterials.length,
            lowStockCount,
        };
    }, [rawMaterials]);
    
    const handleOpenFormModal = (product: Product | null) => {
        setProductToEdit(product);
        setIsFormModalOpen(true);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id' | 'imageUrl'> | Product) => {
        if ('id' in productData) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
        setIsFormModalOpen(false);
        setProductToEdit(null);
    };

    const handleDeleteClick = (productId: number) => {
        setProductToDelete(productId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (productToDelete !== null) {
            deleteProduct(productToDelete);
        }
        setIsConfirmModalOpen(false);
        setProductToDelete(null);
    };

    const handleOpenStockModal = (product: Product) => {
        setProductToAdjust(product);
        setIsStockModalOpen(true);
    }
    
    const handleAdjustStock = (product: Product) => {
        updateProduct(product);
        setIsStockModalOpen(false);
        setProductToAdjust(null);
    }

    const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة المخزون (المواد الأولية)</h1>
                    {canManage && (
                        <button onClick={() => handleOpenFormModal(null)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> مادة خام جديدة
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="قيمة المخزون" value={`${stats.totalValue.toFixed(2)} جنيه`} icon={<CurrencyDollarIcon className="w-6 h-6 text-green-500"/>} color="bg-green-100 dark:bg-green-900/50" />
                    <StatCard title="عدد الأصناف" value={stats.itemCount} icon={<CubeIcon className="w-6 h-6 text-blue-500"/>} color="bg-blue-100 dark:bg-blue-900/50" />
                    <StatCard title="أصناف قاربت على النفاد" value={stats.lowStockCount} icon={<ExclamationIcon className="w-6 h-6 text-yellow-500"/>} color="bg-yellow-100 dark:bg-yellow-900/50" />
                </div>
                <div className="mb-4">
                    <input type="text" placeholder="ابحث بالاسم..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full sm:w-72 p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white" />
                </div>
            </div>
            
            <div className="overflow-x-auto flex-grow">
                 <table className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/60 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">المادة</th>
                            <th scope="col" className="px-6 py-3">التصنيف</th>
                            <th scope="col" className="px-6 py-3">الكمية الحالية</th>
                            <th scope="col" className="px-6 py-3">تكلفة الوحدة</th>
                            <th scope="col" className="px-6 py-3">القيمة الإجمالية</th>
                            {canManage && <th scope="col" className="px-6 py-3">الإجراءات</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {filteredMaterials.map(p => {
                            const isLow = typeof p.lowStockThreshold === 'number' && p.stock <= p.lowStockThreshold;
                            return (
                                <tr key={p.id} className={`border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600 ${isLow ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-dark-bg-alt'}`}>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{p.name}</th>
                                    <td className="px-6 py-4">{getCategoryName(p.categoryId)}</td>
                                    <td className="px-6 py-4"><span className={`font-bold ${isLow ? 'text-red-600 dark:text-red-400' : ''}`}>{p.stock} {p.unit}</span></td>
                                    <td className="px-6 py-4">{p.cost.toFixed(2)} جنيه</td>
                                    <td className="px-6 py-4 font-semibold">{(p.stock * p.cost).toFixed(2)} جنيه</td>
                                    {canManage && (
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <button onClick={() => handleOpenStockModal(p)} className="p-1 text-green-600 dark:text-green-400" title="تعديل الكمية"><SwitchVerticalIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenFormModal(p)} className="p-1 text-blue-600 dark:text-blue-400" title="تعديل بيانات المنتج"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteClick(p.id)} className="p-1 text-red-600 dark:text-red-400" title="حذف المنتج"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ProductFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveProduct} productToEdit={productToEdit} defaultIsRawMaterial={true} />
            <StockAdjustmentModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} onSave={handleAdjustStock} product={productToAdjust} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء." />
        </div>
    );
};

export default InventoryScreen;
