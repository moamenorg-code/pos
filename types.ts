// =================================================================
// --- ENUMS & LITERAL TYPES
// =================================================================

export enum Screen {
  Sales,
  Menu,
  Inventory,
  Customers,
  Suppliers,
  Purchases,
  Reports,
  SalesHistory,
  Settings,
  Users,
  Shifts,
}

export type UserRole = 'admin' | 'manager' | 'cashier' | 'custom';
export type DiscountType = 'fixed' | 'percentage' | 'none';
export type PrinterType = 'network' | 'bluetooth' | 'usb';

// =================================================================
// --- CORE ENTITIES
// =================================================================

export interface ShopInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  loyaltyEnabled: boolean;
  pointsPerPound: number; // How many points are earned for 1 unit of currency
  poundPerPoint: number;  // How much 1 point is worth in currency for redemption
  taxEnabled: boolean;
  taxRate: number; // Percentage, e.g., 15 for 15%
}

export interface Category {
  id: number;
  name: string;
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface AddonGroup {
  id: number;
  name: string;
  selectionType: 'single' | 'multiple';
  addonIds: number[];
}

export interface Product {
  id: number;
  name: string;
  price: number; // Retail price
  wholesalePrice?: number; // Wholesale price
  cost: number;
  stock: number;
  categoryId: number;
  isRawMaterial: boolean;
  unit: string; // e.g., 'kg', 'g', 'piece'
  barcode?: string;
  imageUrl?: string;
  lowStockThreshold?: number;
  addonGroupIds?: number[];
}

export interface Ingredient {
  productId: number; // Links to a raw material product
  quantity: number;
}

export interface Recipe {
  id: number;
  name:string;
  price: number;
  categoryId: number;
  ingredients: Ingredient[];
  imageUrl?: string;
  addonGroupIds?: number[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  balance: number; // For tracking debt/credit
  loyaltyPoints: number;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
  balance: number; // For tracking debt/credit
}

export interface UserPermissions {
  // Sales & History
  canAccessSales: boolean;
  canGiveDiscount: boolean;
  canAccessSalesHistory: boolean;
  canCancelSales: boolean;

  // Menu Management
  canAccessMenu: boolean;
  canManageMenu: boolean; // Add, edit, delete products, recipes, categories, addons
  
  // Inventory Management
  canAccessInventory: boolean;
  canManageInventory: boolean;

  // Other Management Screens
  canAccessCustomers: boolean;
  canManageCustomers: boolean;
  canAccessSuppliers: boolean;
  canManageSuppliers: boolean;
  canAccessPurchases: boolean;
  canManagePurchases: boolean;
  canAccessPayments: boolean;
  canManagePayments: boolean;

  // High-level Screens
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;

  // Shifts
  canAccessShifts: boolean;
  canManageShifts: boolean; // View history of all shifts
}

export interface User {
  id: number;
  name: string;
  pin: string; // 4-digit PIN
  role: UserRole;
  permissions: UserPermissions;
}

export interface Printer {
  id: string; // Composite key like 'network-192.168.1.20:9100' or generated UUID
  name: string;
  type: PrinterType;
  address: string; // IP:Port, MAC address, etc.
  isDefaultReceipt: boolean;
  isDefaultKitchen: boolean;
}

// =================================================================
// --- TRANSACTIONAL ENTITIES
// =================================================================

export interface CartItem {
  cartItemId: string; // Unique identifier for this specific item instance in the cart
  id: number; // Can be product id or recipe id
  name: string;
  price: number; // Base price of the product/recipe
  cost: number; // Cost of the item (product cost or calculated recipe cost)
  quantity: number;
  type: 'product' | 'recipe';
  selectedAddons: Addon[];
  notes?: string;
}

export interface PurchaseItem {
  productId: number;
  quantity: number;
  cost: number; // Purchase price per unit
}

export interface PurchaseInvoice {
  id: number;
  supplierId: number;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
}

export interface Sale {
  id: number;
  date: string;
  items: CartItem[];
  subTotal: number;
  discountType: 'fixed' | 'percentage' | 'none';
  discountValue: number; // The entered value (e.g., 10 for 10%, 5 for 5 SAR)
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  totalCost: number; // Total cost of goods sold for this sale
  customerId: number | null;
  userId: number;
  userName: string;
  paymentDetails: {
    cash: number;
    card: number;
    credit: number;
  };
  pointsRedeemed: number;
  pointsEarned: number;
  status: 'completed' | 'canceled';
  shiftId?: number;
}

export interface Payment {
  id: number;
  date: string;
  type: 'customer' | 'supplier';
  entityId: number; // customerId or supplierId
  amount: number;
}

export interface Expense {
  id: number;
  shiftId: number;
  description: string;
  amount: number;
  date: string;
}

export interface Shift {
  id: number;
  userId: number;
  userName: string;
  startTime: string;
  endTime: string | null;
  status: 'active' | 'closed';
  
  // Financials
  startingCash: number; // Cash in drawer at start
  endingCash: number; // Counted cash at end
  
  cashSales: number; // From sale.paymentDetails.cash
  cardSales: number; // From sale.paymentDetails.card
  totalExpenses: number; // Sum of expenses during the shift
  
  // Calculated fields
  totalSales: number; // Sum of sales totalAmount
  expectedCash: number; // startingCash + cashSales - totalExpenses
  difference: number; // endingCash - expectedCash
}

// =================================================================
// --- UTILITY & WRAPPER TYPES
// =================================================================

export interface BackupData {
  shopInfo: ShopInfo[];
  categories: Category[];
  products: Product[];
  recipes: Recipe[];
  customers: Customer[];
  suppliers: Supplier[];
  purchaseInvoices: PurchaseInvoice[];
  sales: Sale[];
  payments: Payment[];
  users: User[];
  addons?: Addon[];
  addonGroups?: AddonGroup[];
  expenses?: Expense[];
  shifts?: Shift[];
  printers?: Printer[];
}

export interface AppContextType {
  // --- Global State ---
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  loading: boolean;
  
  // --- Auth & Users ---
  currentUser: User | null;
  users: User[];
  login: (userId: number, pin: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: number) => void;
  
  // --- Data State ---
  shopInfo: ShopInfo | null;
  products: Product[];
  categories: Category[];
  recipes: Recipe[];
  customers: Customer[];
  suppliers: Supplier[];
  purchaseInvoices: PurchaseInvoice[];
  sales: Sale[];
  payments: Payment[];
  addons: Addon[];
  addonGroups: AddonGroup[];
  expenses: Expense[];
  printers: Printer[];
  
  // --- Cart & Sale Flow State ---
  cart: CartItem[];
  addToCart: (item: Product | Recipe, type: 'product' | 'recipe') => void;
  updateCartItem: (cartItemId: string, updates: Partial<Pick<CartItem, 'quantity' | 'notes' | 'selectedAddons'>>) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  
  lastSale: Sale | null;
  saleToPrint: Sale | null;
  setSaleToPrint: (sale: Sale | null) => void;
  kitchenOrderToPrint: Sale | null;
  setKitchenOrderToPrint: (sale: Sale | null) => void;
  appliedLoyaltyDiscount: number;
  setAppliedLoyaltyDiscount: (discount: number) => void;
  appliedGeneralDiscount: number;
  setAppliedGeneralDiscount: (discount: number) => void;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  isWholesale: boolean;
  setIsWholesale: (isWholesale: boolean) => void;

  // --- Shift & Expense Management ---
  activeShift: Shift | null;
  shifts: Shift[];
  startShift: (startingCash: number) => Promise<void>;
  endShift: (endingCash: number) => Promise<void>;
  shiftToPrint: Shift | null;
  setShiftToPrint: (shift: Shift | null) => void;
  addExpense: (expenseData: { description: string; amount: number }) => Promise<void>;
  expensesForReport: Expense[]; // For printing report
  
  // --- Data Getters ---
  getProductById: (id: number) => Product | undefined;
  getRecipeById: (id: number) => Recipe | undefined;
  findProductByBarcode: (barcode: string) => Product | undefined;
  getCustomerById: (id: number) => Customer | undefined;
  getSupplierById: (id: number) => Supplier | undefined;
  getAddonById: (id: number) => Addon | undefined;
  
  // --- Core Actions ---
  processSale: (details: { 
    customerId: number | null; 
    paymentDetails: { cash: number; card: number; credit: number }; 
    redeemedPoints: number;
    discountType: DiscountType;
    discountValue: number;
    deliveryFee: number;
  }) => void;
  cancelSale: (saleId: number) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  
  // --- CRUD Actions ---
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: number) => void;
  addProduct: (product: Omit<Product, 'id' | 'imageUrl'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: number) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'balance' | 'loyaltyPoints'>) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (customerId: number) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: number) => void;
  addPurchaseInvoice: (invoice: Omit<PurchaseInvoice, 'id'>) => void;
  updateShopInfo: (info: Omit<ShopInfo, 'id'>) => void;
  addAddon: (addon: Omit<Addon, 'id'>) => Promise<void>;
  updateAddon: (addon: Addon) => Promise<void>;
  deleteAddon: (addonId: number) => Promise<void>;
  addAddonGroup: (group: Omit<AddonGroup, 'id'>) => Promise<void>;
  updateAddonGroup: (group: AddonGroup) => Promise<void>;
  deleteAddonGroup: (groupId: number) => Promise<void>;
  
  // --- Printer Management ---
  addPrinter: (printer: Omit<Printer, 'id' | 'isDefaultReceipt' | 'isDefaultKitchen'>) => Promise<void>;
  updatePrinter: (printer: Printer) => Promise<void>;
  deletePrinter: (printerId: string) => Promise<void>;
  setDefaultPrinter: (printerId: string, type: 'receipt' | 'kitchen') => Promise<void>;
}