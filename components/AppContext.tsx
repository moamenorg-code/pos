import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Screen } from '../types';
import type { AppContextType, Product, Recipe, CartItem, Customer, Supplier, PurchaseInvoice, Sale, Payment, ShopInfo, Category, DiscountType, User, Shift, Addon, AddonGroup, Expense, Printer, PrinterType } from '../types';
import { PRODUCTS, CATEGORIES, RECIPES, CUSTOMERS, SUPPLIERS, USERS, SHOP_INFO, ADDONS, ADDON_GROUPS } from './data/mockData';
import { db } from './db';

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // =================================================================
  // --- STATE MANAGEMENT
  // =================================================================

  // --- Global App State ---
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Sales);
  
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // --- Core Data State ---
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);

  // --- UI/Flow State for Sales & Shifts ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isWholesale, setIsWholesale] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);
  const [kitchenOrderToPrint, setKitchenOrderToPrint] = useState<Sale | null>(null);
  const [appliedLoyaltyDiscount, setAppliedLoyaltyDiscount] = useState(0);
  const [appliedGeneralDiscount, setAppliedGeneralDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftToPrint, setShiftToPrint] = useState<Shift | null>(null);
  const [expensesForReport, setExpensesForReport] = useState<Expense[]>([]);

  // =================================================================
  // --- EFFECTS
  // =================================================================

  // --- DB Initialization Effect ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
          const userCount = await db.users.count();
          if (userCount === 0) {
              console.log("Seeding database with initial data...");
              await db.users.bulkAdd(USERS);
              await db.shopInfo.add(SHOP_INFO);
              await db.categories.bulkAdd(CATEGORIES);
              await db.products.bulkAdd(PRODUCTS);
              await db.recipes.bulkAdd(RECIPES);
              await db.customers.bulkAdd(CUSTOMERS);
              await db.suppliers.bulkAdd(SUPPLIERS);
              await db.addons.bulkAdd(ADDONS);
              await db.addonGroups.bulkAdd(ADDON_GROUPS);
          }

          // Load all data from DB into state
          setUsers(await db.users.toArray());
          setShopInfo(await db.shopInfo.get(1) ?? null);
          setCategories(await db.categories.toArray());
          setProducts(await db.products.toArray());
          setRecipes(await db.recipes.toArray());
          setCustomers(await db.customers.toArray());
          setSuppliers(await db.suppliers.toArray());
          setPurchaseInvoices(await db.purchaseInvoices.toArray());
          setSales(await db.sales.toArray());
          setPayments(await db.payments.toArray());
          setShifts(await db.shifts.toArray());
          setExpenses(await db.expenses.toArray());
          setAddons(await db.addons.toArray());
          setAddonGroups(await db.addonGroups.toArray());
          setPrinters(await db.printers.toArray());

      } catch (error) {
          console.error("Failed to initialize or load data from DB:", error);
      } finally {
          setLoading(false);
      }
    };
    initData();
  }, []);

  // --- Auth Session & Theme Persistence Effect ---
  useEffect(() => {
    // Check for a logged-in user in session storage
    const checkActiveShift = async (user: User) => {
        const currentActiveShift = await db.shifts.where({ userId: user.id, status: 'active' }).first();
        if (currentActiveShift) setActiveShift(currentActiveShift);
    };
    try {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser) as User;
            setCurrentUser(user);
            setActiveScreen(Screen.Sales);
            checkActiveShift(user);
        }
    } catch (error) {
        console.error("Could not parse user from session storage:", error);
        sessionStorage.removeItem('currentUser');
    }
    
    // Load theme from local storage
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  // --- Theme Change Effect ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // --- Wholesale Price Update Effect ---
  useEffect(() => {
    if (cart.length > 0) {
      setCart(prevCart => prevCart.map(cartItem => {
        if (cartItem.type === 'product') {
          const product = products.find(p => p.id === cartItem.id);
          if (product) {
            const newPrice = isWholesale && product.wholesalePrice ? product.wholesalePrice : product.price;
            return { ...cartItem, price: newPrice };
          }
        }
        return cartItem;
      }));
    }
  }, [isWholesale, products]); // eslint-disable-line react-hooks/exhaustive-deps

  // =================================================================
  // --- GETTERS & HELPER FUNCTIONS
  // =================================================================

  const getProductById = useCallback((id: number): Product | undefined => products.find(p => p.id === id), [products]);
  const getRecipeById = useCallback((id: number): Recipe | undefined => recipes.find(r => r.id === id), [recipes]);
  const getAddonById = useCallback((id: number): Addon | undefined => addons.find(a => a.id === id), [addons]);
  const findProductByBarcode = useCallback((barcode: string): Product | undefined => products.find(p => p.barcode === barcode), [products]);
  const getCustomerById = useCallback((id: number): Customer | undefined => customers.find(c => c.id === id), [customers]);
  const getSupplierById = useCallback((id: number): Supplier | undefined => suppliers.find(s => s.id === id), [suppliers]);
  const getRecipeCost = useCallback((recipe: Recipe): number => {
    return recipe.ingredients.reduce((total, ingredient) => {
      const product = getProductById(ingredient.productId);
      return total + (product ? product.cost * ingredient.quantity : 0);
    }, 0);
  }, [getProductById]);

  // =================================================================
  // --- AUTH & THEME FUNCTIONS
  // =================================================================

  const login = useCallback(async (userId: number, pin: string): Promise<boolean> => {
    const user = await db.users.get(userId);
    if (user && user.pin === pin) {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        const currentActiveShift = await db.shifts.where({ userId: user.id, status: 'active' }).first();
        if (currentActiveShift) setActiveShift(currentActiveShift);
        setActiveScreen(Screen.Sales);
        return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveShift(null);
    setShiftToPrint(null);
    setExpensesForReport([]);
    sessionStorage.removeItem('currentUser');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // =================================================================
  // --- CART FUNCTIONS
  // =================================================================

  const addToCart = useCallback((item: Product | Recipe, type: 'product' | 'recipe') => {
    let price = item.price;
    if (type === 'product' && isWholesale && (item as Product).wholesalePrice) {
        price = (item as Product).wholesalePrice!;
    }
    const cost = type === 'product' ? (item as Product).cost : getRecipeCost(item as Recipe);
    
    const newCartItem: CartItem = {
        cartItemId: `${type}-${item.id}-${Date.now()}-${Math.random()}`,
        id: item.id, name: item.name, price, cost, quantity: 1, type,
        selectedAddons: [], notes: '',
    };
    setCart((prevCart) => [...prevCart, newCartItem]);
  }, [getRecipeCost, isWholesale]);

  const updateCartItem = useCallback((cartItemId: string, updates: Partial<Pick<CartItem, 'quantity' | 'notes' | 'selectedAddons'>>) => {
      setCart(prevCart => prevCart.map(item => {
          if (item.cartItemId === cartItemId) {
              const updatedItem = { ...item, ...updates };
              if (updates.quantity !== undefined && updates.quantity < 1) return null; // Signal for removal
              return updatedItem;
          }
          return item;
      }).filter((item): item is CartItem => item !== null));
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedLoyaltyDiscount(0);
    setAppliedGeneralDiscount(0);
    setDeliveryFee(0);
    setIsWholesale(false);
  }, []);
  
  // =================================================================
  // --- SALE PROCESSING & CANCELLATION
  // =================================================================

  const processSale = useCallback(async (details: { 
    customerId: number | null; 
    paymentDetails: { cash: number; card: number; credit: number };
    redeemedPoints: number;
    discountType: DiscountType;
    discountValue: number;
    deliveryFee: number;
  }) => {
    if (!shopInfo || !currentUser) return;
    
    const subTotal = cart.reduce((sum, item) => {
        const addonsPrice = item.selectedAddons.reduce((addonSum, addon) => addonSum + addon.price, 0);
        return sum + (item.price + addonsPrice) * item.quantity;
    }, 0);
    const totalCost = cart.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    
    let generalDiscountAmount = 0;
    if (details.discountType === 'percentage') {
        generalDiscountAmount = subTotal * (details.discountValue / 100);
    } else if (details.discountType === 'fixed') {
        generalDiscountAmount = details.discountValue;
    }

    const totalAfterGeneralDiscount = subTotal - generalDiscountAmount;
    const discountFromPoints = details.redeemedPoints * shopInfo.poundPerPoint;
    const taxableAmount = Math.max(0, totalAfterGeneralDiscount - discountFromPoints);
    const taxAmount = (shopInfo.taxEnabled && shopInfo.taxRate > 0) ? taxableAmount * (shopInfo.taxRate / 100) : 0;
    const totalAmount = taxableAmount + taxAmount + details.deliveryFee;

    let pointsEarned = 0;
    if (shopInfo.loyaltyEnabled && details.customerId) {
        pointsEarned = Math.floor(totalAfterGeneralDiscount * shopInfo.pointsPerPound);
    }

    const newSaleData: Omit<Sale, 'id'> = {
        date: new Date().toISOString(), items: [...cart], subTotal, totalCost,
        discountType: details.discountType, discountValue: details.discountValue,
        taxAmount, deliveryFee: details.deliveryFee, totalAmount,
        customerId: details.customerId, userId: currentUser.id, userName: currentUser.name,
        paymentDetails: details.paymentDetails, pointsRedeemed: details.redeemedPoints,
        pointsEarned, status: 'completed', shiftId: activeShift?.id,
    };
    const newSaleId = await db.sales.add(newSaleData as Sale);
    const newSale = { ...newSaleData, id: newSaleId };
    setSales(prev => [...prev, newSale]);
    setLastSale(newSale);

    // Update stock levels
    const stockUpdates = new Map<number, number>();
    cart.forEach(cartItem => {
      if (cartItem.type === 'product') {
        stockUpdates.set(cartItem.id, (stockUpdates.get(cartItem.id) || 0) + cartItem.quantity);
      } else if (cartItem.type === 'recipe') {
        const recipe = recipes.find(r => r.id === cartItem.id);
        if (recipe) {
          recipe.ingredients.forEach(ingredient => {
            const quantityToDeduct = ingredient.quantity * cartItem.quantity;
            stockUpdates.set(ingredient.productId, (stockUpdates.get(ingredient.productId) || 0) + quantityToDeduct);
          });
        }
      }
    });
    
    const productUpdatePromises = Array.from(stockUpdates.entries()).map(([productId, quantityToDeduct]) => 
        db.products.where('id').equals(productId).modify(product => { product.stock -= quantityToDeduct; })
    );
    await Promise.all(productUpdatePromises);
    setProducts(await db.products.toArray());
    
    // Update customer balance and loyalty points
    if (details.customerId) {
        await db.customers.where('id').equals(details.customerId).modify(customer => {
            if (details.paymentDetails.credit > 0) customer.balance -= details.paymentDetails.credit;
            if (shopInfo.loyaltyEnabled) {
                customer.loyaltyPoints -= details.redeemedPoints;
                customer.loyaltyPoints += pointsEarned;
            }
        });
        setCustomers(await db.customers.toArray());
    }
    clearCart();
  }, [cart, clearCart, recipes, shopInfo, currentUser, activeShift]);

  const cancelSale = useCallback(async (saleId: number) => {
    const saleToCancel = await db.sales.get(saleId);
    if (!saleToCancel || saleToCancel.status === 'canceled') return;

    if (saleToCancel.shiftId) {
        const shift = await db.shifts.get(saleToCancel.shiftId);
        if (shift && shift.status === 'closed') {
            alert('لا يمكن إلغاء فاتورة من وردية مغلقة.');
            return;
        }
    }

    // Restore stock levels
    const stockUpdates = new Map<number, number>();
    saleToCancel.items.forEach(item => {
        if (item.type === 'product') {
            stockUpdates.set(item.id, (stockUpdates.get(item.id) || 0) + item.quantity);
        } else if (item.type === 'recipe') {
            const recipe = recipes.find(r => r.id === item.id);
            if (recipe) {
                recipe.ingredients.forEach(ing => {
                    const quantityToAdd = ing.quantity * item.quantity;
                    stockUpdates.set(ing.productId, (stockUpdates.get(ing.productId) || 0) + quantityToAdd);
                });
            }
        }
    });

    const productUpdatePromises = Array.from(stockUpdates.entries()).map(([productId, quantityToAdd]) => 
        db.products.where('id').equals(productId).modify(product => { product.stock += quantityToAdd; })
    );
    await Promise.all(productUpdatePromises);
    setProducts(await db.products.toArray());

    // Revert customer balance and loyalty points
    if (saleToCancel.customerId) {
        await db.customers.where('id').equals(saleToCancel.customerId).modify(customer => {
            if (saleToCancel.paymentDetails.credit > 0) customer.balance += saleToCancel.paymentDetails.credit;
            customer.loyaltyPoints += saleToCancel.pointsRedeemed;
            customer.loyaltyPoints -= saleToCancel.pointsEarned;
        });
        setCustomers(await db.customers.toArray());
    }

    // Mark sale as canceled
    await db.sales.update(saleId, { status: 'canceled' });
    setSales(await db.sales.toArray());
  }, [recipes]);

  // =================================================================
  // --- SHIFT & EXPENSE MANAGEMENT
  // =================================================================

    const startShift = useCallback(async (startingCash: number) => {
        if (!currentUser) return;
        if (activeShift) { alert('There is already an active shift.'); return; }
        const newShiftData: Omit<Shift, 'id'> = {
            userId: currentUser.id, userName: currentUser.name, startTime: new Date().toISOString(), endTime: null,
            status: 'active', startingCash, endingCash: 0, cashSales: 0, cardSales: 0, totalExpenses: 0,
            totalSales: 0, expectedCash: 0, difference: 0,
        };
        const newId = await db.shifts.add(newShiftData as Shift);
        const newShift = { ...newShiftData, id: newId };
        setActiveShift(newShift);
        setShifts(prev => [...prev, newShift]);
        setShiftToPrint(null);
        setExpensesForReport([]);
    }, [currentUser, activeShift]);

    const endShift = useCallback(async (endingCash: number) => {
        if (!currentUser || !activeShift) return;
        
        const shiftSales = await db.sales.where({ shiftId: activeShift.id, status: 'completed' }).toArray();
        const shiftExpenses = await db.expenses.where({ shiftId: activeShift.id }).toArray();
        
        const cashSales = shiftSales.reduce((sum, sale) => sum + sale.paymentDetails.cash, 0);
        const cardSales = shiftSales.reduce((sum, sale) => sum + sale.paymentDetails.card, 0);
        const totalSales = shiftSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalExpenses = shiftExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        const expectedCash = activeShift.startingCash + cashSales - totalExpenses;
        const difference = endingCash - expectedCash;

        const closedShift: Shift = {
            ...activeShift, endTime: new Date().toISOString(), status: 'closed',
            endingCash, cashSales, cardSales, totalSales, totalExpenses, expectedCash, difference,
        };

        await db.shifts.put(closedShift);
        const finalShiftFromDb = await db.shifts.get(closedShift.id);
        
        setShifts(prev => prev.map(s => s.id === closedShift.id ? finalShiftFromDb! : s));
        setActiveShift(null);
        setShiftToPrint(finalShiftFromDb!);
    }, [currentUser, activeShift]);
    
    const addExpense = useCallback(async (expenseData: { description: string; amount: number }) => {
        if (!activeShift) { alert('يجب بدء وردية لتسجيل المصروفات.'); return; }
        const newExpenseData: Omit<Expense, 'id'> = {
            shiftId: activeShift.id, description: expenseData.description,
            amount: expenseData.amount, date: new Date().toISOString(),
        };
        const newId = await db.expenses.add(newExpenseData as Expense);
        const newExpense = { ...newExpenseData, id: newId };
        setExpenses(prev => [...prev, newExpense]);
    }, [activeShift]);

    const handleSetShiftToPrint = useCallback(async (shift: Shift | null) => {
        if (shift) {
            const shiftExpenses = await db.expenses.where({ shiftId: shift.id }).toArray();
            setExpensesForReport(shiftExpenses);
            setShiftToPrint(shift);
        } else {
            setExpensesForReport([]);
            setShiftToPrint(null);
        }
    }, []);
  
  // =================================================================
  // --- CRUD FUNCTIONS
  // =================================================================

  // --- Recipes ---
  const addRecipe = useCallback(async (newRecipeData: Omit<Recipe, 'id'>) => {
    const newRecipe: Omit<Recipe, 'id'|'imageUrl'> & {imageUrl?: string} = { ...newRecipeData };
    const newId = await db.recipes.add(newRecipe as Recipe);
    const fullRecipe = { ...newRecipe, id: newId, imageUrl: `https://picsum.photos/seed/recipe${newId}/200` };
    await db.recipes.update(newId, { imageUrl: fullRecipe.imageUrl });
    setRecipes(prev => [...prev, fullRecipe]);
  }, []);
  const updateRecipe = useCallback(async (updatedRecipe: Recipe) => {
    await db.recipes.put(updatedRecipe);
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  }, []);
  const deleteRecipe = useCallback(async (recipeId: number) => {
    const isUsedInSale = sales.some(sale => sale.items.some(item => item.type === 'recipe' && item.id === recipeId));
    if (isUsedInSale) {
        alert('لا يمكن حذف هذه الوصفة لأنها مستخدمة في فواتير بيع سابقة.');
        return;
    }
    await db.recipes.delete(recipeId);
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  }, [sales]);

  // --- Products ---
  const addProduct = useCallback(async (newProductData: Omit<Product, 'id' | 'imageUrl'>) => {
    const newProduct: Omit<Product, 'id'|'imageUrl'> & {imageUrl?: string} = { cost: 0, lowStockThreshold: 0, ...newProductData };
    const newId = await db.products.add(newProduct as Product);
    const fullProduct = { ...newProduct, id: newId, imageUrl: newProduct.isRawMaterial ? undefined : `https://picsum.photos/seed/product${newId}/200` };
    if(fullProduct.imageUrl) {
        await db.products.update(newId, { imageUrl: fullProduct.imageUrl });
    }
    setProducts(prev => [...prev, fullProduct]);
  }, []);
  const updateProduct = useCallback(async (updatedProduct: Product) => {
    await db.products.put(updatedProduct);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);
  const deleteProduct = useCallback(async (productId: number) => {
    const isUsedInRecipe = recipes.some(r => r.ingredients.some(i => i.productId === productId));
    if (isUsedInRecipe) {
        alert('لا يمكن حذف هذا المنتج لأنه مستخدم في وصفة. يرجى إزالته من الوصفات أولاً.');
        return;
    }
    const isUsedInSale = sales.some(sale => sale.items.some(item => {
        if (item.type === 'product' && item.id === productId) return true;
        if (item.type === 'recipe') {
            const recipeUsed = recipes.find(r => r.id === item.id);
            return recipeUsed?.ingredients.some(ing => ing.productId === productId);
        }
        return false;
    }));
    if (isUsedInSale) {
        alert('لا يمكن حذف هذا المنتج لأنه تم بيعه في فاتورة سابقة.');
        return;
    }
    await db.products.delete(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, [recipes, sales]);

  // --- Categories ---
  const addCategory = useCallback(async (newCategoryData: Omit<Category, 'id'>) => {
    const newId = await db.categories.add(newCategoryData as Category);
    setCategories(prev => [...prev, { ...newCategoryData, id: newId }]);
  }, []);
  const updateCategory = useCallback(async (updatedCategory: Category) => {
    await db.categories.put(updatedCategory);
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }, []);
  const deleteCategory = useCallback(async (categoryId: number) => {
    await db.categories.delete(categoryId);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }, []);

  // --- Customers ---
  const addCustomer = useCallback(async (newCustomerData: Omit<Customer, 'id'|'balance' | 'loyaltyPoints'>): Promise<Customer> => {
    const newCustomer = { ...newCustomerData, balance: 0, loyaltyPoints: 0 };
    const newId = await db.customers.add(newCustomer as Customer);
    const fullCustomer = { ...newCustomer, id: newId };
    setCustomers(prev => [...prev, fullCustomer]);
    return fullCustomer;
  }, []);
  const updateCustomer = useCallback(async (updatedCustomer: Customer): Promise<void> => {
    await db.customers.put(updatedCustomer);
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  }, []);
  const deleteCustomer = useCallback(async (customerId: number) => {
    await db.customers.delete(customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  }, []);

  // --- Suppliers ---
  const addSupplier = useCallback(async (newSupplierData: Omit<Supplier, 'id'|'balance'>) => {
    const newSupplier = { ...newSupplierData, balance: 0 };
    const newId = await db.suppliers.add(newSupplier as Supplier);
    setSuppliers(prev => [...prev, { ...newSupplier, id: newId }]);
  }, []);
  const updateSupplier = useCallback(async (updatedSupplier: Supplier) => {
    await db.suppliers.put(updatedSupplier);
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  }, []);
  const deleteSupplier = useCallback(async (supplierId: number) => {
    await db.suppliers.delete(supplierId);
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  }, []);

  // --- Purchases & Payments ---
  const addPurchaseInvoice = useCallback(async (invoiceData: Omit<PurchaseInvoice, 'id'>) => {
    const newId = await db.purchaseInvoices.add(invoiceData as PurchaseInvoice);
    setPurchaseInvoices(prev => [...prev, { ...invoiceData, id: newId }]);

    await db.suppliers.where('id').equals(invoiceData.supplierId).modify(s => { s.balance -= invoiceData.totalAmount; });
    
    const productUpdates = invoiceData.items.map(item => 
        db.products.where('id').equals(item.productId).modify(p => { p.stock += item.quantity; })
    );
    await Promise.all(productUpdates);

    setSuppliers(await db.suppliers.toArray());
    setProducts(await db.products.toArray());
  }, []);

  const addPayment = useCallback(async (paymentData: Omit<Payment, 'id'>) => {
    const newId = await db.payments.add(paymentData as Payment);
    setPayments(prev => [...prev, { ...paymentData, id: newId }]);

    if (paymentData.type === 'customer') {
        await db.customers.where('id').equals(paymentData.entityId).modify(c => { c.balance += paymentData.amount; });
        setCustomers(await db.customers.toArray());
    } else { // supplier
        await db.suppliers.where('id').equals(paymentData.entityId).modify(s => { s.balance += paymentData.amount; });
        setSuppliers(await db.suppliers.toArray());
    }
  }, []);

  // --- Shop Info ---
  const updateShopInfo = useCallback(async (info: Omit<ShopInfo, 'id'>) => {
    const updatedInfo = { ...info, id: 1 };
    await db.shopInfo.put(updatedInfo);
    setShopInfo(updatedInfo);
  }, []);

  // --- Addons & Groups ---
  const addAddon = useCallback(async (addonData: Omit<Addon, 'id'>) => {
    const newId = await db.addons.add(addonData as Addon);
    setAddons(prev => [...prev, { ...addonData, id: newId }]);
  }, []);
  const updateAddon = useCallback(async (addon: Addon) => {
    await db.addons.put(addon);
    setAddons(prev => prev.map(a => a.id === addon.id ? addon : a));
  }, []);
  const deleteAddon = useCallback(async (addonId: number) => {
    await db.addons.delete(addonId);
    setAddons(prev => prev.filter(a => a.id !== addonId));
  }, []);
  const addAddonGroup = useCallback(async (groupData: Omit<AddonGroup, 'id'>) => {
    const newId = await db.addonGroups.add(groupData as AddonGroup);
    setAddonGroups(prev => [...prev, { ...groupData, id: newId }]);
  }, []);
  const updateAddonGroup = useCallback(async (group: AddonGroup) => {
    await db.addonGroups.put(group);
    setAddonGroups(prev => prev.map(g => g.id === group.id ? group : g));
  }, []);
  const deleteAddonGroup = useCallback(async (groupId: number) => {
    await db.addonGroups.delete(groupId);
    setAddonGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);
  
  // --- Users ---
  const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
    const newId = await db.users.add(userData as User);
    setUsers(prev => [...prev, { ...userData, id: newId }]);
  }, []);
  const updateUser = useCallback(async (user: User) => {
    await db.users.put(user);
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  }, []);
  const deleteUser = useCallback(async (userId: number) => {
    await db.users.delete(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  // --- Printer Management ---
  const addPrinter = useCallback(async (printerData: Omit<Printer, 'id' | 'isDefaultReceipt' | 'isDefaultKitchen'>) => {
    const id = `${printerData.type}-${printerData.address}-${Date.now()}`;
    const newPrinter: Printer = { ...printerData, id, isDefaultReceipt: false, isDefaultKitchen: false };
    await db.printers.add(newPrinter);
    setPrinters(prev => [...prev, newPrinter]);
  }, []);
  const updatePrinter = useCallback(async (printer: Printer) => {
    await db.printers.put(printer);
    setPrinters(prev => prev.map(p => p.id === printer.id ? printer : p));
  }, []);
  const deletePrinter = useCallback(async (printerId: string) => {
    await db.printers.delete(printerId);
    setPrinters(prev => prev.filter(p => p.id !== printerId));
  }, []);
  const setDefaultPrinter = useCallback(async (printerId: string, type: 'receipt' | 'kitchen') => {
    const updatedPrinters = printers.map(p => {
        if (type === 'receipt') p.isDefaultReceipt = p.id === printerId;
        if (type === 'kitchen') p.isDefaultKitchen = p.id === printerId;
        return p;
    });
    await db.printers.bulkPut(updatedPrinters);
    setPrinters(updatedPrinters);
  }, [printers]);

  // =================================================================
  // --- CONTEXT PROVIDER VALUE
  // =================================================================
  const contextValue: AppContextType = {
    theme, toggleTheme, activeScreen, setActiveScreen, loading,
    currentUser, users, login, logout, addUser, updateUser, deleteUser,
    shopInfo, products, categories, recipes, customers, suppliers, purchaseInvoices, sales, payments, addons, addonGroups, expenses, printers,
    cart, addToCart, updateCartItem, removeFromCart, clearCart,
    lastSale, saleToPrint, setSaleToPrint, kitchenOrderToPrint, setKitchenOrderToPrint,
    appliedLoyaltyDiscount, setAppliedLoyaltyDiscount, appliedGeneralDiscount, setAppliedGeneralDiscount, deliveryFee, setDeliveryFee, isWholesale, setIsWholesale,
    activeShift, shifts, startShift, endShift, shiftToPrint, setShiftToPrint: handleSetShiftToPrint, addExpense, expensesForReport,
    getProductById, getRecipeById, findProductByBarcode, getCustomerById, getSupplierById, getAddonById,
    processSale, cancelSale, addPayment,
    addRecipe, updateRecipe, deleteRecipe,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addCustomer, updateCustomer, deleteCustomer,
    addSupplier, updateSupplier, deleteSupplier,
    addPurchaseInvoice,
    updateShopInfo,
    addAddon, updateAddon, deleteAddon,
    addAddonGroup, updateAddonGroup, deleteAddonGroup,
    addPrinter, updatePrinter, deletePrinter, setDefaultPrinter
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
