import React, { useState, useCallback, useEffect } from 'react';
import { FormData, SoalPart } from './types';
import { generateQuestions, generateAnswerKey } from './services/geminiService';
import Header from './components/Header';
import GeneratorForm from './components/GeneratorForm';
import ResultDisplay from './components/ResultDisplay';

// Helper function to convert structured SoalParts to a plain string
const soalToString = (soal: SoalPart[]): string => {
    return soal.map(part => {
        if (part.type === 'image') {
            return '[GAMBAR]'; // Placeholder for images in the text sent for answer key generation
        }
        return part.data;
    }).join('');
};

const App: React.FC = () => {
    // Centralize theme logic here for clarity and robustness.
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') {
            return 'light';
        }
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [formDataCache, setFormDataCache] = useState<FormData | null>(null);
    const [generatedSoal, setGeneratedSoal] = useState<SoalPart[] | null>(null);
    const [kunciJawaban, setKunciJawaban] = useState<string>('');
    const [isLoadingSoal, setIsLoadingSoal] = useState<boolean>(false);
    const [isLoadingKunci, setIsLoadingKunci] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to apply the theme class to the HTML element and save to localStorage.
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme to localStorage.', e);
        }
    }, [theme]);
    
    // Use useCallback to memoize the toggle function for performance consistency.
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    const handleGenerateSoal = useCallback(async (formData: FormData) => {
        setIsLoadingSoal(true);
        setError(null);
        setGeneratedSoal(null);
        setKunciJawaban('');
        setFormDataCache(null);

        try {
            const result = await generateQuestions(formData);
            setGeneratedSoal(result);
            setFormDataCache(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoadingSoal(false);
        }
    }, []);

    const handleShowKunci = useCallback(async () => {
        if (!formDataCache || !generatedSoal) {
            setError("Silakan generate soal terlebih dahulu.");
            return;
        }

        setIsLoadingKunci(true);
        setError(null);
        setKunciJawaban('');

        try {
            const soalAsString = soalToString(generatedSoal);
            const result = await generateAnswerKey(formDataCache, soalAsString);
            setKunciJawaban(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoadingKunci(false);
        }
    }, [formDataCache, generatedSoal]);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Header theme={theme} toggleTheme={toggleTheme} />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4">
                        <GeneratorForm
                            onGenerate={handleGenerateSoal}
                            onShowKunci={handleShowKunci}
                            isGeneratingSoal={isLoadingSoal}
                            isGeneratingKunci={isLoadingKunci}
                            canShowKunci={!!generatedSoal && !kunciJawaban}
                        />
                    </div>
                    <div className="lg:col-span-8">
                       <ResultDisplay
                            soal={generatedSoal}
                            kunci={kunciJawaban}
                            isLoadingSoal={isLoadingSoal}
                            isLoadingKunci={isLoadingKunci}
                            error={error}
                        />
                    </div>
                </div>
            </main>
             <footer className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                <p>Powered by Google Gemini API</p>
            </footer>
        </div>
    );
};

export default App;
