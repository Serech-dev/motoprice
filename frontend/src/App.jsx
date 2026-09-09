import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CounterQuoter } from './components/CounterQuoter';
import { FileUploader } from './components/FileUploader';
import { BatchSummaryCards } from './components/BatchSummaryCards';
import { PriceDiffTable } from './components/PriceDiffTable';
import { ProductCatalogView } from './components/ProductCatalogView';
import { SupplierManager } from './components/SupplierManager';
import { MarginSimulatorModal } from './components/MarginSimulatorModal';
import { api } from './services/api';
import { CheckCircle2, History, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('quoter'); // 'quoter', 'updater', 'catalog', 'suppliers', 'simulator'
  const [suppliers, setSuppliers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [recentBatches, setRecentBatches] = useState([]);
  const [successToast, setSuccessToast] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Load initial app data
  const loadInitialData = async () => {
    try {
      const [supList, setBundle, batchList] = await Promise.all([
        api.getSuppliers(),
        api.getSettings(),
        api.listBatches()
      ]);
      setSuppliers(supList);
      setSettings(setBundle);
      setRecentBatches(batchList);

      // If batches exist and none active, load the latest batch
      if (batchList.length > 0 && !activeBatch) {
        const latestDetail = await api.getBatch(batchList[0].id);
        setActiveBatch(latestDetail);
      }
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleUpdateSettings = async (newSettings) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  const handleBatchCreated = (batch) => {
    setActiveBatch(batch);
    setActiveTab('updater');
    setSuccessToast(`¡Lista procesada con éxito! ${batch.matched_items} repuestos cruzados.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleApplySuccess = (response) => {
    setSuccessToast(response.message || 'Precios actualizados en catálogo.');
    setTimeout(() => setSuccessToast(null), 6000);
    // Refresh batch details
    if (activeBatch) {
      api.getBatch(activeBatch.id).then(setActiveBatch);
    }
  };

  const handleSelectRecentBatch = async (batchId) => {
    try {
      const batchDetail = await api.getBatch(batchId);
      setActiveBatch(batchDetail);
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Iniciando AutoPrice Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Success Alert Toast */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-sm">{successToast}</span>
            </div>
            <button 
              onClick={() => setSuccessToast(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-1 rounded"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Tab 0: Fast Counter & WhatsApp Quoter */}
        {activeTab === 'quoter' && (
          <CounterQuoter />
        )}

        {/* Tab 1: Price Updates / Ingestion / Diff View */}
        {activeTab === 'updater' && (
          <div className="space-y-6">
            {/* Uploader Box */}
            <FileUploader
              suppliers={suppliers}
              settings={settings}
              onBatchCreated={handleBatchCreated}
            />

            {/* If an active batch exists, show KPI Cards and Diff Table */}
            {activeBatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Resumen de Comparativa & Control de Seguridad
                  </h3>

                  {/* Batch Selector if multiple batches exist */}
                  {recentBatches.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">Historial:</span>
                      <select
                        value={activeBatch.id}
                        onChange={(e) => handleSelectRecentBatch(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-xs"
                      >
                        {recentBatches.map(b => (
                          <option key={b.id} value={b.id}>
                            Lote #{b.id} - {b.filename} ({b.status === 'applied' ? 'Aplicado' : 'Pendiente'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <BatchSummaryCards batch={activeBatch} />

                <PriceDiffTable
                  batch={activeBatch}
                  onBatchUpdated={setActiveBatch}
                  onApplySuccess={handleApplySuccess}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Central Product Catalog */}
        {activeTab === 'catalog' && (
          <ProductCatalogView />
        )}

        {/* Tab 3: Suppliers & Discount Chains */}
        {activeTab === 'suppliers' && (
          <SupplierManager 
            suppliers={suppliers} 
            onSuppliersUpdated={setSuppliers} 
          />
        )}

        {/* Tab 4: Live Margin Simulator */}
        {activeTab === 'simulator' && (
          <MarginSimulatorModal
            defaultExchangeRate={settings?.exchange_rate_usd_ars || 1180}
            defaultVat={settings?.default_vat_pct || 21}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AutoPrice © 2026 — Motor de Precios para Casas de Repuestos Automotor</span>
          <span className="font-mono text-[11px] text-slate-600">
            FastAPI + React • Cruce OEM/Aftermarket • Soporte Multimoneda
          </span>
        </div>
      </footer>
    </div>
  );
}
