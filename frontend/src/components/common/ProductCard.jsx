import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlistItem } from '../../redux/slices/wishlistSlice';

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="skeleton aspect-square" />
      <div className="p-3.5 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-6 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlistItems.some(i => (i._id || i) === product._id);

  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
  const effectivePrice = product.discountPrice || product.basePrice;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    dispatch(addToCart({ productId: product._id, quantity: product.minOrderQty || 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    dispatch(toggleWishlistItem(product._id));
  };

  return (
    <Link to={`/products/${product.slug}`} className="card-hover group block overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img src={primaryImage?.url || '/placeholder.jpg'} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discountPercent > 0 && <span className="badge bg-primary text-white">-{product.discountPercent}%</span>}
          {product.isNewArrival && <span className="badge bg-emerald-500 text-white">New</span>}
          {product.isBestSeller && <span className="badge bg-amber-500 text-white">Best Seller</span>}
        </div>
        <button onClick={handleWishlist} aria-label="Wishlist"
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm
            ${isWishlisted ? 'bg-primary text-white' : 'bg-white/80 text-gray-500 hover:bg-white hover:text-primary'}`}>
          <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2">
          <button onClick={handleAddToCart} className="btn btn-primary w-full text-xs py-2">
            <ShoppingCart size={14} />{t('product.add_to_cart')}
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-xs text-gray-400 mb-1 truncate">{product.category?.name}</p>
        <h3 className="font-medium text-sm text-ink dark:text-white mb-2 line-clamp-2 leading-snug">{product.name}</h3>
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= Math.round(product.averageRating) ? 'star-filled' : 'star-empty'} fill="currentColor" />)}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="price-display text-lg">₹{effectivePrice?.toLocaleString('en-IN')}</span>
          {product.discountPrice && <span className="price-original">₹{product.basePrice?.toLocaleString('en-IN')}</span>}
        </div>
      </div>
    </Link>
  );
}
