
# 🌾 GramSetu (ग्राम सेतु)
### *Digital Partner for Every Indian Farmer (किसानों का डिजिटल साथी)*

GramSetu is a comprehensive digital platform designed to bridge the gap between technology and traditional farming. It empowers farmers with real-time soil analysis, government scheme information, market prices, and IoT-based smart farming tools—all accessible through a voice-first, multi-lingual interface (Hindi & English).

![GramSetu Banner](/frontend/public/kisan-sathi.png)

---

## 🚀 Key Features

*   **🎙️ Voice-First Navigation**: optimized for rural accessibility. Farmers can navigate the entire app and fill forms simply by speaking (supported in Hindi & English).
*   **🧪 AI Soil Analysis**: Upload a photo of farm soil to get instant classification (Black, Red, Sandy, Alluvial) and crop recommendations using a custom-trained ResNet18 Deep Learning model.
*   **🤖 Kisan Sathi (IoT)**: Integrated dashboard for the "Kisan Sathi" hardware node that monitors soil moisture, NPK levels, and weather conditions in real-time.
*   **📜 Government Schemes**: Easy access to latest agricultural schemes (PM-KISAN, Fasal Bima Yojana) with direct application links.
*   **💰 Mandi Prices**: Real-time marketplace data to help farmers get the best price for their yield.
*   **📺 Video Gyan**: A curated hub of educational farming videos.

---

## 🛠️ Tech Stack

### **Frontend (Client)**
*   **Framework**: [React.js](https://react.dev/) + [Vite](https://vitejs.dev/) (Fast & Lightweight)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Glassmorphism & Fluid Design)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Voice**: Native Web Speech API (No heavy external dependencies)

### **Backend (Server)**
*   **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   **API**: RESTful architecture
*   **File Handling**: Multer (for image uploads)
*   **Security**: CORS enabled for cross-origin resource sharing

### **Artificial Intelligence (ML)**
*   **Language**: Python 3.9+
*   **Framework**: [PyTorch](https://pytorch.org/)
*   **Model**: ResNet18 (Transfer Learning)
*   **Tasks**: Image Classification (Soil Types) & Crop Recommendation

---

## ⚙️ Installation & Setup

Follow these steps to run GramSetu locally on your machine.

### **1. Prerequisites**
*   Node.js (v16 or higher)
*   Python (v3.8 or higher)
*   npm or yarn

### **2. Clone the Repository**
```bash
git clone https://github.com/yourusername/GramSetu.git
cd GramSetu
```

### **3. Backend Setup**
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```
*   **Python Dependencies**: Ensure you have the required Python libraries for the ML model.
    ```bash
    pip install torch torchvision pillow
    ```

### **4. Frontend Setup**
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

---

## 🏃‍♂️ Running the Application

 You need to run both the Backend (API) and Frontend (UI) simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```
*Server will start on `http://localhost:5001`*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*App will open at `http://localhost:5173`*

---

## 📂 Project Structure

```
GramSetu/
├── backend/                # Node.js Server & ML Scripts
│   ├── data/               # JSON datasets (Schemes, Videos, Content)
│   ├── ml/                 # Python Machine Learning Models
│   │   ├── train.py        # Model training script
│   │   ├── predict.py      # Inference script
│   │   └── dataset/        # Soil image dataset
│   ├── server.js           # Main Express App entry point
│   └── package.json
│
├── frontend/               # React Client
│   ├── public/             # Static assets (Images, Icons)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages (Home, Analyze, IoT)
│   │   ├── utils/          # Helper functions (Speech Logic)
│   │   └── App.jsx
│   ├── index.css           # Global Styles & Tailwind Directives
│   └── vite.config.js
│
└── README.md
```

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

---

### *Jai Jawan, Jai Kisan! 🇮🇳*
=======
# garmsetu
