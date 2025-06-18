'use client';

import { Shield, TrendingUp, Database, Clock, CheckCircle, Activity } from 'lucide-react';

export default function ModelMetrics({ modelInfo, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Precisión del Modelo',
      value: `${modelInfo?.performance_metrics?.validation_metrics?.mape ? (100 - parseFloat(modelInfo.performance_metrics?.validation_metrics?.mape)).toFixed(1) : 97.7}%`,
      description: 'Exactitud en predicciones históricas',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      label: 'Error Promedio',
      value: `${modelInfo?.performance_metrics?.validation_metrics?.mape || 2.35}%`,
      description: 'Desviación típica vs precio real',
      icon: Shield,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      label: 'Confiabilidad',
      value: 'Muy Alta',
      description: `Rendimiento consistente en ${modelInfo?.data_information?.first_data_date && modelInfo?.data_information?.last_data_date ? 
        Math.round((new Date(modelInfo.data_information.last_data_date + 'T00:00:00') - new Date(modelInfo.data_information.first_data_date + 'T00:00:00')) / (1000 * 60 * 60 * 24 * 365.25))
        : 9}+ años`,
      icon: Database,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Rendimiento Empresarial
        </h3>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Producción Activa
          </span>
        </div>
      </div>

      {/* Model Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Modelo
          </span>
          <span className="text-sm text-gray-900 dark:text-white font-semibold">
            Red Neuronal LSTM
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Versión
          </span>
          <span className="text-sm text-gray-900 dark:text-white">
            v1.0.0
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Última Actualización
          </span>
          <span className="text-sm text-gray-900 dark:text-white">
            {modelInfo?.data_information?.last_data_date 
              ? new Date(modelInfo.data_information.last_data_date + 'T00:00:00').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : '31 de Enero, 2025'
            }
          </span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {metric.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {metric.description}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Training Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Datos de Entrenamiento
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Período:</span>
            <span className="font-medium">
              {modelInfo?.data_information?.first_data_date && modelInfo?.data_information?.last_data_date 
                ? `${new Date(modelInfo.data_information.first_data_date + 'T00:00:00').getFullYear()}-${new Date(modelInfo.data_information.last_data_date + 'T00:00:00').getFullYear()}`
                : '2016-2025'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Características:</span>
            <span className="font-medium">{modelInfo?.data_information?.total_regressors || 7} indicadores</span>
          </div>
          {/* <div className="flex justify-between">
            <span>Fuentes de Datos:</span>
            <span className="font-medium">{modelInfo?.data_information.regressors.length || 7} fuentes</span>
          </div> */}
        </div>
      </div>

      {/* Accuracy Badge */}
      <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Modelo de Alta Precisión
          </span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400">
          Una tasa de error MAPE de {modelInfo?.performance_metrics?.validation_metrics?.mape || 2.35}% indica excelente precisión de predicción para pronósticos de precios de commodities.
        </p>
      </div>
    </div>
  );
}
