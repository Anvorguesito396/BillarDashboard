import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Pencil, Trash, Plus, ArrowLeft } from "lucide-react";
import type { TableType } from "../context/AppContext";

export function TablesEdit() {
  const navigate = useNavigate();
  const { tables, addTable, updateTable, deleteTable } = useApp();

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TableType>('billar');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<TableType>('billar');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTable(newName, newType);
    setNewName("");
    setNewType('billar');
  };

  const handleUpdate = (id: number) => {
    updateTable(id, editName, editType);
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/tables')}
            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Mesas
          </Button>
          <h1 className="text-2xl font-bold text-white">Editar Mesas</h1>
        </div>

        {/* Crear mesa */}
        <div className="flex flex-wrap gap-2 items-end">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de mesa"
            className="px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 flex-1 min-w-[200px]"
          />
          <Select value={newType} onValueChange={(value: TableType) => setNewType(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="billar">Billar</SelectItem>
              <SelectItem value="carambola">Carambola</SelectItem>
              <SelectItem value="pool">Pool</SelectItem>
              <SelectItem value="snooker">Snooker</SelectItem>
              <SelectItem value="rusa">Rusa</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!newName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800"
            >
              <div className="flex gap-3 items-center min-w-0 flex-1">
                {editingId === table.id ? (
                  <div className="flex gap-2 items-end w-full">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 bg-zinc-800 text-white border border-zinc-700 rounded flex-1 min-w-0"
                    />
                    <Select value={editType} onValueChange={(value: TableType) => setEditType(value)}>
                      <SelectTrigger className="w-[100px] h-[38px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
              <SelectItem value="billar">Billar</SelectItem>
              <SelectItem value="carambola">Carambola</SelectItem>
              <SelectItem value="pool">Pool</SelectItem>
              <SelectItem value="snooker">Snooker</SelectItem>
              <SelectItem value="rusa">Rusa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">{table.name}</span>
                    <span className="px-2 py-1 bg-zinc-700 text-xs rounded-full text-zinc-300">
                      {table.type}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {editingId === table.id ? (
                  <Button onClick={() => handleUpdate(table.id)} disabled={!editName.trim()} size="sm">
                    Guardar
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setEditingId(table.id);
                      setEditName(table.name);
                      setEditType(table.type);
                    }}
                    size="sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  onClick={() => deleteTable(table.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}