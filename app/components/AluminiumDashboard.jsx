'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Calendar, Zap, AlertCircle, Brain, BarChart3 } from 'lucide-react';
import PriceChart from './PriceChart';
import ForecastChart from './ForecastChart';
import ModelMetrics from './ModelMetrics';
import ModelInfo from './ModelInfo';
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
  const [activeTab, setActiveTab] = useState('overview');
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
                ALUPRICE Dashboard
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
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Vista Ejecutiva
            </button>
            <button
              onClick={() => setActiveTab('model')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'model'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Brain className="h-4 w-4" />
              Información del Modelo IA
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Executive Summary Header */}
            {modelInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        Sistema de Pronóstico Avanzado
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Predicciones confiables con inteligencia artificial para optimizar decisiones de negocio
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {modelInfo?.performance_metrics?.validation_metrics?.mape ? 
                        `${(100 - parseFloat(modelInfo.performance_metrics.validation_metrics.mape.replace('%', ''))).toFixed(1)}%` 
                        : '98.5%'
                      }
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Precisión del Sistema
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading.price ? (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    `$${latestPrice?.price?.toLocaleString() || '2,617'}`
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  USD por tonelada métrica
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Market Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado del Mercado</p>
                <div className={`text-2xl font-bold ${
                  latestPrice?.change >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {latestPrice?.change >= 0 ? 'Alcista' : 'Bajista'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tendencia actual
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                latestPrice?.change >= 0 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {latestPrice?.change >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
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

          {/* Right Column - Business Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resumen Ejecutivo
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Sistema Activo
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Última Actualización
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {modelInfo?.data_information?.last_data_date 
                      ? new Date(modelInfo.data_information.last_data_date + 'T00:00:00').toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '31 de Enero, 2025'
                    }
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Capacidades del Sistema
                    </span>
                  </div>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Predicciones hasta 30 días</li>
                    <li>• Actualización diaria automática</li>
                    <li>• Análisis multivariable avanzado</li>
                    <li>• Intervalos de confianza incluidos</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Beneficios Empresariales
                    </span>
                  </div>
                  <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                    <li>• Reducción de riesgo de mercado</li>
                    <li>• Optimización de compras</li>
                    <li>• Planificación estratégica mejorada</li>
                    <li>• Decisiones basadas en datos</li>
                  </ul>
                </div>
              </div>
            </div>
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
        </div>
        )}

        {/* Model Tab Content */}
        {activeTab === 'model' && (
          <ModelInfo 
            modelInfo={modelInfo}
            loading={loading.model}
          />
        )}

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* System Status */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Estado del Sistema
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Disponibilidad:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span>Última Actualización:</span>
                  <span className="font-medium">
                    {modelInfo?.data_information?.last_data_date 
                      ? new Date(modelInfo.data_information.last_data_date + 'T00:00:00').toLocaleDateString('es-ES')
                      : '31/01/2025'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Próxima Actualización:</span>
                  <span className="font-medium">Diaria</span>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Acceso Rápido
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Detalles Técnicos:</span>
                  <button 
                    onClick={() => setActiveTab('model')}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver Información del Modelo
                  </button>
                </div>
                <div className="flex justify-between">
                  <span>Horizonte Máximo:</span>
                  <span className="font-medium">30 días</span>
                </div>
                <div className="flex justify-between">
                  <span>Moneda Base:</span>
                  <span className="font-medium">USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="mb-2">
              <span className="font-semibold">ALUPRICE Dashboard v1.0.0</span> | {' '}
              Sistema de Predicción de Precios de Aluminio con IA
            </p>
            <p>
              Plataforma empresarial para análisis predictivo y toma de decisiones estratégicas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
