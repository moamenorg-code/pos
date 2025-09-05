import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, User, UserRole, UserPermissions } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

// Fix: Updated to match the UserPermissions interface in types.ts
const ALL_FALSE_PERMISSIONS: UserPermissions = {
    canAccessSales: false,
    canGiveDiscount: false,
    canAccessSalesHistory: false,
    canCancelSales: false,
    canAccessMenu: false,
    canManageMenu: false,
    canAccessInventory: false,
    canManageInventory: false,
    canAccessCustomers: false,
    canManageCustomers: false,
    canAccessSuppliers: false,
    canManageSuppliers: false,
    canAccessPurchases: false,
    canManagePurchases: false,
    canAccessPayments: false,
    canManagePayments: false,
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessShifts: false,
    canManageShifts: false,
};

// Fix: Updated to use the new unified menu permissions.
const PERMISSIONS_CONFIG: { key: keyof UserPermissions, label: string, group: string }[] = [
    { key: 'canAccessSales', label: 'الوصول إلى شاشة المبيعات', group: 'المبيعات' },
    { key: 'canGiveDiscount', label: 'تطبيق الخصومات في المبيعات', group: 'المبيعات' },
    { key: 'canAccessSalesHistory', label: 'الوصول إلى سجل المبيعات', group: 'المبيعات' },
    { key: 'canCancelSales', label: 'إلغاء الفواتير', group: 'المبيعات' },
    { key: 'canAccessShifts', label: 'الوصول للورديات', group: 'المبيعات' },
    { key: 'canAccessMenu', label: 'الوصول إلى إدارة القائمة', group: 'الإدارة' },
    { key: 'canManageMenu', label: 'إدارة القائمة (المنتجات, الوصفات, الخ)', group: 'الإدارة' },
    { key: 'canAccessInventory', label: 'الوصول إلى المخزون', group: 'الإدارة' },
    { key: 'canManageInventory', label: 'إدارة المخزون (المواد الأولية)', group: 'الإدارة' },
    { key: 'canAccessCustomers', label: 'الوصول للعملاء', group: 'الإدارة' },
    { key: 'canManageCustomers', label: 'إدارة العملاء', group: 'الإدارة' },
    { key: 'canAccessSuppliers', label: 'الوصول للموردين', group: 'الإدارة' },
    { key: 'canManageSuppliers', label: 'إدارة الموردين', group: 'الإدارة' },
    { key: 'canAccessPurchases', label: 'الوصول للمشتريات', group: 'الإدارة' },
    { key: 'canManagePurchases', label: 'إدارة المشتريات', group: 'الإدارة' },
    { key: 'canAccessPayments', label: 'الوصول للمدفوعات', group: 'الإدارة' },
    { key: 'canManagePayments', label: 'إدارة المدفوعات', group: 'الإدارة' },
    { key: 'canManageShifts', label: 'إدارة جميع الورديات', group: 'الإدارة' },
    { key: 'canAccessReports', label: 'الوصول للتقارير', group: 'الإدارة المتقدمة' },
    { key: 'canAccessSettings', label: 'الوصول للإعدادات العامة', group: 'الإدارة المتقدمة' },
    { key: 'canManageUsers', label: 'إدارة المستخدمين والصلاحيات', group: 'الإدارة المتقدمة' },
];


// Fix: Updated role templates to use the new unified menu permissions.
const getPermissionsForRole = (role: UserRole): UserPermissions => {
    switch(role) {
        case 'admin':
            return Object.keys(ALL_FALSE_PERMISSIONS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as UserPermissions);
        case 'manager':
             return {
                ...ALL_FALSE_PERMISSIONS,
                canAccessSales: true, canGiveDiscount: true, canAccessSalesHistory: true, canCancelSales: true,
                canAccessMenu: true, canManageMenu: true,
                canAccessInventory: true, canManageInventory: true,
                canAccessCustomers: true, canManageCustomers: true,
                canAccessSuppliers: true, canManageSuppliers: true,
                canAccessPurchases: true, canManagePurchases: true,
                canAccessPayments: true, canManagePayments: true, canAccessReports: true,
                canAccessShifts: true, canManageShifts: true,
            };
        case 'cashier':
             return { ...ALL_FALSE_PERMISSIONS, canAccessSales: true, canAccessSalesHistory: true, canAccessShifts: true };
        case 'custom':
            return { ...ALL_FALSE_PERMISSIONS };
    }
}


// --- UserFormModal Component ---
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'> | User) => void;
    userToEdit?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [role, setRole] = useState<UserRole>('cashier');
    const [permissions, setPermissions] = useState<UserPermissions>(getPermissionsForRole('cashier'));

    const resetForm = () => {
        setName('');
        setPin('');
        setConfirmPin('');
        setRole('cashier');
        setPermissions(getPermissionsForRole('cashier'));
    };

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setName(userToEdit.name);
                setRole(userToEdit.role);
                setPermissions(userToEdit.permissions);
                setPin('');
                setConfirmPin('');
            } else {
                resetForm();
            }
        }
    }, [isOpen, userToEdit]);

    useEffect(() => {
        if(role !== 'custom') {
            setPermissions(getPermissionsForRole(role));
        }
    }, [role]);
    
    const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
        setPermissions(prev => ({...prev, [key]: value}));
        setRole('custom');
    }

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (userToEdit) {
            if (pin && (pin.length !== 4 || pin !== confirmPin)) {
                alert('الرمز السري يجب أن يتكون من 4 أرقام وأن يتطابق مع التأكيد.');
                return;
            }
        } else {
             if (!pin || pin.length !== 4 || pin !== confirmPin) {
                alert('الرمز السري إلزامي ويجب أن يتكون من 4 أرقام وأن يتطابق مع التأكيد.');
                return;
            }
        }

        const userData = { 
            name, 
            pin: pin || userToEdit?.pin || '',
            role,
            permissions
        };

        if (userToEdit) {
            onSave({ ...userData, id: userToEdit.id, pin: pin || userToEdit.pin });
        } else {
            onSave(userData as Omit<User, 'id'>);
        }
        onClose();
    };
    
    const inputStyles = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white";
    const permissionGroups = PERMISSIONS_CONFIG.reduce((acc, p) => {
        if(!acc[p.group]) acc[p.group] = [];
        acc[p.group].push(p);
        return acc;
    }, {} as Record<string, typeof PERMISSIONS_CONFIG>);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text">
                        {userToEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="userName" className="block mb-2 text-sm font-medium">اسم المستخدم</label>
                                <input type="text" id="userName" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required />
                            </div>
                             <div>
                                <label htmlFor="userRole" className="block mb-2 text-sm font-medium">الأدوار (قالب جاهز)</label>
                                <select id="userRole" value={role} onChange={e => setRole(e.target.value as UserRole)} className={inputStyles} required>
                                    <option value="cashier">كاشير</option>
                                    <option value="manager">مدير</option>
                                    <option value="admin">مدير النظام</option>
                                    <option value="custom">مخصص</option>
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="userPin" className="block mb-2 text-sm font-medium">
                                    {userToEdit ? 'الرمز السري الجديد (اتركه فارغًا)' : 'الرمز السري (4 أرقام)'}
                                </label>
                                <input type="password" id="userPin" value={pin} onChange={e => setPin(e.target.value)} className={inputStyles} maxLength={4} />
                            </div>
                             <div>
                                <label htmlFor="confirmPin" className="block mb-2 text-sm font-medium">تأكيد الرمز السري</label>
                                <input type="password" id="confirmPin" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} className={inputStyles} maxLength={4} />
                            </div>
                        </div>
                        <div className="border-t pt-4 dark:border-dark-border">
                            <h3 className="text-lg font-semibold mb-2">الصلاحيات التفصيلية</h3>
                            <div className="space-y-4">
                                {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
                                     <fieldset key={groupName} className="border p-4 rounded-md dark:border-dark-border">
                                        <legend className="px-2 font-semibold">{groupName}</legend>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                            {groupPermissions.map(p => (
                                                <div key={p.key} className="flex items-center">
                                                    <input id={p.key} type="checkbox" checked={permissions[p.key]} onChange={e => handlePermissionChange(p.key, e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                                    <label htmlFor={p.key} className="ms-2 text-sm font-medium">{p.label}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">إلغاء</button>
                        <button type="submit" className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main UserManagementScreen Component ---
const UserManagementScreen: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useContext(AppContext) as AppContextType;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const handleOpenFormModal = (user: User | null) => {
        setUserToEdit(user);
        setIsFormModalOpen(true);
    };

    const handleSaveUser = (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            updateUser(userData);
        } else {
            addUser(userData as Omit<User, 'id'>);
        }
        setIsFormModalOpen(false);
        setUserToEdit(null);
    };

    const handleDeleteClick = (userId: number) => {
        setUserToDelete(userId);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete !== null) {
            deleteUser(userToDelete);
        }
        setIsConfirmModalOpen(false);
        setUserToDelete(null);
    };
    
    const getRoleName = (role: UserRole) => {
        switch(role) {
            case 'admin': return 'مدير النظام';
            case 'manager': return 'مدير';
            case 'cashier': return 'كاشير';
            case 'custom': return 'مخصص';
        }
    }

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">إدارة المستخدمين</h1>
                <button
                    onClick={() => handleOpenFormModal(null)}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" /> مستخدم جديد
                </button>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">اسم المستخدم</th>
                            <th scope="col" className="px-6 py-3">الدور</th>
                            <th scope="col" className="px-6 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="bg-white border-b dark:bg-dark-bg-alt dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {user.name}
                                </th>
                                <td className="px-6 py-4">{getRoleName(user.role)}</td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <button onClick={() => handleOpenFormModal(user)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    {user.id !== currentUser?.id && user.role !== 'admin' && ( // Prevent self-delete and admin deletion
                                        <button onClick={() => handleDeleteClick(user.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <UserFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setUserToEdit(null); }}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا المستخدم؟"
            />
        </div>
    );
};

export default UserManagementScreen;