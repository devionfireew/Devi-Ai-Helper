import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, chatHistory } = req.body;

        const systemPrompt = {
            role: "system",
            content: "You are an expert academic tutor for Pakistani Education Boards (Punjab PTB, Sindh Board, KPK Board, Balochistan, Federal Board). Explain concepts simply, step-by-step, using Urdu/Roman-Urdu and English. Focus on helping students solve textbook questions."
        };

        const response = await groq.chat.completions.create({
            messages: [systemPrompt, ...chatHistory, { role: "user", content: message }],
            model: "llama3-8b-8192",
        });

        return res.status(200).json({ reply: response.choices[0].message.content });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
