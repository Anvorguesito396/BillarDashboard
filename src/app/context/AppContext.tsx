import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../utils/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'beer' | 'snack' | 'drink';
}

export type TableType = 'billar' | 'carambola' | 'pool' | 'snooker' | 'rusa';

export interface Table {
  id: number;
  name: string;
  type: TableType;
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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  startTableSession: (tableId: number) => void;
  endTableSession: (tableId: number) => void;
  addProductToTable: (tableId: number, product: Product, quantity: number) => void;
  createPOSSale: (items: CartItem[]) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;

  addTable: (name: string, type?: TableType) => void;
  updateTable: (id: number, newName: string, type?: TableType) => void;
  deleteTable: (id: number) => void;

  closeDailyCut: (cashDifference: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const HOURLY_RATE = 50;

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
  type: 'billar' as const,
  status: 'available',
  startTime: null,
  elapsedSeconds: 0,
  products: [],
}));

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('laBolaAppState');
    return saved
      ? JSON.parse(saved)
      : {
          tables: initialTables,
          products: initialProducts,
          sales: [],
          dailyEarnings: 0,
          isAuthenticated: false,
          currentUser: null,
        };
  });

  // 🔥 CRUD MESAS
  const getTableRate = (type: TableType): number => {
    switch (type) {
      case 'billar': return 50;
      case 'carambola': return 60;
      case 'pool': return 45;
      case 'snooker': return 70;
      case 'rusa': return 55;
      default: return 50;
    }
  };

  const addTable = (name: string, type: TableType = 'billar') => {
    const newTable: Table = {
      id: Date.now(),
      name,
      type,
      status: 'available',
      startTime: null,
      elapsedSeconds: 0,
      products: [],
    };

    setState((prev) => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }));
  };

  const updateTable = (id: number, newName: string, newType?: TableType) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((t) =>
        t.id === id ? { ...t, name: newName, ...(newType && { type: newType }) } : t
      ),
    }));
  };

  const deleteTable = (id: number) => {
    setState((prev) => {
      const table = prev.tables.find((t) => t.id === id);

      if (table?.status === 'occupied') {
        alert('No puedes eliminar una mesa en uso');
        return prev;
      }

      return {
        ...prev,
        tables: prev.tables.filter((t) => t.id !== id),
      };
    });
  };

  // ⏱ Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        return {
          ...prev,
          tables: prev.tables.map((table) =>
            table.status === 'occupied' && table.startTime
              ? {
                  ...table,
                  elapsedSeconds: Math.floor((now - table.startTime) / 1000),
                }
              : table
          ),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 💾 Persistencia
  useEffect(() => {
    localStorage.setItem('laBolaAppState', JSON.stringify(state));
  }, [state]);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        return false;
      }

      if (data) {
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          currentUser: username,
        }));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error en el login:', err);
      alert(`Error inesperado: ${err.message}`);
      return false;
    }
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
      const tableCost = timeInHours * getTableRate(table.type);
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

      const updatedProducts = prev.products.map((product) => {
        const soldItem = table.products.find(
          (item) => item.productId === product.id
        );
        return soldItem
          ? { ...product, stock: product.stock - soldItem.quantity }
          : product;
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
        if (table.id !== tableId) return table;

        const existing = table.products.find(p => p.productId === product.id);

        return {
          ...table,
          products: existing
            ? table.products.map(p =>
                p.productId === product.id
                  ? { ...p, quantity: p.quantity + quantity }
                  : p
              )
            : [...table.products, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity
              }]
        };
      }),
    }));
  };

  const createPOSSale = (items: CartItem[]) => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      timestamp: Date.now(),
      type: 'pos',
      items,
      total,
    };

    setState((prev) => ({
      ...prev,
      products: prev.products.map(p => {
        const sold = items.find(i => i.productId === p.id);
        return sold ? { ...p, stock: p.stock - sold.quantity } : p;
      }),
      sales: [...prev.sales, sale],
      dailyEarnings: prev.dailyEarnings + total,
    }));
  };

  const updateProduct = (product: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p),
    }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, { ...product, id: `product-${Date.now()}` }],
    }));
  };

  const closeDailyCut = (cashDifference: number) => {
    console.log('Corte:', cashDifference);
    setState(prev => ({
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
        addTable,
        updateTable,
        deleteTable,
        closeDailyCut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
