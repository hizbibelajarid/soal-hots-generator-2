import React, { useState, FormEvent, useEffect } from 'react';
import { FormData, QuestionType } from '../types';

interface GeneratorFormProps {
    onGenerate: (formData: FormData) => void;
    onShowKunci: () => void;
    isGeneratingSoal: boolean;
    isGeneratingKunci: boolean;
    canShowKunci: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({
    onGenerate,
    onShowKunci,
    isGeneratingSoal,
    isGeneratingKunci,
    canShowKunci,
}) => {
    const [mapel, setMapel] = useState('Matematika');
    const [jenjang, setJenjang] = useState('SMP');
    const [kelas, setKelas] = useState('7');
    const [tipeSoal, setTipeSoal] = useState<QuestionType>(QuestionType.PILIHAN_GANDA);
    const [jumlahSoal, setJumlahSoal] = useState<number>(5);
    const [materi, setMateri] = useState('');

    const kelasOptions: { [key: string]: string[] } = {
        'SD': ['1', '2', '3', '4', '5', '6'],
        'SMP': ['7', '8', '9'],
        'SMA': ['10', '11', '12'],
    };

    useEffect(() => {
        // Saat jenjang berubah, update kelas ke pilihan pertama yang valid
        if (jenjang in kelasOptions) {
            setKelas(kelasOptions[jenjang][0]);
        }
    }, [jenjang]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onGenerate({
            mapel,
            jenjang,
            kelas: jenjang in kelasOptions ? kelas : undefined,
            tipe_soal: tipeSoal,
            jumlah_soal: jumlahSoal,
            materi,
        });
    };
    
    const mapelOptions = [
        "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS",
        "PAI", "PPKn", "Prakarya", "PJOK", "Seni Budaya", "TIK/Informatika"
    ];

    const jenjangOptions = ["SD", "SMP", "SMA"];

    const formControlClass = "w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
    const buttonClass = "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2";
    const primaryButtonClass = `${buttonClass} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;
    const secondaryButtonClass = `${buttonClass} bg-sky-600 hover:bg-sky-700 focus:ring-sky-500`;
    const disabledButtonClass = "bg-slate-400 dark:bg-slate-600 cursor-not-allowed";

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Parameter Soal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="mapel" className={labelClass}>Mata Pelajaran</label>
                    <select id="mapel" value={mapel} onChange={(e) => setMapel(e.target.value)} className={formControlClass}>
                        {mapelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="jenjang" className={labelClass}>Jenjang</label>
                    <select id="jenjang" value={jenjang} onChange={(e) => setJenjang(e.target.value)} className={formControlClass}>
                        {jenjangOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                
                {jenjang in kelasOptions && (
                     <div>
                        <label htmlFor="kelas" className={labelClass}>Kelas</label>
                        <select id="kelas" value={kelas} onChange={(e) => setKelas(e.target.value)} className={formControlClass}>
                            {kelasOptions[jenjang].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label className={labelClass}>Tipe Soal</label>
                    <div className="flex space-x-4">
                        {(Object.values(QuestionType) as Array<QuestionType>).map(type => (
                            <div key={type} className="flex items-center">
                                <input
                                    id={`tipe_soal_${type}`}
                                    type="radio"
                                    name="tipe_soal"
                                    value={type}
                                    checked={tipeSoal === type}
                                    onChange={() => setTipeSoal(type)}
                                    className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-indigo-500"
                                />
                                <label htmlFor={`tipe_soal_${type}`} className="ml-2 block text-sm text-slate-900 dark:text-slate-200">{type}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="jumlah_soal" className={labelClass}>Jumlah Soal</label>
                    <input
                        id="jumlah_soal"
                        type="number"
                        value={jumlahSoal}
                        onChange={(e) => setJumlahSoal(parseInt(e.target.value, 10) || 1)}
                        min="1"
                        max="20"
                        placeholder="Contoh: 5"
                        className={formControlClass}
                    />
                </div>

                <div>
                    <label htmlFor="materi" className={labelClass}>Materi Soal</label>
                    <textarea
                        id="materi"
                        value={materi}
                        onChange={(e) => setMateri(e.target.value)}
                        placeholder="Contoh: Pecahan, Teks Deskripsi, Sistem Peredaran Darah"
                        rows={3}
                        className={formControlClass}
                        required
                    />
                </div>

                <div className="space-y-3 pt-2">
                    <button
                        type="submit"
                        disabled={isGeneratingSoal || !materi.trim()}
                        className={`${primaryButtonClass} ${isGeneratingSoal || !materi.trim() ? disabledButtonClass : ''}`}
                    >
                        {isGeneratingSoal ? 'Membuat Soal...' : 'Generate Soal'}
                    </button>
                    <button
                        type="button"
                        onClick={onShowKunci}
                        disabled={!canShowKunci || isGeneratingKunci}
                        className={`${secondaryButtonClass} ${!canShowKunci || isGeneratingKunci ? disabledButtonClass : ''}`}
                    >
                        {isGeneratingKunci ? 'Mencari Jawaban...' : 'Tampilkan Kunci Jawaban'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneratorForm;