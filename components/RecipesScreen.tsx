import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Recipe, Ingredient } from '../types';
import { PlusIcon, TrashIcon, EditIcon, CloneIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

// --- RecipeFormModal Component ---
interface RecipeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (recipe: Omit<Recipe, 'id'> | Recipe) => void;
    recipeToEdit?: Recipe | null;
    isClone?: boolean;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ isOpen, onClose, onSave, recipeToEdit, isClone = false }) => {
    const { products, categories, addonGroups } = useContext(AppContext) as AppContextType;
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [addonGroupIds, setAddonGroupIds] = useState<number[]>([]);

    const rawMaterials = products.filter(p => p.isRawMaterial);
    const recipeCategories = categories.filter(c => !products.some(p => p.isRawMaterial && p.categoryId === c.id));
    
    const resetForm = () => {
        setName('');
        setPrice('');
        setCategoryId(recipeCategories.length > 0 ? recipeCategories[0].id : '');
        setIngredients([]);
        setAddonGroupIds([]);
    };

    useEffect(() => {
        if (isOpen) {
            if (recipeToEdit) {
                setName(isClone ? `نسخة من ${recipeToEdit.name}` : recipeToEdit.name);
                setPrice(recipeToEdit.price);
                setCategoryId(recipeToEdit.categoryId);
                setIngredients(recipeToEdit.ingredients);
                setAddonGroupIds(recipeToEdit.addonGroupIds || []);
            } else {
                resetForm();
            }
        }
    }, [isOpen, recipeToEdit, isClone]);

    if (!isOpen) return null;

    const handleAddIngredient = () => {
        if (rawMaterials.length > 0) {
            setIngredients([...ingredients, { productId: rawMaterials[0].id, quantity: 0 }]);
        }
    };

    const handleIngredientChange = (index: number, field: 'productId' | 'quantity', value: string) => {
        const newIngredients = [...ingredients];
        const numericValue = parseFloat(value);
        if (field === 'productId') {
            newIngredients[index].productId = Number(value);
        } else {
            newIngredients[index].quantity = isNaN(numericValue) ? 0 : numericValue;
        }
        setIngredients(newIngredients);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleAddonGroupChange = (id: number) => {
        setAddonGroupIds(prev => prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || price === '' || categoryId === '' || ingredients.length === 0) {
            alert('يرجى ملء جميع الحقول وإضافة مكون واحد على الأقل.');
            return;
        }

        const finalIngredients = ingredients.filter(ing => ing.quantity > 0);
        if (finalIngredients.length === 0) {
            alert('يرجى تحديد كمية للمكونات.');
            return;
        }
        
        const recipeData = { name, price: Number(price), categoryId: Number(categoryId), ingredients: finalIngredients, addonGroupIds };
        
        if(recipeToEdit && !isClone){
            onSave({ ...recipeData, id: recipeToEdit.id });
        } else {
            onSave(recipeData);
        }
    };

    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
    
    const title = isClone ? 'استنساخ وصفة' : recipeToEdit ? 'تعديل الوصفة' : 'وصفة جديدة';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">{title}</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block mb-2 text-sm font-medium">اسم الوصفة</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required /></div>
                            <div><label className="block mb-2 text-sm font-medium">سعر البيع</label><input type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className={inputStyles} required min="0" step="0.01" /></div>
                            <div className="md:col-span-2"><label className="block mb-2 text-sm font-medium">التصنيف</label><select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className={inputStyles} required><option value="" disabled>اختر تصنيفًا</option>{recipeCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">المكونات</h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-dark-border">
                                {ingredients.map((ing, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <select value={ing.productId} onChange={e => handleIngredientChange(index, 'productId', e.target.value)} className={`${inputStyles} flex-grow`}>{rawMaterials.map(mat => <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>)}</select>
                                        <input type="number" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', e.target.value)} placeholder="الكمية" className={`${inputStyles} w-28`} min="0" step="0.001" />
                                        <button type="button" onClick={() => handleRemoveIngredient(index)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleAddIngredient} className="mt-3 flex items-center gap-2 text-primary font-semibold hover:underline"><PlusIcon className="w-5 h-5" /> إضافة مكون</button>
                        </div>
                        {addonGroups.length > 0 && (
                            <fieldset className="border p-4 rounded-md dark:border-dark-border"><legend className="px-2 font-semibold">مجموعات الإضافات</legend><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{addonGroups.map(g => <label key={g.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-alt rounded-md"><input type="checkbox" checked={addonGroupIds.includes(g.id)} onChange={() => handleAddonGroupChange(g.id)} className="w-4 h-4 text-primary"/> <span className="ms-2 text-sm">{g.name}</span></label>)}</div></fieldset>
                        )}
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border mt-auto"><button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">إلغاء</button><button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">حفظ</button></div>
                </form>
            </div>
        </div>
    );
};


// --- Main RecipesScreen Component ---
const RecipeCard: React.FC<{ recipe: Recipe; onEdit: () => void; onDelete: () => void; onClone: () => void; canManage: boolean; }> = ({ recipe, onEdit, onDelete, onClone, canManage }) => {
    const { getProductById } = useContext(AppContext) as AppContextType;

    const recipeCost = recipe.ingredients.reduce((total, ingredient) => {
        const product = getProductById(ingredient.productId);
        return total + (product ? product.cost * ingredient.quantity : 0);
    }, 0);

    const profit = recipe.price - recipeCost;

    return (
        <div className="bg-white dark:bg-dark-bg-alt rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-transform transform hover:scale-105">
            <div>
                {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-40 object-cover" />}
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{recipe.name}</h3>
                        <p className="text-xl font-extrabold text-primary dark:text-cyan-400">{recipe.price.toFixed(2)} جنيه</p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span>التكلفة: {recipeCost.toFixed(2)} جنيه</span>
                        <span className="mx-2">|</span>
                        <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'}>الربح: {profit.toFixed(2)} جنيه</span>
                    </div>
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">المكونات:</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {recipe.ingredients.map(ing => {
                                const product = getProductById(ing.productId);
                                return (
                                    <li key={ing.productId} className="flex justify-between">
                                        <span>{product?.name || 'مكون محذوف'}</span>
                                        <span>{ing.quantity} {product?.unit}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
            {canManage && (
                <div className="p-2 bg-gray-50 dark:bg-dark-card flex justify-end gap-2 border-t dark:border-dark-border">
                    <button onClick={onClone} className="flex items-center gap-1.5 py-1.5 px-3 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
                        <CloneIcon className="w-4 h-4" /> استنساخ
                    </button>
                    <button onClick={onEdit} className="flex items-center gap-1.5 py-1.5 px-3 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                        <EditIcon className="w-4 h-4" /> تعديل
                    </button>
                    <button onClick={onDelete} className="flex items-center gap-1.5 py-1.5 px-3 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                        <TrashIcon className="w-4 h-4" /> حذف
                    </button>
                </div>
            )}
        </div>
    );
}

const RecipesScreen: React.FC = () => {
    const { recipes, addRecipe, updateRecipe, deleteRecipe, currentUser } = useContext(AppContext) as AppContextType;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
    const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);
    const [isCloneMode, setIsCloneMode] = useState(false);

    const canManage = currentUser?.permissions.canManageMenu;

    const handleOpenFormModal = (recipe: Recipe | null, isClone = false) => {
        setRecipeToEdit(recipe);
        setIsCloneMode(isClone);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setRecipeToEdit(null);
        setIsCloneMode(false);
    };

    const handleSaveRecipe = (recipeData: Omit<Recipe, 'id'> | Recipe) => {
        if ('id' in recipeData && !isCloneMode) {
            updateRecipe(recipeData);
        } else {
            const { id, ...newRecipeData } = recipeData as Recipe;
            addRecipe(newRecipeData);
        }
        handleCloseFormModal();
    };

    const handleDeleteClick = (recipeId: number) => {
        setRecipeToDelete(recipeId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (recipeToDelete) {
            deleteRecipe(recipeToDelete);
        }
        setIsConfirmModalOpen(false);
        setRecipeToDelete(null);
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة الوصفات</h1>
                {canManage && (
                    <button 
                        onClick={() => handleOpenFormModal(null)}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" /> وصفة جديدة
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recipes.map(recipe => (
                       <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            onEdit={() => handleOpenFormModal(recipe)}
                            onDelete={() => handleDeleteClick(recipe.id)}
                            onClone={() => handleOpenFormModal(recipe, true)}
                            canManage={!!canManage}
                        />
                    ))}
                </div>
            </div>

            <RecipeFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSave={handleSaveRecipe}
                recipeToEdit={recipeToEdit}
                isClone={isCloneMode}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه الوصفة؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
};

export default RecipesScreen;