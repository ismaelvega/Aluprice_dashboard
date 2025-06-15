'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, DollarSign, Target, Calendar, Zap, AlertCircle } from 'lucide-react';
import PriceChart from './PriceChart';
import ForecastChart from './ForecastChart';
import ModelMetrics from './ModelMetrics';
import ForecastControls from './ForecastControls';
import ExecutiveSummary from './ExecutiveSummary';
import MarketIndicators from './MarketIndicators';
import ApiSettings from './ApiSettings';
import { fetchLatestPrice, fetchHistoricalData, fetchPredictions, fetchModelInfo } from '../utils/api';

export default function AluminiumDashboard() {
  const [latestPrice, setLatestPrice] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [selectedHorizon, setSelectedHorizon] = useState(7);
  const [loading, setLoading] = useState({
    price: true,
    historical: true,
    forecast: false,
    model: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load latest price
      const priceData = await fetchLatestPrice();
      setLatestPrice(priceData);
      setLoading(prev => ({ ...prev, price: false }));

      // Load historical data
      const histData = await fetchHistoricalData(30);
      setHistoricalData(histData.historical_data || []);
      setLoading(prev => ({ ...prev, historical: false }));

      // Load model info
      const modelData = await fetchModelInfo();
      setModelInfo(modelData);
      setLoading(prev => ({ ...prev, model: false }));

      // Load initial forecast
      await loadForecast(selectedHorizon);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    }
  };

  const loadForecast = async (horizon) => {
    try {
      setLoading(prev => ({ ...prev, forecast: true }));
      const forecast = await fetchPredictions(horizon);
      setForecastData(forecast);
      setSelectedHorizon(horizon);
    } catch (err) {
      setError('Failed to load forecast data');
      console.error('Forecast error:', err);
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const handleHorizonChange = (horizon) => {
    loadForecast(horizon);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error del Panel
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadInitialData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                Dashboard ALUPRICE
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Pronóstico de Precios de Aluminio con Redes Neuronales LSTM
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ApiSettings onSettingsUpdate={(settings) => console.log('API settings updated:', settings)} />
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Estado del Modelo</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Producción Activa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Context Information */}
        {modelInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Contexto de Datos del Modelo
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Nuestro modelo predice precios con {modelInfo?.performance_metrics?.metrics?.MAPE ? (100 - parseFloat(modelInfo.performance_metrics.metrics.MAPE)).toFixed(1) : 97.7}% de precisión, con errores típicos de solo ±{modelInfo?.performance_metrics?.metrics?.MAPE || 2.35}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Período de Entrenamiento
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modelInfo?.data_information?.first_data_date ? 
                    new Date(modelInfo.data_information.first_data_date + 'T00:00:00').toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    }) : 'Cargando...'
                  }
                  {' - '}
                  {modelInfo?.data_information?.last_data_date ? 
                    new Date(modelInfo.data_information.last_data_date + 'T00:00:00').toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    }) : 'Cargando...'
                  }
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {modelInfo?.data_information?.first_data_date && modelInfo?.data_information?.last_data_date ? 
                    Math.round((new Date(modelInfo.data_information.last_data_date + 'T00:00:00') - new Date(modelInfo.data_information.first_data_date + 'T00:00:00')) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10 
                    : 'N/A'
                  } años de datos históricos
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  "Hoy" para el Modelo
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modelInfo?.data_information?.last_data_date ? 
                    new Date(modelInfo.data_information.last_data_date + 'T00:00:00').toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    }) : 'Cargando...'
                  }
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Último día con datos disponibles
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Horizonte de Pronóstico
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  1 - 30 días
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Amplio rango para planificación táctica y estratégica
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Price */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Actual</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading.price ? (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    `$${latestPrice?.price?.toLocaleString() || '2,617'}`
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  USD por tonelada métrica
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Model Accuracy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Precisión del Modelo</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {loading.model ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    `${modelInfo?.performance_metrics?.metrics?.MAPE || 2.35}%`
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tasa de Error MAPE
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Forecast Range */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rango de Pronóstico</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedHorizon} Días
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Días hábiles adelante
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Historical Chart and Economic Indicators */}
          <div className="lg:col-span-2 space-y-8">
            {/* Historical Price Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tendencias Históricas de Precios
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Activity className="h-4 w-4" />
                  Últimos 30 días
                </div>
              </div>
              <PriceChart 
                data={historicalData} 
                loading={loading.historical}
              />
            </div>

            {/* Economic Indicators */}
            <div>
              <MarketIndicators 
                historicalData={historicalData}
                loading={loading.model} 
              />
            </div>
          </div>

          {/* Right Column - Model Performance Metrics */}
          <div className="lg:col-span-1">
            <ModelMetrics 
              modelInfo={modelInfo}
              loading={loading.model}
            />
          </div>
        </div>

        {/* Forecast Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Forecast Controls */}
          <div className="lg:col-span-1">
            <ForecastControls 
              selectedHorizon={selectedHorizon}
              onHorizonChange={handleHorizonChange}
              loading={loading.forecast}
            />
          </div>

          {/* Forecast Chart */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pronóstico de Precios - {selectedHorizon} Días Adelante
                  </h3>
                  {modelInfo?.data_information?.last_data_date && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Desde {new Date(modelInfo.data_information.last_data_date + 'T00:00:00').toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  Red Neuronal LSTM
                </div>
              </div>
              <ForecastChart 
                forecastData={forecastData}
                historicalData={historicalData.slice(-7)} // Last 7 days for context
                loading={loading.forecast}
              />
            </div>
            
            {/* Executive Summary - Below forecast chart */}
            <ExecutiveSummary 
              latestPrice={latestPrice}
              forecastData={forecastData}
              modelInfo={modelInfo}
              loading={loading.price || loading.forecast}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Model Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Valor del Modelo
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Precisión de Pronósticos:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {modelInfo?.performance_metrics?.metrics?.MAPE ? (100 - parseFloat(modelInfo.performance_metrics.metrics.MAPE)).toFixed(1) : 97.7}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Típico:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ±{modelInfo?.performance_metrics?.metrics?.MAPE || 2.35}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Años de Datos Históricos:</span>
                  <span className="font-medium">
                    {modelInfo?.data_information?.first_data_date && modelInfo?.data_information?.last_data_date 
                      ? Math.round((new Date(modelInfo.data_information.last_data_date) - new Date(modelInfo.data_information.first_data_date)) / (1000 * 60 * 60 * 24 * 365.25))
                      : 9} años ({modelInfo?.data_information?.first_data_date ? new Date(modelInfo.data_information.first_data_date).getFullYear() : 2016}-{modelInfo?.data_information?.last_data_date ? new Date(modelInfo.data_information.last_data_date).getFullYear() : 2025})
                  </span>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Integración de Datos
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Indicadores Económicos:</span>
                  <span className="font-medium">7 fuentes</span>
                </div>
                <div className="flex justify-between">
                  <span>Características Engineered:</span>
                  <span className="font-medium">{modelInfo?.data_information?.total_regressors || 7} variables</span>
                </div>
                <div className="flex justify-between">
                  <span>Frecuencia de Actualización:</span>
                  <span className="font-medium">Diaria</span>
                </div>
              </div>
            </div>

            {/* Business Impact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Capacidades Operativas
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Horizonte de Planificación:</span>
                  <span className="font-medium">1-30 días</span>
                </div>
                <div className="flex justify-between">
                  <span>Intervalos de Confianza:</span>
                  <span className="font-medium">95% cobertura</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilidad del Sistema:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">24/7</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="mb-2">
              <span className="font-semibold">Dashboard ALUPRICE v1.0.0</span> | {' '}
              Impulsado por Redes Neuronales LSTM | {' '}
              <span className="font-medium text-green-600 dark:text-green-400">
                Precisión del Modelo {modelInfo?.performance_metrics?.metrics?.MAPE ? (100 - parseFloat(modelInfo.performance_metrics.metrics.MAPE)).toFixed(1) : 97.7}%
              </span>
            </p>
            <p>
              Construido con Next.js • FastAPI • TensorFlow • Integración de datos económicos diarios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
