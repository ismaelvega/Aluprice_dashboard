'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart3, DollarSign, Zap, Building2, Fuel, Globe, AlertTriangle, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fetchRegressorPredictions, fetchRegressorData } from '../utils/api';

const REGRESSOR_CONFIG = {
  precio_alum_global: {
    name: 'Precio Global del Aluminio',
    description: 'Cotización LME (USD/tonelada) – termómetro mundial de oferta y demanda',
    icon: BarChart3,
    unit: 'USD/MT',
    color: '#3b82f6',
    impact: 'Un incremento de 100 USD en la LME se traslada en torno a 90 USD al precio local (elasticidad β≈0.9)',
    businessInsight: 'Nuestro precio interno sigue casi uno a uno al rally global; los movimientos suelen mantenerse 2–4 semanas',
    strategicImplication: 'Vigilar valor en percentil 25 histórico para programar compras automáticas'
  },

  inflacion: {
    name: 'Inflación México',
    description: 'Tasa de inflación mensual (INEGI, % interanual)',
    icon: TrendingUp,
    unit: '%',
    color: '#ef4444',
    impact: 'Cada punto porcentual extra de inflación eleva el costo en aproximadamente 12 USD/t con un rezago de 2–3 meses',
    businessInsight: 'La inflación alta presiona los costos de insumos y reduce la demanda de proyectos de construcción',
    strategicImplication: 'Si la inflación supera 5 %, conviene adelantar compras y planificar ajustes de precio'
  },

  USD: {
    name: 'Tipo de Cambio USD/MXN',
    description: 'Paridad peso–dólar (fix Banxico)',
    icon: DollarSign,
    unit: 'MXN/USD',
    color: '#10b981',
    impact: 'La depreciación del peso encarece importaciones y se correlaciona inversamente (corr. –0.6) con nuestro precio',
    businessInsight: 'Peso débil aumenta el costo de materia prima; peso fuerte favorece adquisición de insumos',
    strategicImplication: 'Entre 16–17 MXN/USD es ventana óptima de compra; arriba de 18 MXN/USD conviene adelantar inventarios'
  },

  petroleo: {
    name: 'Precio del Petróleo',
    description: 'Brent spot (USD/barril)',
    icon: Fuel,
    unit: 'USD/Bbl',
    color: '#f59e0b',
    impact: 'Cada 10 USD adicionales por barril añaden aproximadamente 7 USD/t al cash-cost (energía≈35 % del COGS)',
    businessInsight: 'La energía representa un tercio del costo de fundición; los shocks se trasladan en 1–2 meses',
    strategicImplication: 'Por encima de 85 USD/bbl, renegociar contratos de energía para proteger márgenes'
  },

  stock_alum: {
    name: 'Inventarios LME',
    description: 'Existencias en almacenes LME (toneladas)',
    icon: Building2,
    unit: 'MT',
    color: '#8b5cf6',
    impact: 'Con niveles por debajo de 0.8 M t, la presión alcista se intensifica; una caída de 100 kt suele sumar 45 USD/t',
    businessInsight: 'La métrica de “cancelled warrants” señala metal que sale del mercado',
    strategicImplication: 'Si los inventarios se mantienen < 0.8 M t por más de tres días, activar compras forward'
  },

  us_electricity_price: {
    name: 'Precio Electricidad EUA',
    description: 'Tarifa industrial promedio (¢/kWh)',
    icon: Zap,
    unit: '¢/kWh',
    color: '#06b6d4',
    impact: 'Cuando el diferencial EUA–MX supera 2 ¢/kWh, México y Canadá ganan ventaja competitiva',
    businessInsight: 'La fundición consume 13–15 kWh/kg; tarifas altas en EE UU pueden desplazar producción a NAFTA',
    strategicImplication: 'Vigilar spread para negociar tarifas y captar mayor participación regional'
  },

  fed_funds_rate: {
    name: 'Tasa Fed',
    description: 'Federal Funds Target Rate (%)',
    icon: TrendingDown,
    unit: '%',
    color: '#ec4899',
    impact: 'Tasas reales por encima de 2 % suelen anticipar una caída de 5 % anual en metales con rezago de 6–9 meses',
    businessInsight: 'Tasas elevadas enfrían la inversión en infraestructura y sector automotriz',
    strategicImplication: 'En entornos de tasas altas, conviene cubrir inventarios y buscar hedges; con tasas bajas, impulsar ventas'
  }
};



export default function EconomicDriversCarousel({ isOpen, onClose, forecastHorizon = 7 }) {
  const [currentRegressorIndex, setCurrentRegressorIndex] = useState(0);
  const [regressorPredictions, setRegressorPredictions] = useState(null);
  const [regressorHistorical, setRegressorHistorical] = useState(null);
  const [loading, setLoading] = useState(false);

  const regressors = Object.keys(REGRESSOR_CONFIG);
  const currentRegressor = regressors[currentRegressorIndex];
  const config = REGRESSOR_CONFIG[currentRegressor];

  useEffect(() => {
    if (isOpen) {
      loadRegressorData();
    }
  }, [isOpen]);

  const loadRegressorData = async () => {
    setLoading(true);
    try {
      // Load both predictions and historical data
      const [predictions, historical] = await Promise.all([
        fetchRegressorPredictions(),
        fetchRegressorData(30) // Last 30 days for context
      ]);
      
      setRegressorPredictions(predictions);
      setRegressorHistorical(historical);
    } catch (error) {
      console.error('Error loading regressor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextRegressor = () => {
    setCurrentRegressorIndex((prev) => (prev + 1) % regressors.length);
  };

  const prevRegressor = () => {
    setCurrentRegressorIndex((prev) => (prev - 1 + regressors.length) % regressors.length);
  };

  const getChartData = () => {
    if (!regressorPredictions || !regressorHistorical) {
      return [];
    }

    // Safely access regressor data with fallbacks
    const historicalRegressorData = regressorHistorical?.regressor_data?.[currentRegressor];
    const predictedRegressorData = regressorPredictions?.regressor_predictions?.[currentRegressor];

    if (!historicalRegressorData && !predictedRegressorData) {
      return [];
    }

    const historical = (historicalRegressorData || []).slice(-10); // Last 10 days
    const predictions = (predictedRegressorData || []).slice(0, forecastHorizon);

    // Combine historical and predicted data with error handling
    const historicalData = historical.map(item => {
      try {
        return {
          date: format(parseISO(item.date), 'MMM dd'),
          value: item.value,
          type: 'historical'
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);

    const predictedData = predictions.map(item => {
      try {
        return {
          date: format(parseISO(item.date), 'MMM dd'),
          value: item.predicted_value,
          type: 'predicted'
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);

    return [...historicalData, ...predictedData];
  };

  const getCurrentValue = () => {
    if (!regressorPredictions?.regressor_predictions?.[currentRegressor]) return null;
    const predictions = regressorPredictions.regressor_predictions[currentRegressor];
    return predictions?.[0]?.predicted_value;
  };

  const getTrend = () => {
    if (!regressorPredictions?.regressor_predictions?.[currentRegressor]) return null;
    const predictions = regressorPredictions.regressor_predictions[currentRegressor];
    if (!predictions || predictions.length < 2) return null;
    
    const first = predictions[0]?.predicted_value;
    const last = predictions[Math.min(forecastHorizon - 1, predictions.length - 1)]?.predicted_value;
    
    if (!first || !last) return null;
    const change = ((last - first) / first) * 100;
    
    return {
      percentage: Math.abs(change).toFixed(2),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const formatValue = (value) => {
    if (!value) return 'N/A';
    
    switch (currentRegressor) {
      case 'precio_alum_global':
      case 'stock_alum':
        return value.toLocaleString();
      case 'petroleo':
        return value.toFixed(2);
      case 'inflacion':
      case 'fed_funds_rate':
        return `${value.toFixed(2)}%`;
      case 'USD':
        return value.toFixed(4);
      case 'us_electricity_price':
        return value.toFixed(3);
      default:
        return value.toFixed(2);
    }
  };

  const getStrategicImplications = () => {
    const implications = {
      precio_alum_global: {
        businessImpact: "Indicador maestro del mercado. Aumentos del 10% típicamente se traducen en incrementos de 8-12% en precios locales con desfase de 2-4 semanas.",
        riskAssessment: "Volatilidad alta (>5% semanal) indica incertidumbre en cadena de suministro. Monitorear eventos geopolíticos en principales productores (China, Rusia).",
        recommendations: "Establecer bandas de precio para compras automáticas. Considerar contratos de suministro a largo plazo cuando el precio esté en percentil 25 histórico.",
        marketIntelligence: "Correlación 0.85 con aluminio mexicano. Mercados asiáticos dominan formación de precios. Vigilar capacidad de fundición china."
      },
      inflacion: {
        businessImpact: "Inflación >4% incrementa costos operativos y reduce demanda de construcción. Cada punto porcentual adicional reduce demanda ~2-3%.",
        riskAssessment: "Riesgo medio-alto si inflación persiste >6 meses arriba de meta 3%. Puede desencadenar alzas de tasas y contracción económica.",
        recommendations: "Indexar contratos a inflación cuando supere 5%. Acelerar inventarios si tendencia alcista confirmada por 3 meses consecutivos.",
        marketIntelligence: "Banxico tiende a reaccionar con 2-3 meses de rezago. Sectores construcción y automotriz más sensibles a presiones inflacionarias."
      },
      USD: {
        businessImpact: "Peso débil (>20 MXN/USD) encarece importaciones 15-25%. Peso fuerte (<18 MXN/USD) mejora competitividad de importaciones vs producción local.",
        riskAssessment: "Alta volatilidad cambiaria (>2% diario) incrementa incertidumbre. Monitorear diferencial de tasas México-EUA y flujos de capital.",
        recommendations: "Peso >21: acelerar compras de importación. Peso <19: oportunidad para negociar mejores precios con proveedores internacionales.",
        marketIntelligence: "Correlación negativa -0.7 con precios locales de aluminio. Eventos Fed y decisiones Banxico catalizadores principales de movimientos."
      },
      petroleo: {
        businessImpact: "Petróleo >$80/barril incrementa costos energéticos 20-30%. Representa 35% del costo variable en producción primaria de aluminio.",
        riskAssessment: "Precios >$90 sostenidos >6 meses pueden presionar márgenes significativamente. Riesgo geopolítico en Medio Oriente factor clave.",
        recommendations: "Considerar coberturas energéticas cuando petróleo >percentil 75 histórico. Evaluar eficiencia energética en operaciones.",
        marketIntelligence: "OPEC+ controla 40% producción global. Inventarios EUA indicador líder. Temporada de huracanes (Jun-Nov) riesgo adicional."
      },
      stock_alum: {
        businessImpact: "Inventarios <1M MT indican mercado ajustado, presión alcista. Inventarios >1.5M MT sugieren sobreoferta, presión bajista en precios.",
        riskAssessment: "Tendencia decreciente >3 meses consecutivos señala posible escasez. Concentración en pocas ubicaciones incrementa riesgo logístico.",
        recommendations: "Asegurar suministro cuando inventarios <900K MT. Diferir compras cuando inventarios >1.8M MT y tendencia creciente.",
        marketIntelligence: "Asia concentra 60% inventarios. Cambios en política china de exportaciones pueden impactar dramáticamente niveles globales."
      },
      us_electricity_price: {
        businessImpact: "Electricidad cara en EUA (>12¢/kWh) puede redirigir 15-20% producción hacia México/Canadá, aumentando demanda regional.",
        riskAssessment: "Precios energéticos volátiles incrementan incertidumbre en costos de productores norteamericanos. Vigilar políticas energéticas.",
        recommendations: "Aprovechar arbitrajes cuando diferencial EUA-México >5¢/kWh. Considerar nearshoring de clientes estadounidenses.",
        marketIntelligence: "Texas y California mercados más volátiles. Transición renovable puede crear oportunidades de arbitraje regional."
      },
      fed_funds_rate: {
        businessImpact: "Tasas >4% reducen inversión en infraestructura 10-15%. Tasas <2% estimulan demanda industrial y construcción.",
        riskAssessment: "Ciclo alcista prolongado puede contraer significativamente demanda. Vigilar curva de rendimientos invertida como señal recesiva.",
        recommendations: "Incrementar inventarios en ciclos de tasas bajas. Ser conservador en expansión cuando tasas >5% y tendencia alcista.",
        marketIntelligence: "Mercados anticipan movimientos Fed 2-3 reuniones adelante. Comunicación Fed tan importante como decisiones actuales."
      }
    };

    return implications[currentRegressor] || {
      businessImpact: "Analizando implicaciones comerciales de este factor económico...",
      riskAssessment: "Evaluando perfil de riesgo y volatilidad...",
      recommendations: "Desarrollando recomendaciones estratégicas...",
      marketIntelligence: "Compilando inteligencia de mercado relevante..."
    };
  };

  if (!isOpen) return null;

  const chartData = getChartData();
  const currentValue = getCurrentValue();
  const trend = getTrend();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IconComponent className="h-6 w-6" style={{ color: config.color }} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Factores Económicos
              </h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentRegressorIndex + 1} de {regressors.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Current Regressor Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <IconComponent className="h-8 w-8" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {config.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  {/* Current Value */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Valor Proyectado (Día 1)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatValue(currentValue)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {config.unit}
                      </span>
                    </div>
                    {trend && (
                      <div className="flex items-center gap-1 mt-2">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : trend.direction === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span className={`text-sm ${
                          trend.direction === 'up' ? 'text-green-600' :
                          trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend.direction === 'stable' ? 'Sin cambio significativo' :
                           `${trend.percentage}% en ${forecastHorizon} días`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Impact Analysis */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Impacto en Aluminio
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {config.impact}
                    </p>
                  </div>
                </div>

                {/* Right: Chart */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Pronóstico
                      </h4>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5" style={{ backgroundColor: config.color }}></div>
                          <span className="text-gray-600 dark:text-gray-400">Pronóstico</span>
                        </div>
                      </div>
                    </div>
                    
                    {chartData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#6b7280"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                              tickFormatter={(value) => formatValue(value)}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {label}
                                      </p>
                                      <p className="text-sm" style={{ color: config.color }}>
                                        {data.type === 'historical' ? 'Histórico: ' : 'Pronóstico: '}
                                        {formatValue(data.value)} {config.unit}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke={config.color}
                              fill={`${config.color}20`}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-sm">Cargando datos del factor económico...</p>
                          <p className="text-xs mt-1">
                            {regressorPredictions ? 'Datos cargados' : 'Esperando datos de pronóstico'} • {' '}
                            {regressorHistorical ? 'Histórico cargado' : 'Esperando datos históricos'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Insights Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Implicaciones Estratégicas
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business Impact */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Impacto Comercial
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getStrategicImplications().businessImpact}
                    </p>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Evaluación de Riesgo
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getStrategicImplications().riskAssessment}
                    </p>
                  </div>

                  {/* Strategic Recommendations */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Recomendaciones
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getStrategicImplications().recommendations}
                    </p>
                  </div>

                  {/* Market Intelligence */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Inteligencia de Mercado
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getStrategicImplications().marketIntelligence}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={prevRegressor}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>

              {/* Indicator dots */}
              <div className="flex items-center gap-2">
                {regressors.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentRegressorIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentRegressorIndex 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextRegressor}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
