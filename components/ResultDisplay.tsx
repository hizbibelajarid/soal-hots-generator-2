import React, { ReactNode } from 'react';
import { SoalPart } from '../types';

interface ResultDisplayProps {
    soal: SoalPart[] | null;
    kunci: string;
    isLoadingSoal: boolean;
    isLoadingKunci: boolean;
    error: string | null;
}

const soalToStringForCopy = (soal: SoalPart[]): string => {
    return soal.map(part => {
        if (part.type === 'image') {
            return '[GAMBAR]';
        }
        return part.data;
    }).join('');
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-500"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-500" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-500" style={{ animationDelay: '0.4s' }}></div>
        <span className="text-slate-600 dark:text-slate-400">Generating...</span>
    </div>
);

const ResultCard: React.FC<{ title: string; onCopy: () => void; children: ReactNode; }> = ({ title, onCopy, children }) => (
     <div className="relative">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
        <button
            onClick={onCopy}
            className="absolute top-0 right-0 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold py-1 px-2 rounded-md transition-colors"
            aria-label={`Copy ${title}`}
        >
            Copy
        </button>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-200 dark:border-slate-700 whitespace-pre-wrap font-mono text-sm text-slate-800 dark:text-slate-200">
            {children}
        </div>
    </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({
    soal,
    kunci,
    isLoadingSoal,
    isLoadingKunci,
    error,
}) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };
    
    const renderContent = () => {
        if (isLoadingSoal) {
            return (
                <div className="text-center py-10">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Sedang membuat soal, mohon tunggu... Ini mungkin perlu waktu lebih lama jika ada gambar.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            );
        }

        if (!soal) {
            return (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">Hasil soal akan ditampilkan di sini.</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">Isi form di samping dan klik "Generate Soal" untuk memulai.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <ResultCard title="Generated Soal" onCopy={() => handleCopy(soalToStringForCopy(soal))}>
                    <div className="whitespace-pre-wrap font-sans text-base">
                        {soal.map((part, index) => {
                            if (part.type === 'text') {
                                return <span key={index}>{part.data}</span>;
                            }
                            if (part.type === 'image' && part.data) {
                                return (
                                    <img 
                                        key={index} 
                                        src={part.data} 
                                        alt="Gambar yang dihasilkan AI" 
                                        className="my-4 rounded-lg shadow-md max-w-full mx-auto"
                                    />
                                );
                            }
                            return null;
                        })}
                    </div>
                </ResultCard>

                {isLoadingKunci && (
                     <div className="text-center py-4">
                        <LoadingSpinner />
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Menampilkan kunci jawaban...</p>
                    </div>
                )}
                {kunci && (
                    <ResultCard title="Kunci Jawaban" onCopy={() => handleCopy(kunci)}>
                        <div className="whitespace-pre-wrap font-sans text-base">
                            {kunci}
                        </div>
                    </ResultCard>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg min-h-[400px] transition-colors duration-300">
            {renderContent()}
        </div>
    );
};

export default ResultDisplay;