import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, DollarSign, Percent, RefreshCw } from 'lucide-react';
import { formatCurrencyARS, formatCurrencyUSD } from '../utils/formatters';

export function MarginSimulatorModal({ defaultExchangeRate = 1180, defaultVat = 21 }) {
  const [listPrice, setListPrice] = useState(10000);
  const [currency, setCurrency] = useState('ARS'); // 'ARS' or 'USD'
  const [discount1, setDiscount1] = useState(25);
  const [discount2, setDiscount2] = useState(5);
  const [vatIncluded, setVatIncluded] = useState(false);
  const [vatRate, setVatRate] = useState(defaultVat);
  const [exchangeRate, setExchangeRate] = useState(defaultExchangeRate);
  const [marginPct, setMarginPct] = useState(40);
  const [roundingRule, setRoundingRule] = useState('nearest_100');

  // Live calculation
  const calculations = useMemo(() => {
    const list = parseFloat(listPrice) || 0;
    const d1 = parseFloat(discount1) || 0;
    const d2 = parseFloat(discount2) || 0;
    const vat = parseFloat(vatRate) || 21;
    const fx = parseFloat(exchangeRate) || 1;
    const margin = parseFloat(marginPct) || 0;

    // Step 1: Discount chain
    let discounted = list * (1 - d1 / 100);
    discounted = discounted * (1 - d2 / 100);

    // Step 2: VAT
    let netCostOrigin = vatIncluded ? discounted : discounted * (1 + vat / 100);

    // Step 3: Currency conversion to ARS
    let netCostArs = currency === 'USD' ? netCostOrigin * fx : netCostOrigin;

    // Step 4: Sale price markup
    let rawSalePrice = netCostArs * (1 + margin / 100);

    // Step 5: Rounding
    let finalSalePrice = rawSalePrice;
    if (roundingRule === 'nearest_10') {
      finalSalePrice = Math.round(rawSalePrice / 10) * 10;
    } else if (roundingRule === 'nearest_50') {
      finalSalePrice = Math.round(rawSalePrice / 50) * 50;
    } else if (roundingRule === 'nearest_100') {
      finalSalePrice = Math.round(rawSalePrice / 100) * 100;
    } else if (roundingRule === 'nearest_500') {
      finalSalePrice = Math.round(rawSalePrice / 500) * 500;
    } else if (roundingRule === 'psychological_990') {
      const base = Math.ceil(rawSalePrice / 1000) * 1000;
      finalSalePrice = (base - 10) >= rawSalePrice ? base - 10 : base + 990;
    }

    const profitAmountArs = finalSalePrice - netCostArs;
    const realMarginPct = netCostArs > 0 ? (profitAmountArs / netCostArs) * 100 : 0;
    const marginOnSalePct = finalSalePrice > 0 ? (profitAmountArs / finalSalePrice) * 100 : 0;

    return {
      discounted,
      netCostOrigin,
      netCostArs,
      rawSalePrice,
      finalSalePrice,
      profitAmountArs,
      realMarginPct,
      marginOnSalePct
    };
  }, [listPrice, currency, discount1, discount2, vatIncluded, vatRate, exchangeRate, marginPct, roundingRule]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Simulador Dinámico de Rentabilidad y Precios</h2>
          <p className="text-xs text-slate-400">
            Experimente con cadenas de descuentos ($d_1 + d_2$), IVA, tipo de cambio USD y reglas de redondeo comercial.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        
        {/* Input Parameters */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Parámetros del Proveedor
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-300 block mb-1">Precio de Lista de Catálogo</label>
              <input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="ARS">ARS ($)</option>
                <option value="USD">USD (US$)</option>
              </select>
            </div>
          </div>

          {/* Discounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Descuento 1 (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={discount1}
                  onChange={(e) => setDiscount1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Descuento 2 adicional (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={discount2}
                  onChange={(e) => setDiscount2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
              </div>
            </div>
          </div>

          {/* VAT & Exchange Rate */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vatIncluded}
                  onChange={(e) => setVatIncluded(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Precio de lista ya incluye IVA</span>
              </label>

              {!vatIncluded && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Tasa IVA:</span>
                  <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-white font-mono"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              )}
            </div>

            {currency === 'USD' && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Cotización Dólar (ARS/USD):</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="w-24 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-right text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
            Estrategia de Venta al Público
          </h3>

          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300">Margen de Ganancia (Markup sobre Costo)</span>
              <span className="font-mono font-bold text-amber-400">{marginPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={marginPct}
              onChange={(e) => setMarginPct(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Regla de Redondeo</label>
            <select
              value={roundingRule}
              onChange={(e) => setRoundingRule(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="nearest_10">Redondear a los $10 más cercanos</option>
              <option value="nearest_50">Redondear a los $50 más cercanos</option>
              <option value="nearest_100">Redondear a los $100 más cercanos (Estándar)</option>
              <option value="nearest_500">Redondear a los $500 más cercanos</option>
              <option value="psychological_990">Terminación psicológica $990</option>
              <option value="none">Sin redondeo (con centavos)</option>
            </select>
          </div>

        </div>

        {/* Live Calculation Breakdown Result */}
        <div className="flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-2xl p-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Desglose en Cascada de Costo y Venta
            </h3>

            <div className="space-y-2 text-xs">
              
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Precio Lista Distribuidor:</span>
                <span className="font-mono text-slate-200">
                  {currency === 'USD' ? formatCurrencyUSD(listPrice) : formatCurrencyARS(listPrice)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">
                  Descuentos ({discount1}% + {discount2}%):
                </span>
                <span className="font-mono text-amber-400">
                  - {currency === 'USD' ? formatCurrencyUSD(listPrice - calculations.discounted) : formatCurrencyARS(listPrice - calculations.discounted)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">IVA ({vatIncluded ? 'Incluido' : `+${vatRate}%`}):</span>
                <span className="font-mono text-slate-300">
                  {currency === 'USD' ? formatCurrencyUSD(calculations.netCostOrigin) : formatCurrencyARS(calculations.netCostOrigin)}
                </span>
              </div>

              {currency === 'USD' && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/80 bg-emerald-950/20 px-2 rounded">
                  <span className="text-emerald-400">Conversión a Pesos (x ${exchangeRate}):</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {formatCurrencyARS(calculations.netCostArs)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-slate-700 bg-slate-900/60 px-2 rounded">
                <span className="font-bold text-slate-100">Costo Neto Final de Reposición:</span>
                <span className="font-mono font-bold text-lg text-white">
                  {formatCurrencyARS(calculations.netCostArs)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Ganancia Bruta en Pesos:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  + {formatCurrencyARS(calculations.profitAmountArs)}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Margen sobre Venta Real:</span>
                <span className="font-mono text-slate-300">
                  {calculations.marginOnSalePct.toFixed(1)}%
                </span>
              </div>

            </div>
          </div>

          {/* Final Large Sale Price Card */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/40 text-center shadow-lg">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 block mb-1">
              Precio Sugerido al Mostrador (PVP)
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {formatCurrencyARS(calculations.finalSalePrice)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-2">
              <span>Redondeo: {roundingRule}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                +{calculations.realMarginPct.toFixed(1)}% sobre costo neto
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

