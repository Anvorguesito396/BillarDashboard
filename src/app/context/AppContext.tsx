import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'beer' | 'snack' | 'drink';
}

export interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied';
  startTime: number | null;
  elapsedSeconds: number;
  products: CartItem[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  type: 'table' | 'pos';
  tableId?: number;
  items: CartItem[];
  tableTime?: number;
  total: number;
}

interface AppState {
  tables: Table[];
  products: Product[];
  sales: Sale[];
  dailyEarnings: number;
  isAuthenticated: boolean;
  currentUser: string | null;
}

interface AppContextType extends AppState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  startTableSession: (tableId: number) => void;
  endTableSession: (tableId: number) => void;
  addProductToTable: (tableId: number, product: Product, quantity: number) => void;
  createPOSSale: (items: CartItem[]) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  closeDailyCut: (cashDifference: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const HOURLY_RATE = 50; // Price per hour for table usage

const initialProducts: Product[] = [
  { id: '1', name: 'Corona', price: 35, stock: 48, category: 'beer' },
  { id: '2', name: 'Modelo', price: 35, stock: 36, category: 'beer' },
  { id: '3', name: 'Heineken', price: 40, stock: 24, category: 'beer' },
  { id: '4', name: 'Indio', price: 30, stock: 30, category: 'beer' },
  { id: '5', name: 'Coca Cola', price: 20, stock: 40, category: 'drink' },
  { id: '6', name: 'Agua', price: 15, stock: 50, category: 'drink' },
  { id: '7', name: 'Papas', price: 25, stock: 15, category: 'snack' },
  { id: '8', name: 'Cacahuates', price: 20, stock: 20, category: 'snack' },
];

const initialTables: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Mesa ${i + 1}`,
  status: 'available',
  startTime: null,
  elapsedSeconds: 0,
  products: [],
}));

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('laBolaAppState');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      tables: initialTables,
      products: initialProducts,
      sales: [],
      dailyEarnings: 0,
      isAuthenticated: false,
      currentUser: null,
    };
  });

  // Timer effect for active tables
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        const updatedTables = prev.tables.map((table) => {
          if (table.status === 'occupied' && table.startTime) {
            return {
              ...table,
              elapsedSeconds: Math.floor((now - table.startTime) / 1000),
            };
          }
          return table;
        });
        return { ...prev, tables: updatedTables };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('laBolaAppState', JSON.stringify(state));
  }, [state]);

  const login = (username: string, password: string): boolean => {
    // Simple authentication (in real app, this would be server-side)
    if (username === 'admin' && password === 'admin') {
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        currentUser: username,
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null,
    }));
  };

  const startTableSession = (tableId: number) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: 'occupied',
              startTime: Date.now(),
              elapsedSeconds: 0,
              products: [],
            }
          : table
      ),
    }));
  };

  const endTableSession = (tableId: number) => {
    setState((prev) => {
      const table = prev.tables.find((t) => t.id === tableId);
      if (!table || table.status !== 'occupied') return prev;

      const timeInHours = table.elapsedSeconds / 3600;
      const tableCost = timeInHours * HOURLY_RATE;
      const productsCost = table.products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const total = tableCost + productsCost;

      const sale: Sale = {
        id: `sale-${Date.now()}`,
        timestamp: Date.now(),
        type: 'table',
        tableId: table.id,
        items: table.products,
        tableTime: table.elapsedSeconds,
        total,
      };

      // Update product stock
      const updatedProducts = prev.products.map((product) => {
        const soldItem = table.products.find((item) => item.productId === product.id);
        if (soldItem) {
          return { ...product, stock: product.stock - soldItem.quantity };
        }
        return product;
      });

      return {
        ...prev,
        tables: prev.tables.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: 'available',
                startTime: null,
                elapsedSeconds: 0,
                products: [],
              }
            : t
        ),
        products: updatedProducts,
        sales: [...prev.sales, sale],
        dailyEarnings: prev.dailyEarnings + total,
      };
    });
  };

  const addProductToTable = (tableId: number, product: Product, quantity: number) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => {
        if (table.id === tableId) {
          const existingItem = table.products.find(
            (item) => item.productId === product.id
          );
          if (existingItem) {
            return {
              ...table,
              products: table.products.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            ...table,
            products: [
              ...table.products,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity,
              },
            ],
          };
        }
        return table;
      }),
    }));
  };

  const createPOSSale = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      timestamp: Date.now(),
      type: 'pos',
      items,
      total,
    };

    setState((prev) => {
      // Update product stock
      const updatedProducts = prev.products.map((product) => {
        const soldItem = items.find((item) => item.productId === product.id);
        if (soldItem) {
          return { ...product, stock: product.stock - soldItem.quantity };
        }
        return product;
      });

      return {
        ...prev,
        products: updatedProducts,
        sales: [...prev.sales, sale],
        dailyEarnings: prev.dailyEarnings + total,
      };
    });
  };

  const updateProduct = (product: Product) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === product.id ? product : p)),
    }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
  };

  const closeDailyCut = (cashDifference: number) => {
    // In a real app, this would save to database and generate report
    console.log('Daily cut closed with difference:', cashDifference);
    setState((prev) => ({
      ...prev,
      sales: [],
      dailyEarnings: 0,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        startTableSession,
        endTableSession,
        addProductToTable,
        createPOSSale,
        updateProduct,
        addProduct,
        closeDailyCut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
