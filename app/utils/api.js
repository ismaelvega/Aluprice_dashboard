// API configuration - Update this URL to point to your ALUPRICE API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Generic API call function with error handling
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    // Return mock data in development/demo mode
    if (process.env.NODE_ENV === 'development') {
      return getMockData(endpoint);
    }
    
    throw error;
  }
}

// Mock data for development/demo purposes
function getMockData(endpoint) {
  const currentDate = new Date();
  
  if (endpoint === '/price/latest') {
    return {
      date: currentDate.toISOString().split('T')[0],
      price: 2617.0,
      currency: "USD",
      data_source: "Datos de demostración"
    };
  }
  
  if (endpoint.includes('/data/historical')) {
    const days = parseInt(endpoint.match(/days=(\d+)/)?.[1] || '30');
    const historical_data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Generate realistic price variations around base price
      const basePrice = 2617;
      const variation = (Math.random() - 0.5) * 100; // ±50 price variation
      const trend = -i * 0.5; // Slight downward trend
      
      historical_data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round((basePrice + variation + trend) * 100) / 100,
        usd_exchange_rate: Math.round((20.2 + (Math.random() - 0.5) * 0.5) * 10000) / 10000,
        global_price: Math.round((2580 + (Math.random() - 0.5) * 50) * 100) / 100,
        oil_price: Math.round((68 + (Math.random() - 0.5) * 5) * 100) / 100,
        fed_funds_rate: Math.round((4.6 + (Math.random() - 0.5) * 0.2) * 100) / 100,
        stock_levels: Math.round((675000 + (Math.random() - 0.5) * 10000) * 100) / 100,
        us_electricity_price: Math.round((7.9 + (Math.random() - 0.5) * 0.3) * 100) / 100,
        inflation_rate: Math.round((0.44 + (Math.random() - 0.5) * 0.1) * 100) / 100
      });
    }
    
    return {
      status: "success",
      period_days: days,
      currency: "USD",
      historical_data,
      summary: {
        avg_price: 2607.50,
        min_price: 2572.00,
        max_price: 2640.00,
        price_volatility: 21.58
      }
    };
  }
  
  if (endpoint === '/model/info') {
    return {
      status: "success",
      model_type: "LSTM",
      model_loaded: true,
      model_architecture: {
        type: "Bidirectional LSTM + LSTM",
        layers: [
          "Bidirectional LSTM (64 units, return_sequences=True)",
          "Dropout (0.5)",
          "LSTM (32 units)",
          "Dropout (0.5)",
          "Dense (1 unit, output layer)"
        ],
        regularization: "L2 regularization (1e-5)",
        optimizer: "Adam",
        loss_function: "Mean Squared Error (MSE)"
      },
      training_configuration: {
        look_back_window: 120,
        prediction_horizon: 30,
        training_cutoff_date: "2024-01-01",
        epochs: 200,
        batch_size: 32,
        early_stopping: true,
        early_stopping_patience: 10,
        validation_strategy: "Dynamic validation with forecasted regressors"
      },
      performance_metrics: {
        status: "Available",
        metrics: {
          RMSE: "67.6978",
          MAPE: "2.3456",
          MAE: "60.0108",
          APE: "2.3456"
        },
        performance_status: "Excellent",
        interpretation: {
          RMSE: "Root Mean Square Error - Lower is better",
          MAPE: "Mean Absolute Percentage Error - Lower is better (Current: Excellent < 2.5%)",
          MAE: "Mean Absolute Error - Lower is better",
          APE: "Average Percentage Error - Lower is better"
        },
        last_updated: "Latest training session"
      },
      data_information: {
        total_regressors: 7,
        regressors: [
          "precio_alum_global",
          "inflacion",
          "USD",
          "petroleo",
          "stock_alum",
          "us_electricity_price",
          "fed_funds_rate"
        ],
        last_data_date: "2025-01-31",
        first_data_date: "2016-02-01",
        data_range_days: 3287
      },
      regressor_descriptions: {
        precio_alum_global: "Global aluminium price (USD/metric ton)",
        inflacion: "Mexico inflation rate (%)",
        USD: "USD/MXN exchange rate",
        petroleo: "Crude oil price (USD/barrel)",
        stock_alum: "LME aluminium stock levels (metric tons)",
        us_electricity_price: "US electricity price (cents/kWh)",
        fed_funds_rate: "Federal funds rate (%)"
      },
      prediction_capabilities: {
        max_horizon_days: 30,
        min_horizon_days: 1,
        confidence_intervals: "±2% of predicted value",
        currency: "USD",
        prediction_frequency: "Daily"
      }
    };
  }

  if (endpoint.includes('/predict')) {
    const horizon = parseInt(endpoint.match(/horizon=(\d+)/)?.[1] || '7');
    const predictions = [];
    
    for (let i = 1; i <= horizon; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic predictions with slight upward trend
      const basePrice = 2617;
      const trend = i * 2; // Upward trend
      const variation = (Math.random() - 0.5) * 20; // Small variation
      const predicted_price = Math.round((basePrice + trend + variation) * 100) / 100;
      
      // Confidence intervals based on new MAPE (2.35%)
      const confidence_range = predicted_price * 0.0235;
      const lower_bound = Math.round((predicted_price - confidence_range) * 100) / 100;
      const upper_bound = Math.round((predicted_price + confidence_range) * 100) / 100;
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted_price,
        lower_bound,
        upper_bound,
        confidence_interval: `${lower_bound} - ${upper_bound}`
      });
    }
    
    return {
      status: "success",
      horizon_days: horizon,
      prediction_start_date: predictions[0]?.date,
      prediction_end_date: predictions[predictions.length - 1]?.date,
      currency: "USD",
      predictions,
      summary: {
        avg_predicted_price: predictions.reduce((sum, p) => sum + p.predicted_price, 0) / predictions.length,
        min_predicted_price: Math.min(...predictions.map(p => p.predicted_price)),
        max_predicted_price: Math.max(...predictions.map(p => p.predicted_price)),
        total_predictions: predictions.length
      }
    };
  }

  if (endpoint === '/data/regressor-predictions') {
    // Mock 30-day regressor predictions
    const predictions = [];
    const regressors = ['precio_alum_global', 'inflacion', 'USD', 'petroleo', 'stock_alum', 'us_electricity_price', 'fed_funds_rate'];
    const regressorPredictions = {};
    
    regressors.forEach(regressor => {
      regressorPredictions[regressor] = [];
      for (let i = 1; i <= 30; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + i);
        
        // Generate realistic values based on regressor type
        let predictedValue;
        switch(regressor) {
          case 'precio_alum_global':
            predictedValue = 2180 + (Math.random() - 0.5) * 100;
            break;
          case 'inflacion':
            predictedValue = 2.5 + (Math.random() - 0.5) * 1;
            break;
          case 'USD':
            predictedValue = 1.08 + (Math.random() - 0.5) * 0.1;
            break;
          case 'petroleo':
            predictedValue = 75 + (Math.random() - 0.5) * 10;
            break;
          case 'stock_alum':
            predictedValue = 1500 + (Math.random() - 0.5) * 200;
            break;
          case 'us_electricity_price':
            predictedValue = 0.12 + (Math.random() - 0.5) * 0.02;
            break;
          case 'fed_funds_rate':
            predictedValue = 5.25 + (Math.random() - 0.5) * 0.5;
            break;
          default:
            predictedValue = Math.random() * 100;
        }
        
        regressorPredictions[regressor].push({
          date: date.toISOString().split('T')[0],
          predicted_value: Math.round(predictedValue * 10000) / 10000
        });
      }
    });
    
    return {
      status: "success",
      prediction_start_date: regressorPredictions[regressors[0]][0].date,
      prediction_end_date: regressorPredictions[regressors[0]][29].date,
      total_prediction_days: 30,
      regressors,
      regressor_predictions: regressorPredictions
    };
  }

  if (endpoint === '/data/aluminum-price-predictions') {
    // Mock saved aluminum price predictions
    const predictions = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      const basePrice = 2617;
      const trend = i * 1.5;
      const variation = (Math.random() - 0.5) * 15;
      const predicted_price = Math.round((basePrice + trend + variation) * 100) / 100;
      
      const confidence_range = predicted_price * 0.0235;
      const lower_bound = Math.round((predicted_price - confidence_range) * 100) / 100;
      const upper_bound = Math.round((predicted_price + confidence_range) * 100) / 100;
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted_price,
        lower_bound,
        upper_bound,
        confidence_interval: `${lower_bound} - ${upper_bound}`
      });
    }
    
    return {
      status: "success",
      model_type: "LSTM",
      prediction_start_date: predictions[0].date,
      prediction_end_date: predictions[29].date,
      horizon_days: 30,
      currency: "USD",
      predictions,
      summary: {
        avg_predicted_price: predictions.reduce((sum, p) => sum + p.predicted_price, 0) / predictions.length,
        min_predicted_price: Math.min(...predictions.map(p => p.predicted_price)),
        max_predicted_price: Math.max(...predictions.map(p => p.predicted_price)),
        total_predictions: predictions.length
      }
    };
  }

  if (endpoint.includes('/data/regressors')) {
    const days = parseInt(endpoint.match(/days=(\d+)/)?.[1] || '120');
    const regressors = ['precio_alum_global', 'inflacion', 'USD', 'petroleo', 'stock_alum', 'us_electricity_price', 'fed_funds_rate'];
    const regressorData = {};
    
    regressors.forEach(regressor => {
      regressorData[regressor] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        
        // Generate historical values
        let value;
        switch(regressor) {
          case 'precio_alum_global':
            value = 2150 + (Math.random() - 0.5) * 100;
            break;
          case 'inflacion':
            value = 2.3 + (Math.random() - 0.5) * 0.8;
            break;
          case 'USD':
            value = 1.09 + (Math.random() - 0.5) * 0.08;
            break;
          case 'petroleo':
            value = 73 + (Math.random() - 0.5) * 8;
            break;
          case 'stock_alum':
            value = 1480 + (Math.random() - 0.5) * 180;
            break;
          case 'us_electricity_price':
            value = 0.11 + (Math.random() - 0.5) * 0.015;
            break;
          case 'fed_funds_rate':
            value = 5.15 + (Math.random() - 0.5) * 0.4;
            break;
          default:
            value = Math.random() * 100;
        }
        
        regressorData[regressor].push({
          date: date.toISOString().split('T')[0],
          value: Math.round(value * 10000) / 10000
        });
      }
    });
    
    return {
      status: "success",
      period_days: days,
      regressors,
      regressor_data: regressorData,
      summary: {
        start_date: regressorData[regressors[0]][0].date,
        end_date: regressorData[regressors[0]][days - 1].date,
        total_records: days
      }
    };
  }

  throw new Error(`No mock data available for ${endpoint}`);
}

// API endpoint functions
export async function fetchLatestPrice() {
  return apiCall('/price/latest');
}

export async function fetchHistoricalData(days = 120) {
  return apiCall(`/data/historical?days=${days}`);
}

export async function fetchPredictions(horizon) {
  return apiCall(`/predict?horizon=${horizon}`);
}

export async function fetchModelInfo() {
  return apiCall('/model/info');
}

export async function fetchHealthCheck() {
  return apiCall('/health');
}

// Batch prediction for multiple horizons
export async function fetchMultiplePredictions(horizons) {
  const promises = horizons.map(horizon => fetchPredictions(horizon));
  return Promise.all(promises);
}

// New API endpoints from updated documentation
export async function fetchRegressorPredictions() {
  return apiCall('/data/regressor-predictions');
}

export async function fetchSavedAluminumPredictions() {
  return apiCall('/data/aluminum-price-predictions');
}

export async function fetchRegressorData(days = 120) {
  return apiCall(`/data/regressors?days=${days}`);
}
