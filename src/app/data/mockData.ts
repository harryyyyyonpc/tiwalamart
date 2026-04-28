export type EscrowStatus = 'locked' | 'pending' | 'released' | 'refunded';

export interface Product {
  id: string;
  name: string;
  price: number;
  seller: string;
  rating: number;
  reviews: number;
  emoji: string;
  category: string;
  badge?: string;
  description: string;
  tags: string[];
}

export interface Transaction {
  id: string;
  productName: string;
  amount: number;
  seller: string;
  status: EscrowStatus;
  date: string;
  txHash?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'iPhone 15 Pro Max',
    price: 1199,
    seller: 'GBGXWDNN4USOKBCKNXKFAN5JTYA6LSNI7PR3LIUIWW7ICTS2PK64Q236',
    rating: 4.9,
    reviews: 234,
    emoji: '📱',
    category: 'Electronics',
    badge: 'Top Seller',
    description: 'Factory-unlocked, 256GB, Titanium Black. Sealed in original box with warranty.',
    tags: ['Apple', 'Smartphone', '5G'],
  },
  {
    id: 'prod-2',
    name: 'Custom Logo Design',
    price: 450,
    seller: 'GBGXWDNN4USOKBCKNXKFAN5JTYA6LSNI7PR3LIUIWW7ICTS2PK64Q236',
    rating: 5.0,
    reviews: 89,
    emoji: '🎨',
    category: 'Services',
    badge: 'Verified Pro',
    description: '3 concepts, unlimited revisions, full source files (AI, SVG, PNG). 5-day delivery.',
    tags: ['Design', 'Branding', 'Creative'],
  },
  {
    id: 'prod-3',
    name: 'Mechanical Keyboard',
    price: 189,
    seller: 'GBGXWDNN4USOKBCKNXKFAN5JTYA6LSNI7PR3LIUIWW7ICTS2PK64Q236',
    rating: 4.8,
    reviews: 156,
    emoji: '⌨️',
    category: 'Electronics',
    description: 'Keychron K2 Pro, wireless, hot-swappable switches, RGB backlit.',
    tags: ['Keyboard', 'Gaming', 'Wireless'],
  },
  {
    id: 'prod-4',
    name: 'SEO Consulting',
    price: 899,
    seller: 'GBGXWDNN4USOKBCKNXKFAN5JTYA6LSNI7PR3LIUIWW7ICTS2PK64Q236',
    rating: 4.7,
    reviews: 67,
    emoji: '📈',
    category: 'Services',
    badge: 'Monthly Retainer',
    description: 'Monthly SEO audit, keyword strategy, backlink building. Proven ROI results.',
    tags: ['Marketing', 'SEO', 'Growth'],
  },
  {
    id: 'prod-5',
    name: 'Sony WH-1000XM5',
    price: 349,
    seller: 'GBGXWDNN4USOKBCKNXKFAN5JTYA6LSNI7PR3LIUIWW7ICTS2PK64Q236',
    rating: 4.9,
    reviews: 421,
    emoji: '🎧',
    category: 'Electronics',
    description: 'Industry-leading noise cancellation, 30-hr battery. Like new, used 2 months.',
    tags: ['Audio', 'Sony', 'ANC'],
  },
  {
    id: 'prod-6',
    name: 'Full-Stack Dev',
    price: 2500,
    seller: 'GBGXWDNN4USOKBCKNXKFAN5JTYA6LSNI7PR3LIUIWW7ICTS2PK64Q236',
    rating: 5.0,
    reviews: 45,
    emoji: '💻',
    category: 'Services',
    badge: 'Expert',
    description: 'React + Node.js + PostgreSQL. Milestone-based delivery. Full documentation included.',
    tags: ['Coding', 'React', 'Node.js'],
  },
];

export const CATEGORIES = ['All', 'Electronics', 'Services'];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    productName: 'MacBook Pro M3',
    amount: 2499,
    seller: 'GCKM...X7Y2',
    status: 'released',
    date: '2026-04-20',
    txHash: '0xf4a1...9c32',
  },
  {
    id: 'tx-002',
    productName: 'Web Design Services',
    amount: 850,
    seller: 'GDXP...M4K1',
    status: 'released',
    date: '2026-04-18',
    txHash: '0x8b2d...1a45',
  },
  {
    id: 'tx-003',
    productName: 'DJI Mavic Pro',
    amount: 1100,
    seller: 'GZAB...C9D0',
    status: 'locked',
    date: '2026-04-25',
    txHash: '0x3e7f...2b89',
  },
];

export const STATS = {
  totalVolume: '4.2M',
  activeListings: 1284,
  escrowedNow: 847,
  successRate: '99.8%',
};
