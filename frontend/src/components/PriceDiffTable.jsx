import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  X, 
  Search, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Edit2,
  Filter
} from 'lucide-react';
import { formatCurrencyARS, formatPercent } from '../utils/formatters';
import { api } from '../services/api';

export function PriceDiffTable({ batch, onBatchUpdated, onApplySuccess }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'flagged', 'unmatched', 'drops', 'approved'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!batch || !batch.items) return [];

    return batch.items.filter(item => {
      // 1. Filter mode
      if (filterMode === 'flagged' && !item.is_flagged) return false;
      if (filterMode === 'unmatched' && item.product_id) return false;
      if (filterMode === 'drops' && item.pct_change >= 0) return false;
      if (filterMode === 'approved' && (!item.is_approved || !item.product_id)) return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = (item.supplier_code || '').toLowerCase();
        const desc = (item.supplier_description || '').toLowerCase();
        const prodName = (item.matched_product_name || '').toLowerCase();
        const prodCode = (item.matched_product_internal_code || '').toLowerCase();
        const oem = (item.matched_product_oem || '').toLowerCase();
        const brand = (item.supplier_brand || '').toLowerCase();

        return code.includes(q) || desc.includes(q) || prodName.includes(q) || prodCode.includes(q) || oem.includes(q) || brand.includes(q);
      }

      return true;
    });
  }, [batch, filterMode, searchQuery]);

  // Counts for tab badges
  const counts = useMemo(() => {
    if (!batch?.items) return { all: 0, flagged: 0, unmatched: 0, drops: 0, approved: 0 };
    return {
      all: batch.items.length,
      flagged: batch.items.filter(it => it.is_flagged).length,
      unmatched: batch.items.filter(it => !it.product_id).length,
      drops: batch.items.filter(it => it.pct_change < 0).length,
      approved: batch.items.filter(it => it.is_approved && it.product_id).length
    };
  }, [batch]);

  // Toggle item approval
  const handleToggleApprove = async (item) => {
    try {
      const updated = await api.updateBatchItem(batch.id, item.id, {
        is_approved: !item.is_approved
      });
      // Update local state
      const updatedItems = batch.items.map(it => it.id === item.id ? updated : it);
      onBatchUpdated({ ...batch, items: updatedItems });
    } catch (e) {
      alert('Error al actualizar estado del artículo');
    }
  };

  // Bulk toggle visible items
  const handleBulkToggle = async (approve) => {
    try {
      const itemsToUpdate = filteredItems.filter(it => it.product_id && it.is_approved !== approve);
      for (const it of itemsToUpdate) {
        await api.updateBatchItem(batch.id, it.id, { is_approved: approve });
      }
      const refreshed = await api.getBatch(batch.id);
      onBatchUpdated(refreshed);
    } catch (e) {
      alert('Error al actualizar artículos');
    }
  };

  // Save manual override sale price
  const handleSavePriceOverride = async (item) => {
    const priceNum = parseFloat(editPriceVal);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Ingrese un precio válido');
      return;
    }
    try {
      const updated = await api.updateBatchItem(batch.id, item.id, {
        override_sale_price: priceNum,
        is_approved: true
      });
      const updatedItems = batch.items.map(it => it.id === item.id ? updated : it);
      onBatchUpdated({ ...batch, items: updatedItems });
      setEditingItemId(null);
    } catch (e) {
      alert('Error al guardar precio personalizado');
    }
  };

  // Execute atomic apply
  const handleApplyBatch = async () => {
    setApplying(true);
    try {
      const res = await api.applyBatch(batch.id);
      setApplyModalOpen(false);
      onApplySuccess(res);
    } catch (err) {
      alert(err.message || 'Error al aplicar actualización');
    } finally {
      setApplying(false);
    }
  };

  if (!batch) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
      
      {/* Top Controls: Filter Tabs & Live Search */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterMode === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Todos los Cambios</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] font-mono">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('flagged')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterMode === 'flagged'
                ? 'bg-rose-500 text-slate-950 font-bold'
                : counts.flagged > 0 
                  ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40' 
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertas Spikes {'>'} 30%</span>
            <span className={`px-1.5 py-0.2 rounded text-[11px] font-mono ${filterMode === 'flagged' ? 'bg-rose-900 text-white' : 'bg-rose-500/20 text-rose-300'}`}>
              {counts.flagged}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('unmatched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterMode === 'unmatched'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Sin Match (Nuevos)</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] font-mono">
              {counts.unmatched}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('drops')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterMode === 'drops'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Caídas de Precio</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] font-mono">
              {counts.drops}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              filterMode === 'approved'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Solo Aprobados</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] font-mono">
              {counts.approved}
            </span>
          </button>
        </div>

        {/* Right Search Input & Bulk Actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar código, OEM, marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleBulkToggle(true)}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition whitespace-nowrap"
              title="Aprobar todos los items visibles"
            >
              Aprobar Visibles
            </button>
            <button
              onClick={() => handleBulkToggle(false)}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition whitespace-nowrap"
              title="Desmarcar todos los items visibles"
            >
              Desmarcar
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Diff Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center">OK</th>
              <th className="py-3 px-3">Código Proveedor / Cruce</th>
              <th className="py-3 px-3">Repuesto en Catálogo</th>
              <th className="py-3 px-3 text-right">Precio Lista</th>
              <th className="py-3 px-3 text-right">Costo Ant. → Nuevo</th>
              <th className="py-3 px-3 text-right">Precio Venta Propuesto</th>
              <th className="py-3 px-3 text-center">Variación %</th>
              <th className="py-3 px-3 text-center">Estado / Alerta</th>
              <th className="py-3 px-3 text-center w-16">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  No se encontraron repuestos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isMatched = Boolean(item.product_id);
                const hasOverride = item.override_sale_price !== null && item.override_sale_price !== undefined;
                const activeSalePrice = hasOverride ? item.override_sale_price : item.proposed_sale_price;

                return (
                  <tr 
                    key={item.id}
                    className={`transition-colors ${
                      item.is_flagged 
                        ? 'bg-rose-950/20 hover:bg-rose-950/30' 
                        : !isMatched 
                          ? 'bg-slate-950/30 hover:bg-slate-950/50' 
                          : item.is_approved 
                            ? 'hover:bg-slate-800/40' 
                            : 'opacity-60 bg-slate-950/50'
                    }`}
                  >
                    {/* Checkbox Approval */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.is_approved}
                        disabled={!isMatched}
                        onChange={() => handleToggleApprove(item)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer disabled:opacity-30"
                      />
                    </td>

                    {/* Supplier Code & Match Badge */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white flex items-center gap-1.5">
                        <span>{item.supplier_code}</span>
                        {item.matched_by === 'oem_code' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-sans font-semibold">
                            OEM
                          </span>
                        )}
                        {item.matched_by === 'alternate_code' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-sans font-semibold">
                            Cruce Marca
                          </span>
                        )}
                        {item.matched_by === 'internal_code' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-semibold">
                            Interno
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {item.supplier_description}
                      </div>
                    </td>

                    {/* Matched Product in Store Catalog */}
                    <td className="py-3 px-3">
                      {isMatched ? (
                        <div>
                          <div className="font-medium text-slate-100 flex items-center gap-2">
                            <span>{item.matched_product_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>SKU: {item.matched_product_internal_code}</span>
                            {item.matched_product_oem && (
                              <span className="text-slate-500">| OEM: {item.matched_product_oem}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-400 font-medium">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px]">
                            SIN COINCIDENCIA EN CATÁLOGO
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Supplier List Price */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-400">
                      {formatCurrencyARS(item.list_price)}
                    </td>

                    {/* Old Cost vs New Cost */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isMatched ? (
                        <div>
                          <span className="text-slate-400 line-through text-[11px] mr-1.5">
                            {formatCurrencyARS(item.old_cost)}
                          </span>
                          <span className="font-bold text-white">
                            {formatCurrencyARS(item.new_cost)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-300">
                          {formatCurrencyARS(item.new_cost)}
                        </span>
                      )}
                    </td>

                    {/* Old Sale Price vs Proposed Sale Price (Inline editable) */}
                    <td className="py-3 px-3 text-right font-mono">
                      {editingItemId === item.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={editPriceVal}
                            onChange={(e) => setEditPriceVal(e.target.value)}
                            className="w-24 px-1.5 py-0.5 bg-slate-950 border border-amber-500 rounded text-right text-amber-300 font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePriceOverride(item)}
                            className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group">
                          {isMatched && (
                            <span className="text-slate-400 line-through text-[11px]">
                              {formatCurrencyARS(item.old_sale_price)}
                            </span>
                          )}
                          <span className={`font-bold ${hasOverride ? 'text-amber-400 underline decoration-dotted' : 'text-emerald-400'}`}>
                            {formatCurrencyARS(activeSalePrice)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditPriceVal(activeSalePrice.toString());
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-300 transition p-0.5"
                            title="Editar precio de venta manualmente"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Variation % Badge */}
                    <td className="py-3 px-3 text-center">
                      {isMatched ? (
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          item.is_flagged
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : item.pct_change > 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.pct_change < 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.pct_change > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : item.pct_change < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : null}
                          {formatPercent(item.pct_change)}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Safety Status / Reason */}
                    <td className="py-3 px-3 text-center">
                      {item.is_flagged ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-400 font-semibold text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>SPIKE {'>'} 30%</span>
                        </div>
                      ) : !isMatched ? (
                        <span className="text-slate-500 text-[10px]">Nuevo SKU</span>
                      ) : item.is_approved ? (
                        <div className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aprobado</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Desmarcado</span>
                      )}
                    </td>

                    {/* Toggle Button */}
                    <td className="py-3 px-3 text-center">
                      {isMatched && (
                        <button
                          onClick={() => handleToggleApprove(item)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                            item.is_approved
                              ? 'bg-emerald-950/40 text-emerald-400 hover:bg-rose-950/40 hover:text-rose-400'
                              : 'bg-slate-800 text-slate-400 hover:bg-emerald-950/40 hover:text-emerald-400'
                          }`}
                          title={item.is_approved ? 'Desaprobar item' : 'Aprobar item'}
                        >
                          {item.is_approved ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Sticky Action Toolbar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="font-semibold">
            {counts.approved} de {counts.all}
          </span>
          <span className="text-slate-400">
            repuestos marcados para actualizar en el catálogo.
          </span>
          {counts.flagged > 0 && (
            <span className="text-rose-400 font-semibold flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              {counts.flagged} con alerta
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          
          {/* Export to Excel for POS */}
          <a
            href={api.getExportUrl(batch.id, 'xlsx')}
            download
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar para POS (Excel)</span>
          </a>

          {/* 1-Click Apply to Store Catalog */}
          <button
            onClick={() => setApplyModalOpen(true)}
            disabled={counts.approved === 0 || batch.status === 'applied'}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {batch.status === 'applied' 
                ? 'Lote Ya Aplicado' 
                : `Aplicar ${counts.approved} Precios al Catálogo`}
            </span>
          </button>

        </div>

      </div>

      {/* Confirmation Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">
                ¿Confirmar actualización masiva de precios?
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Se actualizarán los costos de reposición y los precios de venta al público de 
                <strong className="text-amber-400 mx-1">{counts.approved} repuestos</strong> 
                en la base de datos central de la casa de repuestos.
              </p>
            </div>

            {counts.flagged > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Hay {counts.flagged} artículos con aumentos superiores al 30%. Verifique que hayan sido aprobados conscientemente.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                disabled={applying}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleApplyBatch}
                disabled={applying}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-2"
              >
                {applying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Aplicando en Base de Datos...</span>
                  </>
                ) : (
                  <span>Confirmar & Actualizar Catálogo</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

