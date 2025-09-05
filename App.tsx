import React, { useContext, useState, useEffect } from 'react';
import { AppProvider, AppContext } from './components/AppContext';
import type { AppContextType } from './types';
import { Screen } from './types';
import Sidebar from './components/Sidebar';
import SalesScreen from './components/SalesScreen';
import MenuManagementScreen from './components/MenuManagementScreen';
import InventoryScreen from './components/InventoryScreen';
import CustomersScreen from './components/CustomersScreen';
import SuppliersScreen from './components/SuppliersScreen';
import PurchasesScreen from './components/PurchasesScreen';
import SalesHistoryScreen from './components/SalesHistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import ReportsScreen from './components/ReportsScreen';
import LoginScreen from './components/LoginScreen';
import UserManagementScreen from './components/UserManagementScreen';
import PrintableInvoice from './components/PrintableInvoice';
import PrintableKitchenTicket from './components/PrintableKitchenTicket';
import ShiftsScreen from './components/ShiftsScreen';
import PrintableShiftReport from './components/PrintableShiftReport';
import { MenuIcon, LogoutIcon } from './components/icons';

const MainContent: React.FC = () => {
    const { activeScreen } = useContext(AppContext) as AppContextType;

    const renderScreen = () => {
        switch (activeScreen) {
            case Screen.Sales: return <SalesScreen />;
            case Screen.Menu: return <MenuManagementScreen />;
            case Screen.Inventory: return <InventoryScreen />;
            case Screen.Customers: return <CustomersScreen />;
            case Screen.Suppliers: return <SuppliersScreen />;
            case Screen.Purchases: return <PurchasesScreen />;
            case Screen.Reports: return <ReportsScreen />;
            case Screen.SalesHistory: return <SalesHistoryScreen />;
            case Screen.Settings: return <SettingsScreen />;
            case Screen.Users: return <UserManagementScreen />;
            case Screen.Shifts: return <ShiftsScreen />;
            default: return <SalesScreen />;
        }
    };

    return <div className="h-full">{renderScreen()}</div>;
};

const LoadingScreen: React.FC = () => (
    <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg flex flex-col justify-center items-center z-[100]">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-slate-200 h-24 w-24 mb-4"></div>
        <h2 className="text-center text-xl font-semibold text-light-text dark:text-dark-text">جاري تحميل البيانات...</h2>
        <style>{`
            .loader {
                border-top-color: #14b8a6; /* primary color */
                animation: spinner 1.2s linear infinite;
            }
            @keyframes spinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

const AppContent: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { loading, currentUser, logout, saleToPrint, setSaleToPrint, kitchenOrderToPrint, setKitchenOrderToPrint, shiftToPrint, setShiftToPrint, expensesForReport } = useContext(AppContext) as AppContextType;

  useEffect(() => {
    if (saleToPrint || kitchenOrderToPrint || shiftToPrint) {
      const handleAfterPrint = () => {
        setSaleToPrint(null);
        setKitchenOrderToPrint(null);
        setShiftToPrint(null);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      
      setTimeout(() => {
          window.print();
      }, 50);

      return () => {
          window.removeEventListener('afterprint', handleAfterPrint);
      }
    }
  }, [saleToPrint, kitchenOrderToPrint, shiftToPrint, setSaleToPrint, setKitchenOrderToPrint, setShiftToPrint]);

  if (loading) {
      return <LoadingScreen />;
  }

  if (!currentUser) {
      return <LoginScreen />;
  }
  
  const thingToPrint = saleToPrint ? <PrintableInvoice sale={saleToPrint} /> 
    : kitchenOrderToPrint ? <PrintableKitchenTicket sale={kitchenOrderToPrint} /> 
    : shiftToPrint ? <PrintableShiftReport shift={shiftToPrint} expenses={expensesForReport} />
    : null;

  return (
    <>
      <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
        <div className="flex h-screen">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
          <main className="flex-1 p-4 sm:p-6 transition-all duration-300 sm:mr-64 flex flex-col">
            <header className="flex-shrink-0 flex justify-between items-center mb-4">
                <button onClick={() => setSidebarOpen(true)} className="sm:hidden p-2 bg-light-card dark:bg-dark-card rounded-md border border-light-border dark:border-dark-border">
                    <MenuIcon className="w-6 h-6"/>
                </button>
                <div className="flex-grow flex items-center justify-end gap-4">
                    <div className="text-right">
                        <span className="font-semibold">{currentUser.name}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 block capitalize">{currentUser.role}</span>
                    </div>
                    <button onClick={logout} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" title="تسجيل الخروج">
                        <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            <div className="flex-grow h-full" style={{height: 'calc(100vh - 6rem)'}}>
              <MainContent />
            </div>
          </main>
        </div>
      </div>
      {thingToPrint}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;