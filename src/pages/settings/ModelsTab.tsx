import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Cpu, HardDrive, Monitor as MonitorIcon, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { assetModels as initialModels, assetTypes } from '@/data/mockData';
import { AssetModel } from '@/data/types';

export default function ModelsTab() {
  const [models, setModels] = useState<AssetModel[]>(initialModels);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetModel | null>(null);
  const [form, setForm] = useState<Partial<AssetModel>>({});

  const filtered = models.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${m.brand} ${m.model}`.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing(null);
    setForm({ brand: '', model: '', asset_type_id: undefined, processor: '', ram_gb: null, storage: '', screen_size: '', os: '', notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (m: AssetModel) => {
    setEditing(m);
    setForm({ ...m });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setModels(prev => prev.map(m => m.id === editing.id ? { ...m, ...form } as AssetModel : m));
    } else {
      const newId = Math.max(...models.map(m => m.id), 0) + 1;
      setModels(prev => [...prev, { id: newId, photo_url: null, ...form } as AssetModel]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setModels(prev => prev.filter(m => m.id !== id));
  };

  const getTypeName = (typeId: number) => assetTypes.find(t => t.id === typeId)?.label || '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar marca o modelo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo modelo
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Tipo</th>
              <th>Procesador</th>
              <th>RAM</th>
              <th>Almacenamiento</th>
              <th>Pantalla</th>
              <th>Foto</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td className="font-medium">{m.brand}</td>
                <td>{m.model}</td>
                <td>{getTypeName(m.asset_type_id)}</td>
                <td className="text-muted-foreground text-xs">{m.processor || '—'}</td>
                <td>{m.ram_gb ? `${m.ram_gb} GB` : '—'}</td>
                <td className="text-xs">{m.storage || '—'}</td>
                <td className="text-xs">{m.screen_size || '—'}</td>
                <td>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.model} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted-foreground py-8">No se encontraron modelos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar modelo' : 'Nuevo modelo'}</DialogTitle>
            <DialogDescription>Completa la información del modelo de equipo.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Tipo de equipo</Label>
              <Select value={form.asset_type_id?.toString() || ''} onValueChange={v => setForm(f => ({ ...f, asset_type_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  {assetTypes.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.label} ({t.category})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label><Cpu className="w-3 h-3 inline mr-1" />Procesador</Label>
              <Input value={form.processor || ''} onChange={e => setForm(f => ({ ...f, processor: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>RAM (GB)</Label>
              <Input type="number" value={form.ram_gb || ''} onChange={e => setForm(f => ({ ...f, ram_gb: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="space-y-1.5">
              <Label><HardDrive className="w-3 h-3 inline mr-1" />Almacenamiento</Label>
              <Input value={form.storage || ''} onChange={e => setForm(f => ({ ...f, storage: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label><MonitorIcon className="w-3 h-3 inline mr-1" />Pantalla</Label>
              <Input value={form.screen_size || ''} onChange={e => setForm(f => ({ ...f, screen_size: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Sistema operativo</Label>
              <Input value={form.os || ''} onChange={e => setForm(f => ({ ...f, os: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label><ImageIcon className="w-3 h-3 inline mr-1" />Foto (URL)</Label>
              <Input value={form.photo_url || ''} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value || null }))} placeholder="URL de la imagen" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Notas</Label>
              <Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.brand || !form.model || !form.asset_type_id}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}