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
                benefits: [language === 'hi-IN' ? "????????????????????? ?????????????????????" : "Detailed Info"],
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
{
  soilType: "Black Cotton Soil (Kali Mitti)",
  soilType_hi: "\u0915\u093e\u0932\u0940 \u092e\u093f\u091f\u094d\u091f\u0940",

  soilHealth: "Good - Rich in Nitrogen",
  soilHealth_hi: "\u0905\u091a\u094d\u091b\u0940 - \u0928\u093e\u0907\u091f\u094d\u0930\u094b\u091c\u0928 \u0938\u0947 \u092d\u0930\u092a\u0942\u0930",

  recommendedCrops: [
    { name: "Cotton (Kapas)", yield: "1215 Quintal/Acre" },
    { name: "Wheat (Gehu)", yield: "1820 Quintal/Acre" }
  ],

  recommendedCrops_hi: [
    { name: "\u0915\u092a\u093e\u0938", yield: "1215 \u0915\u094d\u0935\u093f\u0902\u091f\u0932/\u090f\u0915\u0921\u093c" },
    { name: "\u0917\u0947\u0939\u0942\u0902", yield: "1820 \u0915\u094d\u0935\u093f\u0902\u091f\u0932/\u090f\u0915\u0921\u093c" }
  ],

  steps: [
    "Deep ploughing required",
    "Add organic manure",
    "Irrigate properly"
  ],

  steps_hi: [
    "\u0917\u0939\u0930\u0940 \u091c\u0941\u0924\u093e\u0908 \u0906\u0935\u0936\u094d\u092f\u0915 \u0939\u0948",
    "\u091c\u0948\u0935\u093f\u0915 \u0916\u093e\u0926 \u0921\u093e\u0932\u0947\u0902",
    "\u0916\u0942\u092c \u0938\u093f\u0902\u091a\u093e\u0908 \u0915\u0930\u0947\u0902"
  ]
}

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
