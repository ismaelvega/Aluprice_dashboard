'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Zap, BarChart3, Globe, Factory, TrendingDown } from 'lucide-react';
import { fetchHistoricalData, fetchModelInfo } from '../utils/api';

export default function MarketIndicators({ loading: externalLoading }) {
  const [historicalData, setHistoricalData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both historical data and model info in parallel
        const [historicalData, modelInfo] = await Promise.all([
          fetchHistoricalData(7),
          fetchModelInfo()
        ]);
        
        setHistoricalData(historicalData);
        setModelInfo(modelInfo);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to calculate percentage change between latest and previous values
  const calculateChange = (currentValue, previousValue) => {
    if (!currentValue || !previousValue) return { change: '0.00%', trend: 'stable' };
    
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    const trend = changePercent > 0.1 ? 'up' : changePercent < -0.1 ? 'down' : 'stable';
    
    return {
      change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
      trend
    };
  };

  // Function to format regressor values
  const formatValue = (regressorName, value) => {
    if (!value && value !== 0) return 'N/A';
    
    switch(regressorName) {
      case 'usd_exchange_rate':
        return `$${value.toFixed(2)}`;
      case 'oil_price':
        return `$${value.toFixed(2)}`;
      case 'fed_funds_rate':
        return `${value.toFixed(2)}%`;
      case 'stock_levels':
        return `${(value / 1000).toFixed(0)}K TM`;
      case 'us_electricity_price':
        return `$${value.toFixed(2)}/kWh`;
      case 'inflation_rate':
        return `${value.toFixed(2)}%`;
      case 'global_price':
      case 'copper_price':
      case 'lead_price':
        return `$${value.toFixed(0)}`;
      default:
        return value.toFixed(2);
    }
  };

  // Dynamic indicators based on API data
  const getIndicators = () => {
    console.log(historicalData?.data_information)
    if (!historicalData?.historical_data || historicalData.historical_data.length === 0) {
      // Fallback to empty array while loading
      return [];
    }

    const dataPoints = historicalData.historical_data;
    const latestData = dataPoints[dataPoints.length - 1];
    const previousData = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : latestData;

    const indicators = [];
    
    // USD Exchange Rate
    if (latestData.usd_exchange_rate !== undefined) {
      const changeData = calculateChange(latestData.usd_exchange_rate, previousData.usd_exchange_rate);
      
      indicators.push({
        name: 'Tipo de Cambio USD/MXN',
        value: formatValue('usd_exchange_rate', latestData.usd_exchange_rate),
        change: changeData.change,
        trend: changeData.trend,
        icon: DollarSign,
        color: 'blue',
        description: 'Tasa USD/MXN afectando precios locales'
      });
    }

    // Oil Price
    if (latestData.oil_price !== undefined) {
      const changeData = calculateChange(latestData.oil_price, previousData.oil_price);
      
      indicators.push({
        name: 'Precio del Petróleo Crudo',
        value: formatValue('oil_price', latestData.oil_price),
        change: changeData.change,
        trend: changeData.trend,
        icon: BarChart3,
        color: 'orange',
        description: 'Costos de energía impacto en producción'
      });
    }

    // Fed Funds Rate
    if (latestData.fed_funds_rate !== undefined) {
      const changeData = calculateChange(latestData.fed_funds_rate, previousData.fed_funds_rate);
      
      indicators.push({
        name: 'Tasa de Fondos Federales',
        value: formatValue('fed_funds_rate', latestData.fed_funds_rate),
        change: changeData.change,
        trend: changeData.trend,
        icon: TrendingUp,
        color: 'green',
        description: 'Tasas de interés afectando inversión'
      });
    }

    // Aluminum Stock Levels
    if (latestData.stock_levels !== undefined) {
      const changeData = calculateChange(latestData.stock_levels, previousData.stock_levels);
      
      indicators.push({
        name: 'Inventario LME',
        value: formatValue('stock_levels', latestData.stock_levels),
        change: changeData.change,
        trend: changeData.trend,
        icon: Factory,
        color: 'purple',
        description: 'Niveles de stock London Metal Exchange'
      });
    }

    // Electricity Price
    if (latestData.us_electricity_price !== undefined) {
      const changeData = calculateChange(latestData.us_electricity_price, previousData.us_electricity_price);
      
      indicators.push({
        name: 'Costos de Electricidad',
        value: formatValue('us_electricity_price', latestData.us_electricity_price),
        change: changeData.change,
        trend: changeData.trend,
        icon: Zap,
        color: 'yellow',
        description: 'Precios de electricidad industrial US'
      });
    }

    // Inflation Rate
    if (latestData.inflation_rate !== undefined) {
      const changeData = calculateChange(latestData.inflation_rate, previousData.inflation_rate);
      
      indicators.push({
        name: 'Inflación México',
        value: formatValue('inflation_rate', latestData.inflation_rate),
        change: changeData.change,
        trend: changeData.trend,
        icon: Globe,
        color: 'red',
        description: 'Tasa de inflación mexicana'
      });
    }

    // Global Aluminum Price
    if (latestData.global_price !== undefined) {
      const changeData = calculateChange(latestData.global_price, previousData.global_price);
      
      indicators.push({
        name: 'Precio Aluminio Global',
        value: formatValue('global_price', latestData.global_price),
        change: changeData.change,
        trend: changeData.trend,
        icon: BarChart3,
        color: 'indigo',
        description: 'Precio global del aluminio LME'
      });
    }

    // Copper Price
    if (latestData.copper_price !== undefined) {
      const changeData = calculateChange(latestData.copper_price, previousData.copper_price);
      
      indicators.push({
        name: 'Precio Cobre',
        value: formatValue('copper_price', latestData.copper_price),
        change: changeData.change,
        trend: changeData.trend,
        icon: DollarSign,
        color: 'orange',
        description: 'Precio del cobre LME (USD/ton)'
      });
    }

    // Lead Price
    if (latestData.lead_price !== undefined) {
      const changeData = calculateChange(latestData.lead_price, previousData.lead_price);
      
      indicators.push({
        name: 'Precio Plomo',
        value: formatValue('lead_price', latestData.lead_price),
        change: changeData.change,
        trend: changeData.trend,
        icon: DollarSign,
        color: 'gray',
        description: 'Precio del plomo LME (USD/ton)'
      });
    }

    return indicators;
  };

  const indicators = getIndicators();

  const isLoading = loading || externalLoading;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Indicadores Económicos
          </h3>
          <div className="text-xs text-red-500 dark:text-red-400">
            Error al cargar datos
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No se pudieron cargar los indicadores económicos. Usando datos de demostración.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Indicadores Económicos
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {historicalData?.historical_data?.length > 0 ? 
            `Actualizado: ${historicalData.historical_data[historicalData.historical_data.length - 1].date}` : 
            'Datos actualizados hace 1 día'
          }
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {indicators.length > 0 ? indicators.map((indicator, index) => {
          const IconComponent = indicator.icon;
          const isPositive = indicator.trend === 'up';
          const isNegative = indicator.trend === 'down';
          
          return (
            <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  indicator.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  indicator.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                  indicator.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  indicator.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  indicator.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  indicator.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <IconComponent className={`h-4 w-4 ${
                    indicator.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    indicator.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    indicator.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    indicator.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    indicator.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    indicator.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' :
                  isNegative ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {indicator.change}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {indicator.name}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {indicator.value}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {indicator.description}
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No hay datos de indicadores disponibles.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Integración del Modelo
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Los {modelInfo?.regressor_descriptions ? Object.keys(modelInfo.regressor_descriptions).length : 0} indicadores económicos se integran automáticamente en el modelo de pronóstico {modelInfo?.model_type || 'LSTM'}
          para proporcionar predicciones de precios completas basadas en las últimas condiciones del mercado.
        </p>
      </div>
    </div>
  );
}
