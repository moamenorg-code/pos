
import React from 'react';

interface PlaceholderScreenProps {
  title: string;
  icon: React.ReactNode;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, icon }) => {
  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border h-full flex flex-col justify-center items-center text-center">
      <div className="text-primary mb-4">
        {icon}
      </div>
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400">هذه الميزة قيد التطوير حالياً.</p>
    </div>
  );
};

export default PlaceholderScreen;