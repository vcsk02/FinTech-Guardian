FinTech Guardian 🛡️

A Cloud-Native Real-Time Fraud Detection Platform.

FinTech Guardian is an enterprise-grade analytics dashboard designed to detect, analyze, and visualize financial fraud in real-time. It utilizes a Hybrid AI Architecture, combining low-latency edge heuristics with the cognitive reasoning of Google Gemini 2.5 to identify anomalies in high-velocity transaction streams.

Doumentation Link: https://docs.google.com/document/d/1PJdG-y0tElwgPi_fXf0FHeIw3Xh580kQoXkyE9Iihl8/edit?usp=sharing

Presentation Slides: https://docs.google.com/presentation/d/12jUiSoGnesO-Bcf77u1AH5IH7CwB5_yDAYqUohVkGnU/edit?usp=sharing

Project Demo: https://drive.google.com/file/d/1PPM5w14KOgV7rFJJTx2ipAwOetnc0-wx/view?usp=sharing

🚀 Features

⚡ Real-Time Ingestion: Simulates a high-frequency transaction stream (Kafka/Event-driven simulation) directly in the browser.

🧠 Hybrid AI Engine:

Edge Layer: Instant Z-Score and Velocity checks for sub-millisecond filtering.

Cloud Layer: Google Gemini 2.5 integration for deep-dive cognitive analysis and reasoning.

📊 Live Visualization: Dynamic charts (Area, Pie) that update instantly via Firestore real-time listeners.

🧪 Transaction Simulator: Manual injection tool to test specific fraud scenarios (e.g., "Foreign IP" or "High Value").

☁️ Cloud-Native: Fully serverless architecture built on Google Firebase (Auth & Firestore).

🛠️ Tech Stack

Frontend: React.js, Vite

Styling: Tailwind CSS, Lucide Icons

Visualization: Recharts

Backend / DB: Google Firebase (Firestore)

Authentication: Firebase Auth (Anonymous)

AI Model: Google Gemini 2.5 Flash API

📂 Project Structure

fintech-guardian/
├── src/
│   ├── components/         # UI Elements (Navbar, StatCards, Rows)
│   ├── lib/                # Firebase Configuration
│   ├── services/           # Logic Engine (Heuristics + Gemini API)
│   ├── App.jsx             # Main Layout & State Management
│   └── main.jsx            # Entry Point
├── .env                    # API Keys (Git Ignored)
└── package.json            # Dependencies


⚡ Getting Started

Prerequisites

Node.js (v16+)

A Google Firebase Project

A Google Gemini API Key

Installation

Clone the repository

git clone [https://github.com/vcsk02/FinTech-Guardian.git](https://github.com/vcsk02/FinTech-Guardian.git)
cd FinTech-Guardian


Install dependencies

npm install


Configure Environment Variables
Create a .env file in the root directory and add your keys:

VITE_GEMINI_API_KEY=your_google_gemini_key_here
# (Optional) If you externalize firebase config
# VITE_FIREBASE_API_KEY=...


Run the application

npm run dev


Open http://localhost:5173 in your browser.

📖 How to Use

Start the Stream:
Click the "Start Stream" button in the navbar. You will see transactions flowing in automatically. 90% are normal, 10% are simulated anomalies.

Configure AI (Optional):
Click "Configure AI Model" in the top right. Paste your Gemini API key if you haven't added it to .env.

Simulate Fraud:
Use the Transaction Simulator panel to test the system:

Scenario: Enter $5000, select Unknown Vendor, and toggle Foreign IP.

Result: The system will flag this as High Risk, and Gemini will provide a text explanation (e.g., "High amount for unknown vendor outside typical geo-location").

🛡️ Security Note

This project is for educational and demonstration purposes. In a production environment, API keys should be handled via
