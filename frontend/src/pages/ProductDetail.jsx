import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCart, Heart, Zap, Star, Truck, Shield, Clock,
  Plus, Minus, Upload, ChevronRight, ZoomIn, Package
} from 'lucide-react';
import { fetchProductBySlug } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';
import ProductCard, { ProductCardSkeleton } from '../components/common/ProductCard';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentProduct: product, relatedProducts, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlistItems.some(i => (i._id || i) === product?._id);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedVariations, setSelectedVariations] = useState({});
  const [designFile, setDesignFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [zoomedImg, setZoomedImg] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  useEffect(() => {
    if (product) {
      setQuantity(product.minOrderQty || 1);
      setSelectedVariations({});
      setPriceEstimate(null);
    }
  }, [product]);

  const handleQuantityChange = (delta) => {
    const min = product?.minOrderQty || 1;
    const max = Math.min(product?.maxOrderQty || 10000, product?.stock || 10000);
    setQuantity(prev => Math.max(min, Math.min(max, prev + delta)));
  };

  const calculatePrice = async () => {
    if (!product) return;
    setCalcLoading(true);
    try {
      const { data } = await api.post(`/products/${product._id}/price-estimate`, {
        quantity, ...selectedVariations,
      });
      setPriceEstimate(data.data);
    } catch (err) {
      toast.error('Failed to calculate price');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleDesignUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append('design', file);
    try {
      const { data } = await api.post('/uploads/design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => toast.loading(`Uploading: ${Math.round(e.loaded * 100 / e.total)}%`, { id: 'upload' }),
      });
      setDesignFile(data.data);
      toast.success('Design uploaded successfully!', { id: 'upload' });
    } catch {
      toast.error('Upload failed. Please try again.', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(addToCart({
      productId: product._id,
      quantity,
      customization: { ...selectedVariations, specialInstructions },
      designFile,
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return (
    <div className="container-main py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Product not found</h2>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  const currentPrice = priceEstimate?.unitPrice || product.discountPrice || product.basePrice;
  const totalPrice = currentPrice * quantity;

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || `${product.name} - Kiran Printing Press`}</title>
        <meta name="description" content={product.metaDescription || product.shortDescription} />
      </Helmet>

      {/* Zoom modal */}
      {zoomedImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomedImg(null)}>
          <img src={zoomedImg} alt="Zoomed" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${product.category?.slug}`} className="hover:text-primary">{product.category?.name}</Link>
          <ChevronRight size={12} />
          <span className="text-ink dark:text-white">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* ─── Image Gallery ─── */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-zoom-in group"
              onClick={() => setZoomedImg(product.images[activeImage]?.url)}>
              <img
                src={product.images[activeImage]?.url || '/placeholder.jpg'}
                alt={product.images[activeImage]?.alt || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button className="absolute bottom-3 right-3 bg-white/80 p-2 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={18} />
              </button>
              {product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-primary text-white text-sm font-bold px-3 py-1 rounded-lg">
                  -{product.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div className="space-y-5">
            <div>
              <Link to={`/category/${product.category?.slug}`} className="text-xs text-primary font-medium uppercase tracking-wider hover:underline">
                {product.category?.name}
              </Link>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-ink dark:text-white mt-1 leading-tight">{product.name}</h1>
              <p className="text-sm text-gray-400 mt-1">SKU: {product.sku}</p>
            </div>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={s <= Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">{product.averageRating.toFixed(1)}</span>
                <a href="#reviews" className="text-sm text-gray-400 hover:text-primary">({product.numReviews} reviews)</a>
              </div>
            )}

            {/* Price */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-primary">₹{currentPrice?.toLocaleString('en-IN')}</span>
                {product.discountPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{product.basePrice?.toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {t('product.gst_included')} ({product.gstRate}% GST) •
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium ml-1">✓ {t('product.in_stock')}</span>
                ) : (
                  <span className="text-red-500 font-medium ml-1">{t('product.out_of_stock')}</span>
                )}
              </p>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Variations */}
            {product.variations?.map(variation => (
              <div key={variation.name}>
                <p className="text-sm font-semibold text-ink dark:text-white mb-2">{variation.name}:</p>
                <div className="flex flex-wrap gap-2">
                  {variation.options.map(opt => (
                    <button key={opt.label}
                      disabled={!opt.inStock}
                      onClick={() => setSelectedVariations(prev => ({ ...prev, [variation.name.toLowerCase()]: opt.label }))}
                      className={`px-3.5 py-1.5 rounded-lg text-sm border-2 transition-all
                        ${selectedVariations[variation.name.toLowerCase()] === opt.label
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-ink dark:text-gray-300'}
                        ${!opt.inStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}>
                      {opt.label}
                      {opt.priceModifier > 0 && <span className="text-xs text-gray-400 ml-1">(+₹{opt.priceModifier})</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-ink dark:text-white mb-2">
                {t('product.quantity')}:
                <span className="text-xs text-gray-400 font-normal ml-1">(Min: {product.minOrderQty || 1})</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button onClick={() => handleQuantityChange(-1)} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-14 text-center font-semibold text-ink dark:text-white text-base">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>

                <button onClick={calculatePrice} disabled={calcLoading}
                  className="btn btn-secondary text-sm">
                  {calcLoading ? 'Calculating...' : t('product.calculate_price')}
                </button>
              </div>

              {priceEstimate && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-xl text-sm space-y-1 border border-green-200 dark:border-green-800">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{quantity} × ₹{priceEstimate.unitPrice}</span>
                    <span className="font-medium">₹{priceEstimate.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST ({priceEstimate.gstRate}%)</span>
                    <span>+₹{priceEstimate.gstAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-700 dark:text-green-400 border-t border-green-200 dark:border-green-800 pt-1 mt-1">
                    <span>Total</span>
                    <span>₹{priceEstimate.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Design upload */}
            {product.printingOptions?.requiresDesignUpload && (
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white mb-2">{t('product.upload_design')}:</p>
                <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors
                  ${designFile ? 'border-green-400 bg-green-50 dark:bg-green-950' : 'border-gray-300 dark:border-gray-700 hover:border-primary'}`}>
                  <input type="file" className="hidden" onChange={handleDesignUpload}
                    accept=".jpg,.jpeg,.png,.pdf,.ai,.psd,.cdr" disabled={uploading} />
                  {designFile ? (
                    <>
                      <Package size={24} className="text-green-600" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">{designFile.fileName}</p>
                        <p className="text-xs text-gray-400">Upload successful</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className={uploading ? 'text-primary animate-bounce' : 'text-gray-400'} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-ink dark:text-white">
                          {uploading ? 'Uploading...' : 'Drop file or click to upload'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">PDF, PNG, JPG, AI, PSD, CDR · Max 10MB</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Special instructions */}
            <div>
              <p className="text-sm font-semibold text-ink dark:text-white mb-2">{t('product.special_instructions')}:</p>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requirements or notes for our team..."
                rows={3}
                className="input resize-none"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddToCart} disabled={product.stock <= 0}
                className="btn btn-outline flex-1 gap-2">
                <ShoppingCart size={18} /> {t('product.add_to_cart')}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock <= 0}
                className="btn btn-primary flex-1 btn-lg btn-shine gap-2">
                <Zap size={18} /> {t('product.buy_now')}
              </button>
              <button onClick={() => dispatch(toggleWishlistItem(product._id))}
                className={`btn btn-secondary ${isWishlisted ? 'text-primary border-primary' : ''}`} aria-label="Wishlist">
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              {[
                { icon: <Truck size={16} className="text-primary" />, label: 'Pan-India Delivery' },
                { icon: <Shield size={16} className="text-primary" />, label: 'Quality Guarantee' },
                { icon: <Clock size={16} className="text-primary" />, label: product.estimatedDelivery || '3-5 Days' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  {icon}
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {['description', 'specifications', 'reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-ink dark:hover:text-white'
                  }`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'reviews' && product.numReviews > 0 && <span className="ml-1.5 badge badge-gray">{product.numReviews}</span>}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') }} />
          )}

          {activeTab === 'specifications' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {product.printingOptions && (
                <>
                  {product.printingOptions.paperSizes?.length > 0 && (
                    <div className="card p-4">
                      <p className="font-semibold text-sm mb-2">Available Sizes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.printingOptions.paperSizes.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {product.printingOptions.colorOptions?.length > 0 && (
                    <div className="card p-4">
                      <p className="font-semibold text-sm mb-2">Color Options</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.printingOptions.colorOptions.map(s => <span key={s} className="badge badge-blue">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {product.printingOptions.finishOptions?.length > 0 && (
                    <div className="card p-4">
                      <p className="font-semibold text-sm mb-2">Finish Options</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.printingOptions.finishOptions.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="card p-4">
                <p className="font-semibold text-sm mb-3">Product Details</p>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      ['SKU', product.sku],
                      ['GST Rate', `${product.gstRate}%`],
                      ['Min Qty', product.minOrderQty],
                      ['Delivery', product.estimatedDelivery],
                      ['Unit', product.unit],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td className="py-1.5 text-gray-400 font-medium w-1/2">{k}</td>
                        <td className="py-1.5 text-ink dark:text-white">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div id="reviews">
              {product.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map(review => (
                    <div key={review._id} className="card p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold">{review.user?.name?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{review.user?.name}</p>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-400' : 'text-gray-300'} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                      {review.isVerifiedPurchase && <span className="badge badge-green mt-2">✓ Verified Purchase</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Star size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Related Products ─── */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="section-title mb-6">{t('product.related_products')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container-main py-8 grid lg:grid-cols-2 gap-10 animate-pulse">
      <div className="space-y-3">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton w-16 h-16 rounded-xl" />)}
        </div>
      </div>
      <div className="space-y-4">
        {[1, 0.5, 0.8, 0.6, 0.4, 0.9].map((w, i) => (
          <div key={i} className="skeleton h-6 rounded" style={{ width: `${w * 100}%` }} />
        ))}
        <div className="skeleton h-32 rounded-xl" />
      </div>
    </div>
  );
}
