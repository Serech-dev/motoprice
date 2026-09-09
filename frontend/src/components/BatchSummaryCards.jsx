import React from 'react';
import { 
  FileCheck2, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export function BatchSummaryCards({ batch }) {
  if (!batch) return null;

  // Compute average percentage change for matched items
  const matchedItems = batch.items?.filter(it => it.product_id) || [];
  const avgChange = matchedItems.length > 0
    ? matchedItems.reduce((acc, curr) => acc + curr.pct_change, 0) / matchedItems.length
    : 0;

  const flaggedCount = batch.items?.filter(it => it.is_flagged).length || 0;
  const approvedCount = batch.items?.filter(it => it.is_approved && it.product_id).length || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      
      {/* Total Items */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Lista</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white font-mono">{batch.total_items}</span>
          <span className="text-xs text-slate-500">artículos</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          Archivo: {batch.filename}
        </div>
      </div>

      {/* Matched Items */}
      <div className="bg-slate-900 border border-emerald-950/60 rounded-xl p-4 shadow-sm bg-gradient-to-br from-slate-900 to-emerald-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Coincidentes</span>
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-300 font-mono">{batch.matched_items}</span>
          <span className="text-xs text-emerald-500/80">
            ({((batch.matched_items / (batch.total_items || 1)) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Cruces OEM / Marca detectados
        </div>
      </div>

      {/* Unmatched Items */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sin Match</span>
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-300 font-mono">{batch.unmatched_items}</span>
          <span className="text-xs text-slate-500">nuevos</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          No están en el catálogo
        </div>
      </div>

      {/* Average Price Inflation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Variación Promedio</span>
          <TrendingUp className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-black font-mono ${avgChange >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatPercent(avgChange)}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Impacto en costo de reposición
        </div>
      </div>

      {/* Safety Alerts / Spikes */}
      <div className={`col-span-2 md:col-span-1 rounded-xl p-4 shadow-sm border ${
        flaggedCount > 0 
          ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' 
          : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${flaggedCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
            Alertas Críticas
          </span>
          <AlertTriangle className={`w-4 h-4 ${flaggedCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-black font-mono ${flaggedCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {flaggedCount}
          </span>
          <span className="text-xs text-slate-400">aumentos {'>'} 30%</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {flaggedCount > 0 ? 'Requieren revisión manual' : 'Sin aumentos anormales'}
        </div>
      </div>

    </div>
  );
}

