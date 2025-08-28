// FIX: Removed unused HarmCategory and HarmBlockThreshold imports.
import { GoogleGenAI } from "@google/genai";
import { FormData, SoalPart } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Removed unused safetySettings constant. It is not a valid parameter for generateImages or generateContent.

const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    const enhancedPrompt = `A clear, simple, educational illustration for a school textbook, in a clean vector art style. The image should be simple enough for a student to understand easily. Subject of the image: ${prompt}`;
    try {
        // FIX: The 'safetySettings' property is not a valid parameter for generateImages.
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: enhancedPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '4:3',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error)
        {
        console.error(`Error generating image for prompt "${prompt}":`, error);
        // Mengembalikan string kosong atau gambar placeholder jika gagal
        return '';
    }
};

export const generateQuestions = async (formData: FormData): Promise<SoalPart[]> => {
    const { mapel, jenjang, kelas, tipe_soal, jumlah_soal, materi } = formData;
    const jenjangDetail = kelas ? `${jenjang} kelas ${kelas}` : jenjang;
    const isEnglish = mapel === 'Bahasa Inggris';

    const systemInstruction = isEnglish
    ? `You are an experienced English teacher in Indonesia, an expert in designing assessments for ${jenjangDetail} students.`
    : `Anda adalah seorang guru ${mapel} di Indonesia yang berpengalaman dalam membuat soal untuk siswa ${jenjangDetail}.`;

    const prompt = isEnglish
    ? `Create ${jumlah_soal} ${tipe_soal} questions about "${materi}".
- The questions should promote Higher-Order Thinking Skills (HOTS), requiring analysis, evaluation, or creation, not just recalling facts.
- The questions should be suitable for ${jenjangDetail} students in Indonesia.
- If relevant, include a descriptive placeholder for 1-2 images, like this: "[IMAGE: A diagram of the human heart]".
- For Multiple Choice questions, provide 4 options (A, B, C, D).
- Format: Use plain text with clear numbering. Do not use markdown (like **).
- IMPORTANT: Do not include the answer key.`
    : `Buat ${jumlah_soal} soal ${tipe_soal} tentang "${materi}".
- Buatlah soal yang mendorong Berpikir Tingkat Tinggi (HOTS), yang memerlukan analisis, evaluasi, atau kreasi, bukan hanya mengingat fakta.
- Soal harus cocok untuk siswa ${jenjangDetail} di Indonesia.
- Jika relevan, sertakan placeholder deskriptif untuk 1-2 gambar, contoh: "[GAMBAR: Infografis piramida makanan]".
- Untuk Pilihan Ganda, berikan 4 opsi (A, B, C, D).
- Format: Gunakan teks biasa dengan penomoran yang jelas. Jangan gunakan markdown (seperti **).
- PENTING: Jangan sertakan kunci jawaban.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
        });

        let textContent = response.text.replace(/\*\*/g, '');
        const imageRegex = isEnglish ? /\[IMAGE:\s*([^\]]+)\]/g : /\[GAMBAR:\s*([^\]]+)\]/g;
        const parts: (string | Promise<string>)[] = [];
        let lastIndex = 0;
        let match;

        while ((match = imageRegex.exec(textContent)) !== null) {
            if (match.index > lastIndex) {
                parts.push(textContent.substring(lastIndex, match.index));
            }
            const imagePrompt = match[1];
            parts.push(generateImageFromPrompt(imagePrompt));
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < textContent.length) {
            parts.push(textContent.substring(lastIndex));
        }

        const processedParts = await Promise.all(parts);

        return processedParts.map((part): SoalPart => {
            if (part.startsWith('data:image')) {
                return { type: 'image', data: part };
            }
            return { type: 'text', data: part };
        }).filter(part => part.data.trim() !== '');

    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Gagal membuat soal. Silakan coba lagi.");
    }
};

export const generateAnswerKey = async (formData: FormData, questions: string): Promise<string> => {
    const { mapel } = formData;
    const isEnglish = mapel === 'Bahasa Inggris';

    const systemInstruction = isEnglish
    ? "You are an expert teaching assistant, skilled at providing clear and logical answer keys with explanations in English."
    : "Anda adalah seorang asisten guru yang ahli dalam memberikan kunci jawaban beserta penjelasan yang logis.";

    const prompt = isEnglish
    ? `Provide the answer key for the following questions. For each question, give the correct answer and a brief explanation. Do not use markdown.

--- QUESTIONS ---
${questions}
--- END ---`
    : `Berikan kunci jawaban untuk soal-soal berikut. Untuk setiap nomor, berikan jawaban yang benar dan penjelasan singkat. Jangan gunakan markdown.

--- SOAL ---
${questions}
--- AKHIR ---`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            },
        });
        return response.text.replace(/\*\*/g, '');
    } catch (error) {
        console.error("Error generating answer key:", error);
        throw new Error("Gagal membuat kunci jawaban. Silakan coba lagi.");
    }
};