const axios = require('axios');

// OpenRouter Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Helper function to call OpenRouter
async function callAI(prompt) {
    try {
        const response = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, {
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:4000',
                'X-Title': 'Swasthya Sarthi'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        throw new Error("AI service unavailable");
    }
}

// Feature 1: Get Medicine Information
const getMedicineInfo = async (req, res) => {
    try {
        const { medicineName } = req.body;

        if (!medicineName) {
            return res.status(400).json({
                success: false,
                message: "Medicine name required"
            });
        }

        const prompt = `
        Medicine: ${medicineName}
        
        Tell me about this medicine:
        - What it's used for
        - Common dosage
        - Side effects
        - Precautions
        
        Keep it simple and under 100 words.
        `;

        const aiInfo = await callAI(prompt);

        res.status(200).json({
            success: true,
            data: {
                medicineName,
                information: aiInfo,
                disclaimer: "⚠️ Always consult a doctor before use"
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get medicine information"
        });
    }
};

// Feature 2: Symptom-based Medicine Suggestion
const getSymptomSuggestion = async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms) {
            return res.status(400).json({
                success: false,
                message: "Symptoms required"
            });
        }

        // Pre-check for serious symptoms (before AI call)
        const seriousKeywords = [
            'chest pain', 'difficulty breathing', 'shortness of breath',
            'severe headache', 'severe pain', 'unconscious', 'fainting',
            'high fever 102', 'fever 103', 'blood vomit', 'blood cough',
            'heart attack', 'stroke', 'paralysis', 'seizure'
        ];

        const isEmergency = seriousKeywords.some(keyword => 
            symptoms.toLowerCase().includes(keyword)
        );

        if (isEmergency) {
            return res.status(200).json({
                success: true,
                data: {
                    symptoms,
                    suggestion: "🚨 EMERGENCY: Go to hospital immediately. These symptoms need urgent medical attention.",
                    severity: "Emergency",
                    requiresDoctor: true,
                    canSuggestMedicine: false
                }
            });
        }

        // For non-emergency symptoms, get AI suggestion
        const prompt = `
        Patient symptoms: ${symptoms}
        
        Instructions:
        1. If symptoms are MINOR (common cold, mild headache, minor cough, mild fever below 101):
           - Suggest 1-2 over-the-counter medicines
           - Give simple dosage
           - Start response with "MINOR:"
        
        2. If symptoms seem SERIOUS but not emergency:
           - Don't suggest medicine
           - Recommend doctor visit
           - Start response with "SERIOUS:"
        
        Examples:
        - "mild headache" → "MINOR: Take Paracetamol 500mg, 1 tablet twice daily"
        - "severe stomach pain" → "SERIOUS: See a doctor for proper diagnosis"
        
        Keep under 60 words.
        `;

        const aiResponse = await callAI(prompt);
        
         // Better severity detection based on AI response structure
        let severity, requiresDoctor, canSuggestMedicine;
        

        if (aiResponse.toLowerCase().includes('minor:')) {
            severity = "Minor";
            requiresDoctor = false;
            canSuggestMedicine = true;
        } else if (aiResponse.toLowerCase().includes('serious:')) {
            severity = "Serious";
            requiresDoctor = true;
            canSuggestMedicine = false;
        } else {
            // Fallback: analyze response content
            const hasDiscouragement = aiResponse.toLowerCase().includes('see') ||
                                     aiResponse.toLowerCase().includes('visit') ||
                                     aiResponse.toLowerCase().includes('consult');
            
            if (hasDiscouragement) {
                severity = "Serious";
                requiresDoctor = true;
                canSuggestMedicine = false;
            } else {
                severity = "Minor";
                requiresDoctor = false;
                canSuggestMedicine = true;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                symptoms,
                suggestion: aiResponse.replace('MINOR:', '').replace('SERIOUS:', '').trim(),
                severity,
                requiresDoctor,
                canSuggestMedicine,
                aiCategory: aiResponse.includes('MINOR:') ? 'Minor' : 
                           aiResponse.includes('SERIOUS:') ? 'Serious' : 'Auto-detected'
            }
        });

    } catch (error) {
        console.error("Symptom suggestion error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to analyze symptoms"
        });
    }
};

module.exports = {
    getMedicineInfo,
    getSymptomSuggestion
};