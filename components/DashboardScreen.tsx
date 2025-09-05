import React from 'react';
import { ChartBarIcon } from './icons';

const DashboardScreen: React.FC = () => {
    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border h-full overflow-hidden flex flex-col items-center justify-center">
            <ChartBarIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">لوحة التحكم</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">تم تعطيل هذه الميزة مؤقتاً.</p>
        </div>
    );
};

export default DashboardScreen;