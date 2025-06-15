'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { format, parseISO, addDays } from 'date-fns';

export default function ForecastChart({ forecastData, historicalData, loading }) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!forecastData?.predictions || forecastData.predictions.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No hay datos de pronóstico disponibles</p>
      </div>
    );
  }

  // Combine historical and forecast data
  const historicalPoints = (historicalData || []).map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    actual: typeof item.price === 'number' ? item.price : parseFloat(item.price),
    type: 'historical'
  }));

  const forecastPoints = forecastData.predictions.map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    predicted: item.predicted_price,
    lower_bound: item.lower_bound,
    upper_bound: item.upper_bound,
    type: 'forecast'
  }));

  const chartData = [...historicalPoints, ...forecastPoints];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>            {data.actual && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Real: ${data.actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {data.predicted && (
              <>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Predicho: ${data.predicted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {data.lower_bound && data.upper_bound && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Rango: ${data.lower_bound.toLocaleString()} - ${data.upper_bound.toLocaleString()}
                  </p>
                )}
              </>
            )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Forecast Summary */}
      {forecastData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Pronóstico Promedio</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              ${forecastData.summary.avg_predicted_price?.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Máximo Esperado</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              ${forecastData.summary.max_predicted_price?.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Mínimo Esperado</div>
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
              ${forecastData.summary.min_predicted_price?.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              domain={['dataMin - 20', 'dataMax + 20']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Confidence interval area */}
            <Area 
              dataKey="upper_bound" 
              stroke="none" 
              fill="#22c55e" 
              fillOpacity={0.1}
            />
            <Area 
              dataKey="lower_bound" 
              stroke="none" 
              fill="#22c55e" 
              fillOpacity={0.1}
            />
            
            {/* Historical actual prices */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#2563eb' }}
              connectNulls={false}
              name="Precio Histórico"
            />
            
            {/* Predicted prices */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#22c55e" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#22c55e' }}
              connectNulls={false}
              name="Precio Predicho"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Precio Histórico</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-600 border-dashed border-t-2 border-green-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Precio Predicho</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-green-200 dark:bg-green-800"></div>
          <span className="text-gray-600 dark:text-gray-400">Intervalo de Confianza</span>
        </div>
      </div>
    </div>
  );
}
