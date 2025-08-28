export enum QuestionType {
    PILIHAN_GANDA = 'Pilihan Ganda',
    ESSAY = 'Essay',
}

export interface FormData {
    mapel: string;
    jenjang: string;
    kelas?: string;
    tipe_soal: QuestionType;
    jumlah_soal: number;
    materi: string;
}

export type SoalPart = {
    type: 'text' | 'image';
    data: string;
};