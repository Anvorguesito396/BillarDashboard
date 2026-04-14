import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, AlertTriangle, Edit, Plus, Search } from 'lucide-react';
import { useApp, Product } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export function Inventory() {
  const { products, updateProduct, addProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'beer' as 'beer' | 'snack' | 'drink',
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: 'beer',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Completa todos los campos');
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
    };

    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id });
      toast.success('Producto actualizado');
    } else {
      addProduct(productData);
      toast.success('Producto agregado');
    }

    setShowModal(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beer':
        return 'green';
      case 'drink':
        return 'blue';
      case 'snack':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'beer':
        return 'Cerveza';
      case 'drink':
        return 'Bebida';
      case 'snack':
        return 'Snack';
      default:
        return category;
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Inventario</h1>
            <p className="text-zinc-500">Gestiona productos y stock</p>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg shadow-green-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-green-400" />
              <span className="text-zinc-400 text-sm">Total Productos</span>
            </div>
            <p className="text-3xl font-bold text-white">{products.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-zinc-400 text-sm">Stock Bajo</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">
              {products.filter((p) => p.stock < 20).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-zinc-400 text-sm">Valor Total</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              ${products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => {
                    const color = getCategoryColor(product.category);
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{product.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}
                          >
                            {getCategoryLabel(product.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-green-400 font-semibold">
                            ${product.price}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{product.stock}</p>
                        </td>
                        <td className="px-6 py-4">
                          {product.stock === 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Agotado
                            </span>
                          ) : product.stock < 10 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Bajo
                            </span>
                          ) : product.stock < 20 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              Medio
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(product)}
                            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-zinc-400">Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <Label className="text-zinc-400">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="beer">Cerveza</SelectItem>
                  <SelectItem value="drink">Bebida</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400">Precio</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <Label className="text-zinc-400">Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 border-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                {editingProduct ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
