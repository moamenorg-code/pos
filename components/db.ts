// Fix: Updated Dexie import to use a named import. The default import `import Dexie from 'dexie'` is for older versions or specific module configurations, and was causing TypeScript to not recognize inherited methods like 'version()' and properties like 'tables' on the POSDatabase class.
import { Dexie, type Table } from 'dexie';
import type { ShopInfo, Category, Product, Recipe, Customer, Supplier, PurchaseInvoice, Sale, Payment, User, BackupData, UserPermissions, Shift, Addon, AddonGroup, Expense, Printer } from '../types';

export class POSDatabase extends Dexie {
    // Table Type Definitions
    shopInfo!: Table<ShopInfo, number>;
    categories!: Table<Category, number>;
    products!: Table<Product, number>;
    recipes!: Table<Recipe, number>;
    customers!: Table<Customer, number>;
    suppliers!: Table<Supplier, number>;
    purchaseInvoices!: Table<PurchaseInvoice, number>;
    sales!: Table<Sale, number>;
    payments!: Table<Payment, number>;
    users!: Table<User, number>;
    shifts!: Table<Shift, number>;
    addons!: Table<Addon, number>;
    addonGroups!: Table<AddonGroup, number>;
    expenses!: Table<Expense, number>;
    printers!: Table<Printer, string>;

    constructor() {
        super('posDatabase');
        
        // --- Schema Definition & Migration Path ---
        this.version(9).stores({
            shopInfo: 'id',
            categories: '++id, name',
            products: '++id, name, categoryId, barcode',
            recipes: '++id, name, categoryId',
            customers: '++id, name, phone',
            suppliers: '++id, name, phone',
            purchaseInvoices: '++id, supplierId, date',
            sales: '++id, customerId, date, userId, status, shiftId',
            payments: '++id, type, entityId, date',
            users: '++id, name, role',
            shifts: '++id, userId, status',
            addons: '++id',
            addonGroups: '++id',
            expenses: '++id, shiftId',
            printers: 'id', // Primary key is a string
        });
        
        // Previous versions for a clear migration path
        this.version(8).stores({
            shopInfo: 'id',
            categories: '++id, name',
            products: '++id, name, categoryId, barcode',
            recipes: '++id, name, categoryId',
            customers: '++id, name, phone',
            suppliers: '++id, name, phone',
            purchaseInvoices: '++id, supplierId, date',
            sales: '++id, customerId, date, userId, status, shiftId',
            payments: '++id, type, entityId, date',
            users: '++id, name, role',
            shifts: '++id, userId, status',
            addons: '++id',
            addonGroups: '++id',
            expenses: '++id, shiftId',
        });

        this.version(7).stores({
            shopInfo: 'id',
            categories: '++id, name',
            products: '++id, name, categoryId, barcode',
            recipes: '++id, name, categoryId',
            customers: '++id, name, phone',
            suppliers: '++id, name, phone',
            purchaseInvoices: '++id, supplierId, date',
            sales: '++id, customerId, date, userId, status, shiftId',
            payments: '++id, type, entityId, date',
            users: '++id, name, role',
            shifts: '++id, userId, status',
            addons: '++id',
            addonGroups: '++id',
        });

        this.version(6).stores({
            shopInfo: 'id',
            categories: '++id, name',
            products: '++id, name, categoryId, barcode',
            recipes: '++id, name, categoryId',
            customers: '++id, name, phone',
            suppliers: '++id, name, phone',
            purchaseInvoices: '++id, supplierId, date',
            sales: '++id, customerId, date, userId, status, shiftId',
            payments: '++id, type, entityId, date',
            users: '++id, name, role',
            shifts: '++id, userId, status',
        });
        
        this.version(5).stores({
            shopInfo: 'id',
            categories: '++id, name',
            products: '++id, name, categoryId, barcode',
            recipes: '++id, name, categoryId',
            customers: '++id, name, phone',
            suppliers: '++id, name, phone',
            purchaseInvoices: '++id, supplierId, date',
            sales: '++id, customerId, date, userId, status',
            payments: '++id, type, entityId, date',
            users: '++id, name, role',
        }).upgrade(tx => {
            // This upgrade function adds the `permissions` property to existing users
            // from older database versions that didn't have it.
            return tx.table('users').toCollection().modify(user => {
                if (!user.permissions) {
                    user.permissions = this.getPermissionsForRole_V4(user.role);
                }
            });
        });

        this.version(4).stores({
            shopInfo: 'id',
            categories: '++id, name',
            products: '++id, name, categoryId, barcode',
            recipes: '++id, name, categoryId',
            customers: '++id, name, phone',
            suppliers: '++id, name, phone',
            purchaseInvoices: '++id, supplierId, date',
            sales: '++id, customerId, date, userId, status',
            payments: '++id, type, entityId, date',
            users: '++id, name, role',
        });
    }

    /**
     * Helper method for the v5 upgrade. Do not use for new logic.
     * This ensures backward compatibility for users created before permissions existed.
     */
    private getPermissionsForRole_V4(role: 'admin' | 'manager' | 'cashier'): UserPermissions {
        const allFalse: UserPermissions = {
            canAccessSales: false, canGiveDiscount: false, canAccessSalesHistory: false, canCancelSales: false,
            canAccessMenu: false, canManageMenu: false, canAccessInventory: false, canManageInventory: false,
            canAccessCustomers: false, canManageCustomers: false, canAccessSuppliers: false, canManageSuppliers: false,
            canAccessPurchases: false, canManagePurchases: false, canAccessPayments: false, canManagePayments: false,
            canAccessReports: false, canAccessSettings: false, canManageUsers: false,
            canAccessShifts: false, canManageShifts: false,
        };
        if (role === 'admin') {
            return Object.keys(allFalse).reduce((acc, key) => ({ ...acc, [key]: true }), {} as UserPermissions);
        }
        if (role === 'manager') {
            return {
                ...allFalse,
                canAccessSales: true, canGiveDiscount: true, canAccessSalesHistory: true, canCancelSales: true,
                canAccessMenu: true, canManageMenu: true, canAccessInventory: true, canManageInventory: true,
                canAccessCustomers: true, canManageCustomers: true, canAccessSuppliers: true, canManageSuppliers: true,
                canAccessPurchases: true, canManagePurchases: true, canAccessPayments: true, canManagePayments: true, 
                canAccessReports: true, canAccessShifts: true, canManageShifts: true,
            };
        }
        if (role === 'cashier') {
            return { ...allFalse, canAccessSales: true, canAccessSalesHistory: true, canAccessShifts: true };
        }
        return allFalse;
    }

    /**
     * Exports all data from the database into a single JSON object.
     * @returns {Promise<BackupData>} A promise that resolves with the backup data.
     */
    async exportAllData(): Promise<BackupData> {
        const data = await Promise.all(this.tables.map(table => table.toArray()));
        const result: BackupData = {
            shopInfo: data[0], categories: data[1], products: data[2], recipes: data[3],
            customers: data[4], suppliers: data[5], purchaseInvoices: data[6], sales: data[7],
            payments: data[8], users: data[9], shifts: data[10], addons: data[11],
            addonGroups: data[12], expenses: data[13], printers: data[14]
        };
        return result;
    }

    /**
     * Imports data from a backup object, clearing existing data first.
     * @param {BackupData} data The backup data object to import.
     * @returns {Promise<void>} A promise that resolves when the import is complete.
     */
    async importAllData(data: BackupData): Promise<void> {
        await this.transaction('rw', this.tables, async () => {
            // Clear all tables before importing
            await Promise.all(this.tables.map(table => table.clear()));

            // Import data into each table, checking if it exists in the backup
            if (data.shopInfo) await this.shopInfo.bulkAdd(data.shopInfo);
            if (data.categories) await this.categories.bulkAdd(data.categories);
            if (data.products) await this.products.bulkAdd(data.products);
            if (data.recipes) await this.recipes.bulkAdd(data.recipes);
            if (data.customers) await this.customers.bulkAdd(data.customers);
            if (data.suppliers) await this.suppliers.bulkAdd(data.suppliers);
            if (data.purchaseInvoices) await this.purchaseInvoices.bulkAdd(data.purchaseInvoices);
            if (data.sales) await this.sales.bulkAdd(data.sales);
            if (data.payments) await this.payments.bulkAdd(data.payments);
            if (data.users) await this.users.bulkAdd(data.users);
            if (data.shifts) await this.shifts.bulkAdd(data.shifts);
            if (data.addons) await this.addons.bulkAdd(data.addons);
            if (data.addonGroups) await this.addonGroups.bulkAdd(data.addonGroups);
            if (data.expenses) await this.expenses.bulkAdd(data.expenses);
            if (data.printers) await this.printers.bulkAdd(data.printers);
        });
    }
}

// Create a singleton instance of the database
export const db = new POSDatabase();