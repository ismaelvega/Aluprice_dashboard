'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Clock, Play } from 'lucide-react';

export default function ForecastControls({ selectedHorizon, onHorizonChange, loading }) {
  const [customHorizon, setCustomHorizon] = useState(selectedHorizon);

  const predefinedHorizons = [
    { days: 1, label: '1 Día', description: 'Mañana' },
    { days: 3, label: '3 Días', description: 'Corto plazo' },
    { days: 7, label: '1 Semana', description: 'Semanal' },
    { days: 15, label: '2 Semanas', description: 'Quincenal' },
    { days: 30, label: '1 Mes', description: 'Mensual' }
  ];

  const handlePredefinedHorizon = (days) => {
    setCustomHorizon(days);
    onHorizonChange(days);
  };

  const handleCustomHorizon = () => {
    if (customHorizon >= 1 && customHorizon <= 30) {
      onHorizonChange(customHorizon);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Controles de Pronóstico
        </h3>
      </div>

      {/* Predefined Horizons */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pronósticos Rápidos
        </h4>
        {predefinedHorizons.map((horizon) => (
          <button
            key={horizon.days}
            onClick={() => handlePredefinedHorizon(horizon.days)}
            disabled={loading}
            className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
              selectedHorizon === horizon.days
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{horizon.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {horizon.description}
                </div>
              </div>
              <div className="text-right">
                {loading && selectedHorizon === horizon.days && (
                  <div className="mt-1">
                    <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Horizon */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pronóstico Personalizado
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
              Días adelante (1-30)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={customHorizon}
              onChange={(e) => setCustomHorizon(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleCustomHorizon}
            disabled={loading || customHorizon < 1 || customHorizon > 30}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
          >
            {loading && selectedHorizon === customHorizon ? (
              <>
                <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                Generando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generar Pronóstico
              </>
            )}
          </button>
        </div>
      </div>

      {/* Model Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Red Neuronal LSTM
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Pronóstico avanzado de series temporales con 7 indicadores económicos y 13 características engineered.
        </p>
      </div>
    </div>
  );
}
