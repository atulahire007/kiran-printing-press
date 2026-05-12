import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Filter, SlidersHorizontal, X, ChevronDown, Search, Grid3X3, List } from 'lucide-react';
import { fetchProducts, fetchCategories, setFilters } from '../redux/slices/productSlice';
import ProductCard, { ProductCardSkeleton } from '../components/common/ProductCard';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: '-totalSold', label: 'Most Popular' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: '' },
];

export default function Products() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { slug: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { list: products, pagination, loading, categories } = useSelector((s) => s.products);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [localFilters, setLocalFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const loadProducts = useCallback(() => {
    const params = { ...localFilters };
    if (categorySlug && !params.category) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) params.category = cat._id;
    }
    // Remove empty params
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    dispatch(fetchProducts(params));
  }, [localFilters, categorySlug, categories, dispatch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePriceRange = ({ min, max }) => {
    setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }));
  };

  const clearFilters = () => {
    setLocalFilters({ q: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: '-createdAt', page: 1 });
    setSearchParams({});
  };

  const activeFilterCount = [localFilters.category, localFilters.minPrice, localFilters.rating]
    .filter(Boolean).length;

  const pageTitle = categorySlug
    ? `${categories.find(c => c.slug === categorySlug)?.name || 'Products'} - Kiran Printing Press`
    : 'All Products - Kiran Printing Press';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Browse our complete range of printing products and services. Visiting cards, wedding cards, flex printing, and more." />
      </Helmet>

      <div className="min-h-screen bg-paper dark:bg-gray-950">
        {/* Page header */}
        <div className="bg-gradient-to-r from-gray-900 to-ink text-white py-10">
          <div className="container-main">
            <nav className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white">{categorySlug ? (categories.find(c => c.slug === categorySlug)?.name || 'Products') : 'All Products'}</span>
            </nav>
            <h1 className="page-title text-white text-3xl">
              {categorySlug ? (categories.find(c => c.slug === categorySlug)?.name || 'Products') : t('nav.products')}
            </h1>
            {pagination && (
              <p className="text-gray-400 text-sm mt-1">{pagination.total} products found</p>
            )}
          </div>
        </div>

        <div className="container-main py-8">
          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={localFilters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                placeholder={t('nav.search')}
                className="input pl-9 w-full"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={localFilters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="input pr-8 appearance-none cursor-pointer min-w-[180px]"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2 shrink-0`}
            >
              <SlidersHorizontal size={16} />
              {t('product.filter')}
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[{ mode: 'grid', icon: <Grid3X3 size={16} /> }, { mode: 'list', icon: <List size={16} /> }].map(({ mode, icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition-colors ${viewMode === mode ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            {/* ─── Sidebar Filters ───── */}
            <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 shrink-0`}>
              <div className="card p-4 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-ink dark:text-white">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{t('product.category')}</p>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="category" value=""
                        checked={!localFilters.category}
                        onChange={() => handleFilterChange('category', '')}
                        className="accent-primary" />
                      <span className="text-sm text-ink-muted dark:text-gray-400 group-hover:text-ink dark:group-hover:text-white transition-colors">All Categories</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="category" value={cat._id}
                          checked={localFilters.category === cat._id}
                          onChange={() => handleFilterChange('category', cat._id)}
                          className="accent-primary" />
                        <span className="text-sm text-ink-muted dark:text-gray-400 group-hover:text-ink dark:group-hover:text-white transition-colors">
                          {cat.name}
                          <span className="ml-1 text-gray-400 text-xs">({cat.productCount || 0})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{t('product.price_range')}</p>
                  <div className="space-y-1.5">
                    {PRICE_RANGES.map((range) => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="price"
                          checked={localFilters.minPrice == range.min && localFilters.maxPrice == range.max}
                          onChange={() => handlePriceRange(range)}
                          className="accent-primary" />
                        <span className="text-sm text-ink-muted dark:text-gray-400 group-hover:text-ink transition-colors">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating filter */}
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{t('product.rating')}</p>
                  <div className="space-y-1.5">
                    {[4, 3, 2].map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="rating" value={r}
                          checked={localFilters.rating == r}
                          onChange={() => handleFilterChange('rating', r)}
                          className="accent-primary" />
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-xs ${s <= r ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-400">& above</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ─── Products grid ─────── */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                  {Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 card">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display font-bold text-xl text-ink dark:text-white mb-2">{t('product.no_products')}</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {products.map(p => <ProductCard key={p._id} product={p} />)}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        disabled={localFilters.page <= 1}
                        onClick={() => handleFilterChange('page', localFilters.page - 1)}
                        className="btn btn-secondary btn-sm disabled:opacity-40"
                      >← Prev</button>

                      {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                        const pg = i + 1;
                        return (
                          <button key={pg} onClick={() => handleFilterChange('page', pg)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${pg === localFilters.page ? 'bg-primary text-white' : 'btn-secondary'}`}>
                            {pg}
                          </button>
                        );
                      })}

                      <button
                        disabled={localFilters.page >= pagination.pages}
                        onClick={() => handleFilterChange('page', localFilters.page + 1)}
                        className="btn btn-secondary btn-sm disabled:opacity-40"
                      >Next →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
