export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string | null;
  description: string | null;
  price: number;
  quantity: number;
}

export interface ProductItem {
  id: number;
  productId: number;
  price: number;
  quantity: number;
  product: Product;
}

export interface BillLinks {
  self: { href: string };
  bill?: { href: string };
  productItems?: { href: string };
}

export interface BillSummary {
  id?: number; // Added as optional since it might not be directly in the root of the JSON for list views
  billingDate: string;
  customerId: number;
  customer: Customer | null;
  _links?: BillLinks;
}

export interface BillDetail {
  id: number;
  billingDate: string;
  customerId: number;
  productItems: ProductItem[];
  customer: Customer;
}