import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Plus, Tag, FileText, DollarSign, Layers, ToggleLeft, ToggleRight, CheckCircle, Info } from 'lucide-react';

const CATEGORIES = [
  { value: 'goods', label: 'Physical Goods', emoji: '📦' },
  { value: 'services', label: 'Services', emoji: '🛠️' },
  { value: 'freelance', label: 'Freelance', emoji: '💼' },
  { value: 'digital', label: 'Digital Item', emoji: '💿' },
];

export function CreateListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'goods',
    available: true,
    tags: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const usdEstimate = formData.price ? (parseFloat(formData.price) * 0.12).toFixed(2) : '0.00';

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#070011] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Listing Created!</h2>
          <p className="text-white/40">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070011]">
      {/* Header */}
      <div className="border-b border-white/5 bg-gradient-to-r from-violet-900/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Plus className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 text-sm font-medium uppercase tracking-widest">New Listing</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Create a Listing</h1>
          <p className="text-white/40 mt-2">List your product or service — protected by escrow smart contracts</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <FileText className="w-4 h-4 text-violet-400" />
                Product / Service Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. iPhone 15 Pro Max, Logo Design Package..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Layers className="w-4 h-4 text-violet-400" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your product or service in detail. Be specific about condition, deliverables, timeline..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition resize-none"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <DollarSign className="w-4 h-4 text-violet-400" />
                Price (XLM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 pr-24 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xs text-white/30 font-mono">≈ ${usdEstimate} USD</span>
                  <span className="px-2 py-1 rounded-md bg-violet-500/20 text-violet-300 text-xs font-semibold">XLM</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Tag className="w-4 h-4 text-violet-400" />
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, category: value }))}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.category === value
                        ? 'border-violet-500/50 bg-violet-500/10 text-white'
                        : 'border-white/5 bg-white/[0.02] text-white/50 hover:border-white/10 hover:text-white/70'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                <Tag className="w-4 h-4 text-violet-400" />
                Tags
                <span className="text-white/30 font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Apple, Electronics, Sealed..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition"
              />
            </div>

            {/* Availability toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-sm font-medium text-white/70">Publish immediately</p>
                <p className="text-xs text-white/30 mt-0.5">Make this listing visible to buyers right away</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, available: !p.available }))}
                className={`transition-colors ${formData.available ? 'text-violet-400' : 'text-white/20'}`}
              >
                {formData.available ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10" />
                )}
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-xl shadow-violet-900/30"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </button>
            </div>
          </form>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-violet-400" />
                <p className="text-sm font-semibold text-white">Escrow Protection</p>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                All transactions on TiwalaMart are automatically wrapped in a Stellar Soroban smart contract. Buyers pay into escrow — you only receive funds after delivery is confirmed.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-white/30" />
                <p className="text-sm font-medium text-white/60">Listing Tips</p>
              </div>
              <ul className="text-xs text-white/30 space-y-2 leading-relaxed">
                <li>• Be specific about condition or scope of work</li>
                <li>• Set a clear price — XLM to USD rate is ~$0.12</li>
                <li>• Add relevant tags to improve discoverability</li>
                <li>• You can edit or deactivate listings anytime</li>
              </ul>
            </div>

            {/* Live preview */}
            {formData.name && (
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Preview</p>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{formData.name}</p>
                  {formData.price && (
                    <p className="text-lg font-bold text-violet-300">{formData.price} XLM</p>
                  )}
                  <p className="text-xs text-white/30">
                    {CATEGORIES.find((c) => c.value === formData.category)?.emoji}{' '}
                    {CATEGORIES.find((c) => c.value === formData.category)?.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
