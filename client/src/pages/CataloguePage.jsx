import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Check, 
  ArrowRight 
} from 'lucide-react';

const CataloguePage = () => {
  const navigate = useNavigate();
  const { addItemToCart, cartItems } = useOnboarding();
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityTier, setCityTier] = useState('');
  const [gstinOnly, setGstinOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addedItemMap, setAddedItemMap] = useState({});

  const categories = ['Broadband', 'Voice/Mobile', 'Cloud', 'Security', 'IoT'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, cityTier, gstinOnly]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (cityTier) params.append('cityTier', cityTier);
      if (gstinOnly) params.append('gstinOnly', 'true');
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    addItemToCart(product.productId);
    setAddedItemMap((prev) => ({ ...prev, [product.productId]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.productId]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('catalogue.title', 'Enterprise Product Catalogue')}
              </h1>
              <Badge variant="brand">{t('catalogue.badge', '25 Master Products')}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('catalogue.subtitle', 'Official Accel Business telecom, voice, cybersecurity, and cloud services for Indian MSMEs')}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/quote')}
            icon={ArrowRight}
            className="text-xs"
          >
            {t('catalogue.goToQuoteBtn', 'Go to Quote Builder')} ({cartItems.length})
          </Button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('catalogue.searchPlaceholder', 'Search products or bandwidth...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* City Tier Filter */}
            <div className="flex items-center space-x-3 text-xs w-full sm:w-auto justify-end">
              <select
                value={cityTier}
                onChange={(e) => setCityTier(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold"
              >
                <option value="">{t('catalogue.allCityTiers', 'All City Tiers')}</option>
                <option value="Tier 1">{t('catalogue.tier1', 'Tier 1 (Metro)')}</option>
                <option value="Tier 2">{t('catalogue.tier2', 'Tier 2')}</option>
                <option value="Tier 3">{t('catalogue.tier3', 'Tier 3')}</option>
              </select>

              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={gstinOnly}
                  onChange={(e) => setGstinOnly(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>{t('catalogue.gstinMandateOnly', 'GSTIN Mandate Only')}</span>
              </label>
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === ''
                  ? 'bg-airtel-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t('catalogue.allCategories', 'All Categories (25)')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-airtel-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading catalogue products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No products match your filter criteria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => {
              const isAdded = addedItemMap[prod.productId];
              const isInCart = cartItems.some((i) => i.productId === prod.productId);

              return (
                <div
                  key={prod.productId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="neutral" className="text-[10px] font-mono">{prod.productId}</Badge>
                      <Badge variant="brand">{prod.category}</Badge>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{prod.productName}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{prod.description}</p>

                    <div className="text-[11px] font-semibold text-slate-700 flex items-center space-x-2 pt-1">
                      <span>Spec: {prod.speedBandwidth}</span>
                      <span>&bull;</span>
                      <span>Term: {prod.contractDurationMonths}m</span>
                    </div>

                    {prod.gstinRequired && (
                      <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        {t('catalogue.gstinRequiredBadge', 'GSTIN Registration Required')}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-airtel-700">
                        ₹{prod.monthlyPrice.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-500">/mo</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Setup: ₹{prod.setupFee.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddProduct(prod)}
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : isInCart
                          ? 'bg-red-50 text-airtel-700 border border-red-300'
                          : 'bg-airtel-600 hover:bg-airtel-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('catalogue.addedToast', 'Added!')}</span>
                        </>
                      ) : isInCart ? (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('catalogue.addMore', 'Add More')}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('catalogue.addToQuote', 'Add to Quote')}</span>
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
    </div>
  );
};

export default CataloguePage;
