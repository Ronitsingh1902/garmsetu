const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');
const multer = require('multer');
const Jimp = require('jimp');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5001;

// Configure Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Load Data
const intents = require('./data/intents.json');
const content = require('./data/content.json');
const knowledgeBase = require('./data/knowledge_base.json'); // Load KB

const findIntent = (text) => {
    const lowerText = text.toLowerCase();

    // 1. Check for Exact/Fuzzy Intent Match
    let bestMatch = { intent: null, rating: 0 };

    for (const [key, intentObj] of Object.entries(intents)) {
        for (const keyword of intentObj.keywords) {
            const rating = stringSimilarity.compareTwoStrings(lowerText, keyword.toLowerCase());
            if (rating > bestMatch.rating) {
                bestMatch = { intent: key, rating: rating };
            }
            if (lowerText.includes(keyword.toLowerCase())) {
                return key; // Direct hit
            }
        }
    }

    if (bestMatch.rating > 0.4) return bestMatch.intent;

    return null;
};

const findGeneralKnowledge = (text) => {
    const lowerText = text.toLowerCase();

    // Simple keyword matching for Knowledge Base
    for (const item of knowledgeBase) {
        if (item.keywords.some(k => lowerText.includes(k))) {
            return item;
        }
    }
    return null;
};

app.post('/api/ask', (req, res) => {
    const { text, language } = req.body;

    // 1. Intent Search
    const intentId = findIntent(text);

    if (intentId) {
        const responseData = content[intentId];
        if (responseData) {
            return res.json({ data: responseData });
        }
    }

    // 2. Knowledge Base Search (AI Fallback)
    const kbItem = findGeneralKnowledge(text);
    if (kbItem) {
        return res.json({
            data: {
                title: language === 'hi-IN' ? kbItem.title_hi : kbItem.title,
                spoken_text: kbItem.detailed_en,
                spoken_text_hi: kbItem.detailed_hi,
                // Map to ResultCard format
                benefits: [language === 'hi-IN' ? "विस्तृत जानकारी" : "Detailed Info"],
                steps: [language === 'hi-IN' ? kbItem.detailed_hi : kbItem.detailed_en],
                documents: []
            }
        });
    }

    // 3. Fallback
    const unknownResponse = content["UNKNOWN"];
    res.json({
        data: {
            title: language === 'hi-IN' ? unknownResponse.title_hi : unknownResponse.title,
            spoken_text: unknownResponse.spoken_text,
            spoken_text_hi: unknownResponse.spoken_text_hi,
            benefits: [],
            steps: [],
            documents: []
        }
    });
});

const SOIL_TYPES = [
    {
        soilType: "Black Cotton Soil (Kali Mitti)",
        soilType_hi: "काली मिट्टी (कपास मृदा)",
        soilHealth: "Good - Rich in Nitrogen",
        soilHealth_hi: "अच्छी - नाइट्रोजन से भरपूर",
        recommendedCrops: [
            { name: "Cotton (Kapas)", yield: "12-15 Quintal/Acre" },
            { name: "Wheat (Gehu)", yield: "18-20 Quintal/Acre" }
        ],
        recommendedCrops_hi: [
            { name: "कपास (Cotton)", yield: "12-15 क्विंटल/एकड़" },
            { name: "गेहूं (Wheat)", yield: "18-20 क्विंटल/एकड़" }
        ],
        steps: ["Deep ploughing required.", "Add organic manure.", "Irrigate heavily."],
        steps_hi: ["गहरी जुताई आवश्यक है।", "जैविक खाद डालें।", "खूब सिंचाई करें।"],
        freeSeeds: "Available at Sector-4 Krishi Bhavan.",
        freeSeeds_hi: "सेक्टर-4 कृषि भवन में उपलब्ध है।"
    },
    {
        soilType: "Alluvial Soil (Jalodh Mitti)",
        soilType_hi: "जलोढ़ मिट्टी (उपजाऊ मृदा)",
        soilHealth: "Excellent - Very Fertile",
        soilHealth_hi: "उत्कृष्ट - बहुत उपजाऊ",
        recommendedCrops: [
            { name: "Rice (Dhaan)", yield: "25-30 Quintal/Acre" },
            { name: "Sugarcane (Ganna)", yield: "400-500 Quintal/Acre" }
        ],
        recommendedCrops_hi: [
            { name: "धान (Rice)", yield: "25-30 क्विंटल/एकड़" },
            { name: "गन्ना (Sugarcane)", yield: "400-500 क्विंटल/एकड़" }
        ],
        steps: ["Maintain water level.", "Use urea in split doses.", "Keep weed free."],
        steps_hi: ["पानी का स्तर बनाए रखें।", "यूरिया का प्रयोग किस्तों में करें।", "खरपतवार मुक्त रखें।"],
        freeSeeds: "Available at Block Office, Patwari Halka.",
        freeSeeds_hi: "ब्लॉक ऑफिस, पटवारी हल्का में उपलब्ध है।"
    },
    {
        soilType: "Red Soil (Laal Mitti)",
        soilType_hi: "लाल मिट्टी",
        soilHealth: "Moderate - Needs Phosphates",
        soilHealth_hi: "मध्यम - फॉस्फेट की आवश्यकता",
        recommendedCrops: [
            { name: "Groundnut (Moongfali)", yield: "8-10 Quintal/Acre" },
            { name: "Pulses (Daal)", yield: "5-6 Quintal/Acre" }
        ],
        recommendedCrops_hi: [
            { name: "मूंगफली", yield: "8-10 क्विंटल/एकड़" },
            { name: "दालें", yield: "5-6 क्विंटल/एकड़" }
        ],
        steps: ["Add lime to soil.", "Use bio-fertilizers.", "Light irrigation needed."],
        steps_hi: ["मिट्टी में चूना डालें।", "जैव उर्वरकों का प्रयोग करें।", "हल्की सिंचाई की आवश्यकता है।"],
        freeSeeds: "Contact Gram Pradhan for subsidy.",
        freeSeeds_hi: "सब्सिडी के लिए ग्राम प्रधान से संपर्क करें।"
    }
];

app.post('/api/analyze', upload.single('image'), async (req, res) => {
    console.log("[Backend] Received analysis request.");

    try {
        if (!req.file) {
            throw new Error("No image uploaded");
        }

        // 1. Save Image gracefully to temp file
        const tempPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
        await fs.promises.writeFile(tempPath, req.file.buffer);

        // 2. Call Python Script
        console.log("[Backend] Calling ML Model...");
        const pythonProcess = spawn('python3', [
            path.join(__dirname, 'ml/predict.py'),
            tempPath
        ]);

        let resultData = "";
        let errorData = "";

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            // Cleanup temp file
            try { await fs.promises.unlink(tempPath); } catch (e) { }

            if (code !== 0) {
                console.error(`[Python API Error]: Exited with code ${code}`, errorData);
                // Fallback to heuristic/mock
                return res.json({ data: fallbackAnalysis() });
            }

            try {
                console.log("[Python API] Output:", resultData);
                // Find start of JSON in case of debug prints
                const jsonStart = resultData.indexOf('{');
                const jsonEnd = resultData.lastIndexOf('}');
                if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");

                const cleanJson = resultData.substring(jsonStart, jsonEnd + 1);
                const mlResult = JSON.parse(cleanJson);

                if (mlResult.error) {
                    console.error("[Python API] Script returned error:", mlResult.error);
                    return res.json({ data: fallbackAnalysis() });
                }

                // Match with DB
                let detectedSoil = SOIL_TYPES.find(s =>
                    s.soilType.toLowerCase().includes(mlResult.soil_type.toLowerCase())
                );

                if (!detectedSoil) {
                    // Default to Alluvial if not found
                    detectedSoil = SOIL_TYPES.find(s => s.soilType.includes("Alluvial"));
                }

                // Attach ML metadata
                detectedSoil = {
                    ...detectedSoil,
                    ml_confidence: mlResult.confidence,
                    ml_type: mlResult.soil_type
                };

                res.json({ data: detectedSoil });

            } catch (e) {
                console.error("Failed to parse Python output:", e);
                res.json({ data: fallbackAnalysis() });
            }
        });

    } catch (error) {
        console.error("Analysis Error:", error);
        res.json({ data: fallbackAnalysis() });
    }
});

// Fallback logic (Mock/Default)
const fallbackAnalysis = () => {
    console.log("[Backend] Using Fallback Logic (Mock)");
    const fallback = { ...SOIL_TYPES[0] }; // Default to Black Soil
    fallback.soilType += " (Simulation Mode)";
    return fallback;
};

app.listen(PORT, () => {
    console.log(`GramSetu Backend running on http://localhost:${PORT}`);
});
