import { useState } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  TableProperties,
  Calendar,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { toast } from 'sonner';

export function CashRegister() {
  const { sales, dailyEarnings, closeDailyCut } = useApp();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashDifference, setCashDifference] = useState('');

  const tableSales = sales.filter((s) => s.type === 'table');
  const posSales = sales.filter((s) => s.type === 'pos');

  const tableEarnings = tableSales.reduce((sum, sale) => sum + sale.total, 0);
  const posEarnings = posSales.reduce((sum, sale) => sum + sale.total, 0);

  const totalProductsSold = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const handleCloseCut = () => {
    const difference = parseFloat(cashDifference);
    if (isNaN(difference)) {
      toast.error('Ingresa un valor válido');
      return;
    }

    closeDailyCut(difference);
    setShowCloseModal(false);
    setCashDifference('');
    toast.success('Corte de caja cerrado exitosamente');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const statsCards = [
    {
      title: 'Total del Día',
      value: `$${dailyEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      description: 'Ingresos totales',
    },
    {
      title: 'Ventas de Mesas',
      value: `$${tableEarnings.toFixed(2)}`,
      icon: TableProperties,
      color: 'purple',
      description: `${tableSales.length} sesiones`,
    },
    {
      title: 'Ventas Directas',
      value: `$${posEarnings.toFixed(2)}`,
      icon: ShoppingCart,
      color: 'blue',
      description: `${posSales.length} transacciones`,
    },
    {
      title: 'Productos Vendidos',
      value: totalProductsSold,
      icon: TrendingUp,
      color: 'orange',
      description: 'Total de items',
    },
  ];

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Corte de Caja</h1>
            <p className="text-zinc-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={() => setShowCloseModal(true)}
              disabled={sales.length === 0}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/30"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Cerrar Día
            </Button>
          </div>
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
                  bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl
                  shadow-${stat.color}-500/10 transition-all
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}
                  >
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-600">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Sales Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table Sales */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-purple-400" />
              Ventas por Mesa
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tableSales.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 text-sm">
                  No hay ventas de mesa registradas
                </p>
              ) : (
                tableSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">Mesa {sale.tableId}</p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(sale.timestamp)}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-purple-400">
                        ${sale.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {sale.tableTime && (
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">Tiempo de juego:</span>
                          <span className="text-green-400">
                            {formatTime(sale.tableTime)}
                          </span>
                        </div>
                      )}
                      {sale.items.length > 0 && (
                        <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-700 mt-2">
                          Productos:{' '}
                          {sale.items.map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.name}
                              {idx < sale.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* POS Sales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              Ventas Directas
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posSales.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 text-sm">
                  No hay ventas directas registradas
                </p>
              ) : (
                posSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">Venta Directa</p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(sale.timestamp)}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-blue-400">
                        ${sale.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-xs text-zinc-400">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-green-400">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border-2 border-green-500/50 p-6 shadow-xl shadow-green-500/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Resumen del Día</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
              <p className="text-sm text-zinc-400 mb-1">Ingresos por Mesas</p>
              <p className="text-2xl font-bold text-purple-400">
                ${tableEarnings.toFixed(2)}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
              <p className="text-sm text-zinc-400 mb-1">Ingresos por Productos</p>
              <p className="text-2xl font-bold text-blue-400">
                ${posEarnings.toFixed(2)}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
              <p className="text-sm text-zinc-400 mb-1">Total General</p>
              <p className="text-3xl font-bold text-green-400">
                ${dailyEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Close Day Modal */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Cerrar Corte de Caja</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ingresa la diferencia de efectivo (si hay) y cierra el día.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400">Total esperado</span>
                <span className="text-2xl font-bold text-green-400">
                  ${dailyEarnings.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Ventas de mesa</p>
                  <p className="text-white font-semibold">
                    ${tableEarnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Ventas directas</p>
                  <p className="text-white font-semibold">
                    ${posEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-zinc-400">Diferencia de efectivo</Label>
              <Input
                type="number"
                value={cashDifference}
                onChange={(e) => setCashDifference(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Ingresa valores positivos si sobra efectivo, negativos si falta
              </p>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-medium text-sm">
                    Advertencia
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Al cerrar el corte, se reiniciarán las ventas del día. Esta acción
                    no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(false)}
                className="flex-1 border-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseCut}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Cerrar Día
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
