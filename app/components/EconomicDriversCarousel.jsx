'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart3, DollarSign, Zap, Building2, Fuel, Globe, AlertTriangle, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

// Map config keys to historical_data field names
const FIELD_MAP = {
  // precio_alum_global: 'global_price',
  inflacion: 'inflation_rate',
  USD: 'usd_exchange_rate',
  petroleo: 'oil_price',
  stock_alum: 'stock_levels',
  us_electricity_price: 'us_electricity_price',
  fed_funds_rate: 'fed_funds_rate',
  copper_price: 'copper_price',
  lead_price: 'lead_price'
};
import { fetchRegressorPredictions, fetchRegressorData } from '../utils/api';

const REGRESSOR_CONFIG = {
  // precio_alum_global: {
  //   name: 'Precio Global del Aluminio',
  //   description: 'Cotización LME (USD/tonelada) – termómetro mundial de oferta y demanda',
  //   icon: BarChart3,
  //   unit: 'USD/MT',
  //   color: '#3b82f6',
  //   impact: 'Cada 100 USD que sube la LME se reflejan en ≈ 95 USD de alza en nuestro precio local (elasticidad β≈0.95)',
  //   url: 'https://www.fastmarkets.com',
  //   source: 'Fastmarkets Feb 2025',
  //   businessInsight: 'Nuestro precio interno sigue casi uno a uno al rally global; los movimientos suelen mantenerse 2–4 semanas',
  //   strategicImplication: 'Vigilar valor en percentil 25 histórico para programar compras automáticas'
  // },

  inflacion: {
    name: 'Inflación México',
    description: 'Tasa de inflación mensual (INEGI, % interanual)',
    icon: TrendingUp,
    unit: '%',
    color: '#ef4444',
    impact: 'Cada punto porcentual extra de inflación eleva el costo en aproximadamente 12 USD/t con un rezago de 2–3 meses',
    url: 'https://www.inegi.org.mx/temas/inpc/',
    source: 'INEGI',
    businessInsight: 'La inflación alta presiona los costos de insumos y reduce la demanda de proyectos de construcción',
    strategicImplication: 'Si la inflación supera 5 %, conviene adelantar compras y planificar ajustes de precio'
  },

  USD: {
    name: 'Tipo de Cambio USD/MXN',
    description: 'Paridad peso–dólar (fix Banxico)',
    icon: DollarSign,
    unit: 'MXN/USD',
    color: '#10b981',
    impact: 'Cada 1 MXN/USD adicional eleva el costo local en ≈ 135 USD/t (a precios LME actuales)',
    url: 'https://mx.investing.com/currencies/usd-mxn',
    source: 'Investing.com Jun 2025',
    businessInsight: 'Peso débil aumenta el costo de materia prima; peso fuerte favorece adquisición de insumos',
    strategicImplication: 'Entre 16–17 MXN/USD es ventana óptima de compra; arriba de 18 MXN/USD conviene adelantar inventarios'
  },

  petroleo: {
    name: 'Precio del Petróleo',
    description: 'Brent spot (USD/barril)',
    icon: Fuel,
    unit: 'USD/Bbl',
    color: '#f59e0b',
    impact: 'Cada 10 USD adicionales por barril añaden ≈ 7 USD/t al cash-cost (energía≈35 % del COGS)',
    url: 'https://www.investing.com/commodities/brent-oil',
    source: 'ResearchGate 2025',
    businessInsight: 'La energía representa un tercio del costo de fundición; los shocks se trasladan en 1–2 meses',
    strategicImplication: 'Por encima de 85 USD/bbl, renegociar contratos de energía para proteger márgenes'
  },

  stock_alum: {
    name: 'Inventarios LME',
    description: 'Existencias en almacenes LME (toneladas)',
    icon: Building2,
    unit: 'MT',
    color: '#8b5cf6',
    impact: 'Con inventarios < 0.8 M t, la presión alcista se intensifica; una caída de 100 kt suele sumar ≈ 45 USD/t al precio spot',
    url: 'https://www.lme.com/en/metals/non-ferrous/lme-aluminium',
    source: 'Reuters Jun 2025',
    businessInsight: 'La métrica de “cancelled warrants” señala metal que sale del mercado',
    strategicImplication: 'Si los inventarios se mantienen < 0.8 M t por más de tres días, activar compras forward'
  },

  us_electricity_price: {
    name: 'Precio Electricidad EUA',
    description: 'Tarifa industrial promedio (¢/kWh)',
    icon: Zap,
    unit: '¢/kWh',
    color: '#06b6d4',
    impact: 'Cuando el diferencial EUA–MX supera ≈ 2 ¢/kWh, México y Canadá ganan ventaja competitiva (energía ≈ 13–16 kWh/kg)',
    url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a',
    source: 'EIA Apr 2025',
    businessInsight: 'La fundición consume 13–16 kWh/kg; tarifas altas en EE UU pueden desplazar producción a NAFTA',
    strategicImplication: 'Vigilar spread EUA–MX para optimizar compras y contratos de energía'
  },

  fed_funds_rate: {
    name: 'Tasa Fed',
    description: 'Federal Funds Target Rate (%)',
    icon: TrendingDown,
    unit: '%',
    color: '#ec4899',
    impact: 'Cuando la tasa real supera 2 %, suele anticipar una caída de ≈ 5 % anual en precios de metales con rezago de 6–9 meses',
    url: 'https://www.federalreserve.gov/monetarypolicy/openmarket.htm',
    source: 'FOMC Jun 18 2025',
    businessInsight: 'Tasas elevadas enfrían la inversión en infraestructura y sector automotriz',
    strategicImplication: 'En entornos de tasas altas, conviene cubrir inventarios y buscar hedges; con tasas bajas, impulsar ventas'
  },

  precio_cobre_lme: {
    name: 'Precio Global del Cobre',
    description: 'Cotización LME (USD/tonelada) – termómetro mundial de oferta y demanda',
    icon: BarChart3,
    unit: 'USD/MT',
    color: '#b87333',
    impact: 'Cada 100 USD que sube la LME se reflejan en 100 USD en nuestro precio local (elasticidad β≈1.0), salvo variaciones del premium',
    url: 'https://www.lme.com/en/metals/non-ferrous/lme-copper',
    source: 'Fastmarkets Apr 2025',
    businessInsight: 'El precio local sigue casi 1:1 al rally LME; cualquier backwardation agudo puede alterar el pass-through',
    strategicImplication: 'Monitorear el premium de cátodos y activar compras cuando la LME caiga a percentiles bajos'
  },

  precio_plomo_lme: {
    name: 'Precio Global del Plomo',
    description: 'Cotización LME (USD/tonelada) – referencia mundial de oferta y demanda de plomo',
    icon: BarChart3,
    unit: 'USD/MT',
    color: '#a9a9a9',
    impact: 'Cada 100 USD de aumento en la LME se traducen en ≈ 100 USD en nuestro precio local (elasticidad β≈1.0)',
    url: 'https://www.lme.com/en/metals/non-ferrous/lme-lead',
    source: 'Westmetall Jun 2025',
    businessInsight: 'El precio local sigue casi 1:1 al rally global; cualquier dislocación del premium puede alterar el pass-through',
    strategicImplication: 'Monitorear variaciones en freight y aranceles; activar compras cuando la LME caiga a percentiles bajos'
  }
};



export default function EconomicDriversCarousel({ isOpen, onClose, forecastHorizon = 7 }) {
  const [currentRegressorIndex, setCurrentRegressorIndex] = useState(0);
  const [regressorPredictions, setRegressorPredictions] = useState(null);
  const [regressorHistorical, setRegressorHistorical] = useState(null);
  const [loading, setLoading] = useState(false);

  const allRegressors = Object.keys(REGRESSOR_CONFIG);
  const regressors = regressorHistorical?.regressor_data
  ? allRegressors.filter(key => Array.isArray(regressorHistorical.regressor_data[key]) && regressorHistorical.regressor_data[key].some(item => item.value != null))
  : allRegressors;

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
        fetchRegressorData(forecastHorizon) // Last 30 days for context
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

        // Gather historical series for current regressor
    const series = regressorHistorical?.regressor_data?.[currentRegressor] || [];
    const historical = series.filter(item => item.value != null).slice(-10);
    const predicted = regressorPredictions?.regressor_predictions?.[currentRegressor]
      ? regressorPredictions.regressor_predictions[currentRegressor].slice(0, forecastHorizon)
      : [];
    

    const predictedRegressorData = regressorPredictions?.regressor_predictions?.[currentRegressor];

    

    
    

    // Combine historical and predicted data with error handling
    const historicalData = historical.map(item => {
      try {
        return {
          date: item.date,
          value: item.value,
          type: 'historical'
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);

    const predictedData = predicted.map(item => {
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
    console.log('regressorPredictions', regressorPredictions);
    console.log('currentRegressor', currentRegressor);
    if (!regressorPredictions?.regressor_predictions?.[currentRegressor]) return null;
    const predictions = regressorPredictions.regressor_predictions[currentRegressor];
    console.log('predictions', predictions);
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
      case 'precio_cobre_lme':
      case 'precio_plomo_lme':
        return value.toFixed(2);
      default:
        return value.toFixed(2);
    }
  };

  const getStrategicImplications = () => {
    const implications = {
      // precio_alum_global: {
      //   businessImpact: "Indicador maestro del mercado. Aumentos del 10% típicamente se traducen en incrementos de 8-12% en precios locales con desfase de 2-4 semanas.",
      //   riskAssessment: "Volatilidad alta (>5% semanal) indica incertidumbre en cadena de suministro. Monitorear eventos geopolíticos en principales productores (China, Rusia).",
      //   recommendations: "Establecer bandas de precio para compras automáticas. Considerar contratos de suministro a largo plazo cuando el precio esté en percentil 25 histórico.",
      //   marketIntelligence: "Correlación 0.85 con aluminio mexicano. Mercados asiáticos dominan formación de precios. Vigilar capacidad de fundición china."
      // },
        inflacion: {
          businessImpact: "Inflación alta (>4 %) encarece materiales e insumos y frena la inversión en construcción: en abril 2025, la inflación de materiales fue 4.35 % y la inversión en construcción cayó 5.2 % interanual (≈1.2 % de reducción por p.p.)",
          riskAssessment: "Riesgo medio-alto: si la inflación anual supera el rango meta de Banxico (2–4 %) por varios meses, pueden subir tasas de interés y desacelerarse la economía.",
          recommendations: "Indexar cláusulas de ajuste por inflación en contratos de suministro cuando la inflación anual supere 5 % (OECD). Acelerar compras e inventarios si la inflación muestra tres meses consecutivos de repunte.",
          marketIntelligence: "Banxico suele ajustar su tasa principal uno o dos meses después de que la inflación anual se sitúe fuera del rango meta, y la construcción es uno de los sectores más expuestos al alza de precios de materiales.",
          sources: [
            "INEGI Apr 2025: inflación de materiales 4.35 % e inversión construcción –5.2 % interanual",
            "Banxico Jun 2025: inflación anual >4 % y rangos meta 2–4 %",
            "OECD 2024: recomendaciones de indexación de contratos",
            "Banxico policy lag: reacciona 1–2 meses tras desviaciones de meta"
          ]
        },
      
        USD: {
          businessImpact: "Una depreciación del peso de 18 a 20 MXN/USD encarece importaciones en ≈11 % (pass-through ≈1).",
          riskAssessment: "Alta volatilidad cambiaria incrementa incertidumbre en costos de importación. Monitorear diferencial de tasas México–EUA y flujos de capital.",
          recommendations: "Si el peso supera 21 MXN/USD, acelerar compras de importación; si baja de 19 MXN/USD, negociar mejores precios con proveedores.",
          marketIntelligence: "Las decisiones de la Fed y Banxico suelen mover al peso, impactando directamente el costo de insumos importados.",
          sources: [
            "Marshall–Lerner condition: pass-through total de depreciación al precio de importaciones",
            "TradingEconomics Jun 25 2025: USD/MXN 18.9191",
            "Monex Feb 2025: volatilidad diaria de USD/MXN cercana a 1 %",
            "Reuters Jun 18 2025: movimientos cambiarios tras decisión de la Fed"
          ]
        },
      
        petroleo: {
          businessImpact: "Alzas de Brent por encima de $80/bbl (caso Israel-Irán) añaden ≈7 USD/t al cash-cost, dado que la energía representa ~35 % del COGS.",
          riskAssessment: "Precios sostenidos >$90/bbl por más de seis meses pueden presionar márgenes significativamente (riesgo geopolítico persistente).",
          recommendations: "Coberturas energéticas cuando Brent supere su percentil 75 histórico (~85 USD/bbl). Evaluar proyectos de eficiencia energética continua.",
          marketIntelligence: "OPEC+ controla ~38 % de la producción global de crudo. Temporada de huracanes (Jun–Nov) aumenta volatilidad de suministros.",
          sources: [
            "Reuters Jun 2025: Brent sube a $81.40 tras tensiones geopolíticas",
            "EERE (US DOE): energía ≈35 % del costo en fundición de aluminio",
            "AASTocks Jun 2025: precios >$90 si la disrupción persiste",
            "TD Economics: percentil 75 Brent ≈85 USD/bbl",
            "NOAA: temporada de huracanes Jun–Nov, riesgo adicional"
          ]
        },
      
        stock_alum: {
          businessImpact: "Inventarios <1M MT indican mercado ajustado y presión alcista; niveles >1.5M MT sugieren sobreoferta y presión bajista.",
          riskAssessment: "La caída de inventarios durante más de tres meses consecutivos señala escasez potencial, y el control de hasta el 90 % por un solo actor aumenta riesgos logísticos.",
          recommendations: "Asegurar suministro cuando inventarios desciendan por debajo de 900K MT; diferir compras si superan 1.8M MT con tendencia al alza.",
          marketIntelligence: "China produce alrededor del 60 % del aluminio mundial; cambios en su política de exportaciones pueden agotar inventarios globales.",
          sources: [
            "Reuters Jun 2025: inventarios LME en 321,800 t, nivel más bajo desde 2022",
            "Reuters Feb 2025: hasta 90 % de inventarios controlados por una sola parte",
            "Reuters Jun 2013: inventarios LME alcanzan récord de 5.28M t",
            "Reuters May 2025: China produce ~60 % del aluminio mundial"
          ]
        },
      
        us_electricity_price: {
          businessImpact: "Electricidad cara en ciertos hubs de EE UU (>12 ¢/kWh) reduce márgenes y puede incentivar desplazar producción marginal a México/Canadá.",
          riskAssessment: "Precios energéticos volátiles incrementan incertidumbre en costos de productores norteamericanos; vigilar marcos regulatorios y políticas de tarifas.",
          recommendations: "Aprovechar arbitrajes cuando el diferencial EUA–México supere ≈2 ¢/kWh; considerar nearshoring de clientes y suministros ante spreads sostenidos.",
          marketIntelligence: "California y Texas presentan mayor volatilidad por mercados deregulado y alta integración renovable.",
          sources: [
            "EIA Apr 2025: industrial avg 8.21 ¢, commercial 13.09 ¢, residential 17.45 ¢",
            "Quickelectricity Jun 2025: Texas por debajo del promedio, California entre las más altas"
          ]
        },
      
        fed_funds_rate: {
          businessImpact: "Tasas de fondos federales >4 % suelen reducir la inversión en infraestructura en ≈10–15 % y encarecer el financiamiento corporativo.",
          riskAssessment: "Un ciclo prolongado de alzas y una curva de rendimientos invertida elevan el riesgo de recesión y caída de la demanda.",
          recommendations: "Aprovechar entornos de tasas bajas (<3 %) para reponer inventarios y ser conservador en expansiones cuando tasas >5 %.",
          marketIntelligence: "Los mercados descuentan movimientos de la Fed hasta 2–3 reuniones antes; comunicados y actas son claves para anticipar cambios.",
          sources: [
            "FOMC Jun 18 2025: Fed funds target rate 4.25–4.50 %",
            "Reuters Jun 18 2025: Fed mantiene tasa y mercados descuentan recortes",
            "Reuters May 7 2025: inflación subyacente 2.4 % → tasa real ≈2.1 %",
            "Bloomberg Jun 2025: curva de rendimientos invertida y alertas de recesión"
          ]
        },
      
        precio_cobre_lme: {
          businessImpact: "Un aumento de 100 USD/t en el precio LME se traslada en ≈100 USD/t a nuestro costo local (elasticidad β≈1.0).",
          riskAssessment: "Spread COMEX–LME elevado (>1 500 USD/t) y subidas bruscas de premium pueden desincronizar temporalmente el pass-through, generando volatilidad.",
          recommendations: "Monitorear premium de cátodos (10.5–11.5 ¢/lb) y activar compras forward si la LME cae por debajo de 9 500 USD/t o si el premium supera 11 ¢/lb.",
          marketIntelligence: "China consume >50 % del cobre global; cambios en su demanda o políticas arancelarias tienen impacto directo en los precios mundiales.",
          sources: [
            "LME Official: Copper Cash 3M a 9 944 USD/t",
            "Fastmarkets Apr 2025: premium cátodos 10.5–11.5 ¢/lb (≈231–254 USD/t)",
            "Reuters Mar 26 2025: COMEX–LME spread >1 570 USD/t",
            "Reuters Jun 6 2025: inventarios de cobre LME caen a ≈132 400 t",
            "Economic Times Jun 2025: China consume >50 % del cobre global"
          ]
        },
      
        precio_plomo_lme: {
          businessImpact: "El precio cash 3M de plomo en la LME se traslada casi 1:1 a nuestro costo local (elasticidad β≈1.0), dado que el premium logístico/arancelario varía poco.",
          riskAssessment: "Niveles de inventario de plomo en la LME pueden indicar sobreoferta o escasez, ejercitando presión en los precios.",
          recommendations: "Establecer coberturas forward cuando el precio de plomo en la LME caiga por debajo de umbrales críticos (p. ej. 1 900 USD/t); negociar premiums logísticos fijos para mitigar variaciones.",
          marketIntelligence: "El mercado de plomo reacciona a movimientos de grandes operadores y cambios en inventarios; conviene revisar informes semanales.",
          sources: [
            "Westmetall: metodología de referencia cash 3M y variaciones de inventarios",
            "Zamak: el precio de plomo se expresa como LME + premium logístico/arancelario",
            "Fastmarkets: metodología de premiums para plomo ingot warrant",
            "SMM Weekly Lead Review: rangos de cotización recientes"
          ]
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
