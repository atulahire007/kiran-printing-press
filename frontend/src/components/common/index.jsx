// ══════════════════════════════════════════
// ProductCard.jsx
// ══════════════════════════════════════════
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlistItem } from '../../redux/slices/wishlistSlice';
import { selectIsWishlisted } from '../../redux/slices/wishlistSlice';

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const isWishlisted = useSelector(selectIsWishlisted(product._id));

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
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={primaryImage?.url || '/placeholder-product.jpg'}
          alt={primaryImage?.alt || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discountPercent > 0 && (
            <span className="badge bg-primary text-white font-semibold">-{product.discountPercent}%</span>
          )}
          {product.isNewArrival && <span className="badge bg-emerald-500 text-white">New</span>}
          {product.isBestSeller && <span className="badge bg-amber-500 text-white">Best Seller</span>}
        </div>

        {/* Wishlist button */}
        <button onClick={handleWishlist} aria-label="Wishlist"
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
            ${isWishlisted ? 'bg-primary text-white' : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-primary'}`}>
          <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2">
          <button onClick={handleAddToCart}
            className="btn btn-primary w-full text-xs py-2">
            <ShoppingCart size={14} />
            {t('product.add_to_cart')}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-xs text-gray-400 mb-1 truncate">{product.category?.name}</p>
        <h3 className="font-medium text-sm text-ink dark:text-white mb-2 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={11} className={s <= Math.round(product.averageRating) ? 'star-filled' : 'star-empty'} fill="currentColor" />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="price-display text-lg">₹{effectivePrice?.toLocaleString('en-IN')}</span>
          {product.discountPrice && product.basePrice && (
            <span className="price-original">₹{product.basePrice?.toLocaleString('en-IN')}</span>
          )}
        </div>

        {product.stock <= 0 && (
          <p className="text-xs text-red-500 mt-1 font-medium">{t('product.out_of_stock')}</p>
        )}
      </div>
    </Link>
  );
}

// ══════════════════════════════════════════
// ProductCardSkeleton.jsx
// ══════════════════════════════════════════
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

// ══════════════════════════════════════════
// PageLoader.jsx
// ══════════════════════════════════════════
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white dark:bg-gray-950 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
              <path d="M8 7h8M8 11h8M8 15h5"/>
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-ink dark:text-white">Kiran Printing Press</p>
        <p className="text-xs text-gray-400 mt-1">Loading...</p>
      </div>
    </div>
  );
}
export default PageLoader;

// ══════════════════════════════════════════
// ProtectedRoute.jsx
// ══════════════════════════════════════════
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

// ══════════════════════════════════════════
// AdminRoute.jsx
// ══════════════════════════════════════════
export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

// ══════════════════════════════════════════
// StarRating.jsx
// ══════════════════════════════════════════
export function StarRating({ rating, size = 16, showCount, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} size={size}
            className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}
            fill="currentColor" />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-gray-400">({count})</span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// OrderStatusBadge.jsx
// ══════════════════════════════════════════
export function OrderStatusBadge({ status }) {
  return <span className={`status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

// ══════════════════════════════════════════
// WhatsAppButton.jsx
// ══════════════════════════════════════════
export function WhatsAppButton() {
  return (
    <a href="https://wa.me/919876543210?text=Hello!%20I'm%20interested%20in%20printing%20services"
      target="_blank" rel="noreferrer"
      className="whatsapp-btn"
      aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  );
}
