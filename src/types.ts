// NEPH E-Commerce Shared Types

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  categoryId: string;
  title: string;
  sku: string;
  regularPrice: number;
  salePrice: number | null;
  stockCount: number;
  description: string;
  sizes: string; // Comma separated, e.g. "S,M,L,XL"
  colors: string; // Comma separated, e.g. "Black,Silver"
  isFlashSale: boolean;
  flashSaleProgress: number; // Percentage remaining stock (0-100)
  imageUrl: string;
  gallery: string[];
  rating: number;
  brand?: string; // e.g. "Schneider", "ABB", "Terasaki", "Siemens", "Hager"
  subCategory?: string; // e.g. "AC", "DC", "AC/DC"
  isDraft?: boolean;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  paymentMethod: string;
  totalAmount: number;
  status: 'Pending' | 'Processed' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  items: OrderItem[];
  trackingNumber?: string;
  trackingCompany?: string;
}

export interface HeroSlider {
  image: string;
  title: string;
  subtitle: string;
}

export interface SideBanner {
  image: string;
  link: string;
  categoryId?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface PromoPopupSettings {
  enabled: boolean;
  imageUrl: string;
  autoCloseSeconds: number;
}

export interface BannerSettings {
  heroSliders: HeroSlider[];
  sideBanners: SideBanner[];
  contactInfo: ContactInfo;
  promoPopup?: PromoPopupSettings;
  announcementText?: string;
  announcementSpeed?: number;
  announcementDirection?: 'left' | 'right';
  flashSaleEndTime?: string;
}

export interface StoreData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  banners: BannerSettings;
}
