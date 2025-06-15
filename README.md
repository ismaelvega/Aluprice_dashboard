# ALUPRICE - Professional Aluminium Price Forecasting Dashboard

<div align="center">

![ALUPRICE Banner](https://img.shields.io/badge/ALUPRICE-Professional%20Dashboard-2563eb?style=for-the-badge&logo=chart-line)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Model Accuracy](https://img.shields.io/badge/LSTM%20Model-97.7%25%20Accuracy-green?style=flat-square&logo=brain)](https://github.com)
[![TypeScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=flat-square&logo=javascript)](https://javascript.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**Executive-grade dashboard for aluminium price forecasting with LSTM neural networks**  
*Perfect for board presentations and strategic planning*

[🚀 Quick Start](#-quick-start) • [📊 Features](#-features) • [🏗️ Architecture](#️-architecture) • [📈 API](#-api-integration) • [🛠️ Development](#️-development)

</div>

---

## 🎯 **Overview**

ALUPRICE is a sophisticated, production-ready dashboard designed for C-suite executives and stakeholders to make data-driven decisions about aluminium procurement and pricing strategies. Built with cutting-edge technology and powered by machine learning, it delivers enterprise-grade forecasting capabilities with an intuitive, presentation-ready interface.

### **🎪 Live Demo Mode**
```bash
# Instant demo with realistic mock data - perfect for presentations
npm install && npm run dev
# Open http://localhost:3000
```

### **💼 Key Value Propositions**
- **97.7% Forecast Accuracy** - LSTM model with 2.35% MAPE error rate
- **Real-time Market Intelligence** - Live price tracking and economic indicators
- **Executive-Ready Presentations** - UI optimized for stakeholder meetings
- **Strategic Decision Support** - Data-driven recommendations and market sentiment analysis
- **Zero Setup Demo Mode** - Works immediately with realistic mock data

---

## 🌟 **Key Features**

### 📊 **Executive Dashboard**
- **Real-time Price Monitoring** - Current aluminium price ($2,617/MT)
- **Interactive Forecasting** - 1-30 day predictions with confidence intervals
- **Market Sentiment Analysis** - Bullish, bearish, or stable market conditions
- **Strategic Recommendations** - AI-powered business insights
- **Executive Summary Cards** - Key metrics at a glance

### 🧠 **Advanced Machine Learning**
- **LSTM Neural Network** - Bidirectional LSTM + LSTM architecture
- **Multi-Source Data Integration** - 8 economic indicators and data sources
- **High Accuracy Model** - 97.7% accuracy (2.35% MAPE)
- **Confidence Intervals** - Upper and lower bounds for all predictions
- **Model Performance Metrics** - Real-time accuracy and error tracking

### 📈 **Interactive Forecasting Tools**
- **Quick Forecast Buttons** - 1, 3, 7, 15-day predictions
- **Custom Horizon Selection** - Any timeframe from 1-30 days
- **Historical Context** - Combined historical and forecast visualization
- **Price Range Analysis** - Min/max/average predicted prices
- **Volatility Assessment** - Risk analysis for strategic planning

### 🎨 **UI/UX**
- **Dark/Light Mode** - Professional appearance for any presentation setting
- **Tailwind CSS** - Clean, modern interface using Tailwind CSS
- **Loading States** - Smooth animations and skeleton screens

### 📊 **Economic Intelligence**
- **Market Indicators** - Real-time economic factors affecting aluminium prices
- **Historical Price Charts** - Interactive Recharts visualizations
- **Trend Analysis** - Price movement patterns and predictions
- **Model Information** - Transparent AI model details and performance

---

## 🏗️ **Architecture & Technology Stack**

### **Frontend Stack**
```javascript
// Core Framework
Next.js 15.3.3          // React framework with App Router
React 19.0              // Latest React with concurrent features
Tailwind CSS 3.4        // Utility-first CSS framework

// Data Visualization
Recharts               // Professional charting library
Lucide React           // Beautiful SVG icons

// Utilities
date-fns               // Date manipulation and formatting
Axios                  // HTTP client for API communication
```

### **Project Structure**
```
aluminium-forecasting-dashboard/
├── app/                          # Next.js App Router
│   ├── components/              # React components
│   │   ├── AluminiumDashboard.jsx    # Main dashboard component
│   │   ├── ExecutiveSummary.jsx      # Executive insights
│   │   ├── ForecastChart.jsx         # Interactive charts
│   │   ├── ForecastControls.jsx      # Forecast controls
│   │   ├── MarketIndicators.jsx      # Economic indicators
│   │   ├── ModelMetrics.jsx          # ML model info
│   │   └── PriceChart.jsx           # Historical price charts
│   ├── utils/
│   │   └── api.js               # API integration with mock fallback
│   ├── layout.js                # Root layout and metadata
│   └── page.js                  # Main entry point
├── docs/                        # Comprehensive documentation
│   └── API_REFERENCE.md         # API documentation
└── public/                      # Static assets
```

---

## 🚀 **Quick Start**

### **Option 1: Demo Mode (Recommended for Presentations)**
Perfect for executive presentations, investor meetings, and stakeholder demos:

```bash
# Clone the repository
git clone <repository-url>
cd aluminium-forecasting-dashboard

# Install dependencies
npm install

# Start development server with mock data
npm run dev

# Open in browser
open http://localhost:3000
```

### **Option 2: Production Mode with Live API**
For production deployment with real-time data:

```bash
# Set up environment variables
cp .env.local.example .env.local

# Configure API endpoint
echo "NEXT_PUBLIC_API_URL=https://your-aluprice-api.com" >> .env.local

# Build and start
npm run build
npm start
```

### **Option 3: Docker Deployment**
```bash
# Build Docker image
docker build -t aluprice-dashboard .

# Run container
docker run -p 3000:3000 aluprice-dashboard
```

---

## 📈 **API Integration**

### **Intelligent API Fallback System**
The dashboard features a smart fallback system that automatically switches to realistic mock data when the API is unavailable:

```javascript
// Automatic fallback to mock data for demos
const fetchLatestPrice = async () => {
  try {
    // Try live API first
    const response = await axios.get(`${API_BASE_URL}/latest-price`);
    return response.data;
  } catch (error) {
    // Fallback to realistic mock data
    return {
      price: 2617.45,
      currency: "USD",
      unit: "MT",
      timestamp: new Date().toISOString()
    };
  }
};
```

### **ALUPRICE API Endpoints**
```
GET /health                    # API health check
GET /latest-price             # Current aluminium price
GET /historical-data          # Historical price data
GET /predictions/{horizon}    # Forecast predictions
GET /model/info              # ML model information
```

### **Model Performance**
- **Architecture**: Bidirectional LSTM + LSTM
- **Accuracy**: 97.7% (2.35% MAPE)
- **Training Data**: 8 economic indicators
- **Prediction Horizon**: 1-30 days
- **Confidence Intervals**: Upper/lower bounds included
- **Response Time**: < 8 seconds

---

## 🛠️ **Development**

### **Requirements**
- Node.js 18.0 or higher
- npm 9.0 or higher
- Modern web browser

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run in development mode with hot reload
# Dashboard will be available at http://localhost:3000
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000    # ALUPRICE API URL
NEXT_PUBLIC_ENV=development                  # Environment mode
NEXT_PUBLIC_DEMO_MODE=true                   # Enable demo mode
```

## 🔧 **Configuration**

### **API Configuration**
```javascript
// app/utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
```

### **Dashboard Customization**
```javascript
// Modify dashboard settings
const DASHBOARD_CONFIG = {
  refreshInterval: 30000,        // 30 seconds
  maxHistoricalDays: 30,         // Show last 30 days
  defaultForecastHorizon: 7,     // 7 days default
  enableDarkMode: true,          // Dark mode support
  language: 'es',                // Spanish localization
  currency: 'USD',               // US Dollars
  unit: 'MT'                     // Metric Tons
};
```

---

## 🚀 **Deployment**

### **Vercel Deployment (Recommended)**
```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api.com
```

---

## 📚 **Documentation**

Comprehensive documentation is available in the `/docs` folder:

- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Complete API documentation

---

