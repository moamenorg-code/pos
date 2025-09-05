import type { Category, Product, Recipe, Customer, Supplier, PurchaseInvoice, Sale, Payment, ShopInfo, User, UserPermissions, Addon, AddonGroup } from '../../types';

const ADMIN_PERMISSIONS: UserPermissions = {
    canAccessSales: true,
    canGiveDiscount: true,
    canAccessSalesHistory: true,
    canCancelSales: true,
    canAccessMenu: true,
    canManageMenu: true,
    canAccessInventory: true,
    canManageInventory: true,
    canAccessCustomers: true,
    canManageCustomers: true,
    canAccessSuppliers: true,
    canManageSuppliers: true,
    canAccessPurchases: true,
    canManagePurchases: true,
    canAccessPayments: true,
    canManagePayments: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManageUsers: true,
    canAccessShifts: true,
    canManageShifts: true,
};

const CASHIER_PERMISSIONS: UserPermissions = {
    canAccessSales: true,
    canGiveDiscount: false,
    canAccessSalesHistory: true,
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
    canAccessShifts: true,
    canManageShifts: false,
};

export const USERS: User[] = [
    { id: 1, name: 'مدير النظام', pin: '1111', role: 'admin', permissions: ADMIN_PERMISSIONS },
    { id: 2, name: 'الكاشير', pin: '1234', role: 'cashier', permissions: CASHIER_PERMISSIONS },
];

export const SHOP_INFO: ShopInfo = {
    id: 1,
    name: 'مقهى ومتجر الفن',
    address: '123 شارع النيل, القاهرة, مصر',
    phone: '01001234567',
    logoUrl: 'https://picsum.photos/seed/shoplogo/200',
    loyaltyEnabled: false,
    pointsPerPound: 1, // 1 point for every 1 pound spent
    poundPerPoint: 0.05, // 1 point is worth 0.05 pounds (5 piasters)
    taxEnabled: false,
    taxRate: 15 // 15% VAT
};

export const CATEGORIES: Category[] = [
  { id: 1, name: 'مشروبات' },
  { id: 2, name: 'مأكولات' },
  { id: 3, name: 'حلويات' },
  { id: 4, name: 'مواد أولية' },
];

export const ADDONS: Addon[] = [
    { id: 1, name: 'سكر زيادة', price: 0 },
    { id: 2, name: 'حليب إضافي', price: 3 },
    { id: 3, name: 'كريمة', price: 5 },
    { id: 4, name: 'جبنة إضافية', price: 10 },
    { id: 5, name: 'زيتون', price: 4 },
    { id: 6, name: 'مشروم', price: 6 },
];

export const ADDON_GROUPS: AddonGroup[] = [
    { id: 1, name: 'إضافات المشروبات', selectionType: 'multiple', addonIds: [1, 2, 3] },
    { id: 2, name: 'إضافات البيتزا', selectionType: 'multiple', addonIds: [4, 5, 6] },
];

export const PRODUCTS: Product[] = [
  // Raw Materials
  { id: 101, name: 'طماطم', price: 5, cost: 2.5, stock: 50, categoryId: 4, isRawMaterial: true, unit: 'كجم', lowStockThreshold: 10 },
  { id: 102, name: 'جبنة موزاريلا', price: 40, cost: 25, stock: 20, categoryId: 4, isRawMaterial: true, unit: 'كجم', lowStockThreshold: 5 },
  { id: 103, name: 'عجينة بيتزا', price: 10, cost: 4, stock: 100, categoryId: 4, isRawMaterial: true, unit: 'قطعة', lowStockThreshold: 20 },
  { id: 104, name: 'لحم مفروم', price: 80, cost: 65, stock: 15, categoryId: 4, isRawMaterial: true, unit: 'كجم', lowStockThreshold: 5 },
  { id: 105, name: 'خبز برجر', price: 2, cost: 0.8, stock: 200, categoryId: 4, isRawMaterial: true, unit: 'قطعة', lowStockThreshold: 50 },
  { id: 106, name: 'خس', price: 3, cost: 1.5, stock: 8, categoryId: 4, isRawMaterial: true, unit: 'كجم', lowStockThreshold: 10 },
  { id: 107, name: 'دقيق', price: 8, cost: 5, stock: 100, categoryId: 4, isRawMaterial: true, unit: 'كجم', lowStockThreshold: 20 },
  { id: 108, name: 'شوكولاتة خام', price: 60, cost: 45, stock: 4, categoryId: 4, isRawMaterial: true, unit: 'كجم', lowStockThreshold: 5 },

  // Sellable Products
  { id: 201, name: 'كوكا كولا', price: 5, wholesalePrice: 4, cost: 2, stock: 150, categoryId: 1, isRawMaterial: false, unit: 'علبة', barcode: '6291100140019', imageUrl: 'https://picsum.photos/seed/cocacola/200', lowStockThreshold: 24 },
  { id: 202, name: 'بيبسي', price: 5, wholesalePrice: 4, cost: 2, stock: 140, categoryId: 1, isRawMaterial: false, unit: 'علبة', barcode: '6281034100010', imageUrl: 'https://picsum.photos/seed/pepsi/200', lowStockThreshold: 24 },
  { id: 203, name: 'ماء معدني', price: 2, wholesalePrice: 1.5, cost: 0.75, stock: 300, categoryId: 1, isRawMaterial: false, unit: 'زجاجة', barcode: '6281074555034', imageUrl: 'https://picsum.photos/seed/water/200', lowStockThreshold: 48 },
  { id: 204, name: 'عصير برتقال', price: 10, cost: 3, stock: 80, categoryId: 1, isRawMaterial: false, unit: 'كوب', imageUrl: 'https://picsum.photos/seed/orangejuice/200', lowStockThreshold: 20, addonGroupIds: [1] },
];

export const RECIPES: Recipe[] = [
  { 
    id: 301, 
    name: 'بيتزا مارجريتا', 
    price: 45, 
    categoryId: 2, 
    ingredients: [
      { productId: 103, quantity: 1 },    // 1 piece عجينة بيتزا
      { productId: 101, quantity: 0.1 },  // 100g طماطم
      { productId: 102, quantity: 0.15 }, // 150g جبنة
    ],
    imageUrl: 'https://picsum.photos/seed/pizza/200',
    addonGroupIds: [2]
  },
  { 
    id: 302, 
    name: 'برجر لحم', 
    price: 55, 
    categoryId: 2, 
    ingredients: [
      { productId: 105, quantity: 1 },    // 1 piece خبز برجر
      { productId: 104, quantity: 0.18 }, // 180g لحم مفروم
      { productId: 106, quantity: 0.05 }, // 50g خس
      { productId: 101, quantity: 0.03 }, // 30g طماطم
    ],
    imageUrl: 'https://picsum.photos/seed/burger/200',
    addonGroupIds: [2]
  },
  { 
    id: 303, 
    name: 'كيك الشوكولاتة', 
    price: 30, 
    categoryId: 3, 
    ingredients: [
      { productId: 107, quantity: 0.2 }, // 200g دقيق
      { productId: 108, quantity: 0.1 }, // 100g شوكولاتة خام
    ],
    imageUrl: 'https://picsum.photos/seed/cake/200'
  },
];

export const CUSTOMERS: Customer[] = [
  { id: 1, name: 'أحمد محمود', phone: '01012345678', address: 'القاهرة, مصر الجديدة', balance: 0, loyaltyPoints: 250 },
  { id: 2, name: 'فاطمة علي', phone: '01276543210', address: 'الجيزة, المهندسين', balance: -150.50, loyaltyPoints: 1200 }, // Owes money
  { id: 3, name: 'شركة النور', phone: '0223456789', address: 'الإسكندرية, سموحة', balance: 500.00, loyaltyPoints: 50 }, // Has credit
];

export const SUPPLIERS: Supplier[] = [
    { id: 1, name: 'شركة المواد الغذائية المتحدة', phone: '0229876543', address: 'القاهرة, مدينة نصر', balance: -5000 }, // We owe them money
    { id: 2, name: 'مزارع الخضروات الطازجة', phone: '0403456789', address: 'طنطا, الغربية', balance: 0 },
    { id: 3, name: 'مؤسسة التغليف الحديث', phone: '034567890', address: 'الإسكندرية, العامرية', balance: 1200 }, // We have credit with them
];

export const PURCHASE_INVOICES: PurchaseInvoice[] = [];

export const SALES: Sale[] = [];

export const PAYMENTS: Payment[] = [];