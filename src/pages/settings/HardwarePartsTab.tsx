import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { hardwareParts as initialParts } from '@/data/mockData';
import { HardwarePart } from '@/data/types';

const CATEGORIES = ['Memoria', 'Almacenamiento', 'Batería', 'Pantalla', 'Teclado', 'Cargador', 'Estructura', 'Otro'];

export default function HardwarePartsTab() {
  const [parts, setParts] = useState<HardwarePart[]>(initialParts);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HardwarePart | null>(null);
  const [form, setForm] = useState<Partial<HardwarePart>>({});

  const filtered = parts.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${p.name} ${p.code} ${p.brand} ${p.category}`.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', name: '', category: 'Otro', brand: '', model: '', unit_cost: null, stock: 0 });
    setDialogOpen(true);
  };

  const openEdit = (p: HardwarePart) => {
    setEditing(p);
    setForm({ ...p });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setParts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } as HardwarePart : p));
    } else {
      const newId = Math.max(...parts.map(p => p.id), 0) + 1;
      setParts(prev => [...prev, { id: newId, ...form } as HardwarePart]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setParts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar pieza..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nueva pieza
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Costo unit.</th>
              <th>Stock</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><code className="text-xs bg-muted px-2 py-0.5 rounded">{p.code}</code></td>
                <td className="font-medium text-sm">{p.name}</td>
                <td><Badge variant="outline" className="text-[10px]">{p.category}</Badge></td>
                <td className="text-xs">{p.brand || '—'}</td>
                <td className="text-xs text-muted-foreground">{p.model || '—'}</td>
                <td className="text-xs">{p.unit_cost !== null ? `€${p.unit_cost.toFixed(2)}` : '—'}</td>
                <td>
                  <Badge variant={p.stock > 3 ? 'secondary' : p.stock > 0 ? 'outline' : 'destructive'} className="text-[10px]">
                    {p.stock}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No se encontraron piezas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar pieza' : 'Nueva pieza de hardware'}</DialogTitle>
            <DialogDescription>Registra componentes para reparaciones y upgrades.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="RAM-DDR5-16" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.category || 'Otro'}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Nombre</Label>
              <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value || null }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value || null }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Costo unitario (€)</Label>
              <Input type="number" step="0.01" value={form.unit_cost ?? ''} onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="space-y-1.5">
              <Label><Package className="w-3 h-3 inline mr-1" />Stock</Label>
              <Input type="number" value={form.stock ?? 0} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.code || !form.name}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}