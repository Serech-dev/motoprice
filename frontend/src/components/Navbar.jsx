import React, { useState } from 'react';
import { 
  Zap, 
  DollarSign, 
  UploadCloud, 
  Package, 
  Users, 
  Calculator, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';

export function Navbar({ activeTab, setActiveTab, settings, onUpdateSettings }) {
  const [isEditingFx, setIsEditingFx] = useState(false);
  const [fxInput, setFxInput] = useState(settings?.exchange_rate_usd_ars || 1180);

  const handleSaveFx = async () => {
    try {
      await onUpdateSettings({ exchange_rate_usd_ars: parseFloat(fxInput) });
      setIsEditingFx(false);
    } catch (e) {
      alert('Error actualizando tipo de cambio');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight flex items-center gap-2">
              <span>MotoPrice</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Repuestos de Motos
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Cotizador Rápido & Motor de Listas de Distribuidores</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setActiveTab('quoter')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'quoter'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-amber-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden md:inline">Cotizador Mostrador</span>
            <span className="md:hidden">Cotizador</span>
          </button>

          <button
            onClick={() => setActiveTab('updater')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'updater'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden md:inline">Actualizador de Listas</span>
            <span className="md:hidden">Listas</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden md:inline">Catálogo</span>
            <span className="md:hidden">Catálogo</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'suppliers'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Proveedores</span>
            <span className="md:hidden">Proveedores</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden md:inline">Simulador</span>
            <span className="md:hidden">Simulador</span>
          </button>
        </nav>

        {/* Right side: USD Exchange Rate Ticker */}
        <div className="flex items-center gap-2">
          {isEditingFx ? (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
              <span className="text-xs text-slate-400 pl-1">USD = $</span>
              <input
                type="number"
                value={fxInput}
                onChange={(e) => setFxInput(e.target.value)}
                className="w-20 px-1 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleSaveFx}
                className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                title="Guardar tipo de cambio"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setFxInput(settings?.exchange_rate_usd_ars || 1180);
                setIsEditingFx(true);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 transition text-xs font-mono"
              title="Click para cambiar cotización del Dólar"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-sans">USD:</span>
              <span className="font-bold">{formatCurrencyARS(settings?.exchange_rate_usd_ars || 1180)}</span>
              <RefreshCw className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
