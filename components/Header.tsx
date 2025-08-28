import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-700/50 sticky top-0 z-10 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                        Soal Generator
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">Aplikasi pembuat soal otomatis by Muhammad Hizbi Audah, S.Kom</p>
                </div>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </header>
    );
};

export default Header;