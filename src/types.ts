/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  colors?: string[];
  featured?: boolean;
  stock?: number;
  createdAt?: string;
}

export interface CartItem {
  id: string; // Unique combination of product.id + selectedSize + selectedColor to differentiate items in the cart
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
}

export interface Category {
  id: string;
  name: string;
  label: string; // Ex: "Camisetas", "Calças", "Casacos"
  icon: string;  // Name of the lucide-react icon
}

export interface Order {
  id?: string;
  userId: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedColor?: string;
  }[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}
