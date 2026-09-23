export type Role = 'CUSTOMER' | 'MANAGER' | 'ADMIN';
export type ProductStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'REMOVED';
export type Priority = 'MUST_BUY' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Visibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';
export type MemberPermission = 'VIEW' | 'COMMENT' | 'SUGGEST' | 'MANAGE';
export type OrderStatus = 'CART' | 'CHECKOUT' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type NotificationType =
  | 'PRICE_DROP'
  | 'TARGET_PRICE_REACHED'
  | 'BACK_IN_STOCK'
  | 'LOW_STOCK'
  | 'PRODUCT_UNAVAILABLE'
  | 'PRODUCT_DISCONTINUED'
  | 'STALE_WISHLIST'
  | 'WISHLIST_SHARED'
  | 'WISHLIST_INVITATION'
  | 'COLLABORATIVE_ACTIVITY'
  | 'RECOMMENDATION'
  | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  status?: string;
  createdAt?: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: Subcategory[];
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  images?: ProductImage[];
}

export interface PriceHistory {
  id: string;
  previousPrice: number;
  newPrice: number;
  changePercentage: number;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  productId?: string;
  variantId?: string;
  url: string;
  altText?: string;
  sortOrder?: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  subcategoryId?: string;
  modelNumber?: string;
  mrp?: number;
  priceSource?: string;
  priceVerifiedAt?: string;
  category?: Category;
  subcategory?: Subcategory;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  availabilityStatus: ProductStatus;
  stockQuantity: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  specifications?: Record<string, any>;
  images: ProductImage[];
  variants?: ProductVariant[];
  priceHistory?: PriceHistory[];
  isNewLaunch?: boolean;
  isFeaturedLaunch?: boolean;
  launchDate?: string;
  launchOffer?: string;
  _count?: { wishlistItems: number };
}

export interface HealthScore {
  score: number;
  status: 'Excellent' | 'Healthy' | 'Needs Attention' | 'Action Required';
  breakdown: {
    totalItems: number;
    availableCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    discontinuedCount: number;
    targetPriceReachedCount: number;
    staleCount: number;
  };
  suggestions: string[];
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  variantId?: string;
  selectedVariant?: Record<string, string>;
  product: Product;
  variant?: ProductVariant;
  priority: Priority;
  notes?: string;
  targetPrice?: number;
  addedAt: string;
  archivedAt?: string;
  isStale: boolean;
  planningToBuyUserId?: string;
  planningToBuyName?: string;
}

export interface WishlistMember {
  id: string;
  userId: string;
  permission: MemberPermission;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface WishlistActivity {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  name: string;
  description?: string;
  visibility: Visibility;
  shareToken?: string;
  items: WishlistItem[];
  members?: WishlistMember[];
  activities?: WishlistActivity[];
  healthScore?: HealthScore;
  _count?: { items: number };
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  selectedVariant?: Record<string, string>;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  priceSnapshot: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedProductId?: string;
  relatedWishlistId?: string;
  read: boolean;
  createdAt: string;
}

export interface BudgetPlanItem {
  wishlistItemId: string;
  productId: string;
  name: string;
  brand: string;
  currentPrice: number;
  priority: Priority;
  targetPrice?: number;
  targetReached: boolean;
  stockStatus: ProductStatus;
  urgencyScore: number;
  recommendationReason: string;
  selectedForBudget: boolean;
}

export interface BudgetPlan {
  monthlyBudget: number;
  totalWishlistValue: number;
  budgetDifference: number;
  affordableItemsCount: number;
  suggestedItems: BudgetPlanItem[];
  unaffordableItems: BudgetPlanItem[];
  summaryMessage: string;
}

export interface AiResponse {
  replyHeading: string;
  detailedExplanation: string;
  recommendations: Array<{
    name: string;
    price: number;
    priority: string;
    reason: string;
  }>;
  suggestedActions: string[];
  totalSavedItemsCount: number;
  mode: string;
}

export interface DemandReportItem {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  categoryName: string;
  currentPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  availabilityStatus: ProductStatus;
  wishlistSaves: number;
  recentSaves30d: number;
  cartAdditions: number;
  ordersCount: number;
  demandScore: number;
  demandStatus: string;
  riskFlag: boolean;
}
