import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Tag, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrencyARS } from '../utils/formatters';

const CATEGORIES = ['Todos', 'Transmisión', 'Frenos', 'Encendido', 'Baterías', 'Cables', 'Carburación', 'Lubricantes'];

export function ProductCatalogView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory !== 'Todos') params.category = selectedCategory;
      const data = await api.getProducts(params);
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
      
      {/* Header & Multi-Code Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Catálogo Central de Repuestos de Motos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Búsqueda por modelo de moto ('Smash', 'Wave', 'Tornado'), código de distribuidor o cruce multimarca.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar 'Wave', 'Pietcard', 'C7HSA'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-medium"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Código / SKU</th>
              <th className="py-3 px-3">Repuesto</th>
              <th className="py-3 px-3">Motos Compatibles</th>
              <th className="py-3 px-3 text-center">Fuente de Precio</th>
              <th className="py-3 px-3 text-center">Stock</th>
              <th className="py-3 px-3 text-right">Costo Neto</th>
              <th className="py-3 px-3 text-right">Precio Venta (PVP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Buscando en catálogo de motos...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500">
                  No se encontraron repuestos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLowStock = p.current_stock <= p.min_stock;
                const models = p.compatible_models || [];

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Codes */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white text-xs">
                        {p.internal_code}
                      </div>
                      {p.oem_code && (
                        <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                          OEM: {p.oem_code}
                        </div>
                      )}
                    </td>

                    {/* Name & Brand */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-100">{p.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                          {p.brand}
                        </span>
                        <span>{p.category}</span>
                      </div>
                    </td>

                    {/* Motorcycle Compatibility */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {models.map((m, idx) => (
                          <span 
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-800 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Price Source Badge */}
                    <td className="py-3 px-3 text-center">
                      {p.price_source === 'supplier_list' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Lista Oficial</span>
                        </span>
                      )}
                      {p.price_source === 'mercadolibre' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/60 text-sky-400 border border-sky-500/30">
                          <TrendingUp className="w-3 h-3" />
                          <span>Ref. Mercado</span>
                        </span>
                      )}
                      {p.price_source === 'dollar_pegged' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                          <DollarSign className="w-3 h-3" />
                          <span>Ajuste Dólar</span>
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        isLowStock 
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' 
                          : 'bg-emerald-950/40 text-emerald-400'
                      }`}>
                        {p.current_stock} un.
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-300">
                      {formatCurrencyARS(p.cost_price_ars)}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrencyARS(p.sale_price_ars)}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
