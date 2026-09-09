import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MessageCircle, 
  Check, 
  Sparkles, 
  Zap, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  DollarSign,
  PackageCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrencyARS } from '../utils/formatters';

const POPULAR_MODELS = [
  'Gilera Smash 110',
  'Honda Wave 110',
  'Honda Tornado 250',
  'Honda CG Titan 150',
  'Bajaj Rouser NS 200',
  'Motomel Blitz 110'
];

export function CounterQuoter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const data = await api.getProducts({ q, limit: 20 });
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(searchQuery.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCopyWhatsApp = (product) => {
    const formattedPrice = formatCurrencyARS(product.sale_price_ars);
    const bikeList = product.compatible_models?.slice(0, 2).join(' / ') || '';
    const text = `🏍️ *${product.name}* (${product.brand})${bikeList ? ` para ${bikeList}` : ''}: *${formattedPrice}* contado/transferencia. Consultanos por stock o colocación.`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Search Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-4 sm:p-7 shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-3.5 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1 justify-center sm:justify-start">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                Cotizador Rápido de Mostrador & WhatsApp
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                ¿Qué repuesto busca el cliente?
              </h1>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 justify-center sm:justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>Precios sincronizados en vivo</span>
            </div>
          </div>

          {/* Big Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Escribí la moto y el repuesto: ej. 'smash transmision', 'tornado pastillas', 'wave bateria'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-11 sm:pl-13 pr-4 py-3 sm:py-4 bg-slate-950/90 border-2 border-slate-700 hover:border-slate-600 focus:border-amber-500 rounded-2xl text-sm sm:text-lg text-white placeholder-slate-500 shadow-inner focus:outline-none transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Quick-Pick Motorcycle Model Chips (Horizontal swipe on mobile, wrap on desktop) */}
          <div className="pt-1 text-left">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-300">Motos más consultadas:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-1 px-1 touch-pan-x">
              {POPULAR_MODELS.map(model => (
                <button
                  key={model}
                  onClick={() => setSearchQuery(model)}
                  className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all font-medium shrink-0 cursor-pointer ${
                    searchQuery === model
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40'
                  }`}
                >
                  🏍️ {model}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Results Header with Responsive Priority Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 sm:px-2">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
            Resultados Instantáneos ({products.length})
          </h2>
          {/* Mobile compact priority badge */}
          <span className="sm:hidden text-[10px] text-slate-300 font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            🟢 Lista &gt; 🔵 ML &gt; 🟡 Dólar
          </span>
        </div>

        {/* Desktop full priority cascade */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">Prioridad:</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Lista Oficial
          </span>
          <span className="text-slate-600">&gt;</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span> Ref. Mercado
          </span>
          <span className="text-slate-600">&gt;</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Ajuste Dólar
          </span>
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Buscando compatibilidad y precios de reposición...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-400 font-medium">No se encontraron repuestos para "{searchQuery}".</p>
          <p className="text-xs text-slate-500 mt-1">Probá buscando por modelo ('Smash', 'Wave', 'Tornado') o por tipo de repuesto ('Transmision', 'Freno', 'CDI').</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const isCopied = copiedId === p.id;
            const models = p.compatible_models || [];

            // Price Source Badging (responsive text)
            let sourceBadge = {
              text: 'Lista Proveedor (Oficial)',
              shortText: 'Lista Oficial',
              bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
              icon: ShieldCheck
            };
            if (p.price_source === 'mercadolibre') {
              sourceBadge = {
                text: 'Ref. MercadoLibre',
                shortText: 'Ref. Mercado',
                bg: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
                icon: TrendingUp
              };
            } else if (p.price_source === 'dollar_pegged') {
              sourceBadge = {
                text: 'Ajuste Automático x Dólar',
                shortText: 'Ajuste Dólar',
                bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
                icon: DollarSign
              };
            }
            const SourceIcon = sourceBadge.icon;

            return (
              <div 
                key={p.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  
                  {/* Top: Brand & Responsive Source Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {p.brand}
                    </span>
                    
                    <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${sourceBadge.bg}`}>
                      <SourceIcon className="w-3 h-3 shrink-0" />
                      <span className="hidden sm:inline">{sourceBadge.text}</span>
                      <span className="sm:hidden">{sourceBadge.shortText}</span>
                    </div>
                  </div>

                  {/* Part Name */}
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-amber-300 transition">
                    {p.name}
                  </h3>

                  {/* Motorcycle Compatibility Pills */}
                  {models.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {models.slice(0, 3).map((m, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-medium"
                        >
                          {m}
                        </span>
                      ))}
                      {models.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500">
                          +{models.length - 3} más
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stock & Internal SKU */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>SKU: {p.internal_code}</span>
                    <span className={`font-semibold ${p.current_stock > 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {p.current_stock > 0 ? `${p.current_stock} en mostrador` : 'A pedir a fábrica'}
                    </span>
                  </div>

                </div>

                {/* Bottom: Big Price & WhatsApp Share Button */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Precio al Mostrador (PVP)
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400 leading-tight">
                      {formatCurrencyARS(p.sale_price_ars)}
                    </div>
                    {p.market_reference_price && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        MercadoLibre promedio: {formatCurrencyARS(p.market_reference_price)}
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Copy Button */}
                  <button
                    onClick={() => handleCopyWhatsApp(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                    }`}
                    title="Copiar texto listo para enviar por WhatsApp"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </>
                    )}
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

