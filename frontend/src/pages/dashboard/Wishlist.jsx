import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlistItem } from '../../redux/slices/wishlistSlice';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);
  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);
  return (
    <div className="container-main py-10 max-w-5xl">
      <h1 className="page-title mb-6">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const p = item._id ? item : { _id: item };
            return (
              <div key={p._id} className="card overflow-hidden group">
                <div className="relative aspect-square bg-gray-50">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                  <button onClick={() => dispatch(toggleWishlistItem(p._id))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-primary font-bold mt-1">₹{(p.discountPrice||p.basePrice)?.toLocaleString('en-IN')}</p>
                  <button onClick={() => dispatch(addToCart({ productId: p._id, quantity: 1 }))}
                    className="btn btn-outline w-full text-xs mt-2 gap-1.5 py-1.5">
                    <ShoppingCart size={13} /> Add to Cart
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
