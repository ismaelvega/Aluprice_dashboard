# API Reference Guide

## Quick Start

### Base URL
```
Development: http://localhost:8000
Production: https://your-app.onrender.com
```

### Authentication
Currently no authentication required (stateless API)

---

## 🚀 **Latest Model Information (Updated)**

### **Model Architecture:** Bidirectional LSTM + LSTM
- **Look-back Window:** 120 days
- **Prediction Horizon:** 30 days  
- **Performance:** MAPE 2.35%
- **Last Trained:** Latest session with no data leakage approach

---

## API Endpoints Reference

### 🏥 Health & Status

#### GET `/health`
**Description:** Check API health and service status  
**Response Time:** < 0.02s  

**Response:**
```json
{
    "status": "healthy",
    "model_type": "LSTM",
    "model_loaded": true,
    "data_loaded": true,
    "timestamp": "2025-06-15T12:26:41.123456"
}
```

**Status Codes:**
- `200` - Service healthy
- `500` - Service unhealthy

---

#### GET `/model/info`
**Description:** Get comprehensive model information, architecture, and performance metrics  
**Response Time:** < 0.01s  

**Response:**
```json
{
    "model_type": "LSTM",
    "model_loaded": true,
    "model_architecture": {
        "type": "Bidirectional LSTM + LSTM",
        "layers": [
            "Bidirectional LSTM (64 units, return_sequences=True)",
            "Dropout (0.5)",
            "LSTM (32 units)",
            "Dropout (0.5)",
            "Dense (1 unit, output layer)"
        ],
        "regularization": "L2 regularization (1e-5)",
        "optimizer": "Adam",
        "loss_function": "Mean Squared Error (MSE)"
    },
    "training_configuration": {
        "look_back_window": 120,
        "prediction_horizon": 30,
        "training_cutoff_date": "2024-01-01",
        "epochs": 200,
        "batch_size": 32,
        "early_stopping": true,
        "early_stopping_patience": 10,
        "validation_strategy": "Dynamic validation with forecasted regressors"
    },
    "performance_metrics": {
        "status": "Available",
        "metrics": {
            "RMSE": "67.70",
            "MAPE": "2.35%",
            "MAE": "60.01",
            "APE": "2.35%"
        },
        "performance_status": "Excellent",
        "interpretation": {
            "RMSE": "Root Mean Square Error - Lower is better",
            "MAPE": "Mean Absolute Percentage Error - Lower is better (Current: Excellent < 2.5%)",
            "MAE": "Mean Absolute Error - Lower is better",
            "APE": "Average Percentage Error - Lower is better"
        },
        "last_updated": "Latest training session"
    },
    "data_information": {
        "total_regressors": 7,
        "regressors": [
            "precio_alum_global", "inflacion", "USD", "petroleo",
            "stock_alum", "us_electricity_price", "fed_funds_rate"
        ],
        "last_data_date": "2025-01-31",
        "first_data_date": "2018-02-02",
        "data_range_days": 2555
    },
    "regressor_descriptions": {
        "precio_alum_global": "Global aluminium price (USD/metric ton)",
        "inflacion": "Mexico inflation rate (%)",
        "USD": "USD/MXN exchange rate",
        "petroleo": "Crude oil price (USD/barrel)",
        "stock_alum": "LME aluminium stock levels (metric tons)",
        "us_electricity_price": "US electricity price (cents/kWh)",
        "fed_funds_rate": "Federal funds rate (%)"
    },
    "prediction_capabilities": {
        "max_horizon_days": 30,
        "min_horizon_days": 1,
        "confidence_intervals": "±2% of predicted value",
        "currency": "USD",
        "prediction_frequency": "Daily"
    }
```

**Status Codes:**
- `200` - Success
- `500` - Model not loaded

---

### 💰 Price Data

#### GET `/price/latest`
**Description:** Get the most recent aluminium price from historical data  
**Response Time:** < 0.01s  

**Response:**
```json
{
    "date": "2025-01-31",
    "price": 2617.0,
    "currency": "USD",
    "data_source": "Historical data"
}
```

---

#### GET `/data/historical?days={number}`
**Description:** Retrieve recent historical price data  
**Response Time:** < 0.01s  

**Parameters:**
- `days` (optional): Number of recent days to return (1-365, default: 30)

**Example Request:**
```bash
curl "http://localhost:8000/data/historical?days=7"
```

**Response:**
```json
{
    "status": "success",
    "period_days": 7,
    "currency": "USD",
    "historical_data": [
        {
            "date": "2025-01-24",
            "price": 2572.0,
            "usd_exchange_rate": 20.1234,
            "global_price": 2840.5
        },
        {
            "date": "2025-01-25",
            "price": 2580.5,
            "usd_exchange_rate": 20.1456,
            "global_price": 2845.2
        }
    ],
    "summary": {
        "avg_price": 2607.5,
        "min_price": 2572.0,
        "max_price": 2640.0,
        "price_volatility": 21.58
    }
}
```

---

### 🔮 Price Predictions

#### GET `/predict?horizon={days}` or POST `/predict`
**Description:** Generate future aluminium price predictions using LSTM model  
**Response Time:** 0.1s - 2s (depends on horizon)  

**Parameters:**
- `horizon` (1-30): Number of days to predict (default: 30)

**Example Request:**
```bash
curl "http://localhost:8000/predict?horizon=5"
```

**POST Request:**
```json
{
    "horizon": 15
}
```

**Response:**
```json
{
    "status": "success",
    "model_type": "LSTM",
    "horizon_days": 15,
    "prediction_start_date": "2025-02-01",
    "prediction_end_date": "2025-02-15",
    "currency": "USD",
    "predictions": [
        {
            "date": "2025-02-01",
            "predicted_price": 2630.09,
            "lower_bound": 2577.49,
            "upper_bound": 2682.69,
            "confidence_interval": "2577.49 - 2682.69"
        }
    ],
    "summary": {
        "avg_predicted_price": 2625.45,
        "min_predicted_price": 2620.12,
        "max_predicted_price": 2630.09,
        "total_predictions": 15,
        "model_performance": {
            "status": "Available",
            "metrics": {
                "RMSE": "67.70",
                "MAPE": "2.35%",
                "MAE": "60.01",
                "APE": "2.35%"
            },
            "performance_status": "Excellent"
        }
    }
}
```

---

### 📊 Data Endpoints

#### GET `/data/historical?days={number}`
**Description:** Retrieve recent historical aluminium price data  
**Response Time:** < 0.01s  

**Parameters:**
- `days` (optional): Number of recent days to return (1-365, default: 30)

---

#### GET `/data/regressors?days={number}`
**Description:** Get historical data for all regressors used in the LSTM model  
**Response Time:** < 0.02s  

**Parameters:**
- `days` (optional): Number of recent days to return (1-365, default: 30)

**Response includes data for all 7 regressors:**
- precio_alum_global, inflacion, USD, petroleo, stock_alum, us_electricity_price, fed_funds_rate

---

#### GET `/data/regressor-predictions`
**Description:** Get 30-day forecasts for all regressors from saved model predictions  
**Response Time:** < 0.01s  

**Response:**
```json
{
    "status": "success",
    "prediction_start_date": "2025-02-01",
    "prediction_end_date": "2025-03-02",
    "total_prediction_days": 30,
    "regressors": ["precio_alum_global", "inflacion", "USD", "petroleo", "stock_alum", "us_electricity_price", "fed_funds_rate"],
    "regressor_predictions": {
        "precio_alum_global": [
            {
                "date": "2025-02-01",
                "predicted_value": 2183.9915
            }
        ]
    }
}
```

---

#### GET `/data/aluminum-price-predictions`
**Description:** Get 30-day aluminum price forecasts from saved model predictions  
**Response Time:** < 0.01s  

**Response:**
```json
{
    "status": "success",
    "model_type": "LSTM",
    "prediction_start_date": "2025-02-01",
    "prediction_end_date": "2025-03-02",
    "horizon_days": 30,
    "currency": "USD",
    "predictions": [
        {
            "date": "2025-02-01",
            "predicted_price": 2630.09,
            "lower_bound": 2577.49,
            "upper_bound": 2682.69,
            "confidence_interval": "2577.49 - 2682.69"
        }
    ],
    "summary": {
        "avg_predicted_price": 2625.45,
        "min_predicted_price": 2620.12,
        "max_predicted_price": 2630.09,
        "total_predictions": 30
    }
}
```

---
- `horizon` (required): Number of business days to predict (1-90)

**Example Requests:**
```bash
# Tomorrow's price
curl "http://localhost:8000/predict?horizon=1"

# Next week
curl "http://localhost:8000/predict?horizon=5"

# Bi-weekly forecast
curl "http://localhost:8000/predict?horizon=15"
```

**Response:**
```json
{
    "status": "success",
    "horizon_days": 5,
    "prediction_start_date": "2025-01-31",
    "prediction_end_date": "2025-02-06",
    "currency": "USD",
    "predictions": [
        {
            "date": "2025-01-31",
            "predicted_price": 2608.36,
            "lower_bound": 2607.46,
            "upper_bound": 2609.17,
            "confidence_interval": "2607.46 - 2609.17"
        },
        {
            "date": "2025-02-03",
            "predicted_price": 2613.26,
            "lower_bound": 2612.47,
            "upper_bound": 2614.09,
            "confidence_interval": "2612.47 - 2614.09"
        }
    ],
    "summary": {
        "avg_predicted_price": 2624.06,
        "min_predicted_price": 2608.36,
        "max_predicted_price": 2637.04,
        "total_predictions": 5
    }
}
```

---

#### POST `/predict`
**Description:** Generate predictions using JSON payload  
**Response Time:** 0.3s - 23s (depends on horizon)  

**Request Body:**
```json
{
    "horizon": 10
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"horizon": 10}'
```

**Response:** Same format as GET method

---

### 📚 Documentation

#### GET `/docs` (in development)
**Description:** Interactive API documentation (Swagger UI)  
**Access:** Open in browser for interactive testing  

---

## Response Format Standards

### Success Response Structure
```json
{
    "status": "success",
    "data": { ... },
    "metadata": { ... }
}
```

### Error Response Structure
```json
{
    "error": "Error description",
    "message": "Detailed error message",
    "timestamp": "2025-06-14T12:26:41.123456"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `422` - Validation Error (Pydantic validation failed)
- `500` - Internal Server Error
- `404` - Endpoint not found

---

## Usage Examples

### Python Client Examples

#### Get Model Information & Performance
```python
import requests

# Get comprehensive model info
response = requests.get("http://localhost:8000/model/info")
model_info = response.json()

print(f"Model Type: {model_info['model_type']}")
print(f"Look-back Window: {model_info['training_configuration']['look_back_window']} days")
print(f"Prediction Horizon: {model_info['training_configuration']['prediction_horizon']} days")
print(f"MAPE: {model_info['performance_metrics']['metrics']['MAPE']}")
print(f"Performance Status: {model_info['performance_metrics']['performance_status']}")
```

#### Get Latest Price
```python
# Get latest price
response = requests.get("http://localhost:8000/price/latest")
latest = response.json()
print(f"Latest price ({latest['date']}): ${latest['price']:,.2f}")
```

#### Generate 30-Day Predictions
```python
# Get 30-day forecast
response = requests.post("http://localhost:8000/predict", 
                        json={"horizon": 30})
forecast = response.json()

print(f"30-day forecast from {forecast['prediction_start_date']} to {forecast['prediction_end_date']}")
print(f"Average predicted price: ${forecast['summary']['avg_predicted_price']:,.2f}")
print(f"Model MAPE: {forecast['summary']['model_performance']['metrics']['MAPE']}")

# Print first 5 predictions
for pred in forecast['predictions'][:5]:
    print(f"{pred['date']}: ${pred['predicted_price']:,.2f} (±{pred['confidence_interval']})")
```

#### Get Regressor Predictions
```python
# Get all regressor forecasts
response = requests.get("http://localhost:8000/data/regressor-predictions")
regressors = response.json()

print(f"Regressor forecasts: {regressors['prediction_start_date']} to {regressors['prediction_end_date']}")
for regressor in regressors['regressors']:
    latest_pred = regressors['regressor_predictions'][regressor][0]
    print(f"{regressor}: {latest_pred['predicted_value']}")
```

#### Get Historical Data
```python
# Get 7 days of historical data
response = requests.get("http://localhost:8000/data/historical?days=7")
data = response.json()

print(f"Historical data: {len(data['historical_data'])} days")
print(f"Average price: ${data['summary']['avg_price']:,.2f}")
print(f"Price volatility: ${data['summary']['price_volatility']:,.2f}")
```

### JavaScript/Node.js Examples

#### Fetch Model Performance
```javascript
async function getModelInfo() {
    const response = await fetch('http://localhost:8000/model/info');
    const modelInfo = await response.json();
    
    console.log(`Model Architecture: ${modelInfo.model_architecture.type}`);
    console.log(`MAPE: ${modelInfo.performance_metrics.metrics.MAPE}`);
    console.log(`Performance: ${modelInfo.performance_metrics.performance_status}`);
    
    return modelInfo;
}
```

#### Generate Predictions
```javascript
async function getPredictions(days = 15) {
    const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horizon: days })
    });
    
    const forecast = await response.json();
    console.log(`${days}-day forecast generated`);
    console.log(`Average price: $${forecast.summary.avg_predicted_price}`);
    
    return forecast;
}
```
```python
import requests

# Get latest price
response = requests.get("http://localhost:8000/price/latest")
latest_price = response.json()
print(f"Current price: ${latest_price['price']:,.2f} {latest_price['currency']}")
```

#### Weekly Forecast
```python
import requests

# Get 7-day forecast
response = requests.get("http://localhost:8000/predict?horizon=7")
forecast = response.json()

print(f"7-day forecast ({forecast['prediction_start_date']} to {forecast['prediction_end_date']}):")
for pred in forecast['predictions']:
    print(f"  {pred['date']}: ${pred['predicted_price']:,.2f}")
```

#### Historical Analysis
```python
import requests
import pandas as pd

# Get 15 days of historical data
response = requests.get("http://localhost:8000/data/historical?days=15")
data = response.json()

# Convert to DataFrame
df = pd.DataFrame(data['historical_data'])
df['date'] = pd.to_datetime(df['date'])

print(f"Price volatility: ${data['summary']['price_volatility']:,.2f}")
print(f"Average price: ${data['summary']['avg_price']:,.2f}")
```

### JavaScript/Node.js Examples

#### Fetch Latest Price
```javascript
async function getLatestPrice() {
    const response = await fetch('http://localhost:8000/price/latest');
    const data = await response.json();
    
    console.log(`Latest price: $${data.price.toLocaleString()} ${data.currency}`);
    return data;
}
```

#### Generate Bi-Weekly Forecast
```javascript
async function getBiWeeklyForecast() {
    const response = await fetch('http://localhost:8000/predict?horizon=15');
    const forecast = await response.json();

    console.log(`Bi-weekly forecast (${forecast.prediction_start_date} to ${forecast.prediction_end_date}):`);
    console.log(`Average predicted price: $${forecast.summary.avg_predicted_price.toLocaleString()}`);
    
    return forecast;
}
```

### cURL Examples

#### Health Check
```bash
curl -X GET "http://localhost:8000/health" | jq '.'
```

#### Quick Prediction
```bash
curl -X GET "http://localhost:8000/predict?horizon=5" | jq '.summary'
```

#### Historical Data with Processing
```bash
curl -X GET "http://localhost:8000/data/historical?days=7" | jq '.summary'
```

---

## Performance Guidelines

### Response Time Expectations

| Horizon | Expected Time | Use Case |
|---------|---------------|----------|
| 1 day | 0.3s | Real-time trading |
| 5 days | 1.6s | Weekly planning |
| 15 days | 5.4s | Bi-weekly analysis |

### Rate Limiting Recommendations
- **Development:** No limits
- **Production:** 60 requests/minute per IP
- **Long forecasts (>15 days):** Not allowed
- **Short forecasts (1-15 days):** Allowed

### Timeout Recommendations
- **Short forecasts (1-3 days):** 10 seconds
- **Medium forecasts (4-15 days):** 30 seconds

---

## Error Handling Guide

### Common Errors and Solutions

#### Validation Errors (422)
```json
{
    "detail": [
        {
            "type": "greater_than_equal",
            "loc": ["query", "horizon"],
            "msg": "Input should be greater than or equal to 1",
            "input": "0"
        }
    ]
}
```
**Solution:** Ensure horizon is between 1 and 90

#### Service Unavailable (500)
```json
{
    "error": "Model or features not loaded",
    "message": "The prediction service is not ready"
}
```
**Solution:** Wait for service initialization or check health endpoint

#### Timeout Errors
```json
{
    "error": "Request timeout",
    "message": "Prediction took too long to compute"
}
```
**Solution:** Reduce horizon or increase timeout setting

### Error Handling Best Practices

#### Python Example
```python
import requests
from requests.exceptions import Timeout, RequestException

def get_prediction(horizon, timeout=30):
    try:
        response = requests.get(
            f"http://localhost:8000/predict?horizon={horizon}",
            timeout=timeout
        )
        response.raise_for_status()
        return response.json()
        
    except Timeout:
        print(f"Prediction timeout for {horizon} days")
        return None
    except RequestException as e:
        print(f"Request failed: {e}")
        return None
    except ValueError as e:
        print(f"JSON decode error: {e}")
        return None
```

#### JavaScript Example
```javascript
async function safePrediction(horizon, timeout = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(
            `http://localhost:8000/predict?horizon=${horizon}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request timed out');
        } else {
            console.log('Request failed:', error.message);
        }
        return null;
    }
}
```

---

## Data Formats and Types

### Date Formats
- **Input:** ISO 8601 format (`YYYY-MM-DD`)
- **Output:** ISO 8601 format (`YYYY-MM-DD`)
- **Time Zone:** UTC (no timezone component)

### Price Formats
- **Currency:** USD
- **Precision:** 2 decimal places
- **Range:** 1,000 - 10,000 USD (typical)

---

### Cache-Friendly Pattern
```python
import requests
from datetime import datetime, timedelta
import json
import os

class PriceCache:
    def __init__(self, cache_dir="price_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def get_prediction(self, horizon, max_age_hours=1):
        cache_file = f"{self.cache_dir}/forecast_{horizon}d.json"
        
        # Check cache
        if os.path.exists(cache_file):
            with open(cache_file, 'r') as f:
                cached = json.load(f)
            
            cache_time = datetime.fromisoformat(cached['timestamp'])
            if datetime.now() - cache_time < timedelta(hours=max_age_hours):
                return cached['data']
        
        # Fetch fresh data
        response = requests.get(f"http://localhost:8000/predict?horizon={horizon}")
        data = response.json()
        
        # Cache result
        cached = {
            'timestamp': datetime.now().isoformat(),
            'data': data
        }
        with open(cache_file, 'w') as f:
            json.dump(cached, f)
        
        return data
```

---

## Testing and Validation

### Health Check Script
```bash
#!/bin/bash
# health_check.sh

API_URL="http://localhost:8000"

echo "🏥 Checking API health..."
curl -s "$API_URL/health" | jq '.status'

echo "🧠 Checking model status..."
curl -s "$API_URL/model/info" | jq '.model_loaded'

echo "⚡ Testing quick prediction..."
curl -s "$API_URL/predict?horizon=1" | jq '.status'

echo "✅ Health check complete"
```


---

## Troubleshooting Checklist

### API Not Responding
1. ✅ Check if service is running: `curl http://localhost:8000/health`
2. ✅ Verify port availability: `netstat -tulpn | grep :8000`
3. ✅ Check application logs
4. ✅ Restart service if needed

### Slow Predictions
1. ✅ Check horizon value
2. ✅ Monitor system resources
3. ✅ Consider using smaller horizons
4. ✅ Implement caching for repeated requests

### Model Errors
1. ✅ Verify model file exists: `ls -la src/models/serialized/`
2. ✅ Check feature file: `ls -la data/features/`
3. ✅ Regenerate if missing: `python main.py`
4. ✅ Check data quality in features

### Deployment Issues
1. ✅ Verify all dependencies installed
2. ✅ Check Python version (3.12+)
3. ✅ Ensure data files are available
4. ✅ Review startup script permissions

---

*API Reference Version 1.0.0 - Last Updated: June 14, 2025*

---

## 🎯 Model Performance & Capabilities (Latest Update)

### LSTM Model Specifications
- **Architecture:** Bidirectional LSTM + LSTM with L2 regularization
- **Training Data:** 2,273 observations spanning 7+ years
- **Look-back Window:** 120 days (4 months historical context)
- **Prediction Horizon:** 30 days maximum
- **No Data Leakage:** Strict temporal validation with forecasted regressors

### Performance Metrics (Latest Training)
- **RMSE:** 67.70 (Root Mean Square Error)
- **MAPE:** 2.35%
- **MAE:** 60.01 (Mean Absolute Error)
- **APE:** 2.35% (Average Percentage Error)

### Key Features
✅ **Real-time Predictions:** Dynamic 1-30 day forecasts  
✅ **Saved Predictions:** Pre-computed 30-day forecasts updated with each training  
✅ **Regressor Forecasts:** Individual predictions for all 7 economic indicators  
✅ **Performance Monitoring:** Live model metrics and validation scores  
✅ **Confidence Intervals:** ±2% prediction bands  
✅ **Intelligent Caching:** 5-minute TTL for optimal performance  
✅ **Rate Limiting:** 100 requests/minute protection  

### Economic Indicators (Regressors)
1. **precio_alum_global** - Global aluminium prices (USD/metric ton)
2. **inflacion** - Mexico inflation rate (%)
3. **USD** - USD/MXN exchange rate
4. **petroleo** - Crude oil prices (USD/barrel)
5. **stock_alum** - LME aluminium stock levels (metric tons)
6. **us_electricity_price** - US electricity costs (cents/kWh)
7. **fed_funds_rate** - Federal funds rate (%)

### Data Pipeline
- **Training Cutoff:** 2024-01-01 (prevents data leakage)
- **Validation Strategy:** Dynamic validation with forecasted regressors
- **Update Frequency:** Manual retraining with new data
- **Data Quality:** Comprehensive preprocessing and feature engineering

---

## 📈 Migration from Previous Versions

### What's New in Latest Version
- ⬆️ **Increased Horizon:** 15 → 30 days prediction capability
- ⬆️ **Enhanced Look-back:** 60 → 120 days for better pattern recognition
- 🆕 **Saved Predictions:** Pre-computed forecasts via CSV endpoints
- 🆕 **Regressor Predictions:** Individual forecasts for all economic indicators
- 🆕 **Performance Metrics:** Live MAPE, RMSE, MAE tracking
- 🆕 **Model Architecture Details:** Complete training configuration exposure
- 🚀 **Improved Performance:** 2.35% MAPE (excellent accuracy)

### Backward Compatibility
- ✅ All existing endpoints remain functional
- ✅ Same response formats maintained
- ✅ Previous horizon limits (1-15 days) still supported
- ✅ Existing client code works without changes

---

*Last Updated: June 2025 | API Version: 1.0.0 | Model Version: LSTM-120-30 (120 days look-back, 30 days forecast)*
