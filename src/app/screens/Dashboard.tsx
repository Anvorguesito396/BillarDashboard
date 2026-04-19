import { motion } from 'motion/react';
import {
  DollarSign,
  TableProperties,
  ShoppingBag,
  TrendingUp,
  Circle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function Dashboard() {
  const { tables, dailyEarnings, sales, products } = useApp();

  const getTableName = (sale: any, tables: any[]) => {
    if (sale.type !== 'table' || !sale.tableId) return null;
    const table = tables.find(t => t.id === sale.tableId);
    return table ? table.name : `Mesa ${sale.tableId}`;
  };

  const activeTables = tables.filter((t) => t.status === 'occupied').length;
  const availableTables = tables.filter((t) => t.status === 'available').length;
  const productsSoldToday = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const recentActivity = [...sales]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const statsCards = [
    {
      title: 'Ganancias Hoy',
      value: `$${dailyEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      glow: 'shadow-green-500/20',
    },
    {
      title: 'Mesas Activas',
      value: activeTables,
      icon: TableProperties,
      color: 'purple',
      glow: 'shadow-purple-500/20',
    },
    {
      title: 'Productos Vendidos',
      value: productsSoldToday,
      icon: ShoppingBag,
      color: 'blue',
      glow: 'shadow-blue-500/20',
    },
    {
      title: 'Ventas Totales',
      value: sales.length,
      icon: TrendingUp,
      color: 'orange',
      glow: 'shadow-orange-500/20',
    },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-zinc-500">
            Resumen general de operaciones - {new Date().toLocaleDateString('es-MX')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`
                  bg-zinc-900 rounded-xl border border-zinc-800 p-6
                  shadow-xl ${stat.glow} transition-all
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">{stat.title}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-400`}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}
                  >
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tables Overview & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tables Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-green-400" />
              Estado de Mesas
            </h2>

            <div className="grid grid-cols-4 gap-3">
              {tables.map((table) => (
                <motion.div
                  key={table.id}
                  whileHover={{ scale: 1.05 }}
                  className={`
                    aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                    transition-all relative overflow-hidden
                    ${
                      table.status === 'occupied'
                        ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                        : 'bg-zinc-800 border-zinc-700'
                    }
                  `}
                >
                  {table.status === 'occupied' && (
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 bg-green-500/20 blur-md"
                    />
                  )}
                  <Circle
                    className={`w-6 h-6 mb-1 relative z-10 ${
                      table.status === 'occupied' ? 'text-green-400' : 'text-zinc-600'
                    }`}
                  />
                  <p
                    className={`text-xs font-medium relative z-10 ${
                      table.status === 'occupied' ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {table.name}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-zinc-400">Ocupadas: {activeTables}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <span className="text-zinc-400">Disponibles: {availableTables}</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Actividad Reciente
            </h2>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">
                  No hay actividad registrada aún
                </p>
              ) : (
                recentActivity.map((sale) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">
                          {sale.type === 'table'
                            ? `Mesa ${getTableName(sale, tables)}`
                            : 'Venta Directa'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(sale.timestamp)}
                        </p>
                      </div>
                      <p className="text-green-400 font-bold">${sale.total.toFixed(2)}</p>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {sale.items.map((item, idx) => (
                        <span key={idx}>
                          {item.quantity}x {item.name}
                          {idx < sale.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            Alertas de Inventario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products
              .filter((p) => p.stock < 20)
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4"
                >
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-orange-400 text-sm mt-1">
                    Stock bajo: {product.stock} unidades
                  </p>
                </div>
              ))}
            {products.filter((p) => p.stock < 20).length === 0 && (
              <p className="text-zinc-500 text-sm col-span-full text-center py-4">
                Todos los productos tienen stock suficiente
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
