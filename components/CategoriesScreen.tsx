import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Category } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

// --- CategoryFormModal Component ---
interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Omit<Category, 'id'> | Category) => void;
    categoryToEdit?: Category | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, categoryToEdit }) => {
    const [name, setName] = useState('');

    const resetForm = () => {
        setName('');
    };

    useEffect(() => {
        if (isOpen) {
            if (categoryToEdit) {
                setName(categoryToEdit.name);
            } else {
                resetForm();
            }
        }
    }, [isOpen, categoryToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('يرجى إدخال اسم التصنيف.');
            return;
        }

        const categoryData = { name };

        if (categoryToEdit) {
            onSave({ ...categoryData, id: categoryToEdit.id });
        } else {
            onSave(categoryData);
        }
        onClose();
    };
    
    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                        {categoryToEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="categoryName" className="block mb-2 text-sm font-medium text-light-text dark:text-dark-text">اسم التصنيف</label>
                            <input type="text" id="categoryName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required autoFocus />
                        </div>
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

// --- Main CategoriesScreen Component ---
const CategoriesScreen: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, currentUser } = useContext(AppContext) as AppContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    
    // Fix: Replaced canManageCategories with canManageMenu to align with updated permissions.
    const canManage = currentUser?.permissions.canManageMenu;

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) {
          return categories;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return categories.filter(category => 
          category.name.toLowerCase().includes(lowercasedTerm)
        );
    }, [categories, searchTerm]);

    const handleOpenFormModal = (category: Category | null) => {
        setCategoryToEdit(category);
        setIsFormModalOpen(true);
    };

    const handleSaveCategory = (categoryData: Omit<Category, 'id'> | Category) => {
        if ('id' in categoryData) {
            updateCategory(categoryData);
        } else {
            addCategory(categoryData);
        }
        setIsFormModalOpen(false);
        setCategoryToEdit(null);
    };

    const handleDeleteClick = (categoryId: number) => {
        setCategoryToDelete(categoryId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (categoryToDelete !== null) {
            deleteCategory(categoryToDelete);
        }
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة التصنيفات</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white"
                    />
                    {canManage && (
                        <button
                            onClick={() => handleOpenFormModal(null)}
                            className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap">
                            <PlusIcon className="w-5 h-5" /> تصنيف جديد
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم التصنيف</th>
                            {canManage && <th scope="col" className="px-6 py-3">الإجراءات</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <tr key={category.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {category.name}
                                    </th>
                                    {canManage && (
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <button onClick={() => handleOpenFormModal(category)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(category.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={canManage ? 2 : 1} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'لم يتم العثور على تصنيفات تطابق بحثك.' : 'لا يوجد تصنيفات لعرضها.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <CategoryFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setCategoryToEdit(null); }}
                onSave={handleSaveCategory}
                categoryToEdit={categoryToEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا التصنيف؟"
            />
        </div>
    );
};

export default CategoriesScreen;