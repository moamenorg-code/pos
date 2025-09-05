import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, Product, Recipe, CartItem, Customer, DiscountType, Addon, AddonGroup } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, CustomerIcon, BarcodeIcon, SplitBillIcon, ShoppingCartIcon } from './icons';
import PaymentModal from './PaymentModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import CustomerFormModal from './CustomerFormModal';

const ProductCard: React.FC<{ item: Product | Recipe; onAdd: () => void }> = ({ item, onAdd }) => (
  <div
    onClick={onAdd}
    className="bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border cursor-pointer transition-all duration-200 transform hover:shadow-lg hover:border-primary hover:-translate-y-1 overflow-hidden flex flex-col"
  >
    {item.imageUrl ? (
      <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
    ) : null}
    <div className={`p-3 flex flex-col flex-grow ${!item.imageUrl ? 'justify-center items-center h-32' : 'justify-between'}`}>
      <h3 className={`font-bold text-md text-light-text dark:text-dark-text ${item.imageUrl ? 'truncate' : 'text-center'}`}>{item.name}</h3>
      <p className="text-lg font-extrabold text-primary mt-1">{item.price.toFixed(2)} جنيه</p>
    </div>
  </div>
);

// --- AddonsModal ---
interface AddonsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (addons: Addon[]) => void;
    cartItem: CartItem;
}
const AddonsModal: React.FC<AddonsModalProps> = ({ isOpen, onClose, onSave, cartItem }) => {
    const { products, recipes, addons, addonGroups, getAddonById } = useContext(AppContext) as AppContextType;
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>(cartItem.selectedAddons);

    const itemData = cartItem.type === 'product'
        ? products.find(p => p.id === cartItem.id)
        : recipes.find(r => r.id === cartItem.id);

    useEffect(() => {
        setSelectedAddons(cartItem.selectedAddons);
    }, [cartItem]);

    if (!isOpen) return null;

    const relevantAddonGroups = itemData?.addonGroupIds
        ?.map(id => addonGroups.find(g => g.id === id))
        .filter((g): g is AddonGroup => !!g) ?? [];

    const handleToggleAddon = (addon: Addon, group: AddonGroup) => {
        if (group.selectionType === 'single') {
            // Deselect other addons in the same group, then select the new one
            const otherAddonsInGroup = group.addonIds.map(id => getAddonById(id)).filter(a => !!a) as Addon[];
            const filtered = selectedAddons.filter(sa => !otherAddonsInGroup.some(aig => aig.id === sa.id));
            setSelectedAddons([...filtered, addon]);
        } else { // Multiple
            const isSelected = selectedAddons.some(sa => sa.id === addon.id);
            if (isSelected) {
                setSelectedAddons(selectedAddons.filter(sa => sa.id !== addon.id));
            } else {
                setSelectedAddons([...selectedAddons, addon]);
            }
        }
    };

    const handleSave = () => {
        onSave(selectedAddons);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-dark-border">
                    <h2 className="text-xl font-bold text-center">إضافات لـ <span className="text-primary">{cartItem.name}</span></h2>
                </div>
                <div className="p-4 overflow-y-auto">
                    {relevantAddonGroups.length > 0 ? (
                        relevantAddonGroups.map(group => (
                            <div key={group.id} className="mb-4">
                                <h3 className="font-semibold text-lg border-b pb-1 mb-2 dark:border-dark-border">{group.name}</h3>
                                <div className="space-y-2">
                                    {group.addonIds.map(addonId => {
                                        const addon = getAddonById(addonId);
                                        if (!addon) return null;
                                        const isSelected = selectedAddons.some(sa => sa.id === addon.id);
                                        return (
                                            <div key={addon.id} onClick={() => handleToggleAddon(addon, group)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 dark:bg-primary/20 ring-1 ring-primary' : 'hover:bg-slate-100 dark:hover:bg-dark-bg-alt'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                                                        checked={isSelected}
                                                        readOnly
                                                        className="w-5 h-5 text-primary focus:ring-primary"
                                                    />
                                                    <span className="font-medium">{addon.name}</span>
                                                </div>
                                                <span className="font-semibold">{addon.price > 0 ? `+${addon.price.toFixed(2)} جنيه` : 'مجاني'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">لا توجد إضافات متاحة لهذا المنتج.</p>
                    )}
                </div>
                <div className="flex justify-end items-center gap-4 p-4 border-t dark:border-dark-border mt-auto">
                    <button type="button" onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500">إلغاء</button>
                    <button type="button" onClick={handleSave} className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">حفظ الإضافات</button>
                </div>
            </div>
        </div>
    );
};


interface CartProps {
    cart: CartItem[];
    onUpdateItem: (cartItemId: string, updates: Partial<Pick<CartItem, 'quantity' | 'notes' | 'selectedAddons'>>) => void;
    onRemove: (cartItemId: string) => void;
    onCheckout: () => void;
    subTotal: number;
    customers: Customer[];
    selectedCustomerId: number | null;
    onSelectCustomer: (id: number | null) => void;
    getCustomerById: (id: number) => Customer | undefined;
    discountType: DiscountType;
    setDiscountType: (type: DiscountType) => void;
    discountValue: number;
    setDiscountValue: (value: number) => void;
    isSplitMode: boolean;
    onStartSplitPrompt: () => void;
    onCancelSplit: () => void;
    numberOfSplits: number;
    currentSplitIndex: number;
    splitAmount: number;
}

const Cart: React.FC<CartProps> = (props) => {
    const { 
        cart, onUpdateItem, onRemove, onCheckout, subTotal, customers, selectedCustomerId, onSelectCustomer, getCustomerById, 
        discountType, setDiscountType, discountValue, setDiscountValue, isSplitMode, onStartSplitPrompt, onCancelSplit,
        numberOfSplits, currentSplitIndex, splitAmount
    } = props;

    const { shopInfo, appliedLoyaltyDiscount, setAppliedLoyaltyDiscount, appliedGeneralDiscount, setAppliedGeneralDiscount, deliveryFee, setDeliveryFee, isWholesale, setIsWholesale, addCustomer, currentUser, activeShift } = useContext(AppContext) as AppContextType;
    const selectedCustomer = selectedCustomerId ? getCustomerById(selectedCustomerId) : null;
    const [pointsToRedeem, setPointsToRedeem] = useState<string>('');
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountInput, setDiscountInput] = useState<string>('');
    const [showDeliveryFeeInput, setShowDeliveryFeeInput] = useState(false);
    const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
    const [editingAddonsFor, setEditingAddonsFor] = useState<CartItem | null>(null);

    // Customer Search State
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerResults, setShowCustomerResults] = useState(false);
    const [isNewCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowCustomerResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter(c =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.phone.includes(customerSearch)
        ).slice(0, 5);
    }, [customerSearch, customers]);

    const handleSelectFoundCustomer = (id: number) => {
        onSelectCustomer(id);
        setCustomerSearch('');
        setShowCustomerResults(false);
    };

    const handleAddNewCustomer = async (customerData: Omit<Customer, 'id' | 'balance' | 'loyaltyPoints'>) => {
        const newCustomer = await addCustomer(customerData);
        if (newCustomer) {
            handleSelectFoundCustomer(newCustomer.id);
        }
        setNewCustomerModalOpen(false);
    };


    useEffect(() => {
        if (!selectedCustomerId || cart.length === 0) {
            setPointsToRedeem('');
            setAppliedLoyaltyDiscount(0);
        }
        if (cart.length === 0) {
            setShowDiscountInput(false);
            setDiscountInput('');
            setDiscountType('none');
            setDiscountValue(0);
            setAppliedGeneralDiscount(0);
            setShowDeliveryFeeInput(false);
        }
    }, [selectedCustomerId, cart, setAppliedLoyaltyDiscount, setAppliedGeneralDiscount, setDiscountType, setDiscountValue]);

    useEffect(() => {
        const value = parseFloat(discountInput);
        if (isNaN(value) || value <= 0) {
            setAppliedGeneralDiscount(0);
            setDiscountValue(0);
            return;
        }
        
        let calculatedDiscount = 0;
        if (discountType === 'percentage') {
            calculatedDiscount = subTotal * (value / 100);
        } else if (discountType === 'fixed') {
            calculatedDiscount = value;
        }

        calculatedDiscount = Math.min(calculatedDiscount, subTotal);
        setAppliedGeneralDiscount(calculatedDiscount);
        setDiscountValue(value);

    }, [discountInput, discountType, subTotal, setAppliedGeneralDiscount, setDiscountValue]);
    
    const handleRedeemPoints = () => {
        if (!selectedCustomer || !shopInfo) return;
        
        const points = parseInt(pointsToRedeem, 10);
        if (isNaN(points) || points <= 0) {
            setAppliedLoyaltyDiscount(0);
            return;
        }
        
        const totalAfterGeneralDiscount = subTotal - appliedGeneralDiscount;
        const maxRedeemablePoints = Math.min(
            selectedCustomer.loyaltyPoints, 
            Math.floor(totalAfterGeneralDiscount / shopInfo.poundPerPoint)
        );
        const pointsToApply = Math.min(points, maxRedeemablePoints);
        
        const discount = pointsToApply * shopInfo.poundPerPoint;
        setAppliedLoyaltyDiscount(discount);
        setPointsToRedeem(String(pointsToApply));
    };

    const totalAfterGeneralDiscount = subTotal - appliedGeneralDiscount;
    const taxAmount = (shopInfo && shopInfo.taxEnabled) ? totalAfterGeneralDiscount * (shopInfo.taxRate / 100) : 0;
    const total = totalAfterGeneralDiscount - appliedLoyaltyDiscount + taxAmount + deliveryFee;
    
    const inputStyles = "w-full rounded-lg border bg-light-card dark:bg-dark-bg-alt border-light-border dark:border-dark-border px-4 py-2 text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors";

    return (
        <div className="bg-light-bg dark:bg-dark-bg flex flex-col h-full p-4">
            <div className="border-b-2 border-light-border dark:border-dark-border pb-3 mb-3">
                <div className="mt-3">
                    {selectedCustomer ? (
                         <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-blue-800 dark:text-blue-200">{selectedCustomer.name}</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">{selectedCustomer.phone}</p>
                                </div>
                                <button onClick={() => onSelectCustomer(null)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {shopInfo?.loyaltyEnabled && (
                                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        نقاط الولاء: {selectedCustomer.loyaltyPoints}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative" ref={searchContainerRef}>
                            <input
                                type="text"
                                placeholder="ابحث عن عميل أو أضف جديد..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                onFocus={() => setShowCustomerResults(true)}
                                className={inputStyles}
                            />
                            {showCustomerResults && (
                                <div className="absolute z-10 w-full mt-1 bg-light-card dark:bg-dark-card shadow-lg rounded-b-lg max-h-60 overflow-y-auto border dark:border-dark-border">
                                    <ul className="divide-y dark:divide-dark-border">
                                        {filteredCustomers.map(c => (
                                            <li key={c.id} onClick={() => handleSelectFoundCustomer(c.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-alt cursor-pointer">
                                                <p className="font-bold text-light-text dark:text-dark-text">{c.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{c.phone}</p>
                                            </li>
                                        ))}
                                        <li onClick={() => { setNewCustomerModalOpen(true); setShowCustomerResults(false); }} className="p-3 flex items-center gap-2 text-primary hover:bg-slate-100 dark:hover:bg-dark-bg-alt cursor-pointer font-bold">
                                            <PlusIcon className="w-5 h-5" />
                                            إضافة عميل جديد
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <ShoppingCartIcon className="w-16 h-16 mb-4" />
                        <p className="font-semibold text-lg">السلة فارغة</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {cart.map((item) => {
                            const addonsPrice = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
                            const itemTotalPrice = (item.price + addonsPrice) * item.quantity;
                            return (
                                <li key={item.cartItemId} className="bg-light-card dark:bg-dark-bg-alt p-3 rounded-lg border border-light-border dark:border-dark-border">
                                    <div className="flex items-center">
                                        <div className="flex-grow">
                                            <p className="font-bold text-light-text dark:text-dark-text">{item.name}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.price.toFixed(2)} جنيه</p>
                                        </div>
                                        <div className="flex items-center mx-2">
                                            <button onClick={() => onUpdateItem(item.cartItemId, { quantity: item.quantity + 1 })} className="p-1.5 bg-slate-200 dark:bg-slate-600 rounded-full text-light-text dark:text-dark-text"><PlusIcon className="w-4 h-4" /></button>
                                            <span className="w-8 text-center font-bold text-light-text dark:text-dark-text">{item.quantity}</span>
                                            <button onClick={() => onUpdateItem(item.cartItemId, { quantity: item.quantity - 1 })} className="p-1.5 bg-slate-200 dark:bg-slate-600 rounded-full text-light-text dark:text-dark-text"><MinusIcon className="w-4 h-4" /></button>
                                        </div>
                                        <p className="font-bold min-w-[70px] text-left">{itemTotalPrice.toFixed(2)}</p>
                                        <button onClick={() => onRemove(item.cartItemId)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                    {(item.selectedAddons.length > 0 || item.notes) && (
                                        <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border text-xs">
                                            {item.selectedAddons.map(addon => (
                                                <p key={addon.id} className="text-blue-600 dark:text-blue-400 ml-2">+ {addon.name} ({addon.price.toFixed(2)})</p>
                                            ))}
                                            {item.notes && <p className="text-slate-500 dark:text-slate-400 ml-2">ملاحظة: {item.notes}</p>}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                        <button onClick={() => setEditingAddonsFor(item)} className="text-xs text-primary font-semibold">إضافة إضافات</button>
                                        <button onClick={() => setEditingNoteFor(editingNoteFor === item.cartItemId ? null : item.cartItemId)} className="text-xs text-primary font-semibold">
                                            {item.notes ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                                        </button>
                                    </div>
                                    {editingNoteFor === item.cartItemId && (
                                        <div className="mt-2">
                                            <textarea
                                                value={item.notes}
                                                onChange={(e) => onUpdateItem(item.cartItemId, { notes: e.target.value })}
                                                rows={2}
                                                className="bg-white border border-light-border text-sm rounded-lg block w-full p-2 dark:bg-dark-card dark:border-dark-border"
                                                placeholder="ملاحظات على هذا المنتج..."
                                                autoFocus
                                            ></textarea>
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            <div className="bg-light-card dark:bg-dark-card border-t-2 border-light-border dark:border-dark-border mt-4 pt-4">
                 <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-md font-semibold text-light-text dark:text-dark-text">فاتورة جملة</span>
                    <button
                        onClick={() => setIsWholesale(!isWholesale)}
                        className={`${
                            isWholesale ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                        aria-label="Toggle Wholesale"
                    >
                        <span
                            className={`${
                                isWholesale ? 'translate-x-6' : 'translate-x-1'
                            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                        />
                    </button>
                </div>

                <div className="mb-4">
                    {!showDeliveryFeeInput ? (
                        <button onClick={() => setShowDeliveryFeeInput(true)} className="text-sm text-primary font-semibold">إضافة رسوم توصيل</button>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1">رسوم التوصيل</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={deliveryFee || ''}
                                    onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                                    className={inputStyles}
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                 <div className="mb-4">
                     {currentUser?.permissions.canGiveDiscount && !showDiscountInput && (
                        <button onClick={() => setShowDiscountInput(true)} className="text-sm text-primary font-semibold">إضافة خصم</button>
                     )}
                     {currentUser?.permissions.canGiveDiscount && showDiscountInput && (
                        <div>
                            <label className="block text-sm font-medium mb-1">الخصم العام</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="قيمة الخصم"
                                    value={discountInput}
                                    onChange={(e) => setDiscountInput(e.target.value)}
                                    className={inputStyles}
                                />
                                <button onClick={() => setDiscountType('fixed')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${discountType === 'fixed' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-dark-border'}`}>جنيه</button>
                                <button onClick={() => setDiscountType('percentage')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${discountType === 'percentage' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-dark-border'}`}>%</button>
                            </div>
                        </div>
                     )}
                 </div>

                {shopInfo?.loyaltyEnabled && selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">استخدام النقاط</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder={`الحد الأقصى ${Math.min(selectedCustomer.loyaltyPoints, Math.floor((subTotal-appliedGeneralDiscount) / shopInfo.poundPerPoint))}`}
                                value={pointsToRedeem}
                                onChange={(e) => setPointsToRedeem(e.target.value)}
                                className={inputStyles}
                            />
                            <button onClick={handleRedeemPoints} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark text-sm font-semibold">تطبيق</button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-2 text-md mb-4">
                     <div className="flex justify-between items-center">
                        <span className="text-light-text dark:text-dark-text">المجموع الفرعي:</span>
                        <span className="font-semibold">{subTotal.toFixed(2)} جنيه</span>
                    </div>
                     {appliedGeneralDiscount > 0 && (
                        <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                            <span >الخصم العام:</span>
                            <span className="font-semibold">- {appliedGeneralDiscount.toFixed(2)} جنيه</span>
                        </div>
                     )}
                     {appliedLoyaltyDiscount > 0 && (
                        <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                            <span >خصم النقاط:</span>
                            <span className="font-semibold">- {appliedLoyaltyDiscount.toFixed(2)} جنيه</span>
                        </div>
                     )}
                    {deliveryFee > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-light-text dark:text-dark-text">رسوم التوصيل:</span>
                            <span className="font-semibold">{deliveryFee.toFixed(2)} جنيه</span>
                        </div>
                    )}
                    {taxAmount > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-light-text dark:text-dark-text">الضريبة ({shopInfo?.taxRate}%):</span>
                            <span className="font-semibold">{taxAmount.toFixed(2)} جنيه</span>
                        </div>
                    )}
                     <div className="flex justify-between items-center text-2xl font-bold border-t pt-2 dark:border-dark-border">
                        <span className="text-light-text dark:text-dark-text">الإجمالي:</span>
                        <span className="text-primary">{total.toFixed(2)} جنيه</span>
                    </div>
                </div>

                {isSplitMode ? (
                    <div className="p-2 my-2 text-center bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <p className="font-bold text-blue-800 dark:text-blue-200">
                            الدفع مقسم على {numberOfSplits} أجزاء
                        </p>
                        <p>الجزء الحالي: {currentSplitIndex + 1}</p>
                        <p className="font-bold">المبلغ: {splitAmount.toFixed(2)} جنيه</p>
                        <button onClick={onCancelSplit} className="text-sm text-red-500 hover:underline mt-1">
                            إلغاء التقسيم
                        </button>
                    </div>
                ) : (
                    <button
                    onClick={onStartSplitPrompt}
                    disabled={cart.length === 0}
                    className="w-full text-primary font-semibold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg-alt transition-colors duration-200 flex items-center justify-center gap-2 mb-2 disabled:opacity-50"
                    >
                    <SplitBillIcon className="w-5 h-5" />
                    تقسيم الفاتورة
                    </button>
                )}

                {!activeShift && (
                    <div className="p-2 my-2 text-center bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-800 dark:text-yellow-200 font-bold">
                        يجب بدء وردية جديدة قبل إتمام أي عملية بيع.
                    </div>
                )}
                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0 || !activeShift}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed text-lg"
                >
                    {isSplitMode ? `ادفع الجزء ${currentSplitIndex + 1} / ${numberOfSplits}` : 'الدفع'}
                </button>
            </div>
             <CustomerFormModal
                isOpen={isNewCustomerModalOpen}
                onClose={() => setNewCustomerModalOpen(false)}
                onSave={handleAddNewCustomer}
            />
            {editingAddonsFor && (
                <AddonsModal 
                    isOpen={!!editingAddonsFor}
                    onClose={() => setEditingAddonsFor(null)}
                    cartItem={editingAddonsFor}
                    onSave={(newAddons) => {
                        onUpdateItem(editingAddonsFor.cartItemId, { selectedAddons: newAddons });
                    }}
                />
            )}
        </div>
    );
}

const SplitPromptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (splits: number) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [splits, setSplits] = useState('2');
    if (!isOpen) return null;

    const handleConfirm = () => {
        const numSplits = parseInt(splits, 10);
        if (numSplits > 1 && numSplits <= 20) {
            onConfirm(numSplits);
        } else {
            alert('الرجاء إدخال عدد صحيح بين 2 و 20.');
        }
    };

    const inputStyles = "bg-slate-50 border border-slate-300 text-light-text text-lg rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 dark:bg-dark-bg-alt dark:border-dark-border dark:placeholder-gray-400 dark:text-white transition-colors";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-xl font-bold text-center mb-4">تقسيم الفاتورة</h2>
                <p className="text-center text-slate-600 dark:text-slate-300 mb-4">أدخل عدد الأجزاء لتقسيم الفاتورة عليها:</p>
                <input
                    type="number"
                    value={splits}
                    onChange={(e) => setSplits(e.target.value)}
                    className={`${inputStyles} text-center`}
                    min="2"
                    max="20"
                    autoFocus
                />
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                    <button onClick={handleConfirm} className="py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">تأكيد</button>
                </div>
            </div>
        </div>
    );
};


const SalesScreen: React.FC = () => {
  const context = useContext(AppContext) as AppContextType;
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [discountValue, setDiscountValue] = useState(0);

  const [isCartOpen, setCartOpen] = useState(false);

  const [isSplitPromptOpen, setIsSplitPromptOpen] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [numberOfSplits, setNumberOfSplits] = useState(0);
  const [currentSplitIndex, setCurrentSplitIndex] = useState(0);
  const [accumulatedPayments, setAccumulatedPayments] = useState({ cash: 0, card: 0, credit: 0 });
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);

  const sellableProducts = useMemo(() => context.products.filter(p => !p.isRawMaterial), [context.products]);

  const itemsToDisplay = useMemo(() => {
    const allItems = [...sellableProducts, ...context.recipes];
    
    let filteredItems = allItems;

    if (activeCategoryId !== null) {
        filteredItems = filteredItems.filter(item => item.categoryId === activeCategoryId);
    }

    if (searchTerm.trim() !== '') {
        const lowercasedTerm = searchTerm.toLowerCase();
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(lowercasedTerm)
        );
    }
    
    return filteredItems;
  }, [sellableProducts, context.recipes, activeCategoryId, searchTerm]);

  const categories = useMemo(() => {
      const sellableCategories = new Set([...sellableProducts.map(p => p.categoryId), ...context.recipes.map(r => r.categoryId)]);
      return context.categories.filter(c => sellableCategories.has(c.id));
  }, [context.categories, sellableProducts, context.recipes]);
  

  const cartSubTotal = useMemo(() => {
    return context.cart.reduce((sum, item) => {
        const addonsPrice = item.selectedAddons.reduce((addonSum, addon) => addonSum + addon.price, 0);
        const itemTotal = (item.price + addonsPrice) * item.quantity;
        return sum + itemTotal;
    }, 0);
  }, [context.cart]);

  const totalAfterGeneralDiscount = cartSubTotal - context.appliedGeneralDiscount;
  const taxAmount = (context.shopInfo && context.shopInfo.taxEnabled) ? totalAfterGeneralDiscount * (context.shopInfo.taxRate / 100) : 0;
  const cartTotal = totalAfterGeneralDiscount - context.appliedLoyaltyDiscount + taxAmount + context.deliveryFee;
  
  const handleStartSplit = (splits: number) => {
    setIsSplitMode(true);
    setNumberOfSplits(splits);
    setCurrentSplitIndex(0);
    setAccumulatedPayments({ cash: 0, card: 0, credit: 0 });

    const total = cartTotal;
    const baseAmount = Math.floor((total / splits) * 100) / 100;
    const remainder = parseFloat((total - (baseAmount * splits)).toFixed(2));
    const amounts = Array(splits).fill(baseAmount);
    amounts[0] += remainder;
    setSplitAmounts(amounts.map(a => parseFloat(a.toFixed(2))));
    
    setIsSplitPromptOpen(false);
  };

  const handleCancelSplit = () => {
    setIsSplitMode(false);
    setNumberOfSplits(0);
    setCurrentSplitIndex(0);
    setAccumulatedPayments({ cash: 0, card: 0, credit: 0 });
    setSplitAmounts([]);
  };

  const handleCheckout = () => {
    if (cartTotal <= 0) return;
    setPaymentModalOpen(true);
  };
  
  const handleConfirmPayment = (paymentDetails: { cash: number; card: number; credit: number }) => {
    if (isSplitMode) {
        const newAccumulated = {
            cash: accumulatedPayments.cash + paymentDetails.cash,
            card: accumulatedPayments.card + paymentDetails.card,
            credit: accumulatedPayments.credit + paymentDetails.credit,
        };
        setAccumulatedPayments(newAccumulated);

        const isLastSplit = currentSplitIndex === numberOfSplits - 1;

        if (!isLastSplit) {
            setCurrentSplitIndex(prev => prev + 1);
            setPaymentModalOpen(false);
        } else {
            const pointsToRedeem = (context.shopInfo && context.shopInfo.poundPerPoint > 0)
                ? Math.floor(context.appliedLoyaltyDiscount / context.shopInfo.poundPerPoint)
                : 0;
            context.processSale({
                customerId: selectedCustomerId,
                paymentDetails: newAccumulated,
                redeemedPoints: pointsToRedeem,
                discountType: discountValue > 0 ? discountType : 'none',
                discountValue,
                deliveryFee: context.deliveryFee,
            });
        }
    } else {
        const pointsToRedeem = (context.shopInfo && context.shopInfo.poundPerPoint > 0) 
            ? Math.floor(context.appliedLoyaltyDiscount / context.shopInfo.poundPerPoint) 
            : 0;
        context.processSale({ 
            customerId: selectedCustomerId, 
            paymentDetails,
            redeemedPoints: pointsToRedeem,
            discountType: discountValue > 0 ? discountType : 'none',
            discountValue,
            deliveryFee: context.deliveryFee,
        });
    }
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    if (context.lastSale) {
        if(isSplitMode) {
            handleCancelSplit();
        }
        setCartOpen(false);
        setSelectedCustomerId(null);
        context.setAppliedLoyaltyDiscount(0);
        context.setAppliedGeneralDiscount(0);
        setDiscountType('none');
        setDiscountValue(0);
    }
  };

  const handlePrint = () => {
    if (context.lastSale) {
        context.setSaleToPrint(context.lastSale);
    }
  };
  
  const handlePrintKitchenOrder = () => {
    if (context.lastSale) {
        context.setKitchenOrderToPrint(context.lastSale);
    }
  };

  const handleScanSuccess = (barcode: string) => {
    const product = context.findProductByBarcode(barcode);
    if (product) {
        context.addToCart(product, 'product');
        setScannerOpen(false);
    } else {
        alert('المنتج غير موجود');
    }
  };
  
  const formElementStyles = "bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block w-full p-2.5 transition-colors";

  return (
    <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
            <div className="flex items-center gap-4 w-full">
                <div className="w-48">
                     <select
                        value={activeCategoryId === null ? 'all' : activeCategoryId}
                        onChange={(e) => setActiveCategoryId(e.target.value === 'all' ? null : Number(e.target.value))}
                        className={formElementStyles}
                    >
                        <option value="all">كل التصنيفات</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-grow">
                     <input
                        type="text"
                        placeholder="ابحث عن منتج أو وصفة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={formElementStyles}
                    />
                </div>
                <button
                    onClick={() => setScannerOpen(true)}
                    className="px-4 py-2.5 text-sm font-bold rounded-lg whitespace-nowrap transition-colors bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text flex items-center gap-2 border border-light-border dark:border-dark-border hover:border-primary"
                >
                    <BarcodeIcon className="w-5 h-5" />
                    مسح باركود
                </button>
            </div>
        </div>
        <div className={`flex-grow overflow-y-auto ${context.cart.length > 0 ? 'pb-20' : ''}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {itemsToDisplay.map((item) => {
                    const type = 'ingredients' in item ? 'recipe' : 'product';
                    return (
                        <ProductCard key={`${type}-${item.id}`} item={item} onAdd={() => context.addToCart(item, type)} />
                    );
                })}
            </div>
        </div>

        {context.cart.length > 0 && !isCartOpen && (
            <div
                onClick={() => setCartOpen(true)}
                className="fixed bottom-0 left-0 sm:left-auto right-0 sm:mr-64 bg-primary text-white p-4 shadow-lg cursor-pointer flex justify-between items-center animate-slide-up z-40 rounded-t-lg"
            >
                <div className="flex items-center gap-3">
                    <ShoppingCartIcon className="w-6 h-6" />
                    <span className="font-semibold">{context.cart.length} أصناف</span>
                </div>
                <div>
                    <span className="font-bold text-lg">{cartTotal.toFixed(2)} جنيه</span>
                    <span className="ms-3 font-semibold hidden sm:inline">عرض العربة &larr;</span>
                </div>
            </div>
        )}

        {isCartOpen && (
            <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg z-50 animate-slide-in-right flex flex-col">
                 <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-dark-border bg-light-card dark:bg-dark-card">
                    <h2 className="text-2xl font-bold">عربة التسوق</h2>
                    <button onClick={() => setCartOpen(false)} className="text-3xl font-light hover:text-red-500 transition-colors">&times;</button>
                 </div>
                 <div className="flex-grow overflow-y-auto">
                    <Cart
                        cart={context.cart}
                        onUpdateItem={context.updateCartItem}
                        onRemove={context.removeFromCart}
                        onCheckout={handleCheckout}
                        subTotal={cartSubTotal}
                        customers={context.customers}
                        selectedCustomerId={selectedCustomerId}
                        onSelectCustomer={setSelectedCustomerId}
                        getCustomerById={context.getCustomerById}
                        discountType={discountType}
                        setDiscountType={setDiscountType}
                        discountValue={discountValue}
                        setDiscountValue={setDiscountValue}
                        isSplitMode={isSplitMode}
                        onStartSplitPrompt={() => setIsSplitPromptOpen(true)}
                        onCancelSplit={handleCancelSplit}
                        numberOfSplits={numberOfSplits}
                        currentSplitIndex={currentSplitIndex}
                        splitAmount={splitAmounts[currentSplitIndex] || 0}
                    />
                </div>
            </div>
        )}
        
        <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            onConfirm={handleConfirmPayment}
            onPrint={handlePrint}
            onPrintKitchenOrder={handlePrintKitchenOrder}
            cart={context.cart}
            total={isSplitMode ? splitAmounts[currentSplitIndex] : cartTotal}
            customerId={selectedCustomerId}
            lastSale={context.lastSale}
            title={isSplitMode ? `الدفع (الجزء ${currentSplitIndex + 1} من ${numberOfSplits})` : 'إتمام الدفع'}
            showSuccessOnConfirm={!isSplitMode || currentSplitIndex === numberOfSplits - 1}
        />
        <BarcodeScannerModal 
            isOpen={isScannerOpen}
            onClose={() => setScannerOpen(false)}
            onScanSuccess={handleScanSuccess}
        />
        <SplitPromptModal
            isOpen={isSplitPromptOpen}
            onClose={() => setIsSplitPromptOpen(false)}
            onConfirm={handleStartSplit}
        />
        <style>{`
            @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.3s ease-out; }
            @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
            .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        `}</style>
    </div>
  );
};

export default SalesScreen;