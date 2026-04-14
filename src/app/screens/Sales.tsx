import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ShoppingCart, Trash2, DollarSign } from 'lucide-react';
import { useApp, Product, CartItem } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function Sales() {
  const { products, createPOSSale } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay suficiente stock');
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > product.stock) {
              toast.error('No hay suficiente stock');
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    createPOSSale(cart);
    setCart([]);
    toast.success('Venta registrada exitosamente');
  };

  const categories = [
    { id: 'beer', name: 'Cervezas', color: 'green' },
    { id: 'drink', name: 'Bebidas', color: 'blue' },
    { id: 'snack', name: 'Snacks', color: 'orange' },
  ];

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Punto de Venta</h1>
              <p className="text-zinc-500">Registra ventas directas de productos</p>
            </div>

            {categories.map((category, catIndex) => {
              const categoryProducts = products.filter(
                (p) => p.category === category.id
              );
              if (categoryProducts.length === 0) return null;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-white mb-4">{category.name}</h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryProducts.map((product, idx) => (
                      <motion.button
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: catIndex * 0.1 + idx * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`
                          p-4 rounded-lg border-2 transition-all
                          ${
                            product.stock === 0
                              ? 'bg-zinc-800 border-zinc-700 opacity-50 cursor-not-allowed'
                              : `bg-zinc-800 border-zinc-700 hover:border-${category.color}-500/50 hover:shadow-lg hover:shadow-${category.color}-500/20`
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Plus
                            className={`w-5 h-5 text-${category.color}-400`}
                          />
                          {product.stock < 10 && product.stock > 0 && (
                            <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                              Bajo
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                              Agotado
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium mb-1 text-left">
                          {product.name}
                        </p>
                        <p
                          className={`text-${category.color}-400 font-bold text-left`}
                        >
                          ${product.price}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 text-left">
                          Stock: {product.stock}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl sticky top-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Carrito</h2>
                {cart.length > 0 && (
                  <span className="ml-auto bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm font-semibold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500">El carrito está vacío</p>
                  <p className="text-xs text-zinc-600 mt-2">
                    Selecciona productos para agregar
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {cart.map((item) => (
                        <motion.div
                          key={item.productId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-sm text-zinc-400">
                                ${item.price} c/u
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, -1)}
                                className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-white font-bold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, 1)}
                                className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-green-400 font-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Total */}
                  <div className="border-t border-zinc-700 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="text-white">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total</span>
                      <span className="text-3xl font-bold text-green-400">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg shadow-green-500/30"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Completar Venta
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
