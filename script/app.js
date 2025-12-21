const WEATHER_API_KEY = "139b549ff18ca463a81f64adab80664f";

/* ===============================
   GLOBAL FARM DATA MODEL
================================ */
const farmData = {
    crop: null,
    landSize: null,
    landUnit: null,
    location: null,
    season: null,
    irrigation: null,

    weather: {},
    soil: {},
    disease: {},
    water: {},
    market: {},
    policy: {},

    risks: {
        disease: "Not analyzed"
    },
    recommendations: []
};

/* ===============================
   SAFE DOM GETTER
================================ */
function $(id) {
    return document.getElementById(id);
}

/* ===============================
   DOM REFERENCES
================================ */
const analyzeBtn = $("analyzeBtn");
const recommendationList = $("recommendationList");

const inputs = {
    crop: $("crop"),
    landSize: $("landSize"),
    landUnit: $("landUnit"),
    location: $("location"),
    season: $("season"),
    irrigation: $("irrigation")
};

const riskCards = {
    weather: $("weatherRisk"),
    soil: $("soilRisk"),
    disease: $("diseaseRisk"),
    water: $("waterRisk"),
    market: $("marketRisk"),
    policy: $("policyRisk")
};

/* ===============================
   FARM ANALYSIS
================================ */
if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
        collectFarmData();
        await fetchWeatherData();
        calculateRisks();
        generateRecommendations();
        addMarketPolicyRecommendations();
        updateRecommendationUI(true);
    });
}

/* ===============================
   DATA COLLECTION
================================ */
function collectFarmData() {
    farmData.crop = inputs.crop?.value || "";
    farmData.landSize = parseFloat(inputs.landSize?.value) || 0;
    farmData.landUnit = inputs.landUnit?.value || "";
    farmData.location = inputs.location?.value || "";
    farmData.season = inputs.season?.value || "";
    farmData.irrigation = inputs.irrigation?.value || "";
}

/* ===============================
   RISK ENGINE
================================ */
function calculateRisks() {
    farmData.risks.weather = calculateWeatherRisk();
    farmData.risks.soil = calculateSoilRisk();
    farmData.risks.water = calculateWaterRisk();
    farmData.risks.market = calculateMarketRisk();
    farmData.risks.policy = calculatePolicyRisk();

    updateRiskUI();
}

function calculateWeatherRisk() {
    const { temperature, humidity, rainfall } = farmData.weather;
    if (temperature > 38 || rainfall > 20) return "High";
    if (humidity > 80) return "Medium";
    return "Low";
}

function calculateSoilRisk() {
    return farmData.landSize > 5 ? "Medium" : "Low";
}

function calculateWaterRisk() {
    return farmData.irrigation === "rainfed" ? "High" : "Low";
}

function calculateMarketRisk() {
    return farmData.landSize > 4 ? "High" : "Medium";
}

function calculatePolicyRisk() {
    return farmData.season === "kharif" ? "Medium" : "Low";
}

/* ===============================
   UI UPDATE
================================ */
function updateRiskUI() {
    for (let key in riskCards) {
        if (riskCards[key]) {
            riskCards[key].textContent =
                `${key.toUpperCase()}: ${farmData.risks[key] || "Not analyzed"}`;
        }
    }
}

/* ===============================
   RECOMMENDATIONS
================================ */
function generateRecommendations() {
    farmData.recommendations = [];

    if (farmData.risks.weather === "High")
        farmData.recommendations.push("High weather risk. Adjust sowing or irrigation.");

    if (farmData.risks.water === "High")
        farmData.recommendations.push("Water risk high. Consider drip irrigation.");

    if (farmData.risks.disease === "High")
        farmData.recommendations.push("High disease risk. Immediate treatment advised.");

    if (farmData.recommendations.length === 0)
        farmData.recommendations.push("Farm conditions look stable.");
}

function updateRecommendationUI(clear = true) {
    if (!recommendationList) return;

    if (clear) recommendationList.innerHTML = "";

    farmData.recommendations.forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        recommendationList.appendChild(li);
    });
}

function addMarketPolicyRecommendations() {
    if (farmData.risks.market === "High")
        farmData.recommendations.push("Monitor market prices closely.");
}

/* ===============================
   WEATHER API
================================ */
async function fetchWeatherData() {
    if (!farmData.location) return;

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${farmData.location}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await res.json();

        farmData.weather = {
            temperature: data.main?.temp || 0,
            humidity: data.main?.humidity || 0,
            rainfall: data.rain ? data.rain["1h"] || 0 : 0
        };
    } catch {
        farmData.weather = {};
    }
}

/* ===============================
   REAL ML DISEASE DETECTION
================================ */
const analyzeDiseaseBtn = $("analyzeDiseaseBtn");

if (analyzeDiseaseBtn) {
    analyzeDiseaseBtn.addEventListener("click", async () => {
        const fileInput = $("leafImage");
        const resultText = $("diseaseResult");

        if (!fileInput || !fileInput.files.length) {
            resultText.innerText = "❌ Please select an image";
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        resultText.innerText = "⏳ Analyzing...";

        try {
            const res = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            farmData.risks.disease =
                data.confidence > 70 ? "High" :
                data.confidence > 40 ? "Medium" : "Low";

            farmData.recommendations.push(
                `Disease detected: ${data.prediction} (${data.confidence}%)`
            );

            updateRiskUI();
            updateRecommendationUI(false);

            resultText.innerHTML =
                `<b>${data.prediction}</b> (${data.confidence}%)`;

        } catch {
            resultText.innerText = "❌ ML server not reachable";
        }
    });
}
