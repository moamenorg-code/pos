import React, { useContext, useMemo } from 'react';
import { AppContext } from './AppContext';
import { Screen, UserPermissions } from '../types';
import type { AppContextType } from '../types';
import { SalesIcon, DocumentTextIcon, DashboardIcon, HistoryIcon, CustomerIcon, SupplierIcon, PurchaseIcon, SettingsIcon, UserIcon, ShiftIcon, InventoryIcon } from './icons';
import ThemeToggle from './ThemeToggle';

const allNavItems = [
  { screen: Screen.Sales, label: 'المبيعات', icon: SalesIcon, permission: 'canAccessSales' as keyof UserPermissions },
  { screen: Screen.SalesHistory, label: 'سجل المبيعات', icon: HistoryIcon, permission: 'canAccessSalesHistory' as keyof UserPermissions },
  { screen: Screen.Shifts, label: 'الورديات', icon: ShiftIcon, permission: 'canAccessShifts' as keyof UserPermissions },
  { screen: Screen.Menu, label: 'إدارة القائمة', icon: DocumentTextIcon, permission: 'canAccessMenu' as keyof UserPermissions },
  { screen: Screen.Inventory, label: 'المخزون', icon: InventoryIcon, permission: 'canAccessInventory' as keyof UserPermissions },
  { screen: Screen.Customers, label: 'العملاء', icon: CustomerIcon, permission: 'canAccessCustomers' as keyof UserPermissions },
  { screen: Screen.Suppliers, label: 'الموردين', icon: SupplierIcon, permission: 'canAccessSuppliers' as keyof UserPermissions },
  { screen: Screen.Purchases, label: 'المشتريات', icon: PurchaseIcon, permission: 'canAccessPurchases' as keyof UserPermissions },
  { screen: Screen.Reports, label: 'التقارير', icon: DashboardIcon, permission: 'canAccessReports' as keyof UserPermissions },
  { screen: Screen.Settings, label: 'الإعدادات', icon: SettingsIcon, permission: 'canAccessSettings' as keyof UserPermissions },
  { screen: Screen.Users, label: 'إدارة المستخدمين', icon: UserIcon, permission: 'canManageUsers' as keyof UserPermissions },
];

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const { activeScreen, setActiveScreen, currentUser } = useContext(AppContext) as AppContextType;

  const navItems = useMemo(() => {
    if (!currentUser) return [];
    
    // Define the desired order of screens in the sidebar
    const orderedScreens = [
        Screen.Sales, Screen.SalesHistory, Screen.Shifts,
        Screen.Menu, Screen.Inventory,
        Screen.Customers, Screen.Suppliers, Screen.Purchases,
        Screen.Reports,
        Screen.Settings, Screen.Users
    ];
    
    const itemMap = new Map(allNavItems.map(item => [item.screen, item]));
    
    // Filter and order the items based on permissions and the defined order
    const orderedItems = orderedScreens
        .map(screen => itemMap.get(screen))
        .filter((item): item is typeof allNavItems[0] => !!item && currentUser.permissions[item.permission]);

    return orderedItems;
  }, [currentUser]);

  const NavItem: React.FC<{
    item: typeof allNavItems[0];
    isActive: boolean;
    onClick: () => void;
  }> = ({ item, isActive, onClick }) => (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
          setIsOpen(false);
        }}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 font-semibold ${
          isActive
            ? 'bg-primary text-white'
            : 'text-slate-600 dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary-light'
        }`}
      >
        <item.icon className="w-6 h-6" />
        <span className="ms-3 text-base">{item.label}</span>
      </a>
    </li>
  );

  const sidebarClasses = `fixed top-0 right-0 z-40 w-64 h-screen transition-transform transform ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  } sm:translate-x-0`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden" onClick={() => setIsOpen(false)}></div>}
      
      <aside className={sidebarClasses} aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-8 p-2">
            <h1 className="text-2xl font-extrabold text-primary">RMS POS</h1>
            <ThemeToggle />
          </div>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.screen}
                item={item}
                isActive={activeScreen === item.screen}
                onClick={() => setActiveScreen(item.screen)}
              />
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;