import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Star, Search, Filter, ShoppingCart, Shield, ChevronDown } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';
import type { Product } from '../../data/mockData';

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/20 border border-violet-500/30 text-violet-300">
          {product.badge}
        </div>
      )}

      {/* Image area */}
      <div
        className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        style={{
          background: hovered
            ? 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(79,70,229,0.15) 100%)'
            : 'rgba(255,255,255,0.02)',
        }}
      >
        <div
          className="text-7xl transition-transform duration-300"
          style={{ transform: hovered ? 'scale(1.12)' : 'scale(1)' }}
        >
          {product.emoji}
        </div>
        {/* Category chip */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs bg-black/30 backdrop-blur-sm text-white/50 border border-white/10">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="text-white font-semibold text-base leading-snug">{product.name}</h3>
          <p className="text-white/40 text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-xs text-white/40 bg-white/5 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating + seller */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-white font-medium">{product.rating}</span>
            <span className="text-white/30">({product.reviews})</span>
          </div>
          <span className="text-xs font-mono text-white/30">{product.seller}</span>
        </div>

        {/* Price + Buy */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <div className="text-2xl font-bold text-white">{product.price.toLocaleString()}</div>
            <div className="text-xs text-violet-400 font-medium">XLM</div>
          </div>
          <button
            onClick={() => navigate(`/escrow/${product.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/30 hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

export function Marketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  const filtered = PRODUCTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-[#070011]">
      {/* Header */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-indigo-900/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 text-sm font-medium uppercase tracking-widest">Escrow-Protected</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-white/40">Every listing backed by a Stellar smart contract</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search products, services, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 text-sm focus:outline-none focus:border-violet-500/50 transition cursor-pointer"
            >
              <option value="rating" className="bg-[#1a0535]">Top Rated</option>
              <option value="price-asc" className="bg-[#1a0535]">Price: Low → High</option>
              <option value="price-desc" className="bg-[#1a0535]">Price: High → Low</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                  : 'bg-white/[0.04] text-white/50 border border-white/10 hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto text-sm text-white/30 flex items-center whitespace-nowrap">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40 text-lg">No listings match your search</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-4 text-violet-400 text-sm hover:text-violet-300 transition"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
