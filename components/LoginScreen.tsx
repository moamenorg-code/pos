import React, { useContext, useState } from 'react';
import { AppContext } from './AppContext';
import type { AppContextType, User } from '../types';
import ThemeToggle from './ThemeToggle';

const LoginScreen: React.FC = () => {
    const { users, login } = useContext(AppContext) as AppContextType;
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleLogin = async () => {
        if (!selectedUser || pin.length !== 4) {
            setError('الرجاء إدخال 4 أرقام');
            return;
        }
        
        setError('');
        const success = await login(selectedUser.id, pin);
        if (!success) {
            setError('الرمز السري غير صحيح');
            setPin('');
        }
    };

    const PinPad: React.FC = () => {
        const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'مسح', '0'];
        return (
            <div className="grid grid-cols-3 gap-4">
                {buttons.map(btn => (
                    <button
                        key={btn}
                        onClick={() => btn === 'مسح' ? handleBackspace() : handlePinInput(btn)}
                        className="py-4 text-2xl font-bold bg-slate-100 dark:bg-dark-bg-alt rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {btn}
                    </button>
                ))}
                <button
                    onClick={handleLogin}
                    className="col-span-3 py-4 text-xl font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    دخول
                </button>
            </div>
        );
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen flex flex-col items-center justify-center p-4">
             <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <h1 className="text-4xl font-extrabold text-primary mb-8">RMS POS</h1>
            
            <div className="w-full max-w-md bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8">
                {selectedUser ? (
                    // PIN Entry View
                    <div>
                        <div className="text-center mb-6">
                            <button onClick={() => { setSelectedUser(null); setPin(''); setError(''); }} className="text-sm text-slate-500 hover:underline mb-2">
                                &larr; العودة لاختيار المستخدم
                            </button>
                            <h2 className="text-2xl font-bold">مرحباً, {selectedUser.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">أدخل الرمز السري الخاص بك</p>
                        </div>
                        <div className="flex justify-center items-center gap-3 mb-4 h-10">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full transition-colors ${pin.length > i ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-500'}`} />
                            ))}
                        </div>
                         {error && <p className="text-red-500 text-center mb-4 h-6">{error}</p>}
                        <PinPad />
                    </div>
                ) : (
                    // User Selection View
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-6">اختر المستخدم للدخول</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="p-4 bg-slate-100 dark:bg-dark-bg-alt rounded-lg text-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-transparent hover:border-primary"
                                >
                                    <span className="text-lg font-semibold">{user.name}</span>
                                    <span className="block text-sm text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;