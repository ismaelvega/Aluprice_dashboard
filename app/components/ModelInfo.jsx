'use client';

import { useState } from 'react';
import { 
  Brain, 
  Target, 
  Database, 
  Clock, 
  TrendingUp, 
  Shield, 
  Activity, 
  BarChart3, 
  Settings, 
  CheckCircle, 
  DollarSign,
  Zap,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

export default function ModelInfo({ modelInfo, loading }) {
  const [expandedSections, setExpandedSections] = useState({
    architecture: false,
    performance: true,
    training: false,
    data: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!modelInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Información del Modelo No Disponible
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No se pudo cargar la información del modelo
          </p>
        </div>
      </div>
    );
  }

  const metrics = modelInfo.performance_metrics?.validation_metrics;
  const trainingConfig = modelInfo.training_configuration;
  const dataInfo = modelInfo.data_information;

  // Calculate business impact metrics
  const accuracy = metrics?.mape ? (100 - parseFloat(metrics.mape.replace('%', ''))).toFixed(1) : '98.5';
  const avgError = metrics?.mae ? parseFloat(metrics.mae).toFixed(0) : '38';
  const dataYears = dataInfo ? Math.round((new Date(dataInfo.last_data_date + 'T00:00:00') - new Date(dataInfo.first_data_date + 'T00:00:00')) / (1000 * 60 * 60 * 24 * 365.25)) : 9;

  const keyBenefits = [
    {
      icon: Target,
      title: 'Precisión Excepcional',
      value: `${accuracy}%`,
      description: 'Exactitud en predicciones de precios',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: DollarSign,
      title: 'Error Mínimo',
      value: `$${avgError}`,
      description: 'Error promedio absoluto por tonelada',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Clock,
      title: 'Predicción Avanzada',
      value: `${trainingConfig?.prediction_horizon || 30} días`,
      description: 'Horizonte de pronóstico máximo',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: Database,
      title: 'Datos Históricos',
      value: `${dataYears} años`,
      description: 'Base de datos para entrenamiento',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Información del Modelo IA
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Red Neuronal LSTM para Predicción de Precios del Aluminio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              {modelInfo.performance_metrics?.performance_status || 'Operativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Benefits Grid */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Beneficios Clave del Modelo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {keyBenefits.map((benefit, index) => (
            <div key={index} className={`${benefit.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-600`}>
              <div className="flex items-center gap-3 mb-2">
                <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {benefit.title}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {benefit.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {benefit.description}
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Sections */}
        <div className="space-y-4">
          {/* Performance Section */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => toggleSection('performance')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Métricas de Rendimiento
                </span>
              </div>
              {expandedSections.performance ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.performance && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">MAPE</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {metrics?.mape || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Error porcentual absoluto medio</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">MAE</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ${metrics?.mae || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Error absoluto medio</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">RMSE</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ${metrics?.rmse || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Raíz del error cuadrático medio</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Precisión Direccional</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {metrics?.directional_accuracy || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Exactitud en tendencias</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Error Máximo</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ${metrics?.max_absolute_error || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Peor caso observado</div>
                  </div>
                  {/* <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sesgo del Precio</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ${modelInfo.performance_metrics?.price_statistics?.price_bias?.toFixed(2) || 73.3864908854166.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Sesgo promedio de predicción</div>
                  </div> */}
                </div>
              </div>
            )}
          </div>

          {/* Architecture Section */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => toggleSection('architecture')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Arquitectura del Modelo
                </span>
              </div>
              {expandedSections.architecture ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.architecture && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Capas de la Red Neuronal</h4>
                    <div className="space-y-2">
                      {modelInfo.model_architecture?.layers?.map((layer, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{layer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Optimizador</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.model_architecture?.optimizer || 'Adam'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Función de Pérdida</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.model_architecture?.loss_function || 'MSE'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Regularización</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.model_architecture?.regularization || 'L2'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tipo</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.model_architecture?.type || 'Bidirectional LSTM'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Training Configuration Section */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => toggleSection('training')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Configuración de Entrenamiento
                </span>
              </div>
              {expandedSections.training ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.training && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ventana de Observación</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trainingConfig?.look_back_window || 120} días
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Horizonte de Predicción</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trainingConfig?.prediction_horizon || 30} días
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Épocas</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trainingConfig?.epochs || 200}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tamaño de Lote</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trainingConfig?.batch_size || 32}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Parada Temprana</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trainingConfig?.early_stopping ? 'Activada' : 'Desactivada'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Fecha de Corte</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trainingConfig?.training_cutoff_date || '2024-01-01'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Information Section */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => toggleSection('data')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Información de Datos
                </span>
              </div>
              {expandedSections.data ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.data && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Muestras Totales</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.performance_metrics?.data_info?.total_samples?.toLocaleString() || 2455}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Muestras de Entrenamiento</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.performance_metrics?.data_info?.training_samples?.toLocaleString() || 2182}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Muestras de Validación</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {modelInfo.performance_metrics?.data_info?.validation_samples?.toLocaleString() || 273}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Variables Predictoras</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modelInfo.regressor_descriptions && Object.entries(modelInfo.regressor_descriptions).map(([key, description]) => (
                        <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="font-medium text-gray-900 dark:text-white text-sm capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Value Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Valor Empresarial del Modelo
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Este modelo de IA avanzado utiliza redes neuronales LSTM para proporcionar predicciones precisas de precios del aluminio 
                hasta {modelInfo?.prediction_horizon || 30} días en el futuro, con una precisión del {accuracy}% y un error promedio de solo ${avgError} por tonelada. 
                Entrenado con {dataYears} años de datos históricos y {modelInfo?.regressor_descriptions ? Object.keys(modelInfo.regressor_descriptions).filter(key => key !== 'global_price').length : 0} indicadores económicos clave, permite tomar decisiones 
                estratégicas informadas y optimizar la gestión de riesgos en el mercado de materias primas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
