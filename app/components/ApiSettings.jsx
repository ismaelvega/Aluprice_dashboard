'use client';

import { useState } from 'react';
import { Settings, Server, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { fetchHealthCheck } from '../utils/api';

export default function ApiSettings({ onSettingsUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  const testConnection = async () => {
    setTesting(true);
    try {
      // Temporarily set the API URL for testing
      const originalUrl = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = apiUrl;
      
      await fetchHealthCheck();
      setConnectionStatus('connected');
      if (onSettingsUpdate) {
        onSettingsUpdate({ apiUrl, status: 'connected' });
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Connection test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('aluprice_api_url', apiUrl);
    testConnection();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Settings className="h-4 w-4" />
        Configuración API
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de API
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de API ALUPRICE
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://tu-api-url.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Dejar vacío para usar datos de demostración
                </p>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <Server className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                <div className="flex items-center gap-1">
                  {testing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-blue-600">Probando...</span>
                    </>
                  ) : connectionStatus === 'connected' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Conectado</span>
                    </>
                  ) : connectionStatus === 'error' ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Falló</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Desconocido</span>
                  )}
                </div>
              </div>

              {/* Demo Mode Notice */}
              {!apiUrl && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Modo Demostración
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Usando datos de demostración. Conecte a su API ALUPRICE para datos en tiempo real.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={testConnection}
                disabled={testing || !apiUrl}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
