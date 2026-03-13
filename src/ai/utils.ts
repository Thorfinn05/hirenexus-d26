export const GROQ_MODELS = [
    // 'meta-llama/llama-4-scout-17b-16e-instruct',
    // 'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'moonshotai/kimi-k2-instruct-0905',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'qwen/qwen3-32b'
];

let currentModelIndex = 0;

export function extractJson(text: string): any {
    try {
        // Attempt parsing directly first
        return JSON.parse(text).output;
    } catch (e) {
        // Strip markdown formatting if present
        // const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const cleanText = text.replace(/<think>[\s\S]*?<\/think>/g, '') // Strip reasoning
                      .replace(/```json/g, '')
                      .replace(/```/g, '')
                      .trim();
        try {
            return JSON.parse(cleanText).output;
        } catch (err) {
            // Fallback to finding the first { ... } block
            const match = text.match(/\{[\s\S]*?\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]).output;
                } catch (error) {
                    console.warn("[AI Utils] JSON extraction failed completely:", text);
                    return null;
                }
            }
            return null;
        }
    }
}

export async function executeWithFallback<TInput>(
    promptFn: (input: TInput, config?: any) => Promise<{ text: string }>,
    input: TInput
): Promise<{ text: string }> {
    let attempts = 0;
    const maxAttempts = GROQ_MODELS.length;

    while (attempts < maxAttempts) {
        const modelId = GROQ_MODELS[currentModelIndex];
        try {
            // Check if modelId already has the 'groq/' prefix to avoid 'groq/groq/...'
            const fullModelPath = modelId.startsWith('groq/') ? modelId : `groq/${modelId}`;
            
            console.log(`[AI Utils] Executing with model: ${fullModelPath}`);
            const result = await promptFn(input, { model: fullModelPath });

            currentModelIndex = (currentModelIndex + 1) % GROQ_MODELS.length;
            return { text: result.text };
        } catch (error: any) {
            console.warn(`[AI Utils] Model ${GROQ_MODELS[currentModelIndex]} failed: ${error.message}.`);
            currentModelIndex = (currentModelIndex + 1) % GROQ_MODELS.length;
            attempts++;
        }
    }

    throw new Error('All available AI models failed to execute. Please try again later.');
}

export const GEMINI_MODELS = [
    'googleai/gemini-3.1-flash-lite-preview',
    'googleai/gemini-3-flash-preview',
    'googleai/gemini-2.5-flash',
    'googleai/gemini-1.5-flash'
];

let currentGeminiModelIndex = 0;

export async function executeGeminiWithFallback<TOutput>(
    generateFn: (config?: any) => Promise<{ output: TOutput }>
): Promise<{ output: TOutput }> {
    let attempts = 0;
    const maxAttempts = GEMINI_MODELS.length;

    while (attempts < maxAttempts) {
        const model = GEMINI_MODELS[currentGeminiModelIndex];
        try {
            console.log(`[AI Utils] Executing with model: ${model}`);
            const result = await generateFn({ model });

            // Rotate model on success for load balancing
            currentGeminiModelIndex = (currentGeminiModelIndex + 1) % GEMINI_MODELS.length;
            return result as { output: TOutput };
        } catch (error: any) {
            console.warn(`[AI Utils] Model ${model} failed: ${error.message}. Attempting fallback...`);
            // Shift to the next model
            currentGeminiModelIndex = (currentGeminiModelIndex + 1) % GEMINI_MODELS.length;
            attempts++;
        }
    }

    throw new Error('All available Gemini models failed to execute. Please try again later.');
}