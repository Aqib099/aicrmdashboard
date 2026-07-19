import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/apiError.js";
import { config } from "dotenv";

let client = null;

const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if(!apiKey) {
        throw new ApiError(
            503,
            "Gemini API key is not configured. Add GEMINI_API_KEY to backend .env file"
        )
    }
    if(!client) client = new GoogleGenAI({apiKey});
    return client;
}

const MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash"

export const isAiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const generateJSON = async (prompt, schema) => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: MODEL(),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.6
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.log("Gemini Json error: ", error?.message || err)
        throw new ApiError(502, "AI request failed. Please try again in a moment.")
    }
}

const generateText = async (prompt, temperature = 0.7) => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: MODEL(),
            contents: prompt,
            config: { temperature }
        });
        return response.text.trim()
    } catch (error) {
        console.log("Gemini Json error: ", error?.message || err)
        throw new ApiError(502, "AI request failed. Please try again in a moment.")
    }
};

export const generateLeadSummary = async (lead) => {
    const prompt = `You are an expert B2B sales analyst for a CRM called CRM.
    Analyse the  following sales lead and produce a concise assessment.
    
    Lead Details:
    — Name: ${lead.name || "N/A"}
    — Company: ${lead.company || "N/A"}
    — Email: ${lead.name || "N/A"}
    — Current pipeline stage: ${lead.status || "New"}
    — Potential deal value: ${lead.value || 0}
    — Source: ${lead.source || "unknown"}
    — Notes: ${lead.notes || "None"}

    Return JSON only.`;

    const schema = {
        type: "object",
        properties: {
            summary: {
                type: "string",
                description: "2-3 sentences executive summary of the lead."
            },
            riskScore: {
                type: "integer",
                description: "Rist of loosing this deal 0 (safe), 100(High Risk)"
            },
            suggestedPriority: {
                type: "string",
                enum: ["Low", "Medium", "High"]
            },
            nextBestAction: {
                type: "string",
                description: "One concrete recommended in next step"
            }
        },
        required: ["summary", "riskScore", "suggestedPriority", "nextBestAction"]
    };
    return generateJSON(prompt, schema)
};


export const generateEmail = async ({lead, purpose, tone, sender}) => {
    const prompt = `You are a senior sales rep writing on behaf of
    ${sender?.name || "our team"}${sender?.company ? `at ${sender.company}`: ""}.

    Write a professional sales email.
    Purpose${purpose || "follow-up"}
    Desired tone: ${tone || "friendly and professional"}

    Receipt (lead) details:
    — Name: ${lead?.name || "there"}
    — Company: ${lead?.company || "N/A"}
    — Pipeline stage: ${lead?.status || "New"}
    — Context / Notes: ${lead?.notes || "None"}
    
    Return JSON only with a compeling subject line and a complete email body.
    use line breaks (\\n) in the body. keep it under 100 words sign off as ${
        sender?.name || "the CRM team"
    }` ;

    const schema = {
        type: "object",
        properties: {
            subject: {type: "string"},
            body: {type: "string"},
        },
        required: ["subject", "body"]
    };
    return generateJSON(prompt, schema)
};

export const generateSalesInsight = async (pipelineStats) => {
    const prompt = `You are a revenue-operations advisor. Given this snapshot
    of a sales pipeline, identify what is working, what is at risk, and concrete actions
     to improve conversion
     
     Pipeline snapshot (JSON):
     ${JSON.stringify(pipelineStats, null, 2)}

     Return JSON only`

     const schema = {
        type: "object",
        properties: {
            headline: {
                type: "string",
                description: "One-sentence summary of pipeline health",
            },
            insights: {
                type: "array",
                description: "3-5 specific data driven observations",
                items: { type: "string" },
            },
            recommendations: {
                type: "array",
                description: "3-5 prioritized actionable recommendations",
                items: { type: "string" }
            },
            healthScore: {
                type: "integer",
                description: "Overall pipeline health, 0-100"
            },
        },
        required: ["headline", "insights", "recommendations", "healthScore"]
     }

     return generateJSON( prompt, schema)
};

export {generateText}