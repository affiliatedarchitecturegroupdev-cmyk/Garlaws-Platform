export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  createdAt: Date;
}

export enum ProductCategory {
  PLANTS = 'plants',
  POTTERY = 'pottery',
  EQUIPMENT = 'equipment',
  TOOLS = 'tools',
  IRRIGATION = 'irrigation',
  FURNITURE = 'furniture',
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  vat: number;
  total: number;
}

export interface ProductFilter {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  searchTerm?: string;
}