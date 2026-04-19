import { motion } from 'motion/react';
import { Circle, Play, Square, Clock, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { Pencil } from "lucide-react";

export function Tables() {
  const { tables, startTableSession } = useApp();
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = (tableId: number) => {
    startTableSession(tableId);
  };

  const handleManageSession = (tableId: number) => {
    navigate(`/tables/${tableId}`);
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Mesas</h1>
          <p className="text-zinc-500">Administra las sesiones de billar</p>
          <div className="flex">
            <Button
              onClick={() => navigate('/tables/edit')}
              className="ml-auto bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg shadow-green-500/30"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar Mesas
            </Button>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`
                rounded-xl border-2 p-6 shadow-xl transition-all relative overflow-hidden
                ${
                  table.status === 'occupied'
                    ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/50 shadow-green-500/20'
                    : 'bg-zinc-900 border-zinc-800'
                }
              `}
            >
              {/* Glowing background effect for occupied tables */}
              {table.status === 'occupied' && (
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-green-500/10 blur-2xl"
                />
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Table Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      p-3 rounded-lg
                      ${
                        table.status === 'occupied'
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-zinc-800 border border-zinc-700'
                      }
                    `}
                    >
                      <Circle
                        className={`w-6 h-6 ${
                          table.status === 'occupied' ? 'text-green-400' : 'text-zinc-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{table.name}</h3>
                      <div className="flex gap-1 items-center">
                        <p
                          className={`text-sm font-medium ${
                            table.status === 'occupied' ? 'text-green-400' : 'text-zinc-500'
                          }`}
                        >
                          {table.status === 'occupied' ? 'Ocupada' : 'Disponible'}
                        </p>
                        <span className="px-2 py-0.5 bg-zinc-700 text-xs rounded-full text-zinc-400">
                          {table.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timer for occupied tables */}
                {table.status === 'occupied' && (
                  <div className="mb-4 p-4 bg-black/30 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-zinc-400">Tiempo transcurrido</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-green-400">
                      {formatTime(table.elapsedSeconds)}
                    </p>
                  </div>
                )}

                {/* Products consumed */}
                {table.status === 'occupied' && table.products.length > 0 && (
                  <div className="mb-4 p-3 bg-black/30 rounded-lg border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-2">Productos consumidos:</p>
                    <div className="space-y-1">
                      {table.products.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-zinc-300">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-green-400">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {table.status === 'available' ? (
                    <Button
                      onClick={() => handleStartSession(table.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg shadow-green-500/30"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleManageSession(table.id)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Gestionar Sesión
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
