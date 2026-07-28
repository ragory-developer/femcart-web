export interface OrderItem {
  id: string;
  quantity: number;
  product: { name: string };
  price: number;
  variant?: {
    attributes: { value: string }[];
  } | null;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  customerName: string | null;
  customerPhone: string | null;
  couponCode: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isGuest: boolean;
    rewardPoints: number;
    orders?: { total: number }[];
  };
  items: OrderItem[];
  deliveryAddress: string;
  deliveryCity: string | null;
  deliveryArea: string | null;
  deliveryState: string | null;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  courierName?: string | null;
  deliveryRating?: number | null;
  deliveryFeedback?: string | null;
}
